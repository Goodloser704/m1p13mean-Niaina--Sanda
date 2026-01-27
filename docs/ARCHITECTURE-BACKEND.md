# 🏗️ Architecture Backend - Guide d'Explication

## 📋 Vue d'Ensemble

Salut ! Je vais t'expliquer comment j'ai structuré le backend de notre application mall. J'ai utilisé Express.js avec une architecture MVC (Model-View-Controller) adaptée pour créer une API REST.

```
Structure que j'ai créée :
├── server.js           # Point d'entrée principal
├── models/            # Schémas MongoDB (Mongoose)
├── routes/            # Endpoints API
├── middleware/        # Fonctions intermédiaires
└── scripts/           # Utilitaires (init-db, etc.)
```

## 🚀 1. SERVEUR PRINCIPAL (server.js)

### Comment j'ai organisé le serveur
Regarde, j'ai structuré le serveur principal comme ça :

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. MIDDLEWARE GLOBAL
app.use(cors());                    // J'autorise les requêtes cross-origin
app.use(express.json());            // Je parse le JSON des requêtes
app.use(express.urlencoded({ extended: true })); // Je parse les formulaires

// 2. ROUTES API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
// ... autres routes

// 3. CONNEXION BASE DE DONNÉES
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// 4. DÉMARRAGE SERVEUR
app.listen(PORT, () => console.log(`🚀 Serveur sur port ${PORT}`));
```

### Voici comment j'ai organisé l'ordre d'exécution
1. **Chargement des modules** (express, mongoose, etc.)
2. **Configuration middleware** (cors, json parser)
3. **Enregistrement des routes** (/api/auth, /api/products, etc.)
4. **Connexion MongoDB**
5. **Démarrage du serveur** (écoute sur le port)

## 🗃️ 2. MODÈLES (Models)

### Ce que j'ai fait avec les modèles
Un modèle, c'est comme un plan qui définit **comment nos données sont structurées** dans MongoDB. J'utilise Mongoose pour ça.

### Exemple concret : User.js
Laisse-moi te montrer comment j'ai créé le modèle User :

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. DÉFINITION DU SCHÉMA
const userSchema = new mongoose.Schema({
  email: {
    type: String,        // Type de donnée
    required: true,      // Obligatoire
    unique: true,        // Unique dans la collection
    lowercase: true      // Je convertis en minuscules
  },
  password: {
    type: String,
    required: true,
    minlength: 6         // Validation : minimum 6 caractères
  },
  role: {
    type: String,
    enum: ['admin', 'boutique', 'client'], // Valeurs que j'autorise
    required: true
  }
});

// 2. MIDDLEWARE PRE-SAVE (avant sauvegarde)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); // Je hash le mot de passe
  next();
});

// 3. MÉTHODES PERSONNALISÉES
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 4. EXPORT DU MODÈLE
module.exports = mongoose.model('User', userSchema);
```

### Ce que j'ai mis dans mes modèles
- **Validation** : Vérification automatique des données
- **Middleware** : Actions avant/après sauvegarde
- **Méthodes** : Fonctions personnalisées sur les documents
- **Relations** : Liens entre collections (populate)

## 🛡️ 3. MIDDLEWARE

### Comment j'explique les middlewares
Un middleware, c'est une fonction qui s'exécute **entre la requête et la réponse**. Imagine ça comme des filtres que chaque requête doit traverser.

### Exemple concret : auth.js
Voici comment j'ai créé le middleware d'authentification :

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// MIDDLEWARE D'AUTHENTIFICATION
const auth = async (req, res, next) => {
  try {
    // 1. Je récupère le token depuis l'en-tête
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    // 2. Je vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Je récupère l'utilisateur depuis la DB
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    // 4. J'ajoute l'utilisateur à la requête
    req.user = user;
    next(); // Je passe au middleware suivant
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// MIDDLEWARE D'AUTORISATION
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  };
};
```

### Les types de middleware que j'utilise
1. **Global** : S'applique à toutes les routes (cors, json parser)
2. **Spécifique** : S'applique à certaines routes (auth, authorize)
3. **Erreur** : Gère les erreurs (error handler)

## 🛣️ 4. ROUTES

### Comment j'ai organisé mes routes
Une route définit **comment notre application répond** aux requêtes des clients. C'est là que la magie opère !

### La structure que j'utilise pour mes routes
```javascript
router.METHOD('/path', [middleware], handler);
```

### Exemple concret : route de connexion
Laisse-moi te montrer comment j'ai créé la route de connexion :

```javascript
const express = require('express');
const router = express.Router();

