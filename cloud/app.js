
// These two lines are required to initialize Express in Cloud Code.

var express = require('express');
var moment = require('moment');
var _ = require('underscore');

var hashtagsController = require('cloud/controllers/hashtags.js');
var progressController = require('cloud/controllers/progress.js');
var videoController = require('cloud/controllers/video.js');
var instagramController = require('cloud/controllers/instagram.js');

var app = express();

var basicAuth = express.basicAuth('andergri','pooltabel');

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body
app.use(express.methodOverride());

app.locals._ = _;

app.get('/instagram/lat/:lat/lng/:lng/:page', instagramController.index);
app.post('/instagram', instagramController.create);
app.get('/v/:hashtag', videoController.index);
app.get('/vdata/:hashtag', videoController.data);
//app.get('/userdata', progressController.index);
app.get('/:hashtag', hashtagsController.index);
app.get('/migrate/:migrate', hashtagsController.move);

// Attach the Express app to Cloud Code.
app.listen();
