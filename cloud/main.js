
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

Parse.Cloud.define("MMDecrypt", function(request, response) {
	// Used for debugging
	var text = request.params.txt;
	Parse.Config.get().then(function(config) {
		password = config.get('encryptionKey');
		var decrypted = decrypt(text);
		var decryptedtext = decrypted.toString();
		response.success(decryptedtext);
	}, function(error) {
		response.error();
	});
});

Parse.Cloud.define("MMEncrypt", function(request, response) {
	// Used for debugging. EG from console run:
	// Parse.Cloud.run("MMEncrypt", {txt: "this is the text"});
	var text = request.params.txt;
	Parse.Config.get().then(function(config) {
		password = config.get('encryptionKey');
		var encrypted = encrypt(text);
		var encryptedtext = encrypted.toString();
		response.success(encryptedtext);
	}, function(error) {
		response.error();
	});
});
	

Parse.Cloud.beforeSave("Post", function(request, response) {
	// encrypt the text string before saving

	var text = request.object.get("text");
	Parse.Config.get().then(function(config) {
		password = config.get('encryptionKey');
		var encrypted = encrypt(text);
		var encryptedtext = encrypted.toString();
		request.object.set("encryptedText", encryptedtext);
		request.object.set("text", encryptedtext);
		response.success();
	}, function(error) {
		response.error();
	});
});


Parse.Cloud.define("MMQuery", function(request, response) {
	// Create Post class
	Post = Parse.Object.extend("Post");

	console.log("request="+request);
	var qry = new Parse.Query(Post);
	var resultsJson = [];		// return array of json objs
	Parse.Config.get().then(function(config) {
		password = config.get('encryptionKey');
		qry.limit(1000).ascending("createdAt").find({
			success: function(results) {
				for (var i = 0; i < results.length; i++) { 
					var resultJson = results[i].toJSON();
					//console.log("obj="+JSON.stringify(resultJson));
					var etext = results[i].get("encryptedText");
					// decrypt before sending back
					if (etext) {
						var dtext = decrypt(etext);
						resultJson["text"] = dtext;
					}
					resultsJson.push(resultJson);
				}
				response.success(resultsJson);
			},
			error: function(results) {
				response.error("failed");
			}
		});
	});
});
