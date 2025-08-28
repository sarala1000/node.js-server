# File Upload Application

A modern file upload application built with Angular frontend and Node.js backend, featuring automatic duplicate detection and a beautiful user interface.

## 🚀 Features

- **Modern UI**: Beautiful, responsive design with drag & drop functionality
- **Duplicate Detection**: Automatic detection and prevention of duplicate file uploads
- **File Management**: Upload, view, and delete files with ease
- **Progress Tracking**: Real-time upload progress indication
- **File Descriptions**: Add optional descriptions to uploaded files
- **Size Validation**: 10MB file size limit with client-side validation

## 📁 Project Structure

```
file-upload-project/
├── backend/                 # Node.js Express server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   ├── uploads/            # Uploaded files storage
│   └── data/               # File metadata storage
├── frontend/               # Angular application
│   └── file-upload-app/    # Angular project
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/
│       │   │   │   ├── file-upload/    # File upload component
│       │   │   │   └── file-list/      # File list component
│       │   │   ├── services/
│       │   │   │   └── file.ts         # File service
│       │   │   └── models/
│       │   │       └── file.ts         # File interface
│       │   └── ...
│       └── package.json
└── package.json            # Root package.json with scripts
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing
- **fs-extra** - Enhanced file system operations

### Frontend
- **Angular 17** - Modern frontend framework
- **TypeScript** - Type-safe JavaScript
- **SCSS** - Advanced CSS preprocessing
- **RxJS** - Reactive programming

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd file-upload-project
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```
This will start both the backend server (port 3000) and the Angular development server (port 4200).

#### Production Mode
```bash
npm start
```

#### Individual Services
- **Backend only**: `npm run start:backend`
- **Frontend only**: `npm run start:frontend`

### Accessing the Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### File Operations
- `GET /api/files` - Get all uploaded files
- `GET /api/files/:id` - Get specific file metadata
- `POST /api/upload` - Upload a new file
- `DELETE /api/files/:id` - Delete a file

## 🔧 Configuration

### Backend Configuration
The backend server runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=4000 npm run start:backend
```

### Frontend Configuration
The Angular application runs on port 4200 by default. The API URL is configured in `frontend/file-upload-app/src/app/services/file.ts`.

## 📦 Building for Production

```bash
npm run build
```

This will create a production build of the Angular application in the `frontend/file-upload-app/dist/` directory.

## 🧪 Testing

```bash
npm test
```

## 📝 File Upload Process

1. **Drag & Drop**: Users can drag files directly onto the upload area
2. **File Selection**: Click the upload area to browse and select files
3. **Validation**: Client-side validation checks file size (10MB limit)
4. **Upload**: Files are uploaded with progress indication
5. **Duplicate Check**: Server checks for duplicate files using SHA256 hash
6. **Storage**: Files are stored in the `backend/uploads/` directory
7. **Metadata**: File information is stored in `backend/data/items.json`

## 🔒 Security Features

- **File Size Limits**: 10MB maximum file size
- **Duplicate Prevention**: SHA256 hash-based duplicate detection
- **CORS Configuration**: Properly configured for development
- **Input Validation**: Client and server-side validation

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile devices
- **Drag & Drop**: Intuitive file upload interface
- **Progress Indicators**: Real-time upload progress
- **Status Messages**: Success and error notifications
- **Modern Styling**: Beautiful gradient design with smooth animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository.



