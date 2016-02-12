(function() {       
    
    // Time in seconds, 60 = 1 minute 
    Parse.Cloud.useMasterKey();
    var _ = require('underscore.js');
    
    module.exports = {
  
        version: '1.0.0',
        
        initialize: function() {
            return this;
        },
        
        incentiviseRecentPost: function(params, options) {
            
            var ts = Math.round(new Date().getTime() / 1000);
            var tsYesterday = ts - (params.latertime);
            var dateYesterday = new Date(tsYesterday*1000);  
        
            var query = new Parse.Query("Selfie");
            query.greaterThan("createdAt", dateYesterday);
            query.find().then(function(results) {

                var promises = [];
                _.each(results, function(selfie) {
                    
                    var likes = Math.floor(Math.random() * 1) + 1;
                    selfie.increment("likes", likes);
                    promises.push(selfie.save());
                });
  
                return Parse.Promise.when(promises);

            }).then(function(promise) {
                options.success("Ya prmoise");
            }, function(error) {
                options.error("Error: Incentivise Recent Post"+error);
            });
        }
        
    }
}());