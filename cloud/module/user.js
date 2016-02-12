(function() {

  Parse.Cloud.useMasterKey();    
  var User = Parse.Object.extend('_User');  
  var userId = '';

  module.exports = {
    version: '1.0.0',
      
    initialize: function(userId) {
      userId = userId;
      return this;
    },
      
    banUser: function(params, options) {
      var userObj = new User({ objectId: userId });
      userObj.set('banned', 'banned');
      return userObj.save().then(function(user) {
        options.success(user);
      }, function(error) {
          if (options && options.error) {
             options.error();
          }
      });            
    }
  }
}());