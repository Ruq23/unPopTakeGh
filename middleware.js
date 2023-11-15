const Post = require('./models/take');
const User = require('./models/user');
const Profile = require('./models/profile');
const Comment = require('./models/comment');
const { postSchema } = require('./schemas.js');
const { commentSchema } = require('./schemas.js');
const { profileSchema } = require('./schemas.js');
const ExpressError = require('./utilities/ExpressError')



module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        console.log('You are not authorized to view this page') 
        req.session.returnTo = req.originalUrl
        return res.redirect('/login')
    } 
    next();
}

module.exports.validatePost = (req, res, next) => {
    const { error } = postSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else {
        next();
    }
}

module.exports.validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else {
        next();
    }
}

module.exports.validateProfile = (req, res, next) => {
    const { error } = profileSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id)
    if(!post.author[0].equals(req.user._id)){
        console.log('You do not have permission')
        return res.redirect(`/post/${post._id}`)
    }
    next();
}

module.exports.isCommentAuthor = async(req, res, next) => {
    const {id, commentId} = req.params;
    const comment = await Comment.findById(commentId)
    if(!comment.author.equals(req.user.id)) {
        console.log('You do not have such permission')
        return res.redirect(`post/${id}`)
    }
    next();
}