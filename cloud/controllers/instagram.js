var _ = require('underscore');
var Selfie = Parse.Object.extend('Selfie');
var Hashtag = Parse.Object.extend('Hashtag');

// Display all posts.
exports.index = function(req, res) {
     
     var pag = 0;     
     if(req.params.page){
	pag = req.params.page;
     }     

     res.render('instagram/index', {
	 lat: req.params.lat,
	 lng: req.params.lng,
	 page: pag
     });
};

// Create a new comment with specified author and body.
exports.create = function(req, res) {
  
  console.log("aaa");
  Parse.Cloud.httpRequest({
  	url: req.body.image,
 	 success: function(httpResponse) {
		var imageFile = new Parse.File("profile_image.jpg", {base64: httpResponse.buffer.toString('base64', 0, httpResponse.buffer.length)});

  		var aquery = new Parse.Query(Parse.User);
  		aquery.get('E0d67oM8jy',  {
  			success: function(auser) {
    				
  				var hashtagsArray = req.body.hashtags.split(',');

  				for (var i = 0; i < hashtagsArray.length; i++) {

  					var hash = hashtagsArray[i];
					console.log("boom"+hash);
  					var query = new Parse.Query(Hashtag);
  					query.equalTo("name", hash);
  					query.find({
        					success: function(results) {
                					console.log(results);
                					if(results.length > 0){
					                        var hashtag = results[0];
                        					hashtag.increment('trending');
                        					hashtag.increment("count");
                        					hashtag.save();

                					}else{
                        					console.log("b"+hash);
                        					var hashtag = new Hashtag();
                        					hashtag.set('trending', 1);
                        					hashtag.set('count', 1);
                        					hashtag.set('name', hash);
                        					hashtag.save();

                					}
        					},
        					error: function(error) {
        						console.log(error);
        					} 
					});
				}

				var selfie = new Selfie();
  				selfie.set('likes', 1);
  				selfie.set('visits', 2);
  				selfie.set('flags', 0);
  				selfie.set('from', auser);
  				selfie.set('hashtags', hashtagsArray);
  				selfie.set('image', imageFile);
				selfie.save().then(function(sel) {
  					res.redirect('/instagram/lat/' + req.body.lat + '/lng/' + req.body.lng + '/' + req.body.page);
				}, function(error) {
  					res.send("Saving of gram failed");
				});

	  		},
  			error: function(object, error) {
  			}
		});

  	},
  	error: function(httpResponse) {
		res.send(500, httpResponse);
  	}
  });


};
