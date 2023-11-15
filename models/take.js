const mongoose = require('mongoose')
const Comment = require('./comment');

const Schema = mongoose.Schema;


const postSchema = new Schema ({
    author: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    hashtag: {
        type: String,
        required: true
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    profile: [{
        type: Schema.Types.ObjectId,
        ref: 'Profile'
    }]
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

postSchema.post('findOneAndDelete', async function (doc) {
    if(doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

module.exports = mongoose.model('Post', postSchema);

