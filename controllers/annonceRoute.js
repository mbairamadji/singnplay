const express        = require("express")
const Router         = express.Router()
const mongoose       = require("mongoose")
const middlewareObj  = require("../middlewares/middlewares")
const Annonce        = require("../models/annonce")
const User           = require("../models/user")
const moment         = require("moment")
const request        = require("request")
const dotenv         = require("dotenv")
dotenv.config()


//Configuration Mailgun-js
const api_key = process.env.MAILGUN_KEY
const domain  = 'sandbox03735235dcd546c38f67dc99f6048854.mailgun.org'
const mailgun = require('mailgun-js')({apiKey : api_key, domain : domain})


module.exports = Router

//Get toutes les annonces
    .get('/', (req, res) => {
        Annonce.find({})
        .sort({ date : -1})
        .populate("authorId")
        .exec((err, allAnnonces) => {
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
       Annonce.find({})
       .sort({ date : -1})
       .populate("authorId")
       .exec((err, annonces) => {
          err ? res.send(err) : res.render('annonce/corde', { annonces: annonces , moment : moment})  
        }) 
    })
// Route de la catégorie "vent"

    .get('/categories/vent', (req, res) => {
       Annonce.find({})
       .sort({ date : -1})
       .populate("authorId")
       .exec((err, annonces) => {
          err ? res.send(err) : res.render('annonce/vent', { annonces: annonces , moment : moment})  
        }) 
    })
// Route de la catégorie "percussion"

    .get('/categories/percussion', (req, res) => {
       Annonce.find({})
       .sort({ date : -1})
       .populate("authorId")
       .exec((err, annonces) => {
          err ? res.send(err) : res.render('annonce/percussion', { annonces: annonces ,  moment : moment})  
        }) 
    })
// Route de la catégorie "voix"

    .get('/categories/voix', (req, res) => {
       Annonce.find({})
       .sort({ date : -1})
       .populate("authorId")
       .exec((err, annonces) => {
          err ? res.send(err) : res.render('annonce/voix', { annonces: annonces ,  moment : moment})  
        }) 
    })
// Le formulaire pour ajouter une nouvelle annonce
    .get('/ajouter', middlewareObj.isLoggedIn, (req, res) => {
        res.render('annonce/new')
    })

// Ajouter une annonce
    .post('/', middlewareObj.isLoggedIn, middlewareObj.regMiddleware, (req, res) => {
        const newAnnonce = new Annonce();
        newAnnonce.titre           = req.body.titre;
        newAnnonce.contenu         = req.body.contenu;
        if (req.file) {
            newAnnonce.image       = req.file.path.slice(6);    
        } else {
            newAnnonce.image       = req.user.image.slice(6);
        }
        newAnnonce.tag             = req.body.tag;
        newAnnonce.annonceLoc      = req.user.loc;
        console.log(newAnnonce)
        console.log(req.user)
        newAnnonce.authorId = req.user._id;
        newAnnonce.save((err, annonce) => {
            if (err) {
            req.flash("error_message", "L'annonce n'a pu être ajoutée") 
            res.redirect('back')
            } else {
                res.redirect("/annonces") 
            }
        })
    })

// Get une annonce par son id
    .get('/:id', middlewareObj.isLoggedIn, (req, res) => {
        Annonce.findById(req.params.id)
        .populate("authorId")
        .populate({
            path : "commentaires", 
            populate : {path : "author" }})
        .exec((err, annonce) => {
            if (err) {
              res.redirect('back')  
            } else {       
               res.render('annonce/annonce' , {annonce : annonce, moment : moment}) 
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
        Annonce.findById({_id :req.params.id}, (err, annonce) => {
            if (err) {
                res.redirect('back')
            } else {
            annonce.titre = req.body.titre;
            annonce.contenu = req.body.contenu;
            annonce.tag = req.body.tag;
            if (req.file) { //Eviter erreur si pas de fichier ajouté
              annonce.image = req.file.path.slice(6);  
            }
            if (annonce.annonceLoc !== req.user.loc ) {
                annonce.annonceLoc = req.user.loc
            }
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
//Ajouter une video

    .post('/:id/video', middlewareObj.checkOwnership, (req, res) => {
        Annonce.findById(req.params.id, (err, annonce) => {
            if (err) {
                res.redirect('back');
            } else {
                 annonce.media = req.body.video;
                 annonce.save(err => {
                     if(err) {
                         req.flash("error_message", "Media non ajouté");
                         res.redirect('back')
                     } else {
                         res.redirect('/annonces/' + req.params.id)
                     }
                 })
            }
        })
    })

// Envoyer un message à l'auteur de l'annonce
    .post('/:id/send_message', middlewareObj.isLoggedIn, (req, res) => {
      Annonce.findById({_id :req.params.id})
      .populate("authorId")
      .exec((err, annonce) => {
          if (err) {
              res.redirect('back')
          } else {
            const data = {
            from :  req.user.email,
            to : annonce.authorId.email,
            subject : req.body.subject,
            text : req.body.text
             }
             
             mailgun.messages().send(data, (error, body) => {
                 if (error) {
                     req.flash('error_message', 'Message non envoyé')
                 } else {
                 req.flash('success_message', 'Message envoyé')
                 res.redirect('back')
                 console.log(body)
                 }
             })
          }
      })
    })

// Faire une recherche sur les insruments à corde

    .post('/search/category_corde/10km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 10000
                    }
                 }
              })
        .where('tag').in('corde')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                   
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
    
     .post('/search/category_corde/25km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 25000
                    }
                 }
              })
        .where('tag').in('corde')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
    
     .post('/search/category_corde/50km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 50000
                    }
                 }
              })
        .where('tag').in('corde')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
        
 // Faire une recherche sur les instruments à vent 
    .post('/search/category_vent/10km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 10000
                    }
                 }
              })
        .where('tag').in('vent')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                   
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
    
     .post('/search/category_vent/25km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 25000
                    }
                 }
              })
        .where('tag').in('vent')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
    
     .post('/search/category_vent/50km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 50000
                    }
                 }
              })
        .where('tag').in('vent')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
        
