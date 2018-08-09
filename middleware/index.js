var Comment         = require("../models/comment"),
    Post            = require("../models/post"),
    mongoose        = require("mongoose");

var middlewareObject = {};

middlewareObject.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/login"); 
};

middlewareObject.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, comment){
            if(err){
                req.flash("error", "Unable to locate comment in the database.");
                res.redirect("back");
            } 
            else{
                if(comment.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    req.flash("error", "You do not have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error", "You must be logged in to do that.");
        res.redirect("back");
    }
};

middlewareObject.checkPostOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Post.findById(req.params.id, function(err, post){
            if(err){
                req.flash("error", "Unable to locate post in the database.");
                res.redirect("back");
            } 
            else{
                if(post.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    req.flash("error", "You do not have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error", "You must be logged in to do that.");
        res.redirect("back");
    }
};


module.exports = middlewareObject;