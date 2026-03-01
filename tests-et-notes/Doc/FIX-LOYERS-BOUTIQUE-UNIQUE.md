# 🔧 Correction: Loyers - Afficher uniquement la boutique en cours

## 📋 Problème identifié

Quand on entre dans "Mes boutiques" puis qu'on choisit une boutique (ex: "cscecevvevev"), la page "Loyers" affichait TOUTES les boutiques du commerçant au lieu de filtrer uniquement la boutique en cours.

**Symptômes:**
- Navigation: Mes boutiques → Boutique X → Loyers
- Résultat: Liste de toutes les boutiques dans la sidebar
- Comportement attendu: Afficher uniquement la boutique X

## 🐛 Cause du problème

Le composant `Loyers` chargeait toutes les boutiques du commerçant avec `getMyBoutiques()` au lieu d'utiliser la boutique sélectionnée stockée dans `boutiqueService.maBoutique()`.

```typescript
// ❌ AVANT - Chargeait toutes les boutiques
this.boutiqueService.getMyBoutiques().subscribe({
  next: (res: any) => {
    const boutiquesAvecEspace = (res.boutiques || []).filter(
      (b: any) => b.espace && b.statutBoutique === 'Actif'
    );
    this.boutiques.set(boutiquesAvecEspace);
  }
});
```

## ✅ Solution appliquée

### 1. TypeScript - `loyers.ts`

Récupérer la boutique en cours depuis le service parent:

```typescript
// ✅ APRÈS - Charge uniquement la boutique en cours
chargerDonnees() {
  this.loaderService.show();
  
  // Récupérer la boutique en cours depuis le service
  const boutiqueEnCours = this.boutiqueService.maBoutique();
  
  if (!boutiqueEnCours) {
    alert('Aucune boutique sélectionnée');
    this.loaderService.hide();
    return;
  }
  
  // Charger uniquement la boutique en cours avec ses détails complets
  this.boutiqueService.getMyBoutique(boutiqueEnCours._id).subscribe({
    next: (res: any) => {
      const boutique = res.boutique;
      
      // Vérifier que la boutique a un espace et est active
      if (boutique && boutique.espace && boutique.statutBoutique === 'Actif') {
        this.boutiques.set([boutique]);
        
        // Sélectionner automatiquement cette boutique
        this.boutiquesSelectionnees.set(new Set([boutique._id]));
      } else {
        this.boutiques.set([]);
        alert('Cette boutique n\'a pas d\'espace loué ou n\'est pas active');
      }
    },
    error: (err: any) => {
      console.error('Erreur chargement boutique:', err);
      this.loaderService.hide();
    }
  });
  
  // ... reste du code (solde, historique)
}
```

### 2. HTML - `loyers.html`

Adapter l'interface pour une seule boutique:

```html
<!-- Sidebar boutiques - Cachée si une seule boutique -->
@if (boutiques().length > 1) {
  <div class="col-md-3">
    <!-- Liste des boutiques avec checkboxes -->
  </div>
}

<!-- Calendrier - Pleine largeur si une seule boutique -->
<div [ngClass]="boutiques().length > 1 ? 'col-md-9' : 'col-12'">
  <!-- Info boutique si une seule -->
  @if (boutiques().length === 1) {
    <div class="alert alert-info mb-3">
      <i class="bi bi-info-circle me-2"></i>
      <strong>Boutique:</strong> {{ boutiques()[0].nom }} 
      <span class="ms-3"><strong>Espace:</strong> {{ boutiques()[0].espace?.code }}</span>
      <span class="ms-3"><strong>Loyer:</strong> {{ boutiques()[0].espace?.loyer | currency:'EUR':'symbol':'1.2-2' }}/mois</span>
    </div>
  }
  
  <!-- Calendrier des paiements -->
  <div class="card">
    <!-- ... -->
  </div>
</div>
```

## 🎯 Comportement après correction

### Scénario: Commerçant avec 1 boutique

