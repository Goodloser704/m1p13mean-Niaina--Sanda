# 📋 Plan de Test Complet - Mall Management Application

**Date:** 6 février 2026  
**Version:** 1.0  
**Environnements:**
- **Backend Production:** https://m1p13mean-niaina-1.onrender.com
- **Frontend Production:** https://m1p13mean-niaina-xjl4.vercel.app
- **Base de données:** MongoDB Atlas

---

## 🎯 OBJECTIF

Tester toutes les fonctionnalités de l'application Mall Management déployée sur Vercel (frontend) et Render (backend) avec MongoDB Atlas.

---

## 📱 MODULES À TESTER

### 1️⃣ **AUTHENTIFICATION & GESTION UTILISATEURS**
### 2️⃣ **GESTION DES BOUTIQUES**
### 3️⃣ **GESTION DES PRODUITS**
### 4️⃣ **GESTION DES COMMANDES & ACHATS**
### 5️⃣ **GESTION DU PORTEFEUILLE**
### 6️⃣ **GESTION DES NOTIFICATIONS**
### 7️⃣ **GESTION DE L'INFRASTRUCTURE (Admin)**
### 8️⃣ **GESTION DES DEMANDES DE LOCATION**
### 9️⃣ **GESTION DES LOYERS & FACTURES**

---


## 1️⃣ AUTHENTIFICATION & GESTION UTILISATEURS

### 📌 Fonctionnalité 1.1: Inscription Utilisateur
**Endpoint:** `POST /api/auth/register`

**Scénario de test:**
1. Ouvrir l'application frontend sur Vercel
2. Cliquer sur "S'inscrire" ou "Register"
3. Remplir le formulaire avec:
   - Nom: "Test User"
   - Email: "testuser@example.com"
   - Mot de passe: "Test123456!"
   - Rôle: "client"
4. Soumettre le formulaire

**Résultat attendu:**
- ✅ Message de succès "Inscription réussie"
- ✅ Redirection vers la page d'accueil
- ✅ Token JWT stocké dans localStorage
- ✅ Utilisateur créé dans MongoDB Atlas
- ✅ Portefeuille créé automatiquement avec solde 0

**Vérification MongoDB:**
```javascript
// Dans MongoDB Atlas
db.users.findOne({ email: "testuser@example.com" })
db.portefeuilles.findOne({ utilisateur: <userId> })
```

---

### 📌 Fonctionnalité 1.2: Connexion Utilisateur
**Endpoint:** `POST /api/auth/login`

**Scénario de test:**
1. Cliquer sur "Se connecter" ou "Login"
2. Entrer les identifiants:
   - Email: "testuser@example.com"
   - Mot de passe: "Test123456!"
3. Cliquer sur "Connexion"

**Résultat attendu:**
- ✅ Message "Connexion réussie"
- ✅ Token JWT reçu et stocké
- ✅ Redirection vers le dashboard
- ✅ Nom d'utilisateur affiché dans le header
- ✅ Menu adapté au rôle (client/commerçant/admin)

---

### 📌 Fonctionnalité 1.3: Profil Utilisateur
**Endpoint:** `GET /api/auth/me`

**Scénario de test:**
1. Se connecter avec un compte
2. Cliquer sur "Mon Profil" dans le menu
3. Vérifier les informations affichées

**Résultat attendu:**
- ✅ Nom complet affiché
- ✅ Email affiché
- ✅ Rôle affiché
- ✅ Date d'inscription affichée
- ✅ Possibilité de modifier les informations

---

### 📌 Fonctionnalité 1.4: Modification Profil
**Endpoint:** `PUT /api/users/:id`

**Scénario de test:**
1. Dans "Mon Profil", cliquer sur "Modifier"
2. Changer le nom en "Test User Updated"
3. Changer le téléphone en "+261340000000"
4. Sauvegarder

**Résultat attendu:**
- ✅ Message "Profil mis à jour avec succès"
- ✅ Nouvelles informations affichées
- ✅ Données mises à jour dans MongoDB

---

### 📌 Fonctionnalité 1.5: Déconnexion
**Action:** Logout

**Scénario de test:**
1. Cliquer sur "Déconnexion" dans le menu
2. Vérifier la redirection

**Résultat attendu:**
- ✅ Token supprimé du localStorage
- ✅ Redirection vers la page d'accueil
- ✅ Menu redevient "visiteur"
- ✅ Impossible d'accéder aux pages protégées

---


## 2️⃣ GESTION DES BOUTIQUES

### 📌 Fonctionnalité 2.1: Demande de Création de Boutique
**Endpoint:** `POST /api/demandes-location`

**Scénario de test:**
1. Se connecter en tant que client
2. Aller dans "Demande de Location"
3. Remplir le formulaire:
   - Nom boutique: "Ma Boutique Test"
   - Catégorie: "Vêtements"
   - Description: "Boutique de vêtements tendance"
   - Espace souhaité: Sélectionner un espace disponible
4. Soumettre la demande

**Résultat attendu:**
- ✅ Message "Demande envoyée avec succès"
- ✅ Demande créée avec statut "en_attente"
- ✅ Notification envoyée à l'admin
- ✅ Demande visible dans "Mes Demandes"

---

### 📌 Fonctionnalité 2.2: Validation Demande (Admin)
**Endpoint:** `PUT /api/demandes-location/:id/valider`

