const CategorieBoutique = require('../models/CategorieBoutique');
const Boutique = require('../models/Boutique');
const { validationResult } = require('express-validator');

/**
 * 📋 Contrôleur Catégorie Boutique
 * Gestion des catégories de boutiques
 */

// @route   GET /api/categories-boutique
// @desc    Obtenir toutes les catégories
// @access  Public
exports.obtenirCategories = async (req, res) => {
  try {
    const { actives } = req.query;
    
    const criteres = {};
    if (actives === 'true') {
      criteres.isActive = true;
    }
    
    const categories = await CategorieBoutique.find(criteres)
      .sort({ nom: 1 });
    
    const count = categories.length;
    
    console.log(`📋 ${count} catégories récupérées`);
    
    res.json({
      categories,
      count
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération catégories:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des catégories'
    });
  }
};

// @route   GET /api/categories-boutique/test
// @desc    Test de la route catégories
// @access  Public
exports.testCategories = async (req, res) => {
  try {
    const stats = {
      message: 'Route catégories boutiques fonctionnelle',
      timestamp: new Date().toISOString(),
      database: {
        connected: require('mongoose').connection.readyState === 1,
        name: require('mongoose').connection.name
      },
      counts: {
        totalCategories: await CategorieBoutique.countDocuments(),
        categoriesActives: await CategorieBoutique.countDocuments({ isActive: true }),
        categoriesInactives: await CategorieBoutique.countDocuments({ isActive: false })
      }
    };
    
    console.log('🧪 Test catégories boutiques:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Erreur test catégories:', error);
    res.status(500).json({
      message: 'Erreur serveur lors du test catégories',
      error: error.message
    });
  }
};

// @route   GET /api/categories-boutique/:id
// @desc    Obtenir une catégorie par ID
// @access  Public
exports.obtenirCategorieParId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const categorie = await CategorieBoutique.findById(id);
    
    if (!categorie) {
      return res.status(404).json({
        message: 'Catégorie non trouvée'
      });
    }
    
    res.json({ categorie });
    
  } catch (error) {
    console.error('❌ Erreur récupération catégorie:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération de la catégorie'
    });
  }
};

// @route   POST /api/categories-boutique
// @desc    Créer une nouvelle catégorie (Admin seulement)
// @access  Private (Admin)
exports.creerCategorie = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const { nom, description, icone, couleur } = req.body;
    
    // Vérifier si la catégorie existe déjà
    const categorieExistante = await CategorieBoutique.findOne({ 
      nom: { $regex: new RegExp(`^${nom}$`, 'i') }
    });
    
    if (categorieExistante) {
      return res.status(400).json({
        message: 'Une catégorie avec ce nom existe déjà'
      });
    }
    
    const categorie = new CategorieBoutique({
      nom,
      description,
      icone,
      couleur,
      isActive: true
    });
    
    await categorie.save();
    
    console.log('➕ Catégorie créée:', categorie.nom);
    
    res.status(201).json({
      message: 'Catégorie créée avec succès',
      categorie
    });
    
  } catch (error) {
    console.error('❌ Erreur création catégorie:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la création de la catégorie'
    });
  }
};

// @route   PUT /api/categories-boutique/:id
// @desc    Mettre à jour une catégorie (Admin seulement)
// @access  Private (Admin)
exports.mettreAJourCategorie = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { nom, description, icone, couleur, isActive } = req.body;
    
    const categorie = await CategorieBoutique.findById(id);
    
    if (!categorie) {
      return res.status(404).json({
        message: 'Catégorie non trouvée'
      });
    }
    
    // Vérifier si le nouveau nom existe déjà (sauf pour cette catégorie)
    if (nom && nom !== categorie.nom) {
      const categorieExistante = await CategorieBoutique.findOne({ 
        nom: { $regex: new RegExp(`^${nom}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (categorieExistante) {
        return res.status(400).json({
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }
    }
    
    // Mettre à jour les champs
    if (nom) categorie.nom = nom;
    if (description !== undefined) categorie.description = description;
    if (icone !== undefined) categorie.icone = icone;
    if (couleur !== undefined) categorie.couleur = couleur;
    if (isActive !== undefined) categorie.isActive = isActive;
    
    await categorie.save();
    
    console.log('✏️ Catégorie mise à jour:', categorie.nom);
    
    res.json({
      message: 'Catégorie mise à jour avec succès',
      categorie
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour catégorie:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la mise à jour de la catégorie'
    });
  }
};

// @route   DELETE /api/categories-boutique/:id
// @desc    Supprimer une catégorie (Admin seulement)
// @access  Private (Admin)
exports.supprimerCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    
    const categorie = await CategorieBoutique.findById(id);
    
    if (!categorie) {
      return res.status(404).json({
        message: 'Catégorie non trouvée'
      });
    }
    
    // Vérifier si des boutiques utilisent cette catégorie
    const boutiquesUtilisant = await Boutique.countDocuments({ categorie: id });
    
    if (boutiquesUtilisant > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer cette catégorie car ${boutiquesUtilisant} boutique(s) l'utilisent encore`
      });
    }
    
    await CategorieBoutique.findByIdAndDelete(id);
    
    console.log('🗑️ Catégorie supprimée:', categorie.nom);
    
    res.json({
      message: 'Catégorie supprimée avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression catégorie:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la suppression de la catégorie'
    });
  }
};

