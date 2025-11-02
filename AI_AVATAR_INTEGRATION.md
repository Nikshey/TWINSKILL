# AI Avatar Integration Guide

This document explains how to set up and use the AI avatar feature in the Twinskill application.

## Overview

The AI avatar feature allows users to create a personalized AI teacher that can answer questions with lip-synced speech and realistic avatar animations. The implementation uses:

1. User profile photos for avatar creation
2. D-ID API for generating talking avatars
3. Web Speech API for text-to-speech fallback
4. Lip-sync technology for realistic animations

## Feature Components

### 1. Avatar Creation
- Users upload a profile photo during registration
- System creates an AI avatar based on the photo
- Avatar is stored in user profile for future use

### 2. Avatar Interaction
- Lip-synced responses to user questions
- Realistic facial animations
- Natural voice synthesis
- Skill-specific knowledge base

## Implementation Details

### Frontend Components

#### Dashboard Page (`dashboard.html`)
- Avatar creation button in profile sidebar
- Avatar display area
- Status indicators for avatar creation process

#### Learning Page (`learn.html`)
- Dedicated avatar section with video display
- Interactive chat interface
- Question/response system with lip-sync
- Skill-specific AI responses

### Backend Components

#### Server (`server.js`)
- `/api/create-avatar` endpoint for avatar generation
- `/api/talk` endpoint for lip-synced video generation
- Integration with D-ID API
- Fallback mechanisms for API failures

#### User Model (`usermodel.js`)
- Extended with `avatarUrl` field
- Storage of avatar references

## D-ID API Integration

### Setup Instructions

1. Sign up for a D-ID account at [https://www.d-id.com](https://www.d-id.com)
2. Obtain your API key from the dashboard
3. Set the environment variable:
   ```
   DID_API_KEY=your_api_key_here
   ```

### API Endpoints Used

1. **Avatar Creation**: `POST /avatars`
2. **Talking Avatar**: `POST /talks`

### Example Implementation

```javascript
// Create avatar
const createResp = await fetch('https://api.d-id.com/avatars', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY + ':').toString('base64')}`
  },
  body: JSON.stringify({
    name: "User's Avatar",
    description: "Personal AI tutor",
    imageUrl: fullPhotoUrl
  })
});

// Generate talking avatar
const talkResp = await fetch('https://api.d-id.com/talks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY + ':').toString('base64')}`
  },
  body: JSON.stringify({
    source_url: avatarUrl,
    script: {
      type: 'text',
      input: "Hello, I'm your AI teacher!",
      provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' }
    },
    config: { stitch: true }
  })
});
```

## Fallback Mechanisms

If the D-ID API is not configured or available, the system uses:

1. **Placeholder Avatar**: Default avatar image
2. **Web Speech API**: Browser-based text-to-speech
3. **Static Image Display**: Avatar shown without animation

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

## Troubleshooting

### Common Issues

1. **Avatar Not Created**
   - Check profile photo upload
   - Verify D-ID API key
   - Review server logs

2. **Voice Not Working**
   - Ensure browser supports Web Speech API
   - Check microphone permissions
   - Test with simple text

3. **Avatar Not Animated**
   - Verify D-ID integration
   - Check internet connection
   - Confirm API quota

### Error Messages

- "No profile photo found" - User must upload a photo first
- "DID_API_KEY not set" - Environment variable missing
- "Avatar creation failed" - API error or network issue

## Future Enhancements

1. **Emotion Detection**: Avatar expressions based on content
2. **Gesture Support**: Hand movements and body language
3. **Multi-language**: Support for non-English languages
4. **Custom Avatars**: User-designed avatar features
5. **Interactive Lessons**: Avatar-guided learning activities

## Security Considerations

1. **API Key Protection**: Stored as environment variable
2. **Photo Privacy**: Secure storage and processing
3. **Data Encryption**: HTTPS for all communications
4. **User Consent**: Clear avatar usage information

## Performance Optimization

1. **Caching**: Store generated avatars
2. **Preloading**: Load avatar assets in advance
3. **Compression**: Optimize media files
4. **Lazy Loading**: Load features on demand