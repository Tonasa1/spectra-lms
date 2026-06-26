// ============================================================
// SPECTRA v2.0 - Complete Application Script
// ============================================================

// Shadow global storage objects to prevent exceptions in private browsing mode
const localStorage = (function() {
    let storageAvailable = false;
    try {
        const testKey = '__storage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        storageAvailable = true;
    } catch (e) {
        storageAvailable = false;
    }

    const fallbackStorage = {};

    return {
        getItem(key) {
            if (storageAvailable) {
                try {
                    return window.localStorage.getItem(key);
                } catch (e) {
                    console.warn('localStorage.getItem failed, using fallback:', e);
                }
            }
            return fallbackStorage[key] !== undefined ? fallbackStorage[key] : null;
        },
        setItem(key, value) {
            if (storageAvailable) {
                try {
                    window.localStorage.setItem(key, value);
                    return;
                } catch (e) {
                    console.warn('localStorage.setItem failed, using fallback:', e);
                }
            }
            fallbackStorage[key] = String(value);
        },
        removeItem(key) {
            if (storageAvailable) {
                try {
                    window.localStorage.removeItem(key);
                    return;
                } catch (e) {
                    console.warn('localStorage.removeItem failed, using fallback:', e);
                }
            }
            delete fallbackStorage[key];
        },
        clear() {
            if (storageAvailable) {
                try {
                    window.localStorage.clear();
                    return;
                } catch (e) {
                    console.warn('localStorage.clear failed, using fallback:', e);
                }
            }
            for (const key in fallbackStorage) {
                delete fallbackStorage[key];
            }
        }
    };
})();

const sessionStorage = (function() {
    let storageAvailable = false;
    try {
        const testKey = '__storage_test__';
        window.sessionStorage.setItem(testKey, testKey);
        window.sessionStorage.removeItem(testKey);
        storageAvailable = true;
    } catch (e) {
        storageAvailable = false;
    }

    const fallbackStorage = {};

    return {
        getItem(key) {
            if (storageAvailable) {
                try {
                    return window.sessionStorage.getItem(key);
                } catch (e) {
                    console.warn('sessionStorage.getItem failed, using fallback:', e);
                }
            }
            return fallbackStorage[key] !== undefined ? fallbackStorage[key] : null;
        },
        setItem(key, value) {
            if (storageAvailable) {
                try {
                    window.sessionStorage.setItem(key, value);
                    return;
                } catch (e) {
                    console.warn('sessionStorage.setItem failed, using fallback:', e);
                }
            }
            fallbackStorage[key] = String(value);
        },
        removeItem(key) {
            if (storageAvailable) {
                try {
                    window.sessionStorage.removeItem(key);
                    return;
                } catch (e) {
                    console.warn('sessionStorage.removeItem failed, using fallback:', e);
                }
            }
            delete fallbackStorage[key];
        },
        clear() {
            if (storageAvailable) {
                try {
                    window.sessionStorage.clear();
                    return;
                } catch (e) {
                    console.warn('sessionStorage.clear failed, using fallback:', e);
                }
            }
            for (const key in fallbackStorage) {
                delete fallbackStorage[key];
            }
        }
    };
})();

// Global Error Logger for UI Diagnostics
window.onerror = function(message, source, lineno, colno, error) {
    const errorMsg = `Global JS Error: ${message} (at ${source || 'unknown'}:${lineno || 0})`;
    console.error(errorMsg, error);
    if (typeof showToast === 'function') {
        showToast(`❌ ${message}`, 'error');
    } else {
        alert(errorMsg);
    }
    return false;
};

window.onunhandledrejection = function(event) {
    const reasonMsg = event.reason ? event.reason.message || event.reason : 'Unknown rejection';
    const errorMsg = `Unhandled Promise Rejection: ${reasonMsg}`;
    console.error(errorMsg, event.reason);
    if (typeof showToast === 'function') {
        showToast(`❌ Promise: ${reasonMsg}`, 'error');
    } else {
        alert(errorMsg);
    }
};

// ============================================================
// SECTION 1: CONSTANTS & DEFAULT DATA
// ============================================================

const DEFAULT_USERS = [
    { id:'u001', username:'admin',    password:'admin123', name:'Administrator',   role:'admin',    avatar:'AD' },
    { id:'u002', username:'user1',    password:'user123',  name:'Ahmad Fauzi',     role:'user',     avatar:'AF' },
    { id:'u003', username:'operator1',password:'op123',    name:'Budi Santoso',    role:'operator', avatar:'BS' },
    { id:'u004', username:'manager1', password:'mgr123',   name:'Dr. Siti Rahayu', role:'manager',  avatar:'SR' },
];

const BASE_CATALOG = [
    {
        id:'TL-XRF-01', name:'Analisis Oksida Mayor (XRF Fuse)',
        category:'kimia', price:150000, tat:4/24,
        desc:'Penentuan oksida mayor (SiO₂, Al₂O₃, Fe₂O₃, CaO, MgO, dll.) dengan metode XRF FuseBead.',
        method:'XRF (Fused Bead)', maxSamplesPerRun:20,
        parameters:['SiO₂','Al₂O₃','Fe₂O₃','CaO','MgO','K₂O','Na₂O','TiO₂','MnO','P₂O₅','LOI']
    },
    {
        id:'TL-XRF-02', name:'Analisis Oksida Mayor (XRF Press)',
        category:'kimia', price:120000, tat:4/24,
        desc:'Penentuan oksida mayor dengan metode XRF Pressed Pellet, cocok untuk sampel serbuk.',
        method:'XRF (Pressed Pellet)', maxSamplesPerRun:30,
        parameters:['SiO₂','Al₂O₃','Fe₂O₃','CaO','MgO','K₂O','Na₂O','TiO₂','SO₃']
    },
    {
        id:'TL-XRD-01', name:'Analisis Mineralogi (XRD)',
        category:'mineral', price:200000, tat:2,
        desc:'Identifikasi fasa mineral dalam sampel menggunakan difraksi sinar-X.',
        method:'XRD (Powder Diffraction)', maxSamplesPerRun:10,
        parameters:['Kuarsa','Kalsit','Dolomit','Halite','Gipsum','Ankerit','Pirit','Kaolinit','Illit','Klorit']
    },
    {
        id:'TL-AAS-01', name:'Analisis Logam Berat (AAS)',
        category:'kimia', price:175000, tat:2,
        desc:'Penentuan kadar logam berat (Pb, Cd, Cr, Ni, Cu, Zn) menggunakan AAS.',
        method:'AAS (Flame/Furnace)', maxSamplesPerRun:15,
        parameters:['Pb','Cd','Cr','Ni','Cu','Zn','Fe','Mn','As']
    },
    {
        id:'TL-FIS-01', name:'Uji Fisik Semen (Blaine & Setting)',
        category:'fisik', price:85000, tat:1,
        desc:'Pengujian kehalusan (Blaine), setting time, dan soundness semen Portland.',
        method:'SNI 15-2049 / ASTM C150', maxSamplesPerRun:5,
        parameters:['Blaine (cm²/g)','Setting Time Initial (mnt)','Setting Time Final (mnt)','Soundness (mm)']
    },
    {
        id:'TL-BAT-01', name:'Analisis Proksimat Batubara',
        category:'batubara', price:130000, tat:1,
        desc:'Analisis kadar air, abu, zat terbang, dan karbon tetap dalam batubara.',
        method:'ASTM D3172 / ISO 11722', maxSamplesPerRun:20,
        parameters:['Moisture (%ar)','Ash Content (%ad)','Volatile Matter (%ad)','Fixed Carbon (%ad)']
    },
    {
        id:'TL-BAT-02', name:'Nilai Kalori Batubara (Kalorimeter)',
        category:'batubara', price:145000, tat:1,
        desc:'Penentuan nilai kalori gross dan net batubara menggunakan bomb kalorimeter.',
        method:'ASTM D5865 / ISO 1928', maxSamplesPerRun:15,
        parameters:['Gross Calorific Value (kcal/kg)','Net Calorific Value (kcal/kg)','Total Moisture (%)']
    },
    {
        id:'TL-FIS-02', name:'Uji Kuat Tekan Mortar/Beton',
        category:'fisik', price:95000, tat:28,
        desc:'Pengujian kekuatan tekan mortar/beton pada umur 3, 7, dan 28 hari.',
        method:'SNI 03-6825 / ASTM C109', maxSamplesPerRun:6,
        parameters:['Kuat Tekan 3 Hari (MPa)','Kuat Tekan 7 Hari (MPa)','Kuat Tekan 28 Hari (MPa)']
    },
];

// === REQUEST FORM DATA (Default — overridable by Admin) ===
const DEFAULT_MATERIALS = [
    { id:'semen',         name:'Semen',         icon:'🏭' },
    { id:'klinker',       name:'Klinker',        icon:'🔥' },
    { id:'trial',         name:'Trial',          icon:'🧪' },
    { id:'material-lain', name:'Material Lain',  icon:'📦' },
];

const DEFAULT_PARAMETER_GROUPS = [
    {
        id:'kimia', name:'Kimia', color:'#be123c',
        params:['LOI (%)','SiO₂ (%)','Al₂O₃ (%)','Fe₂O₃ (%)','CaO (%)','MgO (%)','SO₃ (%)','BTL (%)','Total','Free Lime (%)','Total Alkali','Chlor (Cl⁻)','H₂O'],
        subGroups: null,
        subMethod: { label:'Metode Analisis Kimia', options:['XRF FuseBead','XRF Pressed Pellet','Wet'] }
    },
    {
        id:'fisika', name:'Fisika', color:'#0284c7',
        params: null,
        subGroups: [
            {
                id:'fisika-semen', name:'Fisika Semen',
                params:['Res. 0,045 mm','Blaine (cm²/g)','Awal (minutes)','Akhir (minutes)','FALSE SET (%)','NC (%)','AUTOCLAVE (%)','Air Of Mortar','KT 01 hari (kg/cm²)','KT 03 hari (kg/cm²)','KT 07 hari (kg/cm²)','KT 28 hari (kg/cm²)','Ketahanan Sulfat','Panas Hidrasi 3D','Panas Hidrasi 7D','Water retention','Mortar Bar Expantion','Bulk Density','Bj Semen','Ketahana Sulfat 4D','Ketahana Sulfat 180D','Ketahana Sulfat 360D']
            },
            {
                id:'fisika-klinker', name:'Fisika Klinker',
                params:['KLINKER SAI 01 hari (kg/cm²)','KLINKER SAI 03 hari (kg/cm²)','KLINKER SAI 07 hari (kg/cm²)','KLINKER SAI 28 hari (kg/cm²)','KLINKER LW','KLINKER BJ','Size 40 mm','Size 25 mm','Size 16 mm','Size 8 mm','Size 4 mm','Size 2 mm','cont','Res. 0,045 mm','Blaine (cm²/g)']
            }
        ],
        subMethod: null
    },
    {
        id:'lainnya', name:'Lainnya', color:'#d97706',
        params:['Lainnya (tulis di keterangan)'],
        subGroups: null,
        subMethod: null
    },
];

const DEFAULT_TEST_METHODS = ['SNI','Alternatif','ASTM','BS','XRF'];

// === FORM CONFIG HELPERS (Admin can override) ===
const IS_ONLINE_MODE = window.location.protocol !== 'file:';

// === FIREBASE CLOUD DATABASE SETUP ===
const FIREBASE_DB_URL = "https://spectra-lms-default-rtdb.asia-southeast1.firebasedatabase.app/";

const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
    if (FIREBASE_DB_URL && typeof url === 'string' && url.startsWith('/api/')) {
        const endpoint = url.replace('/api/', '');
        const firebaseTargetUrl = `${FIREBASE_DB_URL}${endpoint}.json`;
        
        const newOptions = { ...options };
        if (newOptions.method === 'POST') {
            newOptions.method = 'PUT'; // Firebase uses PUT to overwrite the entire resource
        }
        
        try {
            const response = await originalFetch(firebaseTargetUrl, newOptions);
            
            // Intercept response.json() to handle empty/null database from Firebase
            const originalJson = response.json.bind(response);
            response.json = async function() {
                const data = await originalJson();
                if (data === null) {
                    // Return default initial values if database is blank
                    if (endpoint === 'tickets') return [];
                    if (endpoint === 'results') return {};
                    if (endpoint === 'users') return DEFAULT_USERS;
                    if (endpoint === 'config') return {};
                    if (endpoint === 'announcement') return { active: true, message: "Pengujian XRF FuseBead untuk sementara tidak tersedia. Alat sedang dalam perbaikan." };
                    if (endpoint === 'chemical-config') return { params: {}, chemicals: [] };
                }
                return data;
            };
            return response;
        } catch (err) {
            console.error(`Firebase fetch failed for ${firebaseTargetUrl}:`, err);
            throw err;
        }
    }
    return originalFetch(url, options);
};

let cachedTickets = null;
let cachedResults = null;
let cachedUsers = null;
let cachedConfig = null;
let cachedAnnouncement = null;
let cachedChemicalConfig = null;
let cachedCatalogOverrides = null;

function initLocalStorageFallback() {
    try {
        const s = localStorage.getItem('tl_tickets');
        cachedTickets = s ? JSON.parse(s) : null;
    } catch(e) {}
    if (!cachedTickets) cachedTickets = [];

    try {
        const s = localStorage.getItem('tl_results');
        cachedResults = s ? JSON.parse(s) : {};
    } catch(e) {}
    if (!cachedResults) cachedResults = {};

    try {
        const s = localStorage.getItem('tl_users');
        cachedUsers = s ? JSON.parse(s) : null;
    } catch(e) {}
    if (!cachedUsers) cachedUsers = [...DEFAULT_USERS];

    try {
        const s = localStorage.getItem('tl_form_config');
        cachedConfig = s ? JSON.parse(s) : {};
    } catch(e) {}
    if (!cachedConfig) cachedConfig = {};

    try {
        const s = localStorage.getItem('tl_catalog_overrides');
        cachedCatalogOverrides = s ? JSON.parse(s) : null;
    } catch(e) {}
    if (!cachedCatalogOverrides) cachedCatalogOverrides = { prices:{}, params:{}, custom:[] };
}

function initAnnouncementLocalStorage() {
    try {
        const s = localStorage.getItem('spectra_announcement');
        cachedAnnouncement = s ? JSON.parse(s) : null;
    } catch(e) {}
    if (!cachedAnnouncement) {
        cachedAnnouncement = { active: true, message: "Pengujian XRF FuseBead untuk sementara tidak tersedia. Alat sedang dalam perbaikan." };
    }
}

async function preloadDatabase() {
    initLocalStorageFallback();
    initAnnouncementLocalStorage();
    
    const badge = document.getElementById('connection-status-badge');
    if (IS_ONLINE_MODE) {
        if (badge) {
            badge.textContent = 'Shared (Online)';
            badge.style.background = '#059669';
            badge.style.color = '#fff';
        }
        try {
            const [resTickets, resResults, resUsers, resConfig, resAnnouncement, resChemCfg, resCatalog] = await Promise.all([
                fetch('/api/tickets').then(r => r.json()),
                fetch('/api/results').then(r => r.json()),
                fetch('/api/users').then(r => r.json()),
                fetch('/api/config').then(r => r.json()),
                fetch('/api/announcement').then(r => r.json()),
                fetch('/api/chemical-config').then(r => r.json()),
                fetch('/api/catalog').then(r => r.json())
            ]);
            
            cachedTickets = resTickets;
            cachedResults = resResults;
            cachedUsers = resUsers;
            cachedConfig = resConfig;
            cachedAnnouncement = resAnnouncement;
            cachedChemicalConfig = resChemCfg;
            const hasLocalData = cachedCatalogOverrides && (
                Object.keys(cachedCatalogOverrides.prices || {}).length > 0 ||
                Object.keys(cachedCatalogOverrides.params || {}).length > 0 ||
                (cachedCatalogOverrides.custom || []).length > 0
            );
            const hasServerData = resCatalog && (
                Object.keys(resCatalog.prices || {}).length > 0 ||
                Object.keys(resCatalog.params || {}).length > 0 ||
                (resCatalog.custom || []).length > 0
            );
            
            if (hasLocalData && !hasServerData) {
                saveCatalogOverrides(cachedCatalogOverrides);
            } else {
                cachedCatalogOverrides = resCatalog || { prices:{}, params:{}, custom:[] };
                localStorage.setItem('tl_catalog_overrides', JSON.stringify(cachedCatalogOverrides));
            }
            
            console.log("Database preloaded from server.");
        } catch (e) {
            console.warn("Failed to load from API, using local storage fallback.", e);
            if (badge) {
                badge.textContent = 'Lokal (Server Offline)';
                badge.style.background = '#d97706';
            }
        }
    } else {
        if (badge) {
            badge.textContent = 'Lokal (Offline)';
            badge.style.background = '#475569';
        }
    }
}

function startDatabasePolling() {
    if (!IS_ONLINE_MODE) return;
    setInterval(async () => {
        try {
            const resTickets = await fetch('/api/tickets').then(r => r.json());
            if (JSON.stringify(resTickets) !== JSON.stringify(cachedTickets)) {
                cachedTickets = resTickets;
                if (typeof currentScreen !== 'undefined') {
                    if (currentScreen === 'requests') {
                        renderTicketsTable();
                        updateKPI();
                    }
                    if (currentScreen === 'admin') {
                        renderAdminTable();
                    }
                }
            }
            const resResults = await fetch('/api/results').then(r => r.json());
            if (JSON.stringify(resResults) !== JSON.stringify(cachedResults)) {
                cachedResults = resResults;
            }
            const resCatalog = await fetch('/api/catalog').then(r => r.json());
            if (JSON.stringify(resCatalog) !== JSON.stringify(cachedCatalogOverrides)) {
                cachedCatalogOverrides = resCatalog;
                if (typeof currentScreen !== 'undefined') {
                    if (currentScreen === 'config') {
                        renderPricesTable();
                        renderItemsTable();
                        renderParamsSelect();
                    }
                    if (currentScreen === 'cart') {
                        renderRequestForm();
                    }
                }
                renderCatalog();
            }
        } catch(e) {}
    }, 5000);
}