**Scénario de test:**
1. Se connecter en tant qu'admin
2. Aller dans "Gestion Boutiques" > "Demandes en attente"
3. Sélectionner une demande
4. Cliquer sur "Valider"

**Résultat attendu:**
- ✅ Demande passe en statut "validee"
- ✅ Boutique créée automatiquement
- ✅ Espace marqué comme "occupé"
- ✅ Notification envoyée au demandeur
- ✅ Utilisateur devient "commerçant"

---

### 📌 Fonctionnalité 2.3: Liste des Boutiques (Public)
**Endpoint:** `GET /api/boutique`

**Scénario de test:**
1. Aller sur la page d'accueil (sans connexion)
2. Voir la liste des boutiques

**Résultat attendu:**
- ✅ Toutes les boutiques actives affichées
- ✅ Nom, catégorie, description visibles
- ✅ Image de la boutique affichée
- ✅ Possibilité de filtrer par catégorie
- ✅ Possibilité de rechercher par nom

---

### 📌 Fonctionnalité 2.4: Mes Boutiques (Commerçant)
**Endpoint:** `GET /api/boutique/me`

**Scénario de test:**
1. Se connecter en tant que commerçant
2. Aller dans "Mes Boutiques"

**Résultat attendu:**
- ✅ Liste de toutes mes boutiques
- ✅ Statut de chaque boutique (active/inactive)
- ✅ Nombre de produits par boutique
- ✅ Chiffre d'affaires par boutique
- ✅ Boutons "Modifier" et "Gérer Produits"

---

### 📌 Fonctionnalité 2.5: Modification Boutique
**Endpoint:** `PUT /api/boutique/me/:id`

**Scénario de test:**
1. Dans "Mes Boutiques", cliquer sur "Modifier"
2. Changer la description
3. Changer l'image (upload)
4. Modifier les horaires d'ouverture
5. Sauvegarder

**Résultat attendu:**
- ✅ Message "Boutique mise à jour"
- ✅ Nouvelles informations affichées
- ✅ Image uploadée et visible
- ✅ Modifications visibles côté public

---

### 📌 Fonctionnalité 2.6: Désactivation Boutique
**Endpoint:** `PUT /api/boutique/me/:id`

**Scénario de test:**
1. Dans "Mes Boutiques", cliquer sur "Désactiver"
2. Confirmer l'action

**Résultat attendu:**
- ✅ Boutique passe en statut "inactive"
- ✅ Boutique n'apparaît plus côté public
- ✅ Produits non accessibles
- ✅ Possibilité de réactiver

---


## 3️⃣ GESTION DES PRODUITS

### 📌 Fonctionnalité 3.1: Création de Produit
**Endpoint:** `POST /api/produits`

**Scénario de test:**
1. Se connecter en tant que commerçant
2. Aller dans "Mes Boutiques" > "Gérer Produits"
3. Cliquer sur "Ajouter un produit"
4. Remplir le formulaire:
   - Nom: "T-shirt Blanc"
   - Description: "T-shirt 100% coton"
   - Prix: 25000 Ar
   - Stock: 50
   - Type: "Vêtements"
   - Image: Upload
5. Sauvegarder

**Résultat attendu:**
- ✅ Message "Produit créé avec succès"
- ✅ Produit visible dans la liste
- ✅ Image uploadée et affichée
- ✅ Produit visible côté public
- ✅ Stock initialisé correctement

---

### 📌 Fonctionnalité 3.2: Liste Produits par Boutique
**Endpoint:** `GET /api/produits/boutique/:boutiqueId`

**Scénario de test:**
1. Aller sur la page d'accueil
2. Cliquer sur une boutique
3. Voir les produits de cette boutique

**Résultat attendu:**
- ✅ Tous les produits de la boutique affichés
- ✅ Prix, nom, image visibles
- ✅ Stock disponible affiché
- ✅ Bouton "Ajouter au panier" visible
- ✅ Produits en rupture marqués

---

### 📌 Fonctionnalité 3.3: Modification de Produit
**Endpoint:** `PUT /api/produits/:id`

**Scénario de test:**
1. Dans "Mes Produits", cliquer sur "Modifier"
2. Changer le prix à 30000 Ar
3. Modifier la description
4. Sauvegarder

**Résultat attendu:**
- ✅ Message "Produit mis à jour"
- ✅ Nouveau prix affiché
- ✅ Modifications visibles côté public
- ✅ Historique des modifications enregistré

---

### 📌 Fonctionnalité 3.4: Gestion du Stock
**Endpoint:** `PUT /api/produits/:id/stock`

**Scénario de test:**
1. Dans "Mes Produits", cliquer sur "Gérer Stock"
2. Ajouter 20 unités au stock
3. Sauvegarder

**Résultat attendu:**
- ✅ Stock mis à jour (50 + 20 = 70)
- ✅ Message "Stock mis à jour"
- ✅ Nouveau stock visible
- ✅ Si stock > 0, produit redevient disponible

---

### 📌 Fonctionnalité 3.5: Suppression de Produit
**Endpoint:** `DELETE /api/produits/:id`

**Scénario de test:**
1. Dans "Mes Produits", cliquer sur "Supprimer"
2. Confirmer la suppression

**Résultat attendu:**
- ✅ Message "Produit supprimé"
- ✅ Produit retiré de la liste
- ✅ Produit n'apparaît plus côté public
- ✅ Produit marqué comme supprimé (soft delete)

