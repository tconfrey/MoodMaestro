
// Set up app
jQuery( document ).on( "pageinit", "#mainpage", function( event ) {
	Parse.initialize("CKUBetgoCV0iygTQEJaOMpVt5raxZFS61ESh7e4e", "dhILThcP5vWwn0e5tlyIJYpan0EM0ZDzEK3ClV5a");

});

function postit() {
// Callback from post button
	var text = $("#text-1").val();
	var mood = $("#slider").val();

	var Post = Parse.Object.extend("Post");	
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
