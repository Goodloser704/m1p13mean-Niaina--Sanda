# Fix: Loyers payés au mauvais compte admin

## Problème identifié

Lorsqu'un commerçant payait un loyer, le montant était bien déduit de son portefeuille et une transaction était créée, MAIS:
- Le montant n'apparaissait pas dans le portefeuille de `admin@mall.com`
- Aucune transaction n'apparaissait dans l'historique de `admin@mall.com`

## Cause racine

La base de données contenait **21 comptes admin différents**:
- `admin-1770270669586@example.com` (créé en premier)
- `admin@mall.com` (compte principal utilisé par l'utilisateur)
- 19 autres comptes admin de test

Le code dans `loyerController.js` utilisait:
```javascript
const adminUser = await User.findOne({ role: 'Admin' });
```

Cette requête retournait **le premier admin trouvé** (par ordre de création), qui était `admin-1770270669586@example.com`, PAS `admin@mall.com`.

Résultat: Tous les loyers étaient payés au portefeuille du premier admin, pas celui de `admin@mall.com`.

## Vérification du problème

Test effectué avec `mall-app/backend/scripts/test-admin-portefeuille.js`:
```
✅ Admin trouvé: admin-1770270669586@example.com
💰 Portefeuille admin: 69842fd059958b13c65dff97
   Solde: 25200€
📥 Transactions VERS admin: 26
```

Le premier admin avait bien reçu 25200€ en loyers, mais `admin@mall.com` n'avait rien reçu.

## Solution appliquée

Modification de `mall-app/backend/controllers/loyerController.js` ligne ~140:

**AVANT:**
```javascript
const adminUser = await require('../models/User').findOne({ role: 'Admin' });
```

**APRÈS:**
```javascript
// Utiliser admin@mall.com comme compte principal pour les loyers
let adminUser = await require('../models/User').findOne({ 
  email: 'admin@mall.com' 
});
if (!adminUser) {
  console.log(`❌ Compte admin principal (admin@mall.com) non trouvé`);
  // Fallback sur n'importe quel admin
  adminUser = await require('../models/User').findOne({ role: 'Admin' });
  if (!adminUser) {
    return res.status(500).json({ 
      message: 'Erreur système: compte administrateur non trouvé' 
    });
  }
  console.log(`⚠️  Utilisation de ${adminUser.email} comme admin de secours`);
} else {
  console.log(`✅ Utilisation de admin@mall.com pour recevoir le loyer`);
}
```

## Changements supplémentaires

### Auto-sélection du mois courant
Confirmé que l'auto-sélection du mois courant a déjà été désactivée dans `loyers.ts`:
```typescript
// NE PAS sélectionner le mois courant par défaut
// L'utilisateur doit choisir manuellement
```

## Test de la solution

Pour tester:
1. Redémarrer le backend (le serveur doit être redémarré manuellement)
2. Se connecter en tant que commerçant
3. Aller dans "Mes boutiques" → Choisir une boutique → "Loyers"
4. Sélectionner un mois futur et payer
5. Se connecter en tant que `admin@mall.com`
6. Aller dans "Portefeuille"
7. Vérifier que:
   - Le solde a augmenté
   - Une nouvelle transaction de type "Loyer" apparaît dans l'historique

## Scripts de diagnostic créés

1. `mall-app/backend/scripts/test-admin-portefeuille.js` - Vérifie les transactions et soldes admin
2. `mall-app/backend/scripts/list-admins.js` - Liste tous les comptes admin

## Recommandations

1. **Nettoyer les comptes admin de test** - Supprimer les 20 comptes admin inutiles
2. **Utiliser une variable d'environnement** - Définir `ADMIN_EMAIL=admin@mall.com` dans `.env`
3. **Ajouter un index unique** - Empêcher la création de multiples admins à l'avenir

## Fichiers modifiés

- `mall-app/backend/controllers/loyerController.js` - Fix du compte admin destinataire
- `mall-app/backend/scripts/test-admin-portefeuille.js` - Nouveau script de diagnostic
- `mall-app/backend/scripts/list-admins.js` - Nouveau script de diagnostic
- `FIX-LOYERS-ADMIN-PORTEFEUILLE.md` - Cette documentation

## État

✅ **RÉSOLU** - Les nouveaux paiements de loyer seront crédités à `admin@mall.com`

⚠️ **NOTE**: Les anciens paiements (25200€) restent dans le portefeuille du premier admin. Si nécessaire, créer un script de migration pour transférer ces montants.
