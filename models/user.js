const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcrypt');


const UserSchema = new Schema ({
    username: {
        type: String,
        required: [true, 'Username cannot be blank my oga'],
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    aboutMe: {
        type: String
    },
    location: {
        type: String,
   },
   interests: {
       type: [String],
       required: true,
       enum: ['Politics', 'Sports', 'Lgbtq', 'Media', 'History', 'Entertainment', 'Games', 'Movies', 'Series', 'Music', 'Writing', 'Reading', 'Coding', 'Videography', 'Photography', 'Law', 'Conservation'],
       lowercase: true
   },
   image: {
       url: String,
       filename: String
   },
    // password: {
    //     type: String,
    //     required: [true, 'Password cannot be blank my oga'],
    // }
})

UserSchema.plugin(passportLocalMongoose)



// Using Bcrypt
// UserSchema.statics.findAndValidate = async function (username, password) {
//     const foundUser = await this.findOne({ username })
//     const isValid = await bcrypt.compare(password, foundUser.password)
//     return isValid? foundUser : false
//  }

// UserSchema.pre('save', async function(next){
//     if(!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
// })


module.exports = mongoose.model('User', UserSchema)
