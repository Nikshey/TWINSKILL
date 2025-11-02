const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./usermodel');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { detectFace, detectFaceWithDetails } = require('./faceDetection');
const { detectGenderByName, getVoiceSettings } = require('./genderDetection');
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/twinskill')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Set the D-ID API key from environment or use the provided one
process.env.DID_API_KEY = process.env.DID_API_KEY || "c2Fpbmlrc2hheWpha2tlbmFAZ21haWwuY29t:nAlhA9RNDehhGzdBgZJ4b";

// Middleware to parse JSON bodies
app.use(express.json());
const cors = require('cors');
app.use(cors());

// Simple request logging
const morgan = require('morgan');
app.use(morgan('dev'));

// Serve frontend statically - check both ../frontend and .. (project root)
const publicDir = path.join(__dirname, '..', 'frontend');
const projectRoot = path.join(__dirname, '..');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
} else {
  // Fallback to project root if frontend directory doesn't exist
  app.use(express.static(projectRoot));
}

// Serve uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Multer configuration for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, safeName);
  }
});
const upload = multer({ 
  storage,
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  // Always return JSON for API endpoints
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred' 
    });
  }
  // For non-API routes, you can return HTML error pages
  res.status(500).send('<h1>Internal Server Error</h1>');
});

// Add a 404 handler for API routes
app.use('/api/*', (req, res, next) => {
  // If we reach here, it means no route matched, so it's a 404 for API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  next();
});

// Serve index.html as default route
app.get('/', (req, res) => {
  // Try to serve from frontend directory first, fallback to project root
  const indexPath = fs.existsSync(publicDir) 
    ? path.join(publicDir, 'index.html') 
    : path.join(projectRoot, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('<h1>Page not found</h1>');
  }
});

// Start the server
// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/twinskill', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
  console.log("Registration will use in-memory storage");
});

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Registration API
app.post('/api/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, phone, password, gender } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Enforce gmail-only on the backend as a security/consistency rule
    const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
    if (!isGmail) {
      return res.status(400).json({ message: "Only @gmail.com emails are allowed" });
    }

    // If DB is connected, use MongoDB; otherwise use in-memory fallback
    const isDbConnected = mongoose.connection.readyState === 1;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    // Check if photo has a recognizable face (but don't block registration for now during testing)
    if (req.file) {
      try {
        const faceDetected = await detectFace(req.file.path);
        if (!faceDetected) {
          console.log('Warning: Uploaded photo may not contain a recognizable face');
          // For testing purposes, we'll still allow registration but log the warning
        }
      } catch (faceError) {
        console.error('Face detection error:', faceError);
        // Continue with registration even if face detection fails
      }
    }
    
    if (isDbConnected) {
      try {
        const existing = await User.findOne({ email });
        if (existing) {
          // If registration fails, delete the uploaded file
          if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(409).json({ message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ 
          name, 
          email, 
          phone, 
          password: hashedPassword, 
          photoPath,
          gender: gender || 'prefer-not-to-say' // Store gender preference
        });
        await user.save();
        return res.json({ message: "User registered successfully!", photoPath });
      } catch (dbError) {
        console.error("Database error:", dbError);
        // If registration fails, delete the uploaded file
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }
        }
        return res.status(500).json({ message: "Registration failed", error: dbError.message });
      }
    }

    // In-memory fallback
    if (!global.__users) global.__users = [];
    const already = global.__users.find(u => u.email === email);
    if (already) {
      // If registration fails, delete the uploaded file
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(409).json({ message: "Email already registered (memory)" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    global.__users.push({ 
      name, 
      email, 
      phone, 
      password: hashedPassword, 
      photoPath,
      gender: gender || 'prefer-not-to-say' // Store gender preference
    });
    return res.json({ message: "User registered successfully! (memory mode)", photoPath });
  } catch (err) {
    console.error("Registration error:", err);
    // If registration fails, delete the uploaded file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }
    // Always return JSON response
    return res.status(500).json({ message: "Registration failed", error: err.message || "Unknown error" });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid email or password" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });
      return res.json({ 
        message: "Login successful", 
        user: { 
          name: user.name, 
          email: user.email, 
          phone: user.phone, 
          photoPath: user.photoPath,
          avatarUrl: user.avatarUrl,
          gender: user.gender // Return gender information
        } 
      });
    }

    // In-memory fallback
    const users = global.__users || [];
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });
    return res.json({ 
      message: "Login successful (memory mode)", 
      user: { 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        photoPath: user.photoPath,
        avatarUrl: user.avatarUrl,
        gender: user.gender // Return gender information
      } 
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message || err });
  }
});

// Health endpoint to check DB connection state
app.get('/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ dbState: states[mongoose.connection.readyState], readyState: mongoose.connection.readyState });
});

