const mongoose = require('mongoose');
require('dotenv').config();

async function fixEtageIndex() {
  try {
    console.log('🔧 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté');

    const db = mongoose.connection.db;
    const collection = db.collection('etages');

    console.log('\n📋 Liste des index actuels:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });

    // Supprimer l'ancien index sur 'numero'
    console.log('\n🗑️  Suppression de l\'index "numero_1"...');
    try {
      await collection.dropIndex('numero_1');
      console.log('✅ Index "numero_1" supprimé');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️  Index "numero_1" n\'existe pas (déjà supprimé)');
      } else {
        throw error;
      }
    }

    console.log('\n📋 Index après suppression:');
    const indexesAfter = await collection.indexes();
    indexesAfter.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Correction terminée');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixEtageIndex();
