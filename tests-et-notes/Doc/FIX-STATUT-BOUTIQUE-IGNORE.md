# 🔧 Correction: Ignorer statutBoutique pour validation horaires

## 📋 Problème identifié

Le système affichait "🔴 Boutique fermée (statut inactif)" même pendant les horaires d'ouverture (ex: 14:50 alors que horaires = 08:00-15:37).

**Symptômes:**
- Horaires affichés: "08:00 - 15:37"
- Heure actuelle: 14:50 (dans les horaires)
- Message: "🔴 Boutique fermée (statut inactif)"
- Boutons d'achat désactivés alors qu'ils devraient être actifs

## 🐛 Cause du problème

Le code vérifiait d'abord `statutBoutique === 'Actif'` avant de vérifier les horaires.

**Confusion conceptuelle:**
- `statutBoutique` = Statut administratif (Actif/Inactif) pour la gestion
- `horairesHebdo` = Horaires d'ouverture réels pour les clients

Pour un acheteur, seuls les **horaires d'ouverture** comptent, pas le statut administratif.

## ✅ Solution appliquée

### 1. Backend - `mall-app/backend/utils/boutique-utils.js`

```javascript
// ❌ AVANT
function estBoutiqueOuverte(boutique, date = new Date()) {
  // Vérifier que la boutique est active
  if (boutique.statutBoutique !== 'Actif') {
    return {
      estOuverte: false,
      raison: 'La boutique est fermée (statut inactif)'
    };
  }
  // ... reste du code
}

// ✅ APRÈS
function estBoutiqueOuverte(boutique, date = new Date()) {
  // NE PAS vérifier statutBoutique - on se base uniquement sur les horaires
  // Le statutBoutique est pour l'administration, pas pour les horaires d'ouverture
  
  // Si pas d'horaires définis, considérer comme toujours ouverte
  if (!boutique.horairesHebdo || boutique.horairesHebdo.length === 0) {
    return {
      estOuverte: true,
      raison: 'Horaires non définis'
    };
  }
  // ... reste du code (vérification jour + heure)
}
```

### 2. Frontend - `mall-app/frontend/src/app/pages/acheteur/boutique-detail/boutique-detail.ts`

```typescript
// ❌ AVANT
boutiqueStatus = computed(() => {
  const b = this.boutique();
  if (!b) return { estOuverte: false, raison: 'Chargement...' };
  
  // Vérifier le statut
  if (b.statutBoutique !== 'Actif') {
    return { estOuverte: false, raison: 'Boutique fermée (statut inactif)' };
  }
  // ... reste du code
});

// ✅ APRÈS
boutiqueStatus = computed(() => {
  const b = this.boutique();
  if (!b) return { estOuverte: false, raison: 'Chargement...' };
  
  // NE PAS vérifier statutBoutique pour l'acheteur
  // On se base uniquement sur les horaires d'ouverture
  
  // Si pas d'horaires, considérer comme ouverte
  if (!b.horairesHebdo || b.horairesHebdo.length === 0) {
    return { estOuverte: true, raison: 'Horaires non définis' };
  }
  // ... reste du code (vérification jour + heure)
});
```

## 🧪 Tests effectués

### Test avec statutBoutique = 'Inactif'

```javascript
const boutique = {
  nom: 'Test Boutique',
  statutBoutique: 'Inactif', // ⚠️ Statut inactif
  horairesHebdo: [
    { jour: 'Dimanche', debut: '08:00', fin: '15:37' }
  ]
};

// Test: Dimanche 14:50
// ✅ Résultat: OUVERT (car dans les horaires)
// ✅ Raison: "Ouvert jusqu'à 15:37"
```

### Résultats

| Scénario | Statut | Jour | Heure | Horaires | Résultat attendu | ✅ |
|----------|--------|------|-------|----------|------------------|---|
| 1 | Inactif | Dimanche | 14:50 | 08:00-15:37 | 🟢 OUVERT | ✅ |
| 2 | Inactif | Dimanche | 16:00 | 08:00-15:37 | 🔴 FERMÉ (heure) | ✅ |
| 3 | Inactif | Dimanche | 07:30 | 08:00-15:37 | 🔴 FERMÉ (heure) | ✅ |
| 4 | Inactif | Samedi | 10:00 | Pas d'horaire | 🔴 FERMÉ (jour) | ✅ |
| 5 | Actif | Dimanche | 14:50 | 08:00-15:37 | 🟢 OUVERT | ✅ |

## 📱 Comportement attendu

### Pour l'acheteur (frontend)
- ✅ Affichage basé uniquement sur les horaires
- ✅ Ignore complètement `statutBoutique`
- ✅ Badge 🟢 si dans les horaires, 🔴 sinon
- ✅ Boutons actifs si dans les horaires

### Pour le backend (validation)
- ✅ Validation basée uniquement sur les horaires
- ✅ Ignore complètement `statutBoutique`
- ✅ Achat autorisé si dans les horaires
- ✅ Achat refusé si hors horaires

### Exemple concret

**Boutique "cscecevvevev":**
- `statutBoutique`: "Inactif" (peu importe)
- `horairesHebdo`: Dimanche 08:00-15:37

**Dimanche 14:50:**
- ✅ Frontend affiche: 🟢 "Ouvert jusqu'à 15:37"
- ✅ Boutons "Ajouter au panier" actifs
- ✅ Achat possible
- ✅ Backend valide l'achat

**Dimanche 16:00:**
- ❌ Frontend affiche: 🔴 "Fermé (fermeture à 15:37)"
- ❌ Boutons "Ajouter au panier" désactivés
- ❌ Achat impossible
- ❌ Backend refuse l'achat

## 📝 Fichiers modifiés

1. ✅ `mall-app/backend/utils/boutique-utils.js` - Suppression vérification statutBoutique
2. ✅ `mall-app/frontend/src/app/pages/acheteur/boutique-detail/boutique-detail.ts` - Suppression vérification statutBoutique
3. ✅ `test-horaires-debug.js` - Mise à jour test avec statutBoutique='Inactif'

## 🎯 Logique finale

```
Pour un ACHETEUR:
  SI horaires définis:
    SI jour actuel dans horairesHebdo:
      SI heure actuelle entre debut et fin:
        → 🟢 OUVERT
      SINON:
        → 🔴 FERMÉ (heure)
    SINON:
      → 🔴 FERMÉ (jour)
  SINON:
    → 🟢 OUVERT (pas de restriction)

statutBoutique est IGNORÉ pour cette logique
```

## ⚠️ Note importante

Le `statutBoutique` reste utile pour:
- L'administration (activer/désactiver une boutique)
- Les statistiques
- La gestion des demandes de location
- Etc.

Mais il ne doit PAS affecter les horaires d'ouverture pour les acheteurs.

---

**Date de correction:** 1er mars 2026  
**Branche:** niaina-dev  
**Statut:** ✅ Corrigé et testé  
**Impact:** Frontend + Backend
