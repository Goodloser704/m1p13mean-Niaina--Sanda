# 🏗️ Architecture des Tests - Mall Management App

## 📊 Vue d'ensemble du Système

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONNEMENT DE PRODUCTION                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   FRONTEND   │      │   BACKEND    │      │   DATABASE   │  │
│  │              │      │              │      │              │  │
│  │   Vercel     │◄────►│   Render     │◄────►│  MongoDB     │  │
│  │   Angular    │ HTTPS │   Node.js    │ TCP  │   Atlas      │  │
│  │              │      │   Express    │      │              │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│                                                                   │
│  URL: m1p13mean-    URL: m1p13mean-      Cluster: Production    │
│  niaina-xjl4        niaina-1                                     │
│  .vercel.app        .onrender.com                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ Tests
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                      OUTILS DE TEST                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  Tests Manuels   │         │  Tests Auto      │             │
│  │                  │         │                  │             │
│  │  • Navigateur    │         │  • Script Node   │             │
│  │  • DevTools      │         │  • API Testing   │             │
│  │  • Checklist     │         │  • CI/CD         │             │
│  └──────────────────┘         └──────────────────┘             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des Fichiers de Test

```
mall-app/
│
├── 📄 README-TESTS.md                    ← Point d'entrée principal
│   └── Documentation complète des tests
│
├── 📋 PLAN-TEST-FONCTIONNALITES.md      ← Tests détaillés
│   ├── 60+ scénarios de test
│   ├── 9 modules fonctionnels
│   └── Résultats attendus
│
├── 🤖 test-production-complet.js         ← Script automatisé
│   ├── Tests API automatiques
│   ├── 35+ endpoints testés
│   └── Rapport de résultats
│
├── 📘 GUIDE-TESTS.md                     ← Guide pratique
│   ├── Instructions détaillées
│   ├── Vérifications MongoDB
│   └── Résolution de problèmes
│
├── ✅ CHECKLIST-TESTS-SIMPLE.md          ← Checklist rapide
│   ├── 26 tests essentiels
│   ├── Format tableau
│   └── Tests en 1-2h
│
├── 👥 COMPTES-TEST.md                    ← Identifiants
│   ├── Comptes admin/client/commerçant
│   ├── Scénarios par rôle
│   └── Bonnes pratiques
│
└── 🏗️ ARCHITECTURE-TESTS.md              ← Ce fichier
    └── Vue d'ensemble architecture
```

---

## 🔄 Flux de Test

### 1. Test Automatisé (5 min)

```
┌─────────────┐
│   Démarrer  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ node test-production-       │
│ complet.js                  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Tests API:                  │
│ • Authentification          │
│ • Boutiques                 │
│ • Produits                  │
│ • Portefeuille              │
│ • Notifications             │
│ • Infrastructure            │
│ • Demandes                  │
│ • Achats                    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Résultats:                  │
│ ✅ Réussis: XX/35           │
│ ❌ Échoués: XX/35           │
│ 📊 Taux: XX%                │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Décision:                   │
│ > 85% → OK                  │
│ < 85% → Corriger            │
└─────────────────────────────┘
```

---

### 2. Test Manuel (30 min - 12h)

```
┌─────────────┐
│   Démarrer  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Ouvrir l'application        │
│ https://...vercel.app       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Se connecter avec:          │
│ • client@test.com           │
│ • admin@mall.com            │
│ • commercant@test.com       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Suivre les scénarios:       │
│ • CHECKLIST (rapide)        │
│ • PLAN-TEST (complet)       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Documenter les résultats:   │
│ ✅ Succès                   │
│ ❌ Échec                    │
│ 🟡 Partiel                  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Vérifier MongoDB Atlas      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Générer rapport final       │
└─────────────────────────────┘
```

---

## 🎯 Modules de Test

