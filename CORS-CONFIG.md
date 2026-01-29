# 🔐 Configuration CORS - Centre Commercial

## 📋 **URLs Autorisées**

### **🌐 Frontend URLs**
- **Local Development:** `http://localhost:4200`
- **Local HTTPS:** `https://localhost:4200`
- **Vercel Production:** `https://m1p13mean-niaina-xjl4.vercel.app`
- **Vercel Branches:** `https://m1p13mean-niaina-xjl4-git-*-neros-projects-*.vercel.app`

### **🖥️ Backend URLs**
- **Render Production:** `https://m1p13mean-niaina-1.onrender.com`
- **Local Development:** `http://localhost:3000`

## 🔧 **Configuration CORS Actuelle**

### **Patterns Regex Utilisés:**
```javascript
// Pattern Vercel (toutes les branches)
const vercelPattern = /^https:\/\/m1p13mean-niaina-xjl4.*\.vercel\.app$/;

// Pattern Render (toutes les branches)
const renderPattern = /^https:\/\/m1p13mean-niaina.*\.onrender\.com$/;
```

### **URLs Exactes:**
```javascript
const allowedOrigins = [
  'http://localhost:4200',
  'https://localhost:4200', 
  'https://m1p13mean-niaina-1.onrender.com',
  'https://m1p13mean-niaina-xjl4.vercel.app',
  process.env.FRONTEND_URL
];
```

## 🚨 **Problème Résolu**

### **Erreur Précédente:**
```
❌ CORS: Origin https://m1p13mean-niaina-xjl4-git-niaina-dev-neros-projects-629366ad.vercel.app is NOT allowed
```

### **Solution Appliquée:**
- ✅ Ajout de patterns regex pour supporter les déploiements de branches
- ✅ Support automatique des nouvelles URLs Vercel
- ✅ Configuration dynamique selon l'environnement

## 🔄 **Déploiement**

### **Pour Appliquer les Changements:**
1. **Backend (Render):** Se redéploie automatiquement depuis la branche `dev`
2. **Frontend (Vercel):** Se redéploie automatiquement depuis la branche `niaina-dev`

### **Vérification:**
```bash
# Tester la connexion
curl -H "Origin: https://m1p13mean-niaina-xjl4-git-niaina-dev-neros-projects-629366ad.vercel.app" \
     https://m1p13mean-niaina-1.onrender.com/
```

## 📝 **Variables d'Environnement**

### **Backend (.env):**
```env
FRONTEND_URL=https://m1p13mean-niaina-xjl4.vercel.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### **Frontend (Automatique):**
- Détection automatique de l'environnement
- URL backend configurée dynamiquement

## 🎯 **URLs de Test**

### **Actuellement Déployées:**
- **Frontend niaina-dev:** `https://m1p13mean-niaina-xjl4-git-niaina-dev-neros-projects-629366ad.vercel.app`
- **Backend production:** `https://m1p13mean-niaina-1.onrender.com`

### **Status Expected:**
- ✅ CORS autorisé pour toutes les branches Vercel
- ✅ Communication frontend ↔ backend fonctionnelle
- ✅ Authentification et session persistante