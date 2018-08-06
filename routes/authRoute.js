const express        = require("express")
const router         = express.Router()
const passport       = require("passport")
const multer         = require("multer")
const nodemailer     = require("nodemailer")
const async          = require("async")
const crypto         = require("crypto")
const middlewareObj  = require("../middlewares/middlewares")
const User           = require("../models/user")
const Annonce        = require("../models/annonce")
const moment         = require("moment")
const Comment        = require("../models/comment")
module.exports = router

//Rediriger vers la page d'accueil
    .get('/', (req, res) => {
        res.redirect('/accueil')
    })

// A propos
 .get('/accueil', (req, res) => {
        res.render('annonce/accueil')
    })
// Formulaire de connexion

    .get('/login', (req, res) => {
        res.render('user/login')
    })
// Formulaire d'inscription
    .get('/inscription', (req, res) => {
    res.render("user/register")
    })

// Route d'inscription
   .post('/inscription', middlewareObj.regMiddleware,passport.authenticate("local-signup", {
        successRedirect : '/annonces',
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
    
// Formulaire de mot de passe oublié
    .get('/forgot', (req, res) => {
        res.render('user/forgot')
    })
    
// Route d'envoi du mail de mot de passe oublié

    .post('/forgot', (req, res, next) => {
        async.waterfall([
            (done) => {
                crypto.randomBytes(20, (err, buf) => {
                    const token = buf.toString('hex');
                    done(err, token)
                });
            },
            (token, done) => {
                User.findOne({ email : req.body.email }, (err, user) => {
                    if(!user){
                        req.flash("error_message", "Pas d'utilisateur ayant cet email");
                        return res.redirect('/forgot')
                    }
                    
                    user.resetPasswordToken   = token;
                    user.resetPasswordExpires = Date.now() + 3600000 //expire dans une heure
                    user.save(err => {
                        done(err, token, user)
                    });
                });
            },
            (token, user, done) => {
                const smtpTransport = nodemailer.createTransport({
                    service : 'gmail',
                    auth : {
                        user : 'mbairamadjieric@gmail.com',
                        pass : process.env.GMAILPWD
                    }
                });
                const mailOptions = {
                    to      : user.email,
                    from    : 'mbairamadjieric@gmail.com',
                    subject : 'Modification de votre mot de passe',
                    text    : "Vous recevez ce message parce que vous avez fait la demande de la modification de votre mot de passe. \n\n" +
                               "Cliquez sur le lien ci-dessous, sinon collez-le dans la barre d'adresse de votre navigateur pour finaliser la modification. \n\n " +
                               "http://" + req.headers.host + '/reset/' + token + '\n\n' + 
                               "Si vous n'avez pas fait de demande de changement de mot de passe, merci d'ignorer ce message. \n"
                };
                smtpTransport.sendMail(mailOptions, (err) => {
                    req.flash("success_message", "Un email a été envoyé à " + user.email);
                    done(err, 'done');
                });
              } 
            ], (err => {
                if(err) return next(err);
                res.redirect('/forgot')
            })
            )
    })

// Route du formulaire de changement de mot de passe

    .get('/reset/:token' , (req, res) => {
     User.findOne({ resetPasswordToken : req.params.token, resetPasswordExpires : { $gt : Date.now()}}, (err, user) =>{
         if(!user) {
             req.flash("error_message", "Le lien de modification du mot de passe est soit invalide ou a soit expiré ")
             return res.redirect("/forgot")
         }
            res.render('user/reset', { token : req.params.token})
     }) ;
    })
    
// Route d'envoie du nouveau mot de passe
    .post('/reset/:token', (req, res) => {
        async.waterfall([
            (done, password) => {
                User.findOne({ resetPasswordToken : req.params.token , resetPasswordExpires : { $gt : Date.now() }}, (err, user) => {
                 if(!user) {
                  req.flash("error_message", "Le lien de modification du mot de passe est soit invalide ou a soit expiré ")
                  return res.redirect("back")
                 } 
                 if(req.body.password === req.body.confirm) {
                   user.password = user.generateHash(req.body.password);
                   user.resetPasswordToken = undefined;
                   user.resetPasswordExpires = undefined;
                   
                   user.save(err => {
                       req.logIn(user, (err) => {
                           done(err, user)
                       })
                    })
                  } else {
                      req.flash('error_message', "Les mots de passe ne correspondent pas")
                  }
                })
            },
            (user, done) => {
                const smtpTransport = nodemailer.createTransport({
                    service : 'gmail',
                    auth : {
                        user : 'mbairamadjieric@gmail.com',
                        pass : process.env.GMAILPWD
                    }
                });
                const mailOptions = {
                    to      : user.email,
                    from    : 'mbairamadjieric@gmail.com',
                    subject : 'Mot de passe modifié',
                    text    : "Nous vous confirmons la modification de votre mot de passe Sing'n'Play. \n\n" 
                               
                };
                smtpTransport.sendMail(mailOptions, (err) => {
                    req.flash("success_message", "Mot de passe modifié!" );
                    done(err);
                });
              } 
            ],
            (err => {
                res.redirect('/annonces')
            })
            )
    })

//Route de l'utilisateur

    .get('/users/:id',  middlewareObj.isLoggedIn, (req, res) => {
        User.findById(req.params.id, (err, user) => {
            if (err) {
                res.send(err) 
            } else {
               res.render('user/user', {user : req.user})  
            }
        })
    })

//Formulaire de modification des détails de l'utilisateur 

    .get('/users/:id/update', middlewareObj.isLoggedIn, (req, res) => {
        User.findById(req.params.id, (err, user) => {
            if (err) {
                res.send(err) 
            } else {
               res.render('user/updateUser', { user : req.user}) 
            }
        })
    })

//Routes de modification des détails de l'utilisateur  

    .post('/users/:id/update', middlewareObj.isLoggedIn, (req, res, next) => {
        User.update( {_id : req.session.passport.user}, 
        { username : req.body.username,
          email    : req.body.email,
          adresse  : req.body.adresse,
          phone    : req.body.phone,
        }, (err, user) => {
            if (err)  return next(err);
            User.findById(req.user._id, (err, user) => {
                if (err) return next(err);
                 req.flash("success_message", "Votre profil a été modifié")
                 res.redirect('/users/' + req.params.id);
            })
        })
    })
    
//Routes des annonces de l'utilisateur

    .get('/users/:id/annonces', middlewareObj.isLoggedIn, (req, res)=> {
        User.findById(req.params.id, (err) => {
            if(err) {
                res.send(err)
            } else {
                Annonce.find({}, (err, annonces) => {
                    if(err) {
                        res.send(err)
                    }
                    res.render("user/userAnnonce", {annonces : annonces, moment : moment}) 
                })
            }
        })
    })
    
    // Supprimer un utilisateur

    .delete('/users/:id/delete', middlewareObj.isLoggedIn, (req, res) => {
        Comment.find({}, (err, comments) => {
            if(err) res.redirect('back');
            comments.map(comment => {
                if(comment.author.id.equals(req.params.id)) {
                    comment.remove( err => {
                        if (err) res.redirect('back');
                    });
                }
            })
        })
        Annonce.find({}, (err, annonces) => {
            if(err) res.redirect('back');
            annonces.map(annonce => {
                if(annonce.author.id.equals(req.params.id)) {
                    annonce.remove( err => {
                        if (err) res.redirect('back');
                    });
                }
            })
        })
        User.findById(req.params.id, (err, user) => {
            if(err) res.redirect('back');
            user.remove(err => {
                if (err) res.redirect('back');
                req.flash("successRedirect", "Vous avez supprimé vos comptes ainsi que  vos annonces")
                req.logout();
                res.redirect('/annonces')
            })
        })
      })
    
    