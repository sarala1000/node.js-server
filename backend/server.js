require('dotenv').config({ path: './config.env' });
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database');
const File = require('./models/File');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware for parsing JSON and CORS
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200', // Angular default port
    credentials: true
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

/**
 * Generate hash for file content to detect duplicates
 * @param {Buffer} fileBuffer - File content buffer
 * @returns {string} SHA256 hash of file content
 */
function generateFileHash(fileBuffer) {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Get all files
app.get('/api/files', async (req, res) => {
    try {
        const files = await File.find().sort({ uploadDate: -1 });
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Get single file
app.get('/api/files/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json(file);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Failed to fetch file' });
    }
});

// Upload file
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Generate hash for duplicate detection
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileHash = generateFileHash(fileBuffer);

        // Check for duplicate
        const existingFile = await File.findOne({ hash: fileHash });
        
        if (existingFile) {
            // If replace flag is true, replace the existing file
            if (req.body.replace === 'true') {
                // Delete old file from filesystem
                if (fs.existsSync(existingFile.path)) {
                    fs.removeSync(existingFile.path);
                }
                
                // Update database record
                existingFile.filename = req.file.originalname;
                existingFile.savedFilename = req.file.filename;
                existingFile.path = req.file.path;
                existingFile.size = req.file.size;
                existingFile.mimetype = req.file.mimetype;
                existingFile.uploadDate = new Date();
                existingFile.description = req.body.description || existingFile.description;
                
                await existingFile.save();
                
                res.status(200).json({ 
                    message: 'File replaced successfully', 
                    item: existingFile 
                });
            } else {
                // Delete uploaded file and return error
                fs.removeSync(req.file.path);
                return res.status(409).json({ 
                    error: 'File already exists', 
                    message: 'This file has already been uploaded' 
                });
            }
        } else {
            // Create new file record
            const newFile = new File({
                filename: req.file.originalname,
                savedFilename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype,
                hash: fileHash,
                description: req.body.description || ''
            });

            await newFile.save();
            
            res.status(201).json({ 
                message: 'File uploaded successfully', 
                item: newFile 
            });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        // Clean up uploaded file if there was an error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.removeSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Delete file
app.delete('/api/files/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete file from filesystem
        if (fs.existsSync(file.path)) {
            fs.removeSync(file.path);
        }

        // Delete from database
        await File.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Uploads directory: ${uploadsDir}`);
});
