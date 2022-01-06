var client_id = '2a2c79748c3a4ce09c58e3ca7ebab575'; // Your client id
var client_secret = 'ed68a2d9157e45da801a244bf81300fe'; // Your secret
var redirect_uri = 'http://127.0.0.1:5500'; // Your redirect uri-local
var access_token = 0;
var refresh_token = 0;
var tokenValidTime = 360000000 // In ms ---> 3600 s ---> 60 min ---> 1 h 
setCookie("trackID", -1)





/**
 * General functions.
 */
 
// When page is loaded, adds various buttons
$(document).ready(function(){
    addChannelButtons();
    $('.music_b').html('Ingen låt spelas just nu.');
    $('#recomm-container').html('Just nu spelas ingen musik.');
    $('#album-container').html('Just nu spelas ingen musik.');
});


// Returns the cookie with the given identifier in the parameter
// parameter - variable name of cookie
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
// Sets a given cookie in the browser
function setCookie(name, value) {
    document.cookie = name + '=' + value;
}




/**
 * 
 * Alert messages.
 */
function alertMessage_songAdded(){
    Swal.fire(
        'Klar!',
        'Låten har lagts till i din spellista!',
        'success'
      )
}

function alertMessage_NoSongPlaying(){
    Swal.fire(
        'OBS!',
        'Det finns ingen låt som spelas just nu, välj en kanal först!',
        'warning'
      )
}

function alertMessage_wrongSongName(){
    Swal.fire(
        'OBS!',
        'Namnet på låten som spelas just nu är felaktig skriven, alltså går det inte att lägga till det i spotify spellistan. !',
        'error'
      )
}





/**
 * Main functions.
 */


// Adds buttons for each radio channel to a dropdown menu
function addChannelButtons(){

    //Another way.
    /*
    var channelsInfo =  $.getJSON('channels.json', function(channelsData) {
        console.log('Channels fetched');
     })
     */

    // Requests a list of channels from the json file.
     var channelsInfo  = $.ajax({
         url: 'channels.json',
         dataType: 'json',
         cache: false
     })
     .done(function() {
        console.log('Channels fetched');
        var channels = JSON.parse(channelsInfo.responseText);
        // Adds a button for each channel in the JSON object
        for(var channel in channels) {
            if(channels.hasOwnProperty(channel)) {
                let button = $('<div />', {
                    class: "channels",
                    text: channels[channel],
                    value: channel,
                    on: {
                        click: function() {
                            radio(this.textContent, this.getAttribute('value'));
                        }
                    }
                });
                $('.channel_c').append(button);
            }
        }

    })
    .fail(function() {
        console.log('Channels failed');
    })
    .always(function() {
        console.log('Channels done');
    });
}
// Gets the name of the channel corresponding to the channel ID choosed by the user. 
function getChannelName(channelID){
     var channelsInfo =$.ajax({
        url: 'channels.json',
        dataType: 'json',
        cache: false
    })
    .done(function(){
        var channelData = JSON.parse(channelsInfo.responseText);
        var channelName = channelData[channelID]
        radio(channelName.responseText, channelID)
    })
}
// When changing the radiochannel updates the website with the correct information
function radio(channel, channelID) {
    console.log('Running radio on: ' + channel + ", " + channelID);
    setCookie('channelID', channelID);
    updateSongInfo();
    //$('.music_b').html('Spelas just nu på ' + channel + ':');
}
// Gets the currently playing song from the radio and presents it in the browser
function updateSongInfo() {
    var nowPlaying = 'Just nu spelas ingen musik.';
    var data = {};
    data.channelID = getCookie('channelID');
    // Request is sent to fetch currently playing song
    $.ajax({
        type: "POST",
        url: "http://localhost:5000/SR/currentlyPlaying",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            "channelID": data.channelID
        }), 
        //async:false,
        dataType: "json",
        success:function (successResponse,textStatus,jqXHR) {
             // If there is a song currently playing, save the ID to cookie and present the song info to the browser
             if(successResponse['playingSongName'] != null) {
                var songName = successResponse['playingSongName'];
                var artistName = successResponse['playingSongArtist'];
                var startTime = new Date(successResponse['nextSongStartTime']);
                var startTime = startTime.getMilliseconds() - new Date().getMilliseconds;
                nowPlaying = songName + ' - ' + artistName;
                console.log("Currently playing song:" + nowPlaying)
                savetrackID(songName, artistName);
                saveArtistID(artistName)
            }
            $('.music_b').html(nowPlaying);
            getRecommendation();
            getAlbums();      
        },
        error: function (errorResponse1) {
            $('.music_b').html('Just nu spelas ingenting.');
            setCookie('trackID', -1);
           
            $('#recomm-container').html('Just nu spelas ingen musik.');
            $('#album-container').html('Just nu spelas ingen musik.')
             console.log("Track id when dont exist:" + getCookie("trackID"))
             console.log("Currently: " + errorResponse1.status)
        }
    }); 
}


