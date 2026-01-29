const Product = require('../models/Product');

/**
 * 🛍️ Service des Produits
 * Contient toute la logique métier pour les produits
 */
class ProductService {

  /**
   * 📋 Obtenir tous les produits avec pagination
   */
  async getAllProducts(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    // Construire les critères de recherche
    const searchCriteria = {};
    
    if (filters.category) {
      searchCriteria.category = filters.category;
    }
    
    if (filters.minPrice || filters.maxPrice) {
      searchCriteria.price = {};
      if (filters.minPrice) searchCriteria.price.$gte = filters.minPrice;
      if (filters.maxPrice) searchCriteria.price.$lte = filters.maxPrice;
    }
    
    if (filters.search) {
      searchCriteria.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const products = await Product.find(searchCriteria)
      .populate('boutique', 'nom email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(searchCriteria);

    return {
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    };
  }

  /**
   * 🔍 Rechercher des produits
   */
  async searchProducts(query, filters = {}) {
    const searchCriteria = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // Ajouter les filtres
    if (filters.category) {
      searchCriteria.category = filters.category;
    }
    
    if (filters.boutiqueId) {
      searchCriteria.boutique = filters.boutiqueId;
    }

    return await Product.find(searchCriteria)
      .populate('boutique', 'nom email')
      .sort({ createdAt: -1 });
  }

  /**
   * ➕ Créer un nouveau produit
   */
  async createProduct(productData, boutiqueId) {
    const product = new Product({
      ...productData,
      boutique: boutiqueId
    });

    await product.save();
    await product.populate('boutique', 'nom email');
    
    return product;
  }

  /**
   * 📝 Mettre à jour un produit
   */
  async updateProduct(productId, updateData, boutiqueId) {
    const product = await Product.findOne({ 
      _id: productId, 
      boutique: boutiqueId 
    });

    if (!product) {
      throw new Error('Produit non trouvé ou accès refusé');
    }

    Object.assign(product, updateData);
    await product.save();
    await product.populate('boutique', 'nom email');
    
    return product;
  }

  /**
   * 🗑️ Supprimer un produit
   */
  async deleteProduct(productId, boutiqueId) {
    const product = await Product.findOneAndDelete({ 
      _id: productId, 
      boutique: boutiqueId 
    });

    if (!product) {
      throw new Error('Produit non trouvé ou accès refusé');
    }

    return product;
  }
}

module.exports = new ProductService();