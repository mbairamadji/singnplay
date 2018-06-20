const express        = require("express")
const router         = express.Router()
const passport       = require("passport")
const multer         = require("multer")
const regMiddleware  = require("../middlewares/regMiddleware")
const User           = require("../models/user")

module.exports = router

//Rediriger vers la page d'accueil
    .get('/', (req, res) => {
        res.redirect('/annonces')
    })

// A propos
 .get('/apropos', (req, res) => {
        res.render('apropos')
    })
    
// Formulaire d'inscription
    .get('/inscription', (req, res) => {
    res.render("register")
    })

// Route d'inscription
   .post('/inscription', regMiddleware,passport.authenticate("local-signup", {
        successRedirect : '/',
        failureRedirect : '/inscription',
        failureFlash : true
    }))

//Login
    .post('/login', passport.authenticate("local-login", {
        successRedirect : '/annonces',
        failureRedirect : '/inscription'

    }), (req, res) => {
        
    })
//Logout
    .get('/logout', (req, res) => {
        req.logout();
        res.redirect('/annonces')
    })

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) {
    return next();
}
    res.redirect('/login')
}
