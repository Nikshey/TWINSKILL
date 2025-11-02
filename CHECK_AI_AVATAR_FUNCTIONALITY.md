# How to Check if AI Avatar is Generated and Working

This guide will help you verify that the AI avatar functionality is working properly in your Twinskill application.

## Prerequisites
- Server running on `http://localhost:3000`
- MongoDB database connected
- D-ID API key configured (already done)

## Step-by-Step Verification Process

### 1. Check Server Status
Open your browser and navigate to:
```
http://localhost:3000/health
```

You should see a response like:
```json
{
  "dbState": "connected",
  "readyState": 1
}
```

This confirms the server is running and the database is connected.

### 2. Test the Verification Page
Open the verification page we created:
```
http://localhost:3000/avatar_verification.html
```

Click on each button to test:
- Server Status
- Avatar Creation
- Talk Generation

### 3. Register a New User (Complete Workflow Test)
1. Open `http://localhost:3000/register.html` in your browser
2. Fill in the registration form:
   - Name: Test User
   - Email: test@gmail.com
   - Phone: 1234567890
   - Password: testpassword
   - Upload a profile photo (any clear image will work)
3. Click "Register"

### 4. Create Your AI Avatar
1. After registration, you'll be redirected to the dashboard
2. Click the menu icon (☰) in the top right corner
3. Select "Profile" from the dropdown menu
4. Click the "Create AI Avatar" button
5. Wait for the creation process to complete
   - You should see status messages updating
   - When complete, you'll see "Avatar created!"

### 5. Test Avatar Interaction
1. From the dashboard, click on any skill card (Chess, Piano, or Yoga)
2. In the learning page:
   - You should see your avatar on the left side
   - The avatar area should show either:
     - Your personalized avatar image
     - A placeholder avatar if personalization failed
3. Type a question in the chat input at the bottom, for example:
   - "How do I start playing chess?"
   - "What are the basic piano chords?"
   - "How do I improve my yoga balance?"
4. Press Enter or click "Send"
5. Observe the response:
   - You should hear the avatar speaking (audio)
   - You should see the avatar video with lip-synced speech
   - The response should appear in the chat box

## Expected Results

### Success Case
- Avatar creation completes within 30 seconds
- Avatar appears in the profile section
- When asking questions:
  - You hear the avatar speaking
  - You see the avatar video with lip-sync
  - The response appears in the chat

### Fallback Case
If the D-ID service is temporarily unavailable:
- Placeholder avatar image is used
- Text-to-speech is used instead of lip-synced video
- All functionality remains intact

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

## Manual API Testing

You can also manually test the backend endpoints:

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

### Test Talk Generation (this is what creates the lip-synced video)
```bash
curl -X POST http://localhost:3000/api/talk \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://cdn.discordapp.com/attachments/1127860890006409337/1127860923460689950/ai-avatar.png","text":"Hello, this is a test message"}'
```

## Verification Checklist

- [ ] Server is running on port 3000
- [ ] MongoDB is connected
- [ ] API key is properly configured
- [ ] User can register with profile photo
- [ ] Avatar can be created from profile photo
- [ ] Avatar appears in user profile
- [ ] User can navigate to learning section
- [ ] Avatar responds to questions with voice
- [ ] Avatar shows lip-synced video
- [ ] Fallback mechanisms work when needed

## Support

If you encounter any issues:
1. Check the server console for error messages
2. Verify all environment variables are set
3. Ensure the D-ID API key has not expired
4. Contact D-ID support if API errors persist