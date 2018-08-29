const multer = require("multer")
const Annonce = require("../models/annonce")

let middlewareObj = {}

middlewareObj.regMiddleware = (req, res, next)  => {
  let imageName;
  const uploadStorage = multer.diskStorage({
    destination : function(req, file, cb) {
        cb(null,  './public/uploads')
    },
    filename : function(req, file, cb){
        console.log(file)
        let imageName = file.originalname
        cb(null, imageName)
    }
  });
  const upload = multer({storage : uploadStorage}).single('photo');
  upload(req, res, (err) => {
      console.log(req.file)
      req.uploadError = err;
      next();
  })
}

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
    return next();
  }
    req.flash("Vous n'êtes pas connecté!")
    res.redirect('/login')
}


middlewareObj.checkOwnership = (req, res, next) => {
    if(req.isAuthenticated()) {
        Annonce.findById(req.params.id, (err, annonce) => {
            if (err) {
                res.send(err)
            } else {
                    if (annonce.authorId._id.equals(req.user._id)) {
                        next();
                    } else {
                    res.redirect("back")
                }
            }
        })
    } else {
         res.redirect("back")
    }
}

module.exports = middlewareObj