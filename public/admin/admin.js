document.addEventListener('DOMContentLoaded', () => {
    
    const loginView = document.getElementById('loginView');
    const dashboardView = document.getElementById('dashboardView');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const propertiesGrid = document.getElementById('propertiesGrid');
    const videosGrid = document.getElementById('videosGrid');

    // Upload Property Modal
    const openUploadBtn = document.getElementById('openUploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const uploadForm = document.getElementById('uploadForm');
    const uploadError = document.getElementById('uploadError');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreviews = document.getElementById('imagePreviews');

    // Edit Property Modal
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const editError = document.getElementById('editError');
    const editImageUpload = document.getElementById('editImageUpload');
    const editExistingImages = document.getElementById('editExistingImages');
    const editNewPreviews = document.getElementById('editNewPreviews');

    // Video Modal
    const openVideoUploadBtn = document.getElementById('openVideoUploadBtn');
    const videoModal = document.getElementById('videoModal');
    const videoForm = document.getElementById('videoForm');
    const videoError = document.getElementById('videoError');
    const videoUpload = document.getElementById('videoUpload');
    const videoPreviewContainer = document.getElementById('videoPreviewContainer');

    // Category Tabs
    const adminTabs = document.querySelectorAll('.admin-tab');
    let currentFilter = 'todos';

    // ========== UBIGEO JUNIN ==========
    const ubigeoJunin = {
      "Huancayo": ["Huancayo", "Carhuacallanga", "Chacapampa", "Chicche", "Chilca", "Chongos Alto", "Chupuro", "Colca", "Cullhuas", "El Tambo", "Huacrapuquio", "Hualhuas", "Huancán", "Huasicancha", "Huayucachi", "Ingenio", "Pariahuanca", "Pilcomayo", "Pucará", "Quichuay", "Quilcas", "San Agustín", "San Jerónimo de Tunán", "Saño", "Sapallanga", "Sicaya", "Santo Domingo de Acobamba", "Viques"],
      "Jauja": ["Jauja", "Acolla", "Apata", "Ataura", "Canchayllo", "Curicaca", "El Mantaro", "Huamali", "Huaripampa", "Huertas", "Janjaillo", "Julcán", "Leonor Ordóñez", "Llocllapampa", "Marco", "Masma", "Masma Chicche", "Molinos", "Monobamba", "Muqui", "Muquiyauyo", "Paca", "Paccha", "Pancán", "Parco", "Pomacancha", "Ricrán", "San Lorenzo", "San Pedro de Chunan", "Sausa", "Sincos", "Tunan Marca", "Yauli", "Yauyos"],
      "Concepción": ["Concepción", "Aco", "Andamarca", "Chambará", "Cochas", "Comas", "Heroínas Toledo", "Manzanares", "Mariscal Castilla", "Matahuasi", "Mito", "Nueve de Julio", "Orcotuna", "San José de Quero", "Santa Rosa de Ocopa"],
      "Yauli": ["La Oroya", "Chacapalpa", "Huay-Huay", "Marcapomacocha", "Morococha", "Paccha", "Santa Bárbara de Carhuacayán", "Santa Rosa de Sacco", "Suitucancha", "Yauli"],
      "Satipo": ["Satipo", "Coviriali", "Llaylla", "Mazamari", "Pampa Hermosa", "Pangoa", "Río Negro", "Río Tambo", "Vizcatán del Ene"],
      "Tarma": ["Tarma", "Acobamba", "Huaricolca", "Huasahuasi", "La Unión", "Palca", "Palcamayo", "San Pedro de Cajas", "Tapo"],
      "Chupaca": ["Chupaca", "Ahuac", "Chongos Bajo", "Huachac", "Huamancaca Chico", "San Juan de Iscos", "San Juan de Jarpa", "Tres de Diciembre", "Yanacancha"],
      "Chanchamayo": ["Chanchamayo (La Merced)", "Perené", "Pichanaqui", "San Luis de Shuaro", "San Ramón", "Vitoc"],
      "Junín": ["Junín", "Carhuamayo", "Ondores", "Ulcumayo"]
    };

    const propProvincia = document.getElementById('propProvincia');
    const propLocation = document.getElementById('propLocation');

    if (propProvincia) {
        Object.keys(ubigeoJunin).sort().forEach(prov => {
            const opt = document.createElement('option');
            opt.value = prov;
            opt.textContent = prov;
            propProvincia.appendChild(opt);
        });

        // Use global function to keep HTML onchange working, or just bind here
        window.actualizarDistritos = function(provSelect, distSelect) {
            const pSelect = provSelect || propProvincia;
            const dSelect = distSelect || propLocation;
            dSelect.innerHTML = '<option value="">Seleccione distrito...</option>';
            const prov = pSelect.value;
            
            if (prov && ubigeoJunin[prov]) {
                dSelect.disabled = false;
                ubigeoJunin[prov].sort().forEach(dist => {
                    const opt = document.createElement('option');
                    opt.value = dist;
                    opt.textContent = dist;
                    dSelect.appendChild(opt);
                });
            } else {
                dSelect.disabled = true;
                dSelect.innerHTML = '<option value="">Seleccione primero provincia</option>';
            }
        };
        
        propProvincia.addEventListener('change', () => window.actualizarDistritos(propProvincia, propLocation));
    }

    // ========== HELPERS ==========
    function getToken() { return localStorage.getItem('elite_admin_token'); }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken() }; }

    // ========== VIEW MANAGEMENT ==========
    function showLogin() {
        loginView.style.display = 'flex';
        dashboardView.style.display = 'none';
        hideAllModals();
    }

    function showDashboard() {
        loginView.style.display = 'none';
        dashboardView.style.display = 'flex';
        dashboardView.style.flexDirection = 'column';
        hideAllModals();
        fetchProperties();
        fetchVideos();
    }

    function hideAllModals() {
        uploadModal.style.display = 'none';
        editModal.style.display = 'none';
        videoModal.style.display = 'none';
    }

    function forceLogout() {
        localStorage.removeItem('elite_admin_token');
        showLogin();
    }

    // ========== CHECK TOKEN ON PAGE LOAD ==========
    const token = getToken();
    if (token) {
        fetch('/api/properties', { headers: authHeaders() })
            .then(res => { if (res.ok) showDashboard(); else forceLogout(); })
            .catch(() => forceLogout());
    } else {
        showLogin();
    }

    // ========== LOGIN ==========
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = document.getElementById('loginBtn');
        
        btn.textContent = 'Ingresando...';
        btn.disabled = true;
        loginError.hidden = true;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('elite_admin_token', data.token);
                showDashboard();
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            loginError.textContent = err.message || 'Error de conexión';
            loginError.hidden = false;
        } finally {
            btn.textContent = 'Ingresar';
            btn.disabled = false;
        }
    });

    // ═══════════════════════════════════════════════════════
    //  CATEGORY TABS
    // ═══════════════════════════════════════════════════════

    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            adminTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            fetchProperties();
        });
    });

    // ═══════════════════════════════════════════════════════
    //  PROPERTIES — FETCH, DELETE, EDIT
    // ═══════════════════════════════════════════════════════

    const categoryLabels = { terrenos: 'Terreno', casas: 'Casa', departamentos: 'Depto' };
    const categoryColors = { terrenos: '#22c55e', casas: '#3b82f6', departamentos: '#a855f7' };

    async function fetchProperties() {
        propertiesGrid.innerHTML = '<div class="loading-spinner"></div>';
        try {
            const url = currentFilter === 'todos' ? '/api/properties' : `/api/properties?category=${currentFilter}`;
            const res = await fetch(url);
            const properties = await res.json();
            propertiesGrid.innerHTML = '';

            if (properties.length === 0) {
                propertiesGrid.innerHTML = '<p style="color:var(--text-secondary); grid-column:1/-1;">No hay propiedades en esta categoría.</p>';
                return;
            }

            properties.forEach(prop => {
                const card = document.createElement('div');
                card.className = 'property-card glass';
                
                const imgUrl = (prop.images && prop.images.length > 0) 
                    ? prop.images[0].image_url 
                    : (prop.image_url || 'https://via.placeholder.com/400x300?text=Sin+imagen');
                
                const imgCount = prop.images ? prop.images.length : 0;
                const catLabel = categoryLabels[prop.category] || prop.category;
                const catColor = categoryColors[prop.category] || '#888';
                const statusBadge = prop.status && prop.status !== 'Disponible' 
                    ? `<span class="status-badge status-${prop.status === 'Vendido' ? 'sold' : 'negotiating'}">${prop.status}</span>` 
                    : '';

                card.innerHTML = `
                    <div class="card-img-wrapper">
                        <img src="${imgUrl}" alt="${prop.title}" class="property-img" loading="lazy">
                        <span class="category-badge" style="background:${catColor}">${catLabel}</span>
                        ${statusBadge}
                        ${imgCount > 1 ? `<span class="img-count-badge">📷 ${imgCount}</span>` : ''}
                    </div>
                    <div class="property-info">
                        <h4 class="property-title">${prop.title}</h4>
                        <div class="property-meta">
                            <span>📍 ${prop.location}</span>
                            <span class="property-price">${prop.price}</span>
                        </div>
                        ${prop.area ? `<div class="property-specs-mini"><span>📐 ${prop.area}</span>${prop.bedrooms ? `<span>🛏️ ${prop.bedrooms}</span>` : ''}${prop.bathrooms ? `<span>🚿 ${prop.bathrooms}</span>` : ''}</div>` : ''}
                        <div class="card-actions">
                            <button class="action-btn edit-btn" data-id="${prop.id}">✏️ Editar</button>
                            <button class="action-btn delete-btn" data-id="${prop.id}">🗑️ Eliminar</button>
                        </div>
                    </div>
                `;
                propertiesGrid.appendChild(card);

                // Store full prop data on card for edit
                card._propData = prop;
            });

            // Bind delete buttons
            document.querySelectorAll('.delete-btn:not(.video-delete-btn)').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('¿Eliminar esta propiedad y todas sus imágenes?')) return;
                    try {
                        const res = await fetch(`/api/properties/${btn.dataset.id}`, { method: 'DELETE', headers: authHeaders() });
                        if (res.ok) fetchProperties();
                        else if (res.status === 401 || res.status === 403) forceLogout();
                        else alert('Error al eliminar');
                    } catch { alert('Error de conexión'); }
                });
            });

            // Bind edit buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const card = btn.closest('.property-card');
                    const prop = card._propData;
                    openEditModal(prop);
                });
            });

        } catch (err) {
            propertiesGrid.innerHTML = `<p style="color:var(--error);">Error cargando propiedades.</p>`;
        }
    }

    // ═══════════════════════════════════════════════════════
    //  UPLOAD PROPERTY — Multi-image
    // ═══════════════════════════════════════════════════════

    let uploadFiles = [];

    openUploadBtn.addEventListener('click', () => { 
        uploadModal.style.display = 'flex'; 
        uploadFiles = [];
        imagePreviews.innerHTML = '';
    });
    
    closeModalBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        uploadForm.reset();
        uploadFiles = [];
        imagePreviews.innerHTML = '';
        uploadError.hidden = true;
    });

    imageUpload.addEventListener('change', function() {
        const newFiles = Array.from(this.files);
        uploadFiles = uploadFiles.concat(newFiles);
        renderUploadPreviews();
        this.value = ''; // reset so same file can be added again
    });

    function renderUploadPreviews() {
        imagePreviews.innerHTML = '';
        uploadFiles.forEach((file, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'preview-item';
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'preview-thumb';
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'preview-remove';
            removeBtn.textContent = '✕';
            removeBtn.addEventListener('click', () => {
                uploadFiles.splice(index, 1);
                renderUploadPreviews();
            });
            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            imagePreviews.appendChild(wrapper);
        });
    }

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (uploadFiles.length === 0) {
            uploadError.textContent = "Debes subir al menos una imagen.";
            uploadError.hidden = false;
            return;
        }

        const formData = new FormData();
        uploadFiles.forEach(file => formData.append('images', file));
        formData.append('title', document.getElementById('propTitle').value);
        formData.append('location', document.getElementById('propLocation').value);
        formData.append('price', document.getElementById('propPrice').value);
        formData.append('category', document.getElementById('propCategory').value);
        formData.append('description', document.getElementById('propDescription').value);
        formData.append('area', document.getElementById('propArea').value);
        formData.append('bedrooms', document.getElementById('propBedrooms').value);
        formData.append('bathrooms', document.getElementById('propBathrooms').value);
        formData.append('status', document.getElementById('propStatus').value);
        formData.append('map_url', document.getElementById('propMapUrl').value);

        const btn = document.getElementById('uploadSubmitBtn');
        btn.textContent = 'Guardando...';
        btn.disabled = true;
        uploadError.hidden = true;

        try {
            const res = await fetch('/api/properties', { method: 'POST', headers: authHeaders(), body: formData });
            const data = await res.json();
            if (res.ok) {
                uploadModal.style.display = 'none';
                uploadForm.reset();
                uploadFiles = [];
                imagePreviews.innerHTML = '';
                fetchProperties();
            } else {
                if (res.status === 401 || res.status === 403) { forceLogout(); return; }
                throw new Error(data.error);
            }
        } catch (err) {
            uploadError.textContent = err.message || 'Error al subir';
            uploadError.hidden = false;
        } finally {
            btn.textContent = 'Guardar Propiedad';
            btn.disabled = false;
        }
    });

    // ═══════════════════════════════════════════════════════
    //  EDIT PROPERTY — with existing images management
    // ═══════════════════════════════════════════════════════

    let editNewFiles = [];

    function openEditModal(prop) {
        document.getElementById('editPropId').value = prop.id;
        document.getElementById('editPropTitle').value = prop.title || '';
        const locationStr = prop.location || '';
        let foundProv = '';
        if (typeof ubigeoJunin !== 'undefined') {
            for (const [prov, distritos] of Object.entries(ubigeoJunin)) {
                if (distritos.includes(locationStr)) {
                    foundProv = prov;
                    break;
                }
            }
        }
        
        const provSelect = document.getElementById('editPropProvincia');
        const distSelect = document.getElementById('editPropLocation');
        
        if (provSelect) {
            provSelect.innerHTML = '<option value="">Seleccione provincia...</option>';
            Object.keys(ubigeoJunin).sort().forEach(prov => {
                const opt = document.createElement('option');
                opt.value = prov;
                opt.textContent = prov;
                provSelect.appendChild(opt);
            });

            if (foundProv) {
                provSelect.value = foundProv;
                window.actualizarDistritos(provSelect, distSelect);
                distSelect.value = locationStr;
            } else {
                provSelect.value = '';
                distSelect.innerHTML = '<option value="">Seleccione primero provincia</option>';
                distSelect.disabled = true;
                if (locationStr) {
                    const opt = document.createElement('option');
                    opt.value = locationStr;
                    opt.textContent = locationStr;
                    distSelect.appendChild(opt);
                    distSelect.value = locationStr;
                    distSelect.disabled = false;
                }
            }
        }
        document.getElementById('editPropPrice').value = prop.price || '';
        document.getElementById('editPropCategory').value = prop.category || 'terrenos';
        document.getElementById('editPropDescription').value = prop.description || '';
        document.getElementById('editPropArea').value = prop.area || '';
        document.getElementById('editPropBedrooms').value = prop.bedrooms || '';
        document.getElementById('editPropBathrooms').value = prop.bathrooms || '';
        document.getElementById('editPropStatus').value = prop.status || 'Disponible';
        document.getElementById('editPropMapUrl').value = prop.map_url || '';

        // Show existing images with delete button
        editExistingImages.innerHTML = '';
        if (prop.images && prop.images.length > 0) {
            prop.images.forEach(img => {
                const wrapper = document.createElement('div');
                wrapper.className = 'preview-item';
                const imgEl = document.createElement('img');
                imgEl.src = img.image_url;
                imgEl.className = 'preview-thumb';
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'preview-remove';
                removeBtn.textContent = '✕';
                removeBtn.addEventListener('click', async () => {
                    if (!confirm('¿Eliminar esta imagen?')) return;
                    try {
                        const res = await fetch(`/api/properties/${prop.id}/images/${img.id}`, { method: 'DELETE', headers: authHeaders() });
                        if (res.ok) {
                            wrapper.remove();
                            // Update prop data
                            prop.images = prop.images.filter(i => i.id !== img.id);
                        } else {
                            alert('Error al eliminar imagen');
                        }
                    } catch { alert('Error de conexión'); }
                });
                wrapper.appendChild(imgEl);
                wrapper.appendChild(removeBtn);
                editExistingImages.appendChild(wrapper);
            });
        } else {
            editExistingImages.innerHTML = '<p style="color:#888; font-size:13px;">Sin imágenes</p>';
        }

        editNewFiles = [];
        editNewPreviews.innerHTML = '';
        editError.hidden = true;
        editModal.style.display = 'flex';
    }

    editImageUpload.addEventListener('change', function() {
        const newFiles = Array.from(this.files);
        editNewFiles = editNewFiles.concat(newFiles);
        renderEditNewPreviews();
        this.value = '';
    });

    function renderEditNewPreviews() {
        editNewPreviews.innerHTML = '';
        editNewFiles.forEach((file, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'preview-item';
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'preview-thumb';
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'preview-remove';
            removeBtn.textContent = '✕';
            removeBtn.addEventListener('click', () => {
                editNewFiles.splice(index, 1);
                renderEditNewPreviews();
            });
            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            editNewPreviews.appendChild(wrapper);
        });
    }

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editPropId').value;
        const formData = new FormData();
        formData.append('title', document.getElementById('editPropTitle').value);
        formData.append('location', document.getElementById('editPropLocation').value);
        formData.append('price', document.getElementById('editPropPrice').value);
        formData.append('category', document.getElementById('editPropCategory').value);
        formData.append('description', document.getElementById('editPropDescription').value);
        formData.append('area', document.getElementById('editPropArea').value);
        formData.append('bedrooms', document.getElementById('editPropBedrooms').value);
        formData.append('bathrooms', document.getElementById('editPropBathrooms').value);
        formData.append('status', document.getElementById('editPropStatus').value);
        formData.append('map_url', document.getElementById('editPropMapUrl').value);

        editNewFiles.forEach(file => formData.append('images', file));

        const btn = document.getElementById('editSubmitBtn');
        btn.textContent = 'Actualizando...';
        btn.disabled = true;
        editError.hidden = true;

        try {
            const res = await fetch(`/api/properties/${id}`, { method: 'PUT', headers: authHeaders(), body: formData });
            if (res.ok) {
                editModal.style.display = 'none';
                editForm.reset();
                editNewFiles = [];
                editNewPreviews.innerHTML = '';
                fetchProperties();
            } else {
                if (res.status === 401 || res.status === 403) { forceLogout(); return; }
                const data = await res.json();
                throw new Error(data.error);
            }
        } catch (err) {
            editError.textContent = err.message || 'Error al actualizar';
            editError.hidden = false;
        } finally {
            btn.textContent = 'Actualizar Propiedad';
            btn.disabled = false;
        }
    });

    // ═══════════════════════════════════════════════════════
    //  VIDEOS — FETCH, UPLOAD, DELETE
    // ═══════════════════════════════════════════════════════

    async function fetchVideos() {
        videosGrid.innerHTML = '<div class="loading-spinner"></div>';
        try {
            const res = await fetch('/api/videos');
            const videos = await res.json();
            videosGrid.innerHTML = '';

            if (videos.length === 0) {
                videosGrid.innerHTML = '<p style="color:var(--text-secondary); grid-column:1/-1;">No hay videos subidos.</p>';
                return;
            }

            videos.forEach(vid => {
                const card = document.createElement('div');
                card.className = 'property-card glass';
                card.innerHTML = `
                    <video src="${vid.video_url}" class="property-img" autoplay muted loop playsinline></video>
                    <div class="property-info">
                        <h4 class="property-title">${vid.title}</h4>
                        <div class="card-actions">
                            <button class="action-btn delete-btn video-delete-btn" data-id="${vid.id}">🗑️ Eliminar</button>
                        </div>
                    </div>
                `;
                videosGrid.appendChild(card);
            });

            document.querySelectorAll('.video-delete-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('¿Eliminar este video?')) return;
                    try {
                        const res = await fetch(`/api/videos/${btn.dataset.id}`, { method: 'DELETE', headers: authHeaders() });
                        if (res.ok) fetchVideos();
                        else if (res.status === 401 || res.status === 403) forceLogout();
                        else alert('Error al eliminar');
                    } catch { alert('Error de conexión'); }
                });
            });
        } catch {
            videosGrid.innerHTML = `<p style="color:var(--error);">Error cargando videos.</p>`;
        }
    }

    // ── UPLOAD VIDEO ──
    openVideoUploadBtn.addEventListener('click', () => { videoModal.style.display = 'flex'; });

    videoUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            videoPreviewContainer.innerHTML = `<video src="${URL.createObjectURL(file)}" class="preview-thumb" style="width:100%;max-height:200px;border-radius:8px;margin-top:12px;" autoplay muted loop playsinline></video>`;
        }
    });

    videoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = videoUpload.files[0];
        if (!file) { videoError.textContent = "Selecciona un video."; videoError.hidden = false; return; }

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', document.getElementById('videoTitle').value);

        const btn = document.getElementById('videoSubmitBtn');
        btn.textContent = 'Subiendo...';
        btn.disabled = true;
        videoError.hidden = true;

        try {
            const res = await fetch('/api/videos', { method: 'POST', headers: authHeaders(), body: formData });
            if (res.ok) {
                videoModal.style.display = 'none';
                videoForm.reset();
                videoPreviewContainer.innerHTML = '';
                fetchVideos();
            } else {
                if (res.status === 401 || res.status === 403) { forceLogout(); return; }
                const data = await res.json();
                throw new Error(data.error);
            }
        } catch (err) {
            videoError.textContent = err.message || 'Error al subir';
            videoError.hidden = false;
        } finally {
            btn.textContent = 'Subir Video';
            btn.disabled = false;
        }
    });

});
