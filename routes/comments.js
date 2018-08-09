var express             = require("express"),
    router              = express.Router({mergeParams: true}),
    Post                = require("../models/post"),
    Comment             = require("../models/comment"),
    middleware          = require("../middleware");

// NEW route - shows form for creating a new comment
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // Find the post from DB
    Post.findById(req.params.id, function(err, post) {
        if(err){
            console.log(err);
            res.redirect("/allPosts/:id");  // If there's an error, redirect to the show page for now
        }
        // Render the new comment form
        else{
            res.render("comments/new", {post: post});
        }
    });
});

// CREATE route - creates a new comment in the DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    // Find the Post by ID
    Post.findById(req.params.id, function(err, post) {
        if(err){
            console.log(err);
            req.flash("error", "Unable to locate associated post from the database.");
            res.redirect("/allPosts");
        }
        else{
            Comment.create(req.body.comment, function(err, comment) {
                if(err){
                    req.flash("error", "Unable to create comment.");
                    console.log(err);
                } 
                else{
                    // Grab the id and username from the post request and store it (associate it) in the comment that is created
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    
                    // Save the comment
                    comment.save();
                    
                    post.comments.push(comment);
                    post.save();
                    req.flash("success", "Comment successfully added.");
                    res.redirect("/allPosts/" + post._id);
                }
            });
        }
    });
});

// EDIT route - shows form for editing an existing comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, comment){
        if(err){
            res.redirect("back");
        } 
        else{
            res.render("comments/edit", {post_id: req.params.id, comment: comment});
        }
    });
});

// UPDATE route - updates an existing comment in the DB
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment){
        if(err){
            res.redirect("back");
        } 
        else{
            res.redirect("/allPosts/" + req.params.id);
        }
    });
});

// DESTROY route - deletes an existing comment from DB
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } 
        else{
            res.redirect("/allPosts/" + req.params.id);
        }
    });
});

module.exports = router;