
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
	response.success("Hello world!");
});

var crypto = require('crypto'),
algorithm = 'aes-256-ctr',
password = '';

function encrypt(text){
	// see http://lollyrock.com/articles/nodejs-encryption/
	var cipher = crypto.createCipher(algorithm,password)
	var crypted = cipher.update(text,'utf8','hex')
	crypted += cipher.final('hex');
	return crypted;
}

function decrypt(text){
	var decipher = crypto.createDecipher(algorithm,password)
	var dec = decipher.update(text,'hex','utf8')
	dec += decipher.final('utf8');
	return dec;
}

Parse.Cloud.beforeSave("Post", function(request, response) {
	// encrypt the text string before saving

	var text = request.object.get("text");
	Parse.Config.get().then(function(config) {
		password = config.get('encryptionKey');
		var encrypted = encrypt(text);
		var encryptedtext = encrypted.toString();
		request.object.set("encryptedText", encryptedtext);
		response.success();
	}, function(error) {
		response.error();
	});
});
