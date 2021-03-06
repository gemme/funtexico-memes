/**
* configuration settings on your express application
**/

// Include the handlebars templating library
var handlebars = require('express3-handlebars');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('client-sessions');

// Require()-ing this module will return  a function
// that the index.js file will use to configure the
// express application
module.exports = app => {
    console.log('loading config');
    //Register and configure the handlebars engine templating
    app.engine('html', handlebars({
        defaultLayout: 'main',
        extname: '.html',
        layoutsDir: __dirname + '/views/layouts'
    }));

    // Set .html as the default template extension
    app.set('view engine', 'html');

    //Tell express where it can find the templates
    app.set('views', __dirname + '/views');

    // handle session due to a prblem with public ips
    app.use(session({
        cookieName: 'session',
        secret: 'an1ta_lava_la_t1na',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
    }));


    //Make the files in the public folder available to the world
    app.use(express.static(__dirname + '/public'));



    // Parse POST request data. It will be available in the req.body object
    app.use(bodyParser.urlencoded({ extended: true }));
};