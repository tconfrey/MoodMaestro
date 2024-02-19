// global classes
var Post;

// Cached variables
var name = "";
var namepromiseptr;
var initialized = false;

// Set up app
jQuery( document ).on( "pagecreate", function( event ) {

	// only run once
	if (initialized) return;
	initialized = true; 

	console.log("pagecreate cb");

    /*
	// Initialize Parse, FB etc
	initializeBackend();
	*/

	$( "#tableslider" ).bind( "change", function(event, ui) {
		tabletoggleprivate();
	});
	$( "#graphslider" ).bind( "change", function(event, ui) {
		graphtoggleprivate();
	});
});

function postit(priv) {
    // new entry CB, just push to internal array. Commented out back end version is below
	const text = $("#text-1").val();
	const mood = $("#slider").val();
    const d = new Date();

	const post = new Object();
	post.mood = mood;
    post.y = parseFloat(mood);
	post.text = text;
	post.private = priv;
    post.createdAt = d.getTime();
    post.x = d;

    if (priv) privateposts.push(post);
    else publicposts.push(post);
    posts.push(post);

    // set pub/priv as appropriate and show new post
    $.mobile.navigate( "#listpage" );
	setTimeout(() => $("#tableslider").val(priv ? 'private' : 'public').slider("refresh"), 100);
}

var showoverlay = true;
jQuery( document ).on( "pageshow", "#mainpage", function (event ) {
	// Display informational overlay popup until fourth visit
	console.log("mainpage show cb");
	var visits = getCookie("visits") || 0 ;
	if (showoverlay && (visits < 4)) {		
		setTimeout("$('#overlay').popup('open')", 250);
		showoverlay = false;	// don't show after first time, per visit
	}
	setCookie("visits", parseInt(visits) + 1);
	$("#text-1").val("");

	//Set up the split button plugin. See CSS for more details. 
	//This was: $(document).ready
	$('.split-btn').splitdropbutton({
		toggleDivContent: '<i class="fa fa-sort-desc" style="margin-left: 15px;"></i>' // optional html content for the clickable toggle div
	});
});


// load history on list page
jQuery( document ).on( "pageshow", "#listpage", function (event ) {

	console.log("listpage show cb");
	// Clear the existing table data, if any
	$( "#moods .mooddata" ).remove();

	// login if not already before querying for posts
/* Hiding Accounts and external dependencies !!!!!
	login().then(function() {
//		query().then(
//			function(success) {
*/
				for (var i = 0; i < posts.length; i++) { 
					var post = posts[i];
					var d = new Date(post.createdAt);
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
						"<tr class='mooddata " + (post.private ? "private " : "public ") + moodname + "-mood'>" +
							"<td class='mood-col'>" + post.mood + "<br/>" +
							"<img class='mini-emo' src='assets/" + moodname + ".jpg' />" +
							"</td>" +
							"<td class='reason-col'>" + linkify(post.text) + "</td>" +
							"<td class='when-col'>" + date + "</td>" +
							"</tr>"
					);
				}
				tabletoggleprivate(); // respect toggle setting
//			},
//			function(error) {
//				alert("Error: " + error.code + " " + error.message);
			}
);
//});

