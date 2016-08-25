// Require the nedb module
var Datastore = require('nedb');
var fs = require('fs');
// iTexico photo users
var photos = new Datastore({
	filename: __dirname + '/data/photos',
	autoload: true
});
// iTexico users profile
var users = new Datastore({
	filename: __dirname + '/data/users',
	autoload: true
});

//Create a "unique" index for the photo name and the user ip
photos.ensureIndex({
	fieldName: 'name',
	unique: true
});

users.ensureIndex({
	fieldName: 'ip',
	unique: true
});
//Load all images from the public/photos folder
var photos_on_disk = fs.readdirSync(__dirname + '/public/photos');

// read each photo and then save it at photo model
photos_on_disk.forEach(photo =>  {
	photos.insert({
		name: photo,
		likes: 0,
		dislikes: 0
	});
});

// make users and photos available
module.exports = {
	photos: photos,
	users: users
};