function getFormConfig() {
    if (!cachedConfig) initLocalStorageFallback();
    const cfg = cachedConfig;
    if (!cfg.materials) cfg.materials = {};
    if (!cfg.params) cfg.params = {};
    if (!cfg.methods) cfg.methods = {};

    DEFAULT_MATERIALS.forEach(m => { if (cfg.materials[m.id] === undefined) cfg.materials[m.id] = true; });
    DEFAULT_TEST_METHODS.forEach(m => { if (cfg.methods[m] === undefined) cfg.methods[m] = true; });
    DEFAULT_PARAMETER_GROUPS.forEach(g => {
        if (g.params) g.params.forEach(p => { if (cfg.params[p] === undefined) cfg.params[p] = true; });
        if (g.subGroups) g.subGroups.forEach(sg => sg.params.forEach(p => { if (cfg.params[p] === undefined) cfg.params[p] = true; }));
    });
    return cfg;
}

function saveFormConfig(cfg) {
    cachedConfig = cfg;
    localStorage.setItem('tl_form_config', JSON.stringify(cfg));
    if (IS_ONLINE_MODE) {
        fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cfg)
        }).catch(e => console.error("Failed to save config to server:", e));
    }
}

// Derived active arrays (rebuilt on form open)
function getMaterials() {
    const cfg = getFormConfig();
    return DEFAULT_MATERIALS.filter(m => cfg.materials[m.id] !== false);
}
function getParamGroups() {
    const cfg = getFormConfig();
    return DEFAULT_PARAMETER_GROUPS.map(g => {
        const out = { ...g };
        if (g.params) out.params = g.params.filter(p => cfg.params[p] !== false);
        if (g.subGroups) out.subGroups = g.subGroups.map(sg => ({
            ...sg, params: sg.params.filter(p => cfg.params[p] !== false)
        }));
        return out;
    });
}
function getTestMethods() {
    const cfg = getFormConfig();
    return DEFAULT_TEST_METHODS.filter(m => cfg.methods[m] !== false);
}

const DEFAULT_TICKETS = [
    {
        id:'TKT-2026-001', date:'2026-05-10', requester:'Ahmad Fauzi', requesterId:'u002',
        status:'Selesai', tests:['TL-XRF-01','TL-XRD-01'],
        samples:[{name:'Sampel Semen OPC',count:3},{name:'Sampel Raw Meal',count:2}],
        timeline:{ordered:'2026-05-10',received:'2026-05-11',testing:'2026-05-12',approved:'2026-05-13',completed:'2026-05-14'},
        totalCost:1050000
    },
    {
        id:'TKT-2026-002', date:'2026-05-20', requester:'Ahmad Fauzi', requesterId:'u002',
        status:'Selesai', tests:['TL-BAT-01','TL-BAT-02'],
        samples:[{name:'Sampel Batubara A',count:5},{name:'Sampel Batubara B',count:3}],
        timeline:{ordered:'2026-05-20',received:'2026-05-21',testing:'2026-05-22',approved:'2026-05-23',completed:'2026-05-24'},
        totalCost:2200000
    },
    {
        id:'TKT-2026-003', date:'2026-06-01', requester:'Ahmad Fauzi', requesterId:'u002',
        status:'Diproses', tests:['TL-AAS-01'],
        samples:[{name:'Sampel Limbah Cair',count:4}],
        timeline:{ordered:'2026-06-01',received:'2026-06-02',testing:'2026-06-03',approved:null,completed:null},
        totalCost:700000
    },
    {
        id:'TKT-2026-004', date:'2026-06-08', requester:'Ahmad Fauzi', requesterId:'u002',
        status:'Baru', tests:['TL-FIS-01'],
        samples:[{name:'Sampel Semen PCC',count:2}],
        timeline:{ordered:'2026-06-08',received:null,testing:null,approved:null,completed:null},
        totalCost:170000
    },
];

// ============================================================
// SECTION 2: SESSION & AUTH
// ============================================================

let currentSession = null;

function checkAuth() {
    const stored = localStorage.getItem('tl_session');
    if (!stored) {
        document.body.classList.add('not-logged-in');
        initLoginParticles();
        return false;
    }
    try {
        currentSession = JSON.parse(stored);
        if (!currentSession || !currentSession.role) { logout(); return false; }
        document.body.classList.remove('not-logged-in');
        return true;
    } catch(e) { logout(); return false; }
}

function logout() {
    localStorage.removeItem('tl_session');
    document.body.classList.add('not-logged-in');
    initLoginParticles();
    // Reset to dashboard default
    switchScreen('dashboard');
}

// === SINGLE PAGE APPLICATION LOGIN FUNCTIONS ===
function doLogin(username, password) {
    const users = getUsers();
    return users.find(u => u.username === username && u.password === password) || null;
}

