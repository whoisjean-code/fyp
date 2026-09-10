const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./database');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'elite_super_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'public', 'uploads');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
            cb(null, true);
        } else {
            cb(new Error("Solo se permiten imágenes y videos!"), false);
        }
    }
});

// Middleware to handle Multer errors gracefully
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo es demasiado pesado. El límite es 50MB.' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, message: 'Login successful' });
    });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: 'No autorizado' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Sesión expirada o inválida.' });
        req.user = user;
        next();
    });
};

// ═══════════════════════════════════════════════════════════
// PROPERTIES — CRUD with multi-image support
// ═══════════════════════════════════════════════════════════

// Helper: Get images for a property
function getPropertyImages(propertyId) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC`, [propertyId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

// Helper: Get all properties with their images
function getAllPropertiesWithImages(category) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM properties`;
        let params = [];
        if (category && category !== 'todos') {
            query += ` WHERE category = ?`;
            params.push(category);
        }
        query += ` ORDER BY created_at DESC`;

        db.all(query, params, async (err, properties) => {
            if (err) return reject(err);
            try {
                for (let prop of properties) {
                    prop.images = await getPropertyImages(prop.id);
                }
                resolve(properties);
            } catch (e) {
                reject(e);
            }
        });
    });
}

// GET Properties (Public) — with images
app.get('/api/properties', async (req, res) => {
    try {
        const category = req.query.category;
        const properties = await getAllPropertiesWithImages(category);
        res.json(properties);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Property (Protected) — multi-image upload
app.post('/api/properties', authenticateToken, upload.array('images', 10), (req, res) => {
    const { title, location, price, category, description, area, bedrooms, bathrooms, status, map_url } = req.body;

    // Use first image as main thumbnail
    const mainImage = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : '';

    db.run(
        `INSERT INTO properties (title, location, price, category, description, area, bedrooms, bathrooms, status, image_url, map_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, location, price, category || 'terrenos', description || '', area || '', bedrooms || '', bathrooms || '', status || 'Disponible', mainImage, map_url || ''],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const propertyId = this.lastID;

            // Insert all images into property_images
            if (req.files && req.files.length > 0) {
                const stmt = db.prepare(`INSERT INTO property_images (property_id, image_url, sort_order) VALUES (?, ?, ?)`);
                req.files.forEach((file, index) => {
                    stmt.run(propertyId, `/uploads/${file.filename}`, index);
                });
                stmt.finalize();
            }

            res.json({
                id: propertyId,
                title,
                category,
                message: 'Propiedad subida exitosamente'
            });
        }
    );
});

// PUT Property (Protected) — update info + add new images
app.put('/api/properties/:id', authenticateToken, upload.array('images', 10), async (req, res) => {
    const { title, location, price, category, description, area, bedrooms, bathrooms, status, map_url } = req.body;
    const { id } = req.params;

    try {
        // Update property info
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE properties SET title=?, location=?, price=?, category=?, description=?, area=?, bedrooms=?, bathrooms=?, status=?, map_url=? WHERE id=?`,
                [title, location, price, category || 'terrenos', description || '', area || '', bedrooms || '', bathrooms || '', status || 'Disponible', map_url || '', id],
                function(err) { if (err) reject(err); else resolve(); }
            );
        });

        // Add new images if uploaded
        if (req.files && req.files.length > 0) {
            // Get current max sort_order
            const maxOrder = await new Promise((resolve, reject) => {
                db.get(`SELECT MAX(sort_order) as maxOrder FROM property_images WHERE property_id = ?`, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? (row.maxOrder || 0) : 0);
                });
            });

            const stmt = db.prepare(`INSERT INTO property_images (property_id, image_url, sort_order) VALUES (?, ?, ?)`);
            req.files.forEach((file, index) => {
                stmt.run(id, `/uploads/${file.filename}`, maxOrder + index + 1);
            });
            stmt.finalize();

            // Update main thumbnail to first image if none exists
            const prop = await new Promise((resolve, reject) => {
                db.get(`SELECT image_url FROM properties WHERE id = ?`, [id], (err, row) => {
                    if (err) reject(err); else resolve(row);
                });
            });
            if (!prop.image_url || prop.image_url === '') {
                await new Promise((resolve, reject) => {
                    db.run(`UPDATE properties SET image_url = ? WHERE id = ?`, [`/uploads/${req.files[0].filename}`, id], (err) => {
                        if (err) reject(err); else resolve();
                    });
                });
            }
        }

        res.json({ message: 'Propiedad actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Property (Protected) — delete property + all images from disk
app.delete('/api/properties/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Get all images to delete from disk
        const images = await getPropertyImages(id);
        images.forEach(img => {
            if (img.image_url && img.image_url.startsWith('/uploads/')) {
                const filePath = path.join(__dirname, 'public', img.image_url);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        });

        // Also delete main image_url if it's a local file
        const prop = await new Promise((resolve, reject) => {
            db.get(`SELECT image_url FROM properties WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });
        if (prop && prop.image_url && prop.image_url.startsWith('/uploads/')) {
            const fp = path.join(__dirname, 'public', prop.image_url);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }

        // Delete images from DB
        await new Promise((resolve, reject) => {
            db.run(`DELETE FROM property_images WHERE property_id = ?`, [id], (err) => {
                if (err) reject(err); else resolve();
            });
        });

        // Delete property
        await new Promise((resolve, reject) => {
            db.run(`DELETE FROM properties WHERE id = ?`, [id], (err) => {
                if (err) reject(err); else resolve();
            });
        });

        res.json({ message: 'Propiedad eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE single image from a property
app.delete('/api/properties/:id/images/:imageId', authenticateToken, async (req, res) => {
    const { id, imageId } = req.params;
    try {
        const img = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM property_images WHERE id = ? AND property_id = ?`, [imageId, id], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });

        if (!img) return res.status(404).json({ error: 'Imagen no encontrada' });

        // Delete file from disk
        if (img.image_url && img.image_url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, 'public', img.image_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        // Delete from DB
        await new Promise((resolve, reject) => {
            db.run(`DELETE FROM property_images WHERE id = ?`, [imageId], (err) => {
                if (err) reject(err); else resolve();
            });
        });

        // Update main thumbnail if we deleted the one being used
        const prop = await new Promise((resolve, reject) => {
            db.get(`SELECT image_url FROM properties WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });
        if (prop && prop.image_url === img.image_url) {
            const nextImg = await new Promise((resolve, reject) => {
                db.get(`SELECT image_url FROM property_images WHERE property_id = ? ORDER BY sort_order ASC LIMIT 1`, [id], (err, row) => {
                    if (err) reject(err); else resolve(row);
                });
            });
            await new Promise((resolve, reject) => {
                db.run(`UPDATE properties SET image_url = ? WHERE id = ?`, [nextImg ? nextImg.image_url : '', id], (err) => {
                    if (err) reject(err); else resolve();
                });
            });
        }

        res.json({ message: 'Imagen eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════
// VIDEOS
// ═══════════════════════════════════════════════════════════

app.get('/api/videos', (req, res) => {
    db.all(`SELECT * FROM videos ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/videos', authenticateToken, upload.single('video'), (req, res) => {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Video file is required' });

    const videoUrl = `/uploads/${req.file.filename}`;
    db.run(`INSERT INTO videos (title, video_url) VALUES (?, ?)`, [title, videoUrl], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, title, video_url: videoUrl, message: 'Video subido exitosamente' });
    });
});

app.delete('/api/videos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT video_url FROM videos WHERE id = ?`, [id], (err, row) => {
        if (row && row.video_url && row.video_url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, 'public', row.video_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        db.run(`DELETE FROM videos WHERE id = ?`, [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Video eliminado' });
        });
    });
});

// ═══════════════════════════════════════════════════════════
// RECLAMACIONES
// ═══════════════════════════════════════════════════════════

app.post('/api/reclamaciones', (req, res) => {
    const { name, dni, email, phone, address, serviceType, amount, category, detail, request } = req.body;
    const reclamoId = 'REC-' + Date.now().toString().slice(-6);

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            });

            const mailOptions = {
                from: '"Farid Porras Cerrón" <legal@faridporras.com>',
                to: email,
                subject: `Copia de su ${category} - ${reclamoId}`,
                text: `Estimado(a) ${name},\n\nAdjuntamos la copia formal de su ${category}.\n\nCódigo: ${reclamoId}\n\nAtentamente,\nEquipo Legal - Farid Porras Cerrón`,
                attachments: [{ filename: `Reclamacion_${reclamoId}.pdf`, content: pdfData }]
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) return res.status(500).json({ error: 'Error al enviar el correo.' });
                res.json({ message: 'Reclamo enviado', id: reclamoId });
            });
        } else {
            console.log(`[SIMULATION] PDF for ${reclamoId}. Email to ${email} would be sent with SMTP.`);
            setTimeout(() => { res.json({ message: 'Reclamo procesado (Simulación)', id: reclamoId }); }, 1000);
        }
    });

    doc.fontSize(20).text('LIBRO DE RECLAMACIONES', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`HOJA DE RECLAMACIÓN: ${reclamoId}`, { align: 'right' });
    doc.moveDown();
    doc.fontSize(14).text('1. Datos del Consumidor Reclamante');
    doc.fontSize(10).text(`Nombre: ${name}`);
    doc.text(`DNI / CE: ${dni}`);
    doc.text(`Correo: ${email}`);
    doc.text(`Teléfono: ${phone}`);
    doc.text(`Dirección: ${address}`);
    doc.moveDown();
    doc.fontSize(14).text('2. Identificación del Servicio Contratado');
    doc.fontSize(10).text(`Servicio: ${serviceType}`);
    doc.text(`Monto reclamado: ${amount ? 'S/ ' + amount : 'N/A'}`);
    doc.moveDown();
    doc.fontSize(14).text('3. Detalle del Reclamo y/o Queja');
    doc.fontSize(10).text(`Tipo: ${category}`);
    doc.text(`Detalle: ${detail}`);
    doc.moveDown();
    doc.text(`Pedido: ${request}`);
    doc.moveDown(2);
    doc.fontSize(10).text('Copia generada automáticamente.', { align: 'center', color: 'gray' });
    doc.end();
});

// ═══════════════════════════════════════════════════════════
// ADMIN ROUTE
// ═══════════════════════════════════════════════════════════

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Enable the error handler globally AFTER all routes
app.use(handleUploadError);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
