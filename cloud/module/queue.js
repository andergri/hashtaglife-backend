(function() {       
    
    Parse.Cloud.useMasterKey();
    var _ = require('underscore.js');

    var postSelfie = function(queueObject) {

        var promise = new Parse.Promise();

        var Selfie = Parse.Object.extend("Selfie");
        var selfie = new Selfie();
        selfie.set("hashtags",queueObject.get("hashtags"));
        selfie.set("image",queueObject.get("image"));
        selfie.set("location",queueObject.get("location"));
        selfie.set("from",queueObject.get("from"));
        selfie.set("likes", 1);
        selfie.set("visits", 2);
        selfie.set("flags", 0);
        selfie.save().then(function() {
            promise.resolve();
        });

        return promise;
    };    

    var isQuietHour = function() {
        var now = new Date();
        var hour = now.getHours();
        if(4 <= hour && hour <= 8){
            return true;
        }else{
            return false;
        }
    };

    var isInListLocations = function(listLocations, locationId){
    
        //console.log("QUEUE locationId"+locationId);
        
        for (var i = 0; i < listLocations.length; i++) {
            if (listLocations[i] === locationId) {  
                return true;
            }
        }
        return false;
    };
    
    var getPostingList = function(postings){
        
        var listPostings = [];
        var listLocations = [];
        _.each(postings, function(item){
            
            var locationId = item.get("location").id;
            if(!isInListLocations(listLocations, locationId)){
                listLocations.push(locationId);
                listPostings.push(item);
            }          
        });
        return listPostings;
    };
    

    module.exports = {

        version: '1.0.0',

        initialize: function() {
            return this;
        },        
        
        runQueue: function(params, options) {

            if(isQuietHour()){
                options.success();
            }
            
            var query = new Parse.Query("Queue");
            query.ascending('createdAt');
            query.find().then(function(queues) {

                return getPostingList(queues);

            }).then(function(postings) {

                var promises = [];
                _.each(postings, function(item){
                    promises.push(postSelfie(item));
                });
                promises.push(Parse.Object.destroyAll(postings));
                return Parse.Promise.when(promises);

            }).then(function() {
                options.success(); 
            });  
        }

    }  
}());