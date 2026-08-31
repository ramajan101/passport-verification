// Passport Document Verification System - Frontend App
// Communicates with backend Express server + Google Gemini Vision API

// Configure PDF.js Worker
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';


// Multilingual Translations Dictionary
const translations = {
    en: {
        title: "Passport Document Verification System",
        subtitle: "Upload and cross-verify documents using secure client-side PDF rendering & AI OCR.",
        addDoc: "Add Custom Document",
        verify: "Verify Documents",
        reset: "Reset All",
        statusInitial: "Aadhaar and PAN are mandatory. Please upload both.",
        statusNeedMandatory: "All mandatory documents must be uploaded.",
        statusReady: "Click the Verify button to start the verification process.",
        verdictSuccess: "All documents match successfully.",
        verdictError: "Mismatch found! Please correct the highlighted fields.",
        field: "Field",
        statusCol: "Status",
        fieldName: "Name",
        fieldDob: "Date of Birth (DOB)",
        fieldFather: "Father's Name",
        fieldDocNumber: "Document Number",
        btnShowRaw: "Show Raw Extracted Text",
        btnHideRaw: "Hide Raw Extracted Text",
        modalTitle: "Add Custom Document",
        modalDocLabel: "Document Name (e.g., Voter ID, Driving License)",
        modalMandatoryLabel: "Is this document mandatory?",
        modalCancel: "Cancel",
        modalSubmit: "Add Document",
        badgeMandatory: "Mandatory",
        badgeOptional: "Optional",
        uploadText: "Drag & drop your file here",
        uploadSubtext: "Supports PNG, JPG, JPEG, PDF up to 10MB",
        statusTextPending: "Pending",
        statusTextUploaded: "File Uploaded",
        statusTextProcessing: "AI OCR processing...",
        statusTextDone: "Completed successfully",
        statusTextError: "Verification Failed",
        inputPlaceholderName: "Type name...",
        inputPlaceholderDob: "DD/MM/YYYY",
        inputPlaceholderFather: "Type father's name...",
        inputPlaceholderDocNumber: "Type document number...",
        matchBadge: "Match",
        mismatchBadge: "Mismatch",
        ignoredBadge: "Ignored (Need 2+ docs)",
        infoOnly: "Number",
        rawLogsTitle: "Raw Extracted Text Logs",
        aadhaarTitle: "Aadhaar Card",
        panTitle: "PAN Card",
        marksheetTitle: "10th Marksheet",
        closeReport: "Close Report"
    },
    hi: {
        title: "पासपोर्ट दस्तावेज़ सत्यापन प्रणाली",
        subtitle: "सुरक्षित पीडीएफ रेंडरिंग और एआई ओसीआर का उपयोग करके दस्तावेज़ों का सत्यापन करें।",
        addDoc: "कस्टम दस्तावेज़ जोड़ें",
        verify: "दस्तावेज़ सत्यापित करें",
        reset: "सब रीसेट करें",
        statusInitial: "आधार और पैन अनिवार्य हैं। कृपया दोनों अपलोड करें।",
        statusNeedMandatory: "सभी अनिवार्य दस्तावेज़ अपलोड करना आवश्यक है।",
        statusReady: "सत्यापन प्रक्रिया शुरू करने के लिए सत्यापित करें बटन पर क्लिक करें।",
        verdictSuccess: "सभी दस्तावेज़ सफलतापूर्वक मेल खाते हैं।",
        verdictError: "असंगति मिली! कृपया हाइलाइट किए गए फ़ील्ड को ठीक करें।",
        field: "फ़ील्ड",
        statusCol: "स्थिति",
        fieldName: "नाम",
        fieldDob: "जन्म तिथि (DOB)",
        fieldFather: "पिता का नाम",
        fieldDocNumber: "दस्तावेज़ संख्या (ID)",
        btnShowRaw: "रॉ एक्सट्रैक्टेड टेक्स्ट दिखाएं",
        btnHideRaw: "रॉ एक्सट्रैक्टेड टेक्स्ट छुपाएं",
        modalTitle: "कस्टम दस्तावेज़ जोड़ें",
        modalDocLabel: "दस्तावेज़ का नाम (जैसे, वोटर आईडी, ड्राइविंग लाइसेंस)",
        modalMandatoryLabel: "क्या यह दस्तावेज़ अनिवार्य है?",
        modalCancel: "रद्द करें",
        modalSubmit: "दस्तावेज़ जोड़ें",
        badgeMandatory: "अनिवार्य",
        badgeOptional: "वैकल्पिक",
        uploadText: "अपनी फ़ाइल यहाँ खींचें और छोड़ें",
        uploadSubtext: "PNG, JPG, JPEG, PDF (अधिकतम 10MB) का समर्थन करता है",
        statusTextPending: "लंबित",
        statusTextUploaded: "फ़ाइल अपलोड हो गई",
        statusTextProcessing: "एआई ओसीआर चल रहा है...",
        statusTextDone: "सफलतापूर्वक पूर्ण",
        statusTextError: "सत्यापन विफल",
        inputPlaceholderName: "नाम लिखें...",
        inputPlaceholderDob: "दिन/महीना/साल",
        inputPlaceholderFather: "पिता का नाम लिखें...",
        inputPlaceholderDocNumber: "दस्तावेज़ नंबर लिखें...",
        matchBadge: "समान",
        mismatchBadge: "असमान",
        ignoredBadge: "अनदेखा (2+ दस्तावेज़ चाहिए)",
        infoOnly: "संख्या",
        rawLogsTitle: "रॉ एक्सट्रैक्टेड टेक्स्ट लॉग्स",
        aadhaarTitle: "आधार कार्ड",
        panTitle: "पैन कार्ड",
        marksheetTitle: "10वीं की मार्कशीट",
        closeReport: "रिपोर्ट बंद करें"
    },
    ur: {
        title: "پاسپورٹ دستاویز کی تصدیق کا نظام",
        subtitle: "محفوظ پی ڈی ایف رینڈرنگ اور اے آئی او سی آر کا استعمال کرتے ہوئے دستاویزات کی تصدیق کریں۔",
        addDoc: "اپنی مرضی کی دستاویز شامل کریں",
        verify: "دستاویزات کی تصدیق کریں",
        reset: "سب ری سیٹ کریں",
        statusInitial: "آدھار اور پین لازمی ہیں۔ براہ کرم دونوں اپ لوڈ کریں۔",
        statusNeedMandatory: "تمام لازمی دستاویزات اپ لوڈ کرنا ضروری ہے۔",
        statusReady: "تصدیق کا عمل شروع کرنے کے لیے تصدیق کریں بٹن پر کلک کریں۔",
        verdictSuccess: "تمام دستاویزات کامیابی کے ساتھ مماثل ہیں۔",
        verdictError: "فرق ملا! براہ کرم ہائی لائٹ کردہ حصوں کو درست کریں۔",
        field: "فیلڈ",
        statusCol: "حالت",
        fieldName: "نام",
        fieldDob: "تاریخ پیدائش (DOB)",
        fieldFather: "والد کا نام",
        fieldDocNumber: "دستاویز نمبر",
        btnShowRaw: "نکالا گیا متن دکھائیں",
        btnHideRaw: "نکالا گیا متن چھپائیں",
        modalTitle: "اپنی مرضی کی دستاویز شامل کریں",
        modalDocLabel: "دسامیز کا نام (جیسے ووٹر آئی ڈی، ڈرائیونگ لائسنس)",
        modalMandatoryLabel: "کیا یہ دستاویز لازمی ہے؟",
        modalCancel: "منسوخ کریں",
        modalSubmit: "دستاویز شامل کریں",
        badgeMandatory: "لازمی",
        badgeOptional: "اختیاری",
        uploadText: "اپنی فائل یہاں ڈریگ اور ڈراپ کریں",
        uploadSubtext: "PNG, JPG, JPEG, PDF (زیادہ سے زیادہ 10MB) سپورٹ کرتا ہے",
        statusTextPending: "زیر التواء",
        statusTextUploaded: "فائل اپ لوڈ ہو گئی",
        statusTextProcessing: "اے آئی او سی آر پروسیسنگ...",
        statusTextDone: "کامیابی سے مکمل",
        statusTextError: "تصدیق ناکام",
        inputPlaceholderName: "نام لکھیں...",
        inputPlaceholderDob: "تاریخ/مہینہ/سال",
        inputPlaceholderFather: "والد کا نام لکھیں...",
        inputPlaceholderDocNumber: "دستاویز کا نمبر لکھیں...",
        matchBadge: "مماثل",
        mismatchBadge: "غیر مماثل",
        ignoredBadge: "نظر انداز (2+ دستاویزات درکار)",
        infoOnly: "نمبر",
        rawLogsTitle: "نکالے گئے متن کا لاگ",
        aadhaarTitle: "آدھار کارڈ",
        panTitle: "پین کارڈ",
        marksheetTitle: "دسویں کی مارک شیٹ",
        closeReport: "رپورٹ بند کریں"
    },
    roman: {
        title: "Passport Document Verification System",
        subtitle: "Upload aur cross-verify karein secure client-side PDF rendering aur AI OCR ke zariye.",
        addDoc: "Custom Document Add Karein",
        verify: "Verify Documents",
        reset: "Reset All",
        statusInitial: "Aadhaar aur PAN mandatory hain. Kripya dono upload karein.",
        statusNeedMandatory: "Sab mandatory documents upload karna lazmi hai.",
        statusReady: "Verify button par click karke verification process shuru karein.",
        verdictSuccess: "Sab documents match kar rahe hain.",
        verdictError: "Mismatch mila! Kripya highlighted fields ko theek karein.",
        field: "Field",
        statusCol: "Status",
        fieldName: "Name",
        fieldDob: "Date of Birth (DOB)",
        fieldFather: "Father's Name",
        fieldDocNumber: "Document Number",
        btnShowRaw: "Show Raw Extracted Text",
        btnHideRaw: "Hide Raw Extracted Text",
        modalTitle: "Custom Document Add Karein",
        modalDocLabel: "Document Name (e.g., Voter ID, Driving License)",
        modalMandatoryLabel: "Kya yeh document mandatory hai?",
        modalCancel: "Cancel",
        modalSubmit: "Add Document",
        badgeMandatory: "Mandatory",
        badgeOptional: "Optional",
        uploadText: "Drag & drop karein file yaha",
        uploadSubtext: "Supports PNG, JPG, JPEG, PDF up to 10MB",
        statusTextPending: "Pending",
        statusTextUploaded: "File Uploaded",
        statusTextProcessing: "AI OCR processing...",
        statusTextDone: "Completed successfully",
        statusTextError: "Verification Failed",
        inputPlaceholderName: "Type name...",
        inputPlaceholderDob: "DD/MM/YYYY",
        inputPlaceholderFather: "Type father's name...",
        inputPlaceholderDocNumber: "Type document number...",
        matchBadge: "Match",
        mismatchBadge: "Mismatch",
        ignoredBadge: "Ignored (Need 2+ docs)",
        infoOnly: "Number",
        rawLogsTitle: "Raw Extracted Text Logs",
        aadhaarTitle: "Aadhaar Card",
        panTitle: "PAN Card",
        marksheetTitle: "10th Marksheet",
        closeReport: "Close Report"
    }
};

