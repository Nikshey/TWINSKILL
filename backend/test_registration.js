const fs = require('fs');
const path = require('path');

// Simple test for registration endpoint
async function testRegistration() {
  try {
    // Create a simple test image (just a text file for now)
    const testImagePath = path.join(__dirname, 'test_image.jpg');
    fs.writeFileSync(testImagePath, 'This is a test image file');
    
    // Test data
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@gmail.com');
    formData.append('phone', '1234567890');
    formData.append('password', 'testpassword');
    
    console.log('Testing registration with valid data...');
    
    // In a real test, we would make an HTTP request to the registration endpoint
    // For now, we'll just verify our face detection works in the context
    
    const { detectFace } = require('./faceDetection');
    const hasFace = await detectFace(testImagePath);
    console.log('Face detection result for test image:', hasFace);
    
    // Clean up
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testRegistration();