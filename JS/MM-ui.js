// global classes
var Post;

// Set up app
jQuery( document ).on( "pageinit", "#mainpage", function( event ) {
	Parse.initialize("CKUBetgoCV0iygTQEJaOMpVt5raxZFS61ESh7e4e", "dhILThcP5vWwn0e5tlyIJYpan0EM0ZDzEK3ClV5a");

	Post = Parse.Object.extend("Post");	
});

// load history on list page
jQuery( document ).on( "pageshow", "#listpage", function (event ) {
	var query = new Parse.Query(Post);
	query.find({
		success: function(results) {
			// Do something with the returned Parse.Object values
			for (var i = 0; i < results.length; i++) { 
				var object = results[i];
				var d = object.createdAt;
				var month = d.getMonth()+1;
				var day = d.getDay();
				var year = d.getFullYear();
				var hour = d.getHours();
				var mins = d.getMinutes();
				var date = hour+":"+mins+" on "+month+"/"+day+"/"+year;
				var mood = object.get("mood");
				var reason = object.get("text");
				$('#moods tr:last').after('<tr><td>' + date + '</td><td>' + mood + '</td><td>' + reason + '</td></tr>');
			}
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
