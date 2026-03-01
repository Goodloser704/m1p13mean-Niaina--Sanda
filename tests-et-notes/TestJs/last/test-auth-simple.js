const axios = require('axios');

async function testAuth() {
  try {
    console.log('Test authentification...');
    
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@mall.com',
      motDePasse: 'Admin123456!'
    });
    
    console.log('Succès!');
    console.log('Token:', res.data.token);
    console.log('User:', res.data.user);
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
  }
}

testAuth();
