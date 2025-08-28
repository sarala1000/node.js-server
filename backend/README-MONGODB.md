# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" plan (M0)

### 2. Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier
3. Select cloud provider (AWS/Google Cloud/Azure) and region
4. Click "Create"

### 3. Set Up Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Create username and password (save them!)
4. Select "Read and write to any database"
5. Click "Add User"

### 4. Set Up Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### 5. Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `file-upload-app`

### 6. Update Environment File
Edit `backend/config.env`:
```
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/file-upload-app?retryWrites=true&w=majority
```

## Option 2: Local MongoDB

### 1. Install MongoDB Community Server
1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. MongoDB will run on `localhost:27017`

### 2. Update Environment File
Edit `backend/config.env`:
```
MONGODB_URI=mongodb://localhost:27017/file-upload-app
```

## Start the Application

1. Make sure MongoDB is running
2. Start the backend: `npm run dev:backend`
3. Start the frontend: `npm run dev:frontend`

## Verify Connection

Check the console output - you should see:
```
MongoDB Connected: your-cluster-host
Server running on http://localhost:3000
```
