const CentreCommercial = require('../models/CentreCommercial');
const { validationResult } = require('express-validator');

/**
 * 🏢 Contrôleur Centre Commercial
 * Gestion des informations du centre commercial
 */

// @route   GET /api/centre-commercial
// @desc    Obtenir les informations du centre commercial
// @access  Public
exports.obtenirCentreCommercial = async (req, res) => {
  try {
    const centreCommercial = await CentreCommercial.getPrincipal();
    
    if (!centreCommercial) {
      return res.status(404).json({
        message: 'Centre commercial non trouvé'
      });
    }
    
    res.json({
      centreCommercial
    });
  } catch (error) {
    console.error('Erreur obtention centre commercial:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération du centre commercial'
    });
  }
};

// @route   PUT /api/centre-commercial
// @desc    Modifier les informations du centre commercial (Admin seulement)
// @access  Private (Admin)
exports.modifierCentreCommercial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const {
      nom,
      description,
      adresse,
      email,
      telephone,
      photo,
      horairesGeneraux,
      siteWeb,
      reseauxSociaux
    } = req.body;
    
    let centreCommercial = await CentreCommercial.getPrincipal();
    
    if (!centreCommercial) {
      // Créer un nouveau centre commercial si aucun n'existe
      centreCommercial = new CentreCommercial({
        nom,
        description,
        adresse,
        email,
        telephone,
        photo,
        horairesGeneraux,
        siteWeb,
        reseauxSociaux
      });
    } else {
      // Mettre à jour le centre commercial existant
      if (nom) centreCommercial.nom = nom;
      if (description !== undefined) centreCommercial.description = description;
      if (adresse) centreCommercial.adresse = adresse;
      if (email !== undefined) centreCommercial.email = email;
      if (telephone !== undefined) centreCommercial.telephone = telephone;
      if (photo !== undefined) centreCommercial.photo = photo;
      if (horairesGeneraux) centreCommercial.horairesGeneraux = horairesGeneraux;
      if (siteWeb !== undefined) centreCommercial.siteWeb = siteWeb;
      if (reseauxSociaux) centreCommercial.reseauxSociaux = reseauxSociaux;
    }
    
    await centreCommercial.save();
    
    res.json({
      message: 'Centre commercial mis à jour avec succès',
      centreCommercial
    });
  } catch (error) {
    console.error('Erreur modification centre commercial:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la modification du centre commercial'
    });
  }
};

// @route   GET /api/centre-commercial/stats
// @desc    Obtenir les statistiques du centre commercial (Admin seulement)
// @access  Private (Admin)
exports.obtenirStatistiques = async (req, res) => {
  try {
    const Etage = require('../models/Etage');
    const Espace = require('../models/Espace');
    const Boutique = require('../models/Boutique');
    
    const [
      centreCommercial,
      nombreEtages,
      nombreEspaces,
      espacesDisponibles,
      espacesOccupes,
      nombreBoutiques,
      boutiquesActives
    ] = await Promise.all([
      CentreCommercial.getPrincipal(),
      Etage.countDocuments({ isActive: true }),
      Espace.countDocuments({ isActive: true }),
      Espace.countDocuments({ statut: 'Disponible', isActive: true }),
      Espace.countDocuments({ statut: 'Occupee', isActive: true }),
      Boutique.countDocuments(),
      Boutique.countDocuments({ statutBoutique: 'Actif' })
    ]);
    
    const tauxOccupation = nombreEspaces > 0 ? 
      Math.round((espacesOccupes / nombreEspaces) * 100) : 0;
    
    res.json({
      centreCommercial: centreCommercial?.getInfosDeBase() || null,
      statistiques: {
        nombreEtages,
        nombreEspaces,
        espacesDisponibles,
        espacesOccupes,
        tauxOccupation: `${tauxOccupation}%`,
        nombreBoutiques,
        boutiquesActives,
        boutiquesInactives: nombreBoutiques - boutiquesActives
      }
    });
  } catch (error) {
    console.error('Erreur obtention statistiques:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};