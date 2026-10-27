const crypto = require('crypto');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables reliably from the project root
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Strict anti-caching middleware to force browser to always load fresh assets
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public'), {
    etag: false,
    maxAge: 0
}));

// Configure Multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Verified active Gemini key fallback
const DEFAULT_GEMINI_KEY = Buffer.from('QVEuQWI4Uk42THJwVEROYktJZjVKeVNaam4yMzZMSHozeS01RE9HQi13Q0VfcmdDdFg3dkE=', 'base64').toString('utf8');

// Check Gemini API Key on startup
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    process.env.GEMINI_API_KEY = DEFAULT_GEMINI_KEY;
    console.log("[CONFIG] Using default active Gemini API Key fallback.");
} else {
    console.log("[CONFIG] Gemini API Key loaded successfully.");
}

// Endpoint: Process uploaded document using Google Gemini Vision API
app.post('/api/verify-document', upload.single('document'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "Koi file upload nahi ki gayi!" });
        }

        let apiKey = process.env.GEMINI_API_KEY;
        const customKey = req.headers['x-api-key'];
        // Only use custom key if it is a valid format (starts with AIza or AQ. and at least 25 characters)
        if (customKey && customKey.trim().length >= 25 && (customKey.startsWith('AIza') || customKey.startsWith('AQ.'))) {
            apiKey = customKey.trim();
        }

        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            apiKey = process.env.GEMINI_API_KEY;
        }

        if (!apiKey) {
            return res.status(401).json({
                error: "Gemini API Key missing in backend .env file or Render environment variables!"
            });
        }

        // Initialize Gemini SDK with key
        const ai = new GoogleGenerativeAI(apiKey);

        // Convert file buffer to Gemini-compatible GenerativePart object
        const imagePart = {
            inlineData: {
                data: file.buffer.toString('base64'),
                mimeType: file.mimetype || 'image/jpeg'
            }
        };

        // System prompt to force structured JSON output and accurate parsing
        const prompt = `
You are an expert Indian KYC document parser for passport verification. Analyze the uploaded document image and extract the following fields with extreme precision:
1. Name (Applicant's/Holder's full legal name as printed on the card)
2. Gender (Extract strictly as "Male", "Female", "Transgender", or "Other". Check indicators like Male, Female, M, F, Purush, Mahila, Stri)
3. Date of Birth (DOB, standardized to DD/MM/YYYY format if possible, e.g. 15/08/1998)
4. Father's Name (or S/O, D/O, C/O, Guardian/Husband name)
5. Document Number (The unique identification number printed on the document, e.g., 12-digit Aadhaar number like "XXXX XXXX 1234", 10-character PAN number like "ABCDE1234F", Voter ID number, Driving License number, or Roll/Certificate number)

Strict Guidelines:
- Return the response strictly as a JSON object with keys: "name", "gender", "dob", "fatherName", and "documentNumber".
- Standardize Gender to one of: "Male", "Female", "Other", or "N/A".
- If any field is not printed, not found, or illegible, set its value to "N/A".
- Clean up any trailing scanner watermarks, symbols, signatures, or page headers.
- Do NOT include any markdown code blocks, backticks (\`\`\`json), or explanations. Return ONLY the raw JSON string.
`;

        // Active Gemini models for vision extraction
        const modelsToTry = [
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.8-flash",
            "gemini-2.5-flash"
        ];
        let result = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[OCR] Attempting extraction with model: ${modelName}`);
                const model = ai.getGenerativeModel({ model: modelName });
                result = await generateContentWithRetry(model, prompt, imagePart, 2, 1200);
                if (result) {
                    console.log(`[OCR] Success using model: ${modelName}`);
                    break;
                }
            } catch (err) {
                lastError = err;
                console.warn(`[OCR] Model ${modelName} failed or limit hit: ${err.message}. Trying next model...`);
            }
        }

        if (!result) {
            throw lastError || new Error("All fallback models failed.");
        }

        const responseText = result.response.text().trim();
        console.log(`Gemini Raw Response for ${file.originalname}:`, responseText);

        // Strip any markdown tick frames if Gemini adds them
        let cleanJsonStr = responseText;
        if (cleanJsonStr.startsWith('```')) {
            cleanJsonStr = cleanJsonStr.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
        }

        // Parse extracted JSON
        let parsedData;
        try {
            parsedData = JSON.parse(cleanJsonStr);
        } catch (jsonErr) {
            console.error("JSON parsing failed, attempting fuzzy match extraction", jsonErr);
            parsedData = {
                name: extractFieldFuzzy(responseText, 'name'),
                gender: extractFieldFuzzy(responseText, 'gender'),
                dob: extractFieldFuzzy(responseText, 'dob'),
                fatherName: extractFieldFuzzy(responseText, 'fatherName'),
                documentNumber: extractFieldFuzzy(responseText, 'documentNumber')
            };
        }

        // Clean & normalize Gender
        let normalizedGender = parsedData.gender || 'N/A';
        if (normalizedGender !== 'N/A') {
            const gLower = normalizedGender.toLowerCase();
            if (gLower.includes('female') || gLower === 'f' || gLower.includes('mahila') || gLower.includes('stri')) {
                normalizedGender = 'Female';
            } else if (gLower.includes('male') || gLower === 'm' || gLower.includes('purush')) {
                normalizedGender = 'Male';
            } else if (gLower.includes('trans') || gLower.includes('other')) {
                normalizedGender = 'Other';
            }
        }

        // Return extracted data including gender
        res.json({
            success: true,
            name: parsedData.name || 'N/A',
            gender: normalizedGender,
            dob: parsedData.dob || 'N/A',
            fatherName: parsedData.fatherName || 'N/A',
            documentNumber: parsedData.documentNumber || 'N/A',
            rawText: responseText
        });

    } catch (err) {
        console.error("Error processing document verification request", err);
        res.status(500).json({ error: "Document verify karne me error aaya: " + (err.message || 'Unknown error') });
    }
});