// Global App States
let currentLang = localStorage.getItem('appLanguage') || 'roman';
let activeTheme = localStorage.getItem('appTheme') || 'dark';

// Application State (Document Structure)
let documents = [
    {
        id: 'aadhaar',
        title: 'Aadhaar Card',
        mandatory: true,
        file: null,
        processedBlob: null,
        status: 'pending',
        progress: 0,
        rawText: '',
        name: 'N/A',
        dob: 'N/A',
        fatherName: 'N/A',
        documentNumber: 'N/A'
    },
    {
        id: 'pan',
        title: 'PAN Card',
        mandatory: true,
        file: null,
        processedBlob: null,
        status: 'pending',
        progress: 0,
        rawText: '',
        name: 'N/A',
        dob: 'N/A',
        fatherName: 'N/A',
        documentNumber: 'N/A'
    },
    {
        id: 'marksheet',
        title: '10th Marksheet',
        mandatory: false,
        file: null,
        processedBlob: null,
        status: 'pending',
        progress: 0,
        rawText: '',
        name: 'N/A',
        dob: 'N/A',
        fatherName: 'N/A',
        documentNumber: 'N/A'
    }
];

// Initialize UI Elements & Translation System
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguageSelector();
    initApiKeyInput();
    applyTranslations();
    setupGlobalEventListeners();
});

