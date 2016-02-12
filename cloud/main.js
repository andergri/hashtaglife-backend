
require('cloud/app.js');


/*****************************************************
** Test: Hello ***************************************
*****************************************************/

Parse.Cloud.define("hello", function(request, response) {
    response.success("Hello world!");
});



/*****************************************************
** Web: Get Selfies For Hashtag **********************
*****************************************************/

Parse.Cloud.define("getSelfiesForHashtag", function(request, response) {
    var query = new Parse.Query("Selfie");
    query.descending('createdAt');
    query.equalTo("hashtags", request.params.hashtag);
    query.find({
        success: function(results) {
            response.success(results);
        }, error: function() {
            response.error("hashtag does not exist!");
        }
    });
});

/*****************************************************
** Job: Queue Selfies ********************************
*****************************************************/

Parse.Cloud.job("queueSelfies", function(request, response) {

    Parse.Cloud.useMasterKey();
    var clientQueue = require('cloud/module/queue.js');
    clientQueue.initialize();
    clientQueue.runQueue({
    }, {
        success: function(httpResponse) { response.success("Success: Queue"); },
        error: function(httpResponse) { response.error("Error: Queue"); }
    });   
});



/*****************************************************
** Job: Incentivise Posting - 2 **********************
*****************************************************/

Parse.Cloud.job("incentivizePosting", function(request, response) {
    
    Parse.Cloud.useMasterKey();

    var clientIncentivise = require('cloud/module/incentivise.js');
    clientIncentivise.initialize();
    clientIncentivise.incentiviseRecentPost({
        latertime: 500
    }, {
        success: function(httpResponse) { response.success("Success: Incentivise 2"); },
        error: function(httpResponse) { response.error("Error: Incentivise 2"); }
    });
});



/*****************************************************
** Job: Incentivise Posting - 1 **********************
*****************************************************/

Parse.Cloud.job("incentivizePostingCurrent", function(request, response) {

    Parse.Cloud.useMasterKey();

    var clientIncentivise = require('cloud/module/incentivise.js');
    clientIncentivise.initialize();
    clientIncentivise.incentiviseRecentPost({
        latertime: 180
    }, {
        success: function(httpResponse) { response.success("Success: Incentivise 1"); },
        error: function(httpResponse) { response.error("Error: Incentivise 1"); }
    });
});



/*****************************************************
** Not Sure: Clean Hashtag ***************************
*****************************************************/

Parse.Cloud.define("cleanHashtag", function(request, response) {

    var hashtags = request.object.get('hashtags');
    for (var i = 0; i < hashtags.length; i++) {
        
        query = new Parse.Query("Hashtag");
        query.equalTo("name", hashtags[i]);
        query.find({
            success: function(ahashtags) {
                var hashtag = ahashtags[0];
                var count = hashtag.get("count");
                console.log("hashtag " + hashtag + " count " + count);
                if(count > 0){

                    count = count - 1;
                    hashtag.set("count", count);
                    hashtag.save();
                }else{

                    hashtag.destroy();
                }
            }, error: function(error) {
           	    response.error(error); 
	       }
        });
    }
    response.success();
});



/*****************************************************
** Before Save: Selfie *******************************
*****************************************************/

var Image = require("parse-image");
Parse.Cloud.beforeSave("Selfie", function(request, response) {

    var selfie = request.object;
    if (!selfie.get("image")) {
        response.error("Error: Before Save Selfie: Photo Required");
        return;
    }
 
    if (!selfie.dirty("image")) {
        response.success();
        return;
    }
 
    Parse.Cloud.httpRequest({
    
        url: selfie.get("image").url()
    
    }).then(function(response) {
        
        var image = new Image();
        image.setData(response.buffer);  
        return image;

    }).then(function(image) {
    
        return image.setFormat("JPEG");
 
    }).then(function(image) {

        return image.data();
      
    }).then(function(buffer) {
        
        var base64 = buffer.toString("base64");
        var cropped = new Parse.File("selfie.jpg", { base64: base64 });
        return cropped.save();
 
    }).then(function(cropped) {
      
        try {  
            var v = Math.floor(Math.random() * 2) + 1;
		  var l = Math.floor(Math.random() * v);
            selfie.increment("likes", l);
            selfie.increment("visits", v);
        } catch(err) {
        } 
      
        selfie.set("image", cropped);
 
    }).then(function(result) {
        response.success();
    }, function(error) {
        response.error("Error: Tag Trending "+error);
    });
});



