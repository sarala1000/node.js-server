# File Upload Server with Duplicate Prevention

A Node.js server that allows file uploads with automatic duplicate detection and prevention. Files are saved to the local computer and metadata is stored in a JSON file.

## Features

- 📁 **File Upload**: Drag & drop or click to upload files
- 🔍 **Duplicate Detection**: Uses SHA256 hash to prevent duplicate files
- 💾 **Local Storage**: Files saved to local computer
- 📊 **Metadata Storage**: File information stored in JSON format
- 🎨 **Modern UI**: Beautiful, responsive web interface
- 🗑️ **File Management**: View and delete uploaded files
- 📝 **Descriptions**: Add optional descriptions to files

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **For development with auto-restart**:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Drag and drop files or click to browse
3. Add an optional description
4. Click "Upload File"
5. View uploaded files in the list below
6. Delete files using the delete button

## API Endpoints

### POST /upload
Upload a file with duplicate prevention.

**Request**: Multipart form data with:
- `file`: The file to upload
- `description` (optional): File description

**Response**:
```json
{
  "message": "File uploaded successfully",
  "item": {
    "id": "1234567890",
    "filename": "example.jpg",
    "savedFilename": "file-1234567890-123456789.jpg",
    "path": "/path/to/uploads/file-1234567890-123456789.jpg",
    "size": 1024,
    "mimetype": "image/jpeg",
    "hash": "sha256_hash_here",
    "uploadDate": "2024-01-01T12:00:00.000Z",
    "description": "Optional description"
  }
}
```

### GET /files
Get list of all uploaded files.

**Response**:
```json
[
  {
    "id": "1234567890",
    "filename": "example.jpg",
    "savedFilename": "file-1234567890-123456789.jpg",
    "path": "/path/to/uploads/file-1234567890-123456789.jpg",
    "size": 1024,
    "mimetype": "image/jpeg",
    "hash": "sha256_hash_here",
    "uploadDate": "2024-01-01T12:00:00.000Z",
    "description": "Optional description"
  }
]
```

### GET /files/:id
Get specific file metadata.

**Response**: Same as individual item in the files list.

### DELETE /files/:id
Delete a specific file.

**Response**:
```json
{
  "message": "File deleted successfully"
}
```

## File Structure

```
project-node/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── README.md         # This file
├── public/
│   └── index.html    # Web interface
├── uploads/          # Uploaded files (created automatically)
└── data/
    └── items.json    # File metadata (created automatically)
```

## How Duplicate Prevention Works

1. **Hash Generation**: When a file is uploaded, a SHA256 hash is generated from the file content
2. **Duplicate Check**: The hash is compared against existing file hashes in the database
3. **Prevention**: If a matching hash is found, the upload is rejected and the file is deleted
4. **Storage**: Only unique files are saved to the filesystem and database

## Configuration

### File Size Limit
Default: 10MB
```javascript
// In server.js
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
```

### Port Configuration
Default: 3000
```javascript
// In server.js
const PORT = process.env.PORT || 3000;
```

## Error Handling

The server handles various error scenarios:

- **No file uploaded**: Returns 400 error
- **File too large**: Returns 400 error
- **Duplicate file**: Returns 409 error
- **File not found**: Returns 404 error
- **Server errors**: Returns 500 error

## Security Features

- **File size limits**: Prevents large file uploads
- **Unique filenames**: Prevents filename conflicts
- **Content-based deduplication**: Uses file content hash, not filename
- **Input validation**: Validates file uploads

## Development

### Adding New Features

1. **New API endpoints**: Add routes in `server.js`
2. **UI changes**: Modify `public/index.html`
3. **Data structure**: Update the item object structure in upload handler

### Testing

1. Start the server: `npm start`
2. Open browser to `http://localhost:3000`
3. Test file uploads with various file types
4. Test duplicate prevention by uploading the same file twice
5. Test file deletion

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT variable in `server.js`
2. **Permission errors**: Ensure write permissions for uploads and data directories
3. **File not found**: Check if the uploads directory exists

### Logs

The server logs important information:
- Server startup with port and directory information
- Upload success/failure messages
- Error details for debugging

## License

MIT License - feel free to use and modify as needed.



