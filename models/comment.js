const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema ({
    name: String,
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model("Comment", commentSchema)