// Load and save custom Gemini API key
function initApiKeyInput() {
    const keyInput = document.getElementById('api-key-input');
    if (keyInput) {
        keyInput.value = localStorage.getItem('customGeminiApiKey') || '';
        keyInput.addEventListener('input', (e) => {
            localStorage.setItem('customGeminiApiKey', e.target.value.trim());
        });
    }
}

// Setup Theme State on Startup
function initTheme() {
    if (activeTheme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('theme-toggle-btn').textContent = '☀️';
    } else {
        document.body.classList.remove('light-theme');
        document.getElementById('theme-toggle-btn').textContent = '🌙';
    }

    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.remove('light-theme');
            document.getElementById('theme-toggle-btn').textContent = '🌙';
            activeTheme = 'dark';
        } else {
            document.body.classList.add('light-theme');
            document.getElementById('theme-toggle-btn').textContent = '☀️';
            activeTheme = 'light';
        }
        localStorage.setItem('appTheme', activeTheme);
    });
}

// Setup Language Selector
function initLanguageSelector() {
    const langSelect = document.getElementById('lang-select');
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('appLanguage', currentLang);
        applyTranslations();
    });
}

// Apply Translations to DOM Elements
function applyTranslations() {
    const dict = translations[currentLang];
    
    // Set layout direction (RTL for Urdu, LTR for others)
    if (currentLang === 'ur') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
    
    // Text contents translation
    document.getElementById('i18n-page-title').textContent = dict.title;
    document.getElementById('i18n-title').textContent = dict.title;
    document.getElementById('i18n-subtitle').textContent = dict.subtitle;
    
    document.getElementById('i18n-add-doc').textContent = dict.addDoc;
    document.getElementById('i18n-verify').textContent = dict.verify;
    document.getElementById('i18n-reset').textContent = dict.reset;
    
    document.getElementById('i18n-report-title').textContent = dict.title + " Report";
    document.getElementById('i18n-table-field').textContent = dict.field;
    document.getElementById('i18n-table-status').textContent = dict.statusCol;
    
    const closeReportBtn = document.getElementById('close-report-btn');
    if (closeReportBtn) {
        closeReportBtn.textContent = dict.closeReport || 'Close Report';
    }
    
    const toggleBtn = document.getElementById('toggle-raw-text-btn');
    const rawTextSec = document.getElementById('raw-text-section');
    if (toggleBtn) {
        toggleBtn.textContent = rawTextSec.classList.contains('hidden') ? dict.btnShowRaw : dict.btnHideRaw;
    }
    
    document.getElementById('i18n-raw-logs-title').textContent = dict.rawLogsTitle;
    document.getElementById('i18n-modal-title').textContent = dict.modalTitle;
    document.getElementById('i18n-modal-label').textContent = dict.modalDocLabel;
    document.getElementById('i18n-modal-mandatory').textContent = dict.modalMandatoryLabel;
    document.getElementById('modal-cancel-btn').textContent = dict.modalCancel;
    document.getElementById('modal-submit-btn').textContent = dict.modalSubmit;
    
    // Refresh grids and status with updated languages
    updateGlobalStatus();
    renderDocumentGrid();
    
    // Refresh report if currently opened
    const reportSec = document.getElementById('verification-report-section');
    if (!reportSec.classList.contains('hidden')) {
        compileVerificationResults();
    }
}

