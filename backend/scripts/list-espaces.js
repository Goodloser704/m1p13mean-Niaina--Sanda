/**
 * 📋 Script pour lister tous les espaces
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Espace = require('../models/Espace');
const Etage = require('../models/Etage'); // Import nécessaire pour populate

async function listEspaces() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const espaces = await Espace.find().populate('etage', 'niveau nom');
    
    console.log(`📊 Total: ${espaces.length} espaces\n`);
    
    espaces.forEach((espace, index) => {
      console.log(`${index + 1}. Espace ${espace.code}`);
      console.log(`   ID: ${espace._id}`);
      console.log(`   Surface: ${espace.surface}m²`);
      console.log(`   Loyer: ${espace.loyer}€`);
      console.log(`   Statut: ${espace.statut}`);
      console.log(`   Étage: ${espace.etage ? `${espace.etage.nom} (niveau ${espace.etage.niveau})` : 'NON DÉFINI'}`);
      console.log('');
    });
    
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

listEspaces();
