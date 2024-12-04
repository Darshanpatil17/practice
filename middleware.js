const Listing = require("./model/listing.js")
const Review = require("./model/review.js")
module.exports.isLoggedIn = (req, res, next)=>{
    
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listing!")
       return  res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}
module.exports.isowner = async (req, res, next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You dont't have permission to edit");
        res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isreviewAuthor = async (req, res, next)=>{
    let { id,reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","you are not the author of this review");
        res.redirect(`/listings/${id}`);
    }
    next();
}