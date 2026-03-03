# 🚀 Tests Rapides - Mode d'Emploi

## Problème
Déployer sur Render prend 2-5 minutes. Trop lent pour tester !

## ✅ Solution : Tester en Local

### Option 1 : Script Automatique (Recommandé)

**Windows PowerShell :**
```powershell
.\test-rapide.ps1
```

**Windows CMD :**
```cmd
test-rapide.bat
```

Le script :
1. Vérifie si le serveur local tourne
2. Le démarre si nécessaire
3. Lance les tests
4. Propose de déployer si tout est OK

### Option 2 : Manuel

**Terminal 1 - Démarrer le backend :**
```bash
cd mall-app/backend
npm start
```

**Terminal 2 - Lancer les tests :**
```bash
node tests-et-notes/TestJs/test-notifications-local.js
```

## 📊 Gain de Temps

| Méthode | Temps |
|---------|-------|
| ❌ Déployer sur Render à chaque test | 5 min |
| ✅ Tester en local | < 1 sec |
| **Gain** | **99% plus rapide !** |

## 🔄 Workflow Recommandé

```
1. Modifier le code
2. Sauvegarder (Ctrl+S)
3. Lancer test-rapide.ps1
4. Corriger si nécessaire
5. Répéter 1-4 jusqu'à ce que ça marche
6. Déployer UNE SEULE FOIS sur Render
```

## 📁 Fichiers Créés

- `test-rapide.ps1` - Script PowerShell automatique
- `test-rapide.bat` - Script CMD automatique
- `tests-et-notes/TestJs/test-notifications-local.js` - Tests locaux
- `GUIDE-TESTS-RAPIDES.md` - Guide complet

## 💡 Astuce

Gardez le serveur local toujours ouvert dans un terminal. Comme ça, vous testez instantanément à chaque modification !
