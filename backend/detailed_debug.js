// More detailed debug script for avatar creation
console.log('=== Detailed Debugging AI Avatar Creation ===\n');

// Test the talk endpoint with more details
async function detailedTalkTest() {
    console.log('Testing talk endpoint with detailed error handling...');
    
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
        
        console.log('Response Status:', response.status);
        console.log('Response Headers:', [...response.headers.entries()]);
        
        const text = await response.text();
        console.log('Response Body:', text);
        
        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', json);
        } catch (e) {
            console.log('Response is not JSON:', text.substring(0, 100) + '...');
        }
    } catch (error) {
        console.log('Network Error:', error.message);
        console.log('Error Stack:', error.stack);
    }
}

// Test avatar creation with a mock user
async function testAvatarCreation() {
    console.log('\nTesting avatar creation...');
    
    try {
        const response = await fetch('http://localhost:3000/api/create-avatar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com'
            })
        });
        
        console.log('Avatar Creation Status:', response.status);
        const data = await response.json();
        console.log('Avatar Creation Response:', data);
    } catch (error) {
        console.log('Avatar Creation Error:', error.message);
    }
}

// Run tests
detailedTalkTest().then(() => {
    return testAvatarCreation();
}).then(() => {
    console.log('\n=== Detailed Debugging Complete ===');
});