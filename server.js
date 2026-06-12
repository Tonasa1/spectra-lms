const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and increase body limits for PDF uploads (Base64)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database folder setup
const DB_DIR = path.join(__dirname, 'database');
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Helper functions for reading/writing JSON database files
function readDb(filename, defaultValue = []) {
    const filePath = path.join(DB_DIR, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
        return defaultValue;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        console.error(`Failed to read database file ${filename}:`, e);
        return defaultValue;
    }
}

function writeDb(filename, data) {
    const filePath = path.join(DB_DIR, filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error(`Failed to write database file ${filename}:`, e);
    }
}

// Serve static frontend files
app.use(express.static(__dirname));

// API Endpoints

// 1. Announcement (Info Layanan)
app.get('/api/announcement', (req, res) => {
    const defaultData = { active: true, message: "Pengujian XRF FuseBead untuk sementara tidak tersedia. Alat sedang dalam perbaikan." };
    const data = readDb('announcement.json', defaultData);
    res.json(data);
});

app.post('/api/announcement', (req, res) => {
    const data = req.body;
    writeDb('announcement.json', data);
    res.json({ success: true, data });
});

// 2. Users (Data Pengguna)
app.get('/api/users', (req, res) => {
    const defaultUsers = [
        { id:'u001', username:'admin',    password:'admin123', name:'Administrator',   role:'admin',    avatar:'AD' },
        { id:'u002', username:'user1',    password:'user123',  name:'Ahmad Fauzi',     role:'user',     avatar:'AF' },
        { id:'u003', username:'operator1',password:'op123',    name:'Budi Santoso',    role:'operator', avatar:'BS' },
        { id:'u004', username:'manager1', password:'mgr123',   name:'Dr. Siti Rahayu', role:'manager',  avatar:'SR' },
    ];
    const data = readDb('users.json', defaultUsers);
    res.json(data);
});

app.post('/api/users', (req, res) => {
    const data = req.body;
    writeDb('users.json', data);
    res.json({ success: true, count: data.length });
});

// 3. Tickets (Data Pengujian)
app.get('/api/tickets', (req, res) => {
    const defaultTickets = [
        {
            id: 'TKT-2026-001',
            requester: 'Ahmad Fauzi',
            requesterId: 'u002',
            date: '2026-05-10',
            tests: ['Kimia', 'Mineralogi'],
            samples: [
                { name: 'Sampel Semen OPC', count: 3, method: 'SNI', params: ['LOI (%)', 'SiO₂ (%)', 'Al₂O₃ (%)'], selfService: false },
                { name: 'Sampel Raw Meal', count: 2, method: 'SNI', params: ['CaO (%)', 'MgO (%)'], selfService: false }
            ],
            status: 'Selesai',
            timeline: { ordered: '2026-05-10', received: '2026-05-11', testing: '2026-05-12', approved: '2026-05-13', completed: '2026-05-14' },
            labRemarks: 'Uji selesai sesuai SOP.'
        },
        {
            id: 'TKT-2026-002',
            requester: 'Ahmad Fauzi',
            requesterId: 'u002',
            date: '2026-05-20',
            tests: ['Batubara'],
            samples: [
                { name: 'Sampel Batubara A', count: 4, method: 'ASTM', params: ['Nilai Kalori'], selfService: false },
                { name: 'Sampel Batubara B', count: 4, method: 'ASTM', params: ['Kandungan Sulfur'], selfService: false }
            ],
            status: 'Selesai',
            timeline: { ordered: '2026-05-20', received: '2026-05-21', testing: '2026-05-22', approved: '2026-05-23', completed: '2026-05-24' },
            labRemarks: '-'
        },
        {
            id: 'TKT-2026-003',
            requester: 'Ahmad Fauzi',
            requesterId: 'u002',
            date: '2026-06-01',
            tests: ['Kimia'],
            samples: [
                { name: 'Sampel Limbah Cair', count: 4, method: 'SNI', params: ['Chlor (Cl⁻)', 'H₂O'], selfService: false }
            ],
            status: 'Diproses',
            timeline: { ordered: '2026-06-01', received: '2026-06-02', testing: '2026-06-03', approved: null, completed: null },
            labRemarks: '-'
        },
        {
            id: 'TKT-2026-004',
            requester: 'Ahmad Fauzi',
            requesterId: 'u002',
            date: '2026-06-08',
            tests: ['Fisika'],
            samples: [
                { name: 'Sampel Semen PCC', count: 2, method: 'SNI', params: ['Blaine (cm²/g)', 'Awal (minutes)'], selfService: false }
            ],
            status: 'Diproses',
            timeline: { ordered: '2026-06-08', received: null, testing: null, approved: null, completed: null },
            labRemarks: '-'
        }
    ];
    const data = readDb('tickets.json', defaultTickets);
    res.json(data);
});

