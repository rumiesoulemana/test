const express = require('express');
const router = express.Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');

// Route Register
router.post('/register', async (req, res) => {
    // Valider les données avant de créer un utilisateur
    const { error } = registerValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Vérification si l'utilisateur est déja dans la base de données
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
        return res.status(400).send('Email existe déja');
    }

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Création de l'utilisateur
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    try {
        const savedUser = await user.save();
        res.send({ user: user._id });
    } catch (err) {
        res.status(400).send(err);
    }

});

// Route Login
router.post('/login', async (req, res) => {
    const { error } = loginValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    // Vérification si l'email existe déja dans la base de données'
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send('Email existe pas');
    }
    // Mot de passe est correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
        return res.status(400).send('Le mot de passe est incorrect');
    }
    // Récupération du token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);

    res.send('Vous êtes connecté !')

});

// Route pour récupérer la liste des utilisateurs
router.get('/users', async(req, res) => {
    // Récupérer tous les utilisateurs dans la base de données
    User.find()
        .then((users) => {
            res.send(users);
        })
        .catch((error) => {
            res.status(500).send('Erreur lors de la récupération des utilisateurs');
        });
});

module.exports = router;