// Faire une recherche sur les percussions 
    .post('/search/category_percussion/10km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 10000
                    }
                 }
              })
        .where('tag').in('percussion')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                   
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
    
     .post('/search/category_percussion/25km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 25000
                    }
                 }
              })
        .where('tag').in('percussion')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
    
     .post('/search/category_percussion/50km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 50000
                    }
                 }
              })
        .where('tag').in('percussion')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
        
// Faire une recherche sur les cat voix
    .post('/search/category_voix/10km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 10000
                    }
                 }
              })
        .where('tag').in('voix')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                   
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
    
     .post('/search/category_voix/25km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 25000
                    }
                 }
              })
        .where('tag').in('voix')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
    
     .post('/search/category_voix/50km', (req,res) => {
        Annonce.find({
                'annonceLoc' : {
                    $near : {
                        $geometry  : {
                         type : "Point",  
                         coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                        $maxDistance : 50000
                    }
                 }
              })
        .where('tag').in('voix')
        .populate('authorId')
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                } else {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                }
            })
        })
  /*  populate.match not working
  .post('/search/50km', (req,res) => {
        Annonce.find({})
        .populate({
            path : "authorId", 
            match :
             { 'loc' : {
                $near : {
                    $geometry  : {
                     type : "Point",  
                     coordinates : [req.user.loc.coordinates[0], req.user.loc.coordinates[1]]
                         },
                     $maxDistance : 50000,
                     $minDistance : 10000
                    }
                }}})
        .exec( (err, annonces) => {
                if (err) {
                    req.flash('error_message', "Recherche non aboutie!")
                    res.send(err)
                } else {
                    if (annonces.length > 0) {
                    res.render("annonce/search", { annonces : annonces, moment : moment })
                    } else {
                        res.render("annonce/noresults")
                    }
                }
            })
        })
    */