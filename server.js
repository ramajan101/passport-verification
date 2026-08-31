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

        const apiKey = req.headers['x-api-key'] || process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.status(401).json({
                error: "Gemini API Key missing! Kripya header controls me key enter karein ya backend ki .env file check karein."
            });
        }

        // Initialize Gemini SDK with key
        const ai = new GoogleGenerativeAI(apiKey);

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
4. Document Number (The unique identification number of the document, e.g., 12-digit Aadhaar number like "XXXX XXXX XXXX", 10-character PAN number like "ABCDE1234F", Voter ID alphanumeric number, or any other primary identification number printed on the document)

Strict Guidelines:
- Return the response strictly as a JSON object with keys: "name", "dob", "fatherName", and "documentNumber".
- If any field is not printed, not found, or illegible, set its value to "N/A".
- Standardize the DOB to the DD/MM/YYYY format if possible (e.g. 10/12/2002).
- Clean up any trailing scanner watermarks, symbols, signatures, or page headers.
- Do NOT include any markdown code blocks, backticks (\`\`\`json), or explanations. Return ONLY the raw JSON string.
`;

        // Model fallback cycle to bypass 429 quota/rate limits (cycles through active models, skipping deprecated ones)
        const modelsToTry = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
        let result = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[OCR] Attempting extraction with model: ${modelName}`);
                const model = ai.getGenerativeModel({ model: modelName });
                result = await generateContentWithRetry(model, prompt, imagePart, 2, 1000);
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
                fatherName: extractFieldFuzzy(responseText, 'fatherName'),
                documentNumber: extractFieldFuzzy(responseText, 'documentNumber')
            };
        }

        // Also return the raw text block recognized by Gemini for debug logs
        res.json({
            success: true,
            name: parsedData.name || 'N/A',
            dob: parsedData.dob || 'N/A',
            fatherName: parsedData.fatherName || 'N/A',
            documentNumber: parsedData.documentNumber || 'N/A',
            rawText: responseText
        });

    } catch (err) {
        console.error("Error processing document verification request", err);
        res.status(500).json({ error: "Document verify karne me error aaya: " + err.message });
    }
});

// Helper function to call Gemini model with exponential backoff on 429 rate limit
async function generateContentWithRetry(model, prompt, imagePart, retries = 3, initialDelayMs = 2000) {
    let delay = initialDelayMs;
    for (let i = 0; i < retries; i++) {
        try {
            return await model.generateContent([prompt, imagePart]);
        } catch (err) {
            const errStr = err.message || "";
            const isRateLimit = errStr.includes('429') || 
                                errStr.toLowerCase().includes('quota') || 
                                errStr.toLowerCase().includes('rate limit') || 
                                errStr.toLowerCase().includes('too many requests');
            
            if (isRateLimit && i < retries - 1) {
                console.warn(`[Gemini API 429] Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
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
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`\n========================================================`);
    console.log(`🚀 Server running locally at: http://localhost:${PORT}`);
    console.log(`========================================================\n`);
});
