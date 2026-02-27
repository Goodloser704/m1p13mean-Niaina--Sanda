# 🧪 Guide de Test - Mall Management Application

## 📋 Vue d'ensemble

Ce guide vous accompagne pour tester toutes les fonctionnalités de l'application Mall Management déployée sur:
- **Frontend:** Vercel (https://m1p13mean-niaina-xjl4.vercel.app)
- **Backend:** Render (https://m1p13mean-niaina-1.onrender.com)
- **Base de données:** MongoDB Atlas

---

## 📁 Fichiers de Test Disponibles

### 1. `PLAN-TEST-FONCTIONNALITES.md`
**Description:** Plan de test manuel complet avec 60+ scénarios détaillés

**Contenu:**
- 9 modules de fonctionnalités
- Scénarios étape par étape
- Résultats attendus pour chaque test
- Vérifications MongoDB
- Templates de rapport

**Utilisation:** Suivre manuellement chaque scénario dans l'application web

---

### 2. `test-production-complet.js`
**Description:** Script de test automatisé pour les APIs

**Contenu:**
- Tests automatisés de toutes les routes API
- Vérification des codes de statut HTTP
- Tests d'authentification
- Tests des fonctionnalités principales

**Utilisation:**
```bash
node test-production-complet.js
```

**Résultat:** Rapport avec statistiques de réussite/échec

---

## 🚀 Démarrage Rapide

### Prérequis

1. **Node.js** installé (v14 ou supérieur)
2. **Accès Internet** pour atteindre les serveurs
3. **Navigateur Web** moderne (Chrome, Firefox, Edge)
4. **Compte MongoDB Atlas** (pour vérifications)

### Installation

```bash
# Cloner le repository
git clone https://github.com/Goodloser704/m1p13mean-Niaina--.git
cd m1p13mean-Niaina--

# Installer les dépendances (si nécessaire)
npm install
```

---

## 📝 Tests Manuels (Interface Web)

### Étape 1: Ouvrir l'Application

```bash
# Ouvrir dans le navigateur
https://m1p13mean-niaina-xjl4.vercel.app
```

### Étape 2: Ouvrir les DevTools

- **Chrome/Edge:** F12 ou Ctrl+Shift+I
- **Firefox:** F12 ou Ctrl+Shift+K

**Onglets importants:**
- **Console:** Voir les erreurs JavaScript
- **Network:** Voir les requêtes HTTP
- **Application:** Voir le localStorage

### Étape 3: Suivre le Plan de Test

Ouvrir `PLAN-TEST-FONCTIONNALITES.md` et suivre les scénarios:

**Exemple - Test 1.1: Inscription**
1. Cliquer sur "S'inscrire"
2. Remplir le formulaire
3. Soumettre
4. Vérifier le résultat attendu

**Documenter les résultats:**
- ✅ Si succès: cocher
- ❌ Si échec: noter l'erreur
- 🟡 Si partiel: noter ce qui manque

---

## 🤖 Tests Automatisés (APIs)

### Lancer les Tests

```bash
node test-production-complet.js
```

### Résultat Attendu

```
============================================================
🧪 TESTS COMPLETS - MALL MANAGEMENT APP
============================================================
Backend: https://m1p13mean-niaina-1.onrender.com
Frontend: https://m1p13mean-niaina-xjl4.vercel.app
============================================================

============================================================
MODULE 1: AUTHENTIFICATION & GESTION UTILISATEURS
============================================================

✅ PASS - 1.1 - Health Check Backend
✅ PASS - 1.2 - Inscription Utilisateur
✅ PASS - 1.3 - Connexion Utilisateur
✅ PASS - 1.4 - Récupération Profil
✅ PASS - 1.5 - Connexion Admin

...

============================================================
📊 RÉSUMÉ DES TESTS
============================================================

Total de tests: 35
✅ Réussis: 32 (91.4%)
❌ Échoués: 3 (8.6%)
⏱️  Durée: 12.5s

============================================================
```

### Interpréter les Résultats

- **✅ PASS:** Test réussi
- **❌ FAIL:** Test échoué (voir le message d'erreur)
- **Pourcentage > 90%:** Application fonctionnelle
- **Pourcentage < 80%:** Problèmes à corriger

---

## 🔍 Vérifications MongoDB Atlas

### Se Connecter à MongoDB Atlas

1. Aller sur https://cloud.mongodb.com
2. Se connecter avec vos identifiants
3. Sélectionner votre cluster
4. Cliquer sur "Browse Collections"

### Collections à Vérifier

#### 1. Collection `users`

```javascript
// Compter les utilisateurs
db.users.countDocuments()

// Voir les utilisateurs récents
db.users.find().sort({ createdAt: -1 }).limit(5).pretty()

// Compter par rôle
db.users.countDocuments({ role: "client" })
db.users.countDocuments({ role: "commercant" })
db.users.countDocuments({ role: "admin" })
```

#### 2. Collection `boutiques`

```javascript
// Compter les boutiques
db.boutiques.countDocuments()

// Boutiques actives
db.boutiques.countDocuments({ statut: "active" })

// Voir les boutiques
db.boutiques.find().pretty()
```

#### 3. Collection `produits`

```javascript
// Compter les produits
db.produits.countDocuments()

// Produits en stock
db.produits.countDocuments({ stock: { $gt: 0 } })

// Voir les produits
db.produits.find().limit(10).pretty()
```

#### 4. Collection `achats`

```javascript
// Compter les achats
db.achats.countDocuments()

// Total des ventes
db.achats.aggregate([
  { $group: { _id: null, total: { $sum: "$montantTotal" } } }
])

// Achats récents
db.achats.find().sort({ dateAchat: -1 }).limit(5).pretty()
```

#### 5. Collection `portefeuilles`

```javascript
// Compter les portefeuilles
db.portefeuilles.countDocuments()

// Solde total
db.portefeuilles.aggregate([
  { $group: { _id: null, totalSolde: { $sum: "$solde" } } }
])

// Voir les portefeuilles
db.portefeuilles.find().pretty()
```

#### 6. Collection `notifications`

```javascript
// Compter les notifications
db.notifications.countDocuments()

// Notifications non lues
db.notifications.countDocuments({ lu: false })

// Notifications récentes
db.notifications.find().sort({ dateCreation: -1 }).limit(10).pretty()
```

---

## 📊 Checklist de Test Complète

### Phase 1: Tests Critiques (2-3h)

- [ ] 1.1 - Inscription utilisateur
- [ ] 1.2 - Connexion utilisateur
- [ ] 1.3 - Profil utilisateur
- [ ] 2.1 - Liste des boutiques
- [ ] 2.2 - Demande de création boutique
- [ ] 3.1 - Liste des produits
- [ ] 3.2 - Détails d'un produit
- [ ] 4.1 - Ajout au panier
- [ ] 4.2 - Validation du panier
- [ ] 5.1 - Consultation portefeuille
- [ ] 5.2 - Recharge portefeuille

### Phase 2: Tests Haute Priorité (3-4h)

- [ ] 2.3 - Validation demande boutique (Admin)
- [ ] 2.4 - Mes boutiques (Commerçant)
- [ ] 2.5 - Modification boutique
- [ ] 3.3 - Création de produit
- [ ] 3.4 - Modification de produit
- [ ] 3.5 - Gestion du stock
- [ ] 4.3 - Mes commandes
- [ ] 4.4 - Détails commande
- [ ] 6.1 - Réception notifications
- [ ] 6.2 - Marquer comme lu
- [ ] 7.1 - Gestion étages (Admin)
- [ ] 7.2 - Gestion espaces (Admin)

### Phase 3: Tests Moyenne Priorité (2-3h)

- [ ] 3.6 - Recherche de produits
- [ ] 3.7 - Filtrage par type
- [ ] 5.3 - Historique transactions
- [ ] 5.4 - Statistiques portefeuille
- [ ] 6.3 - Compteur notifications
- [ ] 7.3 - Statistiques infrastructure
- [ ] 8.1 - Création demande location
- [ ] 8.2 - Mes demandes
- [ ] 9.1 - Paiement de loyer
- [ ] 9.2 - Historique loyers
- [ ] 9.3 - Consultation factures

### Phase 4: Tests Transversaux (2-3h)

- [ ] 10.1 - Recherche globale
- [ ] 10.2 - Filtres avancés
- [ ] 10.3 - Pagination
- [ ] 10.4 - Gestion des erreurs
- [ ] 10.5 - Responsive design
- [ ] 10.6 - Performance

---

## 🐛 Résolution de Problèmes

### Problème: Backend ne répond pas

**Solution:**
1. Vérifier que Render est en ligne: https://m1p13mean-niaina-1.onrender.com/health
2. Vérifier les logs Render: https://dashboard.render.com
3. Attendre 1-2 minutes (cold start possible)

### Problème: Frontend ne charge pas

**Solution:**
1. Vérifier que Vercel est en ligne
2. Vider le cache du navigateur (Ctrl+Shift+Delete)
3. Vérifier le dernier déploiement: https://vercel.com/dashboard

### Problème: Erreur CORS

**Solution:**
1. Vérifier que l'origine est autorisée dans le backend
2. Vérifier les headers dans DevTools > Network
3. Contacter l'administrateur si persistant

### Problème: MongoDB non accessible

**Solution:**
1. Vérifier Network Access dans MongoDB Atlas
2. Ajouter 0.0.0.0/0 temporairement pour test
3. Vérifier la chaîne de connexion MONGODB_URI

---

## 📞 Support

**En cas de problème:**

1. **Vérifier les logs:**
   - Backend: https://dashboard.render.com
   - Frontend: https://vercel.com/dashboard
   - MongoDB: https://cloud.mongodb.com

2. **Consulter la documentation:**
   - `mall-app/docs/` - Documentation technique
   - `PLAN-TEST-FONCTIONNALITES.md` - Scénarios détaillés

3. **Contacter l'équipe:**
   - Créer une issue sur GitHub
   - Inclure les logs d'erreur
   - Décrire les étapes de reproduction

---

## ✅ Validation Finale

**L'application est considérée comme fonctionnelle si:**

- ✅ Tests automatisés > 85% de réussite
- ✅ Parcours utilisateur principal fonctionne
- ✅ Pas d'erreurs critiques dans les logs
- ✅ Données correctement enregistrées dans MongoDB
- ✅ Interface responsive sur mobile/desktop

---

**Bonne chance pour les tests! 🚀**

*Document créé le: 6 février 2026*  
*Version: 1.0*
