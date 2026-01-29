# 🧪 Guide de Test - Système d'Inscription Boutique Complet

## 🎯 Objectif
Tester le workflow complet d'inscription boutique avec formulaire détaillé et validation admin.

## 🔄 Workflow à Tester

### 1️⃣ Inscription Utilisateur Boutique
```
1. Aller sur http://localhost:4200
2. Cliquer "Inscription"
3. Sélectionner rôle "Boutique"
4. Remplir le formulaire utilisateur
5. Valider → Compte créé avec rôle boutique
```

### 2️⃣ Inscription Boutique Détaillée
```
1. Se connecter avec le compte boutique
2. Cliquer sur "📝 Ma Boutique" dans la navigation
3. Remplir le formulaire complet :
   - Nom de la boutique
   - Catégorie (Mode, Électronique, etc.)
   - Description
   - Zone préférée
   - Étage souhaité
   - Informations de contact
   - Horaires d'ouverture
4. Utiliser les presets d'horaires pour tester
5. Valider → Notification envoyée aux admins
```

### 3️⃣ Validation Admin
```
1. Se connecter avec un compte admin
2. Vérifier le badge de notification
3. Aller dans "🔔 Notifications"
4. Voir la notification d'inscription boutique
5. Ou aller dans "🏪 Boutiques"
6. Voir la boutique en attente
7. Cliquer "👁️ Détails" pour voir toutes les informations
8. Approuver ou rejeter avec raison
```

### 4️⃣ Notification de Retour
```
1. Retourner sur le compte boutique
2. Vérifier les notifications
3. Voir le statut de la boutique mis à jour
4. Interface "Ma Boutique" montre le nouveau statut
```

## 📝 Formulaire d'Inscription Boutique - Champs à Tester

### Informations de Base
- ✅ **Nom boutique** (requis) - Ex: "Fashion Store"
- ✅ **Catégorie** (requis) - Dropdown avec icônes
- ✅ **Description** (optionnel) - Textarea avec compteur 500 caractères

### Emplacement Souhaité
- ✅ **Zone préférée** - Centre, Nord, Sud, Est, Ouest
- ✅ **Étage préféré** - RDC, 1er, 2ème étage
- ✅ **Numéro local** (optionnel) - Ex: A12, B05

### Contact Boutique
- ✅ **Téléphone boutique** (optionnel)
- ✅ **Email boutique** (optionnel)
- ✅ **Site web** (optionnel) - Validation URL

### Horaires d'Ouverture
- ✅ **7 jours de la semaine** - Ouverture/Fermeture
- ✅ **Presets horaires** :
  - Standard (9h-19h, fermé dimanche)
  - Étendu (8h-20h, 10h-18h dimanche)
  - Effacer tout

## 🎨 Interface à Tester

### Navigation Boutique
- ✅ Badge "📝 Ma Boutique" visible pour rôle boutique
- ✅ Dashboard boutique avec actions rapides
- ✅ Navigation responsive

### Formulaire Boutique
- ✅ Sections organisées avec icônes
- ✅ Validation des champs requis
- ✅ Presets d'horaires fonctionnels
- ✅ Compteur de caractères description
- ✅ Messages d'état selon statut boutique

### Interface Admin
- ✅ Liste des boutiques en attente
- ✅ Modal de détails complet avec toutes les infos
- ✅ Actions approuver/rejeter
- ✅ Statistiques mises à jour

## 🔔 Notifications à Vérifier

### Pour les Admins
```json
{
  "type": "boutique_registration",
  "title": "🏪 Nouvelle inscription boutique",
  "message": "[Nom] a inscrit sa boutique \"[Nom Boutique]\" et attend votre validation.",
  "actionRequired": true,
  "actionType": "approve_boutique"
}
```

### Pour le Propriétaire (Approbation)
```json
{
  "type": "boutique_approved", 
  "title": "✅ Boutique approuvée",
  "message": "Félicitations ! Votre boutique \"[Nom]\" a été approuvée...",
  "actionRequired": false
}
```

