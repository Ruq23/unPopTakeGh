// if(process.env.NODE_ENV !== "production") {
//     require('dotenv').config();
// }

const express = require('express');
const mongoose = require ('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const bcrypt=require("bcrypt")
const ExpressError = require('./utilities/ExpressError')
const catchAsync = require('./utilities/catchAsync')
const { isLoggedIn } = require('./middleware');
const { validatePost } = require('./middleware');
const { validateComment } = require('./middleware');
const { validateProfile } = require('./middleware');
const { isAuthor } = require('./middleware');
const { isCommentAuthor } = require('./middleware');
const Joi = require('joi')
const flash = require('connect-flash');
const multer  = require('multer')
const { storage } = require('./cloudinary');
const upload = multer({ storage })





const Post = require('./models/take');
const User = require('./models/user');
const Profile = require('./models/profile');
const Comment = require('./models/comment');
const user = require('./models/user');
const { use } = require('passport');



// const { findByIdAndDelete } = require('./models/take');



mongoose.connect('mongodb://127.0.0.1:27017/unPopTakeDb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    // store: new mongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 *60 * 24 * 7,
        maxAge: 1000 * 60 *60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session)
    // console.log(req.user)
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   res.locals.session = req.session
   next();
})

// passport.use(new LocalStrategy((username, password, done) => {
//     try{
//         User.findOne({username: username}).then(user => {
//             if(!user){
//                 return done(null, false, {message: "Incorrect Username"})
//             };
//             bcrypt.compare(password, user.password, function(err, result) {
//                 if(err){
//                     return done(err)
//                 }
//                 if(result){
//                     return done(null, user)
//                 }
//                 else {
//                     return done (null, false, {message: "Incorrect Password"})
//                 }
//             })
//         })
//     }catch(err){
//         return done(err)
//     }
// }))

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
//   });
  
// deserialize user  
// passport.deserializeUser(function(id, done) {
//     console.log("Deserializing User")
//     try {
//         User.findById(id).then(user=>{
//             done(null,user);
//         })
//     }
//     catch (err){
//         done(err);
//     }
//   });

const interests = ['Politics', 'Sports', 'Lgbtq', 'Media', 'History', 'Entertainment', 'Games', 'Movies', 'Series', 'Music', 'Writing', 'Reading', 'Coding', 'Videography', 'Photography', 'Law', 'Conservation']

const requireLogin = (req, res, next) => {
    if(!req.session.user_id) {
        res.redirect('/login')
    }
    next();
}

app.get('/', (req, res) => {
    // res.send("We up and running!")
    res.render('home.ejs')
})

app.get('/post/new', isLoggedIn, (req, res, next) => {
    res.render('newPost.ejs')

})

app.post('/post', isLoggedIn, validatePost, catchAsync( async(req, res, next) => {
    const { name, title, body } = req.body
    const post = new Post(req.body)
    post.author = req.user._id
    post.profile = req.user
    // console.log(post.author)
    await post.save()
    console.log(post)
    console.log(req.user)
    req.flash('success', 'You have posted a new take')
    // res.send(post)
    res.redirect(`/post/${post._id}`)
}))


app.get('/posts', catchAsync( async(req, res) => {
    // const posts = await Post.find({}).populate('author')
    // const { id } = req.params
    // const profile = await Profile.findById(id).populate('author')
    // console.log(profile)
    const posts = await Post.find({}).populate({
        path: 'author',
        populate: {
            path: 'image'
        }
    }).populate('author')
    res.render('index.ejs', {posts})
}))

app.get('/post/:id', catchAsync( async(req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author')
    console.log(post)
    // console.log(post.profile)
    // console.log(user.id)
    if(!post){
        req.flash('error', 'Cannot find this take')
        return res.redirect('/posts')
    }
    res.render('post_.ejs', {post})
}))

