const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and CORS
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200', // Angular default port
    credentials: true
}));

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

/**
 * Find the index of an item in the data array based on its hash
 * @param {Array} data - Array of items
 * @param {string} fileHash - Hash of the file to find
 * @returns {number} Index of the item, or -1 if not found
 */
function findDuplicateIndex(data, fileHash) {
    return data.findIndex(item => item.hash === fileHash);
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

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'File Upload API is running' });
});

/**
 * POST /api/upload - Handle file upload with duplicate prevention
 * Uploads a file and saves metadata without duplicates
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
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
        const duplicateIndex = findDuplicateIndex(existingData, fileHash);
        const shouldReplace = req.body.replace === 'true';

        if (duplicateIndex !== -1) {
            if (shouldReplace) {
                // Replace existing file
                const oldItem = existingData[duplicateIndex];
                
                // Remove old file
                if (fs.existsSync(oldItem.path)) {
                    fs.removeSync(oldItem.path);
                }

                // Update item with new file info
                existingData[duplicateIndex] = {
                    ...oldItem,
                    filename: req.file.originalname,
                    savedFilename: req.file.filename,
                    path: req.file.path,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                    uploadDate: new Date().toISOString(),
                    description: req.body.description || oldItem.description
                };

                // Save updated data
                saveData(existingData);

                res.status(200).json({
                    message: 'File replaced successfully',
                    item: existingData[duplicateIndex]
                });
            } else {
                // Remove uploaded file since it's a duplicate and user doesn't want to replace
                fs.removeSync(req.file.path);
                return res.status(409).json({ 
                    error: 'File already exists',
                    message: 'This file has already been uploaded'
                });
            }
        } else {
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
        }

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/files - Get list of all uploaded files
 * Returns array of file metadata
 */
app.get('/api/files', (req, res) => {
    try {
        const data = loadData();
        res.json(data);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/files/:id - Get specific file metadata
 * @param {string} id - File ID
 */
app.get('/api/files/:id', (req, res) => {
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
 * DELETE /api/files/:id - Delete specific file
 * @param {string} id - File ID
 */
app.delete('/api/files/:id', (req, res) => {
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
