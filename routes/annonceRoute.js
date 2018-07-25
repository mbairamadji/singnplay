const express        = require("express")
const Router         = express.Router()
const middlewareObj  = require("../middlewares/middlewares")
const Annonce        = require("../models/annonce")
const request        = require("request")
const dotenv         = require("dotenv")
dotenv.config()

var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_KEY
});


module.exports = Router

//Get toutes les annonces
    .get('/', (req, res) => {
        Annonce.find({}, (err, allAnnonces) => {
            err ? res.send(err) : res.render('index', { annonces: allAnnonces})
        })
    })

// Créer une annonce
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
                      console.log(annonce)
                      res.redirect("/") 
                            }
                        });
                    }
                });
            }
        })
    })

// Le formulaire pour ajouter une nouvelle annonce
    .get('/ajouter', middlewareObj.isLoggedIn, (req, res) => {
        res.render('new')
    })

// Get une annonce par son id
    .get('/:id', middlewareObj.isLoggedIn, (req, res) => {
        Annonce.findById(req.params.id)
        .populate("commentaires")
        .exec((err, annonce) => {
            if (err) {
              res.send(err)  
            } else {              
               res.render('annonce' , {annonce : annonce}) 
            }
        }) 
    })

// Formulaire d'édition d'une annonce
    .get('/:id/edit', middlewareObj.isLoggedIn, (req, res) => {
       Annonce.findById(req.params.id, (err, annonce)=> {
           err ? res.send(err) : res.render('edit', { annonce : annonce})
       })
    })
// Editer une annonce par son id
    .put('/:id', middlewareObj.checkOwnership, middlewareObj.regMiddleware,(req, res) => {
        Annonce.findById(req.params.id, (err, annonce) => {
            if (err) {
                res.send(err)
            } else {
            annonce.titre = req.body.titre;
            annonce.contenu = req.body.contenu;
            if (req.file) {
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
