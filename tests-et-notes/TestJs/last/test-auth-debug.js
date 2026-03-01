const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@mall.com',
      mdp: 'Admin123456!'
    });
    
    console.log('✅ Success!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
    
  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testAuth();
