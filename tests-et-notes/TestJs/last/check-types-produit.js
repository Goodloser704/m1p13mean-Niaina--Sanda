const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'mall-app/backend/.env') });

const TypeProduit = require('../../../mall-app/backend/models/TypeProduit');

async function checkTypes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const types = await TypeProduit.find({});
    
    console.log(`Found ${types.length} types de produits:\n`);
    
    types.forEach((type, index) => {
      console.log(`Type ${index + 1}:`);
      console.log('  ID:', type._id);
      console.log('  Nom:', type.nom);
      console.log('  Description:', type.description);
      console.log('  isActive:', type.isActive);
      console.log('');
    });
    
    // Test de l'API
    console.log('\n🧪 Test de l\'API types-produit...');
    const fetch = require('node-fetch');
    
    const response = await fetch('https://m1p13mean-niaina-1.onrender.com/api/types-produit');
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkTypes();
