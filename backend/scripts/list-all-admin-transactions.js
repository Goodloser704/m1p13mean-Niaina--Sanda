const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const PorteFeuille = require('../models/PorteFeuille');
const PFTransaction = require('../models/PFTransaction');

async function listAllTransactions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const admin = await User.findOne({ email: 'admin@mall.com' });
    const pf = await PorteFeuille.findOne({ owner: admin._id });
    
    const txs = await PFTransaction.find({ 
      toWallet: pf._id, 
      statut: 'Completee' 
    }).sort({ createdAt: -1 });
    
    console.log(`\n📊 Total transactions vers admin@mall.com: ${txs.length}\n`);
    
    let total = 0;
    txs.forEach((t, i) => {
      console.log(`${i+1}. ${t.createdAt.toISOString().slice(0,16).replace('T', ' ')}`);
      console.log(`   ${t.type}: ${t.amount}€`);
      console.log(`   ${t.description}\n`);
      total += t.amount;
    });
    
    console.log(`💰 Total reçu: ${total}€`);
    console.log(`💰 Solde portefeuille: ${pf.balance}€\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

listAllTransactions();
