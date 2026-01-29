const { validationResult } = require('express-validator');
const productService = require('../services/productService');

/**
 * 🛍️ Contrôleur des Produits
 * Gère les requêtes HTTP et appelle les services appropriés
 */
class ProductController {

  /**
   * 📋 Obtenir tous les produits
   */
  async getAllProducts(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🛍️ [${timestamp}] Demande liste produits`);
    
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const filters = {
        category: req.query.category,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        search: req.query.search
      };

      const result = await productService.getAllProducts(page, limit, filters);
      
      console.log(`✅ ${result.products.length} produits trouvés`);
      
      res.json(result);

    } catch (error) {
      console.error(`❌ Erreur récupération produits:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🔍 Rechercher des produits
   */
  async searchProducts(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] Recherche produits`);
    console.log(`   🔍 Query: ${req.query.q}`);
    
    try {
      const { q: query } = req.query;
      
      if (!query || query.length < 2) {
        return res.status(400).json({ 
          message: 'La recherche doit contenir au moins 2 caractères' 
        });
      }

      const filters = {
        category: req.query.category,
        boutiqueId: req.query.boutique
      };

      const products = await productService.searchProducts(query, filters);
      
      console.log(`✅ ${products.length} produits trouvés`);
      
      res.json({
        products,
        count: products.length
      });

    } catch (error) {
      console.error(`❌ Erreur recherche produits:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * ➕ Créer un nouveau produit
   */
  async createProduct(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`➕ [${timestamp}] Création produit`);
    console.log(`   🏪 Boutique: ${req.user._id}`);
    console.log(`   📦 Produit: ${req.body.name}`);
    
    try {
      // Validation des données
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(`❌ Validation échouée:`, errors.array());
        return res.status(400).json({ 
          message: 'Données invalides',
          errors: errors.array() 
        });
      }

      // Vérifier les permissions
      if (req.user.role !== 'boutique') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const product = await productService.createProduct(req.body, req.user._id);
      
      console.log(`✅ Produit créé: ${product._id}`);
      
      res.status(201).json({
        message: 'Produit créé avec succès',
        product
      });

    } catch (error) {
      console.error(`❌ Erreur création produit:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 📝 Mettre à jour un produit
   */
  async updateProduct(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📝 [${timestamp}] Mise à jour produit`);
    console.log(`   🏪 Boutique: ${req.user._id}`);
    console.log(`   📦 Produit: ${req.params.productId}`);
    
    try {
      // Validation des données
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(`❌ Validation échouée:`, errors.array());
        return res.status(400).json({ 
          message: 'Données invalides',
          errors: errors.array() 
        });
      }

      // Vérifier les permissions
      if (req.user.role !== 'boutique') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { productId } = req.params;
      const product = await productService.updateProduct(productId, req.body, req.user._id);
      
      console.log(`✅ Produit mis à jour: ${productId}`);
      
      res.json({
        message: 'Produit mis à jour avec succès',
        product
      });

    } catch (error) {
      console.error(`❌ Erreur mise à jour produit:`, error.message);
      
      if (error.message === 'Produit non trouvé ou accès refusé') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🗑️ Supprimer un produit
   */
  async deleteProduct(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🗑️ [${timestamp}] Suppression produit`);
    console.log(`   🏪 Boutique: ${req.user._id}`);
    console.log(`   📦 Produit: ${req.params.productId}`);
    
    try {
      // Vérifier les permissions
      if (req.user.role !== 'boutique') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { productId } = req.params;
      await productService.deleteProduct(productId, req.user._id);
      
      console.log(`✅ Produit supprimé: ${productId}`);
      
      res.json({
        message: 'Produit supprimé avec succès'
      });

    } catch (error) {
      console.error(`❌ Erreur suppression produit:`, error.message);
      
      if (error.message === 'Produit non trouvé ou accès refusé') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new ProductController();