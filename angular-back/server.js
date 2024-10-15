const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const port = 4270;
const mysql = require("mysql");
const bcrypt = require("bcryptjs"); // For hashing passwords
const jwt = require("jsonwebtoken");
const supp = require("./inter/support");
const nodemailer = require('nodemailer'); // For sending verification emails

const polsa = supp.screen.size;

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

    const query = "INSERT INTO admin (login, email, password, droit, verifié) VALUES (?, ?, ?, 0, 0)";
    db.query(query, [username, email, hash], (err, results) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Error inserting user" });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: results.insertId, username }, polsa, { expiresIn: '1h' });

      sendVerificationEmail(email, username, results.insertId);

      res.status(200).json({
        message: 'Registration successful. Please check your email for verification.',
        token: token // Send the token to the client
      });
    });
  });
});

app.post('/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
  }

  // Requête pour récupérer l'utilisateur par son email ou login
  const query = "SELECT * FROM admin WHERE email = ? OR login = ?";
  db.query(query, [identifier, identifier], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      return res.status(500).json({ error: 'Erreur du serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Identifiant ou mot de passe incorrect" });
    }

    const user = results[0];

    // Vérifier si l'email a été vérifié
    if (user.verifié === 0) {
      return res.status(403).json({ error: "Votre email n'est pas encore vérifié." });
    }

    // Comparer le mot de passe avec le mot de passe haché stocké
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Erreur lors de la comparaison des mots de passe:', err);
        return res.status(500).json({ error: 'Erreur du serveur' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Mot de passe incorrect' });
      }

      // Créer et retourner un token JWT
      const token = jwt.sign({ id: user.idAdmin, username: user.login }, polsa, { expiresIn: '1h' });
      res.json({ message: 'Connexion réussie', token, droit: user.droit });
    });
  });
});

app.get('/verify-email', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Lien de vérification invalide.');
  }

  // Vérifier le token JWT
  jwt.verify(token, polsa, (err, decoded) => {
    if (err) {
      console.error('Erreur lors de la vérification du token:', err);
      return res.status(400).send('Lien de vérification expiré ou invalide.');
    }

    const userEmail = decoded.email;  // On récupère l'email du token
    console.log('Email décodé du token:', userEmail);  // Debugging

    // Mettre à jour la colonne "verifié" pour cet utilisateur dans la base de données
    const query = "UPDATE admin SET verifié = 1 WHERE email = ?";
    
    db.query(query, [userEmail], (error, results) => {
      if (error) {
        console.error('Erreur lors de la mise à jour du statut utilisateur dans la base de données:', error);
        return res.status(500).send('Erreur lors de la mise à jour du statut utilisateur.');
      }

      console.log('Résultats de la mise à jour SQL:', results);  // Debugging

      if (results.affectedRows === 0) {
        console.log('Aucune ligne affectée, utilisateur non trouvé ou déjà vérifié.');
        return res.status(404).send('Utilisateur non trouvé ou déjà vérifié.');
      }

      // Rediriger vers la page de connexion avec un message de succès
      res.redirect('/connexion?verified=true');
    });
  });
});


// Fonction pour envoyer l'email de vérification
function sendVerificationEmail(userEmail, username, userId) {

  // Générer un token de vérification (valide pendant 1 heure)
  const token = jwt.sign({ email: userEmail }, polsa, { expiresIn: '1h' });

  // Créer un objet de transport avec les informations de configuration de NodeMailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Serveur SMTP de Gmail
    port: 465,               // Port pour SSL
    secure: true,            // Utiliser SSL
    auth: {
      user: supp.mail.address,  // Votre adresse email (ex: 'votre-email@gmail.com')
      pass: supp.mail.pass      // Le mot de passe ou app-specific password si 2FA activé
    }
  });

  // URL de vérification
  const verificationUrl = `http://192.168.0.210:4269/verify-email?token=${token}`;

  // Options de l'email
  const mailOptions = {
    from: supp.mail.address,      // Votre adresse email
    to: userEmail,                // Email de l'utilisateur
    subject: 'Confirmation d\'inscription',
    html: `<h1>Bienvenue ${username} !</h1>
           <p>Merci de vous être inscrit ! Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
           <a href="${verificationUrl}">Vérifier mon email (le lien expirera dans 1 heure)</a>`
  };

  // Envoyer l'email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
    } else {
      console.log('Email de vérification envoyé:', info.response);
    }
  });
}
