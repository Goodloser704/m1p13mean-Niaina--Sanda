# 🧪 Guide de test: Validation horaires boutique

## 🚀 Démarrage rapide

### 1. Redémarrer le backend (IMPORTANT!)
```bash
cd mall-app/backend
# Arrêter le serveur actuel (Ctrl+C dans le terminal)
npm start
```

### 2. Vérifier que le frontend tourne
```bash
cd mall-app/frontend
npm start
# Devrait être sur http://localhost:4200
```

## 📋 Tests à effectuer

### Test 1: Vérifier l'affichage du statut

1. Se connecter comme acheteur:
   - Email: `client@test.com`
   - Mot de passe: `Client123456!`

2. Aller sur "Toutes les boutiques" (`/acheteur/all-boutiques`)

3. Cliquer sur une boutique (ex: "cscecevvevev")

4. **Vérifier l'affichage:**
   - [ ] Badge de statut visible (🟢 OUVERT ou 🔴 FERMÉ)
   - [ ] Message explicite (ex: "Ouvert jusqu'à 15:37" ou "Fermé le Dimanche")
   - [ ] Bouton "Voir les horaires" présent
   - [ ] Cliquer sur "Voir les horaires" → liste des 7 jours affichée

### Test 2: Tester les boutons d'achat

**Si boutique OUVERTE:**
- [ ] Boutons "Ajouter au panier" sont actifs (bleu)
- [ ] Cliquer sur "Ajouter au panier" → produit ajouté au panier
- [ ] Panier s'affiche sur le côté

**Si boutique FERMÉE:**
- [ ] Boutons "Ajouter au panier" sont grisés
- [ ] Texte du bouton: "Boutique fermée"
- [ ] Impossible de cliquer

### Test 3: Tester la validation backend

**Méthode 1: Via l'interface**
1. Ajouter des produits au panier (si boutique ouverte)
2. Attendre que la boutique ferme (ou modifier les horaires en DB)
3. Cliquer sur "Valider l'achat"
4. **Résultat attendu:** Message d'erreur "La boutique X est fermée. [Raison]"

**Méthode 2: Via script de test**
```bash
node test-horaires-boutique.js
```

**Résultat attendu:**
```
🔐 Connexion acheteur...
✅ Connecté

📋 Récupération des boutiques...
✅ Boutique trouvée: cscecevvevev

📅 Horaires:
   Lundi: 08:00 - 17:00
   Dimanche: 08:00 - 15:37

🛒 Test achat...
   Heure actuelle: Dimanche 14:39
✅ Achat réussi (boutique ouverte)
OU
❌ Achat refusé (boutique fermée)
   Erreur: La boutique "cscecevvevev" est fermée. Fermé (fermeture à 15:37)
```

### Test 4: Vérifier les logs backend

Dans le terminal du backend, chercher:
```
🕐 Vérification horaires: Dimanche 14:39 (1439) vs 08:00-15:37 (800-1537)
```

Vérifier que:
- [ ] Le jour est correct
- [ ] L'heure actuelle est au format HHMM (ex: 1439)
- [ ] Les heures début/fin sont correctes (ex: 800, 1537)

## 🎯 Scénarios de test complets

### Scénario A: Boutique ouverte
**Contexte:** Dimanche 14:39, horaire 08:00-15:37

1. [ ] Badge: 🟢 "Ouvert jusqu'à 15:37"
2. [ ] Boutons actifs
3. [ ] Achat possible
4. [ ] Panier fonctionne
5. [ ] Validation réussie

### Scénario B: Boutique fermée (heure)
**Contexte:** Dimanche 16:00, horaire 08:00-15:37

1. [ ] Badge: 🔴 "Fermé (fermeture à 15:37)"
2. [ ] Boutons grisés "Boutique fermée"
3. [ ] Impossible d'ajouter au panier
4. [ ] Si produits déjà dans panier → validation refusée

### Scénario C: Boutique fermée (jour)
**Contexte:** Samedi 10:00, pas d'horaire pour samedi

1. [ ] Badge: 🔴 "Fermé le Samedi"
2. [ ] Boutons grisés "Boutique fermée"
3. [ ] Impossible d'ajouter au panier

### Scénario D: Boutique pas encore ouverte
**Contexte:** Lundi 07:30, horaire 08:00-17:00

1. [ ] Badge: 🔴 "Ouvre à 08:00"
2. [ ] Boutons grisés "Boutique fermée"
3. [ ] Impossible d'ajouter au panier

## 🔧 Modifier les horaires pour tester

### Via MongoDB Compass ou script:

```javascript
// Exemple: Fermer la boutique maintenant
db.boutiques.updateOne(
  { nom: "cscecevvevev" },
  {
    $set: {
      "horairesHebdo": [
        { jour: "Dimanche", debut: "08:00", fin: "14:00" } // Fermé après 14h
      ]
    }
  }
);
```

### Ou créer un script de test:

```javascript
// test-modifier-horaires.js
const mongoose = require('mongoose');
require('dotenv').config({ path: './mall-app/backend/.env' });

mongoose.connect(process.env.MONGODB_URI);

const Boutique = require('./mall-app/backend/models/Boutique');

async function modifierHoraires() {
  const boutique = await Boutique.findOne({ nom: 'cscecevvevev' });
  
  // Fermer maintenant
  const now = new Date();
  const heureActuelle = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  boutique.horairesHebdo = [
    { jour: 'Dimanche', debut: '08:00', fin: heureActuelle }
  ];
  
  await boutique.save();
  console.log('✅ Horaires modifiés, boutique fermée');
  process.exit(0);
}

modifierHoraires();
```

## ✅ Checklist finale

- [ ] Backend redémarré avec les nouvelles modifications
- [ ] Frontend affiche le statut correctement
- [ ] Boutons désactivés quand boutique fermée
- [ ] Validation backend refuse les achats hors horaires
- [ ] Messages d'erreur explicites
- [ ] Logs backend affichent les vérifications
- [ ] Tests avec différents scénarios réussis

## 🐛 Problèmes courants

### Le statut ne change pas
→ Rafraîchir la page (F5) pour recharger les données de la boutique

### Les boutons restent actifs
→ Vérifier que le frontend a bien recompilé (regarder le terminal Angular)

### L'achat passe quand même
→ Le backend n'a pas été redémarré, redémarrer avec `npm start`

### Erreur "Cannot read property 'debut'"
→ La boutique n'a pas d'horaires définis, ajouter des horaires en DB

---

**Temps estimé:** 10-15 minutes  
**Prérequis:** Backend et frontend en cours d'exécution  
**Difficulté:** ⭐⭐☆☆☆