function setSession(user) {
    const initials = user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    localStorage.setItem('tl_session', JSON.stringify({
        id: user.id, username: user.username, name: user.name,
        role: user.role, avatar: user.avatar || initials
    }));
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;
    const btn = document.getElementById('signin-btn');
    const errBox = document.getElementById('error-box');

    if (errBox) errBox.classList.remove('show');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner"></div> Memverifikasi...';
    }

    setTimeout(() => {
        const user = doLogin(username, password);
        if (user) {
            setSession(user);
            if (btn) btn.innerHTML = '✓ Berhasil!';
            setTimeout(() => {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = 'Masuk';
                }
                const elU = document.getElementById('username');
                const elP = document.getElementById('password');
                if (elU) elU.value = '';
                if (elP) elP.value = '';
                
                // Refresh app
                if (checkAuth()) {
                    initApp();
                }
            }, 400);
        } else {
            const errText = document.getElementById('error-text');
            if (errText) errText.textContent = 'Username atau password tidak valid. Silakan coba lagi.';
            if (errBox) errBox.classList.add('show');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                    </svg> Masuk`;
            }
        }
    }, 700);
}

function quickLogin(username, password) {
    const elU = document.getElementById('username');
    const elP = document.getElementById('password');
    if (elU) elU.value = username;
    if (elP) elP.value = password;
    handleLogin();
}

function initLoginParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = 1.5 + Math.random() * 3;
        p.style.cssText = `left:${Math.random()*100}%;width:${size}px;height:${size}px;animation-duration:${10+Math.random()*15}s;animation-delay:${-Math.random()*25}s;`;
        container.appendChild(p);
    }
}

function getRole() { return currentSession ? currentSession.role : 'user'; }

function can(permission) {
    const perms = {
        admin:    ['catalog','cart','requests','admin','config','upload','approve','download','update_status','manage_users','manage_catalog'],
        user:     ['catalog','cart','requests','download'],
        operator: ['requests','admin','upload','update_status'],
        manager:  ['requests','admin','approve','download'],
    };
    return (perms[getRole()] || []).includes(permission);
}

// ============================================================
// SECTION 3: USER MANAGEMENT
// ============================================================

function getUsers() {
    if (!cachedUsers) initLocalStorageFallback();
    return cachedUsers;
}

function saveUsers(users) {
    cachedUsers = users;
    localStorage.setItem('tl_users', JSON.stringify(users));
    if (IS_ONLINE_MODE) {
        fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users)
        }).catch(e => console.error("Failed to save users to server:", e));
    }
}

function renderUsersTable() {
    const users = getUsers();
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4"><div class="empty-config"><div class="empty-icon-lg">👤</div>Belum ada pengguna.</div></td></tr>';
        return;
    }
    tbody.innerHTML = users.map(u => `
        <tr>
            <td><strong>${u.username}</strong></td>
            <td>${u.name}</td>
            <td><span class="role-pill ${u.role}">${u.role.charAt(0).toUpperCase()+u.role.slice(1)}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-info" onclick="openUserModal('${u.id}')">✏️ Edit</button>
                    ${u.id !== currentSession.id ? `<button class="btn-danger" onclick="deleteUser('${u.id}')">🗑️ Hapus</button>` : '<span style="font-size:0.75rem;color:var(--text-light);">(Akun Anda)</span>'}
                </div>
            </td>
        </tr>
    `).join('');
}

function openUserModal(userId = null) {
    document.getElementById('user-edit-id').value = userId || '';
    document.getElementById('user-form-password').value = '';
    if (userId) {
        const users = getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return;
        document.getElementById('user-modal-title').textContent = 'Edit User';
        document.getElementById('user-form-username').value = user.username;
        document.getElementById('user-form-name').value = user.name;
        document.getElementById('user-form-role').value = user.role;
    } else {
        document.getElementById('user-modal-title').textContent = 'Tambah User Baru';
        document.getElementById('user-form-username').value = '';
        document.getElementById('user-form-name').value = '';
        document.getElementById('user-form-role').value = 'user';
    }
    openModal('user-modal');
}

function saveUser() {
    const editId = document.getElementById('user-edit-id').value;
    const username = document.getElementById('user-form-username').value.trim();
    const name = document.getElementById('user-form-name').value.trim();
    const password = document.getElementById('user-form-password').value;
    const role = document.getElementById('user-form-role').value;

    if (!username || !name) { showToast('Username dan Nama wajib diisi!', 'error'); return; }

    const users = getUsers();

    if (editId) {
        const idx = users.findIndex(u => u.id === editId);
        if (idx === -1) return;
        if (username !== users[idx].username && users.some(u => u.username === username)) {
            showToast('Username sudah digunakan!', 'error'); return;
        }
        users[idx].username = username;
        users[idx].name = name;
        users[idx].role = role;
        users[idx].avatar = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
        if (password) users[idx].password = password;
        showToast('User berhasil diupdate!', 'success');
    } else {
        if (users.some(u => u.username === username)) { showToast('Username sudah digunakan!', 'error'); return; }
        if (!password || password.length < 4) { showToast('Password minimal 4 karakter!', 'error'); return; }
        const newId = 'u' + Date.now();
        users.push({ id:newId, username, password, name, role, avatar: name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() });
        showToast('User baru berhasil ditambahkan!', 'success');
    }

    saveUsers(users);
    closeModal('user-modal');
    renderUsersTable();
}

function deleteUser(userId) {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    const users = getUsers().filter(u => u.id !== userId);
    saveUsers(users);
    renderUsersTable();
    showToast('User berhasil dihapus.', 'success');
}

// === CHANGE PASSWORD FUNCTIONS ===
function openChangePasswordModal() {
    document.getElementById('change-pwd-old').value = '';
    document.getElementById('change-pwd-new').value = '';
    document.getElementById('change-pwd-confirm').value = '';
    openModal('change-password-modal');
}

function submitChangePassword() {
    const oldPwd = document.getElementById('change-pwd-old').value;
    const newPwd = document.getElementById('change-pwd-new').value;
    const confirmPwd = document.getElementById('change-pwd-confirm').value;

    if (!oldPwd || !newPwd || !confirmPwd) {
        showToast('Semua kolom password wajib diisi!', 'error');
        return;
    }

    if (newPwd.length < 4) {
        showToast('Password baru minimal 4 karakter!', 'error');
        return;
    }

    if (newPwd !== confirmPwd) {
        showToast('Konfirmasi password baru tidak cocok!', 'error');
        return;
    }

    const users = getUsers();
    const currentUserIndex = users.findIndex(u => u.id === currentSession.id);

    if (currentUserIndex === -1) {
        showToast('Pengguna tidak ditemukan!', 'error');
        return;
    }

    // Verify old password
    if (users[currentUserIndex].password !== oldPwd) {
        showToast('Password lama Anda salah!', 'error');
        return;
    }

    // Update password
    users[currentUserIndex].password = newPwd;
    saveUsers(users);

    showToast('🔑 Password berhasil diganti!', 'success');
    closeModal('change-password-modal');
}

// ============================================================
// SECTION 4: CATALOG MANAGEMENT
// ============================================================

function getCatalogOverrides() {
    if (!cachedCatalogOverrides) {
        try { const s = localStorage.getItem('tl_catalog_overrides'); cachedCatalogOverrides = s ? JSON.parse(s) : { prices:{}, params:{}, custom:[] }; }
        catch(e) { cachedCatalogOverrides = { prices:{}, params:{}, custom:[] }; }
    }
    return cachedCatalogOverrides;
}

function saveCatalogOverrides(overrides) {
    cachedCatalogOverrides = overrides;
    localStorage.setItem('tl_catalog_overrides', JSON.stringify(overrides));
    if (IS_ONLINE_MODE) {
        fetch('/api/catalog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(overrides)
        }).catch(e => console.error("Failed to save catalog overrides to server:", e));
    }
}

function getCatalogData() {
    const overrides = getCatalogOverrides();
    const prices = overrides.prices || {};
    const params = overrides.params || {};
    let catalog = BASE_CATALOG.map(item => ({
        ...item,
        price: prices[item.id] !== undefined ? Number(prices[item.id]) : item.price,
        parameters: params[item.id] ? params[item.id] : item.parameters,
    }));
    catalog = [...catalog, ...(overrides.custom || [])];
    return catalog;
}

function renderPricesTable() {
    const catalog = getCatalogData();
    const tbody = document.getElementById('prices-table-body');
    if (!tbody) return;
    tbody.innerHTML = catalog.map(item => `
        <tr>
            <td><code style="font-size:0.78rem;color:var(--primary-color);">${item.id}</code></td>
            <td>${item.name}</td>
            <td><span class="badge badge-neutral">${item.category}</span></td>
            <td>${item.tat < 1 ? Math.round(item.tat*24)+' Jam' : item.tat+' Hari'}</td>
            <td><input type="number" class="price-input" id="price-${item.id}" value="${item.price}" min="0" step="1000"></td>
        </tr>
    `).join('');
}

function saveAllPrices() {
    const catalog = getCatalogData();
    const overrides = getCatalogOverrides();
    catalog.forEach(item => {
        const el = document.getElementById('price-' + item.id);
        if (el) overrides.prices[item.id] = Number(el.value) || 0;
    });
    saveCatalogOverrides(overrides);
    showToast('Semua harga berhasil disimpan!', 'success');
    renderCatalog(); // refresh catalog view
}

function renderItemsTable() {
    const catalog = getCatalogData();
    const overrides = getCatalogOverrides();
    const tbody = document.getElementById('items-table-body');
    if (!tbody) return;
    tbody.innerHTML = catalog.map(item => {
        const isCustom = (overrides.custom || []).some(c => c.id === item.id);
        return `<tr>
            <td><code style="font-size:0.78rem;color:var(--primary-color);">${item.id}</code></td>
            <td>${item.name}</td>
            <td><span class="badge badge-neutral">${item.category}</span></td>
            <td>Rp ${item.price.toLocaleString('id-ID')}</td>
            <td>${item.tat < 1 ? Math.round(item.tat*24)+' Jam' : item.tat+' Hari'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-info" onclick="openCatalogItemModal('${item.id}')">✏️ Edit</button>
                    ${isCustom ? `<button class="btn-danger" onclick="deleteCatalogItem('${item.id}')">🗑️ Hapus</button>` : '<span style="font-size:0.72rem;color:var(--text-light);">Default</span>'}
                </div>
            </td>
        </tr>`;
    }).join('');
}

function openCatalogItemModal(itemId = null) {
    if (itemId) {
        const item = getCatalogData().find(i => i.id === itemId);
        if (!item) return;
        document.getElementById('item-modal-title').textContent = 'Edit Item Katalog';
        document.getElementById('item-edit-id').value = itemId;
        document.getElementById('item-form-id').value = item.id;
        document.getElementById('item-form-name').value = item.name;
        document.getElementById('item-form-desc').value = item.desc || '';
        document.getElementById('item-form-price').value = item.price;
        document.getElementById('item-form-tat').value = item.tat;
        document.getElementById('item-form-category').value = item.category;
        document.getElementById('item-form-method').value = item.method || '';
        document.getElementById('item-form-id').disabled = true;
    } else {
        document.getElementById('item-modal-title').textContent = 'Tambah Item Katalog';
        document.getElementById('item-edit-id').value = '';
        document.getElementById('item-form-id').value = '';
        document.getElementById('item-form-name').value = '';
        document.getElementById('item-form-desc').value = '';
        document.getElementById('item-form-price').value = '';
        document.getElementById('item-form-tat').value = '';
        document.getElementById('item-form-category').value = 'kimia';
        document.getElementById('item-form-method').value = '';
        document.getElementById('item-form-id').disabled = false;
    }
    openModal('catalog-item-modal');
}

function saveCatalogItem() {
    const editId = document.getElementById('item-edit-id').value;
    const id = document.getElementById('item-form-id').value.trim();
    const name = document.getElementById('item-form-name').value.trim();
    const desc = document.getElementById('item-form-desc').value.trim();
    const price = Number(document.getElementById('item-form-price').value);
    const tat = Number(document.getElementById('item-form-tat').value);
    const category = document.getElementById('item-form-category').value;
    const method = document.getElementById('item-form-method').value.trim();

    if (!id || !name || !price || !tat) { showToast('Harap lengkapi semua field wajib!', 'error'); return; }

    const overrides = getCatalogOverrides();
    if (!overrides.custom) overrides.custom = [];

    const newItem = { id, name, desc, price, tat, category, method, parameters:[] };

    if (editId) {
        // Edit existing custom item
        const idx = overrides.custom.findIndex(c => c.id === editId);
        if (idx !== -1) { overrides.custom[idx] = { ...overrides.custom[idx], ...newItem }; }
        else { overrides.prices[editId] = price; } // It's a base item, just save price
        showToast('Item berhasil diupdate!', 'success');
    } else {
        if (getCatalogData().some(i => i.id === id)) { showToast('Kode item sudah ada!', 'error'); return; }
        overrides.custom.push(newItem);
        showToast('Item baru berhasil ditambahkan!', 'success');
    }

    saveCatalogOverrides(overrides);
    closeModal('catalog-item-modal');
    renderItemsTable();
    renderParamsSelect();
    renderCatalog();
}

function deleteCatalogItem(itemId) {
    if (!confirm('Yakin ingin menghapus item ini dari katalog?')) return;
    const overrides = getCatalogOverrides();
    overrides.custom = (overrides.custom || []).filter(c => c.id !== itemId);
    saveCatalogOverrides(overrides);
    renderItemsTable();
    renderParamsSelect();
    renderCatalog();
    showToast('Item berhasil dihapus.', 'success');
}

// ============================================================
// SECTION 5: PARAMETER MANAGEMENT
// ============================================================

let currentParamsItemId = null;
let currentParams = [];

function renderParamsSelect() {
    const catalog = getCatalogData();
    const sel = document.getElementById('params-item-select');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">-- Pilih item untuk edit parameter --</option>' +
        catalog.map(item => `<option value="${item.id}" ${item.id===currentVal?'selected':''}>${item.id} - ${item.name}</option>`).join('');
}

function loadItemParams() {
    const itemId = document.getElementById('params-item-select').value;
    const card = document.getElementById('params-editor-card');
    if (!itemId) { card.style.display = 'none'; return; }

    const item = getCatalogData().find(i => i.id === itemId);
    if (!item) return;

    currentParamsItemId = itemId;
    currentParams = [...(item.parameters || [])];
    document.getElementById('params-item-name').textContent = item.name;
    card.style.display = 'block';
    renderParamTags();
}

function renderParamTags() {
    const container = document.getElementById('params-tag-list');
    if (!container) return;
    if (currentParams.length === 0) {
        container.innerHTML = '<span style="font-size:0.8rem;color:var(--text-light);">Belum ada parameter. Tambahkan di bawah.</span>';
        return;
    }
    container.innerHTML = currentParams.map((p, i) => `
        <span class="param-tag">
            ${p}
            <button onclick="removeParam(${i})" title="Hapus parameter ini">&times;</button>
        </span>
    `).join('');
}

function addParam() {
    const input = document.getElementById('new-param-input');
    const val = input.value.trim();
    if (!val) return;
    if (currentParams.includes(val)) { showToast('Parameter sudah ada!', 'warning'); return; }
    currentParams.push(val);
    input.value = '';
    renderParamTags();
}

function removeParam(index) {
    currentParams.splice(index, 1);
    renderParamTags();
}

function saveItemParams() {
    if (!currentParamsItemId) return;
    const overrides = getCatalogOverrides();
    overrides.params[currentParamsItemId] = [...currentParams];
    saveCatalogOverrides(overrides);
    showToast('Parameter berhasil disimpan!', 'success');
}

// ============================================================
// SECTION 6: PDF RESULTS SYSTEM
// ============================================================

function getResults() {
    if (!cachedResults) initLocalStorageFallback();
    return cachedResults;
}

function saveResults(results) {
    cachedResults = results;
    localStorage.setItem('tl_results', JSON.stringify(results));
    if (IS_ONLINE_MODE) {
        fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(results)
        }).catch(e => console.error("Failed to save results to server:", e));
    }
}

let currentPDFTicketId = null;

function uploadPDF(ticketId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,application/pdf,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) { showToast('File terlalu besar! Maksimal 8MB.', 'error'); return; }

        const reader = new FileReader();
        showToast('Mengupload file...', 'info');
        reader.onload = function(ev) {
            try {
                const results = getResults();
                results[ticketId] = {
                    pdfBase64: ev.target.result,
                    fileName: file.name,
                    fileSize: file.size,
                    uploadedBy: currentSession.username,
                    uploadedByName: currentSession.name,
                    uploadedAt: new Date().toISOString(),
                    status: 'pending',
                    approvedBy: null, approvedByName: null, approvedAt: null, rejectNote: null
                };
                saveResults(results);
                updateTicketStatus(ticketId, 'Menunggu Approval');
                showToast('✅ Hasil uji berhasil diupload! Menunggu approval Manager.', 'success');
                renderAdminTable();
                renderTicketsTable();
            } catch(err) {
                showToast('Gagal menyimpan file. Coba file lebih kecil.', 'error');
            }
        };
        reader.onerror = () => showToast('Gagal membaca file!', 'error');
        reader.readAsDataURL(file);
    };
    input.click();
}

function viewPDF(ticketId, showApprovalBtns = false) {
    const results = getResults();
    const result = results[ticketId];
    if (!result || !result.pdfBase64) { showToast('File hasil uji belum tersedia.', 'error'); return; }

    currentPDFTicketId = ticketId;

    document.getElementById('pdf-viewer-title').textContent = 'Hasil Uji — ' + ticketId;
    document.getElementById('pdf-viewer-sub').textContent = result.fileName;

    const sizeKB = Math.round(result.fileSize / 1024);
    document.getElementById('pdf-file-info').innerHTML =
        `<strong>File:</strong> ${result.fileName} &nbsp;|&nbsp; <strong>Ukuran:</strong> ${sizeKB} KB &nbsp;|&nbsp; <strong>Diupload oleh:</strong> ${result.uploadedByName || result.uploadedBy} &nbsp;|&nbsp; <strong>Tanggal:</strong> ${formatDate(result.uploadedAt)}`;

    const isExcel = result.fileName && (result.fileName.toLowerCase().endsWith('.xls') || result.fileName.toLowerCase().endsWith('.xlsx'));
    
    if (isExcel) {
        document.getElementById('pdf-iframe-wrapper').style.display = 'none';
        document.getElementById('excel-download-wrapper').style.display = 'block';
        document.getElementById('pdf-iframe').src = 'about:blank';
    } else {
        document.getElementById('pdf-iframe-wrapper').style.display = 'block';
        document.getElementById('excel-download-wrapper').style.display = 'none';
        document.getElementById('pdf-iframe').src = result.pdfBase64;
    }

    const approvalDiv = document.getElementById('pdf-approval-btns');
    if (showApprovalBtns && can('approve') && result.status === 'pending') {
        approvalDiv.style.display = 'flex';
    } else {
        approvalDiv.style.display = 'none';
    }

    openModal('pdf-viewer-modal');
}

function approvePDFFromModal() {
    if (!currentPDFTicketId) return;
    if (!confirm('Setujui hasil uji ini? User akan bisa mengunduh laporan.')) return;

    const results = getResults();
    if (!results[currentPDFTicketId]) return;
    results[currentPDFTicketId].status = 'approved';
    results[currentPDFTicketId].approvedBy = currentSession.username;
    results[currentPDFTicketId].approvedByName = currentSession.name;
    results[currentPDFTicketId].approvedAt = new Date().toISOString();
    saveResults(results);

    updateTicketStatus(currentPDFTicketId, 'Selesai');
    showToast('✅ Hasil uji diapprove! User dapat mengunduh laporan.', 'success');
    closeModal('pdf-viewer-modal');
    closeModal('reject-modal');
    renderAdminTable();
    renderTicketsTable();
    updateKPI();
}

function openRejectModal() { openModal('reject-modal'); document.getElementById('reject-note').value = ''; }

function confirmReject() {
    if (!currentPDFTicketId) return;
    const note = document.getElementById('reject-note').value.trim();
    if (!note) { showToast('Harap isi catatan alasan penolakan!', 'error'); return; }

    const results = getResults();
    if (!results[currentPDFTicketId]) return;
    results[currentPDFTicketId].status = 'rejected';
    results[currentPDFTicketId].rejectNote = note;
    results[currentPDFTicketId].rejectedBy = currentSession.username;
    results[currentPDFTicketId].rejectedAt = new Date().toISOString();
    saveResults(results);

    updateTicketStatus(currentPDFTicketId, 'Diproses');
    showToast('❌ Hasil uji ditolak. Operator perlu upload ulang.', 'warning');
    closeModal('reject-modal');
    closeModal('pdf-viewer-modal');
    renderAdminTable();
    renderTicketsTable();
}

function downloadPDF(ticketId) {
    const results = getResults();
    const result = results[ticketId];
    if (!result) { showToast('File hasil uji belum tersedia.', 'error'); return; }
    if (result.status !== 'approved') { showToast('Hasil uji belum diapprove oleh Manager.', 'warning'); return; }

    const link = document.createElement('a');
    link.href = result.pdfBase64;
    link.download = result.fileName || ('Hasil_Uji_' + ticketId + '.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Laporan sedang diunduh...', 'success');
}

function downloadPDFFromModal() { downloadPDF(currentTicketModalId); }

// ============================================================
// SECTION 7: TICKET STATE
// ============================================================

function getTickets() {
    if (!cachedTickets) initLocalStorageFallback();
    return cachedTickets;
}

function saveTickets(tickets) {
    cachedTickets = tickets;
    localStorage.setItem('tl_tickets', JSON.stringify(tickets));
    if (IS_ONLINE_MODE) {
        fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tickets)
        }).catch(e => console.error("Failed to save tickets to server:", e));
    }
}

function updateTicketStatus(ticketId, newStatus) {
    const tickets = getTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx === -1) return;
    tickets[idx].status = newStatus;
    if (newStatus === 'Sampel Diterima' && !tickets[idx].timeline.received) {
        tickets[idx].timeline.received = new Date().toISOString().split('T')[0];
    }
    if (newStatus === 'Diproses' && !tickets[idx].timeline.testing) {
        tickets[idx].timeline.testing = new Date().toISOString().split('T')[0];
    }
    if (newStatus === 'Selesai') {
        tickets[idx].timeline.approved = new Date().toISOString().split('T')[0];
        tickets[idx].timeline.completed = new Date().toISOString().split('T')[0];
    }
    saveTickets(tickets);
}

// ============================================================
// SECTION 8: CATALOG RENDERING
// ============================================================

let cartItems = [];
let catalogFilter = { category: 'all', search: '', tat: ['regular', 'express'] };

function setCategoryFilter(cat) {
    catalogFilter.category = cat;
    document.querySelectorAll('.filter-pill').forEach(el => el.classList.toggle('active', el.dataset.category === cat));
    renderCatalog();
}

function filterCatalog() {
    catalogFilter.search = document.getElementById('catalog-search')?.value.toLowerCase() || '';
    renderCatalog();
}

function sortCatalog() { renderCatalog(); }

function quickAddTest(id) {
    const item = getCatalogData().find(i => i.id === id);
    if (!item) return;
    addToCart(id);
    switchScreen('cart');
}

function addToCart(testId) {
    // Legacy - now redirects to form screen
    showToast('Gunakan menu Permintaan Uji untuk menambahkan sampel.', 'info');
    switchScreen('cart');
}

function removeFromCart(testId) {
    cartItems = cartItems.filter(c => c.testId !== testId);
}

function clearCart() { cartItems = []; }

function updateCartBadge() { /* removed - no cart badge element */ }

// Alias for backward compat (called in DOMContentLoaded)
function renderCart() { /* alias - form is rendered on screen switch */ }

function renderCatalog() {
    const catalog = getCatalogData();
    const grid = document.getElementById('catalog-grid');
    const countText = document.getElementById('catalog-count-text');
    if (!grid) return;

    const tatRegular = document.getElementById('tat-regular')?.checked;
    const tatExpress = document.getElementById('tat-express')?.checked;
    const sortVal = document.getElementById('catalog-sort')?.value || 'name-asc';

    let filtered = catalog.filter(item => {
        const catOk = catalogFilter.category === 'all' || item.category === catalogFilter.category;
        const searchOk = !catalogFilter.search || item.name.toLowerCase().includes(catalogFilter.search) || item.id.toLowerCase().includes(catalogFilter.search);
        const isExpress = item.tat < 1;
        const tatOk = (isExpress && tatExpress) || (!isExpress && tatRegular);
        return catOk && searchOk && tatOk;
    });

    filtered.sort((a,b) => {
        if (sortVal === 'price-asc') return a.price - b.price;
        if (sortVal === 'price-desc') return b.price - a.price;
        if (sortVal === 'tat-asc') return a.tat - b.tat;
        return a.name.localeCompare(b.name);
    });

    if (countText) countText.textContent = `Menampilkan ${filtered.length} parameter pengujian`;

    const catLabels = { kimia:'Analisis Kimia', mineral:'Analisis Mineralogi', fisik:'Uji Fisik & Mekanik', batubara:'Energi & Batubara' };
    const catIcons  = { kimia:'⚗️', mineral:'💎', fisik:'🏗️', batubara:'⛏️' };
    const inCart = new Set(cartItems.map(c => c.testId));

    grid.innerHTML = filtered.map(item => {
        const tatLabel = item.tat < 1 ? `${Math.round(item.tat*24)} Jam (Express)` : `${item.tat} Hari (Reguler)`;
        const inC = inCart.has(item.id);
        return `
        <div class="catalog-card">
            <div class="catalog-card-header">
                <span class="catalog-category-badge cat-${item.category}">${catIcons[item.category]||'🔬'} ${catLabels[item.category]||item.category}</span>
                <span class="catalog-code">${item.id}</span>
            </div>
            <h3 class="catalog-card-title">${item.name}</h3>
            <p class="catalog-card-desc">${item.desc||''}</p>
            <div class="catalog-card-meta">
                <span>🕐 TAT: ${tatLabel}</span>
                <span>⚙️ ${item.method||'-'}</span>
            </div>
            <div class="catalog-card-footer">
                <span class="catalog-price">Rp ${item.price.toLocaleString('id-ID')}<span class="per-sample">/sampel</span></span>
                ${can('cart') ? `<button class="btn btn-primary btn-sm" onclick="switchScreen('cart')" title="Buat Permintaan Uji">
                    📋 Buat Permintaan
                </button>` : '<span style="font-size:0.75rem;color:var(--text-light);">Readonly</span>'}
            </div>
        </div>`;
    }).join('') || '<div class="empty-state"><div class="empty-icon">🔍</div><h3>Tidak Ditemukan</h3><p>Tidak ada parameter yang sesuai filter.</p></div>';
}

// ============================================================
// SECTION 9: REQUEST FORM (ATLAS Style)
// ============================================================

let reqForm = {
    origin: null,        // 'internal' | 'external'
    originDetail: null,  // sub-kategori internal (FM, SILO, dst.)
    material: null,
    selectedGroups: new Set(),
    selectedParams: {},       // groupId -> Set of param names
    subMethods: {},           // groupId -> chosen sub-method string
    methods: [],              // array of selected test methods (multi-select)
    method: null,             // legacy single method (kept for compat)
    sampleCount: 1,
    notes: ''
};
let requestList = [];

function renderRequestForm() {
    renderOriginSection();
    renderMaterialGrid();
    renderParamGroupPills();
    renderParamDetailArea();
    renderMethodCheckboxes();
    renderRequestListSidebar();
}

// --- Material Grid ---
function renderMaterialGrid() {
    const grid = document.getElementById('material-grid');
    if (!grid) return;
    const mats = getMaterials();
    grid.innerHTML = mats.map(m =>
        `<button class="material-btn ${reqForm.material===m.id?'selected':''}" onclick="selectMaterial('${m.id}')">
            <span class="mat-icon">${m.icon}</span> ${m.name}
        </button>`
    ).join('');
}

function selectMaterial(id) {
    reqForm.material = reqForm.material === id ? null : id;
    renderMaterialGrid();
}

// --- Parameter Group Pills ---
function renderParamGroupPills() {
    const container = document.getElementById('param-group-pills');
    if (!container) return;
    const groups = getParamGroups();
    container.innerHTML = groups.map(g => {
        const sel = reqForm.selectedGroups.has(g.id);
        return `<button class="pg-pill ${sel?'selected':''}" style="background:${g.color};" onclick="toggleParamGroup('${g.id}')">
            <span class="pg-check">✓</span> ${g.name}
        </button>`;
    }).join('');
}

function toggleParamGroup(groupId) {
    const groups = getParamGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    if (reqForm.selectedGroups.has(groupId)) {
        reqForm.selectedGroups.delete(groupId);
        // clear params for this group and all its subGroups
        delete reqForm.selectedParams[groupId];
        if (group.subGroups) group.subGroups.forEach(sg => delete reqForm.selectedParams[sg.id]);
        delete reqForm.subMethods[groupId];
    } else {
        reqForm.selectedGroups.add(groupId);
        // Auto-select all params
        if (group.params) {
            reqForm.selectedParams[groupId] = new Set(group.params);
        }
        if (group.subGroups) {
            group.subGroups.forEach(sg => {
                reqForm.selectedParams[sg.id] = new Set(sg.params);
            });
        }
        if (group.subMethod) reqForm.subMethods[groupId] = new Set([group.subMethod.options[0]]);
    }
    renderParamGroupPills();
    renderParamDetailArea();
}

// --- Parameter Detail Area ---
function renderParamDetailArea() {
    const area = document.getElementById('param-detail-area');
    if (!area) return;

    if (reqForm.selectedGroups.size === 0) {
        area.innerHTML = '<p style="font-size:0.82rem;color:var(--text-light);padding:8px 0;">Pilih minimal satu grup parameter di atas.</p>';
        return;
    }

    const groups = getParamGroups();
    let html = '';

    groups.forEach(g => {
        if (!reqForm.selectedGroups.has(g.id)) return;

        html += `<div class="param-detail-group" style="border-left:3px solid ${g.color};">`;

        // Group with direct params (e.g. Kimia, Lainnya)
        if (g.params && g.params.length > 0) {
            if (!reqForm.selectedParams[g.id]) reqForm.selectedParams[g.id] = new Set(g.params);
            const selectedSet = reqForm.selectedParams[g.id];
            html += `<h4 style="color:${g.color};">${g.name}</h4>
            <div class="param-cb-grid">
                ${g.params.map(p => `
                    <label class="param-cb-item">
                        <input type="checkbox" ${selectedSet.has(p)?'checked':''}
                            onchange="toggleSingleParam('${g.id}','${p.replace(/['"]/g,'_')}',this.checked,'${p.replace(/['"]/g,'_')}')">
                        ${p}
                    </label>
                `).join('')}
            </div>`;

            // Sub-method selector
            if (g.subMethod) {
                let currentSet = reqForm.subMethods[g.id];
                if (!(currentSet instanceof Set)) {
                    if (typeof currentSet === 'string') {
                        currentSet = new Set(currentSet.split(', ').filter(Boolean));
                    } else {
                        currentSet = new Set([g.subMethod.options[0]]);
                    }
                    reqForm.subMethods[g.id] = currentSet;
                }

                html += `<div class="method-sub-option">
                    <legend>${g.subMethod.label} * (Bisa pilih lebih dari satu)</legend>
                    <div class="method-sub-radios">
                        ${g.subMethod.options.map(opt => `
                            <label>
                                <input type="checkbox" value="${opt}" ${currentSet.has(opt)?'checked':''}
                                    onchange="toggleSubMethodSelection('${g.id}','${opt}',this.checked)">
                                ${opt}
                            </label>
                        `).join('')}
                    </div>
                </div>`;
            }
        }

        // Group with subGroups (Fisika)
        if (g.subGroups && g.subGroups.length > 0) {
            html += `<h4 style="color:${g.color};margin-bottom:12px;">${g.name}</h4>`;
            g.subGroups.forEach(sg => {
                if (!reqForm.selectedParams[sg.id]) reqForm.selectedParams[sg.id] = new Set(sg.params);
                const selectedSet = reqForm.selectedParams[sg.id];
                html += `<div class="param-subgroup">
                    <div class="param-subgroup-header" onclick="toggleSubGroupCollapse('${sg.id}')">
                        <span class="param-subgroup-title">${sg.name}</span>
                        <span class="param-subgroup-count">${selectedSet.size}/${sg.params.length} dipilih</span>
                        <button class="param-subgroup-toggle-btn" onclick="toggleSubGroupAll('${sg.id}',event)">
                            ${selectedSet.size === sg.params.length ? 'Batalkan Semua' : 'Pilih Semua'}
                        </button>
                    </div>
                    <div class="param-cb-grid" id="sg-grid-${sg.id}">
                        ${sg.params.map(p => `
                            <label class="param-cb-item">
                                <input type="checkbox" ${selectedSet.has(p)?'checked':''}
                                    onchange="toggleSingleParam('${sg.id}','${p.replace(/['"]/g,'_')}',this.checked,'${p}')">
                                ${p}
                            </label>
                        `).join('')}
                    </div>
                </div>`;
            });
        }

        html += '</div>';
    });

    area.innerHTML = html;
}

function toggleSingleParam(key, paramNameEscaped, checked, paramNameReal) {
    // paramNameReal is the actual param name; paramNameEscaped is used as fallback
    const realName = paramNameReal || paramNameEscaped;
    if (!reqForm.selectedParams[key]) reqForm.selectedParams[key] = new Set();
    if (checked) reqForm.selectedParams[key].add(realName);
    else reqForm.selectedParams[key].delete(realName);
    // Update count display for subGroups
    updateSubGroupCount(key);
}

function toggleSubMethodSelection(groupId, opt, checked) {
    if (!reqForm.subMethods[groupId] || !(reqForm.subMethods[groupId] instanceof Set)) {
        reqForm.subMethods[groupId] = new Set();
    }
    if (checked) {
        reqForm.subMethods[groupId].add(opt);
    } else {
        reqForm.subMethods[groupId].delete(opt);
    }
}

function updateSubGroupCount(sgId) {
    const groups = getParamGroups();
    groups.forEach(g => {
        if (g.subGroups) {
            const sg = g.subGroups.find(s => s.id === sgId);
            if (sg) {
                const countEl = document.querySelector(`#sg-grid-${sgId}`)?.closest('.param-subgroup')?.querySelector('.param-subgroup-count');
                if (countEl) countEl.textContent = (reqForm.selectedParams[sgId]?.size || 0) + '/' + sg.params.length + ' dipilih';
            }
        }
    });
}