```
┌─────────────────────────────────────────────────────────────┐
│                    MODULES FONCTIONNELS                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1️⃣  AUTHENTIFICATION (5 tests)                             │
│      ├── Inscription                                         │
│      ├── Connexion                                           │
│      ├── Profil                                              │
│      ├── Modification                                        │
│      └── Déconnexion                                         │
│                                                               │
│  2️⃣  BOUTIQUES (6 tests)                                    │
│      ├── Demande création                                    │
│      ├── Validation (admin)                                  │
│      ├── Liste publique                                      │
│      ├── Mes boutiques                                       │
│      ├── Modification                                        │
│      └── Désactivation                                       │
│                                                               │
│  3️⃣  PRODUITS (7 tests)                                     │
│      ├── Création                                            │
│      ├── Liste                                               │
│      ├── Modification                                        │
│      ├── Stock                                               │
│      ├── Suppression                                         │
│      ├── Recherche                                           │
│      └── Filtrage                                            │
│                                                               │
│  4️⃣  COMMANDES (7 tests)                                    │
│      ├── Ajout panier                                        │
│      ├── Visualisation                                       │
│      ├── Validation                                          │
│      ├── Mes commandes                                       │
│      ├── Détails                                             │
│      ├── Commandes reçues                                    │
│      └── Historique                                          │
│                                                               │
│  5️⃣  PORTEFEUILLE (5 tests)                                 │
│      ├── Consultation                                        │
│      ├── Recharge                                            │
│      ├── Transactions                                        │
│      ├── Statistiques                                        │
│      └── Vérification solde                                  │
│                                                               │
│  6️⃣  NOTIFICATIONS (6 tests)                                │
│      ├── Réception                                           │
│      ├── Types                                               │
│      ├── Marquer lu                                          │
│      ├── Marquer toutes                                      │
│      ├── Compteur                                            │
│      └── Archivage                                           │
│                                                               │
│  7️⃣  INFRASTRUCTURE (7 tests)                               │
│      ├── Centre commercial                                   │
│      ├── Gestion étages                                      │
│      ├── Création étage                                      │
│      ├── Gestion espaces                                     │
│      ├── Création espace                                     │
│      ├── Modification                                        │
│      └── Statistiques                                        │
│                                                               │
│  8️⃣  DEMANDES (6 tests)                                     │
│      ├── Création                                            │
│      ├── Mes demandes                                        │
│      ├── Liste (admin)                                       │
│      ├── Validation                                          │
│      ├── Rejet                                               │
│      └── Annulation                                          │
│                                                               │
│  9️⃣  LOYERS & FACTURES (5 tests)                            │
│      ├── Paiement loyer                                      │
│      ├── Historique                                          │
│      ├── Factures                                            │
│      ├── PDF                                                 │
│      └── Statistiques                                        │
│                                                               │
│  🔟  TRANSVERSAL (6 tests)                                   │
│      ├── Recherche globale                                   │
│      ├── Filtres avancés                                     │
│      ├── Pagination                                          │
│      ├── Gestion erreurs                                     │
│      ├── Responsive                                          │
│      └── Performance                                         │
│                                                               │
│  TOTAL: 60+ fonctionnalités                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Rôles et Permissions

```
┌─────────────────────────────────────────────────────────────┐
│                         RÔLES                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  👤 CLIENT                                                   │
│  ├── ✅ Parcourir boutiques/produits                        │
│  ├── ✅ Ajouter au panier                                   │
│  ├── ✅ Acheter                                             │
│  ├── ✅ Gérer portefeuille                                  │
│  ├── ✅ Voir commandes                                      │
│  ├── ✅ Faire demande location                              │
│  └── ✅ Recevoir notifications                              │
│                                                               │
│  🏪 COMMERÇANT                                               │
│  ├── ✅ Toutes permissions CLIENT                           │
│  ├── ✅ Gérer ses boutiques                                 │
│  ├── ✅ Gérer ses produits                                  │
│  ├── ✅ Voir ses ventes                                     │
│  ├── ✅ Payer loyers                                        │
│  └── ✅ Recevoir notifications vente                        │
│                                                               │
│  👨‍💼 ADMIN                                                   │
│  ├── ✅ Toutes permissions COMMERÇANT                       │
│  ├── ✅ Gérer infrastructure                                │
│  ├── ✅ Valider demandes                                    │
│  ├── ✅ Gérer toutes boutiques                              │
│  ├── ✅ Voir statistiques globales                          │
│  └── ✅ Gérer utilisateurs                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Comptes de Test

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPTES DISPONIBLES                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  👨‍💼 ADMIN                                                   │
│  Email:    admin@mall.com                                    │
│  Password: Admin123456!                                      │
│  Rôle:     admin                                             │
│                                                               │
│  👤 CLIENT                                                   │
│  Email:    client@test.com                                   │
│  Password: Client123456!                                     │
│  Rôle:     client                                            │
│                                                               │
│  🏪 COMMERÇANT                                               │
│  Email:    commercant@test.com                               │
│  Password: Commercant123456!                                 │
│  Rôle:     commercant                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Critères de Validation

