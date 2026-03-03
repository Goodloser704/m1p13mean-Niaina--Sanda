const TestItem = require('../models/TestItem');

/**
 * 🧪 Contrôleur TestItem
 * Contrôleur simple pour tester le workflow
 */
class TestItemController {

  /**
   * @route   GET /api/test-items
   * @desc    Obtenir tous les items de test de l'utilisateur
   * @access  Private
   */
  async getAll(req, res) {
    console.log(`📋 Récupération items pour user: ${req.user._id}`);
    
    try {
      const { statut, limit = 20, minValeur, maxValeur, tags, search } = req.query;
      
      const query = { createur: req.user._id };
      
      // Filtre par statut
      if (statut) query.statut = statut;
      
      // Filtre par valeur min/max
      if (minValeur || maxValeur) {
        query.valeur = {};
        if (minValeur) query.valeur.$gte = parseInt(minValeur);
        if (maxValeur) query.valeur.$lte = parseInt(maxValeur);
      }
      
      // Filtre par tags
      if (tags) {
        const tagArray = tags.split(',').map(t => t.trim());
        query.tags = { $in: tagArray };
      }
      
      // Recherche textuelle (titre ou description)
      if (search) {
        query.$or = [
          { titre: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      const items = await TestItem.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
      
      const total = await TestItem.countDocuments(query);
      
      console.log(`✅ ${items.length} items récupérés sur ${total}`);
      
      res.json({
        items,
        total,
        count: items.length
      });
    } catch (error) {
      console.error(`❌ Erreur récupération items:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/test-items/:id
   * @desc    Obtenir un item par ID
   * @access  Private
   */
  async getById(req, res) {
    console.log(`🔍 Récupération item: ${req.params.id}`);
    
    try {
      const item = await TestItem.findOne({
        _id: req.params.id,
        createur: req.user._id
      });
      
      if (!item) {
        return res.status(404).json({ message: 'Item non trouvé' });
      }
      
      console.log(`✅ Item trouvé: ${item.titre}`);
      res.json(item);
    } catch (error) {
      console.error(`❌ Erreur récupération item:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   POST /api/test-items
   * @desc    Créer un nouvel item
   * @access  Private
   */
  async create(req, res) {
    console.log(`➕ Création item pour user: ${req.user._id}`);
    
    try {
      const { titre, description, valeur,priorité, tags } = req.body;
      
      if (!titre) {
        return res.status(400).json({ message: 'Le titre est requis' });
      }
      
      const item = new TestItem({
        titre,
        description,
        valeur: valeur || 0,
        tags: tags || [],
        priorité : priorité,
        createur: req.user._id
      });
      item.titre = item.titre.toUpperCase();
      if(item.valeur<0){item.valeur=0};
      await item.save();
      
      console.log(`✅ Item créé: ${item._id}`);
      
      res.status(201).json({
        message: 'Item créé avec succès',
        item
      });
    } catch (error) {
      console.error(`❌ Erreur création item:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   PUT /api/test-items/:id
   * @desc    Mettre à jour un item
   * @access  Private
   */
  async update(req, res) {
    console.log(`✏️ Mise à jour item: ${req.params.id}`);
    
    try {
      const { titre, description, statut, valeur,priorité, tags } = req.body;
      
      const item = await TestItem.findOne({
        _id: req.params.id,
        createur: req.user._id
      });
      
      if (!item) {
        return res.status(404).json({ message: 'Item non trouvé' });
      }
      
      if (titre) item.titre = titre;
      if (description !== undefined) item.description = description;
      if (statut) item.statut = statut;
      if (valeur !== undefined) item.valeur = valeur;
      if (priorité) item.priorité =priorité
      if (tags) item.tags = tags;
      
      await item.save();
      
      console.log(`✅ Item mis à jour: ${item.titre}`);
      
      res.json({
        message: 'Item mis à jour',
        item
      });
    } catch (error) {
      console.error(`❌ Erreur mise à jour item:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   DELETE /api/test-items/:id
   * @desc    Supprimer un item
   * @access  Private
   */
  async delete(req, res) {
    console.log(`🗑️ Suppression item: ${req.params.id}`);
    
    try {
      const item = await TestItem.findOneAndDelete({
        _id: req.params.id,
        createur: req.user._id
      });
      
      if (!item) {
        return res.status(404).json({ message: 'Item non trouvé' });
      }
      
      console.log(`✅ Item supprimé: ${item.titre}`);
      
      res.json({
        message: 'Item supprimé',
        item
      });
    } catch (error) {
      console.error(`❌ Erreur suppression item:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   PUT /api/test-items/:id/toggle
   * @desc    Activer/désactiver un item
   * @access  Private
   */
  async toggle(req, res) {
    console.log(`🔄 Toggle statut item: ${req.params.id}`);
    
    try {
      const item = await TestItem.findOne({
        _id: req.params.id,
        createur: req.user._id
      });
      
      if (!item) {
        return res.status(404).json({ message: 'Item non trouvé' });
      }
      
      await item.toggleStatut();
      
      console.log(`✅ Statut changé: ${item.statut}`);
      
      res.json({
        message: `Item ${item.statut}`,
        item
      });
    } catch (error) {
      console.error(`❌ Erreur toggle item:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/test-items/stats/me
   * @desc    Obtenir les statistiques de l'utilisateur
   * @access  Private
   */
  async getStats(req, res) {
    console.log(`📊 Statistiques pour user: ${req.user._id}`);
    
    try {
      const total = await TestItem.countDocuments({ createur: req.user._id });
      const actifs = await TestItem.countDocuments({ createur: req.user._id, statut: 'actif' });
      const inactifs = await TestItem.countDocuments({ createur: req.user._id, statut: 'inactif' });
      const archives = await TestItem.countDocuments({ createur: req.user._id, statut: 'archive' });
      
      console.log(`✅ Stats récupérées: ${total} items total`);
      
      res.json({
        total,
        byStatus: [
          { _id: 'actif', count: actifs },
          { _id: 'inactif', count: inactifs },
          { _id: 'archive', count: archives }
        ]
      });
    } catch (error) {
      console.error(`❌ Erreur stats:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
  /**
   * @route   POST /api/test-items/:id/rate
   * @desc    Noter un item (1-5 étoiles)
   * @access  Private
   */
  async rateItem(req, res) {
    console.log(`⭐ Notation item: ${req.params.id}`);
    
    try {
      const { note } = req.body;
      
      // Validation
      if (!note || note < 1 || note > 5) {
        return res.status(400).json({ 
          message: 'La note doit être entre 1 et 5' 
        });
      }
      
      // Trouver l'item
      const item = await TestItem.findOne({
        _id: req.params.id,
        createur: req.user._id
      });
      
      if (!item) {
        return res.status(404).json({ message: 'Item non trouvé' });
      }
      
      // Ajouter la note
      item.notes.push(note);
      
      // Calculer la moyenne
      const somme = item.notes.reduce((acc, n) => acc + n, 0);
      item.noteMoyenne = Math.round((somme / item.notes.length) * 100) / 100;
      
      await item.save();
      
      console.log(`✅ Note ajoutée: ${note}/5 (moyenne: ${item.noteMoyenne})`);
      
      res.json({
        message: 'Note ajoutée avec succès',
        item,
        noteMoyenne: item.noteMoyenne,
        totalNotes: item.notes.length
      });
    } catch (error) {
      console.error(`❌ Erreur notation:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
  
  /**
   * @route   POST /api/test-items/:id/duplicate
   * @desc    Dupliquer un item
   * @access  Private
   */
  async duplicate(req, res) {
    console.log(`📋 Duplication item: ${req.params.id}`);
    
    try {
      // 1. Trouver l'item original
      const itemOriginal = await TestItem.findOne({
        _id: req.params.id,
        createur: req.user._id
      });
      
      if (!itemOriginal) {
        return res.status(404).json({ message: 'Item non trouvé' });
      }
      
      // 2. Créer une copie
      const itemCopie = new TestItem({
        titre: `${itemOriginal.titre} (Copie)`,
        description: itemOriginal.description,
        valeur: itemOriginal.valeur,
        statut: itemOriginal.statut,
        tags: itemOriginal.tags,
        priorité: itemOriginal.priorité,
        createur: req.user._id
      });
      
      // 3. Sauvegarder la copie
      await itemCopie.save();
      
      console.log(`✅ Item dupliqué: ${itemCopie._id}`);
      
      res.status(201).json({
        message: 'Item dupliqué avec succès',
        item: itemCopie,
        original: itemOriginal._id
      });
      
    } catch (error) {
      console.error(`❌ Erreur duplication:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new TestItemController();
