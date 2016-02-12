var _ = require('underscore');

// Display all posts.
exports.index = function(req, res) {

     var sec;
     if(req.param("speed")){
	sec = 1000 * parseInt(req.param("speed"));
     }else{
	sec = 1000 * 45;
     }
	
     res.render('video/index', {
          searched: req.params.hashtag,
      	  hashtags: 0,
	  speed: sec
     });
};

exports.data = function(req, res) {

        Parse.Cloud.run('getSelfiesForHashtag', {
                hashtag: req.params.hashtag
        }).then(function(result) {

		res.json(result);

        });
};
