// global classes
var Post;

// Set up app
jQuery( document ).on( "pageinit", "#mainpage", function( event ) {

	// Initialize Parse
	Parse.initialize("CKUBetgoCV0iygTQEJaOMpVt5raxZFS61ESh7e4e", "dhILThcP5vWwn0e5tlyIJYpan0EM0ZDzEK3ClV5a");

	// Initialize Facebook
	window.fbAsyncInit = function() {
		Parse.FacebookUtils.init({ // this line replaces FB.init({
			appId      : '320082134852887', // Facebook App ID
			//status     : true,  // check Facebook Login status
			cookie     : true,  // enable cookies to allow Parse to access the session
			xfbml      : true,  // initialize Facebook social plugins on the page
			version    : 'v2.2' // point to the latest Facebook Graph API version
		});
	};
	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "https://connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	// Create Post class
	Post = Parse.Object.extend("Post");
});

function postit() {
// Callback from post button
	var text = $("#text-1").val();
	var mood = $("#slider").val();

	var post = new Post();
	post.set("mood", mood);
	post.set("text", text);

	login().then(function() {
		savepost(post);
	}, function() {
		alert("Error logging in, can't save post");
	});
}

function savepost(post) {
	// Save this post to the cloud
	post.setACL(new Parse.ACL(Parse.User.current()));
	post.save(null, {
		success: function(post) {
			var d = post.createdAt;
			var date = d.getDate();
			var month = d.getMonth()+1;
			var year = d.getFullYear();
			var hour = d.getHours();
			var mins = d.getMinutes();
			alert("posted:\n"+post.get("text")+"\n"+"mood="+post.get("mood") + "\nat:"+hour+":"+mins+" on "+month+"/"+date+"/"+year);
			$("#text-1").val(''); // clear text
		},
		error: function(gameScore, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and message.
			alert('Failed to create new object, with error code: ' + error.message);
		}
	});
}


jQuery( document ).on( "pageshow", "#mainpage", function (event ) {
	// Display informational overlay popup until fourth visit
	var visits = getCookie("visits") || 0 ;
	if (visits < 4) {		
		setTimeout("$('#overlay').popup('open')", 100); 
	}
	setCookie("visits", parseInt(visits) + 1);
});


// load history on list page
jQuery( document ).on( "pageshow", "#listpage", function (event ) {

	// Clear the existing table data, if any
	$( "#moods .mooddata" ).remove();

	// login if not already before querying for posts
	login().then(function() {
		var query = new Parse.Query(Post);
		query.limit(1000).find({
			success: function(results) {
				// Do something with the returned Parse.Object values
				for (var i = 0; i < results.length; i++) { 
					var object = results[i];
					var d = object.createdAt;
					var month = d.getMonth()+1;
					var day = d.getDate();
					var year = d.getFullYear();
					var hour = d.getHours();
					var mins = d.getMinutes();
					var date = hour+":"+mins+" on "+month+"/"+day+"/"+year;
					var mood = object.get("mood");
					var moodname = getnameformood(mood);
					var reason = object.get("text");

					$('#mood-entries tr:first').after
					(
						"<tr class='mooddata " + moodname + "-mood'>" +
                           "<td class='mood-col'>" + mood + "<br/>" +
                              "<img class='mini-emo' src='assets/" + moodname + ".jpg' />" +
                           "</td>" +
                           "<td class='reason-col'>" + reason + "</td>" +
                           "<td class='when-col'>" + date + "</td>" +
                        "</tr>"
					);
				}
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
	});
});

function login() {
	// log in if not already
	var promise = new Parse.Promise();

	var currentUser = Parse.User.current();
	if (currentUser) {
		promise.resolve();
		return promise;
	} 

	if ("standalone" in navigator && navigator.standalone) {
		var permissionUrl = "https://m.facebook.com/dialog/oauth?client_id=" + appId + "&response_type=code&redirect_uri=" + window.location;
		promise.reject();
		window.location = permissionUrl;
} else {
	Parse.FacebookUtils.logIn(null, {
		success: function(fbuser) {
			if (!fbuser.existed()) {
				
				alert("User signed up and logged in through Facebook!");
				FB.api(
					"/me",
					function (response) {
						if (response && !response.error) {
							alert("Hi there " + response.name + "\nWelcome to MoodMaestro!");
							fbuser.set("username", response.name);
							fbuser.save(null,{});
						}
					}
				);
			} else {
				alert('User logged in through Facebook');
			}
			promise.resolve();
		},
		error: function(user, error) {
			alert('User cancelled log in');
			promise.reject();
		}
	});
}
	return promise;
}

function getnameformood(mood) {
	// map mood number to an image name and a class name
	if (mood <= 2) return "worst";
	if (mood <= 4) return "bad";
	if (mood <= 6) return "ok";
	if (mood <= 8) return "good";
	return "best";
}


// copied from http://stackoverflow.com/questions/1458724/how-to-set-unset-cookie-with-jquery
function setCookie(key, value) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (3 * 24 * 60 * 60 * 1000));
	var newcookie = key + '=' + value + ';expires=' + expires.toUTCString();
    document.cookie = newcookie;
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}
