const fetch = require('node-fetch');

async function testDIDAPI() {
  const apiKey = "c2Fpbmlrc2hheWpha2tlbmFAZ21haWwuY29t:nAlhA9RNDehhGzdBgZJ4b";
  const encodedApiKey = Buffer.from(apiKey).toString('base64');
  
  console.log('Testing D-ID API with encoded key:', encodedApiKey);
  
  try {
    // Test GET request to avatars endpoint
    const response = await fetch('https://api.d-id.com/avatars', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedApiKey}`
      }
    });
    
    console.log('GET /avatars status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Avatars data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDIDAPI();