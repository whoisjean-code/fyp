const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create Admin Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT
        )`);

        // Create Properties Table (with category and extra fields)
        db.run(`CREATE TABLE IF NOT EXISTS properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            location TEXT,
            price TEXT,
            category TEXT DEFAULT 'terrenos',
            description TEXT DEFAULT '',
            area TEXT DEFAULT '',
            bedrooms TEXT DEFAULT '',
            bathrooms TEXT DEFAULT '',
            status TEXT DEFAULT 'Disponible',
            image_url TEXT,
            map_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Property Images Table (multiple images per property)
        db.run(`CREATE TABLE IF NOT EXISTS property_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_id INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
        )`);

        // Create Videos Table
        db.run(`CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            video_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migrate: add category column if missing (for existing databases)
        db.all(`PRAGMA table_info(properties)`, (err, columns) => {
            if (!columns) return;
            const colNames = columns.map(c => c.name);
            
            if (!colNames.includes('category')) {
                db.run(`ALTER TABLE properties ADD COLUMN category TEXT DEFAULT 'terrenos'`);
                console.log('Migrated: added category column');
            }
            if (!colNames.includes('description')) {
                db.run(`ALTER TABLE properties ADD COLUMN description TEXT DEFAULT ''`);
            }
            if (!colNames.includes('area')) {
                db.run(`ALTER TABLE properties ADD COLUMN area TEXT DEFAULT ''`);
            }
            if (!colNames.includes('bedrooms')) {
                db.run(`ALTER TABLE properties ADD COLUMN bedrooms TEXT DEFAULT ''`);
            }
            if (!colNames.includes('bathrooms')) {
                db.run(`ALTER TABLE properties ADD COLUMN bathrooms TEXT DEFAULT ''`);
            }
            if (!colNames.includes('status')) {
                db.run(`ALTER TABLE properties ADD COLUMN status TEXT DEFAULT 'Disponible'`);
            }
            if (!colNames.includes('map_url')) {
                db.run(`ALTER TABLE properties ADD COLUMN map_url TEXT DEFAULT ''`);
            }
        });

        // Seed Admin User if not exists
        db.get(`SELECT * FROM users WHERE email = ?`, ['faridjeanpierreporras@gmail.com'], (err, row) => {
            if (!row) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync('hola2020A', salt);
                db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, ['faridjeanpierreporras@gmail.com', hash]);
                console.log('Admin user seeded (faridjeanpierreporras@gmail.com / hola2020A)');
            }
        });
    });
}

module.exports = db;
