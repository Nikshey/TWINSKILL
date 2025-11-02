// Comprehensive debug script for avatar creation
console.log('=== Comprehensive Debugging AI Avatar Creation ===\n');

const apiKey = "c2Fpbmlrc2hheWpha2tlbmFAZ21haWwuY29t:nAlhA9RNDehhGzdBgZJ4b";
const encodedApiKey = Buffer.from(apiKey).toString('base64');

console.log('API Key:', apiKey);
console.log('Encoded API Key:', encodedApiKey);

// Test 1: GET request to talks endpoint (should work)
async function testGETRequest() {
    console.log('\n1. Testing GET request to talks endpoint...');
    
    try {
        const response = await fetch('https://api.d-id.com/talks', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${encodedApiKey}`
            }
        });
        
        console.log('GET Response Status:', response.status);
        const data = await response.json();
        console.log('GET Response Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('GET Request Error:', error.message);
    }
}

// Test 2: POST request to talks endpoint (currently failing)
async function testPOSTRequest() {
    console.log('\n2. Testing POST request to talks endpoint...');
    
    try {
        const response = await fetch('https://api.d-id.com/talks', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source_url: "https://cdn.discordapp.com/attachments/1127860890006409337/1127860923460689950/ai-avatar.png",
                script: {
                    type: "text",
                    input: "Hello, this is a test message"
                }
            })
        });
        
        console.log('POST Response Status:', response.status);
        const text = await response.text();
        console.log('POST Response Text:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('POST Response Data:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Could not parse response as JSON');
        }
    } catch (error) {
        console.log('POST Request Error:', error.message);
    }
}

// Test 3: POST request to avatars endpoint
async function testAvatarsPOST() {
    console.log('\n3. Testing POST request to avatars endpoint...');
    
    try {
        const response = await fetch('https://api.d-id.com/avatars', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Test Avatar",
                description: "Test avatar for debugging",
                imageUrl: "https://cdn.discordapp.com/attachments/1127860890006409337/1127860923460689950/ai-avatar.png"
            })
        });
        
        console.log('Avatars POST Response Status:', response.status);
        const text = await response.text();
        console.log('Avatars POST Response Text:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('Avatars POST Response Data:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Could not parse response as JSON');
        }
    } catch (error) {
        console.log('Avatars POST Request Error:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    await testGETRequest();
    await testPOSTRequest();
    await testAvatarsPOST();
    
    console.log('\n=== Comprehensive Debugging Complete ===');
}

// Run the tests
runAllTests();