function toggleSubGroupAll(sgId, event) {
    event.stopPropagation();
    const groups = getParamGroups();
    let sgParams = [];
    groups.forEach(g => {
        if (g.subGroups) {
            const sg = g.subGroups.find(s => s.id === sgId);
            if (sg) sgParams = sg.params;
        }
    });
    const current = reqForm.selectedParams[sgId];
    const allSelected = current && current.size === sgParams.length;
    reqForm.selectedParams[sgId] = allSelected ? new Set() : new Set(sgParams);
    renderParamDetailArea();
}

function toggleSubGroupCollapse(sgId) {
    const grid = document.getElementById('sg-grid-' + sgId);
    if (grid) grid.classList.toggle('collapsed');
}

// --- Asal Contoh ---
function renderOriginSection() {
    const role = getRole();
    const btnInt = document.getElementById('origin-btn-internal');
    const btnExt = document.getElementById('origin-btn-external');
    const detailDiv = document.getElementById('origin-internal-detail');
    
    if (role === 'user') {
        if (btnInt) btnInt.style.display = 'none';
        reqForm.origin = 'external';
        reqForm.originDetail = null;
    } else {
        if (btnInt) btnInt.style.display = '';
    }

    if (btnInt) btnInt.classList.toggle('selected', reqForm.origin === 'internal');
    if (btnExt) btnExt.classList.toggle('selected', reqForm.origin === 'external');
    if (detailDiv) detailDiv.style.display = reqForm.origin === 'internal' ? 'block' : 'none';
    // Highlight selected sub-btn
    document.querySelectorAll('.origin-sub-btn').forEach(b => b.classList.remove('selected'));
    if (reqForm.originDetail) {
        document.querySelectorAll('.origin-sub-btn').forEach(b => {
            if (b.textContent.trim() === reqForm.originDetail) b.classList.add('selected');
        });
    }
}

function selectOrigin(type) {
    reqForm.origin = type;
    reqForm.originDetail = null;
    renderOriginSection();
}

function selectOriginDetail(detail) {
    reqForm.originDetail = detail;
    renderOriginSection();
}

// --- Method Checkboxes (multi-select) ---
function renderMethodCheckboxes() {
    const container = document.getElementById('method-radio-group');
    if (!container) return;
    const methods = getTestMethods();
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '8px';
    container.innerHTML = methods.map(m => {
        const checked = reqForm.methods.includes(m);
        return `<label class="method-checkbox-item ${checked ? 'checked' : ''}" onclick="toggleMethod('${m}')">
            <input type="checkbox" ${checked ? 'checked' : ''} onclick="event.stopPropagation();toggleMethod('${m}')">
            ${m}
        </label>`;
    }).join('');
}

// Keep renderMethodRadios as alias for compat
function renderMethodRadios() { renderMethodCheckboxes(); }

function toggleMethod(m) {
    const idx = reqForm.methods.indexOf(m);
    if (idx === -1) reqForm.methods.push(m);
    else reqForm.methods.splice(idx, 1);
    reqForm.method = reqForm.methods.length > 0 ? reqForm.methods.join(', ') : null;
    renderMethodCheckboxes();
}

// Keep selectMethod for any legacy usage
function selectMethod(m) { toggleMethod(m); }

// --- Add to Request List ---
function addToRequestList() {
    // Validations
    if (!reqForm.origin) { showToast('Pilih Asal Contoh terlebih dahulu!', 'error'); return; }
    if (reqForm.origin === 'internal' && !reqForm.originDetail) { showToast('Pilih Sub-Kategori Internal terlebih dahulu!', 'error'); return; }
    if (!reqForm.material) { showToast('Pilih material terlebih dahulu!', 'error'); return; }
    if (reqForm.selectedGroups.size === 0) { showToast('Pilih minimal satu grup parameter uji!', 'error'); return; }
    if (reqForm.methods.length === 0) { showToast('Pilih minimal satu metode standar pengujian!', 'error'); return; }

    const sampleName = document.getElementById('req-sample-name')?.value.trim() || '';
    if (!sampleName) { showToast('Isi Nama/Kode Sampel terlebih dahulu!', 'error'); return; }

    const count = parseInt(document.getElementById('req-sample-count')?.value) || 1;
    const notes = document.getElementById('req-notes')?.value.trim() || '';
    const isSelfService = document.getElementById('req-self-service')?.checked || false;

    // Collect all selected params (from direct params AND subGroups)
    const allParams = [];
    const groupNames = [];
    const subMethods = {};
    const groups = getParamGroups();

    for (const gid of reqForm.selectedGroups) {
        const group = groups.find(g => g.id === gid);
        if (!group) continue;
        groupNames.push(group.name);

        // Direct params
        if (group.params && reqForm.selectedParams[gid]) {
            allParams.push(...Array.from(reqForm.selectedParams[gid]));
        }
        // SubGroup params
        if (group.subGroups) {
            group.subGroups.forEach(sg => {
                if (reqForm.selectedParams[sg.id]) {
                    allParams.push(...Array.from(reqForm.selectedParams[sg.id]));
                }
            });
        }
        if (group.subMethod) {
            const currentSet = reqForm.subMethods[gid];
            if (!currentSet || currentSet.size === 0) {
                showToast(`Pilih minimal satu ${group.subMethod.label}!`, 'error');
                return;
            }
            subMethods[gid] = Array.from(currentSet).join(', ');
        }
    }

    if (allParams.length === 0) { showToast('Pilih minimal satu parameter dalam grup!', 'error'); return; }

    const materialObj = getMaterials().find(m => m.id === reqForm.material)
        || DEFAULT_MATERIALS.find(m => m.id === reqForm.material);

    const entry = {
        id: 'REQ-' + Date.now(),
        origin: reqForm.origin,
        originDetail: reqForm.originDetail,
        sampleName: sampleName,
        material: materialObj ? materialObj.name : reqForm.material,
        materialId: reqForm.material,
        groups: groupNames,
        params: allParams,
        subMethods: { ...subMethods },
        methods: [...reqForm.methods],
        method: reqForm.method,
        sampleCount: count,
        notes: notes,
        selfService: isSelfService
    };

    requestList.push(entry);

    // Reset form
    reqForm.origin = null;
    reqForm.originDetail = null;
    reqForm.material = null;
    reqForm.selectedGroups = new Set();
    reqForm.selectedParams = {};
    reqForm.subMethods = {};
    reqForm.methods = [];
    reqForm.method = null;
    const elCount = document.getElementById('req-sample-count');
    const elName = document.getElementById('req-sample-name');
    const elNotes = document.getElementById('req-notes');
    const elSS = document.getElementById('req-self-service');
    if (elCount) elCount.value = 1;
    if (elName) elName.value = '';
    if (elNotes) elNotes.value = '';
    if (elSS) elSS.checked = false;

    renderRequestForm();
    renderRequestListSidebar();
    showToast('\u2705 Sampel "' + sampleName + '" ditambahkan ke list!', 'success');
}

function removeFromRequestList(index) {
    requestList.splice(index, 1);
    renderRequestListSidebar();
}

function clearRequestList() {
    if (requestList.length === 0) return;
    if (!confirm('Hapus semua sampel dari list?')) return;
    requestList = [];
    renderRequestListSidebar();
}

// --- Render Request List Sidebar ---
function renderRequestListSidebar() {
    const countEl = document.getElementById('req-list-count');
    const itemsEl = document.getElementById('req-list-items');
    const emptyEl = document.getElementById('req-list-empty');
    const summaryEl = document.getElementById('req-list-summary');
    const clearBtn = document.getElementById('req-clear-btn');
    if (!itemsEl) return;

    if (countEl) countEl.textContent = requestList.length;

    if (requestList.length === 0) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (summaryEl) summaryEl.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
        itemsEl.innerHTML = '';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (summaryEl) summaryEl.style.display = 'block';
    if (clearBtn) clearBtn.style.display = '';

    itemsEl.innerHTML = requestList.map((entry, i) => `
        <div class="req-list-item">
            <div class="req-list-item-header">
                <div>
                    <strong style="white-space: pre-wrap; display: block; margin-bottom: 4px;">${entry.sampleName}</strong>
                    <span style="font-size:0.72rem;color:var(--text-light);margin-left:4px;">(${entry.material})</span>
                </div>
                <button class="req-list-item-remove" onclick="removeFromRequestList(${i})" title="Hapus">&times;</button>
            </div>
            <div class="req-list-item-meta">
                <span>📦 ${entry.sampleCount} sampel &nbsp;|&nbsp; 📐 ${entry.method}</span>
                <span>📊 ${entry.groups.join(', ')}</span>
                ${Object.entries(entry.subMethods||{}).map(([k,v]) => v.split(', ').map(item => `<span style="color:var(--info-color);font-size:0.72rem;margin-right:6px;">⚙️ ${item}</span>`).join('')).join('')}
                ${entry.notes ? `<span>📝 ${entry.notes}</span>` : ''}
            </div>
            <div class="req-list-item-params">
                ${entry.params.slice(0,6).map(p => `<span class="req-list-param-chip">${p}</span>`).join('')}
                ${entry.params.length > 6 ? `<span class="req-list-param-chip">+${entry.params.length-6} lagi</span>` : ''}
            </div>
        </div>
    `).join('');

    // Summary
    const totalSamples = requestList.reduce((s, e) => s + e.sampleCount, 0);
    const totalParams = requestList.reduce((s, e) => s + e.params.length, 0);
    const samplesEl = document.getElementById('req-summary-samples');
    const paramsEl = document.getElementById('req-summary-params');
    if (samplesEl) samplesEl.textContent = totalSamples + ' Sampel';
    if (paramsEl) paramsEl.textContent = totalParams + ' Parameter';
}

// --- Submit from Form ---
function submitRequestFromForm() {
    if (requestList.length === 0) { showToast('List sampel masih kosong!', 'error'); return; }

    const now = new Date();
    const id = 'TKT-' + now.getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000);
    const dateStr = now.toISOString().split('T')[0];

    // Gather unique test group names
    const tests = [];
    requestList.forEach(e => { e.groups.forEach(g => { if (!tests.includes(g)) tests.push(g); }); });

    // Build samples with full detail
    const samples = requestList.map(e => ({
        name: e.sampleName,
        origin: e.origin || null,
        originDetail: e.originDetail || null,
        material: e.material,
        count: e.sampleCount,
        params: e.params,
        groups: e.groups,
        methods: e.methods || (e.method ? [e.method] : []),
        method: e.method,
        subMethods: e.subMethods || {},
        notes: e.notes || '',
        selfService: e.selfService || false
    }));

    const ticket = {
        id, date: dateStr,
        requester: currentSession.name, requesterId: currentSession.id,
        status: 'Baru', tests, samples,
        totalCost: 0,
        expDuration: '6 Bulan',
        timeline: { ordered: dateStr, received:null, testing:null, approved:null, completed:null }
    };

    const tickets = getTickets();
    tickets.unshift(ticket);
    saveTickets(tickets);

    requestList = [];
    renderRequestListSidebar();
    renderTicketsTable();
    updateKPI();

    showToast('✅ Permintaan uji berhasil dikirim! ID: ' + id, 'success');
    openLabelModal(ticket);
    switchScreen('requests');
}

// ============================================================
// SECTION 10: REQUESTS TABLE (User View)
// ============================================================

let currentTicketModalId = null;

function filterTicketsTable() {
    renderTicketsTable();
}

