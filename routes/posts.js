var express         = require("express"),
    router          = express.Router({mergeParams: true}),
    Post            = require("../models/post"),
    middleware      = require("../middleware"),
    NodeGeocoder    = require('node-geocoder');

// Options for geocoder
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

// geocoder converts address to lat and long for Google Maps API plugin
var geocoder = NodeGeocoder(options);

// INDEX route - shows all the posts from the DB
router.get("/", function(req, res){
    
    // Find all the Posts from the DB
    Post.find({}, function(err, allPosts){
        if(err){
            console.log(err);
        } 
        else{                   
            res.render("posts/index", {allPosts: allPosts, currentUser: req.user});
        }
    });
    
});

// CREATE route - creates a new post in the DB
router.post("/", middleware.isLoggedIn, function(req, res){
     
    var title = req.body.title,
        caption = req.body.caption,
        image = req.body.image,
        address = req.body.address,
        name = req.body.name,
        author = {
            id: req.user._id,
            username: req.user.username
        };
        
     
    
     
    geocoder.geocode(req.body.address, function(err, data){
        if(err || !data.length){
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        
        var lat = data[0].latitude,
            lng = data[0].longitude,
            address = data[0].formattedAddress;
            
        var newPost = {
            title: title,
            caption: caption,
            image: image,
            address: address,
            name: name,
            author: author,
            lat: lat,
            lng: lng
        };
        
        // Create a new Post using the object from above and save to DB
        Post.create(newPost, function(err, post){
            if(err){
                req.flash("error", "Unable to create post.");
                console.log(err);
            } 
            else{
                req.flash("success", "New post successfully added.");
                res.redirect("/allPosts");
            }
        });
    });
     
});

// NEW route - shows form for creating a new post
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("posts/new"); 
});

// SHOW route - shows info for a single post
router.get("/:id", function(req, res) {
    Post.findById(req.params.id).populate("comments").exec(function(err, post){
        if(err){
            res.redirect("/allPosts");
        } 
        else {
            res.render("posts/show", {post: post});
        }
    });
});

// EDIT route - shows form for editing an existing post
router.get("/:id/edit", middleware.checkPostOwnership, function(req, res) {
    
    Post.findById(req.params.id, function(err, post){
        if(err){
            res.redirect("/allPosts");
        }
        else{
            res.render("posts/edit", {post: post});
        }
    });
    
});

// UPDATE route - updates a single post
router.put("/:id", middleware.checkPostOwnership, function(req, res){
    
    geocoder.geocode(req.body.post.address, function(err, data){
        
        if(err || !data.length){
            console.log(err);
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        
        req.body.post.lat = data[0].latitude;
        req.body.post.lng = data[0].longitude;
        req.body.post.address = data[0].formattedAddress;
        
        
        Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post){
            if(err){
                req.flash("error", "Unable to edit existing post.");
                res.redirect("/allPosts");
            } 
            else{
                req.flash("success", "Successfully updated existing post");
                res.redirect("/allPosts/" + req.params.id);
            }
        });  
    });
    
});

// DESTROY route - deletes a single post
router.delete("/:id", middleware.checkPostOwnership, function(req, res){
    
    Post.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/allPosts");
        }
        else{
            req.flash("success", "Successfully deleted post from the database.");
            res.redirect("/allPosts");
        }
    });
     
});

module.exports = router;