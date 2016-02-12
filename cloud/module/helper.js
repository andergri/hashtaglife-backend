(function() {       
    
    Parse.Cloud.useMasterKey();
  
    var clientVisionPromise = function(selfie) {
        
        var promise = new Parse.Promise();
        var imageO = selfie.get('image');
        
        // MSFT Vision //
        var clientVision = require('cloud/api/vision.js');
        clientVision.initialize();
        clientVision.isAdultImage({
            url: imageO.url()
        }).then(function(httpResponse) {
            
            var isSafe = clientVision.checkResult(httpResponse);
            if(isSafe){
                var eself = selfie;
                eself.set("flags", 6);
                eself.addUnique("complaint", "MSFT");
                eself.addUnique("complaint", "Auto");
                eself.save().then(function() {
                    console.log("Main: Helper: MSFT Vision " + isSafe);
                    promise.resolve();
                });
            }else{
                console.log("Main: Helper: MSFT Vision " + isSafe);
                promise.resolve();
            }
        }, function(httpResponse) {
            console.error("Error: Helper: MSFT Vision "+httpResponse.status+" "+ JSON.stringify(httpResponse.error));
            promise.resolve();
        }); 
        
        return promise;
    };    
    
    var clientDNAPromise = function(selfie) {
        
        var promise = new Parse.Promise();
        var imageO = selfie.get('image');
        
        // MSFT DNA //
        var clientDNA = require('cloud/api/dna.js');
        clientDNA.initialize();
        clientDNA.isNCMECSafe({
            url: imageO.url()
        }).then(function(httpResponse) {

            var isSafe = clientDNA.checkResult(httpResponse);
            if(isSafe){
                var eself = selfie;
                eself.set("flags", 6);
                eself.addUnique("complaint", "MSFT");
                eself.addUnique("complaint", "Admin"); 
                eself.addUnique("complaint", "Report");
                eself.addUnique("complaint", "NCMEC");
                eself.save().then(function() {
                    console.log("Main: Helper: MSFT DNA " + isSafe);
                    promise.resolve();
                });
            }else{
                console.log("Main: Helper: MSFT DNA " + isSafe);
                promise.resolve();
            }
        }, function(httpResponse) {
            console.error("Error: Helper: MSFT DNA "+httpResponse.status+" "+JSON.stringify(httpResponse.error));
            promise.resolve();
        });  

        return promise;
    };    
    
    var clientPubNubPromise = function(selfie) {
        
        var promise = new Parse.Promise();

        // PubNub //
        var clientPubNub = require('cloud/api/pubnub.js');
        clientPubNub.initialize();
        clientPubNub.sendPubNub({
            content: JSON.stringify(selfie)
        }).then(function(httpResponse) {
            console.log("Main: Helper: PubNub");
            promise.resolve();
        }, function(httpResponse) {
            console.error("Error: Helper: PubNub "+httpResponse.status+" "+JSON.stringify(httpResponse.error));
            promise.resolve();
        });  
        
        return promise;
    };
    
  module.exports = {
  
    version: '1.0.0',
      
    runAPI: function(params, options) {
        
        var promises = [];
        var selfie = params.selfie;
        
        if (!selfie.existed()) {
            promises.push(clientVisionPromise(selfie));
            //promises.push(clientDNAPromise(selfie));
        }
        
        var selfieDate = selfie.createdAt;   
        var ONE_HOUR = 2 * 60 * 1000;
        if (!selfie.existed() || ((new Date) - selfieDate) < ONE_HOUR) {
            promises.push(clientPubNubPromise(selfie));
        }
        
        return Parse.Promise.when(promises);
    }
  }
}());