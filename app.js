if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
const methodoverride = require("method-override");
const ejsmate  = require("ejs-mate");

const expresserror = require('./utils/expresserror.js');
const session  = require("express-session")
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")


const listingsRouter = require("./routes/listing.js")
const userRouter =require("./routes/user.js");
const reviewsRouter = require("./routes/reviews.js")
 
const passport = require("passport");
const LocalStrategy = require("passport-local")

const User = require("./model/user.js");

main()
.then(()=>{
    console.log("connected to DB");
})
.catch(err=>{
    console.log(err)
})

async function main() {
    await mongoose.connect(dbUrl);
}
app.set("views engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname, "/public")));

//

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRETE,
    },
    touchAfter:24 * 3600,

})

store.on("error",()=>{
    console.log("ERROR in Mongo sessoin code")
})
const sessionOption={
    store,
    secret:process.env.SECRETE,
    resave: false,
    saveuUninitialized:true,
    cookie:{
        expires:Date.now()+ 7 * 24 * 60 * 60 * 1000, 
        maxAge:7 * 24 * 60 * 1000,
        httpOnly:true,
    },
};



// app.get("/",(req,res)=>{
//     res.send("server is started");
// })


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next)=>{
    res.locals.succe
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user;
    next();
})

app.get("/demouser", async(req, res)=>{
    let fakeUser = new User({
        email:"patil123@gmail.com",
        username:"Patil123"

    });

    let registerUser =await User.register(fakeUser,"patil123");
    res.send(registerUser);
})






// const validateListing = (req, res, next)=>{
//     let{error}  = listingScema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el)=> el.message).join(",")
//         throw new expresserror(400, errMsg)
//     }else{
//         next();
//     }
// };

// const validateReview = (req, res, next)=>{
//     let{error}  = reviewSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el)=> el.message).join(",")
//         throw new expresserror(400, errMsg)
//     }else{
//         next();
//     }
// };


// app.get("/listings", wrapAsync(async (req , res)=>{
//    let allListings = await Listing.find({});
//    res.render("listing/index.ejs",{allListings});
// }));

// app.get("/listings/new",(req, res)=>{
//     res.render("listing/new.ejs");
// })

// app.get("/listings/:id", wrapAsync(async(req, res)=>{
//     let { id } = req.params;
//     const listing =await Listing.findById(id).populate("reviews");
//     res.render("listing/show.ejs", {listing})

// }))

// app.post("/listings", validateListing,wrapAsync (async(req ,res)=>{
//     // let {title, description,image, price, country, location }= req.body;
    
//     const newListing = new Listing(req.body.listing);
//      await newListing.save();
//      res.redirect("/listings")

// }))


// app.get("/listings/:id/edit", wrapAsync(async (req, res)=>{
//     let { id } = req.params;
//     const listing =await Listing.findById(id);
//     res.render("listing/edit.ejs", {listing})

// }))



// app.put("/listings/:id",wrapAsync(async(req, res)=>{
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id,{...req.body.listing})
//     res.redirect(`/listings/${id}`);
// }))


// app.delete("/listings/:id", wrapAsync(async(req, res)=>{
//     let { id } = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");
// }))


// app.post("/listings/:id/reviews",wrapAsync(async (req, res)=>{
    
//     let listing = await Listing.findById(req.params.id)
//         let newReview = new Review(req.body.review);

//         listing.reviews.push(newReview);
//        await newReview.save();
//        await listing.save();
//        res.redirect(`/listings/${listing._id}`);

// }))

// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res)=>{
//     let{id, reviewId} = req.params;
//     await Listing.findByIdAndUpdate(id, { $pull: {review: reviewId}})
//     await Review.findByIdAndDelete(reviewId);
//     console.log(reviewId    )

//     res.redirect(`/listings/${id}`);
// }))
app.use("/listings", listingsRouter);
 app.use("/listings/:id/reviews", reviewsRouter)
app.use("/", userRouter)

app.all("*",(req, res, next)=>{
    next(new expresserror(404, "page not found"));
})
app.use((err,req, res, next)=>{
    let { statuscode=500, message ="Something went wrong"} = err;
    res.status(statuscode).render ("error.ejs",{message});
    // res.status(statuscode).render(message)

})
app.listen(8080, ()=>{
    console.log("server is listenig to 8080");

});