app.get('/posts/:id', catchAsync( async(req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id).
    populate({
        path: 'profile',
        populate: {
            path: 'author'
        }
    }).populate('author')

    // const post = await Post.findById(id).populate('profile')
    console.log(post)
    console.log(post.profile)
    // console.log(post.author.profile)
    // console.log(post.profile)
    // console.log(user.id)
    if(!post){
        req.flash('error', 'Cannot find this take')
        return res.redirect('/posts')
    }
    res.render('posts.ejs', {post})
}))

app.get('/post/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id)
    if(!post){
        req.flash('error', 'Cannot find this take')
        return res.redirect('/posts')
    }
    res.render('edit.ejs', {post})
}))

app.put('/posts/:id', isLoggedIn, isAuthor, validatePost, catchAsync(async(req, res, next) => {
    const{ id } = req.params;
    const post = await Post.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});
    console.log(req.body.post)
    if(!post){
        req.flash('error', 'Cannot find this take')
        return res.redirect('/posts')
    }
    res.redirect(`/post/${post._id}`)
}))

app.delete('/post/:id', isLoggedIn, isAuthor, catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id);
    req.flash('success', 'Take Deleted')
    res.redirect('/posts')

}))


//Authentication Routes
app.get('/register', catchAsync(async(req, res) => {
    res.render('register.ejs')
}))

//Using Passport Only
app.post('/register', catchAsync(async(req, res, next) => {
    try {
    const{username, password, firstName, lastName, email, dob } = req.body
    // console.log(req.body)
    const user = new User({username, firstName, lastName, email, dob})
    // console.log(user)
    // console.log(`Hi, username is ${user.username}, dob is ${user.dob}, email is ${user.email}, ${req.body.dob} ${req.body.email}`)
    const registeredUser = await User.register(user, password);
    console.log(registeredUser)
    req.login(registeredUser, err => {
        if(err) return next(err);
        console.log(registeredUser)
        req.flash('success', 'Welcome to UnPopTake')
        res.redirect(`/profile/${user._id}/completedProfile`)
    })
    } catch(e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
}))

app.get('/profile/:id/completedProfile', isLoggedIn, catchAsync( async(req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id)
    if(!user){
        req.flash('error', 'Cannot find this user')
        return res.redirect('/posts')
    }
    res.render('completedProfile.ejs', { interests, user })
}))

app.put('/profile/:id', isLoggedIn, upload.single('image'), catchAsync(async(req, res, next) => {
    const { id } = req.params
    const { aboutMe, location, image } = req.body
    const user = await User.findByIdAndUpdate(id, { ...req.body }, {runValidators: true, new: true});
    user.image = {"url": req.file.path, "filename": req.file.filename}

    // const profile = new Profile(req.body)
    // profile.image = req.file.map(f => ({ url: f.path, filename: f.filename })   ) 
    // user.author = req.user._id
    console.log(user)
    await user.save()
    // console.log(user)
    res.redirect('/posts')
    // res.send(user)
    // res.redirect('/posts')
}))

app.get('/profile/:id', isLoggedIn, catchAsync(async(req, res, next) => {
    const { id } = req.params
    const user = await User.findById(id)
    const posts = await Post.find({author: id}).populate('author')
    console.log(posts)
    if(!user){
        req.flash('error', 'Cannot find this user')
        return res.redirect('/posts')
    }
    res.render('profile.ejs', { user, posts })
}))



//Using Bcrypt Only
// app.post('/register', async(req, res, next) => {
//          const { username, password } = req.body;
//         const user = new User({username, password});
//         await user.save();
//         req.session.user_id = user._id
//         res.redirect('/login')
// })


//Using Passport & Bcrypt
// app.post("/register",function(req,res){
//     bcrypt.hash(req.body.password,10,function(err,hash){  //10 is SaltRounds
//         if (err){
//             console.log(err)
//         }
//         const user= new User ({
//             username:req.body.username,
//             password:hash
//         })
//         user.save()

//         passport.authenticate('local')(req,res,()=>{res.redirect("/posts")}) 
//     })
// })  

app.get('/login', catchAsync(async(req, res) => {
    res.render('login.ejs')
}))



