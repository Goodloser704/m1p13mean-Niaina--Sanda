# Guide d'Installation - Application Centre Commercial

## Prérequis

- Node.js (version 18 ou supérieure)
- MongoDB (version 5.0 ou supérieure)
- Angular CLI (`npm install -g @angular/cli`)

## Installation

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd mall-app
```

### 2. Installer les dépendances
```bash
npm run install-all
```

### 3. Configuration de la base de données

1. Démarrer MongoDB
2. Créer une base de données `mall_db`
3. Configurer les variables d'environnement

### 4. Configuration Backend

1. Copier le fichier d'environnement :
```bash
cd backend
cp .env.example .env
```

2. Modifier le fichier `.env` :
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mall_db
JWT_SECRET=votre_secret_jwt_super_securise
NODE_ENV=development
```

### 5. Démarrage de l'application

#### Mode développement (recommandé)
```bash
npm run dev
```

Cette commande démarre :
- Backend sur http://localhost:3000
- Frontend sur http://localhost:4200

#### Démarrage séparé

Backend seulement :
```bash
npm run dev:backend
```

Frontend seulement :
```bash
npm run dev:frontend
```

## Comptes de test

### Admin
- Email: admin@mall.com
- Mot de passe: admin123

### Boutique
- Email: boutique@test.com  
- Mot de passe: boutique123

### Client
- Email: client@test.com
- Mot de passe: client123

## Structure du projet

```
mall-app/
├── backend/          # API Express.js
│   ├── models/       # Modèles MongoDB
│   ├── routes/       # Routes API
│   ├── middleware/   # Middlewares
│   └── server.js     # Point d'entrée
├── frontend/         # Application Angular
│   ├── src/app/      # Code source Angular
│   └── src/assets/   # Assets statiques
└── docs/            # Documentation
```



## Dépannage

### Erreur de connexion MongoDB
Vérifiez que MongoDB est démarré et accessible sur le port 27017.

### Erreur CORS
Vérifiez que le frontend utilise la bonne URL d'API dans `environment.ts`.

### Port déjà utilisé
Modifiez le port dans le fichier `.env` du backend ou `angular.json` du frontend.