/*****************************************************
** After Save: Selfie ********************************
*****************************************************/
// 'https://boiling-hollows-8856.herokuapp.com?url='+imageO.url();

Parse.Cloud.afterSave("Selfie", function(request) {
    
    Parse.Cloud.useMasterKey();

    var promises = [];    
    
    // Bad Hashtags //
    if (!request.object.existed()) {
        console.log("Main: Bad Hashtags");
        var clientBadHashtags = require('cloud/module/badhashtags.js');    
        var _ = require('underscore.js');
        var ehashtags = request.object.get('hashtags');
        _.each(ehashtags, function(ehashtag) {
            
            ehashtag = ehashtag.toLowerCase();
            var isBad = clientBadHashtags.hasBadWord(ehashtag);
            var isUserBad = clientBadHashtags.hasBadUser(request.object.get("from").id);
            if(isBad || isUserBad){
                var eself = request.object;
                eself.set("flags", 6);
                eself.addUnique("complaint", "Auto");
                promises.push(eself.save());       
            }
        });
    }

    return Parse.Promise.when(promises).then(function() { 

        // New Tags //
        if (!request.object.existed()) {
            console.log("Main: New Tags");
            var ehashtags = request.object.get('hashtags');
            var elocation = request.object.get("location").id;
            var clientTags = require('cloud/module/newtags.js');
            return clientTags.increaseTags({hashtags: ehashtags, location: elocation});
        } return "a";

    }).then(function(result) {  

        // 5 flags //
        if(request.object.get("flags") > 5){
            console.log("Main: 5 flags");
            var ehashtags = request.object.get('hashtags');
            var elocation = request.object.get("location").id;
            var clientTags = require('cloud/module/tags.js');
            return clientTags.reduceHashtagsAndTags2({hashtags: ehashtags, location: elocation}); // Problem
         } 
         return "a";

    }).then(function(result) {

        // HELPER //
        var clientHelper = require('cloud/module/helper.js');
        return clientHelper.runAPI({selfie: request.object}); 

    }).then(function(result) {

        // Inbox //
        if (!request.object.existed()) {
            var clientInbox = require('cloud/module/inbox.js');
            return clientInbox.sendInbox({selfie: request.object}); 
        }
    
    }).then(function(result) {
        //console.log("Success: Main");
    }, function(error) {
        console.log("Error: Main");
    });
    
});



/*****************************************************
** After Delete: Selfie ******************************
*****************************************************/

Parse.Cloud.afterDelete("Selfie", function(request) {
    
    var ehashtags = request.object.get('hashtags');
    var elocation = request.object.get("location").id;
    
    Parse.Cloud.useMasterKey();

    var clientTags = require('cloud/module/tags.js');
    clientTags.reduceHashtagsAndTags({
        hashtags: ehashtags,
        location: elocation
    }, {
        success: function(eresult) { console.log("Success: After Delete"); },
        error: function(eresult) { console.error("Error: After Delete"); }
    });

});


/*****************************************************
** Job: Send Push Notifications **********************
*****************************************************/

Parse.Cloud.job("sendPushNotifications", function(request, status) {

    Parse.Cloud.useMasterKey();
    var _ = require('underscore.js');
  
    var query = new Parse.Query("Vote");
    query.equalTo("notifyAttempted", false);
    query.find().then(function(results) {
	
        var promises = [];
        _.each(results, function(vote) {  
        
            var poster = vote.get("poster");
            var pquery = new Parse.Query(Parse.Installation), data = {
                "alert": vote.get("voterName")+" voted on your photo", 
                "selfie":  vote.get("selfie").id, // extra data to send to the phone.
                "sound": "cheering.caf", // default ios sound.
                "uri": "hashtaglife://hashtaglife.com/selfie/"+vote.get("selfie").id,
                "badge": "Increment"
            };
            
            pquery.equalTo("user", poster);
            vote.set("notifyAttempted", true);
            vote.save();
            promises.push(Parse.Push.send({where: pquery, data: data}));
        }); 
        
        return Parse.Promise.when(promises);   
      
  }).then(function() {
      status.success("Success: Send Push Notifications");
   }, function(error) {
     console.log(error);
     status.error("Error: Send Push Notifications "+error);
   });
});