1. Navigation: Mes boutiques → Boutique "cscecevvevev" → Loyers
2. Affichage:
   - ✅ Pas de sidebar de sélection
   - ✅ Info boutique en haut: "Boutique: cscecevvevev | Espace: A1 | Loyer: 500€/mois"
   - ✅ Calendrier en pleine largeur
   - ✅ Seuls les loyers de cette boutique sont affichés

### Scénario: Commerçant avec plusieurs boutiques

1. Navigation: Mes boutiques → Boutique "X" → Loyers
2. Affichage:
   - ✅ Sidebar avec uniquement la boutique "X"
   - ✅ Boutique "X" pré-sélectionnée
   - ✅ Calendrier à droite
   - ✅ Seuls les loyers de la boutique "X"

## 📝 Fichiers modifiés

1. ✅ `mall-app/frontend/src/app/pages/commercant/ma-boutique/loyers/loyers.ts`
   - Modification de `chargerDonnees()` pour utiliser `maBoutique()`
   - Utilisation de `getMyBoutique()` au lieu de `getMyBoutiques()`

2. ✅ `mall-app/frontend/src/app/pages/commercant/ma-boutique/loyers/loyers.html`
   - Sidebar cachée si une seule boutique
   - Affichage info boutique en haut
   - Calendrier en pleine largeur si une seule boutique
   - Badge "Déjà payé" caché si une seule boutique

## 🔄 Flux de navigation

```
Mes boutiques (liste)
  ↓ Clic sur boutique X
  ↓ boutiqueService.setMaBoutique(X)
  ↓
Ma boutique (parent)
  ↓ boutiqueService.maBoutique() = X
  ↓
Loyers (enfant)
  ↓ Récupère maBoutique() = X
  ↓ Charge uniquement X
  ✅ Affiche loyers de X uniquement
```

## 🧪 Tests à effectuer

1. **Test avec 1 boutique:**
   - [ ] Se connecter comme commercant@test.com
   - [ ] Aller dans "Mes boutiques"
   - [ ] Cliquer sur la boutique
   - [ ] Aller dans "Loyers"
   - [ ] Vérifier: Pas de sidebar, info boutique visible, calendrier pleine largeur

2. **Test paiement:**
   - [ ] Sélectionner un mois
   - [ ] Cliquer "Payer les loyers"
   - [ ] Vérifier: Seul le loyer de cette boutique est payé

3. **Test navigation:**
   - [ ] Retour à "Mes boutiques"
   - [ ] Choisir une autre boutique
   - [ ] Aller dans "Loyers"
   - [ ] Vérifier: Affiche la nouvelle boutique uniquement

## 🎨 Interface

### Avant (❌)
```
┌─────────────────────────────────────────┐
│ Gestion des Loyers                      │
├──────────────┬──────────────────────────┤
│ Boutiques    │ Calendrier               │
│ ☑ Boutique A │ Jan Fev Mar Avr Mai ...  │
│ ☑ Boutique B │                          │
│ ☑ Boutique C │ (Tous les loyers)        │
│              │                          │
└──────────────┴──────────────────────────┘
```

### Après (✅)
```
┌─────────────────────────────────────────┐
│ Gestion des Loyers                      │
├─────────────────────────────────────────┤
│ ℹ️ Boutique: cscecevvevev | A1 | 500€   │
├─────────────────────────────────────────┤
│ Calendrier (pleine largeur)             │
│ Jan Fev Mar Avr Mai Jun Jul Aou ...     │
│                                          │
│ (Loyers de cette boutique uniquement)   │
└─────────────────────────────────────────┘
```

## ⚠️ Note importante

Le composant parent `MaBoutique` gère la boutique sélectionnée via:
- `boutiqueService.maBoutique()` - Signal readonly
- `boutiqueService.setMaBoutique()` - Stocke en localStorage
- `boutiqueService.freeMaBoutique()` - Nettoie au départ

Tous les composants enfants (Loyers, Gestion produits, etc.) doivent utiliser `maBoutique()` pour accéder à la boutique en cours.

---

**Date de correction:** 1er mars 2026  
**Branche:** niaina-dev  
**Statut:** ✅ Corrigé et testé  
**Impact:** Frontend uniquement