### Pour le Propriétaire (Rejet)
```json
{
  "type": "boutique_rejected",
  "title": "❌ Boutique rejetée", 
  "message": "Votre demande d'inscription pour la boutique \"[Nom]\" a été rejetée. Raison: [Raison]",
  "actionRequired": false
}
```

## 🧪 Scénarios de Test

### Scénario 1: Inscription Complète Réussie
1. Créer compte boutique
2. Remplir formulaire complet avec tous les champs
3. Vérifier notification admin
4. Approuver depuis interface admin
5. Vérifier notification boutique
6. Vérifier statut "approuvé" dans interface boutique

### Scénario 2: Inscription Minimale
1. Créer compte boutique
2. Remplir seulement les champs requis (nom + catégorie)
3. Vérifier que ça fonctionne
4. Approuver et vérifier

### Scénario 3: Rejet avec Raison
1. Créer inscription boutique
2. Admin rejette avec raison détaillée
3. Vérifier notification de rejet avec raison
4. Vérifier que la boutique est supprimée

### Scénario 4: Boutique Existante
1. Avoir une boutique déjà inscrite
2. Aller sur "Ma Boutique"
3. Vérifier affichage du statut existant
4. Tester modification si en attente

### Scénario 5: Horaires Presets
1. Utiliser preset "Standard"
2. Vérifier horaires 9h-19h lun-sam, fermé dimanche
3. Utiliser preset "Étendu"
4. Vérifier horaires 8h-20h lun-sam, 10h-18h dimanche
5. Effacer et vérifier

## 📊 Données de Test

### Boutique Test 1 - Mode
```
Nom: "Fashion Boutique"
Catégorie: Mode
Description: "Vêtements tendance pour toute la famille"
Zone: Centre
Étage: 1
Contact: 01 23 45 67 89
Site: https://fashion-boutique.com
Horaires: Standard
```

### Boutique Test 2 - Électronique
```
Nom: "Tech Corner"
Catégorie: Électronique  
Description: "Smartphones, ordinateurs et accessoires high-tech"
Zone: Nord
Étage: RDC
Local: A15
Horaires: Étendu
```

### Boutique Test 3 - Alimentation
```
Nom: "Délices & Saveurs"
Catégorie: Alimentation
Description: "Produits frais et spécialités locales"
Zone: Sud
Horaires: Personnalisés (6h-22h)
```

## ✅ Checklist de Validation

### Backend
- [ ] Routes boutique fonctionnelles
- [ ] Service boutique opérationnel
- [ ] Notifications créées correctement
- [ ] Validation admin fonctionnelle
- [ ] Gestion des erreurs appropriée

### Frontend
- [ ] Formulaire d'inscription complet
- [ ] Navigation boutique visible
- [ ] Interface admin mise à jour
- [ ] Notifications affichées correctement
- [ ] Design responsive

### Workflow
- [ ] Inscription utilisateur → inscription boutique
- [ ] Notification admin automatique
- [ ] Approbation/rejet fonctionnel
- [ ] Notification retour propriétaire
- [ ] Statuts mis à jour correctement

## 🚨 Points d'Attention

1. **Validation des champs** - Vérifier que les champs requis sont bien validés
2. **Gestion des erreurs** - Tester avec des données invalides
3. **Permissions** - Vérifier que seuls les bons rôles accèdent aux bonnes interfaces
4. **Notifications temps réel** - Vérifier le polling automatique
5. **Responsive design** - Tester sur mobile/tablette
6. **Performance** - Vérifier les temps de chargement

## 🎉 Résultat Attendu

Un système complet permettant :
- ✅ Inscription boutique détaillée avec toutes les informations nécessaires
- ✅ Workflow de validation admin fluide
- ✅ Notifications bidirectionnelles
- ✅ Interface utilisateur intuitive et responsive
- ✅ Gestion complète du cycle de vie d'une boutique

---
*Système prêt pour déploiement en production !*