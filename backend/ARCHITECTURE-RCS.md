# 🏗️ Architecture Route-Controller-Service (RCS)

## 📋 **Vue d'Ensemble**

Cette architecture sépare clairement les responsabilités en 3 couches :

```
📱 Client Request
    ↓
🛣️  Route (Routage)
    ↓
🎮 Controller (Gestion HTTP)
    ↓
⚙️  Service (Logique Métier)
    ↓
🗄️  Model (Base de Données)
```

## 🎯 **Responsabilités par Couche**

### **🛣️ Routes (`/routes`)**
- **Rôle :** Définir les endpoints et middlewares
- **Contient :**
  - Définition des routes (`router.get`, `router.post`)
  - Middlewares de validation (`express-validator`)
  - Middlewares d'authentification (`auth`, `adminAuth`)
  - Appel des méthodes du contrôleur

**Exemple :**
```javascript
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], authController.register);
```

### **🎮 Controllers (`/controllers`)**
- **Rôle :** Gérer les requêtes HTTP et réponses
- **Contient :**
  - Validation des données (`validationResult`)
  - Gestion des erreurs HTTP (400, 401, 403, 500)
  - Logs des requêtes
  - Appel des services métier
  - Formatage des réponses JSON

**Exemple :**
```javascript
async register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const result = await authService.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
```

### **⚙️ Services (`/services`)**
- **Rôle :** Logique métier pure
- **Contient :**
  - Algorithmes et traitements complexes
  - Interactions avec la base de données
  - Validation métier
  - Calculs et transformations
  - Gestion des erreurs métier

**Exemple :**
```javascript
async createUser(userData) {
  const emailExists = await this.checkEmailExists(userData.email);
  if (emailExists) {
    throw new Error('Cet email est déjà utilisé');
  }
  
  const user = new User(userData);
  await user.save();
  
  return {
    token: this.generateToken(user._id),
    user: this.formatUserResponse(user)
  };
}
```

## 📁 **Structure des Dossiers**

```
backend/
├── routes/
│   ├── auth.js          # 🛣️ Routes d'authentification
│   ├── products.js      # 🛣️ Routes des produits
│   └── orders.js        # 🛣️ Routes des commandes
├── controllers/
│   ├── authController.js    # 🎮 Contrôleur auth
│   ├── productController.js # 🎮 Contrôleur produits
│   └── orderController.js   # 🎮 Contrôleur commandes
├── services/
│   ├── authService.js       # ⚙️ Service auth
│   ├── productService.js    # ⚙️ Service produits
│   └── orderService.js      # ⚙️ Service commandes
├── models/
│   ├── User.js          # 🗄️ Modèle utilisateur
│   ├── Product.js       # 🗄️ Modèle produit
│   └── Order.js         # 🗄️ Modèle commande
└── middleware/
    ├── auth.js          # 🔐 Middleware d'authentification
    └── validation.js    # ✅ Middleware de validation
```

## 🔄 **Flux de Données**

### **Exemple : Création d'un Produit**

1. **Route** (`/routes/products.js`)
   ```javascript
   router.post('/', [validation], productController.createProduct);
   ```

2. **Controller** (`/controllers/productController.js`)
   ```javascript
   async createProduct(req, res) {
     // Validation HTTP
     // Vérification permissions
     const product = await productService.createProduct(req.body, req.user._id);
     res.status(201).json(product);
   }
   ```

3. **Service** (`/services/productService.js`)
   ```javascript
   async createProduct(productData, boutiqueId) {
     // Logique métier
     // Validation business
     const product = new Product({ ...productData, boutique: boutiqueId });
     await product.save();
     return product;
   }
   ```

## ✅ **Avantages de cette Architecture**

### **🧹 Code Plus Propre**
- Séparation claire des responsabilités
- Fonctions plus petites et focalisées
- Réutilisabilité du code

### **🧪 Tests Plus Faciles**
- Services testables indépendamment
- Mocking plus simple
- Tests unitaires ciblés

### **👥 Collaboration Améliorée**
- Chaque développeur peut travailler sur une couche
- Moins de conflits Git
- Code plus lisible

### **🔧 Maintenance Simplifiée**
- Bugs plus faciles à localiser
- Modifications isolées
- Évolution plus sûre

## 📝 **Conventions de Nommage**

### **Fichiers :**
- Routes : `nomModule.js` (ex: `auth.js`)
- Controllers : `nomModuleController.js` (ex: `authController.js`)
- Services : `nomModuleService.js` (ex: `authService.js`)

### **Méthodes :**
- **CRUD Standard :**
  - `getAll` / `getAllProducts`
  - `getById` / `getProductById`
  - `create` / `createProduct`
  - `update` / `updateProduct`
  - `delete` / `deleteProduct`

- **Métier Spécifique :**
  - `search` / `searchProducts`
  - `authenticate` / `authenticateUser`
  - `validate` / `validateOrder`

## 🚀 **Migration du Code Existant**

### **Étapes :**
1. ✅ Créer les services avec la logique métier
2. ✅ Créer les contrôleurs avec gestion HTTP
3. ✅ Simplifier les routes (juste routage)
4. ✅ Tester chaque couche
5. ✅ Supprimer l'ancien code

### **Checklist par Module :**
- [ ] Service créé avec toutes les méthodes métier
- [ ] Controller créé avec gestion des requêtes
- [ ] Routes simplifiées (juste appels controller)
- [ ] Tests unitaires ajoutés
- [ ] Documentation mise à jour

## 💡 **Bonnes Pratiques**

### **Services :**
- Une classe par service avec méthodes statiques ou instance unique
- Gestion des erreurs avec `throw new Error()`
- Pas de gestion HTTP (req, res)
- Focus sur la logique métier pure

### **Controllers :**
- Validation des données d'entrée
- Gestion des codes de statut HTTP appropriés
- Logs détaillés pour le debugging
- Formatage des réponses JSON

### **Routes :**
- Middlewares de validation en amont
- Appels directs aux méthodes du controller
- Documentation des endpoints
- Gestion des permissions par middleware

Cette architecture rendra votre code beaucoup plus maintenable et facilitera la collaboration ! 🎉