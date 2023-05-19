// Importations nécessaires
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Importations des routes
const authRoute = require('./routes/auth');

dotenv.config();

// Connexion base de données MongoDB
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connexion à la base de données réussie');
    })
    .catch((error) => {
        console.error('Erreur de connexion à la base de données', error);
    });

app.use(express.json());

app.use('/api/user', authRoute);

// Démarrage du serveur
app.listen(4000, () => console.log('Le serveur fonctionne'));