// Setup Main Event Listeners
function setupGlobalEventListeners() {
    document.getElementById('add-doc-btn').addEventListener('click', openModal);
    document.getElementById('reset-all-btn').addEventListener('click', resetAll);
    document.getElementById('verify-all-btn').addEventListener('click', performVerification);

    document.getElementById('toggle-raw-text-btn').addEventListener('click', () => {
        const rawTextSec = document.getElementById('raw-text-section');
        const toggleBtn = document.getElementById('toggle-raw-text-btn');
        const dict = translations[currentLang];
        
        if (rawTextSec.classList.contains('hidden')) {
            rawTextSec.classList.remove('hidden');
            toggleBtn.textContent = dict.btnHideRaw;
        } else {
            rawTextSec.classList.add('hidden');
            toggleBtn.textContent = dict.btnShowRaw;
        }
    });

    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-submit-btn').addEventListener('click', handleAddCustomDoc);
    
    document.getElementById('custom-doc-modal').addEventListener('click', (e) => {
        if (e.target.id === 'custom-doc-modal') closeModal();
    });
    
    document.getElementById('close-report-btn').addEventListener('click', () => {
        document.getElementById('verification-report-section').classList.add('hidden');
    });
    
    document.getElementById('verification-report-section').addEventListener('click', (e) => {
        if (e.target.id === 'verification-report-section') {
            document.getElementById('verification-report-section').classList.add('hidden');
        }
    });
}