// Enhanced avatar creation endpoint with face analysis
app.post('/api/create-avatar', upload.single('photo'), async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Avatar creation request for email:', email);
    
    if (!email) {
      console.log('Email is required');
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const isDbConnected = mongoose.connection.readyState === 1;
    console.log('Database connection status:', isDbConnected);
    
    let user = null;
    
    if (isDbConnected) {
      user = await User.findOne({ email });
      console.log('User found in database:', !!user);
      if (!user) {
        console.log('User not found in database');
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      // In-memory fallback
      const users = global.__users || [];
      user = users.find(u => u.email === email);
      console.log('User found in memory:', !!user);
      if (!user) {
        console.log('User not found in memory');
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Get the user's profile photo path
    let photoPath = user.photoPath;
    console.log('User photo path:', photoPath);
    
    if (!photoPath && req.file) {
      photoPath = `/uploads/${req.file.filename}`;
      console.log('Using uploaded file:', photoPath);
    }
    
    if (!photoPath) {
      console.log('No profile photo found');
      return res.status(400).json({ message: "No profile photo found" });
    }

    // Convert to full URL
    const fullPhotoUrl = `${req.protocol}://${req.get('host')}${photoPath}`;
    console.log('Full photo URL:', fullPhotoUrl);
    
    // Analyze face for avatar customization
    let faceDetails = { faceDetected: false, gender: 'unknown', age: 0, confidence: 0 };
    if (req.file && req.file.path) {
      try {
        faceDetails = await detectFaceWithDetails(req.file.path);
        console.log('Face analysis results:', faceDetails);
      } catch (faceError) {
        console.error('Face analysis error:', faceError);
      }
    }
    
    // Determine gender for voice customization
    let gender = faceDetails.gender;
    if (gender === 'unknown') {
      // Fallback to name-based detection
      gender = detectGenderByName(user.name);
      console.log('Gender detected by name:', gender);
    }
    
    // Try to create avatar using D-ID API
    let avatarUrl = fullPhotoUrl;
    let didAvatarId = null;
    
    // Check if D-ID API key is available
    if (process.env.DID_API_KEY) {
      try {
        console.log('Attempting to create avatar with D-ID API');
        // 1) Create avatar
        const createResp = await fetch('https://api.d-id.com/avatars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY).toString('base64')}`
          },
          body: JSON.stringify({
            name: `${user.name}'s Avatar`,
            description: "Personal AI tutor for Twinskill",
            imageUrl: fullPhotoUrl,
            visibility: "private",
            tags: ["twinskill", "ai-tutor"]
          })
        });
        
        console.log('D-ID avatar creation response status:', createResp.status);
        
        if (createResp.ok) {
          const created = await createResp.json();
          console.log('D-ID avatar creation response:', created);
          
          if (created && created.id) {
            didAvatarId = created.id;
            avatarUrl = created.url || fullPhotoUrl;
            console.log('Avatar created successfully with ID:', didAvatarId);
          }
        } else {
          const errorText = await createResp.text();
          console.error('D-ID avatar creation error:', errorText);
        }
      } catch (didError) {
        console.error('D-ID avatar creation error:', didError);
      }
    }
    
    // Save avatar URL and face details to user profile
    const avatarData = {
      avatarUrl,
      faceDetails,
      gender,
      didAvatarId,
      createdAt: new Date(),
      // Add additional metadata for enhanced functionality
      lastUpdated: new Date(),
      version: '2.0'
    };
    
    if (isDbConnected) {
      await User.updateOne({ email }, { 
        avatarUrl,
        avatarData: JSON.stringify(avatarData),
        avatarGeneratedAt: new Date()
      });
      console.log('Avatar data saved to database');
    } else {
      // In-memory fallback
      user.avatarUrl = avatarUrl;
      user.avatarData = JSON.stringify(avatarData);
      user.avatarGeneratedAt = new Date();
      console.log('Avatar data saved to memory');
    }

    res.json({ 
      message: "Avatar created successfully", 
      avatarUrl,
      faceDetails,
      gender
    });
  } catch (err) {
    console.error('Avatar creation error:', err);
    res.status(500).json({ message: "Avatar creation failed", error: err.message || err });
  }
});

