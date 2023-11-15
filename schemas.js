const Joi = require('joi')

module.exports.postSchema = Joi.object({
        title: Joi.string().required(),
        body: Joi.string().required(),
        hashtag: Joi.string().required(),
}).required()

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        // name: Joi.string().required(),
        // rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})

module.exports.profileSchema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        aboutMe: Joi.string(),
        email: Joi.string().required(),
        dob: Joi.string().required(),
        location: Joi.string().required(),
        interests: Joi.array().required(),
        // image: Joi.string().required(),

}).required()