// Render the grid containing document cards
function renderDocumentGrid() {
    const grid = document.getElementById('document-grid');
    grid.innerHTML = '';
    const dict = translations[currentLang];

    documents.forEach((doc) => {
        const card = document.createElement('article');
        card.className = `doc-card animate-fade-in ${doc.status === 'done' ? 'completed' : ''} ${doc.status === 'processing' ? 'processing' : ''}`;
        card.id = `card-${doc.id}`;

        // Header Section
        const header = document.createElement('div');
        header.className = 'doc-header';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'doc-title';
        let translatedTitle = doc.title;
        if (doc.id === 'aadhaar') translatedTitle = dict.aadhaarTitle || doc.title;
        else if (doc.id === 'pan') translatedTitle = dict.panTitle || doc.title;
        else if (doc.id === 'marksheet') translatedTitle = dict.marksheetTitle || doc.title;
        titleSpan.textContent = translatedTitle;

        const badge = document.createElement('span');
        badge.className = `badge ${doc.mandatory ? 'badge-mandatory' : 'badge-optional'}`;
        badge.textContent = doc.mandatory ? dict.badgeMandatory : dict.badgeOptional;

        const rightSideHeader = document.createElement('div');
        rightSideHeader.style.display = 'flex';
        rightSideHeader.style.alignItems = 'center';
        rightSideHeader.style.gap = '8px';
        rightSideHeader.appendChild(badge);

        if (doc.id !== 'aadhaar' && doc.id !== 'pan' && doc.id !== 'marksheet') {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-remove-doc';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove Document';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeDocument(doc.id);
            });
            rightSideHeader.appendChild(removeBtn);
        }

        header.appendChild(titleSpan);
        header.appendChild(rightSideHeader);
        card.appendChild(header);

        // Body Section (Upload Zone / File Details)
        if (!doc.file) {
            const uploadZone = document.createElement('div');
            uploadZone.className = 'upload-zone';
            uploadZone.innerHTML = `
                <div class="upload-icon">📤</div>
                <div class="upload-text">${dict.uploadText}</div>
                <div class="upload-subtext">${dict.uploadSubtext}</div>
            `;

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.className = 'file-input';
            fileInput.accept = '.png,.jpg,.jpeg,.pdf';
            
            uploadZone.addEventListener('click', () => fileInput.click());
            
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('dragover');
            });
            uploadZone.addEventListener('dragleave', () => {
                uploadZone.classList.remove('dragover');
            });
            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    handleFileSelect(doc.id, e.dataTransfer.files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileSelect(doc.id, e.target.files[0]);
                }
            });

            card.appendChild(uploadZone);
            card.appendChild(fileInput);
        } else {
            const fileDisplay = document.createElement('div');
            fileDisplay.className = 'file-display';

            // Preview Thumbnail Box
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-container';
            previewContainer.id = `preview-${doc.id}`;
            previewContainer.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">Generating preview...</span>`;
            fileDisplay.appendChild(previewContainer);

            // File Info
            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';

            const fileIcon = document.createElement('span');
            fileIcon.className = 'icon-file';
            fileIcon.textContent = doc.file.type === 'application/pdf' ? '📄' : '🖼️';

            const fileMeta = document.createElement('div');
            fileMeta.className = 'file-meta';
            
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = doc.file.name;
            fileName.title = doc.file.name;

            const fileSize = document.createElement('div');
            fileSize.className = 'file-size';
            fileSize.textContent = formatBytes(doc.file.size);

            fileMeta.appendChild(fileName);
            fileMeta.appendChild(fileSize);

            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn-clear-file';
            clearBtn.innerHTML = '🗑️';
            clearBtn.title = 'Clear File';
            clearBtn.addEventListener('click', () => {
                clearFile(doc.id);
            });

            fileInfo.appendChild(fileIcon);
            fileInfo.appendChild(fileMeta);
            fileInfo.appendChild(clearBtn);
            fileDisplay.appendChild(fileInfo);

            // Status indicator
            const progressWrapper = document.createElement('div');
            progressWrapper.className = 'progress-wrapper';

            const statusIndicator = document.createElement('div');
            statusIndicator.className = `status-indicator status-${doc.status}`;
            
            let statusText = dict.statusTextPending;
            if (doc.status === 'uploaded') statusText = dict.statusTextUploaded;
            if (doc.status === 'processing') statusText = dict.statusTextProcessing;
            if (doc.status === 'done') statusText = dict.statusTextDone;
            if (doc.status === 'error') statusText = dict.statusTextError;

            statusIndicator.innerHTML = `<span class="dot"></span> <span>${statusText}</span>`;
            progressWrapper.appendChild(statusIndicator);

            if (doc.status === 'processing') {
                const barContainer = document.createElement('div');
                barContainer.className = 'progress-bar-container';
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.style.width = '100%';
                progressBar.style.animation = 'blink 1.2s infinite ease-in-out';
                barContainer.appendChild(progressBar);
                progressWrapper.appendChild(barContainer);
            }

            fileDisplay.appendChild(progressWrapper);

            // Parsed Fields Display (Editable inputs for manual corrections)
            const parsedFieldsDiv = document.createElement('div');
            parsedFieldsDiv.className = 'parsed-fields-mini';
            
            // Name input row
            const nameRow = document.createElement('div');
            nameRow.className = 'parsed-field-row-input';
            nameRow.innerHTML = `
                <span class="parsed-label">${dict.fieldName}:</span>
                <input type="text" class="parsed-input" id="input-name-${doc.id}" value="${doc.name === 'N/A' ? '' : doc.name}" placeholder="${dict.inputPlaceholderName}">
            `;
            const nameInput = nameRow.querySelector('input');
            nameInput.addEventListener('input', (e) => {
                doc.name = e.target.value.trim() || 'N/A';
                compileVerificationResults();
            });
            parsedFieldsDiv.appendChild(nameRow);

            // DOB input row
            const dobRow = document.createElement('div');
            dobRow.className = 'parsed-field-row-input';
            dobRow.innerHTML = `
                <span class="parsed-label">${dict.fieldDob}:</span>
                <input type="text" class="parsed-input" id="input-dob-${doc.id}" value="${doc.dob === 'N/A' ? '' : doc.dob}" placeholder="${dict.inputPlaceholderDob}">
            `;
            const dobInput = dobRow.querySelector('input');
            dobInput.addEventListener('input', (e) => {
                doc.dob = e.target.value.trim() || 'N/A';
                compileVerificationResults();
            });
            parsedFieldsDiv.appendChild(dobRow);

            // Father's Name input row
            const fatherRow = document.createElement('div');
            fatherRow.className = 'parsed-field-row-input';
            fatherRow.innerHTML = `
                <span class="parsed-label">${dict.fieldFather}:</span>
                <input type="text" class="parsed-input" id="input-father-${doc.id}" value="${doc.fatherName === 'N/A' ? '' : doc.fatherName}" placeholder="${dict.inputPlaceholderFather}">
            `;
            const fatherInput = fatherRow.querySelector('input');
            fatherInput.addEventListener('input', (e) => {
                doc.fatherName = e.target.value.trim() || 'N/A';
                compileVerificationResults();
            });
            parsedFieldsDiv.appendChild(fatherRow);

            // Document Number input row
            const docNumberRow = document.createElement('div');
            docNumberRow.className = 'parsed-field-row-input';
            docNumberRow.innerHTML = `
                <span class="parsed-label">${dict.fieldDocNumber}:</span>
                <input type="text" class="parsed-input" id="input-docnumber-${doc.id}" value="${doc.documentNumber === 'N/A' ? '' : doc.documentNumber}" placeholder="${dict.inputPlaceholderDocNumber}">
            `;
            const docNumberInput = docNumberRow.querySelector('input');
            docNumberInput.addEventListener('input', (e) => {
                doc.documentNumber = e.target.value.trim() || 'N/A';
                compileVerificationResults();
            });
            parsedFieldsDiv.appendChild(docNumberRow);
            
            fileDisplay.appendChild(parsedFieldsDiv);
            card.appendChild(fileDisplay);

            setTimeout(() => generateThumbnail(doc), 50);
        }

        grid.appendChild(card);
    });
}

// Compress and resize image files to lightweight JPEGs (optimized for low-latency transmission)
function compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.75) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                let width = img.width;
                let height = img.height;

                // Scale down if larger than max dimensions
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = () => resolve(file);
            img.src = event.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}

