/**
 * Script pour corriger l'index d'unicité du code d'espace
 * Permet de réutiliser un code après suppression (soft delete)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Espace = require('../models/Espace');

async function fixEspaceIndex() {
  try {
    console.log('🔧 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n📋 Liste des index actuels:');
    const indexes = await Espace.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Supprimer l'ancien index unique sur 'code'
    console.log('\n🗑️  Suppression de l\'ancien index unique sur "code"...');
    try {
      await Espace.collection.dropIndex('code_1');
      console.log('✅ Index "code_1" supprimé');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index "code_1" n\'existe pas (déjà supprimé)');
      } else {
        console.log('⚠️  Erreur lors de la suppression:', error.message);
      }
    }

    // Supprimer aussi l'ancien index sur 'codeEspace' si il existe
    console.log('\n🗑️  Suppression de l\'ancien index sur "codeEspace"...');
    try {
      await Espace.collection.dropIndex('codeEspace_1');
      console.log('✅ Index "codeEspace_1" supprimé');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index "codeEspace_1" n\'existe pas (déjà supprimé)');
      } else {
        console.log('⚠️  Erreur lors de la suppression:', error.message);
      }
    }

    // Créer le nouvel index composé avec partialFilterExpression
    console.log('\n🔨 Création du nouvel index composé...');
    await Espace.collection.createIndex(
      { code: 1, etage: 1, isActive: 1 },
      { 
        unique: true,
        partialFilterExpression: { isActive: true },
        name: 'code_etage_active_unique'
      }
    );
    console.log('✅ Nouvel index créé avec succès');

    console.log('\n📋 Liste des index après modification:');
    const newIndexes = await Espace.collection.getIndexes();
    console.log(JSON.stringify(newIndexes, null, 2));

    console.log('\n✅ Migration terminée avec succès!');
    console.log('ℹ️  Vous pouvez maintenant réutiliser un code après suppression d\'un espace');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

fixEspaceIndex();
