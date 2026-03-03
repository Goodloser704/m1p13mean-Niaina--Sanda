const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const factureController = require('../controllers/factureController');

const router = express.Router();

/**
 * 🧾 Routes des Factures
 * Gestion des factures d'achat des clients
 * Architecture: Route → Controller → Service
 */

// Middleware d'authentification pour toutes les routes
router.use(auth);

// @route   GET /api/acheteur/:id/factures
// @desc    Obtenir toutes les factures d'un acheteur
// @access  Private (Acheteur ou Admin)
// @param   id - ID de l'acheteur
// @query   page, limit, dateDebut, dateFin
// @return  { factures, pagination, statistiques }
router.get('/acheteur/:id/factures', factureController.getMyFactures);

// @route   GET /api/factures/:factureId
// @desc    Obtenir une facture spécifique
// @access  Private (Propriétaire ou Admin)
// @param   factureId - ID de la facture
// @return  { facture }
router.get('/:factureId', factureController.getFactureById);

// @route   GET /api/factures/:factureId/pdf
// @desc    Télécharger une facture en PDF
// @access  Private (Propriétaire ou Admin)
// @param   factureId - ID de la facture
// @return  PDF file
router.get('/:factureId/pdf', factureController.downloadFacturePDF);

module.exports = router;