//Using Passport Only
app.post('/login', passport.authenticate('local', {failureRedirect: '/login', keepSessionInfo: true}), (req, res) =>{
    req.flash('success', 'Welcome Back')
    console.log(req.user)
    const redirectUrl = req.session.returnTo || '/posts'
    res.redirect(redirectUrl)
    
})

//Using Bcrypt Only
// app.post('/login', async(req, res) => {
//     const { username, password } = req.body;
//     const foundUser = await User.findAndValidate(username, password)
//     if(foundUser){
//         req.session.user_id = foundUser._id;
//         res.redirect('/posts')
//     }else {
//         res.redirect('/login')
//     }
// })

// Using Passport & Bcrypt
// app.post('/login', passport.authenticate('local', { successRedirect:"/posts", failureRedirect: '/login' }));



//Profile Routes
app.get('/:id/completeProfile', isLoggedIn, catchAsync( async(req, res, next) => {
    res.render('completeProfile.ejs', { interests })
}))


app.post('/post/:id/comments', validateComment, isLoggedIn, catchAsync(async(req, res, next) => {
    const post = await Post.findById(req.params.id)
    const comment = new Comment(req.body.comment)
    comment.author = req.user._id;
    post.comments.push(comment)
    await comment.save()
    await post.save()
    console.log(comment.author.username)
    console.log(comment.author.name)
    console.log(comment.author.rating)
    req.flash('success', 'Comment Posted Successfully')
    console.log('Comment posted succcessfully')
    res.redirect(`/post/${post._id}`)
} ))

app.delete('/post/:id/comments/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async(req, res, next) => {
    const { id, commentId } = req.params
    await Post.findByIdAndUpdate(id, {pull: {comment: commentId}})
    await Comment.findByIdAndDelete(commentId)
    req.flash('success', 'Review Deleted Successfully')
    res.redirect(`/post/${id}`)
}))


app.get('/logout', (req, res) => {
    // req.session.destroy();
    req.logout(req.user, err => {
        if(err) return next(err);
    req.flash('success', 'Bye! Come back soon')
    res.redirect('/posts');

    })
    // res.redirect('/login');
})

app.get('/secret', requireLogin, (req, res) => {
    res.send('This is a secret, you cannot see me unless you are authenticated')
    console.log('Secret')
    // res.send('secret')
})





app.post('/:id/completeProfile', isLoggedIn, upload.single('image'), validateProfile, catchAsync(async(req, res, next) => {
    const { id } = req.params
    const { firstName, lastName, aboutMe, email, dob, location, interests, image } = req.body
    const profile = new Profile(req.body)
    // profile.image = req.file.map(f => ({ url: f.path, filename: f.filename })   ) 
    profile.image = {"url": req.file.path, "filename": req.file.filename}
    console.log(profile.image)
    profile.author = req.user._id
    await profile.save()
    console.log(profile)
    console.log(profile.author)
    // res.send('Woooooooooow')
    res.redirect(`/${id}/profile/${profile._id}`)
}))

app.get('/:id/profile/:profileId', isLoggedIn, catchAsync(async(req, res, next) => {
    const { id, profileId } = req.params
    const profile = await Profile.findById(profileId).populate('author')
    console.log(profile)
    // console.log(profile.firstName)
    // console.log(profile.author[0].username)
    // console.log(profile.author[0].id)
    res.render('profile.ejs', {profile})
}))



app.get('/profile/:id/edit',isLoggedIn, catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id)
    console.log(user)
    res.render('editProfile.ejs', {user, interests})
}))

app.put('/profile/:id', isLoggedIn, upload.single('image'), validateProfile, catchAsync(async(req, res, next) => {
    const{ id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, image, {runValidators: true, new: true});
//    const profile = await Profile.findByIdAndUpdate(id, { ...req.body.profile });
    user.image = {"url": req.file.path, "filename": req.file.filename}
    res.redirect(`/profile/${user._id}`)
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
} )

app.use((err, req, res, next) => {
    const{statusCode = 500} = err
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error.ejs', { err });
    // res.status(statusCode).send('Error')
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
});