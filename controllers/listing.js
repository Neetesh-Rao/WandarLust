const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const maptilerClient = require("@maptiler/client");
const geocoding = maptilerClient.geocoding;
maptilerClient.config.apiKey = process.env.MAP_TOKEN;
const { Query } = require("mongoose");
const mapToken = maptilerClient.config.apiKey;





module.exports.index=async (req,res)=>{
  const alllistings= await Listing.find({});
  res.render("listings/index.ejs",{alllistings});
};

module.exports.renderNewForm=(req,res)=>{
  console.log(req.user);
 
    res.render("listings/new.ejs")
};

module.exports.showListing=async (req,res)=>{
let {id}=req.params;
const listing=await Listing.findById(id)

.populate({
  path:"reviews",
  populate:{
    path:"author",
    strictPopulate: false
  }
})
.populate("owner");
if(!listing){
  req.flash("error","Listing you requested for does not exist");
  res.redirect("/listings");
}
console.log(listing);
res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async (req,res,next)=>{
try{
  const response = await geocoding.forward(req.body.listing.location, { limit: 1 });


// res.send("done");
console.log(Object.keys(maptilerClient));



  let url=req.file.path;
  let filename=req.file.filename;
  if (!req.body || (!req.body.listing && Object.keys(req.body).length === 0)) {
    throw new ExpressError(400,"send valid data for listing");
  }
    const listingData = req.body.listing || req.body;
     const newListing= new Listing(req.body.listing);
     newListing.owner=req.user._id;
     newListing.image={url,filename};
     newListing.geometry=response.features[0].geometry;
   console.log(response.features[0].geometry);

   await newListing.save();
   req.flash("success","New Listing Created!");
   res.redirect("/listings");

}catch(err){
  console.log(err);
}
};

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
const listing=await Listing.findById(id);
if(!listing){
  req.flash("error","Listing you requested for does not exist");
  res.redirect("/listings");
}
let orignalImageUrl=listing.image.url;
 orignalImageUrl=orignalImageUrl.replace("/upload","/upload/h_300,w_250");
res.render("listings/edit.ejs",{listing,orignalImageUrl});
};

module.exports.updateListing=async (req,res)=>{
      if (!req.body || (!req.body.listing && Object.keys(req.body).length === 0)) {
    throw new ExpressError(400,"send valid data for listing");
  }
    let {id}=req.params;
  
   let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

   if(typeof req.file!=="undefined"){
     let url=req.file.path;
  let filename=req.file.filename;
listing.image={url,filename};
await listing.save();
}
  
   req.flash("success","Listing Updated");
   res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req,res)=>{
let {id}=req.params;
let deletedListing=await Listing.findByIdAndDelete(id);
console.log(deletedListing);
req.flash("success","Listing Deleted");
res.redirect("/listings");
};