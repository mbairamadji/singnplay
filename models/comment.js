const mongoose = require('mongoose')


const CommentSchema = new mongoose.Schema({
    text : String,
    date : {
        type : Date,
        default : Date.now
    },
    author : {type : mongoose.Schema.Types.ObjectId, ref : 'User'}
})


module.exports = mongoose.model("Comment", CommentSchema)