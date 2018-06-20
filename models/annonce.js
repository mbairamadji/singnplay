const mongoose = require("mongoose")
const Schema = mongoose.Schema

const AnnonceModel = new Schema({
    titre : String,
    contenu : String,
    image : String,
    tag : String,
    date : {
        type : Date,
        default : Date.now
    },
    commentaires : [{
        type : Schema.Types.ObjectId,
        ref : 'Comment'
    }],
    author : {
        id : {type : mongoose.Schema.Types.ObjectId, ref : "User" },
        username : String
    }
    
})

module.exports = mongoose.model("Annonce", AnnonceModel)