function renderTicketsTable() {
    const tbody = document.getElementById('tickets-table-body');
    if (!tbody) return;

    const role = getRole();
    let tickets = getTickets();

    // Users only see their own tickets
    if (role === 'user') tickets = tickets.filter(t => t.requesterId === currentSession.id);

    const search = document.getElementById('ticket-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('ticket-status-filter')?.value || 'all';
    const startVal = document.getElementById('ticket-date-start')?.value;
    const endVal = document.getElementById('ticket-date-end')?.value;

    if (search) tickets = tickets.filter(t => t.id.toLowerCase().includes(search) || t.requester.toLowerCase().includes(search));
    if (statusFilter !== 'all') tickets = tickets.filter(t => t.status === statusFilter);
    if (startVal) tickets = tickets.filter(t => t.date >= startVal);
    if (endVal) tickets = tickets.filter(t => t.date <= endVal);

    const results = getResults();

    tbody.innerHTML = tickets.map(t => {
        const statusBadge = getStatusBadge(t.status);
        const result = results[t.id];
        // Show sample names (new format) or test groups (legacy)
        const sampleNames = t.samples && t.samples.length > 0
            ? t.samples.map(s => s.name).join(', ')
            : t.tests.join(', ');
        const displayText = sampleNames.length > 60 ? sampleNames.substring(0,60) + '...' : sampleNames;
        const totalSamples = t.samples ? t.samples.reduce((s,sp) => s+(sp.count||1), 0) : '-';
        // Show parameter groups
        const groupsDisplay = t.tests && t.tests.length > 0 ? t.tests.join(' / ') : '-';
        const isSelfService = t.samples && t.samples.length > 0 && t.samples.every(s => s.selfService);
        const selfServiceBadge = isSelfService ? ' <span class="badge badge-warning" style="font-size:0.65rem;">Self Service</span>' : '';

        let actionBtns = `<button class="btn-info" onclick="openTicketModal('${t.id}')">🔍 Detail</button>`;

        if (role === 'user' || role === 'admin') {
            if (t.status === 'Selesai' && result && result.status === 'approved') {
                actionBtns += ` <button class="btn-success" onclick="downloadPDF('${t.id}')">📥 Download</button>`;
            } else if (t.status === 'Menunggu Approval' || (t.status === 'Selesai' && !isSelfService)) {
                actionBtns += ` <button class="btn btn-outline btn-sm" disabled title="Menunggu Approval">📥 Download</button>`;
            }
        }

        const expDur = t.expDuration || '6 Bulan';
        const expDate = calculateExpDate(t.date, expDur);
        const expDateFormatted = formatDate(expDate);
        const expSelectHtml = `
            <div style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem;">
                <select class="chem-input" style="padding:2px 4px; font-size:0.75rem; min-width:85px; margin:0;" onchange="changeTicketExpDuration('${t.id}', this.value)">
                    <option value="1 Bulan" ${expDur === '1 Bulan' ? 'selected' : ''}>1 Bulan</option>
                    <option value="3 Bulan" ${expDur === '3 Bulan' ? 'selected' : ''}>3 Bulan</option>
                    <option value="6 Bulan" ${expDur === '6 Bulan' ? 'selected' : ''}>6 Bulan</option>
                    <option value="12 Bulan" ${expDur === '12 Bulan' ? 'selected' : ''}>12 Bulan</option>
                </select>
                <span style="font-size:0.7rem; color:var(--text-secondary); text-align:center;">${expDateFormatted}</span>
            </div>
        `;

        return `<tr>
            <td><code style="color:var(--primary-color);font-weight:600;">${t.id}</code>${selfServiceBadge}</td>
            <td>${formatDate(t.date)}</td>
            <td style="text-align:center;">${totalSamples}</td>
            <td style="font-size:0.8rem;max-width:200px;white-space:pre-wrap;">
                <div style="font-weight:500;">${displayText}</div>
                <div style="font-size:0.72rem;color:var(--text-light);">${groupsDisplay}</div>
            </td>
            <td>${expSelectHtml}</td>
            <td>${statusBadge}</td>
            <td style="font-size:0.8rem;color:var(--text-secondary);max-width:150px;white-space:normal;word-break:break-word;">
                ${t.labRemarks || '-'}
            </td>
            <td><div class="action-btns">${actionBtns}</div></td>
        </tr>`;
    }).join('');
}

// ============================================================
// SECTION 11: ADMIN/OPERATOR/MANAGER TABLE
// ============================================================

function filterAdminTable() { renderAdminTable(); }

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    const role = getRole();
    let tickets = getTickets();

    const search = document.getElementById('admin-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('admin-status-filter')?.value || 'all';
    const startVal = document.getElementById('admin-date-start')?.value;
    const endVal = document.getElementById('admin-date-end')?.value;

    if (search) tickets = tickets.filter(t => t.id.toLowerCase().includes(search) || t.requester.toLowerCase().includes(search));
    if (statusFilter !== 'all') tickets = tickets.filter(t => t.status === statusFilter);
    if (startVal) tickets = tickets.filter(t => t.date >= startVal);
    if (endVal) tickets = tickets.filter(t => t.date <= endVal);

    const results = getResults();

    if (tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-light);">Tidak ada tiket.</td></tr>';
        return;
    }

    tbody.innerHTML = tickets.map(t => {
        const statusBadge = getStatusBadge(t.status);
        // Show sample names (new format) or test groups (legacy)
        const sampleNames = t.samples && t.samples.length > 0
            ? t.samples.map(s => s.name).join(', ')
            : t.tests.join(', ');
        const displayText = sampleNames.length > 50 ? sampleNames.substring(0,50) + '...' : sampleNames;
        const groupsDisplay = t.tests && t.tests.length > 0 ? t.tests.join(' / ') : '-';
        const totalSamples = t.samples ? t.samples.reduce((s,sp) => s+(sp.count||1), 0) : '-';
        const result = results[t.id];
        const isSelfService = t.samples && t.samples.length > 0 && t.samples.every(s => s.selfService);
        const selfServiceBadge = isSelfService ? ' <span class="badge badge-warning" style="font-size:0.65rem;">Self Service</span>' : '';

        let actionBtns = `<button class="btn-info" onclick="openTicketModal('${t.id}')">🔍 Detail</button>`;

        // Operator / Admin actions
        if (role === 'operator' || role === 'admin') {
            if (t.status === 'Disetujui Admin' && role === 'admin') {
                actionBtns += ` <button class="btn-success" onclick="handoverSample('${t.id}')">🤝 Serah Terima</button>`;
            }
            if (t.status === 'Sampel Diterima') {
                actionBtns += ` <button class="btn-warning" onclick="moveToProcess('${t.id}')">▶ Proses</button>`;
            }
            if (t.status === 'Diproses') {
                if (isSelfService) {
                    actionBtns += ` <button class="btn-success" onclick="completeSelfServiceTicket('${t.id}')">✓ Selesaikan</button>`;
                } else {
                    const rejectInfo = result && result.status === 'rejected' ? ` <span style="font-size:0.72rem;color:#dc2626;" title="${result.rejectNote||''}">⚠️ Ditolak - Upload ulang</span>` : '';
                    actionBtns += ` <button class="btn-purple" onclick="uploadPDF('${t.id}')">📤 Upload Hasil</button>${rejectInfo}`;
                }
            }
            if (t.status === 'Menunggu Approval' && result) {
                actionBtns += ` <button class="btn btn-outline btn-sm" onclick="viewPDF('${t.id}', false)">👁️ Lihat Hasil</button>`;
            }
        }

        // Admin Approve/Reject for NEW tickets (before processing)
        if (role === 'admin') {
            if (t.status === 'Baru') {
                actionBtns += ` <button class="btn-approve" onclick="adminApproveTicket('${t.id}')">✅ Setujui</button>`;
                actionBtns += ` <button class="btn-reject" onclick="adminRejectTicket('${t.id}')">❌ Tolak</button>`;
            }
        }

        // Manager / Admin actions
        if (role === 'manager' || role === 'admin') {
            if (t.status === 'Menunggu Approval' && result && result.status === 'pending') {
                actionBtns += ` <button class="btn-success" onclick="viewPDF('${t.id}', true)">✅ Review Hasil</button>`;
            }
            if (t.status === 'Selesai' && result && result.status === 'approved') {
                actionBtns += ` <button class="btn btn-outline btn-sm" onclick="viewPDF('${t.id}', false)">👁️ Lihat Hasil</button>`;
                actionBtns += ` <button class="btn-success" onclick="downloadPDF('${t.id}')">📥 Download</button>`;
            }
        }

        const canEditRemarks = role === 'admin' || role === 'operator';
        const remarksDisplay = t.labRemarks || '-';
        const remarksHtml = canEditRemarks
            ? `<div style="display:flex;align-items:center;gap:6px;">
                 <span style="font-size:0.8rem;color:var(--text-secondary);max-width:120px;white-space:normal;word-break:break-word;">${remarksDisplay}</span>
                 <button onclick="editLabRemarks('${t.id}')" title="Edit Keterangan Lab" style="background:none;border:none;cursor:pointer;font-size:0.85rem;padding:2px;flex-shrink:0;">✏️</button>
               </div>`
            : `<span style="font-size:0.8rem;color:var(--text-secondary);max-width:140px;white-space:normal;word-break:break-word;">${remarksDisplay}</span>`;

        const expDur = t.expDuration || '6 Bulan';
        const expDate = calculateExpDate(t.date, expDur);
        const expDateFormatted = formatDate(expDate);
        const expSelectHtml = `
            <div style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem;">
                <select class="chem-input" style="padding:2px 4px; font-size:0.75rem; min-width:85px; margin:0;" onchange="changeTicketExpDuration('${t.id}', this.value)">
                    <option value="1 Bulan" ${expDur === '1 Bulan' ? 'selected' : ''}>1 Bulan</option>
                    <option value="3 Bulan" ${expDur === '3 Bulan' ? 'selected' : ''}>3 Bulan</option>
                    <option value="6 Bulan" ${expDur === '6 Bulan' ? 'selected' : ''}>6 Bulan</option>
                    <option value="12 Bulan" ${expDur === '12 Bulan' ? 'selected' : ''}>12 Bulan</option>
                </select>
                <span style="font-size:0.7rem; color:var(--text-secondary); text-align:center;">${expDateFormatted}</span>
            </div>
        `;

        return `<tr>
            <td><code style="color:var(--primary-color);font-weight:600;">${t.id}</code>${selfServiceBadge}</td>
            <td>${t.requester}</td>
            <td>${formatDate(t.date)}</td>
            <td style="font-size:0.8rem;max-width:180px;white-space:pre-wrap;">
                <div style="font-weight:500;">${displayText}</div>
                <div style="font-size:0.72rem;color:var(--text-light);">${groupsDisplay}</div>
            </td>
            <td style="text-align:center;">${totalSamples}</td>
            <td>${expSelectHtml}</td>
            <td>${statusBadge}</td>
            <td>${remarksHtml}</td>
            <td><div class="action-btns">${actionBtns}</div></td>
        </tr>`;
    }).join('');
}

let currentKajiUlangTicketId = null;

function adminApproveTicket(ticketId) {
    const tickets = getTickets();
    const t = tickets.find(tk => tk.id === ticketId);
    if (!t) return;
    
    currentKajiUlangTicketId = ticketId;
    
    document.getElementById('kaji-ulang-sub').textContent = 'ID Tiket: ' + ticketId + ' | Pengaju: ' + t.requester;
    
    let paramsList = [];
    if (t.samples) {
        t.samples.forEach(s => {
            if (s.params) paramsList.push(...s.params);
        });
    } else {
        paramsList = t.tests || [];
    }
    paramsList = [...new Set(paramsList)];
    
    const tbody = document.getElementById('kaji-ulang-tbody');
    tbody.innerHTML = paramsList.map((p, idx) => `
        <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td><strong class="ku-param-name">${p}</strong></td>
            <td>
                <select class="form-field-group ku-param-status" style="padding:4px; border-radius:4px; font-size:0.875rem;">
                    <option value="Diterima" selected>✅ Diterima (Bisa)</option>
                    <option value="Ditolak">❌ Ditolak (Tidak Bisa)</option>
                </select>
            </td>
            <td>
                <input type="text" class="form-field-group ku-param-note" placeholder="Catatan (Opsional)..." style="width:100%; padding:4px 8px; border:1px solid var(--border-color); border-radius:4px; font-size:0.875rem;">
            </td>
        </tr>
    `).join('');
    
    openModal('kaji-ulang-modal');
}

function saveKajiUlangAndApprove() {
    if (!currentKajiUlangTicketId) return;
    const tickets = getTickets();
    const idx = tickets.findIndex(t => t.id === currentKajiUlangTicketId);
    if (idx === -1) return;
    
    const tbody = document.getElementById('kaji-ulang-tbody');
    const rows = tbody.querySelectorAll('tr');
    
    const kajiUlangData = [];
    rows.forEach(tr => {
        const param = tr.querySelector('.ku-param-name').textContent;
        const status = tr.querySelector('.ku-param-status').value;
        const note = tr.querySelector('.ku-param-note').value.trim();
        kajiUlangData.push({ param, status, note });
    });
    
    tickets[idx].kajiUlang = kajiUlangData;
    tickets[idx].approvedByAdmin = currentSession.username;
    tickets[idx].approvedByAdminName = currentSession.name;
    tickets[idx].adminApprovedAt = new Date().toISOString();
    saveTickets(tickets);
    
    updateTicketStatus(currentKajiUlangTicketId, 'Disetujui Admin');
    closeModal('kaji-ulang-modal');
    renderAdminTable();
    renderTicketsTable();
    updateKPI();
    refreshDashboard();
    
    showToast('✅ Permintaan telah dikaji ulang dan disetujui.', 'success');
}