//This function will fetsh all users playlists from spotify.
function getPlaylists(data){
    $.ajax({
        type: "POST",
        url: "http://localhost:5000/spotify/playlists/fetch",
        contentType: "application/json",
        data: JSON.stringify({
            "auth": data
        }), 
        dataType: "json",
        success:function (successResponse,textStatus,jqXHR) {
            for(var key in successResponse.items) {
                console.log('Adding playlists from spotify(Fetch works)');
                var playListName = successResponse.items[key].name
                //console.log( 'Playlist Name: ' + playListName);
                var playListID = String(successResponse.items[key].id);
                //console.log( 'Playlist ID: ' + playListID);
                btn = $('<div />', {
                    class: "spellista",
                    text : playListName,
                    type  : 'div',
                    value : playListID,
                    on    : {
                        click: function() {
                            if(getCookie('trackID') == -1){     
                            alertMessage_NoSongPlaying();
                            return;
                           }
                           else{
                           addToPlaylist(getCookie('trackID'), this.getAttribute('value')); 
                           }
                        }
                    }
                });
                $('.playlist_c').append(btn);
            }
            return successResponse;
        },
        error: function (errorResponse1) {
            console.log("Fetch: " + errorResponse1.status);
        }
    });
}
// Adds the given song to the given playlist on Spotify
function addToPlaylist(trackID, playlistID) {
    $.ajax( {
        url: 'http://localhost:5000/spotify/playlists/add',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "auth": getCookie('accessToken'),
            "playlist_Id": playlistID,
            "track_Id": trackID
        }), 
        dataType: "json",
        success: alertMessage_songAdded()   
        ,
        error: function (errorResponse1) {
            console.log("Fetch: " + errorResponse1.status);
            return null;
        }
    });
}


// Saves the currently playing songs Spotify ID to a cookie
function savetrackID(songName , artistName) {
    //var q = songName + " " + artistName
    $.ajax({
        url: 'http://localhost:5000/spotify/search',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "auth": getCookie('accessToken'),
            "type": "track",
            "query": songName
        }),
        dataType: "json",
        async:false,
        success: function(result){

            if(result.tracks.items.length == 0 || !result.tracks.items[0].id){
               setCookie("trackID", getCookie("trackID2"))
            }
            else{
                var trackID = result.tracks.items[0].id;
                setCookie('trackID', trackID);
                setCookie('trackID2', trackID)
            }
           console.log("Hämtar:Track id::-->" + getCookie("trackID") + " För låten:" + songName) 
        },
        error: function (errorResponse1) {
            console.log('Search: ' + errorResponse1);
        }
    });	
}
// Request is sent to fetch recommendations based on the currently playing song
function getRecommendation(){
    console.log("Getting recomendation for song with id: " + getCookie("trackID"))
    if(getCookie('trackID') != -1) {
        $.ajax({
            url: 'http://localhost:5000/spotify/recommendation',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                'auth': getCookie('accessToken'),
                'trackID': getCookie('trackID')
            }),
            dataType: 'json',
            success: function(result){
                var recommendedName = result['trackName'];
                var recommendedArtist = result['artistName'];
                console.log("Recommendation works");
                $('#recomm-container').html(recommendedName + ' - ' + recommendedArtist);
            },
            error:function(request, status, error){
                console.log("Recommendation: " + status);
            }
        });
    }
    else{
        $('#recomm-container').html('Just nu spelas ingen musik.');
    }
}

 //Saves the currently playing songs artist ID to a cookie
 function saveArtistID(artistName){
    $.ajax({
        url: 'http://localhost:5000/spotify/search',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            'auth': getCookie('accessToken'),
            'type': 'artist',
            'query': artistName
        }),
        async:false,
        success: function(result) {
            var  artistNameToSplit = artistName.split(/[&,(:]+/);
            var  artistNametoSearch = artistNameToSplit[0];
            if(artistNameToSplit.length > 1){
                if(artistNametoSearch.charAt(artistNametoSearch.length - 1) == " "){
                    artistNametoSearch = artistNametoSearch.substring(0, artistNametoSearch.length -1)
                }
                console.log("Artist name After split: " + artistNametoSearch)
            }
            var artistId = 0;
                console.log("NAME::UTAN SPLIT::" + artistNametoSearch)
                for (const key in result.artists.items) {
                      if(result.artists.items[key].name.toUpperCase() == artistNametoSearch.toUpperCase()){
                        var artistId = result.artists.items[key].id;
                        setCookie("userID2",artistId)
                        break;
                    }
                    else{
                        if(!result.artists.items[0]){
                            artistId = result.artists.items[0].id
                        }
                        else{
                            artistId = getCookie("userID2")
                        }
                    }
                }   
                setCookie('artistId', artistId);
                console.log("Hämtar:Artist id::-->" + getCookie("artistId"))   
        },
        error: function(request, status, error) {
            console.log('Search: ' + status);
        }
    })
}
// Gets all the albums of the given artist id and creates a button for each album
function getAlbums(){
    var id = getCookie('artistId')
    console.log("Getting artist album with artist id: " + id)
    if(getCookie("artistId")){
    $.ajax({
        type:"POST",
        url: 'http://localhost:5000/spotify/artistAlbums',
        data: JSON.stringify({
            'auth': getCookie('accessToken'),
            'artistId' : getCookie('artistId')
        }),
        async:false,
        contentType: 'application/json',
        success: function(result) {
            console.log("Get artistAlbums works");
            $('#album-container').empty();
            for(var key in result.items) {
                var albumID = String(result.items[key].id);
                var AlbumName = result.items[key].name
                //console.log( 'Album Name: ' + AlbumName);
                btn = $('<div />', {
                    class: "albums",
                    text : AlbumName,
                    type  : 'div',
                    value : albumID
                });
                $('#album-container').append(btn);
            }
        },
        error: function(request, status, error){
            console.log("Fetch: " + status);
            return null;
        }
    });
    }else{
        $('#album-container').html('Just nu spelas ingen musik.');
    }
}






