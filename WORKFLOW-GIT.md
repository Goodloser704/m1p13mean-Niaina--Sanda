# 🌿 Workflow Git - Stratégie de Branches

## 📋 Structure des Branches

```
main (production)
├── dev (développement)
    ├── niaina-dev (branche personnelle Niaina)
    ├── collaborateur-dev (branche personnelle collaborateur)
    └── feature/nom-feature (branches de fonctionnalités)
```

## 🔄 Workflow de Développement

### 1. **Développement quotidien**
```bash
# Travailler sur ta branche personnelle
git checkout niaina-dev
git pull origin dev  # Récupérer les dernières mises à jour

# Développer tes fonctionnalités
git add .
git commit -m "feat: description de ta fonctionnalité"
git push origin niaina-dev
```

### 2. **Intégration dans dev**
```bash
# Merger ta branche dans dev
git checkout dev
git pull origin dev
git merge niaina-dev
git push origin dev
```

### 3. **Déploiement en production**
```bash
# Seulement pour les déploiements
git checkout main
git pull origin main
git merge dev
git push origin main  # Déclenche le déploiement automatique
```

## 🚀 Commandes Utiles

### Créer une nouvelle fonctionnalité
```bash
git checkout dev
git pull origin dev
git checkout -b feature/nom-fonctionnalite
# ... développement ...
git push -u origin feature/nom-fonctionnalite
```

### Synchroniser avec dev
```bash
git checkout niaina-dev
git pull origin dev  # Récupérer les changements des autres
git push origin niaina-dev
```

### Résoudre les conflits
```bash
git checkout dev
git pull origin dev
git checkout niaina-dev
git merge dev  # Résoudre les conflits localement
# ... résoudre conflits ...
git add .
git commit -m "resolve: conflits avec dev"
git push origin niaina-dev
```

## 📋 Règles d'Équipe

### ✅ À FAIRE
- Toujours travailler sur ta branche personnelle (`niaina-dev`)
- Faire des commits fréquents avec des messages clairs
- Tester localement avant de pousser
- Merger dans `dev` régulièrement
- Utiliser `main` SEULEMENT pour les déploiements

### ❌ À ÉVITER
- Ne jamais commiter directement sur `main`
- Ne pas faire de force push sur les branches partagées
- Ne pas merger sans tester
- Ne pas laisser ta branche trop diverger de `dev`

## 🎯 Messages de Commit

### Format recommandé
```
type: description courte

feat: Ajouter système de notifications
fix: Corriger bug de connexion
docs: Mettre à jour documentation API
style: Améliorer CSS responsive
refactor: Restructurer service auth
test: Ajouter tests unitaires
```

## 🔧 Configuration Initiale

### Pour le collaborateur
```bash
# Cloner le repo
git clone https://github.com/Goodloser704/m1p13mean-Niaina--Sanda.git
cd m1p13mean-Niaina--Sanda

# Créer sa branche personnelle
git checkout dev
git checkout -b [nom-collaborateur]-dev
git push -u origin [nom-collaborateur]-dev
```

## 📊 Statut des Branches

- **main** : Code en production (Render + Vercel)
- **dev** : Code de développement stable
- **niaina-dev** : Branche personnelle Niaina
- **[collaborateur]-dev** : Branche personnelle collaborateur

## 🚨 En Cas de Problème

### Annuler le dernier commit
```bash
git reset --soft HEAD~1  # Garde les changements
git reset --hard HEAD~1  # Supprime les changements
```

### Récupérer une branche supprimée
```bash
git reflog  # Trouver le commit
git checkout -b branche-recuperee [hash-commit]
```

### Forcer la synchronisation
```bash
git fetch origin
git reset --hard origin/dev  # ATTENTION: Perd les changements locaux
```

---

**Rappel :** Cette stratégie évite les conflits et permet un développement collaboratif fluide ! 🎉