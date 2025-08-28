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

// No need for uploads directory - files are stored in MongoDB

/**
 * Generate hash for file content to detect duplicates
 * @param {Buffer} fileBuffer - File content buffer
 * @returns {string} SHA256 hash of file content
 */
function generateFileHash(fileBuffer) {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

// Configure multer for memory storage (to save in MongoDB)
const upload = multer({ 
    storage: multer.memoryStorage(),
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
        
        // Transform old schema files to new schema and convert _id to id
        const transformedFiles = files.map(file => {
            const fileObj = file.toObject();
            
            // If file has old schema (path field), transform it
            if (fileObj.path && !fileObj.originalName) {
                return {
                    ...fileObj,
                    originalName: fileObj.filename || fileObj.savedFilename || 'Unknown file',
                    // Remove old fields
                    path: undefined,
                    savedFilename: undefined
                };
            }
            
            return fileObj;
        });
        
        // Convert _id to id for frontend compatibility
        const filesWithId = transformedFiles.map(file => ({
            ...file,
            id: file._id,
            _id: undefined
        }));
        
        console.log('Files being sent to frontend:', filesWithId.map(f => ({ id: f.id, filename: f.filename })));
        res.json(filesWithId);
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
        const fileHash = generateFileHash(req.file.buffer);

        // Check for duplicate
        const existingFile = await File.findOne({ hash: fileHash });
        
        if (existingFile) {
            // If replace flag is true, replace the existing file
            if (req.body.replace === 'true') {
                // Update database record
                existingFile.filename = req.file.originalname;
                existingFile.originalName = req.file.originalname;
                existingFile.size = req.file.size;
                existingFile.mimetype = req.file.mimetype;
                existingFile.data = req.file.buffer;
                existingFile.uploadDate = new Date();
                existingFile.description = req.body.description || existingFile.description;
                
                await existingFile.save();
                
                res.status(200).json({ 
                    message: 'File replaced successfully', 
                    item: existingFile 
                });
            } else {
                return res.status(409).json({ 
                    error: 'File already exists', 
                    message: 'This file has already been uploaded' 
                });
            }
        } else {
            // Create new file record
            const newFile = new File({
                filename: req.file.originalname,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                data: req.file.buffer,
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
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Download file
app.get('/api/files/:id/download', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.set({
            'Content-Type': file.mimetype,
            'Content-Disposition': `attachment; filename="${file.originalName}"`,
            'Content-Length': file.size
        });

        res.send(file.data);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// Delete file
app.delete('/api/files/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete from database (file data is stored in MongoDB)
        await File.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        
        // If it's a validation error, try to delete with old schema
        if (error.name === 'ValidationError' || error.message.includes('path')) {
            try {
                await File.findByIdAndDelete(req.params.id);
                res.json({ message: 'File deleted successfully' });
            } catch (deleteError) {
                console.error('Error deleting file with old schema:', deleteError);
                res.status(500).json({ error: 'Failed to delete file' });
            }
        } else {
            res.status(500).json({ error: 'Failed to delete file' });
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Files are stored in MongoDB');
});
