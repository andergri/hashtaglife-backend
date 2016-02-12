(function() {       
    
    // Time in seconds, 60 = 1 minute 
    Parse.Cloud.useMasterKey();
    var _ = require('underscore.js');
    
    var findSubscribe = function(hashtag, selfie) {
        
        var promise = new Parse.Promise();
        
        console.log("INBOX: hashtag " + hashtag);
        
        var query = new Parse.Query("Subscribe");
        query.equalTo("hashtag", hashtag);
        query.equalTo("location", selfie.get("location"));
        query.find().then(function(results) {
                
            console.log("INBOX: touch"); 
            console.log("INBOX: count" + results.length); 
            
            _.each(results, function(subscribe) {
                
                console.log("INBOX: new");
                
                var Inbox = Parse.Object.extend("Inbox");
                var inbox = new Inbox();
                inbox.set("hashtag", subscribe.get("hashtag"));
                inbox.set("location", subscribe.get("location"));
                inbox.set("user", subscribe.get("user"));
                inbox.set("push_sent", true);
                inbox.set("has_seen", false);
                if(selfie.get("from").id == subscribe.get("user").id){
                    inbox.set("poster", true);  
                }else{
                    inbox.set("poster", false);
                }
                
                console.log("INBOX: new end");
                
                inbox.save().then(function() {
                    
                if(selfie.get("from").id != subscribe.get("user").id){
                    
                    var query = new Parse.Query(Parse.Installation);
                    query.equalTo('user', subscribe.get("user"));

                    // "selfie":  selfie.id, // extra data to send to the phone.
                    Parse.Push.send({
                        where: query,
                        data: {
                            "alert": "#"+subscribe.get("hashtag"), 
                            "sound": "cheering.caf", // default ios sound.
                            "uri": "hashtaglife://hashtaglife.com/selfie/"+selfie.id,
                            "badge": "Increment"
                        }
                    }).then(function() {
                        promise.resolve();
                    });
                    
                }else{
                       promise.resolve();           
                }
                   
                });
            });
        });
    
        return promise;
    };  
    
    module.exports = {
  
        version: '1.0.0',
        
        initialize: function() {
            return this;
        },
        
        sendInbox: function(params, options) {
            
            var selfie = params.selfie;
            
            var hashtags = selfie.get("hashtags");
            var promises = [];
            for (var i = 0; i < hashtags.length; i++) {
                promises.push(findSubscribe(hashtags[i], selfie));
            }
            return Parse.Promise.when(promises);
            
        }   
    }
}());