function printKajiUlang(ticketId) {
    const tickets = getTickets();
    const t = tickets.find(tk => tk.id === ticketId);
    if (!t) return;

    const dateStr = formatDate(t.date);
    const asalContoh = t.samples && t.samples[0] && t.samples[0].origin ? t.samples[0].origin + (t.samples[0].originDetail ? ' - ' + t.samples[0].originDetail : '') : '-';
    const kodeContoh = t.id;
    const jenisContoh = t.samples && t.samples[0] ? t.samples[0].material : '-';
    
    let methods = [];
    if (t.samples) {
        t.samples.forEach(s => {
            if (s.methods) methods.push(...s.methods);
            else if (s.method) methods.push(s.method);
        });
    }
    methods = [...new Set(methods)].join(', ') || '-';

    let tbodyHtml = '';
    const kuData = t.kajiUlang || [];
    
    if (kuData.length > 0) {
        kuData.forEach((item, idx) => {
            const isOk = (item.status || 'Diterima') === 'Diterima';
            const statusMark = isOk ? '✔️' : '❌';
            const statusText = item.status || 'Diterima';
            const noteText = item.note ? `${statusText} - ${item.note}` : statusText;
            tbodyHtml += `
                <tr>
                    <td style="text-align:center;border:1px solid #000;padding:8px;">${idx + 1}</td>
                    <td style="border:1px solid #000;padding:8px;">${item.param}</td>
                    <td style="border:1px solid #000;padding:8px;text-align:center;font-size:1.1rem;">${statusMark}</td>
                    <td style="border:1px solid #000;padding:8px;">${noteText}</td>
                </tr>
            `;
        });
    } else {
        // Fallback for tickets without kajiUlang data
        let paramsList = [];
        if (t.samples) t.samples.forEach(s => { if(s.params) paramsList.push(...s.params); });
        else paramsList = t.tests || [];
        paramsList = [...new Set(paramsList)];
        
        paramsList.forEach((p, idx) => {
            tbodyHtml += `
                <tr>
                    <td style="text-align:center;border:1px solid #000;padding:8px;">${idx + 1}</td>
                    <td style="border:1px solid #000;padding:8px;">${p}</td>
                    <td style="border:1px solid #000;padding:8px;text-align:center;font-size:1.1rem;">✔️</td>
                    <td style="border:1px solid #000;padding:8px;">Diterima</td>
                </tr>
            `;
        });
    }

    // QR Code for Requester Signature
    const reqDate = formatDate(t.date);
    const reqBarcodeData = encodeURIComponent(`TICKET:${t.id}|REQUEST|BY:${t.requester}|DATE:${reqDate}`);
    const reqQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${reqBarcodeData}`;
    const reqQrHtml = `
        <img src="${reqQrUrl}" alt="QR Signature Requester" style="margin: 10px 0;">
        <p style="font-size:12px;">Diajukan secara digital oleh:<br><strong>${t.requester}</strong><br>${reqDate}</p>
    `;

    // QR Code for Admin Approval
    let qrHtml = '<br><br><br><p>( ................................ )</p>';
    if (t.approvedByAdmin && t.adminApprovedAt) {
        const approvedDate = formatDate(t.adminApprovedAt);
        const barcodeData = encodeURIComponent(`TICKET:${t.id}|KAJI_ULANG|APPROVED:${approvedDate}|BY:${t.approvedByAdmin}`);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${barcodeData}`;
        qrHtml = `
            <img src="${qrUrl}" alt="QR Signature" style="margin: 10px 0;">
            <p style="font-size:12px;">Disetujui secara digital oleh:<br><strong>${t.approvedByAdminName || t.approvedByAdmin}</strong><br>${approvedDate}</p>
        `;
    }

    const html = `
    <html>
    <head>
        <title>Form Kaji Ulang - ${ticketId}</title>
        <style>
            body { font-family: "Times New Roman", Times, serif; padding: 40px; }
            .header-title { text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 30px; }
            .info-table { border-collapse: collapse; margin-bottom: 20px; font-size: 16px; }
            .info-table td { padding: 4px 8px 4px 0; }
            .main-table { width: 100%; border-collapse: collapse; font-size: 16px; margin-bottom: 40px; }
            .main-table th { border: 1px solid #000; padding: 8px; font-weight: bold; }
            @media print {
                @page { margin: 20mm; }
                body { padding: 0; }
            }
        </style>
    </head>
    <body onload="setTimeout(() => window.print(), 500)">
        <div class="header-title">FORM CHEKLIST KAJI ULANG PERMINTAAN PENGUJIAN</div>
        
        <table class="info-table">
            <tr><td width="150">Hari/Tanggal</td><td width="20">:</td><td>${dateStr}</td></tr>
            <tr><td>Asal Contoh</td><td>:</td><td>${asalContoh}</td></tr>
            <tr><td>Kode Contoh</td><td>:</td><td>${kodeContoh}</td></tr>
            <tr><td>Jenis Contoh</td><td>:</td><td>${jenisContoh}</td></tr>
            <tr><td>Nama / Kode Sampel</td><td>:</td><td style="white-space: pre-wrap;">${t.samples && t.samples.length > 0 ? t.samples.map(s => s.name).join(', ') : '-'}</td></tr>
            <tr><td>Standar/Metode</td><td>:</td><td>${methods}</td></tr>
        </table>

        <table class="main-table">
            <thead>
                <tr>
                    <th width="50">No</th>
                    <th>JENIS PENGUJIAN / PARAMETER</th>
                    <th width="150">STATUS</th>
                    <th width="200">KETERANGAN</th>
                </tr>
            </thead>
            <tbody>
                ${tbodyHtml}
            </tbody>
        </table>
        
        <div style="margin-top:50px;display:flex;justify-content:space-between;text-align:center;">
            <div style="width:200px;">
                <p>Pengaju</p>
                ${reqQrHtml}
            </div>
            <div style="width:200px;">
                <p>Penyelia Laboratorium / Admin</p>
                ${qrHtml}
            </div>
        </div>
    </body>
    </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    } else {
        alert('Browser memblokir popup. Harap izinkan popup untuk mencetak form.');
    }
}

function adminRejectTicket(ticketId) {
    const reason = prompt('Masukkan alasan penolakan (opsional):');
    if (reason === null) return; // user pressed cancel
    const tickets = getTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
        tickets[idx].status = 'Ditolak Admin';
        tickets[idx].rejectReason = reason;
        tickets[idx].rejectedAt = new Date().toISOString().split('T')[0];
        saveTickets(tickets);
    }
    renderAdminTable();
    renderTicketsTable();
    updateKPI();
    refreshDashboard();
    showToast('❌ Permintaan pengujian ditolak.', 'warning');
}

function handoverSample(ticketId) {
    if (!confirm('Lakukan serah terima sampel ke operator untuk diuji?')) return;
    updateTicketStatus(ticketId, 'Sampel Diterima');
    renderAdminTable();
    renderTicketsTable();
    updateKPI();
    refreshDashboard();
    showToast('🤝 Sampel telah diserahterimakan ke operator.', 'success');
}

function moveToProcess(ticketId) {
    if (!confirm('Mulai proses pengujian untuk sampel ini?')) return;
    updateTicketStatus(ticketId, 'Diproses');
    renderAdminTable();
    renderTicketsTable();
    updateKPI();
    showToast('Status tiket diupdate: Sedang Diproses', 'success');
}

function completeSelfServiceTicket(ticketId) {
    if (!confirm('Selesaikan pengujian mandiri (Self Service) ini? Tiket akan langsung ditandai Selesai tanpa laporan PDF.')) return;
    updateTicketStatus(ticketId, 'Selesai');
    renderAdminTable();
    renderTicketsTable();
    updateKPI();
    showToast('Tiket Self Service selesai.', 'success');
}

// ============================================================
// SECTION 12: TICKET DETAIL MODAL
// ============================================================

function openTicketModal(ticketId) {
    const tickets = getTickets();
    const t = tickets.find(tk => tk.id === ticketId);
    if (!t) return;
    currentTicketModalId = ticketId;

    const results = getResults();
    const result = results[ticketId];

    document.getElementById('modal-ticket-id').textContent = 'Detail Tiket — ' + t.id;
    document.getElementById('modal-ticket-date').textContent = formatDate(t.date);
    document.getElementById('modal-requester-name').textContent = t.requester;
    document.getElementById('modal-status').innerHTML = getStatusBadge(t.status);
    document.getElementById('modal-tat').textContent = t.tests.length + ' grup pengujian';
    document.getElementById('modal-est-complete').textContent = t.timeline.completed ? formatDate(t.timeline.completed) : 'Sedang diproses...';

    // Timeline
    const steps = ['ordered','received','testing','approved','completed'];
    steps.forEach(step => {
        const stepEl = document.getElementById('step-' + step);
        const timeEl = document.getElementById('time-' + step);
        const date = t.timeline[step];
        if (stepEl) stepEl.classList.toggle('completed', !!date);
        if (timeEl) timeEl.textContent = date ? formatDate(date) : '—';
    });

    // Samples — enhanced view for new ticket format
    const samplesHtml = (t.samples || []).map((s, idx) => {
        const hasNewFormat = Array.isArray(s.params);
        if (hasNewFormat) {
            const subMethHtml = Object.entries(s.subMethods||{}).map(([k,v]) =>
                v.split(', ').map(item => `<span class="req-list-param-chip" style="background:var(--info-light,#e0f2fe);color:var(--info-color);">⚙️ ${item}</span>`).join('')
            ).join('');
            return `
            <div class="modal-sample-card">
                <div class="modal-sample-header">
                    <div>
                        <span class="modal-sample-num">#${idx+1}</span>
                        <strong class="modal-sample-name" style="white-space: pre-wrap;">${s.name}</strong>
                        <span class="badge badge-neutral" style="font-size:0.68rem;margin-left:6px;">${s.material||''}</span>
                        ${s.origin ? `<span class="badge" style="font-size:0.65rem;margin-left:4px;background:var(--info-light);color:var(--info-color);">🏷️ ${s.origin === 'internal' && s.originDetail ? s.originDetail : s.origin}</span>` : ''}
                    </div>
                    <div style="display:flex;gap:6px;align-items:center;">
                        ${s.selfService ? '<span class="badge badge-warning">Self Service</span>' : ''}
                        <span class="badge badge-info">${s.count} Sampel</span>
                        <span class="badge badge-neutral">${Array.isArray(s.methods) && s.methods.length > 0 ? s.methods.join(', ') : (s.method||'')}</span>
                    </div>
                </div>
                <div class="modal-sample-params">
                    ${(s.params||[]).map(p => `<span class="req-list-param-chip">${p}</span>`).join('')}
                    ${subMethHtml}
                </div>
                ${s.notes ? `<div style="font-size:0.76rem;color:var(--text-secondary);margin-top:6px;">📝 ${s.notes}</div>` : ''}
            </div>`;

        }
        // Legacy format
        return `<div class="sample-row"><span class="sample-name">📦 ${s.name}</span><span class="sample-count">${s.count} Sampel</span></div>`;
    }).join('');
    document.getElementById('modal-samples-list').innerHTML = samplesHtml || '<p style="color:var(--text-light)">Tidak ada data sampel.</p>';

    // Lab Remarks
    const remarksEl = document.getElementById('modal-lab-remarks');
    if (remarksEl) {
        remarksEl.textContent = t.labRemarks || 'Tidak ada keterangan lab.';
    }

    // Approval buttons in Detail Modal
    const approvalDetailBtns = document.getElementById('modal-detail-approval-btns');
    if (approvalDetailBtns) {
        const canApprove = can('approve') && t.status === 'Menunggu Approval' && result && result.status === 'pending';
        approvalDetailBtns.style.display = canApprove ? 'flex' : 'none';
    }

    // Download button
    const dlBtn = document.getElementById('modal-download-btn');
    const certBtn = document.getElementById('modal-cert-btn');
    if (dlBtn) {
        const canDownload = result && result.status === 'approved' && (can('download'));
        dlBtn.classList.toggle('hidden', !canDownload);
        if (certBtn) certBtn.classList.toggle('hidden', !canDownload);
    }
    
    // Kaji Ulang Form button
    const kajiUlangBtn = document.getElementById('modal-kaji-ulang-btn');
    if (kajiUlangBtn) {
        const canPrintKajiUlang = can('approve') || (role === 'admin') || (role === 'operator');
        const isApproved = t.status !== 'Baru' && t.status !== 'Ditolak Admin';
        kajiUlangBtn.classList.toggle('hidden', !(canPrintKajiUlang && isApproved));
    }

    openModal('ticket-modal');
}

// ============================================================
// SECTION 13: LABEL MODAL
// ============================================================

let currentLabelTicket = null;

function openLabelModal(ticket) {
    currentLabelTicket = ticket;
    const body = document.getElementById('label-print-body');
    if (!body) return;

    const now = new Date().toLocaleDateString('id-ID', {day:'2-digit',month:'long',year:'numeric'});
    body.innerHTML = `
        <div style="text-align:center;padding:16px;border:2px solid #000;border-radius:8px;font-family:monospace;">
            <div style="font-size:1.2rem;font-weight:700;margin-bottom:6px;">🧪 SPECTRA LMS</div>
            <div style="font-size:1.5rem;font-weight:800;letter-spacing:2px;margin:8px 0;">${ticket.id}</div>
            <div style="font-size:0.8rem;margin-bottom:8px;">Pengaju: ${ticket.requester}</div>
            <div style="font-size:0.8rem;margin-bottom:8px;">Tanggal: ${now}</div>
            <div style="border-top:1px dashed #000;margin:8px 0;padding-top:8px;font-size:0.75rem;">
                ${ticket.samples.map(s=>`${s.name} (${s.count} sampel)`).join('<br>')}
            </div>
            <div style="font-size:0.7rem;color:#555;">Scan atau ketik ID di portal SPECTRA</div>
        </div>
    `;
    openModal('label-modal');
}

function printSampleLabel() { window.print(); }

// ============================================================
// SECTION 14: KPI & CHARTS
// ============================================================

function updateKPI() {
    const role = getRole();
    let tickets = getTickets();
    if (role === 'user') tickets = tickets.filter(t => t.requesterId === currentSession.id);

    const total = tickets.length;
    const baru = tickets.filter(t => t.status === 'Baru').length;
    const diproses = tickets.filter(t => t.status === 'Disetujui Admin' || t.status === 'Sampel Diterima' || t.status === 'Diproses' || t.status === 'Menunggu Approval').length;
    const selesai = tickets.filter(t => t.status === 'Selesai').length;
    const totalSamples = tickets.reduce((s,t) => s + (t.samples||[]).reduce((ss,sp)=>ss+(sp.count||1),0), 0);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val.toLocaleString('id-ID'); };
    set('kpi-total-samples', totalSamples);
    set('kpi-new-requests', baru);
    set('kpi-processing', diproses);
    set('kpi-completed', selesai);
    set('kpi-total-tickets', total);

    drawBarChart();
    drawDonutChart();
}

function drawBarChart() {
    const container = document.getElementById('bar-chart-container');
    if (!container) return;
    const tickets = getRole() === 'user' ? getTickets().filter(t => t.requesterId === currentSession.id) : getTickets();

    const data = { kimia:0, mineral:0, fisik:0, batubara:0 };
    tickets.forEach(t => {
        (t.tests||[]).forEach(testId => {
            const item = getCatalogData().find(c => c.id === testId);
            if (item && data[item.category] !== undefined) data[item.category]++;
        });
    });

    const labels = { kimia:'Kimia', mineral:'Mineralogi', fisik:'Fisik', batubara:'Batubara' };
    const colors = { kimia:'#be123c', mineral:'#7c3aed', fisik:'#0284c7', batubara:'#d97706' };
    const maxVal = Math.max(...Object.values(data), 1);
    const barWidth = 60, barGap = 30, svgW = Object.keys(data).length * (barWidth + barGap) + barGap;
    const svgH = 200, chartH = 150, baseLine = svgH - 30;

    let bars = '';
    Object.entries(data).forEach(([key, val], i) => {
        const x = i * (barWidth + barGap) + barGap;
        const bh = (val / maxVal) * chartH;
        const y = baseLine - bh;
        bars += `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${bh}" rx="6" fill="${colors[key]}" opacity="0.85"/>
            <text x="${x+barWidth/2}" y="${y-6}" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${val}</text>
            <text x="${x+barWidth/2}" y="${baseLine+16}" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.6">${labels[key]}</text>`;
    });

    container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" style="width:100%;color:var(--text-primary);">${bars}<line x1="0" y1="${baseLine}" x2="${svgW}" y2="${baseLine}" stroke="currentColor" stroke-width="1" opacity="0.2"/></svg>`;
}

