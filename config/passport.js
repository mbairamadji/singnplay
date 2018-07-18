const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("../models/user")

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
                  return done(null, false)
              } else {
                  let newUser = new User();
                  newUser.username = username;
                  newUser.password = newUser.generateHash(password);
                  newUser.age      = req.body.age;
                  newUser.image    = req.file.path;
                  newUser.adresse  = req.body.adresse;
                  newUser.phone    = req.body.phone;
                  newUser.save((err) => {
                      if (err)
                      throw err;
                      return done(null, newUser)
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
                    return done(null, false)
                if(!user.validPassword(password))
                    return done(null, false);
                return done(null, user)
                
            })
        }    
    
    ))
}