---

### 📌 Fonctionnalité 3.6: Recherche de Produits
**Endpoint:** `GET /api/produits?search=...`

**Scénario de test:**
1. Sur la page d'accueil, utiliser la barre de recherche
2. Taper "T-shirt"
3. Appuyer sur Entrée

**Résultat attendu:**
- ✅ Tous les produits contenant "T-shirt" affichés
- ✅ Recherche insensible à la casse
- ✅ Résultats paginés
- ✅ Nombre de résultats affiché

---

### 📌 Fonctionnalité 3.7: Filtrage par Type
**Endpoint:** `GET /api/produits?type=...`

**Scénario de test:**
1. Sur la page produits, sélectionner "Vêtements"
2. Voir les résultats filtrés

**Résultat attendu:**
- ✅ Seuls les produits "Vêtements" affichés
- ✅ Possibilité de combiner avec recherche
- ✅ Compteur de résultats mis à jour

---


## 4️⃣ GESTION DES COMMANDES & ACHATS

### 📌 Fonctionnalité 4.1: Ajout au Panier
**Action:** Frontend (localStorage)

**Scénario de test:**
1. Se connecter en tant que client
2. Parcourir les produits
3. Cliquer sur "Ajouter au panier" pour 3 produits différents
4. Modifier la quantité d'un produit

**Résultat attendu:**
- ✅ Icône panier affiche le nombre d'articles
- ✅ Produits ajoutés au panier
- ✅ Quantité modifiable
- ✅ Total calculé automatiquement
- ✅ Panier persistant (localStorage)

---

### 📌 Fonctionnalité 4.2: Visualisation du Panier
**Route:** `/panier`

**Scénario de test:**
1. Cliquer sur l'icône panier
2. Voir le contenu du panier

**Résultat attendu:**
- ✅ Liste de tous les produits
- ✅ Image, nom, prix unitaire affichés
- ✅ Quantité modifiable
- ✅ Sous-total par produit
- ✅ Total général affiché
- ✅ Bouton "Supprimer" par produit
- ✅ Bouton "Vider le panier"
- ✅ Bouton "Valider la commande"

---

### 📌 Fonctionnalité 4.3: Validation du Panier
**Endpoint:** `POST /api/achats/valider-panier`

**Scénario de test:**
1. Dans le panier, cliquer sur "Valider la commande"
2. Vérifier le solde du portefeuille
3. Confirmer l'achat

**Résultat attendu:**
- ✅ Vérification du solde suffisant
- ✅ Si solde insuffisant: message d'erreur + lien recharge
- ✅ Si solde OK: commande créée
- ✅ Stock des produits décrémenté
- ✅ Solde portefeuille débité
- ✅ Facture générée automatiquement
- ✅ Notification envoyée au client
- ✅ Notification envoyée aux commerçants
- ✅ Panier vidé
- ✅ Redirection vers "Mes Commandes"

---

### 📌 Fonctionnalité 4.4: Mes Commandes (Client)
**Endpoint:** `GET /api/achats/me`

**Scénario de test:**
1. Se connecter en tant que client
2. Aller dans "Mes Commandes"

**Résultat attendu:**
- ✅ Liste de toutes mes commandes
- ✅ Date, montant, statut affichés
- ✅ Détails de chaque commande
- ✅ Liste des produits par commande
- ✅ Possibilité de télécharger la facture
- ✅ Filtrage par statut possible

---

### 📌 Fonctionnalité 4.5: Détails d'une Commande
**Endpoint:** `GET /api/achats/:id`

**Scénario de test:**
1. Dans "Mes Commandes", cliquer sur une commande
2. Voir les détails

**Résultat attendu:**
- ✅ Numéro de commande affiché
- ✅ Date et heure précises
- ✅ Liste complète des produits
- ✅ Prix unitaire et quantité par produit
- ✅ Total de la commande
- ✅ Statut de la commande
- ✅ Informations de livraison (si applicable)
- ✅ Bouton "Télécharger facture"

---

### 📌 Fonctionnalité 4.6: Commandes Reçues (Commerçant)
**Endpoint:** `GET /api/achats/boutique/commandes`

**Scénario de test:**
1. Se connecter en tant que commerçant
2. Aller dans "Mes Ventes"

**Résultat attendu:**
- ✅ Liste des commandes contenant mes produits
- ✅ Statut de chaque commande
- ✅ Montant total par commande
- ✅ Détails des produits vendus
- ✅ Informations client (nom, contact)
- ✅ Possibilité de marquer comme "préparée"

---

### 📌 Fonctionnalité 4.7: Historique des Achats
**Endpoint:** `GET /api/achats/historique`

**Scénario de test:**
1. Dans "Mes Commandes", cliquer sur "Historique"
2. Filtrer par date (dernier mois)

**Résultat attendu:**
- ✅ Toutes les commandes de la période
- ✅ Statistiques: total dépensé, nombre de commandes
- ✅ Graphique des dépenses (si implémenté)
- ✅ Export possible en CSV/PDF

---


## 5️⃣ GESTION DU PORTEFEUILLE

### 📌 Fonctionnalité 5.1: Consultation du Portefeuille
**Endpoint:** `GET /api/portefeuille/me`

**Scénario de test:**
1. Se connecter
2. Aller dans "Mon Portefeuille"

