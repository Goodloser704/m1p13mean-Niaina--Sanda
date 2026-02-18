# 👥 Comptes de Test - Mall Management App

**⚠️ IMPORTANT:** Ces comptes sont pour les tests uniquement. Ne pas utiliser en production réelle.

---

## 🔐 Comptes Disponibles

### 1️⃣ Compte Admin

**Rôle:** Administrateur du centre commercial

**Identifiants:**
```
Email: admin@mallapp.com
Mot de passe: admin123
```

**Permissions:**
- ✅ Gestion des étages et espaces
- ✅ Validation des demandes de location
- ✅ Gestion de toutes les boutiques
- ✅ Accès aux statistiques globales
- ✅ Gestion des utilisateurs

**Utilisation:**
```
1. Aller sur https://m1p13mean-niaina-xjl4.vercel.app
2. Cliquer sur "Se connecter"
3. Entrer les identifiants ci-dessus
4. Accéder au dashboard admin
```

---

### 2️⃣ Compte Client

**Rôle:** Client / Acheteur

**Identifiants:**
```
Email: client@test.com
Mot de passe: Client123456!
```

**Permissions:**
- ✅ Parcourir les boutiques et produits
- ✅ Ajouter au panier et acheter
- ✅ Gérer son portefeuille
- ✅ Voir ses commandes
- ✅ Faire des demandes de location
- ✅ Recevoir des notifications

**Utilisation:**
```
1. Aller sur https://m1p13mean-niaina-xjl4.vercel.app
2. Cliquer sur "Se connecter"
3. Entrer les identifiants ci-dessus
4. Parcourir et acheter des produits
```

---

### 3️⃣ Compte Commerçant

**Rôle:** Propriétaire de boutique

**Identifiants:**
```
Email: commercant@test.com
Mot de passe: Commercant123456!
```

**Permissions:**
- ✅ Gérer ses boutiques
- ✅ Ajouter/modifier/supprimer des produits
- ✅ Gérer les stocks
- ✅ Voir les ventes
- ✅ Payer les loyers
- ✅ Recevoir des notifications de vente

**Utilisation:**
```
1. Aller sur https://m1p13mean-niaina-xjl4.vercel.app
2. Cliquer sur "Se connecter"
3. Entrer les identifiants ci-dessus
4. Gérer ses boutiques et produits
```

---

## 🆕 Créer un Nouveau Compte de Test

### Inscription Manuelle

**Étapes:**
1. Aller sur https://m1p13mean-niaina-xjl4.vercel.app
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire:
   ```
   Nom: Test User [Votre Nom]
   Email: test[numero]@example.com
   Mot de passe: Test123456!
   Rôle: client
   ```
4. Soumettre
5. Se connecter avec les nouveaux identifiants

### Inscription via API

**Avec curl:**
```bash
curl -X POST https://m1p13mean-niaina-1.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "newtest@example.com",
    "password": "Test123456!",
    "role": "client"
  }'
```

**Avec Postman:**
```
POST https://m1p13mean-niaina-1.onrender.com/api/auth/register
Content-Type: application/json

{
  "nom": "Test User",
  "email": "newtest@example.com",
  "password": "Test123456!",
  "role": "client"
}
```

---

## 🔄 Scénarios de Test par Rôle

### Scénario 1: Parcours Client Complet

**Compte:** client@test.com

**Étapes:**
1. ✅ Se connecter
2. ✅ Parcourir les boutiques
3. ✅ Voir les produits d'une boutique
4. ✅ Ajouter 3 produits au panier
5. ✅ Voir le panier
6. ✅ Vérifier le portefeuille
7. ✅ Recharger le portefeuille (100000 Ar)
8. ✅ Valider l'achat
9. ✅ Voir la commande dans "Mes Commandes"
10. ✅ Vérifier les notifications
11. ✅ Télécharger la facture

**Durée estimée:** 10 minutes

---

### Scénario 2: Parcours Commerçant Complet

**Compte:** commercant@test.com

**Étapes:**
1. ✅ Se connecter
2. ✅ Aller dans "Mes Boutiques"
3. ✅ Ajouter un nouveau produit
4. ✅ Modifier le stock d'un produit
5. ✅ Modifier les informations d'un produit
6. ✅ Voir les ventes
7. ✅ Vérifier les notifications de vente
8. ✅ Aller dans "Mes Loyers"
9. ✅ Payer le loyer du mois
10. ✅ Voir l'historique des loyers

**Durée estimée:** 15 minutes

---