// Enhanced talk endpoint with advanced avatar features
app.post('/api/talk', async (req, res) => {
  try {
    const { imageUrl, text, userEmail } = req.body || {};
    console.log('Received talk request:', { imageUrl, text, userEmail });
    
    if (!imageUrl || !text) {
      console.error('Missing imageUrl or text:', { imageUrl, text });
      return res.status(400).json({ message: 'imageUrl and text are required' });
    }

    console.log('Generating talking avatar for:', { imageUrl, text });

    // Detect user gender and face details for voice customization
    let gender = 'unknown';
    let faceDetails = { faceDetected: false, gender: 'unknown', age: 0, confidence: 0 };
    let voiceSettings = getVoiceSettings(gender);
    
    if (userEmail) {
      try {
        // Get user from database
        const isDbConnected = mongoose.connection.readyState === 1;
        let user = null;
        
        if (isDbConnected) {
          user = await User.findOne({ email: userEmail });
        } else {
          // In-memory fallback
          const users = global.__users || [];
          user = users.find(u => u.email === userEmail);
        }
        
        if (user) {
          // Use user's gender preference first
          if (user.gender && user.gender !== 'prefer-not-to-say') {
            gender = user.gender;
            console.log('Gender from user preference:', gender);
          } else {
            // Get face details from avatar data if available
            if (user.avatarData) {
              try {
                const avatarData = JSON.parse(user.avatarData);
                faceDetails = avatarData.faceDetails || faceDetails;
                gender = avatarData.gender || gender;
              } catch (parseError) {
                console.error('Error parsing avatar data:', parseError);
              }
            }
            
            // Fallback to name-based detection if needed
            if (gender === 'unknown') {
              gender = detectGenderByName(user.name);
              console.log('Gender detected by name:', gender);
            }
          }
          
          voiceSettings = getVoiceSettings(gender);
          console.log('Voice settings:', voiceSettings);
        }
      } catch (genderError) {
        console.error('Gender detection error:', genderError);
      }
    }

    // Select appropriate voice based on gender with more options
    let voiceId = 'en-US-GuyNeural'; // Default male voice
    if (gender === 'female') {
      voiceId = 'en-US-JennyNeural'; // Female voice
    } else if (gender === 'male') {
      voiceId = 'en-US-DavisNeural'; // Alternative male voice
    }

    // Check if D-ID API key is available and working
    if (process.env.DID_API_KEY) {
      try {
        console.log('Attempting D-ID API call with voice:', voiceId);
        // 1) Create talk
        const createResp = await fetch('https://api.d-id.com/talks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY).toString('base64')}`
          },
          body: JSON.stringify({
            source_url: imageUrl,
            script: {
              type: 'text',
              input: text,
              provider: { 
                type: 'microsoft', 
                voice_id: voiceId
              }
            },
            config: { 
              stitch: true,
              // Add animation configuration for better lip sync
              animation: {
                type: 'lip_sync',
                blend: true,
                // Add more detailed animation parameters
                intensity: 1.2,
                smoothing: 0.7
              },
              // Add additional configuration for better quality
              quality: 'high',
              fps: 30,
              resolution: '512x512'
            }
          })
        });
        
        console.log('D-ID create response status:', createResp.status);
        
        if (createResp.status === 401) {
          console.log('D-ID API authentication failed, using enhanced fallback');
        } else if (createResp.ok) {
          const created = await createResp.json();
          console.log('D-ID talk creation response:', created);
          
          if (created && created.id) {
            const talkId = created.id;
            console.log('Talk ID:', talkId);
            
            // 2) Poll until done
            let videoUrl;
            const maxWaitMs = 60000; // 60s
            const start = Date.now();
            while (Date.now() - start < maxWaitMs) {
              await new Promise(r => setTimeout(r, 1500));
              try {
                const poll = await fetch(`https://api.d-id.com/talks/${talkId}`, {
                  headers: { 'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY).toString('base64')}` }
                });
                const data = await poll.json();
                console.log('D-ID talk poll response:', data);
                
                if (data && data.result_url) { 
                  videoUrl = data.result_url; 
                  console.log('Video URL obtained:', videoUrl);
                  break; 
                }
                if (data && data.status && data.status === 'error') {
                  console.error('D-ID talk generation failed:', data);
                  break;
                }
              } catch (pollError) {
                console.error('Error polling D-ID API:', pollError);
                break;
              }
            }
            
            if (videoUrl) {
              return res.json({ 
                videoUrl,
                gender,
                voiceSettings,
                faceDetails
              });
            }
          }
        } else {
          const errorText = await createResp.text();
          console.error('D-ID API error response:', errorText);
        }
      } catch (didError) {
        console.error('D-ID API error:', didError);
      }
    }
    
    // Enhanced fallback: Return both image and text for better frontend handling
    console.log('Using enhanced fallback for talk request');
    res.json({ 
      message: 'Fallback response', 
      text: text,
      imageUrl: imageUrl,
      gender: gender,
      voiceSettings: voiceSettings,
      faceDetails: faceDetails,
      // Add more detailed data for frontend animations
      animationData: {
        duration: text.length * 100, // Rough estimate for speech duration
        emotions: ['happy', 'thoughtful', 'excited'], // Possible emotions to cycle through
        // Add more detailed animation parameters
        lipMovementIntensity: gender === 'female' ? 1.3 : 1.0,
        headMovement: true,
        blinkFrequency: gender === 'female' ? 0.8 : 0.5
      }
    });
  } catch (err) {
    console.error('Talk proxy error:', err);
    // Ultimate fallback
    res.json({ 
      message: 'Fallback response', 
      text: 'I understand your question. Let me explain...',
      imageUrl: 'https://cdn.discordapp.com/attachments/1127860890006409337/1127860923460689950/ai-avatar.png',
      gender: 'unknown',
      voiceSettings: getVoiceSettings('unknown'),
      faceDetails: { faceDetected: false, gender: 'unknown', age: 0, confidence: 0 },
      animationData: {
        duration: 2000,
        emotions: ['happy'],
        lipMovementIntensity: 1.0,
        headMovement: false,
        blinkFrequency: 0.3
      }
    });
  }
});

