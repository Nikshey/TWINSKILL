// Script to create a test user with a profile photo
const mongoose = require('mongoose');
const User = require('./usermodel');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/twinskill', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to MongoDB");
  
  try {
    // Create a test user with a profile photo
    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      password: "testpassword",
      photoPath: "/uploads/test-photo.jpg",
      avatarUrl: null
    });
    
    // Check if user already exists
    const existing = await User.findOne({ email: "test@example.com" });
    if (existing) {
      console.log("Test user already exists");
      // Update the photo path
      await User.updateOne({ email: "test@example.com" }, { photoPath: "/uploads/test-photo.jpg" });
      console.log("Updated photo path for test user");
    } else {
      await testUser.save();
      console.log("Test user created successfully");
    }
    
    // Verify the user
    const user = await User.findOne({ email: "test@example.com" });
    console.log("User details:", {
      name: user.name,
      email: user.email,
      photoPath: user.photoPath,
      avatarUrl: user.avatarUrl
    });
    
    mongoose.connection.close();
  } catch (err) {
    console.error("Error creating test user:", err);
    mongoose.connection.close();
  }
});