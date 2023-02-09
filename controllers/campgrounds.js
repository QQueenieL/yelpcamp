const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.create = async(req, res, next) => {
    const newCampground = new Campground(req.body);
    //console.log(req.body);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    //console.log(geoData.body.features)
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`)
}

module.exports.show = async(req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
        .populate({
            path:'reviews', //populate reviews
            populate:{
                path: 'author' //populate each review's author
            }
        }).populate('author'); //populate author of this campoground
    //console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground})
}

module.exports.edit = async(req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground})
}

module.exports.update = async(req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body, {
        runValidators: true, 
        new: true
    });
    if(req.body.deleteImages){
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
    }
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.delete = async(req, res, next) => {
    const {id} = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds')
}