// Handling File Drop/Select
async function handleFileSelect(docId, file) {
    const limit = 15 * 1024 * 1024; // Allow up to 15MB originals for local compression
    if (file.size > limit) {
        alert("File size 15MB se kam honi chahiye!");
        return;
    }

    const allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        alert("Faqat PNG, JPG, JPEG, aur PDF support hote hain!");
        return;
    }

    let finalFile = file;
    if (file.type.startsWith('image/')) {
        // Compress image client side
        finalFile = await compressImage(file);
    }

    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex > -1) {
        documents[docIndex].file = finalFile;
        documents[docIndex].processedBlob = null;
        documents[docIndex].status = 'uploaded';
        documents[docIndex].progress = 0;
        documents[docIndex].rawText = '';
        documents[docIndex].name = 'N/A';
        documents[docIndex].dob = 'N/A';
        documents[docIndex].fatherName = 'N/A';
        documents[docIndex].documentNumber = 'N/A';
        
        renderDocumentGrid();
        updateGlobalStatus();
        
        document.getElementById('verification-report-section').classList.add('hidden');
        document.getElementById('raw-text-section').classList.add('hidden');
        
        const inlineReport = document.getElementById('inline-report-section');
        if (inlineReport) inlineReport.classList.add('hidden');

        if (finalFile.type === 'application/pdf') {
            generatePdfBlob(documents[docIndex]);
        }
    }
}

// Generate PDF Page 1 image blob on frontend side
async function generatePdfBlob(doc) {
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            try {
                const typedarray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                const page = await pdf.getPage(1);
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                const viewport = page.getViewport({ scale: 1.5 }); // Speed up by using 1.5 scale
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                canvas.toBlob((blob) => {
                    doc.processedBlob = blob;
                }, 'image/jpeg', 0.85); // JPEG instead of PNG for 10x smaller size

            } catch (e) {
                console.error("PDF Blob generation failed", e);
            }
        };
        fileReader.readAsArrayBuffer(doc.file);
    } catch (err) {
        console.error(err);
    }
}

// Generate thumbnail previews for PDF/Images
async function generateThumbnail(doc) {
    const previewContainer = document.getElementById(`preview-${doc.id}`);
    if (!previewContainer) return;

    try {
        if (doc.file.type === 'application/pdf') {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                try {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                    const page = await pdf.getPage(1);
                    
                    const canvas = document.createElement('canvas');
                    canvas.className = 'preview-canvas';
                    const context = canvas.getContext('2d');
                    
                    const viewport = page.getViewport({ scale: 0.6 });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    previewContainer.innerHTML = '';
                    previewContainer.appendChild(canvas);
                } catch (pdfErr) {
                    console.error("PDF thumbnail generation failed", pdfErr);
                    previewContainer.innerHTML = `<span style="color: var(--error); font-size: 0.8rem;">PDF render failed</span>`;
                }
            };
            fileReader.readAsArrayBuffer(doc.file);
        } else {
            const img = document.createElement('img');
            img.className = 'preview-image';
            img.src = URL.createObjectURL(doc.file);
            img.onload = () => {
                previewContainer.innerHTML = '';
                previewContainer.appendChild(img);
            };
            img.onerror = () => {
                previewContainer.innerHTML = `<span style="color: var(--error); font-size: 0.8rem;">Image load failed</span>`;
            };
        }
    } catch (e) {
        console.error(e);
        previewContainer.innerHTML = `<span style="color: var(--error); font-size: 0.8rem;">Preview failed</span>`;
    }
}

// Clear loaded file from document
function clearFile(docId) {
    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex > -1) {
        documents[docIndex].file = null;
        documents[docIndex].processedBlob = null;
        documents[docIndex].status = 'pending';
        documents[docIndex].progress = 0;
        documents[docIndex].rawText = '';
        documents[docIndex].name = 'N/A';
        documents[docIndex].dob = 'N/A';
        documents[docIndex].fatherName = 'N/A';
        documents[docIndex].documentNumber = 'N/A';
        
        renderDocumentGrid();
        updateGlobalStatus();
        
        document.getElementById('verification-report-section').classList.add('hidden');
        document.getElementById('raw-text-section').classList.add('hidden');
        
        const inlineReport = document.getElementById('inline-report-section');
        if (inlineReport) inlineReport.classList.add('hidden');
    }
}

// Remove custom document fully
function removeDocument(docId) {
    documents = documents.filter(d => d.id !== docId);
    renderDocumentGrid();
    updateGlobalStatus();
    
    document.getElementById('verification-report-section').classList.add('hidden');
    document.getElementById('raw-text-section').classList.add('hidden');
    
    const inlineReport = document.getElementById('inline-report-section');
    if (inlineReport) inlineReport.classList.add('hidden');
}

// Global Status message updates & Button state toggles
function updateGlobalStatus() {
    const aadhaarUploaded = documents.find(d => d.id === 'aadhaar')?.file !== null;
    const panUploaded = documents.find(d => d.id === 'pan')?.file !== null;
    const verifyBtn = document.getElementById('verify-all-btn');
    const dict = translations[currentLang];

    const mandatoryDocs = documents.filter(d => d.mandatory);
    const allMandatoryUploaded = mandatoryDocs.every(d => d.file !== null);

    if (!aadhaarUploaded || !panUploaded) {
        showGlobalMessage(dict.statusInitial, "info");
        verifyBtn.disabled = true;
    } else if (!allMandatoryUploaded) {
        showGlobalMessage(dict.statusNeedMandatory, "info");
        verifyBtn.disabled = true;
    } else {
        showGlobalMessage(dict.statusReady, "success");
        verifyBtn.disabled = false;
    }
}

