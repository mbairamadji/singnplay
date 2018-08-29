const mongoose = require('mongoose')
const bcrypt = require("bcrypt")

const UserSchema = new mongoose.Schema({
        username :   { type : String,
                   required : true, 
                     unique : true
                    },
        password :   { type : String,
                   required : true
                      },
        email    :   { type : String,
                   required : true, 
                     unique : true
                      },
        age: Date,
        image : String,
        adresse : String,
        loc : {
                type : {type: String, default: "Point" },
                coordinates : { type: [Number]},
                
                        },
        city : String,
        phone : String,
        resetPasswordToken   : String,
        resetPasswordExpires : Date
})

UserSchema.index({ loc : "2dsphere"});


UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model("User", UserSchema)