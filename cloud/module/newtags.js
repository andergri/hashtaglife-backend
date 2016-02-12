(function() {     
    
    Parse.Cloud.useMasterKey(); 
    
    var increaseTag = function(hashtag, location) {
        
        var promise = new Parse.Promise();
        
        var Location = Parse.Object.extend("Location");
        var locactionObj = new Location();
        locactionObj.id = location;
        
        var query = new Parse.Query("Tag");
        query.equalTo("name", hashtag);
        query.equalTo("location", locactionObj);
        query.find().then(function(hashtags) {    
            
            if(hashtags.length > 0){
                var newhashtag = hashtags[0];
                var acount = newhashtag.get("count");
                var atrending = newhashtag.get("trending");
                
                if(acount > 0){
		    
                    acount = acount + 1;
                    atrending = atrending + 1;
                    newhashtag.set("count", acount);
                    newhashtag.set("trending", atrending);
                    newhashtag.save().then(function() {
                        promise.resolve();
                    });
                }else {
                    newhashtag.set("count", 1);
                    newhashtag.set("trending", 1);
                    newhashtag.save().then(function() {
                        promise.resolve();
                    });
                }
                
            }else{
                
                var Tag = Parse.Object.extend("Tag");
                var tag = new Tag();
                tag.set("name", hashtag);
                tag.set("trending", 1);
                tag.set("count", 1);
                tag.set("location", locactionObj);
                tag.set("followers", 1);
                tag.save().then(function() {
                    promise.resolve();
                });
            }
            
        });
        return promise;
    };  

  module.exports = {
  
    version: '1.0.0',
      
    increaseTags: function(params, options) {
        
        var hashtags = params.hashtags;
        var location = params.location;
        var promises = [];
        for (var i = 0; i < hashtags.length; i++) {
            promises.push(increaseTag(hashtags[i], location));
        }
        return Parse.Promise.when(promises);
        
        /**.then(function() {
            options.success(); 
        });  **/
    }
  }
}());