const fetch = require('node-fetch');

async function testDIDAvatarAPI() {
  const apiKey = "c2Fpbmlrc2hheWpha2tlbmFAZ21haWwuY29t:nAlhA9RNDehhGzdBgZJ4b";
  const encodedApiKey = Buffer.from(apiKey).toString('base64');
  
  console.log('Testing D-ID Avatar API with encoded key:', encodedApiKey);
  
  try {
    // Test POST request to avatars endpoint to create an avatar
    const response = await fetch('https://api.d-id.com/avatars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedApiKey}`
      },
      body: JSON.stringify({
        name: "Test Avatar",
        description: "Testing avatar creation",
        imageUrl: "https://cdn.discordapp.com/attachments/1127860890006409337/1127860923460689950/ai-avatar.png",
        visibility: "private"
      })
    });
    
    console.log('POST /avatars status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Avatar creation data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDIDAvatarAPI();