// Test script to verify login functionality
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    // Test with missing data
    console.log('\n1. Testing with missing data:');
    const response1 = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', data1);
    
    // Test with invalid credentials
    console.log('\n2. Testing with invalid credentials:');
    const response2 = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'nonexistent@gmail.com',
        password: 'wrongpassword'
      })
    });
    
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', data2);
    
    console.log('\nLogin endpoint tests completed.');
  } catch (error) {
    console.error('Error testing login endpoint:', error.message);
  }
}

testLogin();