/*
 * Spotify auth section
 * 
 */

 // Gets requried code for auth process when user click the login button.
function requestAuthentication(){
    // your application requests authorization
    var scope = 'user-library-modify user-library-read user-read-private user-read-email user-follow-modify user-follow-read playlist-modify-public playlist-read-collaborative playlist-read-private playlist-modify-private';
     
    // AUTHORIZE with Spotify (if needed)
     let url = new URL('https://accounts.spotify.com/authorize?');
     let params = new URLSearchParams('client_id=' +client_id+'&response_type=code&scope='+scope+'&redirect_uri='+encodeURI(redirect_uri)+'&show_dialog='+true+'');
     window.location.replace(url + params.toString())
}

//This function will get the auth code from the url.
function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
        setCookie("code", code)
    }
    return code;
}

//This function will send the body and the code for fetching the access token.
function fetchAccessToken(code){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

//This function will obatain a new accesstoken with help of the refreshtoken.
    function refreshAccessToken(){
        refresh_token = getCookie("refreshToken")
        let body = "grant_type=refresh_token";
        body += "&refresh_token=" + refresh_token;
        body += "&client_id=" + client_id;
        callAuthorizationApi(body);
        console.log("Refreshing token....")
    }

   //This will run refreshAuthToken() function for obataing a new access token automaticly after 3600 sekunder = 3 600 000 ms - 600 000 ms  alltså = 60 min - 10 min  --> 50 minut 
   setInterval(function() {
       
    if(refresh_token != 0){
        refreshAccessToken();
    }
    else{
      console.log("There is no Token, please log in first!")
    } 
}, tokenValidTime- 600000);

//This function will make a request to spotify for fetching the access and refresh tokens.
function callAuthorizationApi(body){
   let xhr = new XMLHttpRequest();
   xhr.open("POST", "https://accounts.spotify.com/api/token", true)
   xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
   xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
   xhr.send(body);
   xhr.onload = handleAuthorizationResponse;
 }

 function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        //console.log(data); // This will write access and refreshtoken into the terminal.
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            setCookie('accessToken', access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            setCookie('refreshToken', refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText); 
    }
}
//This function will run on page loading.
function onPageLoad(){
    if(window.location.search.length > 0){
        handlRedirect()
    }
    else
    {
        if( access_token == 0 || getCookie("accessToken") == null){
            //We dont have a token --> login
            var url = " http://127.0.0.1:5500/login.html"
           
            window.location.replace(url)
        }
        // DO stuff.
        getPlaylists(access_token)
    }
}

function handlRedirect(){
    let code = getCode()
    fetchAccessToken(code)
    window.history.pushState("", "", redirect_uri); // remove param from url
}

function logOut(){
    setCookie("accessToken", -1)
    window.location.replace("http://127.0.0.1:5500/login.html")
}



