const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Check Gemini API Key on startup
if (!process.env.GEMINI_API_KEY) {
    console.warn("\n========================================================");
    console.warn("⚠️ WARNING: GEMINI_API_KEY environment variable is missing!");
    console.warn("Please add your Google Gemini API Key in the .env file.");
    console.warn("========================================================\n");
}

// Endpoint: Process uploaded document using Google Gemini Vision API
app.post('/api/verify-document', upload.single('document'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "Koi file upload nahi ki gayi!" });
        }

        const apiKey = process.env.GEMINI_API_KEY || req.headers['x-api-key'];
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.status(401).json({
                error: "Gemini API Key missing! Kripya backend ki .env file me valid API key set karein."
            });
        }

        // Initialize Gemini SDK with key
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-3.5-flash" });

        // Convert file buffer to Gemini-compatible GenerativePart object
        const imagePart = {
            inlineData: {
                data: file.buffer.toString('base64'),
                mimeType: file.mimetype
            }
        };

        // System prompt to force structured JSON output and accurate parsing
        const prompt = `
You are an expert Indian KYC document parser. Analyze the uploaded document image and extract the following fields:
1. Name (Applicant's/Holder's full name)
2. Date of Birth (DOB)
3. Father's Name (or S/O, D/O, C/O name)

Strict Guidelines:
- Return the response strictly as a JSON object with keys: "name", "dob", and "fatherName".
- If any field is not printed, not found, or illegible, set its value to "N/A".
- Standardize the DOB to the DD/MM/YYYY format if possible (e.g. 10/12/2002).
- Clean up any trailing scanner watermarks (like "Scanner Go"), symbols, signatures, or page headers from the name.
- Do NOT include any markdown code blocks, backticks (\`\`\`json), or explanations. Return ONLY the raw JSON string.
`;

        // Call Gemini Model
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().trim();

        console.log(`Gemini Raw Response for ${file.originalname}:`, responseText);

        // Strip any markdown tick frames if Gemini adds them despite the prompt instructions
        let cleanJsonStr = responseText;
        if (cleanJsonStr.startsWith('```')) {
            cleanJsonStr = cleanJsonStr.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
        }

        // Parse extracted JSON
        let parsedData;
        try {
            parsedData = JSON.parse(cleanJsonStr);
        } catch (jsonErr) {
            console.error("JSON parsing failed, attempting fuzzy match extraction", jsonErr);
            // Fallback fuzzy extraction if JSON output was malformed
            parsedData = {
                name: extractFieldFuzzy(responseText, 'name'),
                dob: extractFieldFuzzy(responseText, 'dob'),
                fatherName: extractFieldFuzzy(responseText, 'fatherName')
            };
        }

        // Also return the raw text block recognized by Gemini for debug logs
        res.json({
            success: true,
            name: parsedData.name || 'N/A',
            dob: parsedData.dob || 'N/A',
            fatherName: parsedData.fatherName || 'N/A',
            rawText: responseText
        });

    } catch (err) {
        console.error("Error processing document verification request", err);
        res.status(500).json({ error: "Document verify karne me error aaya: " + err.message });
    }
});

// Fuzzy regex helper in case JSON parsing breaks
function extractFieldFuzzy(text, field) {
    const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'i');
    const match = text.match(regex);
    return match ? match[1] : 'N/A';
}

// Redirect all other queries to frontend index
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`\n========================================================`);
    console.log(`🚀 Server running locally at: http://localhost:${PORT}`);
    console.log(`========================================================\n`);
});
