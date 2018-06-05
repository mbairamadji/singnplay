const express    = require('express')
const Annonce    = require('./models/annonce')
const Comment    = require('./models/comment')
const User       = require('./models/user')
const passport   = require('passport')

const router     = express.Router()


module.exports =  router

//Rediriger vers la page d'accueil
    .get('/', (req, res) => {
        res.redirect('/annonces')
    })

// A propos

    .get('/apropos', (req, res) => {
        res.render('apropos')
    })
//Get toutes les annonces
    .get('/annonces', (req, res) => {
        Annonce.find({}, (err, allAnnonces) => {
            err ? res.send(err) : res.render('index', { annonces: allAnnonces})
        })
    })

// Créer une annonce
    .post('/annonces',isLoggedIn, (req, res) => {
        Annonce.create({
            titre : req.body.titre,
            image : req.body.image,
          contenu : req.body.contenu,
              tag : req.body.tag
        }, (err, annonce) => {
            if (err) {
             res.send(err)   
            } else {
             res.redirect("/")  
            }
        })
    })

// Le formulaire pour ajouter une nouvelle annonce
    .get('/annonces/new',isLoggedIn, (req, res) => {
        res.render('new')
    })

// Get une annonce par son id
    .get('/annonces/:id', (req, res) => {
        Annonce.findById(req.params.id)
        .populate("comments")
        .exec((err, annonce) => {
            if (err) {
              res.send(err)  
            } else {              
               res.render('annonce' , {annonce : annonce}) 
            }
        }) 
    })

// Formulaire d'édition d'une annonce
    .get('/annonces/:id/edit', (req, res) => {
       Annonce.findById(req.params.id, (err, annonce)=> {
           err ? res.send(err) : res.render('edit', { annonce : annonce})
       })
    })
// Editer une annonce par son id
    .put('/annonces/:id', (req, res) => {
        Annonce.findById(req.params.id, (err, annonce) => {
            if (err) {
                res.send(err)
            } else {
                annonce.titre    = req.body.titre
                annonce.image    = req.body.image
                annonce.contenu  = req.body.contenu
                annonce.tag      = req.body.tag
                
                annonce.save(err => {
                    err ? res.send(err) : res.redirect('/annonces/' + req.params.id )
                })
            }
        })
    })

// Supprimer une annonce
    .delete('/annonces/:id', (req, res) => {
        Annonce.findByIdAndRemove(req.params.id, (err, annonce) => {
            err ? res.send(err) : res.redirect('/annonces')
        })
    })

// Formulaire d'ajout d'un commentaire

    .get('/annonces/:id/comments/new', isLoggedIn, (req, res) => {
        Annonce.findById(req.params.id, (err, annonceACommenter) => {
            if (err) {
              res.send(err)  
            } else {
                res.render('comment', { annonce : annonceACommenter}) 
            }
        })
    })
// Ajouter un commentaire
    .post('/annonces/:id/comments', isLoggedIn, (req, res) => {
        Annonce.findById(req.params.id, (err, annonce) => {
            if (err) {
              res.send(err)  
            } else {
               Comment.create(req.body.comment, (err, comment)=> {
                  if (err) {
                      res.send(err)
                  } else {
                    annonce.comments.push(comment);
                    annonce.save((err) => {
                        err ? res.send(err) : res.redirect('/annonces/' + req.params.id)
                    })     
                  }
               })               
            }
        })
    })

// S'inscrire

    .get('/inscription', (req, res) => {
    res.render("register")
    })

    .post('/inscription', (req, res) => {
        User.register({ username : req.body.username}, req.body.password, req.body.age, req.body.ville, 
            (err, user)=> {
            if (err) {
              console.log(err);
              return res.render('register');
            } else {
              passport.authenticate("local")(req, res, () => {
                 res.redirect('/annonces')
              })
            }
        })
    })

//Login

    .get('/login', (req, res) => {
        res.render('login')
    })

    .post('/login', passport.authenticate("local", {
        successRedirect : '/annonces',
        failureRedirect : '/login'

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
