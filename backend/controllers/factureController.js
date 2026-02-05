const Facture = require('../models/Facture');
const Achat = require('../models/Achat');

/**
 * 🧾 Contrôleur des Factures
 * Gestion des factures d'achat des clients
 */
class FactureController {

  /**
   * @route   GET /api/acheteur/:id/factures
   * @desc    Obtenir toutes les factures d'un acheteur
   * @access  Private (Acheteur ou Admin)
   * @param   id - ID de l'acheteur
   * @query   page, limit, dateDebut, dateFin
   * @return  { factures, pagination }
   */
  async getMyFactures(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🧾 [${timestamp}] Récupération factures acheteur`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🎯 Target ID: ${req.params.id}`);
    
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, dateDebut, dateFin } = req.query;

      // Vérifier les permissions
      if (req.user._id.toString() !== id && req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - User: ${req.user._id}, Target: ${id}, Role: ${req.user.role}`);
        return res.status(403).json({ 
          message: 'Vous ne pouvez consulter que vos propres factures' 
        });
      }

      // Construire la requête
      let query = { acheteur: id };

      // Filtrer par date si spécifié
      if (dateDebut || dateFin) {
        query.dateEmission = {};
        if (dateDebut) {
          query.dateEmission.$gte = new Date(dateDebut);
        }
        if (dateFin) {
          const endDate = new Date(dateFin);
          endDate.setHours(23, 59, 59, 999); // Fin de journée
          query.dateEmission.$lte = endDate;
        }
      }

      // Récupérer les factures avec pagination
      const factures = await Facture.find(query)
        .populate('acheteur', 'nom prenoms email')
        .populate({
          path: 'achats',
          populate: {
            path: 'produit',
            populate: {
              path: 'boutique',
              select: 'nom'
            }
          }
        })
        .sort({ dateEmission: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Facture.countDocuments(query);

      // Calculer les statistiques
      const stats = await Facture.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalFactures: { $sum: 1 },
            montantTotal: { $sum: '$montantTotal' },
            montantMoyen: { $avg: '$montantTotal' }
          }
        }
      ]);

      console.log(`✅ ${factures.length} factures récupérées`);
      
      res.json({
        factures: factures.map(facture => ({
          _id: facture._id,
          numeroFacture: facture.numeroFacture,
          dateEmission: facture.dateEmission,
          montantTotal: facture.montantTotal,
          statut: facture.statut,
          achats: facture.achats.map(achat => ({
            _id: achat._id,
            produit: {
              _id: achat.produit._id,
              nom: achat.produit.nom,
              prix: achat.produit.prix,
              boutique: achat.produit.boutique
            },
            quantite: achat.quantite,
            prixTotal: achat.prixTotal
          })),
          acheteur: facture.acheteur
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        statistiques: stats[0] ? {
          totalFactures: stats[0].totalFactures,
          montantTotal: Math.round(stats[0].montantTotal * 100) / 100,
          montantMoyen: Math.round(stats[0].montantMoyen * 100) / 100
        } : {
          totalFactures: 0,
          montantTotal: 0,
          montantMoyen: 0
        }
      });

    } catch (error) {
      console.error(`❌ Erreur récupération factures:`, error.message);
      console.error(`   📊 Stack:`, error.stack);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/factures/:factureId
   * @desc    Obtenir une facture spécifique
   * @access  Private (Propriétaire ou Admin)
   * @param   factureId - ID de la facture
   * @return  { facture }
   */
  async getFactureById(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🧾 [${timestamp}] Récupération facture par ID`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🧾 Facture ID: ${req.params.factureId}`);
    
    try {
      const { factureId } = req.params;

      const facture = await Facture.findById(factureId)
        .populate('acheteur', 'nom prenoms email telephone')
        .populate({
          path: 'achats',
          populate: {
            path: 'produit',
            populate: {
              path: 'boutique',
              select: 'nom description'
            }
          }
        });

      if (!facture) {
        console.log(`❌ Facture non trouvée: ${factureId}`);
        return res.status(404).json({ message: 'Facture non trouvée' });
      }

      // Vérifier les permissions
      if (req.user._id.toString() !== facture.acheteur._id.toString() && req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - User: ${req.user._id}, Owner: ${facture.acheteur._id}`);
        return res.status(403).json({ 
          message: 'Vous ne pouvez consulter que vos propres factures' 
        });
      }

      console.log(`✅ Facture récupérée: ${facture.numeroFacture}`);
      
      res.json({
        facture: {
          _id: facture._id,
          numeroFacture: facture.numeroFacture,
          dateEmission: facture.dateEmission,
          montantTotal: facture.montantTotal,
          statut: facture.statut,
          acheteur: facture.acheteur,
          achats: facture.achats.map(achat => ({
            _id: achat._id,
            produit: {
              _id: achat.produit._id,
              nom: achat.produit.nom,
              description: achat.produit.description,
              prix: achat.produit.prix,
              boutique: achat.produit.boutique
            },
            quantite: achat.quantite,
            prixTotal: achat.prixTotal,
            dateAchat: achat.dateAchat,
            etat: achat.etat
          })),
          createdAt: facture.createdAt,
          updatedAt: facture.updatedAt
        }
      });

    } catch (error) {
      console.error(`❌ Erreur récupération facture:`, error.message);
      
      if (error.name === 'CastError') {
        return res.status(400).json({ message: 'ID de facture invalide' });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/factures/:factureId/pdf
   * @desc    Télécharger une facture en PDF
   * @access  Private (Propriétaire ou Admin)
   * @param   factureId - ID de la facture
   * @return  PDF file
   */
  async downloadFacturePDF(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📄 [${timestamp}] Téléchargement PDF facture`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🧾 Facture ID: ${req.params.factureId}`);
    
    try {
      const { factureId } = req.params;

      const facture = await Facture.findById(factureId)
        .populate('acheteur', 'nom prenoms email telephone')
        .populate({
          path: 'achats',
          populate: {
            path: 'produit',
            populate: {
              path: 'boutique',
              select: 'nom description'
            }
          }
        });

      if (!facture) {
        return res.status(404).json({ message: 'Facture non trouvée' });
      }

      // Vérifier les permissions
      if (req.user._id.toString() !== facture.acheteur._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Vous ne pouvez télécharger que vos propres factures' 
        });
      }

      // Pour l'instant, retourner les données JSON
      // Dans une vraie implémentation, on utiliserait une librairie comme PDFKit
      console.log(`✅ Données facture préparées pour PDF: ${facture.numeroFacture}`);
      
      res.json({
        message: 'Génération PDF non implémentée',
        facture: {
          numeroFacture: facture.numeroFacture,
          dateEmission: facture.dateEmission,
          montantTotal: facture.montantTotal,
          acheteur: facture.acheteur,
          achats: facture.achats
        }
      });

    } catch (error) {
      console.error(`❌ Erreur téléchargement PDF:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new FactureController();