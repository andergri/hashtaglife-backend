var _ = require('underscore');
var Selfie = Parse.Object.extend('Selfie');
var User = Parse.User;
var Hashtag = Parse.Object.extend('Hashtag');

// Display all posts.
exports.index = function(req, res) {
  
  var query = new Parse.Query(Parse.User);
  query.count({
    success: function(count) {
     // The count request succeeded. Show the count

  var queryc = new Parse.Query(Selfie);
  queryc.count({
    success: function(countc) {
     // The count request succeeded. Show the count

    res.render('progress/index', {
      userCount: count,
      semiCount: 0,
      activeCount: 0,
      photoCount: countc,
      hashtags: 0,
    });

    },
    error: function(error) {
      res.send(500, 'Failed loading posts');
    }
 });

    },
    error: function(error) {
      res.send(500, 'Failed loading posts');
    }
 });

};


