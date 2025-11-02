// Test script for D-ID API integration
// Use the built-in fetch API instead of node-fetch

// Use the provided API key
const DID_API_KEY = "c2Fpbmlrc2hheWpha2tlbmFAZ21haWwuY29t:nAlhA9RNDehhGzdBgZJ4b";

async function testDIDAPI() {
    console.log('Testing D-ID API integration...');
    
    try {
        // Test 1: Check if API key is valid by calling the /avatars endpoint
        console.log('\n1. Testing API key validity...');
        
        const avatarsResp = await fetch('https://api.d-id.com/avatars', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`
            }
        });
        
        console.log('Avatars endpoint status:', avatarsResp.status);
        
        if (avatarsResp.status === 200) {
            console.log('✅ API key is valid');
            const avatarsData = await avatarsResp.json();
            console.log('Existing avatars:', avatarsData);
        } else {
            console.log('❌ API key validation failed');
            const errorData = await avatarsResp.text();
            console.log('Error details:', errorData);
            return;
        }
        
        // Test 2: Test talk creation
        console.log('\n2. Testing talk creation...');
        
        const talkResp = await fetch('https://api.d-id.com/talks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`
            },
            body: JSON.stringify({
                source_url: "https://cdn.discordapp.com/attachments/1127860890006409337/1127860923460689950/ai-avatar.png",
                script: {
                    type: 'text',
                    input: "Hello! I'm your AI teacher. Welcome to Twinskill!",
                    provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' }
                },
                config: { stitch: true }
            })
        });
        
        console.log('Talk creation status:', talkResp.status);
        
        if (talkResp.status === 201) {
            console.log('✅ Talk creation successful');
            const talkData = await talkResp.json();
            console.log('Talk data:', talkData);
            
            // Test 3: Poll for completion
            console.log('\n3. Polling for talk completion...');
            const talkId = talkData.id;
            
            let attempts = 0;
            const maxAttempts = 20;
            
            while (attempts < maxAttempts) {
                attempts++;
                console.log(`Polling attempt ${attempts}...`);
                
                const pollResp = await fetch(`https://api.d-id.com/talks/${talkId}`, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`
                    }
                });
                
                const pollData = await pollResp.json();
                console.log('Poll response:', pollData.status);
                
                if (pollData.status === 'done' && pollData.result_url) {
                    console.log('✅ Talk generation completed successfully');
                    console.log('Video URL:', pollData.result_url);
                    break;
                } else if (pollData.status === 'error') {
                    console.log('❌ Talk generation failed');
                    console.log('Error details:', pollData);
                    break;
                } else {
                    console.log('Talk still processing, waiting 3 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        } else {
            console.log('❌ Talk creation failed');
            const errorData = await talkResp.text();
            console.log('Error details:', errorData);
        }
        
        console.log('\n=== D-ID API Test Completed ===');
        
    } catch (error) {
        console.error('Test failed with error:', error.message);
        console.error('Error stack:', error.stack);
    }
}

// Run the test
testDIDAPI();