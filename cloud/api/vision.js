(function() {

  var url = 'https://api.projectoxford.ai/vision/v1/analyses?visualFeatures=Adult';
  var key = '70e1db3e721f40a0a6266b89caa568fd';

  module.exports = {

    version: '1.0.0',
      
    initialize: function() {
        return this;
    },
      
    isAdultImage: function(params, options) {
        return Parse.Cloud.httpRequest({
            method: 'POST',
            url: url,
            headers: {'Content-Type': 'application/json',
                      'Ocp-Apim-Subscription-Key': key
                    }, 
            body: { 'Url': params.url},
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
    },
   
    checkResult: function(httpResponse){
        if(httpResponse.status != 200){
            console.log("Error: MSFT Vision "+httpResponse.status+" "+httpResponse.code);
            return false;
        }else{
            var jsonObject = JSON.parse(httpResponse.text);
            if(jsonObject.adult.isAdultContent || jsonObject.adult.isRacyContent){
                return true;
            }else{
                return false;
            }
        }
    }  
  }
}());