const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelpCamp', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({}); //removing everything from in the database
    //generate new campgrounds
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '63d846537be4c5dde27a0610',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                    type: "Point",
                    coordinates: [
                        cities[random1000].longitude,
                        cities[random1000].latitude,
                    ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url:'https://res.cloudinary.com/dedsscpjz/image/upload/v1675723755/YelpCamp/z7xgtyd6didelqc7zgzp.jpg',
                    filename: 'YelpCamp/z7xgtyd6didelqc7zgzp'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni deserunt reprehenderit culpa error dignissimos nostrum aliquid repellat quas, architecto suscipit alias provident ipsam reiciendis sapiente qui sunt quidem ad voluptates!',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})