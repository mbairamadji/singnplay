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
    authorId : { type : Schema.Types.ObjectId, ref : "User"
    },
    annonceLoc : {
    type : {type: String, default: "Point" },
    coordinates : { type: [Number]},
     },
})

AnnonceSchema.index({ "annonceLoc" : "2dsphere"})
module.exports = mongoose.model("Annonce", AnnonceSchema)