### Scénario 3: Parcours Admin Complet

**Compte:** admin@mall.com

**Étapes:**
1. ✅ Se connecter
2. ✅ Aller dans "Gestion Étages"
3. ✅ Créer un nouvel étage
4. ✅ Aller dans "Gestion Espaces"
5. ✅ Créer un nouvel espace
6. ✅ Aller dans "Demandes de Location"
7. ✅ Valider une demande en attente
8. ✅ Vérifier que la boutique est créée
9. ✅ Voir les statistiques globales
10. ✅ Vérifier les notifications

**Durée estimée:** 15 minutes

---

## 🧪 Tests d'Authentification

### Test 1: Connexion Valide

**Compte:** client@test.com  
**Résultat attendu:** ✅ Connexion réussie, redirection vers dashboard

### Test 2: Connexion Invalide

**Email:** wrong@test.com  
**Password:** WrongPassword123!  
**Résultat attendu:** ❌ Message "Email ou mot de passe incorrect"

### Test 3: Inscription Doublon

**Email:** client@test.com (déjà existant)  
**Résultat attendu:** ❌ Message "Email déjà utilisé"

### Test 4: Mot de Passe Faible

**Password:** 123  
**Résultat attendu:** ❌ Message "Mot de passe trop faible"

### Test 5: Déconnexion

**Action:** Cliquer sur "Déconnexion"  
**Résultat attendu:** ✅ Redirection vers page d'accueil, token supprimé

---

## 🔑 Tokens d'Authentification

### Obtenir un Token

**Via API:**
```bash
curl -X POST https://m1p13mean-niaina-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@test.com",
    "password": "Client123456!"
  }'
```

**Réponse:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "nom": "Client Test",
    "email": "client@test.com",
    "role": "client"
  }
}
```

### Utiliser un Token

**Dans les requêtes API:**
```bash
curl -X GET https://m1p13mean-niaina-1.onrender.com/api/portefeuille/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Dans le navigateur:**
- Le token est automatiquement stocké dans `localStorage`
- Clé: `token` ou `authToken`
- Visible dans DevTools > Application > Local Storage

---

## 🗄️ Données de Test dans MongoDB

### Vérifier les Comptes

**Dans MongoDB Atlas:**
```javascript
// Voir tous les utilisateurs de test
db.users.find({
  email: { $regex: /test\.com$/ }
}).pretty()

// Compter par rôle
db.users.countDocuments({ role: "client" })
db.users.countDocuments({ role: "commercant" })
db.users.countDocuments({ role: "admin" })
```

### Réinitialiser un Compte

**Supprimer un utilisateur de test:**
```javascript
db.users.deleteOne({ email: "client@test.com" })
db.portefeuilles.deleteOne({ utilisateur: ObjectId("...") })
```

**Réinitialiser le portefeuille:**
```javascript
db.portefeuilles.updateOne(
  { utilisateur: ObjectId("...") },
  { $set: { solde: 0 } }
)
```

---

## ⚠️ Sécurité

### ❌ NE PAS FAIRE

- ❌ Utiliser ces comptes en production
- ❌ Partager les mots de passe publiquement
- ❌ Stocker des données sensibles réelles
- ❌ Utiliser des emails personnels pour les tests

### ✅ BONNES PRATIQUES

- ✅ Utiliser uniquement pour les tests
- ✅ Changer les mots de passe régulièrement
- ✅ Supprimer les données de test après utilisation
- ✅ Utiliser des emails de test (@example.com, @test.com)
- ✅ Documenter les tests effectués

---

## 📞 Support

**Problème de connexion?**

1. Vérifier que le backend est en ligne: https://m1p13mean-niaina-1.onrender.com/health
2. Vérifier les identifiants (copier-coller)
3. Vider le cache du navigateur
4. Essayer en navigation privée
5. Vérifier les logs dans DevTools > Console

**Compte bloqué?**

1. Attendre 5 minutes (rate limiting)
2. Essayer un autre compte
3. Créer un nouveau compte de test
4. Contacter l'administrateur

---

## 📝 Notes

**Dernière mise à jour:** 6 février 2026  
**Version:** 1.0  
**Environnement:** Production (Vercel + Render + MongoDB Atlas)

**Comptes créés:**
- ✅ admin@mallapp.com (Admin) - mdp: admin123
- ✅ client@test.com (Client) - mdp: Client123456!
- ✅ commercant@test.com (Commerçant) - mdp: Commercant123456!

**Statut:** Actifs et fonctionnels

---

**Bon test! 🚀**
