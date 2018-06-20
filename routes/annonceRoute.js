const express       = require("express")
const Router        = express.Router()
const regMiddleware = require("../middlewares/regMiddleware")
const Annonce       = require("../models/annonce")

module.exports = Router

//Get toutes les annonces
    .get('/', (req, res) => {
        Annonce.find({}, (err, allAnnonces) => {
            err ? res.send(err) : res.render('index', { annonces: allAnnonces})
        })
    })

// Créer une annonce
    .post('/', regMiddleware, (req, res) => {
        Annonce.create({
            titre : req.body.titre,
            contenu : req.body.contenu,
            image : req.file.path.slice(6),
            tag : req.body.tag
        }, (err, annonce) => {
            if (err) {
             res.send(err)   
            } else {
             res.redirect("/") 
             console.log(annonce)
            }
        })
    })

// Le formulaire pour ajouter une nouvelle annonce
    .get('/ajouter', (req, res) => {
        res.render('new')
    })

// Get une annonce par son id
    .get('/:id', (req, res) => {
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
    .get('/:id/edit', (req, res) => {
       Annonce.findById(req.params.id, (err, annonce)=> {
           err ? res.send(err) : res.render('edit', { annonce : annonce})
       })
    })
// Editer une annonce par son id
    .put('/:id', (req, res) => {
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
    .delete('/:id', (req, res) => {
        Annonce.findByIdAndRemove(req.params.id, (err, annonce) => {
            err ? res.send(err) : res.redirect('/annonces')
        })
    })
    
    
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) {
    return next();
}
    res.redirect('/login')
}
