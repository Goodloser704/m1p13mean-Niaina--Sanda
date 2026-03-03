# 🚀 Guide de Refactorisation Mall-App

## 📋 Résumé des Modifications

Cette refactorisation apporte les fonctionnalités manquantes critiques selon les règles de gestion définies dans `note/Regle-de-gestion.txt`.

## 🆕 Nouvelles Entités Ajoutées

### Backend Models

1. **CentreCommercial** (`/backend/models/CentreCommercial.js`)
   - Entité racine du système
   - Informations générales du centre commercial
   - Horaires généraux, contact, réseaux sociaux

2. **PorteFeuille** (`/backend/models/PorteFeuille.js`)
   - Portefeuille virtuel pour chaque utilisateur
   - Gestion de la balance et historique
   - Méthodes de crédit/débit sécurisées

3. **PFTransaction** (`/backend/models/PFTransaction.js`)
   - Transactions entre portefeuilles
   - Types: Achat, Loyer, Commission
   - Système de transaction atomique

4. **DemandeLocation** (`/backend/models/DemandeLocation.js`)
   - Demandes de location d'espaces
   - Workflow d'approbation admin
   - Gestion des contrats

5. **CategorieBoutique** (`/backend/models/CategorieBoutique.js`)
   - Catégories de boutiques gérées par l'admin
   - Icônes et couleurs personnalisables

6. **TypeProduit** (`/backend/models/TypeProduit.js`)
   - Types de produits par boutique
   - Gérés par les commerçants

7. **Produit** (`/backend/models/Produit.js`)
   - Produits avec gestion de stock
   - Temps de préparation
   - Décrémentation automatique du stock

8. **Facture** (`/backend/models/Facture.js`)
   - Factures pour regrouper les achats
   - Génération de numéros uniques
   - Calcul TTC automatique

9. **Achat** (`/backend/models/Achat.js`)
   - Achats avec types "Récupérer" ou "Livrer"
   - Gestion des états et dates
   - Création automatique de transactions

10. **Recepisse** (`/backend/models/Recepisse.js`)
    - Reçus de paiement (loyers, etc.)
    - Signatures numériques
    - Génération PDF

## 🔧 Utilitaires Ajoutés

### Enums (`/backend/utils/enums.js` et `/frontend/src/app/utils/enums.ts`)
- Constantes pour éviter les erreurs de frappe
- Mappings entre anciens et nouveaux formats
- Utilitaires de conversion

### Script d'Initialisation (`/backend/scripts/init-system.js`)
- Création du centre commercial par défaut
- Création de l'admin par défaut
- Création des catégories par défaut
- Création des portefeuilles pour utilisateurs existants

## 🛣️ Nouvelles Routes API

### Portefeuille (`/api/portefeuille`)
```
GET    /me                 - Mon portefeuille
GET    /transactions       - Mes transactions
POST   /recharge          - Recharger le portefeuille
GET    /stats             - Statistiques du portefeuille
GET    /admin/all         - Tous les portefeuilles (Admin)
```

### Demandes de Location (`/api/demandes-location`)
```
POST   /                  - Créer une demande (Commercant)
GET    /me                - Mes demandes (Commercant)
GET    /                  - Toutes les demandes (Admin)
GET    /:id               - Détail d'une demande
PUT    /:id/accepter      - Accepter une demande (Admin)
PUT    /:id/refuser       - Refuser une demande (Admin)
DELETE /:id               - Annuler une demande (Commercant)
```

## 🎨 Nouveaux Composants Frontend

### PortefeuilleComponent
- Affichage de la balance
- Historique des transactions
- Recharge du portefeuille
- Statistiques détaillées

### Services Frontend
- **PortefeuilleService** - Gestion des portefeuilles
- **DemandeLocationService** - Gestion des demandes de location

## 🔄 Modèles Mis à Jour

### User.js
- Ajout des champs selon les règles de gestion
- Support des enums
- Synchronisation des champs (mdp/password, prenoms/prenom)

### Boutique.js
- Ajout des horaires hebdomadaires
- Validation des contraintes logiques
- Méthodes pour fermer/ouvrir la boutique

### Notification.js
- Support des nouveaux types de notifications
- Synchronisation des champs anciens/nouveaux

## 🚀 Installation et Initialisation

### 1. Installer les Dépendances
```bash
cd mall-app/backend
npm install
```

### 2. Initialiser le Système
```bash
# Développement
npm run init-dev

# Production
npm run init-prod
```

### 3. Informations de Connexion Admin
```
Email: admin@mall-app.com
Mot de passe: admin123
```

⚠️ **Important**: Changez le mot de passe admin en production !

## 📊 Fonctionnalités Implémentées

### ✅ Système Financier
- [x] Portefeuilles pour tous les utilisateurs
- [x] Transactions entre portefeuilles
- [x] Historique et statistiques
- [x] Recharge de portefeuille

### ✅ Workflow de Location
- [x] Demandes de location d'espaces
- [x] Approbation/refus par admin
- [x] Gestion des contrats
- [x] Notifications automatiques

### ✅ Gestion des Produits
- [x] Types de produits par boutique
- [x] Produits avec stock
- [x] Temps de préparation
- [x] Décrémentation automatique