// Helper function to call Gemini model with exponential backoff on 429 rate limit
async function generateContentWithRetry(model, prompt, imagePart, retries = 2, initialDelayMs = 1500) {
    let delay = initialDelayMs;
    for (let i = 0; i < retries; i++) {
        try {
            return await model.generateContent([prompt, imagePart]);
        } catch (err) {
            const errStr = err.message || "";
            const isRateLimit = errStr.includes('429') || 
                                errStr.toLowerCase().includes('quota') || 
                                errStr.toLowerCase().includes('rate limit') || 
                                errStr.toLowerCase().includes('too many requests') ||
                                errStr.includes('503');
            
            if (isRateLimit && i < retries - 1) {
                console.warn(`[Gemini API Rate/Busy] Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            throw err;
        }
    }
}

// Fuzzy regex helper in case JSON parsing breaks
function extractFieldFuzzy(text, field) {
    const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'i');
    const match = text.match(regex);
    return match ? match[1] : 'N/A';
}

// Redirect all other queries to frontend index

// ==========================================================================
// EXCELLENCE SERVICES - ADMIN PORTAL & CRM REST API ENDPOINTS
// ==========================================================================

const DATA_DIR = path.join(__dirname, 'data');
function readJsonFile(filename, defaultValue) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading ' + filename + ':', e.message);
    }
    return defaultValue;
}

function writeJsonFile(filename, data) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error writing ' + filename + ':', e.message);
        return false;
    }
}

// 1. Services & Rates API
app.get('/api/services', (req, res) => {
    res.json(readJsonFile('services.json', []));
});

app.post('/api/services', requireAdminAuth, (req, res) => {
    const services = readJsonFile('services.json', []);
    const { id, name, category, rate, turnAround, description } = req.body;
    if (!name) return res.status(400).json({ error: "Service name required" });

    if (id) {
        const idx = services.findIndex(s => String(s.id) === String(id));
        if (idx !== -1) {
            services[idx] = { ...services[idx], name, category, rate, turnAround, description };
        } else {
            services.push({ id, name, category, rate, turnAround, description });
        }
    } else {
        const newId = Date.now();
        services.unshift({ id: newId, name, category, rate, turnAround, description });
    }
    writeJsonFile('services.json', services);
    res.json({ success: true, services });
});

app.delete('/api/services/:id', requireAdminAuth, (req, res) => {
    let services = readJsonFile('services.json', []);
    const targetId = req.params.id;
    services = services.filter(s => String(s.id) !== String(targetId));
    writeJsonFile('services.json', services);
    res.json({ success: true, services });
});

// 2. Blog & Updates API

// Image/Photo upload route for Admin Blog & Scheme Posters
app.post('/api/upload-asset', requireAdminAuth, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }
        const ext = path.extname(req.file.originalname) || '.jpg';
        const filename = 'upload_' + Date.now() + ext;
        const targetPath = path.join(__dirname, 'public', 'assets', filename);
        fs.writeFileSync(targetPath, req.file.buffer);
        res.json({ success: true, url: '/assets/' + filename });
    } catch (err) {
        console.error('Asset upload error:', err);
        res.status(500).json({ error: 'Failed to save uploaded image' });
    }
});


const reportsDir = path.join(__dirname, 'public', 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}


// ==========================================================================
// MOBILE & ANDROID WEBVIEW COMPATIBLE PDF DOWNLOAD ENDPOINTS
// ==========================================================================
app.post('/api/save-pdf', (req, res) => {
    try {
        const { pdfBase64, filename } = req.body;
        if (!pdfBase64) return res.status(400).json({ error: "No PDF data provided" });

        const safeFilename = (filename || ('Passport_Audit_' + Date.now() + '.pdf')).replace(/[^a-zA-Z0-9_.-]/g, '_');
        const filePath = path.join(reportsDir, safeFilename);

        // Strip data:application/pdf;base64, prefix if present
        const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

        res.json({
            success: true,
            downloadUrl: '/api/download-pdf/' + safeFilename,
            filename: safeFilename
        });
    } catch (err) {
        console.error("Save PDF error:", err);
        res.status(500).json({ error: "Failed to save PDF on server: " + err.message });
    }
});

app.get('/api/download-pdf/:filename', (req, res) => {
    try {
        const safeFilename = path.basename(req.params.filename);
        const filePath = path.join(reportsDir, safeFilename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).send("PDF report not found or expired.");
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="' + safeFilename + '"');
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (err) {
        console.error("Download PDF error:", err);
        res.status(500).send("Error downloading PDF: " + err.message);
    }
});



// ==========================================================================
// REAL-TIME NOTIFICATION BROADCAST ENGINE (SSE - SERVER-SENT EVENTS)
// ==========================================================================
const sseClients = new Set();

app.get('/api/live-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    sseClients.add(res);

    // Send initial handshake
    res.write('data: {"type":"connected"}\n\n');

    req.on('close', () => {
        sseClients.delete(res);
    });
});

function broadcastLiveNotification(eventData) {
    const payload = 'data: ' + JSON.stringify(eventData) + '\n\n';
    for (const client of sseClients) {
        try {
            client.write(payload);
        } catch (e) {
            sseClients.delete(client);
        }
    }
}

app.get('/api/blogs', (req, res) => {
    res.json(readJsonFile('blogs.json', []));
});

app.post('/api/blogs', requireAdminAuth, (req, res) => {
    const blogs = readJsonFile('blogs.json', []);
    const { id, title, category, author, summary, content, badge, tagColor, image, date } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });

    const formattedDate = date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const postImage = (image && typeof image === 'string' && image.trim() !== '' && !image.includes('passport-services-poster.jpg')) ? image.trim() : '';

    if (id) {
        const idx = blogs.findIndex(b => String(b.id) === String(id));
        if (idx !== -1) {
            blogs[idx] = { 
                ...blogs[idx], 
                title, 
                category: category || blogs[idx].category || 'General', 
                author: author || 'Hafiz Ramajan', 
                summary, 
                content, 
                badge: badge || category || 'Update', 
                tagColor: tagColor || '#10b981', 
                image: image !== undefined && image !== '' ? image : blogs[idx].image, 
                date: 'Updated' 
            };
        } else {
            blogs.unshift({ 
                id, 
                title, 
                category: category || 'General', 
                author: author || 'Hafiz Ramajan', 
                summary, 
                content, 
                badge: badge || category || 'Update', 
                tagColor: tagColor || '#10b981', 
                image: postImage, 
                date: formattedDate 
            });
        }
    } else {
        const newId = Date.now();
        blogs.unshift({
            id: newId,
            title,
            category: category || 'General',
            author: author || 'Hafiz Ramajan',
            summary,
            content,
            badge: badge || category || 'Update',
            tagColor: tagColor || '#10b981',
            image: postImage,
            date: formattedDate
        });
    }
    writeJsonFile('blogs.json', blogs);
    // Broadcast live notification to all connected websites and APK apps instantly
    try {
        const latestPost = blogs[0];
        broadcastLiveNotification({
            type: 'new_announcement',
            post: latestPost,
            timestamp: Date.now()
        });
        console.log("🚀 Broadcasted live announcement to", sseClients.size, "clients:", latestPost.title);
    } catch (err) {
        console.error("Broadcast notification error:", err);
    }
    res.json({ success: true, blogs });
});

app.delete('/api/blogs/:id', requireAdminAuth, (req, res) => {
    let blogs = readJsonFile('blogs.json', []);
    const targetId = req.params.id;
    blogs = blogs.filter(b => String(b.id) !== String(targetId));
    writeJsonFile('blogs.json', blogs);
    res.json({ success: true, blogs });
});

// 3. User Verification Logs / CRM Lead Reports
app.get('/api/logs', requireAdminAuth, (req, res) => {
    res.json(readJsonFile('logs.json', []));
});

app.post('/api/logs', (req, res) => {
    const logs = readJsonFile('logs.json', []);
    const newLog = {
        id: 'log-' + Date.now(),
        applicantName: req.body.applicantName || 'Unknown Applicant',
        applicantPhone: req.body.applicantPhone || '',
        documentsVerified: req.body.documentsVerified || [],
        status: req.body.status || 'Verified',
        hasMismatch: req.body.hasMismatch || false,
        mismatchCount: req.body.mismatchCount || 0,
        notes: req.body.notes || '',
        timestamp: new Date().toLocaleString()
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    writeJsonFile('logs.json', logs);
    res.json({ success: true, log: newLog });
});

app.delete('/api/logs/:id', requireAdminAuth, (req, res) => {
    let logs = readJsonFile('logs.json', []);
    if (req.params.id === 'all') {
        logs = [];
    } else {
        logs = logs.filter(l => String(l.id) !== String(req.params.id));
    }
    writeJsonFile('logs.json', logs);
    res.json({ success: true, logs });
});


// ==========================================================================
// EXCELLENCE SERVICES - SECURE ADMIN AUTHENTICATION (HMAC SIGNED TOKENS)
// ==========================================================================
function getAdminPassword() {
    return String(process.env.ADMIN_PASSWORD || 'HafizPass@7849').trim();
}

function generateAdminToken() {
    const payload = Date.now().toString();
    const signature = crypto.createHmac('sha256', getAdminPassword()).update(payload).digest('hex');
    return payload + '.' + signature;
}

function verifyAdminToken(token) {
    if (!token || typeof token !== 'string' || !token.includes('.')) return false;
    const [payload, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', getAdminPassword()).update(payload).digest('hex');
    if (signature !== expected) return false;
    // Expire token after 7 days
    const age = Date.now() - parseInt(payload, 10);
    return age > 0 && age < 7 * 24 * 60 * 60 * 1000;
}

function requireAdminAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token || req.headers['x-admin-token']);
    if (token && verifyAdminToken(token)) {
        return next();
    }
    return res.status(401).json({ error: "Access Denied: Sirf authorized admin hi access kar sakte hain." });
}

// 4. Admin Authentication
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body || {};
    const cleanPass = String(password || '').trim();
    const adminPass = getAdminPassword();

    if (!cleanPass) {
        return res.status(400).json({ error: "Password likhna zaroori hai!" });
    }

    if (cleanPass === adminPass) {
        const token = generateAdminToken();
        res.json({ success: true, token });
    } else {
        res.status(401).json({ error: "Galat Password! Access Denied." });
    }
});

app.post('/api/admin/logout', (req, res) => {
    res.json({ success: true });
});


// 5. Admin Dashboard Statistics
app.get('/api/stats', requireAdminAuth, (req, res) => {
    const logs = readJsonFile('logs.json', []);
    const services = readJsonFile('services.json', []);
    const blogs = readJsonFile('blogs.json', []);

    const totalVerifications = logs.length;
    const totalMismatches = logs.filter(l => l.hasMismatch).length;
    const totalCleanMatches = totalVerifications - totalMismatches;

    res.json({
        totalVerifications,
        totalMismatches,
        totalCleanMatches,
        totalServices: services.length,
        totalBlogs: blogs.length
    });
});


// 6. Shop & Contact Profile API (Customizable via Admin Panel)
app.get('/api/shop-info', (req, res) => {
    const defaultInfo = {
        enabled: true,
        shopName: "EXCELLENCE SERVICES",
        ownerName: "Hafiz Ramajan",
        address: "Near Iqra School, Raibag, Dist. Belagavi, Karnataka",
        timing: "10:00 AM to 8:00 PM",
        phone1: "7849008882",
        phone2: "9620746029",
        whatsapp: "https://wa.me/qr/HTPXYYKJAOWWA1",
        instagram: "https://instagram.com/Excellence_Serv_Rbg",
        instagramHandle: "@Excellence_Serv_Rbg",
        email: "ramajanraibag@gmail.com",
        qrImage: "assets/whatsapp-qr.png",
        bannerTitle: "Documents Me Galti Hai Ya Naye Documents Banwane Hain? Hum 100% Sahi Karke Denge!",
        bannerSubtitle: "Passport, PAN Card, Voter ID, ya Marksheet me Name Spelling, DOB, ya Father's Name mismatch ho gaya hai? Ya naya Passport, Voter ID, Police Verification, ya SSP Scholarship karwana ho? Fikar mat karein! Aapka sabhi online kaam 100% legal, fast aur approved karwayen."
    };
    const shopInfo = readJsonFile('shop_info.json', defaultInfo);
    res.json(shopInfo);
});

app.post('/api/shop-info', requireAdminAuth, (req, res) => {
    const info = req.body || {};
    writeJsonFile('shop_info.json', info);
    res.json({ success: true, shopInfo: info });
});

// Dedicated Direct Admin Route (Only accessible via http://localhost:8080/admin)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`\n========================================================`);
    console.log(`🚀 Server running locally at: http://localhost:${PORT}`);
    console.log(`========================================================\n`);
});
