const express = require("express");
const router=express.Router();
const Listing = require("../model/listing.js");
const wrapAsync = require('../utils/wrapAsync');
const {listingScema} =require("../Scema.js")
const expresserror = require('../utils/expresserror.js');
const {isLoggedIn, isowner} = require("../middleware.js")

const listingController = require("../controllers/listing.js")
const multer = require("multer")
const{storage}=require("../cloudconfi.js")
const upload = multer({storage});




const validateListing = (req, res, next)=>{
    let{error}  = listingScema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
        throw new expresserror(400, errMsg)
    }else{
        next();
    }
};


router
.route("/")
.get( wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync (listingController.createdListing));




router.get("/new",isLoggedIn,listingController.rendernewform)
 



router
.route("/:id")
.get( wrapAsync(listingController.showListing
))
.put(isLoggedIn,isowner,upload.single('listing[image]'),wrapAsync(listingController.updateListing))
.delete(isLoggedIn, wrapAsync(listingController.deleteListing));


 router.get("/:id/edit",isLoggedIn, wrapAsync(listingController.rendereditform))

 


module.exports = router;