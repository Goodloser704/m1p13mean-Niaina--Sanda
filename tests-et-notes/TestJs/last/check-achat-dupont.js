const mongoose = require('mongoose');
const Achat = require('../../../mall-app/backend/models/Achat');
const User = require('../../../mall-app/backend/models/User');
const Boutique = require('../../../mall-app/backend/models/Boutique');

// Lire le .env manuellement
const fs = require('fs');
const envContent = fs.readFileSync('./mall-app/backend/.env', 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

async function checkAchat() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver le client
    const client = await User.findOne({ email: 'client@test.com' });
    console.log('\n📧 Client:', client?.email, '- ID:', client?._id);

    // Trouver la boutique Cscecevvevev
    const boutique = await Boutique.findOne({ nom: /Cscecevvevev/i })
      .populate('commercant', 'email nom prenoms');
    console.log('\n🏪 Boutique:', boutique?.nom);
    console.log('👤 Commerçant:', boutique?.commercant?.email);

    // Trouver les achats du client
    const achats = await Achat.find({ acheteur: client._id })
      .populate('produit', 'nom boutique')
      .populate({
        path: 'produit',
        populate: {
          path: 'boutique',
          select: 'nom commercant'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('\n🛒 Achats récents du client:');
    achats.forEach((achat, i) => {
      console.log(`\n${i + 1}. Produit: ${achat.produit?.nom}`);
      console.log(`   Boutique: ${achat.produit?.boutique?.nom}`);
      console.log(`   État: ${achat.etat}`);
      console.log(`   Type: ${achat.typeAchat?.type}`);
      console.log(`   Quantité: ${achat.quantite}`);
      console.log(`   Montant: ${achat.montantTotal}€`);
      console.log(`   Date: ${achat.createdAt}`);
    });

    // Vérifier les achats pour le commerçant de cette boutique
    if (boutique) {
      const Produit = require('../../../mall-app/backend/models/Produit');
      const produits = await Produit.find({ boutique: boutique._id }).select('_id');
      const produitIds = produits.map(p => p._id);

      console.log(`\n🔍 Produits de la boutique: ${produitIds.length}`);

      const achatsCommercant = await Achat.find({
        produit: { $in: produitIds }
      })
      .populate('acheteur', 'email nom prenoms')
      .populate('produit', 'nom');

      console.log(`\n📦 Achats pour cette boutique: ${achatsCommercant.length}`);
      achatsCommercant.forEach((achat, i) => {
        console.log(`\n${i + 1}. Client: ${achat.acheteur?.email}`);
        console.log(`   Produit: ${achat.produit?.nom}`);
        console.log(`   État: ${achat.etat}`);
        console.log(`   Type: ${achat.typeAchat?.type}`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkAchat();
