# 🚀 GUIDE RAPIDE DE TEST

## 🔑 Comptes de test
- **Admin** : `admin@mall.com` / `Admin123456!`
- **Commerçant** : `commercant@test.com` / `Commercant123456!`
- **Acheteur** : `client@test.com` / `Client123456!`

**URL** : http://localhost:4200

---

## ✅ CHECKLIST DE TEST

### 1. 🔔 NOTIFICATIONS (tous rôles)
**URL** : `/[role]/notifications`

```
☐ Voir la liste des notifications
☐ Marquer une notification comme lue (✓)
☐ Marquer toutes comme lues (✓ en haut)
☐ Archiver une notification (🗄️)
☐ Vérifier que la notification disparaît
☐ Tester la pagination
```

---

### 2. 💰 PORTEFEUILLE (tous rôles)
**URL** : `/[role]/porte-feuille`

```
☐ Voir le solde actuel (carte violette)
☐ Voir les statistiques (total reçu/envoyé)
☐ Cliquer sur "Toutes" → Voir toutes les transactions
☐ Cliquer sur "Achats" → Filtrer par achats
☐ Cliquer sur "Loyers" → Filtrer par loyers
☐ Cliquer sur "Recharges" → Filtrer par recharges
☐ Tester la pagination (Précédent/Suivant)
☐ Vérifier les icônes (↓ vert = reçu, ↑ rouge = envoyé)
```

---

### 3. 💳 LOYERS (commerçant)
**URL** : `/commercant/ma-boutique/loyers`

```
☐ Voir vos boutiques à gauche avec loyers
☐ Voir le calendrier à droite (6 passés + courant + 12 futurs)
☐ Sélectionner 1 boutique (checkbox)
☐ Sélectionner 1 mois (cliquez sur la carte)
☐ Voir le résumé en bas (montant total)
☐ Cliquer "Payer maintenant"
☐ Vérifier que le paiement est effectué
☐ Vérifier que le mois devient "payé" (compteur)
☐ Essayer de payer à nouveau → Doit être bloqué
☐ Tester multi-paiement (2 boutiques × 3 mois)
☐ Voir l'historique en bas de page
```

**Test avancé** :
```
☐ Sélectionner 1 mois → Voir les icônes sur les boutiques (✅/⚠️)
☐ Sélectionner un mois déjà payé → Voir l'icône 🔒
☐ Essayer de cliquer sur un mois 🔒 → Message d'alerte
```

---

### 4. 🛒 GESTION ACHATS (commerçant)
**URL** : `/commercant/ma-boutique/gestion-achats`

```
☐ Voir la liste des achats
☐ Vérifier les infos client (nom, email, téléphone)
☐ Vérifier les détails (produit, quantité, prix)
☐ Tester la pagination
```

**Pour créer un achat test** :
```
1. Déconnectez-vous
2. Connectez-vous avec client@test.com
3. Allez sur /acheteur/all-boutiques
4. Cliquez sur une boutique du commerçant
5. Ajoutez des produits au panier
6. Payez
7. Reconnectez-vous avec commercant@test.com
8. Vérifiez que l'achat apparaît
```

---

### 5. 🏬 BOUTIQUES (acheteur)
**URL** : `/acheteur/all-boutiques`

```
☐ Voir la grille de boutiques
☐ Cliquer sur une boutique
☐ Voir les produits de la boutique
```

---

### 6. 🛍️ PANIER D'ACHAT (acheteur)
**URL** : `/acheteur/boutique/:id`

```
☐ Voir les produits disponibles
☐ Voir votre solde en haut
☐ Ajouter un produit au panier (bouton "Ajouter")
☐ Voir le panier apparaître à droite
☐ Modifier la quantité (+/-)
☐ Retirer un produit (×)
☐ Voir le total se mettre à jour
☐ Cliquer "Payer"
☐ Vérifier que le paiement est effectué
☐ Vérifier que votre solde a diminué
☐ Aller sur /acheteur/porte-feuille
☐ Vérifier que la transaction apparaît
```

**Test solde insuffisant** :
```
☐ Ajouter beaucoup de produits (total > solde)
☐ Essayer de payer
☐ Vérifier le message d'erreur
```

