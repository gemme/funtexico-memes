var uri = 'mongodb://funtexico:funtexic0@ds017246.mlab.com:17246/heroku_3cn43gb3';

var fs = require('fs');
var async = require('async');
var mongoose = require('mongoose');
//Connect to mlabs
mongoose.connect(uri);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', callback => {
	console.log('its open');
});

var photoSchema = mongoose.Schema({
	name: String
});

var userSchema = mongoose.Schema({
	ip: String,
    votes: Array
});

var _user = mongoose.model('User', userSchema);
var _photo = mongoose.model('Photo', photoSchema);

function loadPhotos(model, path) {
    //Load all images from the public/photos folder
    var photos_on_disk = fs.readdirSync(__dirname + path);
    var photos_fn = [];
    // Load photos name from filesystem 
    photos_on_disk.forEach(photo => photos_fn.push(
            next => async.waterfall([
                    // Find photo
                    next => 
                        model.findOne({ name: photo },
                            (err, my_photo) => {
                                if(err) return next(err);
                                next(null, my_photo);
                        }),
                    // Or create one
                    (my_photo, next) => {
                        if(my_photo) return next();
                        model.create({ name: photo}, next)
                    }
                ], next)
        )); 
    //Call this method parallel
    async.parallel(photos_fn, err => {
        if(err) return console.log(err);
        console.log('photos loaded succesfully');
    });
};
// call loading photos
loadPhotos(_photo, '/public/photos');

exports.User = _user;
exports.Photo = _photo;