# 🚀 Guide de Déploiement Frontend sur Vercel

## Vue d'ensemble
Ce guide explique comment déployer le frontend Angular sur Vercel.

> ✅ **PROBLÈME RÉSOLU** : Le problème de page blanche a été corrigé en remplaçant le template Angular par défaut par l'interface complète de l'application mall.

## Prérequis
- Compte Vercel (gratuit)
- Repository GitHub avec le code
- Backend déployé sur Render : https://m1p13mean-niaina-1.onrender.com

## 📋 Étapes de Déploiement

### 1. Préparer le Repository

Le repository est déjà configuré avec :
- ✅ `vercel.json` - Configuration Vercel
- ✅ `frontend/src/environments/environment.prod.ts` - URL API production
- ✅ Scripts de build Angular optimisés

### 2. Déployer sur Vercel

#### Option A : Via Dashboard Vercel (Recommandé)

1. **Aller sur [Vercel](https://vercel.com)**
2. **Se connecter** avec GitHub
3. **Cliquer "New Project"**
4. **Importer** le repository `Goodloser704/m1p13mean-Niaina--`

#### Configuration du Projet

**Framework Preset :** `Angular`

**Root Directory :** `frontend` ⭐ **IMPORTANT**

**Build Command :**
```bash
npm run build
```

**Output Directory :**
```bash
dist/frontend
```

**Install Command :**
```bash
npm install
```

**Node.js Version :** `18.x`

#### ⚠️ Configuration Critique

**IMPORTANT** : Dans les paramètres Vercel, vous DEVEZ configurer :

1. **Root Directory** : `frontend`
2. **Build Command** : `npm run build` (PAS `cd frontend && ...`)
3. **Output Directory** : `dist/mall-frontend`

Si vous voyez l'erreur "cd: frontend: No such file or directory", c'est que le Root Directory n'est pas configuré correctement.

#### Variables d'Environnement (Optionnel)

| Key | Value |
|-----|-------|
| `API_URL` | `https://m1p13mean-niaina-1.onrender.com/api` |

### 3. Configuration Avancée

#### Build Settings dans Vercel

- **Framework** : Angular
- **Node.js Version** : 18.x
- **Root Directory** : `frontend`
- **Build Command** : `npm run build`
- **Output Directory** : `dist/frontend`

#### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer depuis la racine du projet
vercel

# Suivre les prompts :
# - Set up and deploy? Yes
# - Which scope? Votre compte
# - Link to existing project? No
# - Project name? mall-app-frontend
# - Directory? frontend
# - Override settings? Yes
# - Build Command? npm run build
# - Output Directory? dist/frontend
```

### 4. Configuration Post-Déploiement

#### Domaine Personnalisé (Optionnel)

1. Dans le dashboard Vercel
2. Aller dans **Settings** → **Domains**
3. Ajouter votre domaine personnalisé

#### Variables d'Environnement

Si nécessaire, ajoutez dans **Settings** → **Environment Variables** :
- `NODE_ENV` = `production`
- `API_URL` = `https://m1p13mean-niaina-1.onrender.com/api`

### 5. Vérification du Déploiement

Une fois déployé, votre application sera accessible sur :
- URL Vercel : `https://votre-app.vercel.app`

#### Tests à Effectuer

1. **Page d'accueil** : Vérifiez que l'interface se charge
2. **Connexion API** : Testez la connexion avec le backend
3. **Authentification** : Testez la connexion avec les comptes de test
4. **Navigation** : Vérifiez que toutes les routes fonctionnent

### 6. Comptes de Test

Une fois déployé, testez avec :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@mall.com | admin123 |
| **Boutique** | fashion@mall.com | boutique123 |
| **Client** | client1@test.com | client123 |

### 7. Dépannage

#### Erreurs Communes

1. **"cd: frontend: No such file or directory"**
   ```
   Solution : Configurez Root Directory = "frontend" dans Vercel
   Ne pas utiliser "cd frontend" dans les commandes
   ```

2. **Build Failed**
   ```
   Solution : Vérifiez les dépendances dans frontend/package.json
   ```

3. **API Connection Error**
   ```
   Solution : Vérifiez l'URL API dans environment.prod.ts
   ```

4. **Routing Issues**
   ```
   Solution : Vercel détecte automatiquement Angular SPA
   ```

5. **CORS Errors**
   ```
   Solution : Le backend Render doit autoriser votre domaine Vercel
   ```

#### Logs et Debugging

- **Build Logs** : Dashboard Vercel → Functions → View Function Logs
- **Runtime Logs** : Dashboard Vercel → Functions → View Function Logs
- **Network** : Outils développeur du navigateur

### 8. Optimisations

#### Performance

- ✅ Build de production optimisé
- ✅ Tree shaking automatique
- ✅ Compression gzip
- ✅ CDN global Vercel

#### SEO

- Ajoutez des meta tags dans `index.html`
- Configurez le titre et la description
- Ajoutez un favicon

#### PWA (Optionnel)

```bash
ng add @angular/pwa
```

### 9. CI/CD Automatique

Vercel déploie automatiquement :
- **Production** : Push sur `main` → Déploiement production
- **Preview** : Pull Request → Déploiement de prévisualisation
- **Rollback** : Retour à une version précédente en un clic

### 10. Monitoring

#### Analytics Vercel

- Activez Vercel Analytics dans le dashboard
- Suivez les performances et l'utilisation

#### Alertes

- Configurez des alertes pour les erreurs
- Surveillez les temps de réponse

## 🎯 Résultat Final

Après déploiement, vous aurez :

- ✅ **Frontend** : https://votre-app.vercel.app
- ✅ **Backend** : https://m1p13mean-niaina-1.onrender.com
- ✅ **Application complète** fonctionnelle
- ✅ **Déploiement automatique** sur push GitHub

## 📞 Support

- [Documentation Vercel](https://vercel.com/docs)
- [Community Discord](https://vercel.com/discord)
- [Support Vercel](https://vercel.com/support)

---

**Votre application sera accessible mondialement via le CDN Vercel !** 🌐