app.post('/api/tickets', (req, res) => {
    const data = req.body;
    writeDb('tickets.json', data);
    res.json({ success: true, count: data.length });
});

// 4. Results (File PDF & status verifikasi)
app.get('/api/results', (req, res) => {
    const defaultResults = {
        'TKT-2026-001': {
            pdfBase64: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvbGogIDw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNzAgMDAwMDAgbCAKMDAwMDAwMDEzNSAwMDAwMCBuIAp0cmFpbGVyCiAgPDwgL1NpemUgNCAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKMjAwCiUlRU9GCg==',
            fileName: 'Laporan_Hasil_Uji_OPC_001.pdf',
            fileSize: 320,
            uploadedBy: 'operator1',
            uploadedByName: 'Budi Santoso',
            uploadedAt: '2026-05-12T04:20:00.000Z',
            status: 'approved',
            approvedBy: 'manager1',
            approvedByName: 'Dr. Siti Rahayu',
            approvedAt: '2026-05-13T09:15:00.000Z',
            rejectNote: null
        },
        'TKT-2026-002': {
            pdfBase64: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvbGogIDw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNzAgMDAwMDAgbCAKMDAwMDAwMDEzNSAwMDAwMCBuIAp0cmFpbGVyCiAgPDwgL1NpemUgNCAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKMjAwCiUlRU9GCg==',
            fileName: 'Laporan_Batubara_002.pdf',
            fileSize: 320,
            uploadedBy: 'operator1',
            uploadedByName: 'Budi Santoso',
            uploadedAt: '2026-05-22T03:40:00.000Z',
            status: 'approved',
            approvedBy: 'manager1',
            approvedByName: 'Dr. Siti Rahayu',
            approvedAt: '2026-05-23T08:30:00.000Z',
            rejectNote: null
        }
    };
    const data = readDb('results.json', defaultResults);
    res.json(data);
});

app.post('/api/results', (req, res) => {
    const data = req.body;
    writeDb('results.json', data);
    res.json({ success: true });
});

// 5. Config (Konfigurasi Form)
app.get('/api/config', (req, res) => {
    const defaultData = {};
    const data = readDb('config.json', defaultData);
    res.json(data);
});

app.post('/api/config', (req, res) => {
    const data = req.body;
    writeDb('config.json', data);
    res.json({ success: true });
});

// 6. Chemical Config (Bahan Kimia & Biaya Per Parameter)
app.get('/api/chemical-config', (req, res) => {
    const defaultData = { params: {}, chemicals: [] };
    const data = readDb('chemical-config.json', defaultData);
    res.json(data);
});

app.post('/api/chemical-config', (req, res) => {
    const data = req.body;
    writeDb('chemical-config.json', data);
    res.json({ success: true });
});

