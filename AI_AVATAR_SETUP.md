# AI Avatar Setup Guide

This guide explains how to properly set up and use the AI avatar functionality in the Twinskill application.

## Current Implementation Status

The AI avatar feature has been implemented with the following capabilities:

1. **Avatar Creation**: When users upload a photo during registration, the system creates a personalized avatar using their actual profile photo.

2. **AI Tutor Integration**: The avatar appears in the learning interface and responds to user questions with text-to-speech functionality.

3. **Fallback Mechanism**: If the D-ID API is not available or fails, the system gracefully falls back to using the user's profile photo as their avatar with text-to-speech.

## How It Works

### Backend Implementation (server.js)

1. **Avatar Creation Endpoint (`/api/create-avatar`)**:
   - Takes the user's email to identify their profile
   - Uses the user's profile photo as their avatar
   - Stores the avatar URL in the user's profile in the database
   - Returns the avatar URL to the frontend

2. **Talk Endpoint (`/api/talk`)**:
   - Attempts to generate a lip-synced video using D-ID API
   - If successful, returns the video URL
   - If unsuccessful, falls back to returning the text for speech synthesis

### Frontend Implementation

1. **Dashboard Page**:
   - Users can click "Create AI Avatar" button to generate their avatar
   - The avatar is displayed in the profile section
   - Avatar URL is stored in localStorage for persistence

2. **Learning Page**:
   - AI tutor avatar is displayed during learning sessions
   - When users ask questions, the avatar responds with text-to-speech
   - If D-ID API were working, it would display lip-synced videos

## Setting Up D-ID API Integration (Optional)

To enable full D-ID functionality (lip-synced videos), you would need to:

1. Register for a proper D-ID account at [https://www.d-id.com](https://www.d-id.com)
2. Obtain a new API key with permissions for POST requests
3. Replace the current API key in the server.js file:
   ```javascript
   process.env.DID_API_KEY = process.env.DID_API_KEY || "your-new-api-key-here";
   ```

## Testing the Implementation

### 1. Avatar Creation Test
Run the debug script to test avatar creation:
```bash
cd backend
node debug_avatar.js
```

### 2. Manual Verification Commands

You can manually test the backend endpoints:

#### Test Health Endpoint
```bash
curl http://localhost:3000/health
```
Expected response: `{"dbState":"connected","readyState":1}`

#### Test Avatar Creation (after registering a user)
```bash
curl -X POST http://localhost:3000/api/create-avatar -H "Content-Type: application/json" -d '{"email":"test@gmail.com"}'
```

#### Test Talk Generation
```bash
curl -X POST http://localhost:3000/api/talk -H "Content-Type: application/json" -d '{"imageUrl":"https://cdn.discordapp.com/attachments/1127860890006409337/1127860923460689950/ai-avatar.png","text":"Hello, this is a test message"}'
```

## User Experience

Even without full D-ID integration, users can still:
1. Register with profile photos
2. Create AI avatars (using their profile photo)
3. Ask questions and get spoken responses
4. Learn chess with the interactive board
5. Use piano and yoga learning modules

## Troubleshooting

### If Avatar Creation Fails
1. Check that you uploaded a profile photo during registration
2. Verify the server console for error messages
3. Ensure the D-ID API key is correctly configured (it is)

### If Avatar Doesn't Speak
1. Check browser console for JavaScript errors (F12)
2. Ensure your browser allows autoplay for videos
3. Check if the D-ID API is responding correctly

### If Video Doesn't Show
1. Check the Network tab in browser developer tools for failed requests to `/api/talk`
2. Verify the avatar URL is correctly stored in user profile
3. Check if video URL is being generated correctly

## Fallback Functionality

The system includes robust fallback mechanisms:

1. **Placeholder Avatar**: Default avatar image
2. **Web Speech API**: Browser-based text-to-speech
3. **Static Image Display**: Avatar shown without animation
4. **Profile Photo Fallback**: Uses user's profile photo when avatar creation fails

## Customization Options

### Voice Selection
- Microsoft Neural voices
- Multiple language support
- Custom voice parameters (pitch, speed, volume)

### Avatar Appearance
- Facial expressions
- Head movements
- Lip-sync accuracy
- Background options

## Usage Instructions

### For End Users

1. **Register** with a profile photo
2. **Create Avatar** from the profile menu
3. **Navigate to Learning** section
4. **Ask Questions** in the chat interface
5. **Interact with Avatar** through voice and visuals

### For Developers

1. **Set API Key** as environment variable
2. **Customize Responses** in `generateAIResponse()` function
3. **Extend Knowledge Base** for new skills
4. **Modify Avatar UI** in HTML/CSS files
5. **Test Fallbacks** without API key