// local example posts, should be queried from cloud
const publicposts = [
	{"mood": 3.0, "private": false, "text": "Feeling gloomy on this rainy day."},
			{"mood": 6.0, "private": false, "text": "Ecstatic after receiving unexpected good news!"},
			{"mood": 2.0, "private": false, "text": "Feeling down due to chronic pain flare-up."},
			{"mood": 8.0, "private": false, "text": "Delighted to spend time with loved ones."},
			{"mood": 5.0, "private": false, "text": "Frustrated with traffic, running late again."},
			{"mood": 9.0, "private": false, "text": "Thrilled to finally accomplish a personal goal!"},
			{"mood": 4.0, "private": false, "text": "Feeling restless, need to shake off this boredom."},
			{"mood": 7.0, "private": false, "text": "Blissfully enjoying a perfect day at the beach."},
			{"mood": 3.0, "private": false, "text": "Saddened by the loss of a cherished pet."},
			{"mood": 10.0, "private": false, "text": "Overflowing with joy on my wedding day!"}
];
const privateposts = [
	{"mood": 2.0, "private": true, "text": "Feeling blue because I miss my family."},
		{"mood": 5.0, "private": true, "text": "Overwhelmed by work deadlines, feeling stressed out."},
		{"mood": 2.0, "private": true, "text": "Heartbroken after a breakup, can't stop crying."},
		{"mood": 7.0, "private": true, "text": "Grateful for the little things, feeling content today."},
		{"mood": 9.0, "private": true, "text": "Excited about my upcoming vacation, can't wait!"},
		{"mood": 3.0, "private": true, "text": "Feeling lonely, craving some human connection."},
		{"mood": 6.0, "private": true, "text": "Reflective mood, reminiscing about old memories."},
		{"mood": 10.0, "private": true, "text": "Euphoric from achieving my long-term goal, on cloud nine!"},
		{"mood": 4.0, "private": true, "text": "Anxious about the future, uncertainty is unsettling."},
		{"mood": 8.0, "private": true, "text": "Peaceful and serene, enjoying a quiet moment."}
];

var d1 = new Date();
d1.setTime(d1.getTime() - (1000*60*60*24));
var t1 = d1.getTime();
var d2 = new Date(t1 - (1000 * 60 * 60 * 24 * 180));
// code below to iterate through the posts array and add a 'createdAt' field to each object with a randomly generated date between d1 and d2
for (var i = 0; i < privateposts.length; i++) {
	var d = new Date(d2.getTime() + Math.random() * (d1.getTime() - d2.getTime()));
	privateposts[i].createdAt = d.getTime();
	privateposts[i].x = d;
	privateposts[i].y = parseFloat(privateposts[i].mood);
}
for (var i = 0; i < publicposts.length; i++) {
	var d = new Date(d2.getTime() + Math.random() * (d1.getTime() - d2.getTime()));
	publicposts[i].createdAt = d.getTime();
	publicposts[i].x = d;
	publicposts[i].y = parseFloat(publicposts[i].mood);
}
// now sort the posts, privateposts and public by date
privateposts.sort(function(a, b) {
	return a.createdAt - b.createdAt;
});
publicposts.sort(function(a, b) {
	return a.createdAt - b.createdAt;
});
// combine public and private arrays for graphing
const posts = publicposts.concat(privateposts);
posts.sort(function(a, b) {
	return a.createdAt - b.createdAt;
});

function newPublic() {return JSON.parse(JSON.stringify(publicposts)).map(d => {d.x = new Date(d.x); return d; }); }
function newPrivate() {return JSON.parse(JSON.stringify(privateposts)).map(d => {d.x = new Date(d.x); return d; }); }

function tabletoggleprivate()  {
	// toggle showing public or private post in table
	if ($("#tableslider").val()=="public") {
		$("#moods .private").hide("slow");
		$("#moods .public").show("slow");
	} else {
		$("#moods .public").hide("slow");
		$("#moods .private").show("slow");
	}
}

function graphtoggleprivate()  {
	// toggle showing public or private post in table
	const chart = $('#graphcontainer').highcharts();
	const pub = $("#graphslider").val()=="public";
	if (chart) {
		chart.series[0].update({
			data: pub ? newPublic() : newPrivate()
		});
	}
}

function setname() {
	// called on popupform button
	name = $("#namefield").val();
	$('#popupform').popup('close');
	//$.mobile.navigate( "#listpage" );
	namepromiseptr.resolve();
}

function getnameformood(mood) {
	// map mood number to an image name and a class name
	if (mood <= 2) return "worst";
	if (mood <= 4) return "bad";
	if (mood <= 6) return "ok";
	if (mood <= 8) return "good";
	return "best";
}

let cookie = {};
function setCookie(key, value) {
    cookie[key] = value;
}
function getCookie(key) {
    return cookie[key];
}
/*
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
*/