---

## 🎯 SCÉNARIO COMPLET E2E

### Scénario : Achat complet avec paiement de loyer

```
1. ACHETEUR achète des produits
   ☐ Login client@test.com
   ☐ /acheteur/all-boutiques
   ☐ Cliquer sur une boutique
   ☐ Ajouter 2-3 produits au panier
   ☐ Payer (ex: 50€)
   ☐ Noter le nouveau solde

2. COMMERÇANT voit l'achat
   ☐ Login commercant@test.com
   ☐ /commercant/ma-boutique/gestion-achats
   ☐ Vérifier que l'achat apparaît
   ☐ Noter les détails client

3. COMMERÇANT consulte son portefeuille
   ☐ /commercant/porte-feuille
   ☐ Vérifier que le solde a augmenté (+50€)
   ☐ Voir la transaction "Achat" dans l'historique
   ☐ Filtrer par "Achats"

4. COMMERÇANT paie un loyer
   ☐ /commercant/ma-boutique/loyers
   ☐ Sélectionner 1 boutique
   ☐ Sélectionner le mois courant
   ☐ Payer (ex: 1200€)
   ☐ Vérifier le paiement

5. COMMERÇANT vérifie son portefeuille
   ☐ /commercant/porte-feuille
   ☐ Vérifier que le solde a diminué (-1200€)
   ☐ Voir la transaction "Loyer" dans l'historique
   ☐ Filtrer par "Loyers"
   ☐ Voir les statistiques (total reçu/envoyé)

6. ACHETEUR vérifie son portefeuille
   ☐ Login client@test.com
   ☐ /acheteur/porte-feuille
   ☐ Vérifier que le solde a diminué (-50€)
   ☐ Voir la transaction "Achat" dans l'historique
```

---

## 🐛 TESTS DE BUGS CONNUS (corrigés)

### ✅ Double paiement loyer (CORRIGÉ)
```
☐ Payer un loyer pour avril 2026
☐ Essayer de payer à nouveau
☐ Vérifier que c'est bloqué (message d'alerte)
```

### ✅ Navbar cache le contenu (CORRIGÉ)
```
☐ Aller sur n'importe quelle page
☐ Vérifier que le contenu n'est pas caché sous la navbar
```

### ✅ Détection paiements loyers (CORRIGÉ)
```
☐ Payer un loyer
☐ Recharger la page /commercant/ma-boutique/loyers
☐ Vérifier que le mois est bien marqué comme "payé"
```

---

## 📊 RÉSULTATS ATTENDUS

### Notifications
- ✅ Archivage fonctionne
- ✅ Compteur se met à jour
- ✅ Pagination fonctionne

### Portefeuille
- ✅ Statistiques affichées
- ✅ Filtres fonctionnent
- ✅ Historique complet
- ✅ Pagination fonctionne

### Loyers
- ✅ Détection paiements correcte
- ✅ Anti-doublon actif
- ✅ Multi-paiement fonctionne
- ✅ Indicateurs visuels clairs

### Achats
- ✅ Panier fonctionne
- ✅ Paiement fonctionne
- ✅ Stock mis à jour
- ✅ Commerçant voit l'achat

---

## 🆘 EN CAS DE PROBLÈME

### Serveurs non lancés
```bash
# Terminal 1 - Backend
cd mall-app/backend
node server.js

# Terminal 2 - Frontend
cd mall-app/frontend
npm start
```

### Erreur 401 (Non authentifié)
```
→ Reconnectez-vous
→ Vérifiez que le token n'a pas expiré
```

### Erreur 403 (Non autorisé)
```
→ Vérifiez que vous utilisez le bon compte
→ Admin pour /admin/*
→ Commercant pour /commercant/*
→ Acheteur pour /acheteur/*
```

### Erreur 400 (Solde insuffisant)
```
→ Créditez le compte avec le script :
cd mall-app/backend
node scripts/crediter-commercant-1200.js
```

### Page blanche
```
→ F12 → Console → Vérifiez les erreurs
→ Vérifiez que le backend répond (http://localhost:5000)
```

---

**Temps de test estimé** : 30-45 minutes pour tout tester  
**Dernière mise à jour** : 1er mars 2026
