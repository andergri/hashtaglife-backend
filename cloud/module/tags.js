(function() {       
  Parse.Cloud.useMasterKey();
  
    var reduceHashtag = function(hashtag) {
        var promise = new Parse.Promise();
        var query = new Parse.Query("Hashtag");
        query.equalTo("name", hashtag);
        query.find().then(function(hashtags) {    
            
            if(hashtags.length > 0){
                var newhashtag = hashtags[0];
                var acount = newhashtag.get("count");
                if(acount > 0){
                    acount = acount - 1;
                    newhashtag.set("count", acount);
                    newhashtag.save().then(function() {
                        promise.resolve();
                    });
                }else{
                    newhashtag.destroy().then(function() {
                        promise.resolve();
                    });
                }
            }else{
                promise.resolve();
            }
            
        });

        return promise;
    };    
    
    var reduceTag = function(hashtag, location) {
        
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
                if(acount > 0){
                    acount = acount - 1;
                    newhashtag.set("count", acount);
                    newhashtag.save().then(function() {
                        promise.resolve();
                    });
                }else{
                    newhashtag.destroy().then(function() {
                        promise.resolve();
                    });
                }
            }else{
                promise.resolve();
            }
            
        });
        return promise;
    };  
    
  module.exports = {
  
    version: '1.0.0',
      
    reduceHashtagsAndTags: function(params, options) {
        
        var hashtags = params.hashtags;
        var location = params.location;
        var promises = [];
        for (var i = 0; i < hashtags.length; i++) {
            promises.push(reduceHashtag(hashtags[i]));
            promises.push(reduceTag(hashtags[i], location));
        }
        return Parse.Promise.when(promises).then(function() {
            options.success(); 
        });  
    },
      
    reduceHashtagsAndTags2: function(params, options) {
        
        var hashtags = params.hashtags;
        var location = params.location;
        var promises = [];
        for (var i = 0; i < hashtags.length; i++) {
            promises.push(reduceHashtag(hashtags[i]));
            promises.push(reduceTag(hashtags[i], location));
        }
        return Parse.Promise.when(promises);
    }
  }
}());