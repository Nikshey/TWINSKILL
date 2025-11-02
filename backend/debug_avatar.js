// Debug script for avatar creation
console.log('=== Debugging AI Avatar Creation ===\n');

// Test 1: Check if D-ID API key is set
console.log('1. Checking D-ID API Key...');
const apiKey = process.env.DID_API_KEY || "c2Fpbmlrc2hheWpha2tlbmFAZ21haWwuY29t:nAlhA9RNDehhGzdBgZJ4b";
console.log('API Key exists:', !!apiKey);
console.log('API Key length:', apiKey.length);

// Test 2: Test D-ID API connectivity
console.log('\n2. Testing D-ID API connectivity...');

// Import fetch if available
async function testDIDAPI() {
    try {
        // Test a simple GET request to D-ID API
        const response = await fetch('https://api.d-id.com/talks', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`
            }
        });
        
        console.log('D-ID API Response Status:', response.status);
        
        if (response.status === 200) {
            console.log('✅ D-ID API is accessible');
            const data = await response.json();
            console.log('API Response:', JSON.stringify(data).substring(0, 100) + '...');
        } else {
            console.log('❌ D-ID API connection failed with status:', response.status);
            const errorText = await response.text();
            console.log('Error details:', errorText.substring(0, 200) + '...');
        }
    } catch (error) {
        console.log('❌ Error connecting to D-ID API:', error.message);
    }
}

// Test 3: Check if we can access the backend endpoints
async function testBackendEndpoints() {
    console.log('\n3. Testing backend endpoints...');
    
    try {
        // Test the create avatar endpoint
        const response = await fetch('http://localhost:3000/api/create-avatar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com'
            })
        });
        
        console.log('Avatar Creation Endpoint Status:', response.status);
        
        if (response.status === 404) {
            console.log('✅ Avatar creation endpoint accessible (user not found is expected)');
        } else {
            const data = await response.json();
            console.log('Response:', data);
        }
    } catch (error) {
        console.log('❌ Error testing backend endpoint:', error.message);
    }
}

// Test 4: Check if we can access the talk endpoint
async function testTalkEndpoint() {
    console.log('\n4. Testing talk endpoint...');
    
    try {
        const response = await fetch('http://localhost:3000/api/talk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageUrl: "https://cdn.discordapp.com/attachments/1127860890006409337/1127860923460689950/ai-avatar.png",
                text: "Hello, this is a test message"
            })
        });
        
        console.log('Talk Endpoint Status:', response.status);
        
        if (response.status === 200) {
            const data = await response.json();
            console.log('✅ Talk endpoint working, received:', Object.keys(data));
        } else {
            const data = await response.json();
            console.log('Response status:', response.status);
            console.log('Response data:', data);
        }
    } catch (error) {
        console.log('❌ Error testing talk endpoint:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    await testDIDAPI();
    await testBackendEndpoints();
    await testTalkEndpoint();
    
    console.log('\n=== Debugging Complete ===');
}

// Run the tests
runAllTests();