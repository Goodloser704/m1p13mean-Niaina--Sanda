const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Boutique = require('../models/Boutique');
const TypeProduit = require('../models/TypeProduit');
const CategorieBoutique = require('../models/CategorieBoutique');

async function createDefaultTypes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Récupérer toutes les boutiques
    const boutiques = await Boutique.find({}).populate('categorie', 'categorie');
    console.log(`Found ${boutiques.length} boutiques\n`);
    
    let created = 0;
    let skipped = 0;
    
    for (const boutique of boutiques) {
      // Vérifier si la boutique a déjà des types
      const existingTypes = await TypeProduit.countDocuments({ 
        boutique: boutique._id,
        isActive: true 
      });
      
      if (existingTypes > 0) {
        console.log(`⏭️  Boutique "${boutique.nom}" a déjà ${existingTypes} types`);
        skipped++;
        continue;
      }
      
      // Créer les types par défaut
      await TypeProduit.creerTypesParDefaut(
        boutique._id, 
        boutique.categorie?.categorie
      );
      
      const newTypes = await TypeProduit.find({ 
        boutique: boutique._id,
        isActive: true 
      });
      
      console.log(`✅ Boutique "${boutique.nom}" - ${newTypes.length} types créés`);
      created++;
    }
    
    console.log(`\n📊 === RÉSUMÉ ===`);
    console.log(`✅ Boutiques avec types créés: ${created}`);
    console.log(`⏭️  Boutiques ignorées (ont déjà des types): ${skipped}`);
    console.log(`📝 Total: ${boutiques.length}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createDefaultTypes();
