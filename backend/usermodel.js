const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  photoPath: String,
  avatarUrl: String,  // New field to store AI avatar URL
  avatarData: {
    type: String,
    // Store detailed avatar information as a JSON string
    // This includes face details, gender, age, and other customization data
  },
  // Add a field to store the last generated avatar timestamp
  avatarGeneratedAt: {
    type: Date,
    default: null
  },
  // Add a field to store avatar customization preferences
  avatarPreferences: {
    type: String,  // Store as JSON string
    default: null
  },
  // Add gender field to store user's gender preference
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  }
});

module.exports = mongoose.model('User', userSchema);