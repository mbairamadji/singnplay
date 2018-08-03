const express        = require("express")
const Router         = express.Router()
const middlewareObj  = require("../middlewares/middlewares")
const Annonce        = require("../models/annonce")
const moment         = require("moment")
const request        = require("request")
const dotenv         = require("dotenv")
dotenv.config()

//Configuration Mailgun-js
const api_key = process.env.MAILGUN_KEY
const domain  = 'sandbox03735235dcd546c38f67dc99f6048854.mailgun.org'
const mailgun = require('mailgun-js')({apiKey : api_key, domain : domain})

//Configuration Google Maps
var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_KEY
});


module.exports = Router

//Get toutes les annonces
    .get('/', (req, res) => {
        Annonce.find({}, (err, allAnnonces) => {
            err ? res.send(err) : res.render('annonce/index', { annonces: allAnnonces, moment : moment})
        })
    })
// Route des catégories

    .get('/categories', (req, res) => {
        Annonce.find({}, (err, annonces) => {
          err ? res.send(err) : res.render('annonce/category')  
        })
    })
    
// Route de la catégorie "corde"

    .get('/categories/corde', (req, res) => {
       Annonce.find({}, (err, annonces) => {
          err ? res.send(err) : res.render('annonce/corde', { annonces: annonces})  
        }) 
    })
// Route de la catégorie "vent"

    .get('/categories/vent', (req, res) => {
       Annonce.find({}, (err, annonces) => {
          err ? res.send(err) : res.render('annonce/vent', { annonces: annonces})  
        }) 
    })
// Route de la catégorie "percussion"

    .get('/categories/percussion', (req, res) => {
       Annonce.find({}, (err, annonces) => {
          err ? res.send(err) : res.render('annonce/percussion', { annonces: annonces})  
        }) 
    })
// Route de la catégorie "voix"

    .get('/categories/voix', (req, res) => {
       Annonce.find({}, (err, annonces) => {
          err ? res.send(err) : res.render('annonce/voix', { annonces: annonces})  
        }) 
    })
// Le formulaire pour ajouter une nouvelle annonce
    .get('/ajouter', middlewareObj.isLoggedIn, (req, res) => {
        res.render('annonce/new')
    })

// Ajouter une annonce
    .post('/', middlewareObj.isLoggedIn, middlewareObj.regMiddleware, (req, res) => {
        Annonce.create({
            titre   : req.body.titre,
            contenu : req.body.contenu,
            image   : req.file.path.slice(6),
            tag     : req.body.tag,
        }, (err, annonce) => {
            if (err) {
             res.send(err)   
            } else {
             annonce.author.id       = req.user._id;
             annonce.author.username = req.user.username;
             annonce.author.email    = req.user.email;
             annonce.author.adresse  = req.user.adresse;
             annonce.author.image    = req.user.image;
             annonce.author.phone    = req.user.phone;
    
            googleMapsClient.geocode({
              address: annonce.author.adresse
            }, function(err, response) {
              if (err) {
                  console.log(err)
              } else {
                 // console.log(response.json.results)
                 annonce.author.geometry.lat = response.json.results[0].geometry.location.lat;
                 annonce.author.geometry.long = response.json.results[0].geometry.location.lng;
                 annonce.author.city = response.json.results[0].address_components[2].long_name;
                 annonce.save(err => {
                 if (err) {
                     res.send(err)
                    } else {
                      res.redirect("/annonces") 
                            }
                        });
                    }
                });
            }
        })
    })

// Get une annonce par son id
    .get('/:id', middlewareObj.isLoggedIn, (req, res) => {
        Annonce.findById(req.params.id)
        .populate("commentaires")
        .exec((err, annonce) => {
            if (err) {
              res.redirect('back')  
            } else {              
               res.render('annonce/annonce' , {annonce : annonce}) 
            }
        }) 
    })

// Formulaire d'édition d'une annonce
    .get('/:id/edit', middlewareObj.isLoggedIn, (req, res) => {
       Annonce.findById(req.params.id, (err, annonce)=> {
           err ? res.send(err) : res.render('annonce/edit', { annonce : annonce})
       })
    })
// Editer une annonce par son id
    .put('/:id', middlewareObj.checkOwnership, middlewareObj.regMiddleware,(req, res) => {
        Annonce.findById(req.params.id, (err, annonce) => {
            if (err) {
                res.redirect('back')
            } else {
            annonce.titre = req.body.titre;
            annonce.contenu = req.body.contenu;
            if (req.file) { //Eviter erreur si pas de fichier ajouté
              annonce.image = req.file.path.slice(6);  
            }
            annonce.tag = req.body.tag;
            annonce.save(err => {
                if (err){
                    res.send(err)
                    } else {
                    res.redirect('/annonces/' + req.params.id )
                    }
                })
            }
        })
    })

// Supprimer une annonce
    .delete('/:id', middlewareObj.checkOwnership, (req, res) => {
        Annonce.findByIdAndRemove(req.params.id, (err, annonce) => {
            err ? res.send(err) : res.redirect('/annonces')
        })
    })

// Envoyer un message à l'auteur de l'annonce
    .post('/:id/send_message', middlewareObj.isLoggedIn, (req, res) => {
      Annonce.findById(req.params.id, (err, annonce) => {
          if (err) {
              res.redirect('back')
          } else {
            const data = {
            from :  req.user.email,
            to : annonce.author.email,
            subject : req.body.subject,
            text : req.body.text
             }
             
             mailgun.messages().send(data, (error, body) => {
                 if (error) {
                     req.flash('error_message', 'Message non envoyé')
                 }
                 req.flash('success_message', 'Message envoyé')
                 res.redirect('back')
                 console.log(body)
             })
          }
      })
    })