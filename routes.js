var async = require('async');
var User = require('./mongoose').User;
var Photo = require('./mongoose').Photo;

module.exports = app => {
    console.log('routes');
    // Homepage
    app.get('/', (req, res) => {        
        console.log('get /');

        var image_to_show = null;
        // Flow
        async.waterfall([
            // Find all photos
            next =>
                Photo.find({},(err, photos) => {
                    if(err) return next(err);
                    console.log('find all photos');
                    console.log(photos);
                    next(null, photos);
                }),
            // Find the current user
            (all_photos, next) => {
                console.log('find the current user');
                if(all_photos.length === 0){
                    console.log('no photos');
                    //return next('no photos');
                } 
                User.findOne({ ip: req.ip }
                ,(err, user) => {
                    console.log('user who is voting');
                    console.log(user);
                    if(err) return next(err);
                    var voted_on = [];
                    // add votes to an array
                    if(user && user.votes)
                        voted_on = user.votes;
                    console.log('voted_on');
                    console.log(voted_on);
                    // Find wich photos the user hasnt still voted on yet
                    var not_voted_on = all_photos.filter(photo => {                     
                        return voted_on.map(vote => vote.toString())
                                       .indexOf(photo._id.toString()) === -1 ;
                    });

                    console.log('not_voted_on');
                    console.log(not_voted_on);
                    if(not_voted_on.length > 0 ) {
                        // Choose a random  image from the array
                        image_to_show = not_voted_on[Math.floor(Math.random()*not_voted_on.length)];
                    }                   
                    // continue the execution flow
                    next();
                });
            }           
        ], err => {
            if(err) return console.log(err);
            res.render('home', { photo: image_to_show });
        });
    });

    // standings
    app.get('/standings', (req, res) => {
        Photo.find({},(err, all_photos) => {
            // sort the photos
            all_photos.sort((p1, p2) => {
                return (p2.likes - p2.dislikes) - (p1.likes - p1.dislikes);
            });
            // Render the standing display and pass the photo
            res.render('standings', { standings: all_photos });            
        });
    });


    //This is executed before the next two post requests
    app.post('*', (req, res, next) => {
        console.log('req.ip');
        console.log(req.ip);
        // Find or create users
        async.waterfall([
            next => User.findOne({ip: req.ip}, (err, user) => {
                    if(err) return next(err);
                    next(null, user);
                }),
            // Register the user ¡n the db by ip address
            (user, next) => {
                console.log('user');
                console.log(user);
                if(user) return next();
                User.create({ ip: req.ip, votes: [] },
                    (err, result) => {
                    if(err) return console.log(err);
                    console.log('call next');
                    next();
                });
            }
        ], err => {
            if(err) return console.log('Error' + err);
            console.log('users created succesfully');
            next();
        });
    }); 

    var vote = (req, res) => {
        console.log('vote');
        // Which field to increment depending on the path
        var what = {
            '/notcute': {dislikes: 1},
            '/cute': { likes: 1}
        };
         /// FLow
         async.waterfall([
            //Find the photo, increment the vote counter and mark that the user voted on it.
            next => Photo.findOne({ name: req.body.photo },next),
            (photo, next) => {
                console.log('photo');
                console.log(photo);
                if(!photo) {
                    res.redirect('../');
                    return next();
                }
                //FLow
                async.parallel([
                    // increment mark on photo by like or dislike
                    next => Photo.update(photo, {
                                $inc : what[req.path]
                            }, next),
                    // update user adding the photoId
                    next => User.update({ ip: req.ip},
                            {
                                $addToSet: { votes: photo._id}
                            },next)                 
                ], err => {
                    // When everything its ok we redirect
                    if(err) return console.log(err);
                    res.redirect('../');
                    next();
                });
            }
         ]);
    };

    app.post('/notcute', vote);
    app.post('/cute', vote);
};