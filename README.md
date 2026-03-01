# 🏬 Application Centre Commercial - MEAN Stack

> Projet M1 - Développement d'une application web complète pour la gestion d'un centre commercial

## 🎯 Vue d'ensemble

Application web moderne développée avec la stack MEAN permettant la gestion complète d'un centre commercial avec **3 profils utilisateurs distincts** :

- 👨‍💼 **Admin Centre Commercial** : Gestion globale et supervision
- 🏪 **Boutique** : Gestion de magasin et catalogue produits  
- 🛍️ **Acheteurs/Clients** : Navigation, recherche et achats

## 🛠️ Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Base de données** | MongoDB Atlas | Cloud |
| **Backend** | Express.js + JavaScript | 4.18.2 |
| **Frontend** | Angular + TypeScript | 17.0.0 |
| **UI Framework** | Angular Material | 17.0.0 |
| **Authentification** | JWT + bcryptjs | - |

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Git

### Installation
```bash
# Cloner le repository
git clone https://github.com/Goodloser704/m1p13mean-Niaina--.git
cd m1p13mean-Niaina--

# Installer toutes les dépendances
npm run install-all

# Configurer l'environnement backend
cd backend
cp .env.example .env
# Modifier .env avec vos paramètres

# Initialiser la base de données avec données de test
npm run init-db

# Retourner à la racine et démarrer l'application
cd ..
npm run dev
```

### Accès à l'application
- **Frontend** : http://localhost:4200
- **API Backend** : http://localhost:3000

## 🔑 Comptes de Test

| Rôle | Email | Mot de passe | Fonctionnalités |
|------|-------|--------------|-----------------|
| **Admin** | admin@mall.com | admin123 | Dashboard global, gestion boutiques |
| **Boutique** | fashion@mall.com | boutique123 | Gestion produits, commandes |
| **Client** | client1@test.com | client123 | Navigation, achats |

## 📋 Fonctionnalités Principales

### 👨‍💼 Interface Admin
- ✅ Dashboard avec statistiques globales
- ✅ Validation/suspension des boutiques
- ✅ Gestion des utilisateurs
- ✅ Rapports et analytics

### 🏪 Interface Boutique  
- ✅ Création et gestion de boutique
- ✅ CRUD complet des produits
- ✅ Suivi des commandes
- ✅ Dashboard avec statistiques de vente

### 🛍️ Interface Client
- ✅ Catalogue des boutiques et produits
- ✅ Recherche avancée avec filtres
- ✅ Système de panier et commandes
- ✅ Profil utilisateur

## 🏗️ Architecture

```
m1p13mean-Niaina--/
├── backend/              # API Express.js + JavaScript
│   ├── models/          # Modèles MongoDB (User, Boutique, Product, Order)
│   ├── routes/          # Routes API (auth, admin, boutique, client)
│   ├── middleware/      # Middlewares (auth, validation)
│   ├── scripts/         # Scripts utilitaires (init-db)
│   └── server.js        # Point d'entrée serveur
├── frontend/            # Application Angular
│   ├── src/app/         # Composants, services, models
│   ├── src/assets/      # Assets statiques
│   └── angular.json     # Configuration Angular
├── docs/               # Documentation
└── README.md          # Ce fichier
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Admin
- `GET /api/admin/dashboard` - Statistiques globales
- `GET /api/admin/boutiques` - Gestion boutiques
- `PUT /api/admin/boutiques/:id/statut` - Valider/suspendre

### Boutiques
- `POST /api/boutique/create` - Créer boutique
- `GET /api/boutique/dashboard` - Dashboard boutique
- `GET /api/boutique/products` - Mes produits

### Produits & Commandes
- `GET /api/products` - Catalogue public
- `POST /api/products` - Créer produit (boutique)
- `POST /api/orders` - Passer commande (client)

## 📊 Base de Données

### Collections MongoDB
- **users** : Utilisateurs (admin, boutique, client)
- **boutiques** : Informations des boutiques
- **products** : Catalogue des produits
- **orders** : Commandes et transactions

### Données de Test Incluses
- 3 boutiques approuvées (Mode, Électronique, Alimentation)
- 6 produits répartis dans les boutiques
- Utilisateurs de tous les rôles
- Données réalistes pour les tests

## 🛡️ Sécurité

- ✅ Authentification JWT
- ✅ Hashage des mots de passe (bcryptjs)
- ✅ Validation des données d'entrée
- ✅ Contrôle d'accès par rôles
- ✅ Protection CORS

## 📱 Interface Utilisateur

- ✅ Design responsive (mobile/desktop)
- ✅ Angular Material Design
- ✅ Navigation intuitive
- ✅ Formulaires réactifs
- ✅ Feedback utilisateur temps réel

## 🚀 Scripts Disponibles

```bash
# Installation
npm run install-all      # Installer toutes les dépendances

# Développement  
npm run dev              # Démarrer backend + frontend
npm run dev:backend      # Backend seulement
npm run dev:frontend     # Frontend seulement

# Base de données
cd backend && npm run init-db  # Initialiser avec données de test

# Production
npm run build            # Build pour production
npm start               # Démarrer en production
```

## 📚 Documentation

- [Guide d'installation détaillé](docs/INSTALLATION.md)
- [Fonctionnalités complètes](docs/FONCTIONNALITES.md)

## 👨‍💻 Développement

### Structure des Commits
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, style
- `refactor:` Refactoring
- `test:` Tests

### Contribution
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence ISC.

---

**Développé avec ❤️ pour le M1 - Stack MEAN**