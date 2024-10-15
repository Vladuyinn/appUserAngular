const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const port = 4270;
const mysql = require("mysql");
const bcrypt = require("bcryptjs"); // For hashing passwords
const jwt = require("jsonwebtoken");
const supp = require("./inter/support");
// const nodemailer = require('nodemailer'); // For sending verification emails

const jwtSecret = supp.screen.size;

const db = mysql.createConnection({
  host: supp.db.host,
  user: supp.db.user,
  password: supp.db.password,
  database: supp.db.database,
});

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse les requêtes JSON

app.get("/user", (req, res) => {

  const query = "SELECT * FROM utilisateurs ORDER BY utilisateurs.prenom ASC"; // La requête pour récupérer tous les utilisateurs

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      return res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
    res.json(results); // Renvoie les résultats (idUser + prenom) au front-end
  });
});

// POST pour ajouter un utilisateur
app.post("/user", (req, res) => {
  const newUser = req.body.nom;
  if (!newUser) {
    return res.status(400).json({ error: "Nom d'utilisateur manquant" });
  }

  const query = "INSERT INTO utilisateurs (prenom) VALUES (?)"; // Requête SQL pour insérer l'utilisateur

  db.query(query, [newUser], (err, results) => {
    if (err) {
      console.error("Erreur lors de l'insertion de l'utilisateur:", err);
      return res
        .status(500)
        .json({ error: "Erreur lors de l'insertion de l'utilisateur" });
    }
    res.json({
      message: "Utilisateur ajouté avec succès",
      id: results.insertId,
    });
  });
});

// PUT pour modifier un utilisateur
app.put("/user/:idUser", (req, res) => {
  const userId = req.params.idUser;
  const newUserName = req.body.nom;

  if (!newUserName) {
    return res.status(400).json({ error: "Nom d'utilisateur manquant" });
  }

  const query = "UPDATE utilisateurs SET prenom = ? WHERE idUser = ?";
  db.query(query, [newUserName, userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      return res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ message: "Utilisateur mis à jour avec succès" });
  });
});

// DELETE pour supprimer tous les utilisateurs
app.delete("/user", (req, res) => {
  const query = 'DELETE FROM utilisateurs'; // Requête SQL pour supprimer tous les utilisateurs

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la suppression des utilisateurs:", err);
      return res.status(500).json({ error: "Erreur lors de la suppression des utilisateurs" });
    }
    res.json({ message: "Tous les utilisateurs ont été supprimés avec succès" });
  });
});;

// Serveur écoute sur le port spécifié
app.listen(port, () => {
  console.log(`Server running on http://192.168.0.210:${port}`);
});

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Hash the password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: "Error hashing password" });
    }

    const query = "INSERT INTO admin (login, email, password, droit) VALUES (?, ?, ?, 0)";
    db.query(query, [username, email, hash], (err, results) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Error inserting user" });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: results.insertId, username }, jwtSecret, { expiresIn: '1h' });

      res.json({
        message: "User registered successfully",
        token: token // Send the token to the client
      });
    });
  });
});

app.post('/login', (req, res) => {
  const { identifier, password } = req.body;

  // Check if identifier and password are provided
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
  }

  // Check if the user exists in the database
  const query = "SELECT * FROM admin WHERE email = ? OR login = ?";
  db.query(query, [identifier, identifier], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Erreur du serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Identifiant ou mot de passe incorrect" });
    }

    const user = results[0];

    // Compare the password with the hashed password stored in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ error: 'Erreur du serveur' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Mot de passe incorrect' });
      }

      // Create and return a JWT token
      const token = jwt.sign({ id: user.idUser, username: user.username }, jwtSecret, { expiresIn: '1h' });
      res.json({ message: 'Connexion réussie', token, droit: user.droit });
    });
  });
});