### ✅ Système d'Achats
- [x] Achats avec types (Récupérer/Livrer)
- [x] Factures et regroupement
- [x] États des achats
- [x] Transactions automatiques

### ✅ Administration
- [x] Centre commercial configurable
- [x] Catégories de boutiques
- [x] Gestion des utilisateurs
- [x] Statistiques avancées

## 🔄 Prochaines Étapes

### Phase 2 - Composants Frontend ✅ COMPLÉTÉ
1. **Composant DemandeLocation** ✅
   - Interface de création de demandes
   - Liste des demandes par commerçant
   - Interface d'approbation admin

2. **Composant GestionProduits** ✅
   - CRUD des produits
   - Gestion du stock
   - Types de produits

3. **Composant Panier** ✅
   - Panier d'achat (DTO)
   - Validation et création d'achats
   - Choix Récupérer/Livrer

4. **Composant PorteFeuille** ✅
   - Interface complète de gestion du portefeuille
   - Historique des transactions
   - Recharge et statistiques

### Phase 3 - Routes API Manquantes ✅ COMPLÉTÉ
1. **Routes Centre Commercial** ✅
   - `/api/centre-commercial` - Gestion des informations du centre
   - Statistiques et configuration admin

2. **Routes Produits** ✅
   - `/api/produits` - CRUD complet des produits
   - Gestion du stock et recherche

3. **Routes Types de Produits** ✅
   - `/api/types-produit` - Gestion des catégories de produits
   - Par boutique et administration

### Phase 4 - Services Frontend ✅ COMPLÉTÉ
1. **ProduitService** ✅
   - Service complet pour la gestion des produits
   - Recherche, filtrage, gestion du stock
   - Utilitaires de formatage et validation

### Phase 5 - Fonctionnalités Avancées (À FAIRE)
1. **Notifications Temps Réel**
   - WebSocket/Socket.io
   - Notifications push

2. **Génération PDF**
   - Factures PDF
   - Reçus de loyer
   - Contrats de location

3. **Recherche Avancée**
   - Recherche de boutiques
   - Filtres complexes
   - Suggestions

4. **Dashboard Admin Complet**
   - Statistiques détaillées
   - Graphiques de revenus
   - Monitoring des espaces

## 🐛 Résolution de Problèmes

### Erreur de Connexion MongoDB
```bash
# Vérifier la variable d'environnement
echo $MONGODB_URI

# Tester la connexion
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(console.error)"
```

### Erreur d'Initialisation
```bash
# Vérifier les logs
npm run init-dev

# Réinitialiser si nécessaire
# (Attention: supprime les données existantes)
```

### Erreur de Permissions
```bash
# Vérifier les rôles dans la base
# Les enums doivent correspondre exactement
```

## 📚 Documentation Technique

### Architecture des Transactions
```
Acheteur -> [PFTransaction] -> Commerçant
   |                              |
   v                              v
PorteFeuille                 PorteFeuille
(balance -)                  (balance +)
```

### Workflow de Location
```
Commerçant -> DemandeLocation -> Admin
                    |
                    v
            [Acceptée/Refusée]
                    |
                    v
            Espace.statut = "Occupee"
            Boutique.espace = espaceId
```

### Gestion des Stocks
```
Achat créé -> Produit.stock.nombreDispo--
Achat annulé -> Produit.stock.nombreDispo++
```

## 🤝 Contribution

Pour contribuer à ce projet :

1. Suivre les conventions de nommage des enums
2. Utiliser les services existants
3. Respecter l'architecture MVC
4. Ajouter des tests pour les nouvelles fonctionnalités
5. Documenter les nouvelles API

## 📞 Support

En cas de problème :
1. Vérifier les logs du serveur
2. Consulter la documentation des modèles
3. Tester les endpoints avec Postman
4. Vérifier les permissions utilisateur

---

**Refactorisation réalisée selon les spécifications des règles de gestion.**
**Taux de complétion estimé : 85% des fonctionnalités critiques implémentées.**

## 🎯 Résumé des Ajouts de cette Session

### Routes API Complétées
- ✅ `/api/centre-commercial` - Gestion du centre commercial
- ✅ `/api/produits` - CRUD complet des produits avec gestion du stock
- ✅ `/api/types-produit` - Gestion des types de produits par boutique

### Composants Frontend Ajoutés
- ✅ **PortefeuilleComponent** - Interface complète avec HTML manquant
- ✅ **GestionProduitsComponent** - Gestion complète des produits et types
- ✅ **PanierComponent** - Panier d'achat avec validation de commande

### Services Frontend Ajoutés
- ✅ **ProduitService** - Service complet pour produits et types de produits

### Corrections Techniques
- ✅ Correction du modèle Espace.js (référence correcte à Etage._id)
- ✅ Enregistrement des nouvelles routes dans server.js
- ✅ Synchronisation des champs niveau/numero dans Etage.js

### Fonctionnalités Clés Implémentées
- ✅ Gestion complète des produits avec stock et types
- ✅ Panier d'achat avec regroupement par boutique
- ✅ Interface portefeuille avec transactions et recharge
- ✅ Validation des commandes avec vérification du solde
- ✅ Types d'achat (Récupérer/Livrer) avec sélection
- ✅ Gestion des stocks avec alertes et ruptures

Les composants sont prêts pour l'intégration dans l'application Angular et les routes API sont fonctionnelles côté backend.