// @route   GET /api/categories-boutique/statistiques
// @desc    Obtenir les statistiques des catégories (Admin seulement)
// @access  Private (Admin)
exports.obtenirStatistiques = async (req, res) => {
  try {
    const totalCategories = await CategorieBoutique.countDocuments();
    const categoriesActives = await CategorieBoutique.countDocuments({ isActive: true });
    
    // Boutiques par catégorie
    const boutiquesParCategorie = await Boutique.aggregate([
      {
        $lookup: {
          from: 'categorieboutiques',
          localField: 'categorie',
          foreignField: '_id',
          as: 'categorieInfo'
        }
      },
      { $unwind: '$categorieInfo' },
      {
        $group: {
          _id: '$categorie',
          nom: { $first: '$categorieInfo.nom' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('📊 Statistiques catégories calculées');
    
    res.json({
      totalCategories,
      categoriesActives,
      boutiquesParCategorie: boutiquesParCategorie.map(item => ({
        categorie: item._id,
        nom: item.nom,
        count: item.count
      }))
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération statistiques catégories:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};

// @route   POST /api/categories-boutique/admin/initialiser
// @desc    Initialiser les catégories par défaut (Admin seulement)
// @access  Private (Admin)
exports.initialiserCategoriesDefaut = async (req, res) => {
  try {
    console.log('🔧 Initialisation des catégories par défaut...');
    
    const categoriesDefaut = [
      { nom: 'Restaurant', description: 'Restaurants et services de restauration', icone: '🍽️', couleur: '#ff6b6b' },
      { nom: 'Vêtements', description: 'Mode et vêtements', icone: '👗', couleur: '#4ecdc4' },
      { nom: 'Électronique', description: 'Appareils électroniques et high-tech', icone: '📱', couleur: '#45b7d1' },
      { nom: 'Beauté', description: 'Cosmétiques et produits de beauté', icone: '💄', couleur: '#f093fb' },
      { nom: 'Sport', description: 'Articles de sport et fitness', icone: '⚽', couleur: '#4dabf7' },
      { nom: 'Librairie', description: 'Livres et papeterie', icone: '📚', couleur: '#69db7c' },
      { nom: 'Bijouterie', description: 'Bijoux et accessoires', icone: '💎', couleur: '#ffd43b' },
      { nom: 'Pharmacie', description: 'Produits pharmaceutiques et santé', icone: '💊', couleur: '#51cf66' }
    ];
    
    const categoriesCreees = [];
    
    for (const categorieData of categoriesDefaut) {
      try {
        // Vérifier si la catégorie existe déjà
        const existante = await CategorieBoutique.findOne({ 
          nom: { $regex: new RegExp(`^${categorieData.nom}$`, 'i') }
        });
        
        if (!existante) {
          const categorie = new CategorieBoutique({
            ...categorieData,
            isActive: true
          });
          
          await categorie.save();
          categoriesCreees.push(categorie);
          console.log('➕ Catégorie par défaut créée:', categorie.nom);
        } else {
          console.log('⚠️ Catégorie déjà existante:', categorieData.nom);
        }
      } catch (catError) {
        console.error(`❌ Erreur création catégorie ${categorieData.nom}:`, catError.message);
      }
    }
    
    console.log(`✅ Initialisation terminée: ${categoriesCreees.length} catégories créées`);
    
    res.json({
      message: `${categoriesCreees.length} catégories par défaut créées`,
      categories: categoriesCreees,
      total: categoriesDefaut.length,
      created: categoriesCreees.length
    });
    
  } catch (error) {
    console.error('❌ Erreur initialisation catégories:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de l\'initialisation des catégories',
      error: error.message
    });
  }
};