const Boutique = require('../models/Boutique');
const Espace = require('../models/Espace');
const Achat = require('../models/Achat');
const PFTransaction = require('../models/PFTransaction');
const User = require('../models/User');

/**
 * 📊 Contrôleur Admin Dashboard
 * Gestion des statistiques et données du tableau de bord administrateur
 */
class AdminController {

  /**
   * @route   GET /api/admin/dashboard
   * @desc    Obtenir les statistiques du dashboard admin
   * @access  Private (Admin)
   * @return  { totalBoutiques, actives, inactives, tauxOccupation, loyersParMois, ... }
   */
  async getDashboardStats(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📊 [${timestamp}] Récupération statistiques dashboard admin`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      // Statistiques des boutiques
      const [
        totalBoutiques,
        boutiquesActives,
        boutiquesInactives,
        boutiquesEnAttente
      ] = await Promise.all([
        Boutique.countDocuments(),
        Boutique.countDocuments({ statut: 'Actif' }),
        Boutique.countDocuments({ statut: 'Inactif' }),
        Boutique.countDocuments({ statut: 'En_attente' })
      ]);

      // Statistiques des espaces
      const [
        totalEspaces,
        espacesOccupes,
        espacesLibres
      ] = await Promise.all([
        Espace.countDocuments(),
        Espace.countDocuments({ statut: 'Occupee' }),
        Espace.countDocuments({ statut: 'Disponible' })
      ]);

      // Taux d'occupation
      const tauxOccupation = totalEspaces > 0 ? 
        Math.round((espacesOccupes / totalEspaces) * 100) : 0;

      // Statistiques des utilisateurs
      const [
        totalUtilisateurs,
        totalCommercants,
        totalAcheteurs
      ] = await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        User.countDocuments({ role: 'Commercant' }),
        User.countDocuments({ role: 'Acheteur' })
      ]);

      // Revenus des 6 derniers mois
      const sixMoisAgo = new Date();
      sixMoisAgo.setMonth(sixMoisAgo.getMonth() - 6);

      const loyersParMois = await PFTransaction.aggregate([
        {
          $match: {
            type: 'Loyer',
            statut: 'Completee',
            createdAt: { $gte: sixMoisAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Ventes des 30 derniers jours
      const trenteDerniersJours = new Date();
      trenteDerniersJours.setDate(trenteDerniersJours.getDate() - 30);

      const ventesRecentes = await Achat.aggregate([
        {
          $match: {
            etat: 'Validee',
            createdAt: { $gte: trenteDerniersJours }
          }
        },
        {
          $group: {
            _id: null,
            totalVentes: { $sum: '$prixTotal' },
            nombreVentes: { $sum: 1 }
          }
        }
      ]);

      // Top 5 des boutiques par ventes
      const topBoutiques = await Achat.aggregate([
        {
          $match: {
            etat: 'Validee',
            createdAt: { $gte: trenteDerniersJours }
          }
        },
        {
          $lookup: {
            from: 'produits',
            localField: 'produit',
            foreignField: '_id',
            as: 'produitInfo'
          }
        },
        {
          $unwind: '$produitInfo'
        },
        {
          $lookup: {
            from: 'boutiques',
            localField: 'produitInfo.boutique',
            foreignField: '_id',
            as: 'boutiqueInfo'
          }
        },
        {
          $unwind: '$boutiqueInfo'
        },
        {
          $group: {
            _id: '$boutiqueInfo._id',
            nom: { $first: '$boutiqueInfo.nom' },
            totalVentes: { $sum: '$prixTotal' },
            nombreVentes: { $sum: 1 }
          }
        },
        {
          $sort: { totalVentes: -1 }
        },
        {
          $limit: 5
        }
      ]);

      const stats = {
        boutiques: {
          total: totalBoutiques,
          actives: boutiquesActives,
          inactives: boutiquesInactives,
          enAttente: boutiquesEnAttente
        },
        espaces: {
          total: totalEspaces,
          occupes: espacesOccupes,
          libres: espacesLibres,
          tauxOccupation
        },
        utilisateurs: {
          total: totalUtilisateurs,
          commercants: totalCommercants,
          acheteurs: totalAcheteurs
        },
        revenus: {
          loyersParMois: loyersParMois.map(item => ({
            mois: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            montant: item.total,
            nombreTransactions: item.count
          })),
          totalLoyers: loyersParMois.reduce((sum, item) => sum + item.total, 0)
        },
        ventes: {
          totalVentes30j: ventesRecentes[0]?.totalVentes || 0,
          nombreVentes30j: ventesRecentes[0]?.nombreVentes || 0,
          topBoutiques
        },
        dateGeneration: new Date()
      };

      console.log(`✅ Statistiques générées avec succès`);
      console.log(`   🏪 Boutiques: ${totalBoutiques} (${boutiquesActives} actives)`);
      console.log(`   🏢 Espaces: ${espacesOccupes}/${totalEspaces} occupés (${tauxOccupation}%)`);
      console.log(`   👥 Utilisateurs: ${totalUtilisateurs}`);
      
      res.json(stats);

    } catch (error) {
      console.error(`❌ Erreur récupération statistiques dashboard:`, error.message);
      console.error(`   📊 Stack:`, error.stack);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new AdminController();