const mongoose = require("mongoose")
const Schema = mongoose.Schema


const AnnonceSchema = new Schema({
    titre : String,
    contenu : String,
    image : String,
    tag : String,
    media : String,
    date : {
        type : Date,
        default : Date.now
    },
    commentaires : [{
        type : Schema.Types.ObjectId,
        ref : 'Comment'
    }],
    author : {
            id : {type : Schema.Types.ObjectId, ref : "User" },
            username : String,
            adresse : String,
            geometry : {
               long : Number,
               lat : Number
            },
            city : String,
            image : String,
            email : String,
            phone : String,
            age : Date
    }
})

module.exports = mongoose.model("Annonce", AnnonceSchema)