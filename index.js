/**
* This is the main file in the application. Run it with the 
* node index.js command from your terminal
* Remember to run  npm install in the project folder,
* so all the required libraries are downloaded and installed.
**/

const MongoClient = require('mongodb').MongoClient

var express = require('express');
// Create a new express.js  wen app
var app = express();

// Configure express with the settings found in
// our config.js file
require('./config')(app);

// Add the routes  that the app will react to,
// as defined in our routes.js files
require('./routes')(app);

//This file has been called directly with
// node index.js. Start the server
MongoClient.connect('mongodb://funtexico:funtexic0@ds031741.mlab.com:31741/memes', (err, database) => {
	if(err) return console.log(err);
	// Global variable to be used outside
	db = database;
	console.log('Connected to: ' + db.databaseName + ' from mlabs.com');
	app.listen(8081, () => {
		console.log('The app is running on http://localhost:8081');
	});
});