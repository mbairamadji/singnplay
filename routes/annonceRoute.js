const express       = require("express")
const Router        = express.Router()
const regMiddleware = require("../middlewares/regMiddleware")
const Annonce       = require("../models/annonce")
const request       = require("request")


var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDSWoLFFZuR8O2uTZgfmOkB1yW18XOnli0'
});
const googleKey = 'AIzaSyDSWoLFFZuR8O2uTZgfmOkB1yW18XOnli0'

function geocodeLatReq(adresse) {
  request(`https://maps.googleapis.com/maps/api/geocode/json?address=${adresse}&key=${googleKey}`,(err, response, body)=> {
      if(!err && response.statusCode == 200) {
         return JSON.parse(body).results[0].geometry.location.lat;
             
      }
  })  
};


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
            titre   : req.body.titre,
            contenu : req.body.contenu,
            image   : req.file.path.slice(6),
            tag     : req.body.tag,
            
        }, (err, annonce) => {
            if (err) {
             res.send(err)   
            } else {
             annonce.author.id = req.user._id;
             annonce.author.username = req.user.username;
             annonce.author.adresse = req.user.adresse;
             annonce.author.image = req.user.image;
    
            googleMapsClient.geocode({
              address: annonce.author.adresse
            }, function(err, response) {
              if (err) {
                  console.log(err)
              } else {
                 annonce.author.geometry.lat = response.json.results[0].geometry.location.lat;
                 annonce.author.geometry.long = response.json.results[0].geometry.location.lng;
                 annonce.save(err => {
                 if (err) {
                     res.send(err)
                    } else {
                      console.log(annonce)
                      res.redirect("/") 
                  }
                 })
              }
             
            } );
             
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
