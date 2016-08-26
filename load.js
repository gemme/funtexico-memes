var async = require('async');
var fs = require('fs');
const MongoClient = require('mongodb').MongoClient

var load_photos = (model, path, next) => {
    //Load all images from the public/photos folder
    var photos_on_disk = fs.readdirSync(__dirname + path);
    var photos_fn = [];
    
    photos_on_disk.forEach(photo => photos_fn.push(
            next => model.save({ name: photo}, next)
        )); 
    //Call this method parallel
    async.parallel(photos_fn, err => {
        if(err) return console.log(err);
        console.log('photos loaded succesfully');
        next();
    });
}

var connect = (next) => {
    MongoClient.connect('mongodb://funtexico:funtexic0@ds017246.mlab.com:17246/heroku_3cn43gb3', (err, database) => {
        if(err) return next(err);
        // Global variable to be used outside
        console.log('Connected to: ' + database.databaseName + ' from mlabs.com');
        database.collection('photos').createIndex( { "name": 1 }, { unique: true } );
        database.collection('users').createIndex( { "ip": 1 }, { unique: true } );
        next(null, database);
    });
};
// models
var database;
// main flow
async.waterfall([
        // Get a connection from mongo
        next => connect(next),
        // load photos
        (_database, next) => {
            //photos = database.collection('photos');
            //users = database.collection('users');
            database = _database;           
            load_photos(database.collection('photos'), '/public/photos', next);         
        }
], err => {
    if(err) return console.log(err);
    console.log('everything is ok!');
    module.exports.database = database;
});