// @route   POST /api/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post('/login', [
  // MIDDLEWARE DE VALIDATION
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    // 1. VALIDATION DES DONNÉES
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 2. VÉRIFICATION UTILISATEUR
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // 3. VÉRIFICATION MOT DE PASSE
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // 4. GÉNÉRATION TOKEN
    const token = generateToken(user._id);

    // 5. RÉPONSE
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
```

### Les méthodes HTTP que j'utilise
- **GET** : Récupérer des données
- **POST** : Créer des données
- **PUT** : Mettre à jour des données
- **DELETE** : Supprimer des données

## 🔄 5. FLUX DE DONNÉES

### Exemple : Comment fonctionne la connexion utilisateur
```
1. Client → POST /api/auth/login { email, password }
2. Ma route auth.js → Validation des données
3. Ma route → Recherche User dans MongoDB
4. User.comparePassword() → Vérification mot de passe
5. Ma route → Génération JWT token
6. Ma route → Réponse { token, user }
7. Client ← Réception des données
```

### Exemple : Comment fonctionne la création de produit
```
1. Client → POST /api/products + Authorization header
2. Mon middleware auth → Vérification token
3. Mon middleware authorize → Vérification rôle 'boutique'
4. Ma route products → Validation boutique
5. Ma route → Création Product dans MongoDB
6. Ma route → Réponse { product }
7. Client ← Confirmation création
```

## 🔐 6. SÉCURITÉ

### Comment j'ai sécurisé l'authentification JWT
```javascript
// Génération token
const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

// Vérification token
const decoded = jwt.verify(token, JWT_SECRET);
```

### Comment je protège les mots de passe
```javascript
// Avant sauvegarde
this.password = await bcrypt.hash(this.password, 12);

// Vérification
const isMatch = await bcrypt.compare(candidatePassword, this.password);
```

### Comment je valide les données
```javascript
// Express-validator
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 6 })
```

## 📊 7. BASE DE DONNÉES

### Les collections que j'ai créées
- **users** : Utilisateurs (admin, boutique, client)
- **boutiques** : Informations boutiques
- **products** : Catalogue produits
- **orders** : Commandes

### Comment j'ai fait les relations
```javascript
// Dans Product.js
boutique: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Boutique',  // Référence vers collection Boutique
  required: true
}

// Utilisation avec populate
const product = await Product.findById(id).populate('boutique', 'nom logo');
```

## 🚀 8. COMMENT TU PEUX MODIFIER

### Pour ajouter une nouvelle route
1. Crée le fichier route : `routes/tonnouveau.js`
2. Définis les endpoints
3. Enregistre dans `server.js` : `app.use('/api/tonnouveau', require('./routes/tonnouveau'))`

### Pour ajouter un nouveau modèle
1. Crée `models/TonModele.js`
2. Définis le schéma Mongoose
3. Exporte le modèle
4. Utilise dans les routes

### Pour ajouter un middleware
1. Crée `middleware/tonmiddleware.js`
2. Exporte la fonction
3. Utilise dans les routes : `router.get('/path', tonmiddleware, handler)`

## 🔧 9. DEBUGGING

### Logs utiles que j'utilise
```javascript
console.log('Requête reçue:', req.method, req.path);
console.log('Données:', req.body);
console.log('Utilisateur:', req.user);
console.log('Erreur:', error.message);
```

### Outils que je recommande
- **Postman** : Tester les API
- **MongoDB Compass** : Visualiser la base de données
- **Logs serveur** : Suivre les requêtes

Voilà comment j'ai construit notre API REST robuste et sécurisée ! Si tu as des questions, n'hésite pas ! 🎉