function drawDonutChart() {
    const container = document.getElementById('donut-chart-container');
    if (!container) return;
    const tickets = getRole() === 'user' ? getTickets().filter(t => t.requesterId === currentSession.id) : getTickets();

    const baru = tickets.filter(t=>t.status==='Baru').length;
    const diproses = tickets.filter(t=>t.status==='Disetujui Admin' || t.status==='Sampel Diterima' || t.status==='Diproses').length;
    const approval = tickets.filter(t=>t.status==='Menunggu Approval').length;
    const selesai = tickets.filter(t=>t.status==='Selesai').length;
    const total = baru + diproses + approval + selesai || 1;

    const segments = [
        { val: baru,     color:'#0284c7', label:'Baru' },
        { val: diproses, color:'#d97706', label:'Diproses' },
        { val: approval, color:'#7c3aed', label:'Menunggu Approval' },
        { val: selesai,  color:'#059669', label:'Selesai' },
    ];

    const cx=100, cy=100, r=70, ir=45;
    let startAngle = -Math.PI/2;
    let paths = '';
    segments.forEach(seg => {
        const angle = (seg.val/total) * 2 * Math.PI;
        if (angle === 0) return;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const endAngle = startAngle + angle;
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const ix1 = cx + ir * Math.cos(startAngle);
        const iy1 = cy + ir * Math.sin(startAngle);
        const ix2 = cx + ir * Math.cos(endAngle);
        const iy2 = cy + ir * Math.sin(endAngle);
        const large = angle > Math.PI ? 1 : 0;
        paths += `<path d="M${ix1},${iy1} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${ir},${ir} 0 ${large},0 ${ix1},${iy1}" fill="${seg.color}" opacity="0.85"/>`;
        startAngle = endAngle;
    });

    const legend = segments.filter(s=>s.val>0).map(s =>
        `<div style="display:flex;align-items:center;gap:6px;font-size:11px;"><div style="width:10px;height:10px;border-radius:50%;background:${s.color};flex-shrink:0;"></div>${s.label}: <b>${s.val}</b></div>`
    ).join('');

    container.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <svg viewBox="0 0 200 200" style="width:160px;min-width:140px;">
                ${paths}
                <text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">${total}</text>
                <text x="${cx}" y="${cy+14}" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">Total Tiket</text>
            </svg>
            <div style="display:flex;flex-direction:column;gap:8px;">${legend}</div>
        </div>`;
}

// ============================================================
// SECTION 15: SCREEN MANAGEMENT & RBAC
// ============================================================

function setupRBAC() {
    const role = getRole();

    const navConfig = {
        'nav-catalog': ['admin','user'],
        'nav-cart':    ['admin','user'],
        'nav-requests':['admin','user','operator','manager'],
        'nav-admin':   ['admin','operator','manager'],
        'nav-config':  ['admin'],
    };

    Object.entries(navConfig).forEach(([id, roles]) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', !roles.includes(role));
    });

    // Update sidebar profile
    document.getElementById('user-avatar').textContent = currentSession.avatar || 'U';
    document.getElementById('user-name').textContent = currentSession.name;
    const roleBadge = document.getElementById('user-role-badge');
    if (roleBadge) { roleBadge.textContent = role.charAt(0).toUpperCase()+role.slice(1); roleBadge.className = 'role-badge-sidebar ' + role; }

    // Change "Riwayat & Tracker" text for User role
    const navRequestsSpan = document.querySelector('#nav-requests span');
    if (navRequestsSpan) {
        navRequestsSpan.textContent = (role === 'user') ? 'Riwayat Saya' : 'Riwayat & Tracker';
    }

    // Update greeting
    const greeting = document.getElementById('welcome-greeting');
    if (greeting) {
        const hour = new Date().getHours();
        const greetWord = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';
        greeting.textContent = `${greetWord}, ${currentSession.name}`;
    }

    // Hide new request btn for operator/manager
    const newReqBtn = document.getElementById('new-request-btn');
    if (newReqBtn) newReqBtn.style.display = can('cart') ? '' : 'none';

    // Panel description
    const panelDesc = document.getElementById('panel-role-desc');
    if (panelDesc) {
        const descs = { operator:'Update status pengujian dan upload hasil analisa (PDF).', manager:'Review dan approve hasil pengujian yang diupload operator.', admin:'Kelola semua tiket, update status, upload PDF, dan approve hasil uji.' };
        panelDesc.textContent = descs[role] || descs.admin;
    }

    // Default screen per role
    const defaultScreen = { admin:'dashboard', user:'dashboard', operator:'admin', manager:'admin' };
    switchScreen(defaultScreen[role] || 'dashboard');
}

function switchScreen(screen) {
    const screens = ['dashboard','cart','requests','admin','config'];
    const titles = {
        dashboard: ['Dashboard SPECTRA','Ringkasan dan statistik pengujian laboratorium'],
        cart:    ['Permintaan Uji Baru','Isi formulir pengajuan dan tambahkan sampel ke list'],
        requests:['Riwayat & Tracker Pengujian','Pantau status dan unduh laporan hasil uji'],
        admin:   ['Panel Manajemen Pengujian','Kelola sampel masuk dan update status pengujian'],
        config:  ['Konfigurasi Sistem','Pengaturan user, katalog, dan parameter pengujian'],
    };

    screens.forEach(s => {
        const panel = document.getElementById('screen-' + s + '-panel');
        const navEl = document.getElementById('nav-' + s);
        if (panel) panel.classList.toggle('active-panel', s === screen);
        if (navEl) navEl.classList.toggle('active', s === screen);
    });

    const info = titles[screen] || ['SPECTRA',''];
    const t = document.getElementById('screen-title');
    const sub = document.getElementById('screen-subtitle');
    if (t) t.textContent = info[0];
    if (sub) sub.textContent = info[1];

    // Refresh data on switch
    if (screen === 'dashboard') refreshDashboard();
    if (screen === 'cart') renderRequestForm();
    if (screen === 'requests') { renderTicketsTable(); updateKPI(); }
    if (screen === 'admin') renderAdminTable();
    if (screen === 'config') { renderUsersTable(); renderPricesTable(); renderItemsTable(); renderParamsSelect(); renderFormConfigTab(); }
}

function switchConfigTab(tab) {
    const tabs = ['users','prices','items','params','form','announcement','chemical','report'];
    tabs.forEach(t => {
        const btn = document.getElementById('cfg-tab-' + t + '-btn');
        const pane = document.getElementById('config-tab-' + t);
        if (btn) btn.classList.toggle('active', t === tab);
        if (pane) pane.classList.toggle('active', t === tab);
    });
    if (tab === 'users') renderUsersTable();
    if (tab === 'prices') renderPricesTable();
    if (tab === 'items') renderItemsTable();
    if (tab === 'params') renderParamsSelect();
    if (tab === 'form') renderFormConfigTab();
    if (tab === 'announcement') loadAnnouncementConfig();
    if (tab === 'chemical') renderChemicalConfigTab();
    if (tab === 'report') { /* auto on user click */ }
}

// ============================================================
// SECTION 15b: FORM CONFIG ADMIN
// ============================================================

function renderFormConfigTab() {
    renderFormConfigMaterials();
    renderFormConfigParams();
    renderFormConfigMethods();
}

function renderFormConfigMaterials() {
    const el = document.getElementById('fcfg-materials');
    if (!el) return;
    const cfg = getFormConfig();
    el.innerHTML = DEFAULT_MATERIALS.map(m => `
        <label class="fcfg-toggle-row">
            <span class="fcfg-item-name">${m.icon} ${m.name}</span>
            <label class="fcfg-switch">
                <input type="checkbox" ${cfg.materials[m.id]!==false?'checked':''}
                    onchange="toggleFormCfgMaterial('${m.id}',this.checked)">
                <span class="fcfg-slider"></span>
            </label>
        </label>
    `).join('');
}

function toggleFormCfgMaterial(id, val) {
    const cfg = getFormConfig();
    cfg.materials[id] = val;
    saveFormConfig(cfg);
    renderFormConfigMaterials();
    showToast('Konfigurasi material diperbarui.', 'success');
}

function renderFormConfigParams() {
    const el = document.getElementById('fcfg-params');
    if (!el) return;
    const cfg = getFormConfig();
    let html = '';
    DEFAULT_PARAMETER_GROUPS.forEach(g => {
        const allParams = [];
        if (g.params) allParams.push(...g.params);
        if (g.subGroups) g.subGroups.forEach(sg => allParams.push(...sg.params));
        const groupLabel = g.subGroups
            ? g.name + ' (' + g.subGroups.map(sg => sg.name).join(' + ') + ')'
            : g.name;
        html += '<div class="fcfg-param-group">';
        html += '<h4 style="color:' + g.color + ';margin-bottom:8px;">' + groupLabel + '</h4>';
        html += '<div class="fcfg-param-grid">';
        allParams.forEach(p => {
            const esc = p.replace(/"/g, '&quot;');
            html += '<label class="fcfg-param-row">';
            html += '<input type="checkbox" ' + (cfg.params[p]!==false?'checked':'') + ' onchange="toggleFormCfgParam(this,\'' + esc + '\')">';
            html += '<span>' + p + '</span></label>';
        });
        html += '</div></div>';
    });
    el.innerHTML = html;
}

function toggleFormCfgParam(el, paramName) {
    const cfg = getFormConfig();
    cfg.params[paramName] = el.checked;
    saveFormConfig(cfg);
    showToast('Parameter diperbarui.', 'success');
}

function renderFormConfigMethods() {
    const el = document.getElementById('fcfg-methods');
    if (!el) return;
    const cfg = getFormConfig();
    el.innerHTML = DEFAULT_TEST_METHODS.map(m => `
        <label class="fcfg-toggle-row">
            <span class="fcfg-item-name">📐 ${m}</span>
            <label class="fcfg-switch">
                <input type="checkbox" ${cfg.methods[m]!==false?'checked':''}
                    onchange="toggleFormCfgMethod('${m}',this.checked)">
                <span class="fcfg-slider"></span>
            </label>
        </label>
    `).join('');
}

function toggleFormCfgMethod(m, val) {
    const cfg = getFormConfig();
    cfg.methods[m] = val;
    saveFormConfig(cfg);
    renderFormConfigMethods();
    showToast('Konfigurasi metode diperbarui.', 'success');
}

function resetFormConfig() {
    if (!confirm('Reset semua konfigurasi form ke default?')) return;
    localStorage.removeItem('tl_form_config');
    renderFormConfigTab();
    showToast('Konfigurasi form direset ke default.', 'success');
}


// ============================================================
// SECTION 16: UI HELPERS
// ============================================================

function getStatusBadge(status) {
    const map = {
        'Baru':              '<span class="badge badge-info">🆕 Baru</span>',
        'Disetujui Admin':   '<span class="badge" style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;">✅ Disetujui Admin</span>',
        'Ditolak Admin':     '<span class="badge" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;">❌ Ditolak Admin</span>',
        'Sampel Diterima':   '<span class="badge" style="background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">🤝 Sampel Diterima</span>',
        'Diproses':          '<span class="badge badge-warning">🔬 Diproses</span>',
        'Menunggu Approval': '<span class="badge-approval">⏳ Menunggu Approval</span>',
        'Selesai':           '<span class="badge badge-success">✅ Selesai</span>',
        'Ditolak':           '<span class="badge-rejected">❌ Ditolak</span>',
    };
    return map[status] || `<span class="badge badge-neutral">${status}</span>`;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch(e) { return dateStr; }
}

function calculateExpDate(dateStr, durationStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        const months = parseInt(durationStr) || 6;
        date.setMonth(date.getMonth() + months);
        return date.toISOString().split('T')[0];
    } catch(e) {
        return '-';
    }
}

function changeTicketExpDuration(ticketId, newDuration) {
    const tickets = getTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx === -1) return;
    
    tickets[idx].expDuration = newDuration;
    saveTickets(tickets);
    
    if (typeof currentScreen !== 'undefined') {
        if (currentScreen === 'requests') {
            renderTicketsTable();
        } else if (currentScreen === 'admin') {
            renderAdminTable();
        }
    }
    showToast(`⏳ Masa simpan tiket ${ticketId} diubah menjadi ${newDuration}`, 'success');
}

function downloadTicketsCSV(isAdmin = false) {
    let tickets = getTickets();
    const role = getRole();
    if (role === 'user' && !isAdmin) {
        tickets = tickets.filter(t => t.requesterId === currentSession.id);
    }

    const searchId = isAdmin ? 'admin-search' : 'ticket-search';
    const statusId = isAdmin ? 'admin-status-filter' : 'ticket-status-filter';
    const startId = isAdmin ? 'admin-date-start' : 'ticket-date-start';
    const endId = isAdmin ? 'admin-date-end' : 'ticket-date-end';

    const search = document.getElementById(searchId)?.value.toLowerCase() || '';
    const statusFilter = document.getElementById(statusId)?.value || 'all';
    const startVal = document.getElementById(startId)?.value;
    const endVal = document.getElementById(endId)?.value;

    if (search) {
        tickets = tickets.filter(t => t.id.toLowerCase().includes(search) || t.requester.toLowerCase().includes(search));
    }
    if (statusFilter !== 'all') {
        tickets = tickets.filter(t => t.status === statusFilter);
    }
    if (startVal) {
        tickets = tickets.filter(t => t.date >= startVal);
    }
    if (endVal) {
        tickets = tickets.filter(t => t.date <= endVal);
    }

    if (tickets.length === 0) {
        showToast('Tidak ada data tiket untuk diunduh.', 'warning');
        return;
    }

    const headers = ['ID Tiket', 'Tanggal', 'Pengaju', 'Jumlah Sampel', 'Metode Uji', 'Status', 'Keterangan Lab', 'Masa Simpan (Exp Date)', 'Tanggal Kadaluarsa'];
    
    const rows = tickets.map(t => {
        const totalSamples = t.samples ? t.samples.reduce((s, sp) => s + (sp.count || 1), 0) : 0;
        const sampleNames = t.samples && t.samples.length > 0
            ? t.samples.map(s => s.name).join(', ')
            : t.tests.join(', ');
        const expDur = t.expDuration || '6 Bulan';
        const expDate = calculateExpDate(t.date, expDur);
        
        return [
            t.id,
            t.date,
            t.requester,
            totalSamples,
            sampleNames.replace(/"/g, '""'),
            t.status,
            (t.labRemarks || '-').replace(/"/g, '""'),
            expDur,
            expDate
        ];
    });

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(val => `"${val}"`).join(';')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    let filename = isAdmin ? 'Riwayat_Manajemen_Tiket' : 'Riwayat_Tiket_Pengujian';
    if (startVal && endVal) {
        filename += `_${startVal}_hingga_${endVal}`;
    } else if (startVal) {
        filename += `_dari_${startVal}`;
    } else if (endVal) {
        filename += `_hingga_${endVal}`;
    }
    filename += '.csv';
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('📥 Riwayat pengujian berhasil diunduh!', 'success');
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('modal-open');
        document.body.style.overflow = '';
    }
    if (id === 'pdf-viewer-modal') {
        const iframe = document.getElementById('pdf-iframe');
        if (iframe) iframe.src = 'about:blank';
    }
}

function initAnnouncement() {
    if (!cachedAnnouncement) initAnnouncementLocalStorage();
    
    const banner = document.getElementById('announcement');
    const contentSpan = banner ? banner.querySelector('.banner-content span') : null;
    const dismissed = sessionStorage.getItem('spectra_announcement_dismissed') === 'true';

    if (banner && contentSpan) {
        if (cachedAnnouncement.active && cachedAnnouncement.message && cachedAnnouncement.message.trim() !== '' && !dismissed) {
            contentSpan.innerHTML = `<strong>INFO LAYANAN:</strong> ${cachedAnnouncement.message}`;
            banner.style.display = 'flex';
        } else {
            banner.style.display = 'none';
        }
    }
}

function closeAnnouncement() {
    const el = document.getElementById('announcement');
    if (el) {
        el.style.display = 'none';
        sessionStorage.setItem('spectra_announcement_dismissed', 'true');
    }
}

function loadAnnouncementConfig() {
    if (!cachedAnnouncement) initAnnouncementLocalStorage();
    const activeCb = document.getElementById('cfg-announcement-active');
    const msgTa = document.getElementById('cfg-announcement-message');
    if (activeCb) activeCb.checked = cachedAnnouncement.active;
    if (msgTa) msgTa.value = cachedAnnouncement.message;
}

function saveAnnouncementConfig() {
    const active = document.getElementById('cfg-announcement-active')?.checked;
    const message = document.getElementById('cfg-announcement-message')?.value || '';

    cachedAnnouncement = { active, message };
    localStorage.setItem('spectra_announcement', JSON.stringify(cachedAnnouncement));
    
    if (IS_ONLINE_MODE) {
        fetch('/api/announcement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cachedAnnouncement)
        }).catch(e => console.error("Failed to save announcement to server:", e));
    }

    sessionStorage.removeItem('spectra_announcement_dismissed'); // Reset session dismiss
    initAnnouncement();
    showToast('📢 Konfigurasi Info Layanan berhasil disimpan.', 'success');
}

function viewPDFFromDetail() {
    if (!currentTicketModalId) return;
    viewPDF(currentTicketModalId, true);
    closeModal('ticket-modal');
}

function approveFromDetail() {
    if (!currentTicketModalId) return;
    currentPDFTicketId = currentTicketModalId;
    approvePDFFromModal();
    closeModal('ticket-modal');
}

function printKajiUlangFromModal() {
    if (!currentTicketModalId) return;
    printKajiUlang(currentTicketModalId);
}

function printApprovalCertificate() {
    if (!currentTicketModalId) return;
    const tickets = getTickets();
    const t = tickets.find(tk => tk.id === currentTicketModalId);
    const results = getResults();
    const result = results[currentTicketModalId];
    if (!t || !result || result.status !== 'approved') return;

    const dateStr = formatDate(result.approvedAt);
    const barcodeData = encodeURIComponent(`TICKET:${t.id}|APPROVED:${dateStr}|BY:${result.approvedBy}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${barcodeData}`;

    const html = `
    <html>
    <head>
        <title>Lembar Pengesahan - ${t.id}</title>
        <style>
            body { font-family: "Segoe UI", Arial, sans-serif; padding: 40px; text-align: center; }
            .cert-box { border: 2px solid #222; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 8px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            .info { font-size: 16px; margin-bottom: 30px; text-align: left; }
            .info th { text-align: left; padding: 4px 16px 4px 0; }
            .qr-container { margin: 30px 0; }
            .footer { font-size: 14px; color: #555; }
            @media print {
                @page { margin: 0; }
                body { padding: 40px; }
            }
        </style>
    </head>
    <body onload="setTimeout(() => window.print(), 500)">
        <div class="cert-box">
            <h1>LEMBAR PENGESAHAN HASIL UJI</h1>
            <hr style="margin-bottom:30px;">
            <table class="info" align="center">
                <tr><th>ID Tiket</th><td>: ${t.id}</td></tr>
                <tr><th>Nama Pengaju</th><td>: ${t.requester}</td></tr>
                <tr><th>Jenis Sampel</th><td>: ${t.samples && t.samples[0] ? t.samples[0].material : '-'}</td></tr>
                <tr><th>Nama / Kode Sampel</th><td style="white-space: pre-wrap;">: ${t.samples && t.samples.length > 0 ? t.samples.map(s => s.name).join(', ') : '-'}</td></tr>
                <tr><th>Tanggal Selesai</th><td>: ${dateStr}</td></tr>
                <tr><th>Manager Penyetuju</th><td>: ${result.approvedByName || result.approvedBy}</td></tr>
            </table>
            
            <p>Dokumen hasil uji untuk tiket ini telah direview dan disahkan secara digital pada sistem SPECTRA LMS.</p>
            
            <div class="qr-container">
                <img src="${qrUrl}" alt="QR Code Persetujuan">
            </div>
            
            <div class="footer">
                <p><strong>Status Valid</strong></p>
                <p>Dokumen ini adalah bukti persetujuan sah yang dihasilkan secara otomatis oleh sistem.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    } else {
        alert('Browser memblokir popup. Harap izinkan popup untuk mencetak.');
    }
}

function rejectFromDetail() {
    if (!currentTicketModalId) return;
    currentPDFTicketId = currentTicketModalId;
    openRejectModal();
}

function editLabRemarks(ticketId) {
    const tickets = getTickets();
    const t = tickets.find(tk => tk.id === ticketId);
    if (!t) return;

    document.getElementById('remarks-ticket-id').value = ticketId;
    document.getElementById('remarks-text').value = t.labRemarks || '';
    openModal('remarks-modal');
}

function saveLabRemarks() {
    const ticketId = document.getElementById('remarks-ticket-id').value;
    const text = document.getElementById('remarks-text').value.trim();

    const tickets = getTickets();
    const idx = tickets.findIndex(tk => tk.id === ticketId);
    if (idx === -1) return;

    tickets[idx].labRemarks = text;
    saveTickets(tickets);

    showToast('Keterangan pengujian berhasil disimpan.', 'success');
    closeModal('remarks-modal');
    renderAdminTable();
    renderTicketsTable();

    const detailModal = document.getElementById('ticket-modal');
    if (detailModal && detailModal.classList.contains('active-modal')) {
        openTicketModal(ticketId);
    }
}

function toggleTheme() {
    const isDark = document.getElementById('theme-toggle-cb')?.checked;
    document.body.className = isDark ? 'dark-theme' : 'light-theme';
    localStorage.setItem('tl_theme', isDark ? 'dark' : 'light');
}

// Close modal on backdrop click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-backdrop') && e.target.classList.contains('modal-open')) {
        e.target.classList.remove('modal-open');
        document.body.style.overflow = '';
        const iframe = document.getElementById('pdf-iframe');
        if (iframe) iframe.src = 'about:blank';
    }
});