```
┌─────────────────────────────────────────────────────────────┐
│                   NIVEAUX DE VALIDATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ FONCTIONNEL (> 90%)                                      │
│  ├── Tests auto: > 85%                                       │
│  ├── Tests manuels: > 90%                                    │
│  ├── Parcours principal: 100%                                │
│  ├── Pas de bugs critiques                                   │
│  └── Performance OK                                          │
│  → Application prête                                         │
│                                                               │
│  🟡 PARTIEL (70-90%)                                         │
│  ├── Tests auto: 70-85%                                      │
│  ├── Tests manuels: 70-90%                                   │
│  ├── Parcours principal: OK avec bugs mineurs                │
│  ├── Quelques bugs non-critiques                             │
│  └── Performance acceptable                                  │
│  → Corrections nécessaires                                   │
│                                                               │
│  ❌ NON FONCTIONNEL (< 70%)                                  │
│  ├── Tests auto: < 70%                                       │
│  ├── Tests manuels: < 70%                                    │
│  ├── Parcours principal: Bloqué                              │
│  ├── Bugs critiques                                          │
│  └── Problèmes majeurs                                       │
│  → Investigation approfondie                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Outils Utilisés

```
┌─────────────────────────────────────────────────────────────┐
│                      STACK TECHNIQUE                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend                                                     │
│  ├── Angular 17                                              │
│  ├── TypeScript                                              │
│  ├── SCSS                                                    │
│  └── Vercel (déploiement)                                    │
│                                                               │
│  Backend                                                      │
│  ├── Node.js                                                 │
│  ├── Express.js                                              │
│  ├── JWT (authentification)                                  │
│  └── Render (déploiement)                                    │
│                                                               │
│  Base de données                                             │
│  ├── MongoDB                                                 │
│  ├── Mongoose (ODM)                                          │
│  └── MongoDB Atlas (cloud)                                   │
│                                                               │
│  Tests                                                        │
│  ├── Node.js (scripts)                                       │
│  ├── HTTPS (requêtes)                                        │
│  ├── DevTools (navigateur)                                   │
│  └── MongoDB Compass (vérifications)                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Métriques de Performance

```
┌─────────────────────────────────────────────────────────────┐
│                    OBJECTIFS PERFORMANCE                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Temps de Chargement                                         │
│  ├── Page d'accueil:        < 2s   ✅                       │
│  ├── Liste produits:        < 3s   ✅                       │
│  ├── Détails produit:       < 1s   ✅                       │
│  └── Dashboard:             < 2s   ✅                       │
│                                                               │
│  Temps de Réponse API                                        │
│  ├── GET (liste):           < 500ms ✅                      │
│  ├── GET (détails):         < 200ms ✅                      │
│  ├── POST (création):       < 1s    ✅                      │
│  └── PUT (modification):    < 800ms ✅                      │
│                                                               │
│  Base de Données                                             │
│  ├── Requête simple:        < 100ms ✅                      │
│  ├── Requête complexe:      < 500ms ✅                      │
│  ├── Agrégation:            < 1s    ✅                      │
│  └── Index utilisés:        Oui     ✅                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Prochaines Étapes

```
1. ✅ Lancer test automatisé
   └── node test-production-complet.js

2. ✅ Suivre checklist rapide
   └── CHECKLIST-TESTS-SIMPLE.md

3. ✅ Tests approfondis si nécessaire
   └── PLAN-TEST-FONCTIONNALITES.md

4. ✅ Vérifier MongoDB Atlas
   └── Données créées correctement

5. ✅ Générer rapport final
   └── Documenter les résultats

6. ✅ Décision finale
   └── Valider ou corriger
```

---

**Document créé le:** 6 février 2026  
**Version:** 1.0  
**Environnement:** Production (Vercel + Render + MongoDB Atlas)