// load history on graph page
jQuery( document ).on( "pageshow", "#graphpage", function (event ) {
	// login if not already before querying for posts
/* Hiding Accounts !!!!!
	login().then(function() {
*/
	console.log("graphpage show cb");
	graphtoggleprivate();		// respect public/private view
	var weekday = new Array(7);
	weekday[0]=  "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";

	const pub = $("#graphslider").val()=="public";
	$("#graphcontainer").width($("#graphpage .ui-content").width() - 25);
	$("#graphcontainer").height("70%");
//	query().then(
//		function(success) {
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
					minRange: 4 * 3600000 // 4 hours
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

				tooltip: {
					formatter: function () {
						
						var hour = this.x.getHours();
						var mins = this.x.getMinutes();
						mins = (mins <10) ? "0"+mins : mins; // leading 0
						var day = weekday[this.x.getDay()];
						return '<b>' + day + " at " + hour + ":" + mins +
							'</b><br/>' + this.y + ": '" + this.point.text + "'";
					}
				},

				series: [{
					/*type: 'spline',*/
					name: 'Mood',
					data: pub ? newPublic() : newPrivate()
				}]
			});
//		});
});

// stolen from http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links#21925491
function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

/*
function query() {
	// query for mood objects
	var promise = new Parse.Promise();
	if (posts.length > 0) {		// aready done
		promise.resolve();
		return promise;
	}
	var qry = new Parse.Query(Post);

	Parse.Cloud.run("MMQuery", {}, {
		success: function(results) {
			// Do something with the returned Parse.Object values
			for (var i = 0; i < results.length; i++) { 
				// Attributes are added so I can use the same objs for graphs
				var d = new Date(results[i].createdAt);
				results[i].x = d;
				results[i].y = parseFloat(results[i].mood);

				posts.push(results[i]);
				// Keep seperate public/private lists for graphing
				if (results[i].private) {
					privateposts.push(results[i]);
				} else {
					publicposts.push(results[i]);
				}
			}
			promise.resolve();
		},
		error: function(error) {
			promise.reject("Error: " + error.code + " " + error.message);
		}
	});
	return promise;
}

function offerlogin() {
	var loginpromise = new Parse.Promise();
	namepromiseptr = loginpromise; 		// global var, horrible form!
	$('#popupform').popup('open');	    // open form, its post will resolve promise
	return loginpromise;
}

function FBlogin() {
	// User chose to log in/create account

	Parse.FacebookUtils.logIn(null, {
		success: function(fbuser) {
			if (!fbuser.existed()) {
				
//				alert("User signed up and logged in through Facebook!");
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
				var uname = Parse.User.current().get("username");
				alert('Welcome back ' + uname + ' !');
			}
			$('#popupform').popup('close');
			namepromiseptr.resolve();
		},
		error: function(user, error) {
			alert('User cancelled log in');
			$('#popupform').popup('close');
			namepromiseptr.reject();
		}
	});
}

function initializeBackend() {
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
}


function postit(priv) {
// Callback from post button
	var text = $("#text-1").val();
	var mood = $("#slider").val();

	var post = new Post();
	post.set("mood", mood);
	post.set("text", text);
	post.set("private", priv);

	if (Parse.User.current()) {
		savepost(post).then(
			function() {
				$.mobile.navigate( "#listpage" );
			});
	} else {
		offerlogin().then(function() {
			savepost(post).then(
				function() {
					$.mobile.navigate( "#listpage" );
				});
		}, function() {
			alert("Error logging in, can't save post");
		});
	}
}

function savepost(post) {
	// Save this post to the cloud. 
	// 3 possibilities: Logged in user private post (set ACL), logged in user public post (set attribution), anonymous user public post.

	// Set access control on private posts
	if (Parse.User.current() && post.get("private")) {
		post.setACL(new Parse.ACL(Parse.User.current()));
	}
	// Set attribution on public posts
	if (Parse.User.current() && !post.get("private")) {
		var uname = Parse.User.current().get("username");
		post.set("text", post.get("text") + " - " + uname);
	}
	// Set attribution on anonymous posts
	if (!Parse.User.current() && name) {
		post.set("text", post.get("text") + " - " + name);
	}

	var savepromise = new Parse.Promise();
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
			publicposts = [];
			privateposts = [];
			savepromise.resolve();
		},
		error: function(gameScore, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and message.
			alert('Failed to create new object, with error code: ' + error.message);
			savepromise.reject();
		}
	});
	return savepromise;
}

*/
