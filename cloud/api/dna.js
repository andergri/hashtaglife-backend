(function() {

  var url = 'https://api-westus.microsoftmoderator.com/v1/ScanImage/Validate';
  var key = 'df2e743821fa4bd59cf96297ecb22213';

  module.exports = {

    version: '1.0.0',
      
    initialize: function() {
        return this;
    },
      
    isNCMECSafe: function(params, options) {
        return Parse.Cloud.httpRequest({
            method: 'POST',
            url: url,
            headers: {'Content-Type': 'application/json',
                      'Ocp-Apim-Subscription-Key': key
                    }, 
            body: { 'DataRepresentation': 'URL',
                    'Value': params.url
                  },
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
            console.log("Error: MSFT DNA "+httpResponse.status+" "+httpResponse.code);
            return false;
        }else{
            var jsonObject = JSON.parse(httpResponse.text);
            return jsonObject.IsMatch; 
        }
    }
      
  }
}());