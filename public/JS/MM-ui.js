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
		js.src = "http://connect.facebook.net/en_US/sdk.js";
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
		delayedalert("Error logging in, can't save post");
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
			delayedalert("posted:\n"+post.get("text")+"\n"+"mood="+post.get("mood") + "\nat:"+hour+":"+mins+" on "+month+"/"+date+"/"+year);
			$("#text-1").val(''); // clear text
		},
		error: function(gameScore, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and message.
			delayedalert('Failed to create new object, with error code: ' + error.message);
		}
	});
}


// load history on list page
jQuery( document ).on( "pageshow", "#listpage", function (event ) {

	// Clear the existing table data, if any
	$( "#moods .mooddata" ).remove();

	// login if not already before querying for posts
	login().then(function() {
		var query = new Parse.Query(Post);
		query.find({
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
				delayedalert("Error: " + error.code + " " + error.message);
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
		var permissionUrl = "https://m.facebook.com/dialog/oauth?client_id=320082134852887&response_type=code&redirect_uri=" + window.location;
		delayedalert("opening:"+permissionUrl);
		window.location = permissionUrl;
		setTimeout(function(){promise.resolve();}, 1000);
	} else {

	Parse.FacebookUtils.logIn(null, {
		success: function(fbuser) {
			if (!fbuser.existed()) {
				
				//delayedalert("User signed up and logged in through Facebook!");
				FB.api(
					"/me",
					function (response) {
						if (response && !response.error) {
							//delayedalert("Hi there " + response.name + "\nWelcome to MoodMaestro!");
							fbuser.set("username", response.name);
							fbuser.save(null,{});
						}
					}
				);
			} else {
			//	delayedalert('User logged in through Facebook');
			}
			promise.resolve();
		},
		error: function(user, error) {
			//delayedalert('User cancelled log in');
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

// http://stackoverflow.com/questions/2898740/iphone-safari-web-app-opens-links-in-new-window
(function(a,b,c){if(c in b&&b[c]){var d,e=a.location,f=/^(a|html)$/i;a.addEventListener("click",function(a){d=a.target;while(!f.test(d.nodeName))d=d.parentNode;"href"in d&&(d.href.indexOf("http")||~d.href.indexOf(e.host))&&(a.preventDefault(),e.href=d.href)},!1)}})(document,window.navigator,"standalone");


function delayedalert(text) {
	setTimeout(function(){alert(text);},200);
}