// Reset application state
function resetAll() {
    documents.forEach((doc, idx) => {
        documents[idx].file = null;
        documents[idx].processedBlob = null;
        documents[idx].status = 'pending';
        documents[idx].progress = 0;
        documents[idx].rawText = '';
        documents[idx].name = 'N/A';
        documents[idx].dob = 'N/A';
        documents[idx].fatherName = 'N/A';
        documents[idx].documentNumber = 'N/A';
    });

    documents = documents.slice(0, 3);
    renderDocumentGrid();
    updateGlobalStatus();

    document.getElementById('verification-report-section').classList.add('hidden');
    document.getElementById('raw-text-section').classList.add('hidden');
    
    const inlineReport = document.getElementById('inline-report-section');
    if (inlineReport) inlineReport.classList.add('hidden');
}

// Display messages in status banner
function showGlobalMessage(msg, type) {
    const banner = document.getElementById('global-status-message');
    const textEl = document.getElementById('global-status-text');
    textEl.textContent = msg;

    banner.className = 'info-banner';
    if (type === 'success') banner.classList.add('success');
    if (type === 'error') banner.classList.add('error');
}

// Modal handling logic
function openModal() {
    document.getElementById('custom-doc-modal').classList.remove('hidden');
    document.getElementById('custom-doc-title').value = '';
    document.getElementById('custom-doc-mandatory').checked = false;
    document.getElementById('custom-doc-title').focus();
}

function closeModal() {
    document.getElementById('custom-doc-modal').classList.add('hidden');
}

function handleAddCustomDoc() {
    const titleVal = document.getElementById('custom-doc-title').value.trim();
    const isMandatory = document.getElementById('custom-doc-mandatory').checked;

    if (!titleVal) {
        alert("Kripya document ka naam enter karein!");
        return;
    }

    const cleanId = 'custom-' + titleVal.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (documents.some(d => d.id === cleanId)) {
        alert("Yeh document pehle se majood hai!");
        return;
    }

    documents.push({
        id: cleanId,
        title: titleVal,
        mandatory: isMandatory,
        file: null,
        processedBlob: null,
        status: 'pending',
        progress: 0,
        rawText: '',
        name: 'N/A',
        dob: 'N/A',
        fatherName: 'N/A',
        documentNumber: 'N/A'
    });

    closeModal();
    renderDocumentGrid();
    updateGlobalStatus();
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper to wait until PDF rendering finishes generating the image blob
function waitForBlob(doc) {
    return new Promise((resolve) => {
        if (doc.processedBlob) return resolve(doc.processedBlob);
        
        const interval = setInterval(() => {
            if (doc.processedBlob) {
                clearInterval(interval);
                resolve(doc.processedBlob);
            }
        }, 100);
    });
}

// MAIN PROCESS FLOW: Verification Loop calling Node.js Express Backend
async function performVerification() {
    const verifyBtn = document.getElementById('verify-all-btn');
    verifyBtn.disabled = true;
    
    const docsToProcess = documents.filter(d => d.file !== null);

    try {
        const promises = docsToProcess.map(async (doc) => {
            doc.status = 'processing';
            renderDocumentGrid();

            const formData = new FormData();
            
            if (doc.file.type === 'application/pdf') {
                const pdfBlob = await waitForBlob(doc);
                formData.append('document', pdfBlob, `${doc.id}.jpg`); // Changed to JPG
            } else {
                formData.append('document', doc.file);
            }

            const customApiKey = document.getElementById('api-key-input')?.value.trim();
            const headers = {};
            if (customApiKey) {
                headers['x-api-key'] = customApiKey;
            }

            const response = await fetch('/api/verify-document', {
                method: 'POST',
                body: formData,
                headers: headers
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `${doc.title} verification failed.`);
            }

            const data = await response.json();

            doc.rawText = data.rawText;
            doc.name = data.name;
            doc.dob = data.dob;
            doc.fatherName = data.fatherName;
            doc.documentNumber = data.documentNumber;
            doc.status = 'done';
            
            renderDocumentGrid();
        });

        await Promise.all(promises);
        compileVerificationResults();

    } catch (err) {
        console.error("AI Verification failed", err);
        let errorMsg = err.message;
        if (err.message === 'Failed to fetch' || err.message.includes('fetch')) {
            errorMsg = "Verification server is offline or unreachable! Please run the backend server (using 'npm run dev') or check your network connection.";
        } else if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('too many requests')) {
            errorMsg = "Default API Key ki daily limit khatam ho chuki hai! Kripya page ke top-right corner me apni personal Gemini API Key enter karein aur fir se verify karein.";
        }
        alert(`Verification error: ${errorMsg}`);
    } finally {
        verifyBtn.disabled = false;
        updateGlobalStatus();
    }
}

