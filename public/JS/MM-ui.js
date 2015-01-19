// global classes
var Post;

// Set up app
jQuery( document ).on( "pagecreate", function( event ) {

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

//$(document).ready
$(window).load(function(){
  $('.split-btn').splitdropbutton({
    toggleDivContent: '<i class="fa fa-sort-desc" style="margin-left: 15px;"></i>' // optional html content for the clickable toggle div
  })
});

function postit() {
// Callback from post button
	var text = $("#text-1").val();
	var mood = $("#slider").val();

	var post = new Post();
	post.set("mood", mood);

	offerlogin().then(function() {
		post.set("text", text + " - " + name); // add global name set via login
		savepost(post);
		$.mobile.navigate( "#listpage" );
	}, function() {
		alert("Error logging in, can't save post");
	});
}

function savepost(post) {
	// Save this post to the cloud
/* Hiding  Accounts !!!!!
   if (user) {
   post.setACL(new Parse.ACL(Parse.User.current()));
	}
*/
	post.save(null, {
		success: function(post) {
			var d = post.createdAt;
			var date = d.getDate();
			var month = d.getMonth()+1;
			var year = d.getFullYear();
			var hour = d.getHours();
			var mins = d.getMinutes();
//			alert("posted:\n"+post.get("text")+"\n"+"mood="+post.get("mood") + "\nat:"+hour+":"+mins+" on "+month+"/"+date+"/"+year);
			$("#text-1").val(''); // clear text
			posts = [];			  // reload data as needed
		},
		error: function(gameScore, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and message.
			alert('Failed to create new object, with error code: ' + error.message);
		}
	});
}

var showoverlay = true;
jQuery( document ).on( "pageshow", "#mainpage", function (event ) {
	// Display informational overlay popup until fourth visit
	var visits = getCookie("visits") || 0 ;
	if (showoverlay && (visits < 4)) {		
		setTimeout("$('#overlay').popup('open')", 250);
		showoverlay = false;	// don't show after first time, per visit
	}
	setCookie("visits", parseInt(visits) + 1);
});


// load history on list page
jQuery( document ).on( "pageshow", "#listpage", function (event ) {

	// Clear the existing table data, if any
	$( "#moods .mooddata" ).remove();

	// login if not already before querying for posts
/* Hiding Accounts !!!!!
	login().then(function() {
*/
		query().then(
			function(success) {			
				for (var i = 0; i < posts.length; i++) { 
					var post = posts[i];
					var d = post.serverobj.updatedAt;
					var month = d.getMonth()+1;
					var day = d.getDate();
					var year = d.getFullYear();
					var hour = d.getHours();
					var mins = d.getMinutes();
					mins = (mins <10) ? "0"+mins : mins; // leading 0
					var date = hour+":"+mins+" on <br/>"+month+"/"+day+"/"+year;
					var moodname = getnameformood(post.mood);

					$('#mood-entries tr:first').after
					(
						"<tr class='mooddata " + moodname + "-mood'>" +
							"<td class='mood-col'>" + post.mood + "<br/>" +
							"<img class='mini-emo' src='assets/" + moodname + ".jpg' />" +
							"</td>" +
							"<td class='reason-col'>" + post.reason + "</td>" +
							"<td class='when-col'>" + date + "</td>" +
							"</tr>"
					);
				}
			},
			function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		);
});

// local storage for posts queried from cloud
var posts = [];

function query() {
	// query for mood objects
	var promise = new Parse.Promise();
	if (posts.length > 0) {		// aready done
		promise.resolve();
		return promise;
	}
	var qry = new Parse.Query(Post);
	qry.limit(1000).ascending("updatedAt").find({
		success: function(results) {
			// Do something with the returned Parse.Object values
			for (var i = 0; i < results.length; i++) { 
				var post = new Object();
				post.serverobj = results[i];
				post.mood = results[i].get("mood");
				post.reason = results[i].get("text");
				// These next attributes are added so I can use the same objs for graphs
				post.x = results[i].updatedAt;
				post.y = parseInt(post.mood);
				post.name = post.reason;
				posts.push(post);
			}
			promise.resolve();
		},
		error: function(error) {
			promise.reject("Error: " + error.code + " " + error.message);
		}
	})
	return promise;
}

var name = "";
var namepromiseptr;
var user;
function getname() {
	// Get user name to file under
	var namepromise = new Parse.Promise();
	namepromiseptr = namepromise; 		// global var, horrible form!
	$('#popupform').popup('open');	// open form, its post will resolve promise
	return namepromise;
}
function setname() {
	// called on popupform button
	name = $("#namefield").val();
	$('#popupform').popup('close');
	$.mobile.navigate( "#listpage" );
	namepromiseptr.resolve();
}

function offerlogin() {
	// offer log in if not already
	var loginpromise = new Parse.Promise();
	if (!user) {
		getname().then(
			function(success) {
				loginpromise.resolve();
			});
	} else {
		loginpromise.resolve();
	}
	return loginpromise;


/* Hiding FB Accounts !!!!!
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
*/
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


// load history on graph page
jQuery( document ).on( "pageshow", "#graphpage", function (event ) {
	// login if not already before querying for posts
/* Hiding Accounts !!!!!
	login().then(function() {
*/
		query().then(
			function(success) {	
				$('#graphcontainer').highcharts({
					chart: {
						type: 'areaspline',
						zoomType: 'x'
					},
					title: {
						text: 'Mood Graph'
					},
					subtitle: {
						text: document.ontouchstart === undefined ?
							'Click and drag in the plot area to zoom in' :
							'Pinch the chart to zoom in'
					},
					xAxis: {
						type: 'datetime',
						tickInterval: 24 * 3600 * 1000,
						minRange: 24 * 3600000 // day
					},
					yAxis: {
						title: {
							text: 'Mood'
						},
						max: 10,
						min: 0,
						tickInterval: 2
					},
					legend: {
						enabled: false
					},
					plotOptions: {
						areaspline: {
							fillColor: {
								linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
								stops: [
									[0, '#E0C0C0'],
									[1, '#C0E0C0']
								]
							},
							marker: {
								radius: 3
							},
							lineWidth: 2,
							states: {
								hover: {
									lineWidth: 1
								}
							},
							threshold: 5
						}
					},

					series: [{
						/*type: 'spline',*/
						name: 'Mood',
						data: posts
					}]
				});
			});
});