// Change password endpoint
app.put('/api/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Email, current password, and new password are required" });
    }
    
    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    
    const isDbConnected = mongoose.connection.readyState === 1;
    
    if (isDbConnected) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await User.updateOne({ email }, { password: hashedPassword });
      
      return res.json({ message: "Password changed successfully" });
    } else {
      // In-memory fallback
      const users = global.__users || [];
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      user.password = hashedPassword;
      
      return res.json({ message: "Password changed successfully" });
    }
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Failed to change password", error: error.message });
  }
});

// Update profile photo endpoint
app.put('/api/update-photo', upload.single('photo'), async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "Photo is required" });
    }
    
    const isDbConnected = mongoose.connection.readyState === 1;
    const photoPath = `/uploads/${req.file.filename}`;
    
    // Check if photo has a recognizable face
    try {
      const faceDetected = await detectFace(req.file.path);
      if (!faceDetected) {
        // Delete the uploaded file since it doesn't have a recognizable face
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: "Uploaded photo must contain a recognizable face" });
      }
    } catch (faceError) {
      console.error('Face detection error:', faceError);
      // Continue with update even if face detection fails
    }
    
    if (isDbConnected) {
      const user = await User.findOne({ email });
      if (!user) {
        // Delete the uploaded file since user not found
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: "User not found" });
      }
      
      // If user had a previous photo, delete it
      if (user.photoPath) {
        const oldPhotoPath = path.join(__dirname, 'uploads', path.basename(user.photoPath));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      // Update photo path
      await User.updateOne({ email }, { photoPath });
      
      return res.json({ message: "Profile photo updated successfully", photoPath });
    } else {
      // In-memory fallback
      const users = global.__users || [];
      const user = users.find(u => u.email === email);
      if (!user) {
        // Delete the uploaded file since user not found
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update photo path
      user.photoPath = photoPath;
      
      return res.json({ message: "Profile photo updated successfully", photoPath });
    }
  } catch (error) {
    console.error("Update photo error:", error);
    // Delete the uploaded file if there was an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }
    return res.status(500).json({ message: "Failed to update photo", error: error.message });
  }
});

// Reset profile photo endpoint
app.put('/api/reset-photo', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const isDbConnected = mongoose.connection.readyState === 1;
    
    if (isDbConnected) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If user had a previous photo, delete it
      if (user.photoPath) {
        const oldPhotoPath = path.join(__dirname, 'uploads', path.basename(user.photoPath));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      // Reset photo path to null
      await User.updateOne({ email }, { photoPath: null });
      
      return res.json({ message: "Profile photo reset successfully" });
    } else {
      // In-memory fallback
      const users = global.__users || [];
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Reset photo path
      user.photoPath = null;
      
      return res.json({ message: "Profile photo reset successfully" });
    }
  } catch (error) {
    console.error("Reset photo error:", error);
    return res.status(500).json({ message: "Failed to reset photo", error: error.message });
  }
});

// Delete account endpoint
app.delete('/api/delete-account', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const isDbConnected = mongoose.connection.readyState === 1;
    
    if (isDbConnected) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If user had a photo, delete it
      if (user.photoPath) {
        const photoPath = path.join(__dirname, 'uploads', path.basename(user.photoPath));
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }
      
      // Delete user account
      await User.deleteOne({ email });
      
      return res.json({ message: "Account deleted successfully" });
    } else {
      // In-memory fallback
      const users = global.__users || [];
      const userIndex = users.findIndex(u => u.email === email);
      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If user had a photo, delete it
      if (users[userIndex].photoPath) {
        const photoPath = path.join(__dirname, 'uploads', path.basename(users[userIndex].photoPath));
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }
      
      // Delete user account
      users.splice(userIndex, 1);
      
      return res.json({ message: "Account deleted successfully" });
    }
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ message: "Failed to delete account", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Add this at the end of the file to handle Render's port
const serverPort = process.env.PORT || 3000;
app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}`);
});
