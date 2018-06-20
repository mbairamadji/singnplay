const multer = require("multer")

function regMiddleware (req, res, next) {
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
    //  console.log(req.file)
      req.uploadError = err;
      next();
  })
}

module.exports = regMiddleware