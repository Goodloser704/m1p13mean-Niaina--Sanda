# 📋 Liste des Fonctionnalités Testables depuis le Frontend

**URL Frontend:** https://m1p13mean-niaina-sanda.vercel.app (à vérifier)  
**URL Backend:** https://m1p13mean-niaina-1.onrender.com/api

---

## 🔐 AUTHENTIFICATION

### Connexion
- ✅ Se connecter avec email/mot de passe
- ✅ Affichage des erreurs de connexion
- ✅ Redirection après connexion selon le rôle

### Comptes de test disponibles
```
Admin:
  Email: admin@mallapp.com
  Mot de passe: admin123

Commerçant:
  Email: commercant@test.com
  Mot de passe: Commercant123456!

Acheteur:
  Email: client@test.com
  Mot de passe: Client123456!
```

### Déconnexion
- ✅ Se déconnecter
- ✅ Suppression du token et des données utilisateur

---

## 👨‍💼 FONCTIONNALITÉS ADMIN

### 🏢 Gestion Centre Commercial
**Route:** `/admin-centre-commercial`

- ✅ Voir les informations du centre commercial
- ✅ Modifier les informations (nom, adresse, email, téléphone)
- ✅ Gérer les horaires d'ouverture par jour
- ✅ Gérer les réseaux sociaux
- ✅ Voir les statistiques du centre

### 🏢 Gestion Étages
**Route:** `/admin-etages`