**Résultat attendu:**
- ✅ Solde actuel affiché en gros
- ✅ Devise (Ar) affichée
- ✅ Historique des transactions visible
- ✅ Bouton "Recharger" visible
- ✅ Statistiques: total rechargé, total dépensé

---

### 📌 Fonctionnalité 5.2: Recharge du Portefeuille
**Endpoint:** `POST /api/portefeuille/recharge`

**Scénario de test:**
1. Dans "Mon Portefeuille", cliquer sur "Recharger"
2. Entrer le montant: 100000 Ar
3. Sélectionner le mode de paiement: "Mobile Money"
4. Confirmer

**Résultat attendu:**
- ✅ Validation du montant (min/max)
- ✅ Transaction créée avec statut "en_attente"
- ✅ Simulation de paiement (en dev)
- ✅ Solde mis à jour immédiatement
- ✅ Transaction enregistrée dans l'historique
- ✅ Notification de recharge envoyée
- ✅ Nouveau solde affiché

---

### 📌 Fonctionnalité 5.3: Historique des Transactions
**Endpoint:** `GET /api/portefeuille/transactions`

**Scénario de test:**
1. Dans "Mon Portefeuille", aller dans "Historique"
2. Voir toutes les transactions

**Résultat attendu:**
- ✅ Liste chronologique des transactions
- ✅ Type: recharge, achat, remboursement
- ✅ Montant avec signe (+ ou -)
- ✅ Date et heure
- ✅ Description de la transaction
- ✅ Solde après transaction
- ✅ Pagination si nombreuses transactions

---

### 📌 Fonctionnalité 5.4: Statistiques du Portefeuille
**Endpoint:** `GET /api/portefeuille/stats`

**Scénario de test:**
1. Dans "Mon Portefeuille", voir les statistiques

**Résultat attendu:**
- ✅ Total rechargé (ce mois)
- ✅ Total dépensé (ce mois)
- ✅ Nombre de transactions
- ✅ Moyenne des dépenses
- ✅ Graphique des dépenses (si implémenté)

---

### 📌 Fonctionnalité 5.5: Vérification Solde Avant Achat
**Endpoint:** `GET /api/portefeuille/me`

**Scénario de test:**
1. Avoir un solde de 10000 Ar
2. Essayer d'acheter pour 50000 Ar
3. Valider le panier

**Résultat attendu:**
- ✅ Message d'erreur "Solde insuffisant"
- ✅ Montant manquant affiché
- ✅ Bouton "Recharger maintenant"
- ✅ Panier conservé
- ✅ Pas de débit du portefeuille
- ✅ Pas de création de commande

---


## 6️⃣ GESTION DES NOTIFICATIONS

### 📌 Fonctionnalité 6.1: Réception de Notifications
**Endpoint:** `GET /api/notifications`

**Scénario de test:**
1. Se connecter
2. Cliquer sur l'icône notifications (cloche)

**Résultat attendu:**
- ✅ Liste des notifications affichée
- ✅ Badge avec nombre de non-lues
- ✅ Notifications triées par date (récentes en premier)
- ✅ Icône différente par type
- ✅ Notifications non-lues en gras
- ✅ Pagination si nombreuses notifications

---

### 📌 Fonctionnalité 6.2: Types de Notifications
**Différents types testés:**

**Test 1: Notification de Commande**
- Faire un achat
- Vérifier notification "Commande validée"

**Test 2: Notification de Vente (Commerçant)**
- Un client achète un produit
- Commerçant reçoit "Nouvelle vente"

**Test 3: Notification de Demande (Admin)**
- Client fait une demande de location
- Admin reçoit "Nouvelle demande"

**Test 4: Notification de Validation**
- Admin valide une demande
- Client reçoit "Demande acceptée"

**Résultat attendu:**
- ✅ Chaque type a son icône
- ✅ Message clair et précis
- ✅ Lien vers l'élément concerné
- ✅ Date relative ("il y a 2h")

---

### 📌 Fonctionnalité 6.3: Marquer comme Lu
**Endpoint:** `PUT /api/notifications/:id/read`

**Scénario de test:**
1. Cliquer sur une notification non-lue
2. Vérifier le changement

**Résultat attendu:**
- ✅ Notification passe en "lue"
- ✅ Style change (plus en gras)
- ✅ Badge décrémenté
- ✅ Redirection vers l'élément concerné

---

### 📌 Fonctionnalité 6.4: Marquer Toutes comme Lues
**Endpoint:** `PUT /api/notifications/read-all`

**Scénario de test:**
1. Avoir plusieurs notifications non-lues
2. Cliquer sur "Tout marquer comme lu"

**Résultat attendu:**
- ✅ Toutes les notifications marquées lues
- ✅ Badge à 0
- ✅ Message de confirmation
- ✅ Styles mis à jour

---

### 📌 Fonctionnalité 6.5: Compteur de Notifications
**Endpoint:** `GET /api/notifications/count`

**Scénario de test:**
1. Observer le badge sur l'icône cloche
2. Recevoir une nouvelle notification
3. Vérifier la mise à jour

**Résultat attendu:**
- ✅ Badge affiché si > 0
- ✅ Nombre exact de non-lues
- ✅ Mise à jour en temps réel (ou au refresh)
- ✅ Badge disparaît si 0

---

### 📌 Fonctionnalité 6.6: Archivage de Notifications
**Endpoint:** `PUT /api/notifications/:id/archive`

