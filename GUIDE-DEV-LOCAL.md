# 🛠️ Guide de Développement Local - Centre Commercial

## 🚨 **Problème CORS Actuel**

Le backend sur Render n'a pas encore été mis à jour avec nos corrections CORS. En attendant, voici comment développer en local.

## 🔧 **Configuration Proxy (Recommandée)**

### **1. Fichier de Proxy Créé**
```json
// frontend/proxy.conf.json
{
  "/api/*": {
    "target": "https://m1p13mean-niaina-1.onrender.com",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug",
    "headers": {
      "Origin": "https://m1p13mean-niaina-xjl4.vercel.app"
    }
  }
}
```

### **2. Modifier angular.json**
Ajoutez la configuration proxy dans `angular.json` :

```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

## 🚀 **Commandes de Développement**

### **Démarrer le Frontend avec Proxy :**
```bash
cd mall-app/frontend
ng serve --proxy-config proxy.conf.json
```

### **Ou si angular.json est modifié :**
```bash
cd mall-app/frontend
ng serve
```

### **URL de Développement :**
- **Frontend :** `http://localhost:4200`
- **API :** `http://localhost:4200/api/*` (proxifiée vers Render)

## ✅ **Avantages du Proxy**

1. **Pas de CORS** - Les requêtes passent par le même domaine
2. **Développement fluide** - Pas besoin d'attendre le redéploiement backend
3. **Test réel** - Utilise le vrai backend de production
4. **Configuration simple** - Juste un fichier JSON

## 🧪 **Test de Fonctionnement**

### **1. Démarrer le serveur :**
```bash
ng serve --proxy-config proxy.conf.json
```

### **2. Ouvrir le navigateur :**
```
http://localhost:4200
```

### **3. Vérifier les logs :**
```
✅ Backend accessible
🔐 Connexion avec profils de test
💾 Session sauvegardée
```

## 📊 **Profils de Test Disponibles**

```javascript
// Admin
Email: admin@mall.com
Password: admin123

// Boutique  
Email: fashion@mall.com
Password: boutique123

// Client
Email: client1@test.com
Password: client123
```

## 🔄 **Workflow de Développement**

### **1. Développement Local :**
```bash
# Terminal 1 - Frontend avec proxy
cd mall-app/frontend
ng serve --proxy-config proxy.conf.json

# Navigateur
http://localhost:4200
```

### **2. Test des Fonctionnalités :**
- ✅ Connexion/Inscription
- ✅ Gestion de session
- ✅ Dashboard par rôle
- ✅ Profils de démonstration

### **3. Commit des Changements :**
```bash
git add .
git commit -m "✨ Nouvelle fonctionnalité"
git push origin niaina-dev
```

## 🎯 **Résolution Définitive**

### **Quand le Backend Sera Mis à Jour :**
1. ✅ Les patterns regex CORS seront actifs
2. ✅ Toutes les URLs Vercel seront autorisées
3. ✅ Le développement en production fonctionnera
4. ✅ Plus besoin du proxy

### **En Attendant :**
- 🛠️ Développer en local avec proxy
- 📝 Documenter les nouvelles fonctionnalités
- 🧪 Tester l'architecture RCS
- 🎨 Améliorer l'interface utilisateur

---

*💡 Cette configuration proxy permet de continuer le développement sans attendre la résolution CORS côté backend.*