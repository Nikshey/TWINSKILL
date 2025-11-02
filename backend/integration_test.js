// Integration test for the face detection in registration process
const { detectFace } = require('./faceDetection');
const fs = require('fs');
const path = require('path');

async function runIntegrationTest() {
  console.log('=== Face Detection Integration Test ===\n');
  
  // Test 1: Valid image file (should pass)
  console.log('Test 1: Checking valid image file...');
  try {
    // Use one of the existing uploaded images
    const validImage = path.join(__dirname, 'uploads', '1759938931001-fjcenhpvd85.jpg');
    if (fs.existsSync(validImage)) {
      const result = await detectFace(validImage);
      console.log(`  Result: ${result ? 'PASS' : 'FAIL'} - Valid image correctly ${result ? 'accepted' : 'rejected'}`);
    } else {
      console.log('  SKIP - Valid image file not found');
    }
  } catch (error) {
    console.log(`  ERROR: ${error.message}`);
  }
  
  // Test 2: Invalid file (should fail)
  console.log('\nTest 2: Checking invalid file...');
  try {
    const invalidFile = path.join(__dirname, 'invalid_file.txt');
    // Create a temporary invalid file
    fs.writeFileSync(invalidFile, 'This is not an image');
    
    const result = await detectFace(invalidFile);
    console.log(`  Result: ${!result ? 'PASS' : 'FAIL'} - Invalid file correctly ${!result ? 'rejected' : 'accepted'}`);
    
    // Clean up
    fs.unlinkSync(invalidFile);
  } catch (error) {
    console.log(`  ERROR: ${error.message}`);
  }
  
  // Test 3: Non-existent file (should fail)
  console.log('\nTest 3: Checking non-existent file...');
  try {
    const nonExistent = path.join(__dirname, 'non_existent.jpg');
    const result = await detectFace(nonExistent);
    console.log(`  Result: ${!result ? 'PASS' : 'FAIL'} - Non-existent file correctly ${!result ? 'rejected' : 'accepted'}`);
  } catch (error) {
    console.log(`  ERROR: ${error.message}`);
  }
  
  // Test 4: File size validation
  console.log('\nTest 4: Checking file size validation...');
  try {
    const tinyFile = path.join(__dirname, 'tiny_file.jpg');
    // Create a tiny file (< 1KB)
    fs.writeFileSync(tinyFile, 'X');
    
    const result = await detectFace(tinyFile);
    console.log(`  Result: ${!result ? 'PASS' : 'FAIL'} - Tiny file correctly ${!result ? 'rejected' : 'accepted'}`);
    
    // Clean up
    fs.unlinkSync(tinyFile);
  } catch (error) {
    console.log(`  ERROR: ${error.message}`);
  }
  
  console.log('\n=== Integration Test Complete ===');
}

runIntegrationTest();