**Scénario de test:**
1. Cliquer sur "Archiver" sur une notification
2. Vérifier qu'elle disparaît

**Résultat attendu:**
- ✅ Notification archivée
- ✅ N'apparaît plus dans la liste principale
- ✅ Accessible dans "Archives" (si implémenté)
- ✅ Peut être restaurée

---


## 7️⃣ GESTION DE L'INFRASTRUCTURE (Admin)

### 📌 Fonctionnalité 7.1: Gestion du Centre Commercial
**Endpoint:** `GET /api/centre-commercial`

**Scénario de test:**
1. Se connecter en tant qu'admin
2. Aller dans "Gestion Centre Commercial"

**Résultat attendu:**
- ✅ Informations du centre affichées
- ✅ Nom, adresse, description
- ✅ Nombre total d'étages
- ✅ Nombre total d'espaces
- ✅ Taux d'occupation
- ✅ Bouton "Modifier"

---

### 📌 Fonctionnalité 7.2: Gestion des Étages
**Endpoint:** `GET /api/etages`

**Scénario de test:**
1. En tant qu'admin, aller dans "Gestion Étages"
2. Voir la liste des étages

**Résultat attendu:**
- ✅ Liste de tous les étages
- ✅ Numéro, nom de l'étage
- ✅ Nombre d'espaces par étage
- ✅ Espaces occupés/disponibles
- ✅ Boutons "Modifier", "Supprimer"
- ✅ Bouton "Ajouter un étage"

---

### 📌 Fonctionnalité 7.3: Création d'un Étage
**Endpoint:** `POST /api/etages`

**Scénario de test:**
1. Cliquer sur "Ajouter un étage"
2. Remplir:
   - Numéro: 3
   - Nom: "Étage Luxe"
   - Description: "Boutiques haut de gamme"
3. Sauvegarder

**Résultat attendu:**
- ✅ Étage créé avec succès
- ✅ Apparaît dans la liste
- ✅ Numéro unique vérifié
- ✅ Prêt à recevoir des espaces

---

### 📌 Fonctionnalité 7.4: Gestion des Espaces
**Endpoint:** `GET /api/espaces`

**Scénario de test:**
1. En tant qu'admin, aller dans "Gestion Espaces"
2. Voir tous les espaces

**Résultat attendu:**
- ✅ Liste de tous les espaces
- ✅ Numéro, surface, loyer
- ✅ Étage associé
- ✅ Statut: disponible/occupé/maintenance
- ✅ Boutique occupante (si occupé)
- ✅ Filtrage par étage
- ✅ Filtrage par statut

---

### 📌 Fonctionnalité 7.5: Création d'un Espace
**Endpoint:** `POST /api/espaces`

**Scénario de test:**
1. Cliquer sur "Ajouter un espace"
2. Remplir:
   - Numéro: "E301"
   - Étage: Sélectionner "Étage 3"
   - Surface: 50 m²
   - Loyer mensuel: 500000 Ar
   - Description: "Espace avec vitrine"
3. Sauvegarder

**Résultat attendu:**
- ✅ Espace créé avec succès
- ✅ Statut "disponible" par défaut
- ✅ Apparaît dans la liste
- ✅ Visible pour les demandes de location

---

### 📌 Fonctionnalité 7.6: Modification d'un Espace
**Endpoint:** `PUT /api/espaces/:id`

**Scénario de test:**
1. Cliquer sur "Modifier" sur un espace
2. Changer le loyer à 600000 Ar
3. Changer le statut en "maintenance"
4. Sauvegarder

**Résultat attendu:**
- ✅ Espace mis à jour
- ✅ Nouveau loyer affiché
- ✅ Statut changé
- ✅ Si maintenance: non disponible pour location

---

### 📌 Fonctionnalité 7.7: Statistiques Infrastructure
**Endpoint:** `GET /api/etages/stats`

**Scénario de test:**
1. Dans le dashboard admin, voir les statistiques

**Résultat attendu:**
- ✅ Nombre total d'étages
- ✅ Nombre total d'espaces
- ✅ Taux d'occupation global
- ✅ Taux d'occupation par étage
- ✅ Revenus mensuels estimés
- ✅ Espaces en maintenance

---


## 8️⃣ GESTION DES DEMANDES DE LOCATION

### 📌 Fonctionnalité 8.1: Création d'une Demande
**Endpoint:** `POST /api/demandes-location`

**Scénario de test:**
1. Se connecter en tant que client
2. Aller dans "Demande de Location"
3. Remplir le formulaire:
   - Nom boutique: "Boutique Électronique"
   - Catégorie: "Électronique"
   - Description: "Vente de smartphones et accessoires"
   - Espace souhaité: Sélectionner "E201"
   - Justificatifs: Upload documents
4. Soumettre

**Résultat attendu:**
- ✅ Demande créée avec statut "en_attente"
- ✅ Numéro de demande généré
- ✅ Notification envoyée à l'admin
- ✅ Confirmation affichée au client
- ✅ Demande visible dans "Mes Demandes"

---

### 📌 Fonctionnalité 8.2: Consultation de Mes Demandes
**Endpoint:** `GET /api/demandes-location/me`

**Scénario de test:**
1. En tant que client, aller dans "Mes Demandes"