// ============================================================
// SECTION 17: TOAST NOTIFICATIONS
// ============================================================

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    toast.innerHTML = `<span>${icons[type]||'📢'}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-show'), 50);
    setTimeout(() => { toast.classList.remove('toast-show'); setTimeout(() => toast.remove(), 400); }, 4000);
}


async function initApp() {
    // Restore theme
    const savedTheme = localStorage.getItem('tl_theme');
    if (savedTheme === 'dark') {
        document.body.className = 'dark-theme';
        const cb = document.getElementById('theme-toggle-cb');
        if (cb) cb.checked = true;
    }

    setupRBAC();
    
    // Preload database
    await preloadDatabase();
    
    renderCatalog();
    initAnnouncement();
    renderCart();
    updateKPI();
    refreshDashboard();
    
    // Start database sync polling
    startDatabasePolling();
}

document.addEventListener('DOMContentLoaded', async function() {
    if (checkAuth()) {
        await initApp();
    }
});


// ============================================================
// SECTION 19: DASHBOARD
// ============================================================

function refreshDashboard() {
    const tickets = getTickets();
    const role = getRole();
    const session = currentSession;

    // Update greeting
    const greetEl = document.getElementById('dash-greeting');
    const titleEl = document.getElementById('dash-welcome-title');
    if (greetEl && session) greetEl.textContent = `Halo, ${session.name}!`;
    if (titleEl) titleEl.textContent = 'Selamat Datang di SPECTRA LMS';

    // Hide "Buat Permintaan" for operator/manager
    const newReqBtn = document.getElementById('dash-new-request-btn');
    if (newReqBtn) newReqBtn.style.display = can('cart') ? '' : 'none';

    // Visible tickets for user
    let visibleTickets = tickets;
    if (role === 'user' && session) visibleTickets = tickets.filter(t => t.requesterId === session.id);

    const totalSamples = visibleTickets.reduce((s, t) => s + (t.samples ? t.samples.reduce((ss, sp) => ss + (sp.count||1), 0) : 0), 0);
    const newCount     = visibleTickets.filter(t => t.status === 'Baru').length;
    const processCount = visibleTickets.filter(t => t.status === 'Disetujui Admin' || t.status === 'Sampel Diterima' || t.status === 'Diproses' || t.status === 'Menunggu Approval').length;
    const doneCount    = visibleTickets.filter(t => t.status === 'Selesai').length;

    const setKpi = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setKpi('dash-kpi-total-samples', totalSamples);
    setKpi('dash-kpi-new-requests', newCount);
    setKpi('dash-kpi-processing', processCount);
    setKpi('dash-kpi-completed', doneCount);
    setKpi('dash-kpi-total-tickets', visibleTickets.length);

    // --- Bar Chart: Material counts ---
    const barContainer = document.getElementById('dash-bar-chart-container');
    if (barContainer) {
        const matCounts = {};
        visibleTickets.forEach(t => {
            if (t.samples) t.samples.forEach(s => {
                const mat = s.material || 'Lainnya';
                matCounts[mat] = (matCounts[mat] || 0) + (s.count || 1);
            });
        });
        const matEntries = Object.entries(matCounts).sort((a,b) => b[1]-a[1]).slice(0,6);
        if (matEntries.length === 0) {
            barContainer.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:40px 0;font-size:0.85rem;">Belum ada data sampel</div>';
        } else {
            const maxVal = Math.max(...matEntries.map(e => e[1]));
            barContainer.innerHTML = `<div class="bar-chart-wrap">
                ${matEntries.map(([label, val]) => `
                    <div class="bar-item">
                        <span class="bar-val">${val}</span>
                        <div class="bar-fill" style="height:${Math.max(10, Math.round((val/maxVal)*140))}px;"></div>
                        <span class="bar-label" title="${label}">${label.length > 8 ? label.substring(0,7)+'…' : label}</span>
                    </div>
                `).join('')}
            </div>`;
        }
    }

    // --- Donut Chart: Status distribution (SVG) ---
    const donutContainer = document.getElementById('dash-donut-chart-container');
    if (donutContainer) {
        const statusGroups = [
            { label:'Baru', color:'#0284c7', statuses:['Baru'] },
            { label:'Proses', color:'#7c3aed', statuses:['Disetujui Admin','Diproses'] },
            { label:'Approval', color:'#d97706', statuses:['Menunggu Approval'] },
            { label:'Selesai', color:'#059669', statuses:['Selesai'] },
            { label:'Ditolak', color:'#ef4444', statuses:['Ditolak','Ditolak Admin'] },
        ];
        const counts = statusGroups.map(g => ({
            ...g,
            count: visibleTickets.filter(t => g.statuses.includes(t.status)).length
        })).filter(g => g.count > 0);
        const total = counts.reduce((s, g) => s + g.count, 0);

        if (total === 0) {
            donutContainer.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:40px 0;font-size:0.85rem;">Belum ada tiket</div>';
        } else {
            const R = 70, cx = 90, cy = 90, strokeW = 30;
            const circum = 2 * Math.PI * R;
            let offset = 0;
            const segments = counts.map(g => {
                const pct = g.count / total;
                const dash = pct * circum;
                const seg = { ...g, dash, gap: circum - dash, offset };
                offset += dash;
                return seg;
            });
            const svgSegs = segments.map(s =>
                `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${s.color}" stroke-width="${strokeW}"
                    stroke-dasharray="${s.dash} ${s.gap}"
                    stroke-dashoffset="${-s.offset + circum/4}"
                    style="transition:stroke-dasharray 0.5s ease;"/>`
            ).join('');

            const legend = counts.map(g =>
                `<div class="donut-legend-item">
                    <div class="donut-dot" style="background:${g.color};"></div>
                    <span>${g.label}: <strong>${g.count}</strong></span>
                </div>`
            ).join('');

            donutContainer.innerHTML = `
                <div style="text-align:center;">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                        ${svgSegs}
                        <text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor">${total}</text>
                        <text x="${cx}" y="${cy+18}" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.5">Tiket</text>
                    </svg>
                    <div class="donut-legend">${legend}</div>
                </div>`;
        }
    }

    // --- Top Contributors ---
    const tbody = document.getElementById('dash-top-contributors');
    if (tbody) {
        const allTickets = (role === 'admin' || role === 'operator' || role === 'manager') ? tickets : visibleTickets;
        const contrib = {};
        allTickets.forEach(t => {
            if (!contrib[t.requester]) contrib[t.requester] = { name: t.requester, tickets: 0, samples: 0, done: 0 };
            contrib[t.requester].tickets++;
            contrib[t.requester].samples += t.samples ? t.samples.reduce((s, sp) => s + (sp.count||1), 0) : 0;
            if (t.status === 'Selesai') contrib[t.requester].done++;
        });
        const sorted = Object.values(contrib).sort((a,b) => b.tickets - a.tickets).slice(0,5);
        if (sorted.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-light);">Belum ada data</td></tr>';
        } else {
            tbody.innerHTML = sorted.map((c, i) => `
                <tr>
                    <td><strong>${i+1}</strong></td>
                    <td>${c.name}</td>
                    <td>${c.tickets}</td>
                    <td>${c.samples}</td>
                    <td><span class="badge badge-success">${c.done}</span></td>
                </tr>
            `).join('');
        }
    }
}

// ============================================================
// SECTION 20: CHEMICAL CONFIG & LAPORAN
// ============================================================

function getChemicalConfig() {
    if (!cachedChemicalConfig || !Array.isArray(cachedChemicalConfig)) {
        try {
            const s = localStorage.getItem('tl_chemical_config_v2');
            cachedChemicalConfig = s ? JSON.parse(s) : [];
        } catch(e) {
            cachedChemicalConfig = [];
        }
    }
    return cachedChemicalConfig;
}

function saveChemicalConfigLocal(cfg) {
    cachedChemicalConfig = cfg;
    localStorage.setItem('tl_chemical_config_v2', JSON.stringify(cfg));
    if (IS_ONLINE_MODE) {
        fetch('/api/chemical-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cfg)
        }).catch(e => console.error('Failed to save chemical config:', e));
    }
}

function renderChemicalConfigTab() {
    const tbody = document.getElementById('chemical-config-table-body');
    if (!tbody) return;
    const cfg = getChemicalConfig();

    if (cfg.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-light);">Belum ada konfigurasi bahan kimia. Klik tombol Tambah di bawah.</td></tr>';
        return;
    }

    const allParams = [];
    DEFAULT_PARAMETER_GROUPS.forEach(g => {
        if (g.params) g.params.forEach(p => allParams.push(p));
        if (g.subGroups) g.subGroups.forEach(sg => sg.params.forEach(p => allParams.push(p)));
    });
    const stdMethods = getTestMethods();

    tbody.innerHTML = cfg.map((c, i) => {
        const totalCost = c.chemicals.reduce((sum, chem) => sum + (parseFloat(chem.price) || 0), 0);
        
        const chemsHtml = c.chemicals.map((chem, j) => `
            <div style="display:flex;gap:4px;margin-bottom:4px;align-items:center;">
                <input type="text" class="chem-input" style="flex:1;min-width:100px;font-size:0.75rem;" value="${chem.name}" onchange="updateChemItem(${i}, ${j}, 'name', this.value)" placeholder="Nama Bahan">
                <input type="text" class="chem-input" style="width:70px;font-size:0.75rem;" value="${chem.amount}" onchange="updateChemItem(${i}, ${j}, 'amount', this.value)" placeholder="10 ml">
                <input type="number" class="chem-input" style="width:90px;font-size:0.75rem;" value="${chem.price}" onchange="updateChemItem(${i}, ${j}, 'price', this.value)" placeholder="Rp">
                <button onclick="removeChemItem(${i}, ${j})" style="background:none;border:none;color:#dc2626;cursor:pointer;" title="Hapus bahan">&times;</button>
            </div>
        `).join('') + `<button onclick="addChemItem(${i})" style="background:none;border:none;color:var(--primary-color);cursor:pointer;font-size:0.75rem;margin-top:4px;">+ Tambah Bahan</button>`;

        return `<tr>
            <td style="vertical-align:top;">
                <select class="chem-input" onchange="updateConfigRow(${i}, 'param', this.value)" style="width:120px;">
                    <option value="">Pilih Parameter</option>
                    ${allParams.map(p => `<option value="${p}" ${c.param===p?'selected':''}>${p}</option>`).join('')}
                </select>
            </td>
            <td style="vertical-align:top;">
                <select class="chem-input" onchange="updateConfigRow(${i}, 'stdMethod', this.value)" style="width:120px;">
                    <option value="">Pilih Metode</option>
                    ${stdMethods.map(m => `<option value="${m}" ${c.stdMethod===m?'selected':''}>${m}</option>`).join('')}
                </select>
            </td>
            <td style="vertical-align:top;">
                <input type="text" class="chem-input" value="${c.analMethod}" onchange="updateConfigRow(${i}, 'analMethod', this.value)" placeholder="e.g. XRF Fusebead" style="width:130px;">
            </td>
            <td colspan="3" style="vertical-align:top;">
                ${chemsHtml}
            </td>
            <td style="vertical-align:top;font-weight:600;">Rp ${totalCost.toLocaleString('id-ID')}</td>
            <td style="vertical-align:top;">
                <button class="btn-danger btn-sm" onclick="removeConfigRow(${i})">Hapus</button>
            </td>
        </tr>`;
    }).join('');
}

function addChemicalConfigRow() {
    const cfg = getChemicalConfig();
    cfg.push({ id: Date.now(), param: '', stdMethod: '', analMethod: '', chemicals: [{ name: '', amount: '', price: 0 }] });
    saveChemicalConfigLocal(cfg);
    renderChemicalConfigTab();
}

function removeConfigRow(idx) {
    if(!confirm('Hapus konfigurasi ini?')) return;
    const cfg = getChemicalConfig();
    cfg.splice(idx, 1);
    saveChemicalConfigLocal(cfg);
    renderChemicalConfigTab();
}

function addChemItem(rowIdx) {
    const cfg = getChemicalConfig();
    cfg[rowIdx].chemicals.push({ name: '', amount: '', price: 0 });
    saveChemicalConfigLocal(cfg);
    renderChemicalConfigTab();
}

function removeChemItem(rowIdx, chemIdx) {
    const cfg = getChemicalConfig();
    cfg[rowIdx].chemicals.splice(chemIdx, 1);
    saveChemicalConfigLocal(cfg);
    renderChemicalConfigTab();
}

function updateConfigRow(idx, field, value) {
    const cfg = getChemicalConfig();
    cfg[idx][field] = value;
    saveChemicalConfigLocal(cfg);
}

function updateChemItem(rowIdx, chemIdx, field, value) {
    const cfg = getChemicalConfig();
    if(field === 'price') value = parseFloat(value) || 0;
    cfg[rowIdx].chemicals[chemIdx][field] = value;
    saveChemicalConfigLocal(cfg);
    if(field === 'price') renderChemicalConfigTab(); // refresh total
}

function saveChemsConfig() {
    showToast('✅ Semua konfigurasi bahan kimia berhasil tersimpan otomatis!', 'success');
}

function generateReport() {
    const startInput = document.getElementById('report-date-start');
    const endInput   = document.getElementById('report-date-end');
    const resultsDiv = document.getElementById('report-results');

    if (!startInput?.value || !endInput?.value) {
        showToast('Pilih tanggal mulai dan tanggal selesai!', 'error');
        return;
    }

    const startDate = new Date(startInput.value);
    const endDate   = new Date(endInput.value);
    endDate.setHours(23, 59, 59);

    if (startDate > endDate) {
        showToast('Tanggal mulai tidak boleh setelah tanggal selesai!', 'error');
        return;
    }

    const tickets = getTickets();
    const chemCfg = getChemicalConfig();

    // Filter tickets in date range
    const filtered = tickets.filter(t => {
        const d = new Date(t.date);
        return d >= startDate && d <= endDate;
    });

    // Calculate cost per ticket
    let totalCost = 0;
    let totalSamples = 0;
    const chemUsage = {}; // chemical name -> { amount:0, unit:'' }

    filtered.forEach(t => {
        const ticketSamples = t.samples || [];
        ticketSamples.forEach(s => {
            const sampleCount = s.count || 1;
            totalSamples += sampleCount;
            
            (s.params || []).forEach(p => {
                let pGroupName = '';
                let pGroupId = '';
                DEFAULT_PARAMETER_GROUPS.forEach(g => {
                    if (g.params && g.params.includes(p)) { pGroupName = g.name; pGroupId = g.id; }
                    if (g.subGroups) g.subGroups.forEach(sg => { 
                        if(sg.params.includes(p)) { pGroupName = g.name; pGroupId = g.id; }
                    });
                });

                const stdMethods = s.methods || (s.method ? [s.method] : []);
                if (stdMethods.length === 0) stdMethods.push(''); // To match configs without stdMethod
                
                stdMethods.forEach(stdMethod => {
                    let analMethods = ['']; 
                    if (pGroupId && s.subMethods && s.subMethods[pGroupId]) {
                        analMethods = s.subMethods[pGroupId].split(', ');
                    }
                    
                    analMethods.forEach(analMethod => {
                        const match = chemCfg.find(c => c.param === p && (c.stdMethod === stdMethod || !c.stdMethod) && (c.analMethod === analMethod || !c.analMethod));
                        if (match && match.chemicals) {
                            match.chemicals.forEach(chem => {
                                const price = parseFloat(chem.price) || 0;
                                totalCost += price * sampleCount;
                                const amtVal = parseFloat(chem.amount) || 0;
                                const unit = chem.amount.replace(/[0-9.]/g, '').trim() || 'unit';
                                
                                if (chem.name) {
                                    if (!chemUsage[chem.name]) chemUsage[chem.name] = { total: 0, unit };
                                    chemUsage[chem.name].total += amtVal * sampleCount;
                                }
                            });
                        }
                    });
                });
            });
        });
    });

    // Render cost summary
    const costSummaryEl = document.getElementById('report-cost-summary');
    if (costSummaryEl) {
        costSummaryEl.innerHTML = `
            <div class="report-kpi-row">
                <div class="report-kpi-item"><span class="rki-label">Total Tiket</span><span class="rki-val">${filtered.length}</span></div>
                <div class="report-kpi-item"><span class="rki-label">Total Biaya</span><span class="rki-val">Rp ${totalCost.toLocaleString('id-ID')}</span></div>
            </div>
            <p style="font-size:0.8rem;color:var(--text-light);">Periode: ${startInput.value} s/d ${endInput.value}</p>`;
    }

    // Render sample summary
    const sampleSummaryEl = document.getElementById('report-sample-summary');
    if (sampleSummaryEl) {
        const done = filtered.filter(t => t.status === 'Selesai').length;
        sampleSummaryEl.innerHTML = `
            <div class="report-kpi-row">
                <div class="report-kpi-item"><span class="rki-label">Total Sampel</span><span class="rki-val">${totalSamples}</span></div>
                <div class="report-kpi-item"><span class="rki-label">Selesai</span><span class="rki-val">${done}</span></div>
            </div>`;
    }

    // Render chemical usage table
    const chemTableEl = document.getElementById('report-chem-table-body');
    if (chemTableEl) {
        const chemEntries = Object.entries(chemUsage);
        if (chemEntries.length === 0) {
            chemTableEl.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-light);">Tidak ada data bahan kimia. Lengkapi konfigurasi di tab Bahan Kimia & Biaya.</td></tr>';
        } else {
            chemTableEl.innerHTML = chemEntries.map(([name, data]) =>
                `<tr><td><strong>${name}</strong></td><td>${data.unit}</td><td>${data.total.toFixed(2)}</td><td>-</td></tr>`
            ).join('');
        }
    }

    // Render ticket detail table
    const ticketTableEl = document.getElementById('report-ticket-table-body');
    if (ticketTableEl) {
        if (filtered.length === 0) {
            ticketTableEl.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:16px;color:var(--text-light);">Tidak ada tiket pada periode ini.</td></tr>';
        } else {
            ticketTableEl.innerHTML = filtered.map(t => {
                const sampleCount = t.samples ? t.samples.reduce((s, sp) => s + (sp.count||1), 0) : 0;
                const params = t.samples ? [...new Set(t.samples.flatMap(s => s.params || []))].join(', ') : '-';
                const paramsDisplay = params.length > 40 ? params.substring(0,40) + '...' : params;

                // Estimate cost from new config matching
                let ticketCost = 0;
                (t.samples || []).forEach(s => {
                    (s.params || []).forEach(p => {
                        let pGroupId = '';
                        DEFAULT_PARAMETER_GROUPS.forEach(g => {
                            if (g.params && g.params.includes(p)) pGroupId = g.id;
                            if (g.subGroups) g.subGroups.forEach(sg => { if(sg.params.includes(p)) pGroupId = g.id; });
                        });

                        const stdMethods = s.methods || (s.method ? [s.method] : []);
                        if (stdMethods.length === 0) stdMethods.push('');
                        
                        stdMethods.forEach(stdMethod => {
                            let analMethods = ['']; 
                            if (pGroupId && s.subMethods && s.subMethods[pGroupId]) {
                                analMethods = s.subMethods[pGroupId].split(', ');
                            }
                            analMethods.forEach(analMethod => {
                                const match = chemCfg.find(c => c.param === p && (c.stdMethod === stdMethod || !c.stdMethod) && (c.analMethod === analMethod || !c.analMethod));
                                if (match && match.chemicals) {
                                    ticketCost += match.chemicals.reduce((sum, chem) => sum + (parseFloat(chem.price)||0), 0) * (s.count || 1);
                                }
                            });
                        });
                    });
                });

                return `<tr>
                    <td><code style="color:var(--primary-color);font-weight:600;">${t.id}</code></td>
                    <td>${formatDate(t.date)}</td>
                    <td>${t.requester}</td>
                    <td style="font-size:0.8rem;max-width:200px;white-space:normal;">${paramsDisplay}</td>
                    <td style="text-align:center;">${sampleCount}</td>
                    <td>Rp ${ticketCost.toLocaleString('id-ID')}</td>
                </tr>`;
            }).join('');
        }
    }

    if (resultsDiv) resultsDiv.style.display = 'block';
    showToast(`✅ Laporan dihasilkan: ${filtered.length} tiket ditemukan`, 'success');
}

