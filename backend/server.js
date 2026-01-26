const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/boutique', require('./routes/boutique'));
app.use('/api/client', require('./routes/client'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mall_db')
  .then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch(err => {
    console.warn('⚠️ MongoDB non disponible, serveur démarré sans base de données');
    console.warn('Pour utiliser toutes les fonctionnalités, installez MongoDB ou utilisez MongoDB Atlas');
  });

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API Centre Commercial - Serveur actif' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne' });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});