const express  = require("express")
const Router   = express.Router({ mergeParams : true})
const passport = require("passport")
const Annonce  = require("../models/annonce")
const Comment  = require("../models/comment")
const middlewareObj  = require("../middlewares/middlewares")

module.exports = Router

// Ajouter un commentaire
    .post('/annonces/:id/comments', middlewareObj.isLoggedIn, (req, res) => {
        Annonce.findById(req.params.id, (err, annonce) => {
            if (err) {
              res.send(err)  
            } else {
               Comment.create(req.body.comment, (err, comment)=> {
                  if (err) {
                      res.send(err)
                  } else {
                    comment.author = req.user._id;
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
