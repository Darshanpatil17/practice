const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync');
const expresserror = require('../utils/expresserror.js');
const Review = require("../model/review.js");
const { reviewSchema} =require("../Scema.js")
const Listing = require("../model/listing.js");

const {isLoggedIn,isreviewAuthor} = require("../middleware.js");

 const reviewcontroller = require("../controllers/reviews.js")






const validateReview = (req, res, next)=>{
    let{error}  = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
        throw new expresserror(400, errMsg)
    }else{
        next();
    }
};

 
router.post("/",isLoggedIn, wrapAsync(reviewcontroller.createreview))
    
    router.delete("/:reviewId",isLoggedIn,isreviewAuthor, wrapAsync(reviewcontroller.deletereview))

    module.exports = router;
