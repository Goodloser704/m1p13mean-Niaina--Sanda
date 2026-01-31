const express = require('express');
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * 🛣️ Routes d'Authentification
 * Architecture: Route → Controller → Service
 */

// @route   POST /api/auth/register
// @desc    Inscription utilisateur
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nom').notEmpty().trim(),
  body('prenom').notEmpty().trim(),
  body('role').isIn(['boutique', 'client'])
], authController.register);

// @route   POST /api/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], authController.login);

// @route   GET /api/auth/me
// @desc    Obtenir les infos de l'utilisateur connecté
// @access  Private
router.get('/me', auth, authController.getProfile);

// @route   PUT /api/auth/profile
// @desc    Mettre à jour le profil utilisateur
// @access  Private
router.put('/profile', [
  // Champs obligatoires seulement s'ils sont présents
  body('nom').optional({ nullable: true, checkFalsy: true }).isLength({ min: 1 }).trim(),
  body('prenom').optional({ nullable: true, checkFalsy: true }).isLength({ min: 1 }).trim(),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
  
  // Champs complètement optionnels
  body('telephone').optional({ nullable: true, checkFalsy: false }).trim(),
  body('dateNaissance').optional({ nullable: true, checkFalsy: false }),
  body('genre').optional({ nullable: true, checkFalsy: false }).isIn(['homme', 'femme', 'autre']),
  body('adresse').optional({ nullable: true, checkFalsy: false }).trim(),
  
  // Champs boutique optionnels
  body('nomBoutique').optional({ nullable: true, checkFalsy: false }).trim(),
  body('descriptionBoutique').optional({ nullable: true, checkFalsy: false }).trim(),
  body('categorieActivite').optional({ nullable: true, checkFalsy: false }).isIn(['mode', 'electronique', 'maison', 'beaute', 'sport', 'alimentation', 'autre']),
  body('numeroSiret').optional({ nullable: true, checkFalsy: false }).trim(),
  body('adresseBoutique').optional({ nullable: true, checkFalsy: false }).trim()
], auth, authController.updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Changer le mot de passe
// @access  Private
router.put('/change-password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], auth, authController.changePassword);

// @route   DELETE /api/auth/account
// @desc    Supprimer le compte utilisateur
// @access  Private
router.delete('/account', auth, authController.deleteAccount);

// @route   GET /api/auth/users/search
// @desc    Rechercher des utilisateurs (Admin seulement)
// @access  Private (Admin)
router.get('/users/search', adminAuth, authController.searchUsers);

// @route   PUT /api/auth/users/:userId/status
// @desc    Mettre à jour le statut d'un utilisateur (Admin seulement)
// @access  Private (Admin)
router.put('/users/:userId/status', adminAuth, authController.updateUserStatus);

// @route   GET /api/auth/boutiques/pending
// @desc    Obtenir les boutiques en attente de validation (Admin seulement)
// @access  Private (Admin)
router.get('/boutiques/pending', adminAuth, authController.getPendingBoutiques);

// @route   PUT /api/auth/boutiques/:boutiqueId/approve
// @desc    Approuver une boutique (Admin seulement)
// @access  Private (Admin)
router.put('/boutiques/:boutiqueId/approve', adminAuth, authController.approveBoutique);

// @route   PUT /api/auth/boutiques/:boutiqueId/reject
// @desc    Rejeter une boutique (Admin seulement)
// @access  Private (Admin)
router.put('/boutiques/:boutiqueId/reject', [
  body('reason').optional().isLength({ max: 500 })
], adminAuth, authController.rejectBoutique);

module.exports = router;