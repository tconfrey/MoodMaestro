
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
		request.object.set("createdBy", Parse.User.current()); // associate user
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

// ------------------------------------------------------------
// jobs code to send out emails
// ------------------------------------------------------------

 // Setting up Mandrill email service
var Mandrill = require('mandrill');
Mandrill.initialize('KyblfsskhPl72Sph7WOlxQ');     // API key for my account

// Define day of year method
Date.prototype.getDOY = function() {
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((this - onejan) / 86400000);
}

// For now just use global list of email addrs
var emails = ["tconfrey@gmail.com", "nconfrey@earthlink.net", "nickconfrey@earthlink.net", "confreyjack9@gmail.com"];
 
Parse.Cloud.job("emailReminders", function(request, response) {
  // Send out an email to all users prompting a mood post

	// first shoudl we run now?
	var today = new Date();
	var daynum = today.getDOY();
	if (daynum % 6 != 0) {
		console.log("Not a sixth day, exiting");
		response.success("No email sent.");
		return; // run every 6 days
	}
	
    var mailText = "Hi there!\n\nThis is your regular email reminder from MoodMaestro. Click the link below to update your mood.\n";
    mailText += "http://moodmaestro.com \n";
	
	for (var i=0; i<emails.length; i++) {
		Mandrill.sendEmail({
			message: {
				text: mailText,
				subject: "How's your mood?",
				from_email: "mandrake@moodmaestro.com",
				from_name: "Mandrake",
				to: [
					{
						email: emails[i],
						name: 'Tony'
					}
				]
			},
			async: true
		},{
			success: function(httpResponse) {
				console.log(httpResponse);
				response.success("Email sent!");
			},
			error: function(httpResponse) {
				console.error(httpResponse);
				response.error("Uh oh, something went wrong");
			}
		});
	}
});


function sendNotificationEmail(user, post) {
	// send notfication to user that there is a new post
	var name = user.get("username");
	var email = user.get("email");
	Mandrill.sendEmail({
		message: {
			text: "Hi there "+name+"!\n\nThis email is to let you know that there have been new public mood updates posted. Click below to see who's feeling what and why.\nhttp://moodmaestro.com/#listpage \n",
			subject: "New mood posted",
			from_email: "mandrake@moodmaestro.com",
			from_name: "Mandrake",
			to: [
				{
					email: email,
					name: name
				}
			]
		},
		async: true
	},{
		success: function(httpResponse) {
			console.log("sent email to " + email);
		},
		error: function(httpResponse) {
			//console.error(httpResponse);
		}
	});
}

function userPostNotification(user) {
	// Check is there have been posts this user should be emailed about
	var userpromise = new Parse.Promise();
	var postquery = new Parse.Query(Post);
	var lastnotified = user.get("lastNotifiedAt");
	// public posts by other users since this user was last notified?
	postquery.notEqualTo("createdBy", user);
	postquery.equalTo("private", false);
	postquery.greaterThan("createdAt", lastnotified);
	postquery.first({
		success: function(post) {
			if (post) {
				console.log("found a post for " + user.get("username") + ", by " + JSON.stringify(post.get("createdBy")));
				sendNotificationEmail(user, post);
				var now = new Date();
				user.set("lastNotifiedAt", now);
				user.save();
			} else {
				console.log("no new posts");
			}
			userpromise.resolve();
		},
		error: function(error) {
			console.log("error in query rsp");
			userpromise.resolve();
		}
	});
	return userpromise;
}

Parse.Cloud.job("postNotification", function(request, response) {
	// Set up to modify user data
	Parse.Cloud.useMasterKey();

	// Query for all users
	var userquery = new Parse.Query(Parse.User);
	Post = Parse.Object.extend("Post");

	// Create a promose and add each call to PostNotification to it as a .then()
	var promise = Parse.Promise.as();
	userquery.each( function(user) { 
		promise = promise.then( function () {
			return userPostNotification(user);
		} )
	}).then(function() {
		// Don't get here until all the .each promises are resolved
		promise.then(function() {
			response.success("Checked for updates");
		}, function (error) {
			response.error(error);
		});
	});
});
