// global classes
var Post;

// Set up app
jQuery( document ).on( "pageinit", "#mainpage", function( event ) {
	Parse.initialize("CKUBetgoCV0iygTQEJaOMpVt5raxZFS61ESh7e4e", "dhILThcP5vWwn0e5tlyIJYpan0EM0ZDzEK3ClV5a");

	window.fbAsyncInit = function() {
		Parse.FacebookUtils.init({ // this line replaces FB.init({
			appId      : '320082134852887', // Facebook App ID
			status     : true,  // check Facebook Login status
			cookie     : true,  // enable cookies to allow Parse to access the session
			xfbml      : true,  // initialize Facebook social plugins on the page
			version    : 'v2.2' // point to the latest Facebook Graph API version
		});
		
		// Run code after the Facebook SDK is loaded.
		login();
	};
	
	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "http://connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	Post = Parse.Object.extend("Post");
});

// load history on list page
jQuery( document ).on( "pageshow", "#listpage", function (event ) {
	var query = new Parse.Query(Post);
	query.find({
		success: function(results) {
			// Do something with the returned Parse.Object values
			$( "#moods .mooddata" ).remove();
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
				var reason = object.get("text");
				$('#moods tr:last').after("<tr class='mooddata'><td>" + date + "</td><td>" + mood + "</td><td>" + reason + "</td></tr>");
			}
			//$( "#moods" ).trigger( "create" );
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});

function postit() {
// Callback from post button
	var text = $("#text-1").val();
	var mood = $("#slider").val();

	var post = new Post();
	post.set("mood", mood);
	post.set("text", text);

	post.save(null, {
		success: function(post) {
			var d = post.createdAt;
			var date = d.getDate();
			var month = d.getMonth()+1;
			var year = d.getFullYear();
			var hour = d.getHours();
			var mins = d.getMinutes();
			alert("posted:\n"+post.get("text")+"\n"+"mood="+post.get("mood") + "\nat:"+hour+":"+mins+" on "+month+"/"+date+"/"+year);
		},
		error: function(gameScore, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and message.
			alert('Failed to create new object, with error code: ' + error.message);
		}
	});

}
var user;
function login() {
	Parse.FacebookUtils.logIn(null, {
		success: function(user) {
			if (!user.existed()) {
				alert("User signed up and logged in through Facebook!");
			} else {
				alert("User logged in through Facebook!");
			}
			FB.api(
				"/me",
				function (response) {
					if (response && !response.error) {
						user = response;
						alert("Hi there " + user.name + "\nWelcome to MoodMaestro!");
					}
				}
			);
		},
		error: function(user, error) {
			alert("User cancelled the Facebook login or did not fully authorize.");
		}
	});
}