**Résultat attendu:**
- ✅ Liste de toutes mes demandes
- ✅ Statut de chaque demande
- ✅ Date de soumission
- ✅ Espace demandé
- ✅ Détails visibles
- ✅ Possibilité d'annuler si "en_attente"

---

### 📌 Fonctionnalité 8.3: Liste des Demandes (Admin)
**Endpoint:** `GET /api/demandes-location`

**Scénario de test:**
1. Se connecter en tant qu'admin
2. Aller dans "Gestion Demandes"

**Résultat attendu:**
- ✅ Toutes les demandes affichées
- ✅ Filtrage par statut
- ✅ Informations du demandeur
- ✅ Détails de la demande
- ✅ Boutons "Valider" / "Rejeter"
- ✅ Tri par date

---

### 📌 Fonctionnalité 8.4: Validation d'une Demande
**Endpoint:** `PUT /api/demandes-location/:id/valider`

**Scénario de test:**
1. Admin sélectionne une demande "en_attente"
2. Clique sur "Valider"
3. Confirme l'action

**Résultat attendu:**
- ✅ Demande passe en "validee"
- ✅ Boutique créée automatiquement
- ✅ Espace marqué "occupé"
- ✅ Utilisateur devient "commerçant"
- ✅ Notification envoyée au demandeur
- ✅ Contrat de location généré (si implémenté)

---

### 📌 Fonctionnalité 8.5: Rejet d'une Demande
**Endpoint:** `PUT /api/demandes-location/:id/rejeter`

**Scénario de test:**
1. Admin sélectionne une demande
2. Clique sur "Rejeter"
3. Entre un motif: "Espace déjà réservé"
4. Confirme

**Résultat attendu:**
- ✅ Demande passe en "rejetee"
- ✅ Motif enregistré
- ✅ Notification envoyée au demandeur
- ✅ Espace reste disponible
- ✅ Demandeur peut refaire une demande

---

### 📌 Fonctionnalité 8.6: Annulation d'une Demande
**Endpoint:** `DELETE /api/demandes-location/:id`

**Scénario de test:**
1. Client va dans "Mes Demandes"
2. Sélectionne une demande "en_attente"
3. Clique sur "Annuler"
4. Confirme

**Résultat attendu:**
- ✅ Demande annulée
- ✅ Disparaît de la liste active
- ✅ Espace redevient disponible
- ✅ Notification envoyée à l'admin

---


## 9️⃣ GESTION DES LOYERS & FACTURES

### 📌 Fonctionnalité 9.1: Paiement de Loyer
**Endpoint:** `POST /api/commercant/loyers/pay`

**Scénario de test:**
1. Se connecter en tant que commerçant
2. Aller dans "Mes Loyers"
3. Voir le loyer du mois en cours
4. Cliquer sur "Payer"
5. Confirmer le paiement

**Résultat attendu:**
- ✅ Vérification du solde portefeuille
- ✅ Si solde insuffisant: message d'erreur
- ✅ Si solde OK: loyer payé
- ✅ Reçu généré automatiquement
- ✅ Transaction enregistrée
- ✅ Portefeuille débité
- ✅ Notification de confirmation
- ✅ Statut loyer: "payé"

---

### 📌 Fonctionnalité 9.2: Historique des Loyers
**Endpoint:** `GET /api/commercant/loyers/historique`

**Scénario de test:**
1. En tant que commerçant, aller dans "Historique Loyers"

**Résultat attendu:**
- ✅ Liste de tous les loyers
- ✅ Mois et année
- ✅ Montant payé
- ✅ Date de paiement
- ✅ Statut: payé/en_attente/en_retard
- ✅ Téléchargement du reçu
- ✅ Filtrage par période

---

### 📌 Fonctionnalité 9.3: Consultation des Factures
**Endpoint:** `GET /api/factures/acheteur/:id/factures`

**Scénario de test:**
1. Se connecter en tant que client
2. Aller dans "Mes Factures"

**Résultat attendu:**
- ✅ Liste de toutes mes factures
- ✅ Numéro de facture
- ✅ Date d'émission
- ✅ Montant total
- ✅ Statut: payée/en_attente
- ✅ Détails de la commande associée
- ✅ Bouton "Télécharger PDF"

---

### 📌 Fonctionnalité 9.4: Téléchargement Facture PDF
**Endpoint:** `GET /api/factures/:factureId/pdf`

**Scénario de test:**
1. Dans "Mes Factures", cliquer sur "Télécharger"
2. Vérifier le PDF généré

**Résultat attendu:**
- ✅ PDF téléchargé
- ✅ En-tête avec logo et infos centre
- ✅ Numéro de facture
- ✅ Date d'émission
- ✅ Informations client
- ✅ Détails des produits
- ✅ Montants HT, TVA, TTC
- ✅ Conditions de paiement
- ✅ Format professionnel

---

### 📌 Fonctionnalité 9.5: Statistiques Loyers (Admin)
**Endpoint:** `GET /api/admin/loyers/stats`

**Scénario de test:**
1. Se connecter en tant qu'admin
2. Aller dans "Statistiques Loyers"

**Résultat attendu:**
- ✅ Total loyers du mois
- ✅ Loyers payés
- ✅ Loyers en attente
- ✅ Loyers en retard
- ✅ Taux de paiement
- ✅ Liste des retardataires
- ✅ Graphique d'évolution

---


## 🔟 FONCTIONNALITÉS TRANSVERSALES

