var _ = require('underscore');
var Selfie = Parse.Object.extend('Selfie');
var Tag = Parse.Object.extend('Tag');

// Display all posts.
exports.index = function(req, res) {
  var query = new Parse.Query(Selfie);
  query.descending('createdAt');
  query.equalTo("hashtags", req.params.hashtag);
    query.find().then(function(results) {
    res.render('hashtags/index', {
      hashtags: results,
      searched: req.params.hashtag
    });
  },
  function() {
    res.send(500, 'Failed loading posts');
  });
};

exports.move = function(req, res) {

  var query = new Parse.Query(Selfie);
  query.descending('createdAt');
  query.skip(req.params.migrate);
  query.limit(5);
  query.find().then(function(results) {

	console.log(results.length);    
	for (var i = 0; i < results.length; i++) {


  		var hashtags = results[i].get('hashtags');
  		var location = results[i].get('location');

		console.log("loc" + location + hashtags);
  		if(location){
  			
			for (var i = 0; i < hashtags.length; i++) {

				(function(i) {
        			var query = new Parse.Query("Tag");
        			query.equalTo("name", hashtags[i]);
        			query.equalTo("location", location);
        			query.find({

					success: function(tags) {

				                if(tags.length > 0){

                					var tag = tags[0];
                					var count = tag.get("count");
					                if(count > 0){

					                    	var trending = tag.get("trending");
                    						trending = trending + 1;
                    						tag.set("trending", trending);
                    						count = count + 1;
                    						tag.set("count", count);
                    						tag.save();
                					}else {


						                tag.set("name", hashtags[i]);
                    						tag.set("trending", 1);
                    						tag.set("count", 1);
                    						tag.set("location", location);
                    						tag.save();
                					}

						}else{
                   					
							var aTag = Parse.Object.extend("Tag");
                   					var btag = new aTag();
                    					btag.set("name", hashtags[i]);
                    					btag.set("trending", 1);
                    					btag.set("count", 1);
                    					btag.set("location", location);
                    					btag.save();
						}
            				},
            				error: function(error) {
                				console.log(error);
            				}
        			});
        			})(i);
    			}

        	}
  	}


//  	res.render('hashtags/index', {
//      		hashtags: results,
//      		searched: req.params.hashtag
//    		});
 
 },
 function() {
    	res.send(500, 'Failed loading posts');
 });
};

