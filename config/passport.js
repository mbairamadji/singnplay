const passport      = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User          = require("../models/user")

//Configuration Google Maps
var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_KEY
});

module.exports = function(passport) {
    
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    })
    
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        })
    })
    
    //Local-Strategy pour Signup
     passport.use("local-signup", new LocalStrategy({
         passReqToCallback : true
     },
        function (req, username, password, done) {
          User.findOne({'username' : username}, (err, user) => {
              if (err) {return done(err)}
              if (user) {
                  return done(null, false, req.flash('error_message', "Identifiant déjà utilisé!"))
              } else {
                  let newUser = new User();
                  newUser.username = username;
                  newUser.password = newUser.generateHash(password);
                  newUser.email    = req.body.email;
                  newUser.age      = req.body.age;
                  newUser.image    = req.file.path;
                  newUser.adresse  = req.body.adresse;
                  newUser.phone    = req.body.phone;
                  
                  googleMapsClient.geocode({
                      address : newUser.adresse
                  }, (err, response) => {
                      if(err) {
                          req.flash("error_message", "L'adresse n'a oas été localisée")
                          return done(err)
                      } else {
                           newUser.loc = {type : "Point", coordinates : [response.json.results[0].geometry.location.lng, 
                                                           response.json.results[0].geometry.location.lat]
                           }
                           newUser.city = response.json.results[0].address_components[2].long_name; 
                          newUser.save((err) => {
                          if (err)
                          throw err;
                          return done(null, newUser)
                        })
                      }
                  })
              }
          })  
        }
    ));
    
    passport.use('local-login', new LocalStrategy({ 
        passReqToCallback : true
    },
        function (req, username, password, done) {
            User.findOne({ 'username' : username}, (err, user) => {
                if(err)
                    return done(err);
                if(!user)
                    return done(null, false, req.flash('error_message', "Utilisateur inconnu! Veuillez créer un compte svp!"))
                if(!user.validPassword(password))
                    return done(null, false, req.flash('error_message', "Mot de passe invalide!"));
                return done(null, user)
                
            })
        }    
    
    ))
}