### 📌 Fonctionnalité 10.1: Recherche Globale
**Endpoint:** `GET /api/produits?search=...`

**Scénario de test:**
1. Utiliser la barre de recherche principale
2. Taper "smartphone"
3. Voir les résultats

**Résultat attendu:**
- ✅ Produits correspondants affichés
- ✅ Boutiques correspondantes affichées
- ✅ Résultats triés par pertinence
- ✅ Nombre de résultats affiché
- ✅ Pagination fonctionnelle

---

### 📌 Fonctionnalité 10.2: Filtres Avancés
**Différents filtres:**

**Scénario de test:**
1. Aller sur la page produits
2. Appliquer plusieurs filtres:
   - Catégorie: "Électronique"
   - Prix: 10000 - 50000 Ar
   - Boutique: Sélectionner une boutique
   - Disponibilité: En stock uniquement

**Résultat attendu:**
- ✅ Résultats filtrés correctement
- ✅ Combinaison de filtres fonctionne
- ✅ Compteur de résultats mis à jour
- ✅ Possibilité de réinitialiser les filtres
- ✅ URL mise à jour (partage possible)

---

### 📌 Fonctionnalité 10.3: Pagination
**Tous les endpoints avec liste:**

**Scénario de test:**
1. Aller sur une page avec beaucoup d'éléments
2. Naviguer entre les pages

**Résultat attendu:**
- ✅ Éléments affichés par page (10, 20, 50)
- ✅ Boutons Précédent/Suivant
- ✅ Numéros de pages
- ✅ Page actuelle mise en évidence
- ✅ Total d'éléments affiché
- ✅ Sélection du nombre par page

---

### 📌 Fonctionnalité 10.4: Gestion des Erreurs
**Différents cas d'erreur:**

**Test 1: Erreur Réseau**
- Couper la connexion
- Essayer une action
- Résultat: Message "Erreur de connexion"

**Test 2: Erreur 404**
- Accéder à une URL invalide
- Résultat: Page 404 personnalisée

**Test 3: Erreur 401**
- Token expiré
- Résultat: Redirection vers login

**Test 4: Erreur 403**
- Accéder à une ressource interdite
- Résultat: Message "Accès refusé"

**Test 5: Erreur 500**
- Erreur serveur
- Résultat: Message générique + support

**Résultat attendu:**
- ✅ Messages d'erreur clairs
- ✅ Pas de crash de l'application
- ✅ Possibilité de réessayer
- ✅ Logs côté serveur

---

### 📌 Fonctionnalité 10.5: Responsive Design
**Différents appareils:**

**Scénario de test:**
1. Tester sur mobile (375px)
2. Tester sur tablette (768px)
3. Tester sur desktop (1920px)

**Résultat attendu:**
- ✅ Layout adapté à chaque taille
- ✅ Menu hamburger sur mobile
- ✅ Images redimensionnées
- ✅ Textes lisibles
- ✅ Boutons accessibles
- ✅ Pas de scroll horizontal
- ✅ Touch-friendly sur mobile

---

### 📌 Fonctionnalité 10.6: Performance
**Métriques à vérifier:**

**Scénario de test:**
1. Ouvrir les DevTools
2. Aller sur l'onglet Performance
3. Charger différentes pages

**Résultat attendu:**
- ✅ Temps de chargement < 3s
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3.5s
- ✅ Images optimisées
- ✅ Lazy loading des images
- ✅ Pas de memory leaks

---


---

## 📊 RÉCAPITULATIF DES TESTS

### Nombre Total de Fonctionnalités: **60+**

| Module | Nombre de Tests | Priorité |
|--------|----------------|----------|
| Authentification | 5 | 🔴 Critique |
| Gestion Boutiques | 6 | 🔴 Critique |
| Gestion Produits | 7 | 🔴 Critique |
| Commandes & Achats | 7 | 🔴 Critique |
| Portefeuille | 5 | 🟠 Haute |
| Notifications | 6 | 🟡 Moyenne |
| Infrastructure (Admin) | 7 | 🟠 Haute |
| Demandes Location | 6 | 🟠 Haute |
| Loyers & Factures | 5 | 🟡 Moyenne |
| Transversal | 6 | 🟢 Basse |

---

## 🎯 PLAN D'EXÉCUTION DES TESTS

### Phase 1: Tests Critiques (Jour 1)
**Durée estimée: 2-3 heures**

1. ✅ Inscription et connexion
2. ✅ Création de boutique (demande + validation)
3. ✅ Ajout de produits
4. ✅ Achat de produits
5. ✅ Gestion du portefeuille

**Objectif:** Valider le parcours utilisateur principal

---

### Phase 2: Tests Haute Priorité (Jour 2)
**Durée estimée: 3-4 heures**

1. ✅ Gestion complète des boutiques
2. ✅ Gestion complète des produits
3. ✅ Infrastructure (étages, espaces)
4. ✅ Demandes de location
5. ✅ Notifications

**Objectif:** Valider les fonctionnalités métier

---

### Phase 3: Tests Moyenne Priorité (Jour 3)
**Durée estimée: 2-3 heures**

1. ✅ Loyers et factures
2. ✅ Statistiques
3. ✅ Historiques
4. ✅ Filtres et recherche

**Objectif:** Valider les fonctionnalités avancées

---

### Phase 4: Tests Transversaux (Jour 4)
**Durée estimée: 2-3 heures**

