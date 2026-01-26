# 🚀 Guide de Déploiement sur Render

## Vue d'ensemble
Ce guide vous explique comment déployer l'application Centre Commercial sur Render.

## Prérequis
- Compte Render (gratuit)
- Repository GitHub avec le code
- Base de données MongoDB Atlas configurée

## 📋 Étapes de Déploiement

### 1. Créer un Nouveau Web Service

1. Connectez-vous à [Render](https://render.com)
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre repository GitHub : `Goodloser704/m1p13mean-Niaina--`

### 2. Configuration du Service

#### Paramètres Généraux
- **Name** : `mall-app-backend`
- **Region** : `Frankfurt (EU Central)` ou `Oregon (US West)`
- **Branch** : `main`
- **Root Directory** : Laissez vide
- **Runtime** : `Node`

#### Commandes de Build et Start
- **Build Command** : 
  ```bash
  npm run build
  ```
- **Start Command** : 
  ```bash
  npm start
  ```

### 3. Variables d'Environnement

Dans la section "Environment Variables", ajoutez :

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://faustresilient_db_user:RD3471h5QWuSxZtV@cluster0.ojuacgh.mongodb.net/mall_db?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `super_secret_jwt_key_for_mall_app_2024_production_render` |

### 4. Configuration Avancée

#### Health Check
- **Health Check Path** : `/`

#### Auto-Deploy
- ✅ Activez "Auto-Deploy" pour déployer automatiquement à chaque push

### 5. Déploiement

1. Cliquez sur "Create Web Service"
2. Render va automatiquement :
   - Cloner votre repository
   - Installer les dépendances
   - Démarrer l'application
   - Assigner une URL publique

## 🔧 Configuration Post-Déploiement

### Initialiser la Base de Données

Une fois déployé, initialisez la base de données :

1. Ouvrez le Shell Render de votre service
2. Exécutez :
   ```bash
   cd backend && npm run init-db
   ```

### Tester l'API

Votre API sera accessible à l'URL fournie par Render (ex: `https://mall-app-backend.onrender.com`)

Testez les endpoints :
- `GET /` - Page d'accueil
- `GET /api/products` - Liste des produits
- `POST /api/auth/login` - Authentification

## 🌐 Déploiement Frontend (Optionnel)

Pour déployer aussi le frontend Angular :

### 1. Nouveau Static Site

1. "New +" → "Static Site"
2. Même repository : `Goodloser704/m1p13mean-Niaina--`

### 2. Configuration Frontend

- **Name** : `mall-app-frontend`
- **Build Command** : 
  ```bash
  cd frontend && npm install && npm run build
  ```
- **Publish Directory** : `frontend/dist/mall-frontend`

### 3. Variables d'Environnement Frontend

| Key | Value |
|-----|-------|
| `API_URL` | `https://votre-backend-url.onrender.com/api` |

### 4. Mise à jour de l'Environment Angular

Modifiez `frontend/src/environments/environment.prod.ts` :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://votre-backend-url.onrender.com/api'
};
```

## 🔍 Dépannage

### Erreurs Communes

1. **Cannot find module '/opt/render/project/src/backend/src/server.js'**
   - **Solution** : Utilisez `npm start` au lieu de `cd backend && npm start`
   - **Build Command** : `npm run build`
   - **Start Command** : `npm start`

2. **Build Failed**
   - Vérifiez que `package.json` est dans le bon répertoire
   - Vérifiez les dépendances

3. **Application Crash**
   - Consultez les logs Render
   - Vérifiez les variables d'environnement

4. **Base de Données**
   - Vérifiez la chaîne de connexion MongoDB
   - Vérifiez les permissions réseau MongoDB Atlas

### Logs et Monitoring

- **Logs** : Onglet "Logs" dans Render
- **Metrics** : Onglet "Metrics" pour les performances
- **Events** : Historique des déploiements

## 📊 Optimisations Production

### Performance
- Activez la compression gzip
- Configurez le cache des assets statiques
- Optimisez les requêtes MongoDB

### Sécurité
- Utilisez HTTPS (automatique sur Render)
- Configurez CORS correctement
- Utilisez des secrets forts

### Monitoring
- Configurez des alertes de santé
- Surveillez les métriques de performance
- Logs d'erreurs centralisés

## 💰 Coûts

### Plan Gratuit Render
- 750 heures/mois
- Mise en veille après 15min d'inactivité
- Réveil automatique sur requête

### Plan Payant
- Pas de mise en veille
- Plus de ressources
- Support prioritaire

## 🔄 CI/CD

Avec Auto-Deploy activé :
1. Push vers `main` → Déploiement automatique
2. Tests automatiques (si configurés)
3. Rollback possible en cas d'erreur

## 📞 Support

- [Documentation Render](https://render.com/docs)
- [Community Forum](https://community.render.com)
- Support par email (plans payants)

---

**Votre application sera accessible publiquement une fois déployée !** 🌐