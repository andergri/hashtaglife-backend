(function() {

  var pubnub = { 
    'publish_key'   : 'pub-c-8ac615f6-dced-40c4-b125-da247a0929c0', 
    'subscribe_key' : 'sub-c-071aae4c-3167-11e5-9b16-02ee2ddab7fe'
  };
  var _channel   = "global"; 

  module.exports = {

    version: '1.0.0',
      
    initialize: function() {
        return this;
    },
      
    sendPubNub: function(params, options) {
        return Parse.Cloud.httpRequest({
            url: 'http://pubsub.pubnub.com/publish/' + 
                pubnub.publish_key   +   '/' + 
                pubnub.subscribe_key + '/0/' + 
                _channel             + '/0/' + 
                encodeURIComponent(params.content),
            success: function(httpResponse) {
                if (options && options.success) {
                    options.success(httpResponse);
                }
            }, error: function(httpResponse) {
                if (options && options.error) {
                    options.error(httpResponse);
                }
            }
        });
    }
      
  }
}());