# Login Troubleshooting Guide

## Common Issue: "Failed to fetch" Error

If you're seeing a "Failed to fetch" error when trying to log in, it's most likely because you're opening the login.html file directly in your browser instead of accessing it through the server.

## Solution

### Correct Way to Access the Application

1. Make sure the server is running:
   - Open a terminal/command prompt
   - Navigate to the backend directory: `cd c:\twinskill\PROJECTS\backend`
   - Start the server: `node server.js`

2. Access the application through the server:
   - Open your browser
   - Go to: `http://localhost:3000/login.html`
   - **DO NOT** open the file directly from your file system

### Why This Happens

When you open the login.html file directly:
- The URL becomes something like `file:///c:/twinskill/PROJECTS/frontend/login.html`
- The fetch request to `/api/login` tries to go to `file:///api/login`
- This fails because the API endpoint only exists on the server

When you access through the server:
- The URL is `http://localhost:3000/login.html`
- The fetch request to `/api/login` correctly goes to `http://localhost:3000/api/login`
- This works because the API endpoint exists on the server

## Testing the Server

You can verify the server is running correctly by:

1. Checking if you can access the health endpoint:
   - Visit: `http://localhost:3000/health`
   - You should see: `{"dbState":"connected","readyState":1}`

2. Testing the login endpoint directly:
   - Visit: `http://localhost:3000/api/login` (GET request)
   - You should see: `{"message":"Email and password are required"}`

## If the Server Won't Start

If you're having trouble starting the server:

1. Make sure you have Node.js installed
2. Make sure MongoDB is running on your system
3. Check the terminal output for any error messages
4. Make sure you're in the correct directory when running `node server.js`

## Additional Troubleshooting

If you're still having issues:

1. Clear your browser cache and try again
2. Try using a different browser
3. Check the browser's developer console (F12) for more detailed error messages
4. Make sure no other applications are using port 3000

## Contact Support

If you continue to have issues, please provide:
1. The exact error message you're seeing
2. The URL you're using to access the application
3. Any error messages in the browser's developer console
4. Any error messages in the server terminal