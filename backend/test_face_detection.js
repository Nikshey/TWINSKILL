const { detectFace } = require('./faceDetection');
const path = require('path');

// Test with an existing image
async function testFaceDetection() {
  try {
    // Use one of the existing uploaded images
    const testImagePath = path.join(__dirname, 'uploads', '1759938931001-fjcenhpvd85.jpg');
    
    console.log('Testing face detection on:', testImagePath);
    
    const hasFace = await detectFace(testImagePath);
    
    console.log('Face detected:', hasFace);
    
    // Test with a non-existent file
    const invalidPath = path.join(__dirname, 'uploads', 'non-existent.jpg');
    console.log('Testing with invalid path:', invalidPath);
    const hasFaceInvalid = await detectFace(invalidPath);
    console.log('Face detected in invalid file:', hasFaceInvalid);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testFaceDetection();