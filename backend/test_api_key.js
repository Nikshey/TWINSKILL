// Test the API key format
const apiKey = "c2Fpbmlrc2hheWpha2tlbmFAZ21haWwuY29t:nAlhA9RNDehhGzdBgZJ4b";
console.log('API Key:', apiKey);
console.log('Base64 encoded:', Buffer.from(apiKey).toString('base64'));

// Test a simple fetch to see if we get a different response
fetch('https://api.d-id.com/talks', {
  method: 'GET', // Just a GET request to see what we get
  headers: {
    'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`
  }
})
.then(response => {
  console.log('Response status:', response.status);
  return response.text();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Error:', error);
});