// Wildcard fallback to index.html for SPA routing (if any)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
const server = app.listen(PORT, async () => {
    console.log(`====================================================`);
    console.log(` SPECTRA Backend Server is running!`);
    console.log(` Port: ${PORT}`);
    console.log(` URL Lokal: http://localhost:${PORT}`);
    console.log(`====================================================`);

    // CONFIGURATION NGROK (Opsi 2 - Gratis & Permanen)
    const NGROK_AUTHTOKEN = '3F0vl7KEEWH21omZcJPP87xHdcN_665XNC7kX3YuhzFDsAKsA';
    // JIKA Anda memiliki Static Domain gratis dari dashboard Ngrok (misal: 'spectra-tonasa.ngrok-free.app')
    // Silakan masukkan domain tersebut di bawah ini agar alamatnya tidak pernah berubah-ubah.
    const NGROK_DOMAIN = 'tadpole-evaluator-backtalk.ngrok-free.dev'; 

    let connectedTunnel = false;

    // Coba hubungkan menggunakan Ngrok terlebih dahulu (Sangat Stabil & Aman)
    if (NGROK_AUTHTOKEN) {
        try {
            const ngrok = require('ngrok');
            console.log(`Menghubungkan ke Ngrok dengan Authtoken...`);
            await ngrok.authtoken(NGROK_AUTHTOKEN);

            const connectOpts = {
                proto: 'http',
                addr: PORT
            };

            if (NGROK_DOMAIN && NGROK_DOMAIN.trim() !== '') {
                connectOpts.hostname = NGROK_DOMAIN.trim();
            }

            const url = await ngrok.connect(connectOpts);
            connectedTunnel = true;

            console.log(`====================================================`);
            console.log(` 🌐 SPECTRA ONLINE SHARE LINK (Akses dari Internet/Wi-Fi Lain):`);
            console.log(` Link: ${url}`);
            console.log(`====================================================`);
            
            if (!NGROK_DOMAIN) {
                console.log(` Tips: Agar alamat Ngrok di atas bersifat PERMANEN (tidak berubah setiap restart):`);
                console.log(` 1. Buka dashboard ngrok.com -> menu 'Cloud Edge' -> 'Domains'.`);
                console.log(` 2. Salin nama domain gratis yang Anda dapatkan (misal: 'xxxx.ngrok-free.app').`);
                console.log(` 3. Buka file server.js, ubah 'const NGROK_DOMAIN = "";' dengan domain tersebut.`);
                console.log(`====================================================`);
            }
        } catch (err) {
            console.warn('Gagal mengaktifkan tunnel Ngrok:', err.message);
        }
    }

    // Fallback: Jika Ngrok gagal atau belum dikonfigurasi, coba pakai localtunnel
    if (!connectedTunnel) {
        try {
            const localtunnel = require('localtunnel');
            const SUBDOMAIN = 'spectra-tonasa-lab'; 
            console.log(`Mencoba alternatif: Menghubungkan ke localtunnel dengan subdomain '${SUBDOMAIN}'...`);
            
            const connectTunnel = () => {
                return new Promise(async (resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Koneksi timeout ke server localtunnel.'));
                    }, 12000);
                    try {
                        const tunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });
                        clearTimeout(timeout);
                        resolve(tunnel);
                    } catch (err) {
                        clearTimeout(timeout);
                        reject(err);
                    }
                });
            };

            const tunnel = await connectTunnel();
            
            console.log(`====================================================`);
            console.log(` 🌐 SPECTRA ONLINE SHARE LINK (Akses dari Internet/Wi-Fi Lain):`);
            console.log(` Link: ${tunnel.url}`);
            console.log(`====================================================`);
            
            tunnel.on('close', () => {
                console.log('Koneksi tunnel publik ditutup.');
            });
        } catch (err) {
            console.log(`----------------------------------------------------`);
            console.warn(' ⚠️ Gagal menghubungkan ke tunnel publik (Ngrok & Localtunnel).');
            console.warn(' Jaringan Anda memblokir tunnel atau server eksternal sedang sibuk.');
            console.warn(' Solusi: Silakan gunakan akses lokal (satu Wi-Fi) di bawah ini.');
            console.log(`----------------------------------------------------`);
        }
    }
});
