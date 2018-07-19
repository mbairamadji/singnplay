const express  = require("express")
const Router   = express.Router({ mergeParams : true})
const passport = require("passport")
const Annonce  = require("../models/annonce")
const Comment  = require("../models/comment")

module.exports = Router
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
                    comment.author.username = req.user.username;
                    comment.author.image    = req.user.image
                    comment.save((err) => {
                        if (err) {
                            res.send(err)
                        } else {
                           annonce.commentaires.push(comment);
                           annonce.save(err => {
                               if(err) {
                                   res.send(err)
                               } else {
                                   res.redirect('/annonces/' + req.params.id)
                               }
                           })
                        }
                    })     
                  }
               })               
            }
        })
    })

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) {
    return next();
}
    res.redirect('/login')
}
