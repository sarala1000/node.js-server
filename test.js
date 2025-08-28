const fs = require('fs');
const path = require('path');

/**
 * Simple test script to verify server functionality
 * This script creates a test file and checks if the server directories are created
 */

console.log('🧪 Testing File Upload Server Setup...\n');

// Test 1: Check if required directories exist
console.log('1. Checking directory structure...');
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

if (fs.existsSync(uploadsDir)) {
    console.log('✅ Uploads directory exists');
} else {
    console.log('❌ Uploads directory missing - will be created when server starts');
}

if (fs.existsSync(dataDir)) {
    console.log('✅ Data directory exists');
} else {
    console.log('❌ Data directory missing - will be created when server starts');
}

// Test 2: Check if data file exists
console.log('\n2. Checking data file...');
const dataFile = path.join(dataDir, 'items.json');
if (fs.existsSync(dataFile)) {
    console.log('✅ Data file exists');
    try {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        console.log(`   📊 Contains ${data.length} items`);
    } catch (error) {
        console.log('   ⚠️  Data file is corrupted');
    }
} else {
    console.log('❌ Data file missing - will be created when first file is uploaded');
}

// Test 3: Check package.json dependencies
console.log('\n3. Checking dependencies...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['express', 'multer', 'fs-extra'];
    
    for (const dep of requiredDeps) {
        if (packageJson.dependencies[dep]) {
            console.log(`✅ ${dep} dependency found`);
        } else {
            console.log(`❌ ${dep} dependency missing`);
        }
    }
} catch (error) {
    console.log('❌ Error reading package.json');
}

// Test 4: Check server file
console.log('\n4. Checking server file...');
if (fs.existsSync('server.js')) {
    console.log('✅ server.js exists');
    const serverContent = fs.readFileSync('server.js', 'utf8');
    
    if (serverContent.includes('express')) {
        console.log('✅ Express server setup found');
    }
    
    if (serverContent.includes('multer')) {
        console.log('✅ File upload middleware found');
    }
    
    if (serverContent.includes('crypto')) {
        console.log('✅ Duplicate detection (crypto) found');
    }
    
    if (serverContent.includes('fs-extra')) {
        console.log('✅ File system operations found');
    }
} else {
    console.log('❌ server.js missing');
}

// Test 5: Check HTML interface
console.log('\n5. Checking web interface...');
const htmlFile = path.join(__dirname, 'public', 'index.html');
if (fs.existsSync(htmlFile)) {
    console.log('✅ Web interface exists');
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    if (htmlContent.includes('File Upload Server')) {
        console.log('✅ Upload interface found');
    }
    
    if (htmlContent.includes('drag')) {
        console.log('✅ Drag & drop functionality found');
    }
} else {
    console.log('❌ Web interface missing');
}

console.log('\n🎉 Setup verification complete!');
console.log('\n📋 Next steps:');
console.log('1. Start the server: npm start');
console.log('2. Open browser to: http://localhost:3000');
console.log('3. Test file uploads and duplicate prevention');
console.log('4. Check the uploads/ and data/ directories for files');

// Create a sample test file
console.log('\n📝 Creating sample test file...');
const testFile = path.join(__dirname, 'test-sample.txt');
const testContent = 'This is a test file for the upload server.\nCreated at: ' + new Date().toISOString();

try {
    fs.writeFileSync(testFile, testContent);
    console.log('✅ Sample test file created: test-sample.txt');
    console.log('   You can use this file to test the upload functionality');
} catch (error) {
    console.log('❌ Could not create test file');
}
