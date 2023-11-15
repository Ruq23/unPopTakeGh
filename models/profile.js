const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const profileSchema = new Schema ({
    
     firstName: {
       type: String,
         required: [true, 'We need your first name']
     },
     lastName: {
         type: String,
         required: [true, 'We need your last name']
     },
     aboutMe: {
         type: String
     },
     email: {
        type: String
     },
     dob: {
        type: Date
     },
     location: {
         type: String,
         required: [true, "General Location"]
    },
    interests: {
        type: [String],
        required: true,
        enum: ['politics', 'sports', 'lgbtq', 'media', 'history'],
        lowercase: true
    },
    image: {
        url: String,
        filename: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
})

module.exports = mongoose.model("Profile", profileSchema)