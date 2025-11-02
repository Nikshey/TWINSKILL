const fs = require('fs');
const path = require('path');
const { detectFaceAdvanced } = require('./advancedFaceDetection');

/**
 * Face detection function that determines if an image contains a recognizable face
 * Uses advanced face detection with gender and age recognition
 */
async function detectFace(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return false;
    }
    
    // Check file size (between 100 bytes and 10MB)
    const stats = fs.statSync(imagePath);
    if (stats.size < 100 || stats.size > 10 * 1024 * 1024) {
      return false;
    }
    
    // Check file extension
    const ext = path.extname(imagePath).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!validExtensions.includes(ext)) {
      return false;
    }
    
    // Use advanced detection
    const result = await detectFaceAdvanced(imagePath);
    return result.faceDetected;
    
  } catch (error) {
    console.error('Error detecting face:', error);
    return false;
  }
}

/**
 * Advanced face detection with gender and age recognition
 */
async function detectFaceWithDetails(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return {
        faceDetected: false,
        gender: 'unknown',
        age: 0,
        confidence: 0
      };
    }
    
    // Check file size (between 100 bytes and 10MB)
    const stats = fs.statSync(imagePath);
    if (stats.size < 100 || stats.size > 10 * 1024 * 1024) {
      return {
        faceDetected: false,
        gender: 'unknown',
        age: 0,
        confidence: 0
      };
    }
    
    // Check file extension
    const ext = path.extname(imagePath).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!validExtensions.includes(ext)) {
      return {
        faceDetected: false,
        gender: 'unknown',
        age: 0,
        confidence: 0
      };
    }
    
    // Use advanced detection
    const result = await detectFaceAdvanced(imagePath);
    return result;
    
  } catch (error) {
    console.error('Error detecting face with details:', error);
    return {
      faceDetected: false,
      gender: 'unknown',
      age: 0,
      confidence: 0
    };
  }
}

module.exports = { detectFace, detectFaceWithDetails };