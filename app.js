// ============================= SETUP ====================================== //
require("dotenv").config();

var express                 = require("express"),                   // Import Express package
    app                     = express(),                            // Running instance of Express App
    mongoose                = require("mongoose"),                  // Import Mongoose package
    methodOverride          = require("method-override"),           // Import method-override
    flash                   = require("connect-flash"),             // Import connect-flash
    bodyParser              = require("body-parser"),               // Import body-parser to handle JSON parsing
    passport                = require("passport"),                  // Import passport for user auth
    localStrategy           = require("passport-local"),            // Import passport-local
    User                    = require("./models/user"),             // Import User model
    Post                    = require("./models/post"),             // Import Post model
    Comment                 = require("./models/comment");          // Import Comment model
    
// Import Routes
var postRoutes              = require("./routes/posts.js"),
    commentRoutes           = require("./routes/comments.js"),
    indexRoutes             = require("./routes/index.js");
    
mongoose.connect("mongodb://localhost/all_posts");      // Connect mongoose to a database named all_posts
app.use(bodyParser.urlencoded({extended:true}));        // Tell app to use bodyParser package
app.use(methodOverride("_method"));                     // Tell app to use methodOverride package for PUT requests, etc.
app.use(express.static(__dirname + "/public"));         // Tell app to use main.css
app.set("view engine", "ejs");                          // Set view engine so all files in views render as ejs by default
app.use(flash());

// Yelp API Key and Client ID
var api_key = "s50Uld4c1jKVF98wk_0LUJSipvCgdhX_33gRT5FMid4f1QOeY5ZWz50eLtkLr0FOPXyXBpnx8xzNVRCcNZg2HXBWqzdyKrHol2EpJaPjWvVMqHc9uZAahkGHEBsoW3Yx";
var clientID = "W2GBDO0w8U7lz6WlBzyKCw";


// PASSPORT CONFIG
// 1)
app.use(require("express-session")({
    secret: "Sasuke is the supreme ninja",
    resave: false,
    saveUninitialized: false
}));

// 2)
app.use(passport.initialize());
app.use(passport.session());

// 3)
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware that passes currentUser to every route without manual retype
app.use(function(req, res, next){
    res.locals.currentUser = req.user;          // This sets currentUser in any template to req.user
    res.locals.success = req.flash("success");  // Success flash messages
    res.locals.error = req.flash("error");      // Error flash messages
    next();                                     // This runs the callback function of any given route (continues the route)
});

app.use("/", indexRoutes);
app.use("/allPosts", postRoutes);
app.use("/allPosts/:id/comments", commentRoutes);
// ============================= SETUP ====================================== //
















// ================================= SERVER ================================= //
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started..."); 
});
// ================================= SERVER ================================= //