**Fonctionnalités testées:**
- ✅ Lister tous les étages
- ✅ Créer un nouvel étage
- ✅ Modifier un étage existant
- ✅ Supprimer un étage (si pas d'espaces)
- ✅ Voir les statistiques des étages
- ✅ Pagination des résultats

**Règles métier:**
- ❌ Impossible de créer un étage avec un numéro déjà existant
- ❌ Impossible de supprimer un étage qui contient des espaces
- ✅ Numéro d'étage entre -10 et 50

**Messages d'erreur attendus:**
- "Un étage avec ce numéro existe déjà"
- "Impossible de supprimer un étage qui contient des espaces"
- "Le numéro d'étage doit être entre -10 et 50"

### 📍 Gestion Espaces
**Route:** `/admin-espaces`

- ✅ Lister tous les espaces
- ✅ Créer un nouvel espace
- ✅ Modifier un espace existant
- ✅ Supprimer un espace
- ✅ Libérer un espace occupé
- ✅ Filtrer par étage
- ✅ Filtrer par statut (Disponible/Occupé)
- ✅ Voir les statistiques des espaces

**Règles métier:**
- ❌ Impossible de créer un espace sans étage
- ❌ Code espace doit être unique
- ✅ Surface doit être > 0
- ✅ Loyer doit être >= 0

### 🏪 Gestion Boutiques (Admin)
**Route:** `/admin-boutiques`

- ✅ Voir toutes les boutiques
- ✅ Approuver une demande de boutique
- ✅ Rejeter une demande de boutique
- ✅ Modifier les informations d'une boutique
- ✅ Suspendre/Activer une boutique
- ✅ Voir les statistiques des boutiques

---

## 🏪 FONCTIONNALITÉS COMMERÇANT

### 🏪 Mes Boutiques
**Route:** `/my-boutiques`

- ✅ Voir la liste de mes boutiques
- ✅ Voir le statut de chaque boutique (En attente, Approuvée, Suspendue)
- ✅ Accéder à la gestion des produits
- ✅ Voir les statistiques de ventes

### ➕ Nouvelle Boutique
**Route:** `/boutique-registration`

- ✅ Créer une demande de boutique
- ✅ Choisir une catégorie
- ✅ Sélectionner un espace disponible
- ✅ Remplir les informations (nom, description, téléphone)
- ✅ Soumettre la demande

**Règles métier:**
- ❌ Impossible de créer une boutique sans espace
- ❌ Nom de boutique requis
- ✅ Statut initial: "En attente"

### 📦 Gestion Produits
**Accessible depuis:** Mes Boutiques > Gérer Produits

- ✅ Créer un type de produit
- ✅ Ajouter un produit
- ✅ Modifier un produit
- ✅ Supprimer un produit
- ✅ Gérer le stock
- ✅ Définir les prix

### 💰 Portefeuille (Commerçant)
**Route:** `/portefeuille`

- ✅ Voir le solde du portefeuille
- ✅ Voir l'historique des transactions
- ✅ Voir les revenus des ventes
- ✅ Payer le loyer

---

## 🛒 FONCTIONNALITÉS ACHETEUR (CLIENT)

### 🏪 Parcourir les Boutiques
**Route:** `/` (Page d'accueil)

- ✅ Voir toutes les boutiques actives
- ✅ Rechercher une boutique
- ✅ Filtrer par catégorie
- ✅ Voir les produits d'une boutique

### 🛒 Panier
**Route:** `/panier`

- ✅ Voir le contenu du panier
- ✅ Modifier les quantités
- ✅ Supprimer des articles
- ✅ Valider la commande
- ✅ Payer avec le portefeuille

**Règles métier:**
- ❌ Impossible de commander si stock insuffisant
- ❌ Impossible de payer si solde insuffisant
- ✅ Montant total calculé automatiquement

### 📦 Mes Commandes
**Route:** `/mes-commandes`

- ✅ Voir l'historique des commandes
- ✅ Voir les détails d'une commande
- ✅ Suivre le statut (En attente, Validée, Annulée)
- ✅ Télécharger la facture

### 💰 Portefeuille (Acheteur)
**Route:** `/portefeuille`

- ✅ Voir le solde du portefeuille
- ✅ Recharger le portefeuille
- ✅ Voir l'historique des transactions
- ✅ Voir les achats effectués

---

## 🔔 NOTIFICATIONS (Tous les utilisateurs)

**Route:** `/notifications`

- ✅ Voir toutes les notifications
- ✅ Marquer comme lu
- ✅ Supprimer une notification
- ✅ Badge avec nombre de notifications non lues

**Types de notifications:**
- 💰 Paiement (loyer, recharge)
- 🛒 Achat (nouvelle commande)
- 💵 Vente (produit vendu)
- ✅ Validation (boutique approuvée)
- ❌ Rejet (boutique rejetée)

---

## 👤 PROFIL UTILISATEUR

**Route:** `/profile`

- ✅ Voir les informations du profil
- ✅ Modifier le profil (nom, prénom, téléphone, adresse)
- ✅ Changer le mot de passe
- ✅ Voir le rôle et l'email

---

## 🧪 TESTS À EFFECTUER

### Test 1: Connexion Admin
1. Aller sur le frontend
2. Cliquer sur "Se connecter"
3. Entrer: admin@mallapp.com / admin123
4. Vérifier que le menu Admin apparaît

### Test 2: Gestion Étages
1. Se connecter en tant qu'admin
2. Aller sur Admin > Étages
3. Créer un nouvel étage (numéro unique)
4. Modifier l'étage créé
5. Essayer de supprimer (devrait échouer si espaces)

### Test 3: Gestion Espaces
1. Se connecter en tant qu'admin
2. Aller sur Admin > Espaces
3. Créer un nouvel espace
4. Modifier l'espace créé
5. Supprimer l'espace

### Test 4: Création Boutique
1. Se connecter en tant que commerçant
2. Aller sur "Nouvelle Boutique"
3. Remplir le formulaire
4. Soumettre la demande
5. Vérifier dans "Mes Boutiques" (statut: En attente)

### Test 5: Approbation Boutique
1. Se connecter en tant qu'admin
2. Aller sur Admin > Boutiques
3. Trouver la boutique en attente
4. Approuver la boutique
5. Se reconnecter en commerçant
6. Vérifier que le statut est "Approuvée"

### Test 6: Gestion Produits
1. Se connecter en tant que commerçant
2. Aller sur "Mes Boutiques"
3. Cliquer sur "Gérer Produits"
4. Créer un type de produit
5. Ajouter un produit
6. Modifier le stock

### Test 7: Achat Client
1. Se connecter en tant qu'acheteur
2. Parcourir les boutiques
3. Ajouter des produits au panier
4. Valider la commande
5. Vérifier dans "Mes Commandes"

### Test 8: Notifications
1. Effectuer une action (création boutique, achat, etc.)
2. Vérifier que la notification apparaît
3. Cliquer sur l'icône de notification
4. Marquer comme lu

---

## ⚠️ PROBLÈMES CONNUS

### Erreurs Backend
1. **Étage déjà existant** (400)
   - Message: "Un étage avec ce numéro existe déjà"
   - Solution: Utiliser un numéro différent

2. **Suppression étage avec espaces** (400)
   - Message: "Impossible de supprimer un étage qui contient des espaces"
   - Solution: Supprimer d'abord les espaces

3. **Création espace sans étage** (400)
   - Message: "Espace validation failed: etage: Path `etage` is required"
   - Solution: Créer d'abord un étage

### Erreurs Frontend
1. **Message "Vous devez être connecté en tant qu'administrateur"**
   - ✅ RÉSOLU: Vérification du rôle maintenant insensible à la casse
   - Solution: Se déconnecter et se reconnecter

---

## 📊 RÉSULTATS DES TESTS AUTOMATIQUES

**Dernière exécution:** 2026-02-06

```
Total de tests:     31
✅ Réussis:         21
❌ Échoués:         10
📈 Taux de réussite: 67.74%
```

**Tests qui échouent:**
- Création étage (numéro déjà existant)
- Création espace (étage manquant)
- Catégories boutique (token manquant)
- Accès boutique commerçant (permissions)
- Type produit & Produit (boutique non trouvée)

---

## 🚀 DÉPLOIEMENT

**Backend:** https://m1p13mean-niaina-1.onrender.com
- ✅ Déployé et fonctionnel
- ✅ Base de données MongoDB Atlas connectée
- ✅ Authentification JWT fonctionnelle

**Frontend:** À vérifier sur Vercel
- ⏳ En attente de redéploiement
- ✅ Corrections du rôle admin appliquées
- ✅ Prêt pour les tests

---

## 📝 NOTES

- Tous les rôles sont maintenant insensibles à la casse (Admin/admin/ADMIN)
- Les messages d'erreur sont plus détaillés et informatifs
- Les règles métier sont respectées côté backend
- L'interface affiche les erreurs de manière conviviale