/*****************************************************
** Job: Hashtag Trending *****************************
*****************************************************/

Parse.Cloud.job("hashtagTrending", function(request, status) {

  Parse.Cloud.useMasterKey();

  var date = new Date();
  date.setDate(date.getDate() - 2);

  var query = new Parse.Query("Hashtag");
  query.greaterThan("trending", 0);
  query.each(function(hashtag) {
		
      var tren = hashtag.get("trending");
      if(tren > 0){
          if(tren > 4){
              tren = 4;
          }else{
              tren = tren - 1;
          }
      }
      hashtag.set("trending", tren);
      return hashtag.save();

  }).then(function() {
        status.success("Success: Hashtag Trending");
   }, function(error) {
        console.log(error);
        status.error("Error: Hashtag Trending "+error);
   });
});



/*****************************************************
** Job: Tag Trending *********************************
*****************************************************/

Parse.Cloud.job("tagTrending", function(request, status) {

  Parse.Cloud.useMasterKey();

  var date = new Date();
  date.setDate(date.getDate() - 2);

  var query = new Parse.Query("Tag");
  query.greaterThan("trending", 0);
  query.each(function(hashtag) {

        var tren = hashtag.get("trending");
        if(tren > 0){
            if(tren > 4){
                tren = 4;
            }else{
                tren = tren - 1;
            }
        }
        hashtag.set("trending", tren);
        return hashtag.save();

   }).then(function() {
        status.success("Success: Tag Trending");
   }, function(error) {
        console.log(error);
        status.error("Error: Tag Trending "+error);
   });
});



/*****************************************************
** Ban User  *****************************************
*****************************************************/

Parse.Cloud.define('banUser', function(request, response) {
    Parse.Cloud.useMasterKey();
    var userId = request.params.userId;
    var User = Parse.Object.extend('_User');
    var user = new User({ objectId: userId });
    user.set('banned', 'banned');
    user.save().then(function(user) {
        response.success("Success: Ban User");
    }, function(error) {
        response.error("Error: Ban User "+error);
    });    
});



/*************
*************/

Parse.Cloud.define('test', function(request, response) {
    
    Parse.Cloud.useMasterKey();
    
});

    /**
    
        // PubNub //
    var clientPubNub = require('cloud/api/pubnub.js');
    clientPubNub.initialize();
    clientPubNub.sendPubNub({
        content: JSON.stringify(request.object)
    }).then(function(httpResponse) {
        console.log("Success: PubNub");
    }, function(httpResponse) {
        console.error("Error: PubNub "+httpResponse.status+" "+httpResponse.code);
    });  
    
    // MSFT Vision //
    var clientVision = require('cloud/api/vision.js');
    clientVision.initialize();
    clientVision.isAdultImage({
        url: imageO.url()
    }).then(function(httpResponse) {
     
        var isSafe = clientVision.checkResult(httpResponse);
        if(isSafe){
            var eself = request.object;
            eself.set("flags", 6);
            eself.addUnique("complaint", "MSFT");
            eself.addUnique("complaint", "Auto");
            return eself.save(); 
        }
        console.log("Success: MSFT Vision " + isSafe);
    }, function(httpResponse) {
        console.error("Error: MSFT Vision "+httpResponse.status+" "+httpResponse.code);
    });      

    // MSFT DNA //
    var clientDNA = require('cloud/api/dna.js');
    clientDNA.initialize();
    clientDNA.isNCMECSafe({
        url: imageO.url()
    }).then(function(httpResponse) {
        
        var isSafe = clientDNA.checkResult(httpResponse);
        if(isSafe){
            var eself = request.object;
            eself.set("flags", 6);
            eself.addUnique("complaint", "MSFT");
            eself.addUnique("complaint", "Admin"); 
            eself.addUnique("complaint", "Report");
            eself.addUnique("complaint", "NCMEC");
            return eself.save();
        }
        console.log("Success: MSFT DNA " + isSafe);
    }, function(httpResponse) {
        console.error("Error: MSFT DNA "+httpResponse.status+" "+httpResponse.code);
    });  
    **/
