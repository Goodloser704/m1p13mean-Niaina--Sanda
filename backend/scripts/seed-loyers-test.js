/**
 * Script pour créer des loyers de test
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Loyer = require('../models/Loyer');
const Boutique = require('../models/Boutique');
const Espace = require('../models/Espace');

async function seedLoyers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer les boutiques actives avec espace
    const boutiques = await Boutique.find({ 
      statutBoutique: 'Actif',
      espace: { $exists: true, $ne: null }
    }).populate('espace');

    console.log(`📊 Boutiques trouvées: ${boutiques.length}`);
    
    if (boutiques.length === 0) {
      console.log('⚠️  Aucune boutique active avec espace trouvée');
      console.log('ℹ️  Vérification des boutiques...');
      const allBoutiques = await Boutique.find({});
      console.log(`   Total boutiques: ${allBoutiques.length}`);
      allBoutiques.forEach(b => {
        console.log(`   - ${b.nom}: statut=${b.statutBoutique}, espace=${b.espace || 'null'}`);
      });
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`📊 ${boutiques.length} boutiques actives trouvées\n`);

    const now = new Date();
    const moisCourant = now.getMonth() + 1;
    const anneeCourante = now.getFullYear();

    let created = 0;
    let skipped = 0;

    // Créer des loyers pour les 3 derniers mois
    for (const boutique of boutiques) {
      for (let i = 2; i >= 0; i--) {
        let mois = moisCourant - i;
        let annee = anneeCourante;

        if (mois <= 0) {
          mois += 12;
          annee -= 1;
        }

        // Vérifier si le loyer existe déjà
        const loyerExistant = await Loyer.findOne({
          boutique: boutique._id,
          mois,
          annee
        });

        if (loyerExistant) {
          skipped++;
          continue;
        }

        // Créer le loyer
        const dateEcheance = new Date(annee, mois - 1, 5);
        const montant = boutique.espace.loyer;

        const loyer = new Loyer({
          boutique: boutique._id,
          espace: boutique.espace._id,
          montant,
          mois,
          annee,
          dateEcheance,
          statutPaiement: i === 2 ? 'Paye' : (i === 1 ? 'Paye' : 'EnAttente')
        });

        // Si payé, ajouter les infos de paiement
        if (loyer.statutPaiement === 'Paye') {
          loyer.datePaiement = new Date(annee, mois - 1, Math.floor(Math.random() * 5) + 1);
          loyer.modePaiement = 'Portefeuille';
          const timestamp = Date.now().toString(36).toUpperCase();
          loyer.numeroTransaction = `LOYER-${annee}${String(mois).padStart(2, '0')}-${timestamp}`;
        }

        await loyer.save();
        created++;
      }
    }

    console.log('\n✅ Loyers de test créés avec succès!');
    console.log(`\n📊 Résumé:`);
    console.log(`   - Créés: ${created}`);
    console.log(`   - Ignorés (déjà existants): ${skipped}`);
    console.log(`   - Total: ${created + skipped}`);

    // Afficher les statistiques
    const stats = await Loyer.aggregate([
      {
        $group: {
          _id: '$statutPaiement',
          count: { $sum: 1 },
          montantTotal: { $sum: '$montant' }
        }
      }
    ]);

    console.log(`\n📈 Statistiques:`);
    stats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} loyers (${stat.montantTotal}€)`);
    });

    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedLoyers();