// NORMALIZE STRINGS FOR ROBUST COMPARISON
function normalizeString(str) {
    if (!str || str === 'N/A') return '';
    return str.toLowerCase()
              .replace(/[^a-z0-9]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
}

// Normalize name strings specially by removing trailing initials/words of length 1 or 2
function normalizeNameForComparison(name) {
    if (!name || name === 'N/A') return '';
    return name.toLowerCase()
               .replace(/[^a-z]/g, ' ')
               .split(/\s+/)
               .filter(w => w.length > 2)
               .join(' ')
               .trim();
}

// Compile extracted data, compare files, output results
function compileVerificationResults() {
    const activeDocs = documents.filter(d => d.file !== null && d.status === 'done');
    const dict = translations[currentLang];
    
    // Setup report header dynamically (both modal and inline)
    const headerRow = document.getElementById('report-table-header');
    const inlineHeaderRow = document.getElementById('inline-report-table-header');
    
    const headersHtml = [`<th>${dict.field}</th>`];
    activeDocs.forEach(doc => {
        let translatedTitle = doc.title;
        if (doc.id === 'aadhaar') translatedTitle = dict.aadhaarTitle || doc.title;
        else if (doc.id === 'pan') translatedTitle = dict.panTitle || doc.title;
        else if (doc.id === 'marksheet') translatedTitle = dict.marksheetTitle || doc.title;
        headersHtml.push(`<th>${translatedTitle}</th>`);
    });
    headersHtml.push(`<th>${dict.statusCol}</th>`);
    
    const combinedHeaders = headersHtml.join('');
    headerRow.innerHTML = combinedHeaders;
    if (inlineHeaderRow) inlineHeaderRow.innerHTML = combinedHeaders;

    const fields = [
        { label: dict.fieldName, key: 'name' },
        { label: dict.fieldDob, key: 'dob' },
        { label: dict.fieldFather, key: 'fatherName' },
        { label: dict.fieldDocNumber, key: 'documentNumber', noCompare: true }
    ];

    const tbody = document.getElementById('comparison-table-body');
    const inlineTbody = document.getElementById('inline-comparison-table-body');
    tbody.innerHTML = '';
    if (inlineTbody) inlineTbody.innerHTML = '';

    let totalMismatches = 0;

    fields.forEach(field => {
        const row = document.createElement('tr');
        
        // Label
        const labelTd = document.createElement('td');
        labelTd.className = 'field-name-col';
        labelTd.textContent = field.label;
        row.appendChild(labelTd);

        // Document values
        const values = [];
        activeDocs.forEach(doc => {
            const valTd = document.createElement('td');
            valTd.textContent = doc[field.key];
            row.appendChild(valTd);

            if (doc[field.key] && doc[field.key] !== 'N/A') {
                const normVal = (field.key === 'name') 
                    ? normalizeNameForComparison(doc[field.key]) 
                    : normalizeString(doc[field.key]);
                
                values.push({
                    docTitle: doc.title,
                    val: normVal
                });
            }
        });

        // Comparison Result logic
        const statusTd = document.createElement('td');
        let statusHtml = '';
        
        if (field.noCompare) {
            statusHtml = `<span class="status-badge ignored">${dict.infoOnly || 'Number'}</span>`;
        } else if (values.length < 2) {
            statusHtml = `<span class="status-badge ignored">${dict.ignoredBadge}</span>`;
        } else {
            const firstVal = values[0].val;
            const isMatch = values.every(v => v.val === firstVal);

            if (isMatch) {
                statusHtml = `<span class="status-badge match">${dict.matchBadge}</span>`;
            } else {
                statusHtml = `<span class="status-badge mismatch">${dict.mismatchBadge}</span>`;
                totalMismatches++;
            }
        }

        statusTd.innerHTML = statusHtml;
        row.appendChild(statusTd);
        
        tbody.appendChild(row);
        if (inlineTbody) inlineTbody.appendChild(row.cloneNode(true));
    });

    // Render Overall Verdict Banner (both modal and inline)
    const verdictBanner = document.getElementById('verdict-banner');
    const inlineVerdictBanner = document.getElementById('inline-verdict-banner');
    
    [verdictBanner, inlineVerdictBanner].forEach(banner => {
        if (!banner) return;
        banner.className = 'verdict-banner';
        if (totalMismatches > 0) {
            banner.classList.add('verdict-error');
            banner.textContent = dict.verdictError;
        } else {
            banner.classList.add('verdict-success');
            banner.textContent = dict.verdictSuccess;
        }
    });

    // Render Raw Text logs
    const rawContainer = document.getElementById('raw-text-container');
    rawContainer.innerHTML = '';
    
    activeDocs.forEach(doc => {
        const rawCard = document.createElement('div');
        rawCard.className = 'raw-text-card';
        rawCard.innerHTML = `
            <h4>${doc.title}</h4>
            <div class="raw-text-content">${doc.rawText || 'No text extracted.'}</div>
        `;
        rawContainer.appendChild(rawCard);
    });

    document.getElementById('verification-report-section').classList.remove('hidden');
    const inlineReport = document.getElementById('inline-report-section');
    if (inlineReport) inlineReport.classList.remove('hidden');
}

// Register Service Worker for PWA (Mobile App install support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered successfully!', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

