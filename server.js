const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(dataDir);

// Data storage file path
const dataFilePath = path.join(dataDir, 'items.json');

/**
 * Load existing data from JSON file
 * @returns {Array} Array of stored items
 */
function loadData() {
    try {
        if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
    return [];
}

/**
 * Save data to JSON file
 * @param {Array} data - Array of items to save
 */
function saveData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

/**
 * Generate hash for file content to detect duplicates
 * @param {Buffer} fileBuffer - File content buffer
 * @returns {string} SHA256 hash of file content
 */
function generateFileHash(fileBuffer) {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Check if item already exists based on hash
 * @param {Array} existingData - Array of existing items
 * @param {string} fileHash - Hash of uploaded file
 * @returns {boolean} True if duplicate exists
 */
function isDuplicate(existingData, fileHash) {
    return existingData.some(item => item.hash === fileHash);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Route to serve the upload form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * POST /upload - Handle file upload with duplicate prevention
 * Uploads a file and saves metadata without duplicates
 */
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read file content to generate hash
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileHash = generateFileHash(fileBuffer);

        // Load existing data
        const existingData = loadData();

        // Check for duplicates
        if (isDuplicate(existingData, fileHash)) {
            // Remove uploaded file since it's a duplicate
            fs.removeSync(req.file.path);
            return res.status(409).json({ 
                error: 'File already exists',
                message: 'This file has already been uploaded'
            });
        }

        // Create new item object
        const newItem = {
            id: Date.now().toString(),
            filename: req.file.originalname,
            savedFilename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            hash: fileHash,
            uploadDate: new Date().toISOString(),
            description: req.body.description || ''
        };

        // Add to existing data
        existingData.push(newItem);

        // Save updated data
        saveData(existingData);

        res.status(201).json({
            message: 'File uploaded successfully',
            item: newItem
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /files - Get list of all uploaded files
 * Returns array of file metadata
 */
app.get('/files', (req, res) => {
    try {
        const data = loadData();
        res.json(data);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /files/:id - Get specific file metadata
 * @param {string} id - File ID
 */
app.get('/files/:id', (req, res) => {
    try {
        const data = loadData();
        const item = data.find(item => item.id === req.params.id);
        
        if (!item) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        res.json(item);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * DELETE /files/:id - Delete specific file
 * @param {string} id - File ID
 */
app.delete('/files/:id', (req, res) => {
    try {
        const data = loadData();
        const itemIndex = data.findIndex(item => item.id === req.params.id);
        
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const item = data[itemIndex];
        
        // Remove file from filesystem
        if (fs.existsSync(item.path)) {
            fs.removeSync(item.path);
        }
        
        // Remove from data array
        data.splice(itemIndex, 1);
        
        // Save updated data
        saveData(data);
        
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Uploads directory: ${uploadsDir}`);
    console.log(`Data file: ${dataFilePath}`);
});
