var express             = require("express"),
    router              = express.Router(),
    passport            = require("passport"),
    User                = require("../models/user"),
    Post                = require("../models/post");

router.get("/", function(req, res){
     res.render("landing");
});

router.get("/register", function(req, res) {
    res.render("register"); 
});

router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("register");
        } 
        
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Successfully registered! Welcome to Nomaste, " + req.user.username + "! :)");
            res.redirect("/allPosts");
        });
    });
});

router.get("/login", function(req, res) {
    res.render("login"); 
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/allPosts",
        failureRedirect: "/login"
    }), function(req, res) {
        req.flash("success", "Successfully logged in. Welcome back!");
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Successfully logged out. Till next time!");
    res.redirect("/allPosts");
});


// SHOW route for user dashboard
router.get("/dashboard/:user_id", function(req, res) {
    
    Post.find({'author.id': req.user._id}, function(err, posts){
        if(err){
            console.log(err);
        } 
        else{
            res.render("dashboard", {posts: posts});
        }
    });
});

module.exports = router;