1. ✅ Responsive design
2. ✅ Gestion des erreurs
3. ✅ Performance
4. ✅ Sécurité

**Objectif:** Valider la qualité globale

---

## 🧪 MÉTHODOLOGIE DE TEST

### Pour Chaque Fonctionnalité:

1. **Préparation**
   - Lire le scénario
   - Préparer les données de test
   - Ouvrir les DevTools (Network, Console)

2. **Exécution**
   - Suivre le scénario étape par étape
   - Noter les observations
   - Capturer les screenshots si erreur

3. **Vérification**
   - Vérifier tous les résultats attendus
   - Vérifier dans MongoDB Atlas si nécessaire
   - Vérifier les logs backend sur Render

4. **Documentation**
   - ✅ Si succès: cocher la fonctionnalité
   - ❌ Si échec: noter l'erreur détaillée
   - 🟡 Si partiel: noter ce qui manque

---

## 📝 TEMPLATE DE RAPPORT DE TEST

```markdown
### Test: [Nom de la fonctionnalité]
**Date:** [Date du test]
**Testeur:** [Votre nom]
**Environnement:** Production (Vercel + Render + MongoDB Atlas)

**Statut:** ✅ Réussi / ❌ Échoué / 🟡 Partiel

**Étapes effectuées:**
1. [Étape 1]
2. [Étape 2]
...

**Résultats obtenus:**
- [Résultat 1]
- [Résultat 2]
...

**Écarts constatés:**
- [Écart 1 si applicable]
- [Écart 2 si applicable]

**Captures d'écran:**
- [Lien vers screenshot si erreur]

**Logs:**
```
[Logs pertinents si erreur]
```

**Recommandations:**
- [Recommandation 1]
- [Recommandation 2]
```

---

## 🔍 VÉRIFICATIONS MONGODB ATLAS

### Connexion à MongoDB Atlas:
1. Aller sur https://cloud.mongodb.com
2. Se connecter avec vos identifiants
3. Sélectionner votre cluster
4. Cliquer sur "Browse Collections"

### Collections à vérifier:

**users**
```javascript
db.users.find().pretty()
db.users.countDocuments({ role: "client" })
db.users.countDocuments({ role: "commercant" })
```

**boutiques**
```javascript
db.boutiques.find().pretty()
db.boutiques.countDocuments({ statut: "active" })
```

**produits**
```javascript
db.produits.find().pretty()
db.produits.countDocuments({ stock: { $gt: 0 } })
```

**achats**
```javascript
db.achats.find().sort({ dateAchat: -1 }).pretty()
db.achats.aggregate([
  { $group: { _id: null, total: { $sum: "$montantTotal" } } }
])
```

**portefeuilles**
```javascript
db.portefeuilles.find().pretty()
db.portefeuilles.aggregate([
  { $group: { _id: null, totalSolde: { $sum: "$solde" } } }
])
```

**notifications**
```javascript
db.notifications.find().sort({ dateCreation: -1 }).limit(10).pretty()
db.notifications.countDocuments({ lu: false })
```

---

## 🚀 COMMANDES UTILES

### Vérifier le Backend (Render):
```bash
# Voir les logs en temps réel
curl https://m1p13mean-niaina-1.onrender.com/health

# Tester une route
curl https://m1p13mean-niaina-1.onrender.com/api/boutique
```

### Vérifier le Frontend (Vercel):
```bash
# Ouvrir l'application
open https://m1p13mean-niaina-xjl4.vercel.app

# Vérifier le build
curl -I https://m1p13mean-niaina-xjl4.vercel.app
```

### Tester les APIs avec curl:
```bash
# Login
curl -X POST https://m1p13mean-niaina-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!"}'

# Get produits
curl https://m1p13mean-niaina-1.onrender.com/api/produits

# Get boutiques
curl https://m1p13mean-niaina-1.onrender.com/api/boutique
```

---

## ✅ CHECKLIST FINALE

Avant de commencer les tests, vérifier:

- [ ] Backend Render est en ligne (https://m1p13mean-niaina-1.onrender.com/health)
- [ ] Frontend Vercel est en ligne (https://m1p13mean-niaina-xjl4.vercel.app)
- [ ] MongoDB Atlas est accessible
- [ ] Compte admin créé et fonctionnel
- [ ] Compte client de test créé
- [ ] Compte commerçant de test créé
- [ ] DevTools du navigateur ouverts
- [ ] Document de rapport de test prêt
- [ ] Captures d'écran prêtes

---

## 📞 SUPPORT

**En cas de problème:**

1. **Vérifier les logs Render:**
   - Aller sur https://dashboard.render.com
   - Sélectionner le service
   - Onglet "Logs"

2. **Vérifier MongoDB Atlas:**
   - Vérifier la connexion réseau
   - Vérifier les collections
   - Vérifier les index

3. **Vérifier Vercel:**
   - Aller sur https://vercel.com/dashboard
   - Vérifier le dernier déploiement
   - Vérifier les logs de build

---

## 🎉 CONCLUSION

Ce plan de test couvre **toutes les fonctionnalités** de l'application Mall Management.

**Durée totale estimée:** 10-12 heures de tests

**Bonne chance pour les tests! 🚀**

---

**Document créé le:** 6 février 2026  
**Version:** 1.0  
**Auteur:** Kiro AI Assistant
