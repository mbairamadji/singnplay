const express        = require("express")
const router         = express.Router()
const passport       = require("passport")
const multer         = require("multer")
const middlewareObj  = require("../middlewares/middlewares")
const User           = require("../models/user")
const Annonce        = require("../models/annonce")

module.exports = router

//Rediriger vers la page d'accueil
    .get('/', (req, res) => {
        res.redirect('/accueil')
    })

// A propos
 .get('/accueil', (req, res) => {
        res.render('accueil')
    })
// Formulaire de connexion

    .get('/login', (req, res) => {
        res.render('login')
    })
// Formulaire d'inscription
    .get('/inscription', (req, res) => {
    res.render("register")
    })

// Route d'inscription
   .post('/inscription', middlewareObj.regMiddleware,passport.authenticate("local-signup", {
        successRedirect : '/',
        failureRedirect : '/inscription',
        failureFlash : true
    }))

//Login
    .post('/login', passport.authenticate("local-login", {
        successRedirect : '/annonces',
        failureRedirect : 'back',
        failureFlash    :true

    }), (req, res) => {
        
    })
//Logout
    .get('/logout', (req, res) => {
        req.logout();
        req.flash('success_message', "Vous êtes bien déconnecté!")
        res.redirect('/annonces')
    })
//Route de l'utilisateur

    .get('/users/me',  middlewareObj.isLoggedIn, (req, res) => {
       res.render('user', {user : req.user})
    })

//Routes des annonces de l'utilisateur

    .get('/users/me/annonces', (req, res)=> {
        Annonce.find({}, (err, annonces) => {
            if(err) {
                res.send(err)
            } else {
                res.render("userAnnonce", {annonces : annonces}) 
            }
        })
    })