var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var cookieParser = require('cookie-parser');
var httpRequest = require('xmlhttprequest').XMLHttpRequest;
var bodyParser = require('body-parser');
var fs = require('fs');
const {URLSearchParams}  = require('url');
var app = express();
var PORT = 8888;


// Use libraries for CORS, cookies and JSON
app.use(express.static(__dirname, {index: 'login.html'}))
   .use(cors())
   .use(cookieParser())
   .use(bodyParser.json());


app.get('/home', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


 // Returns a JSON object of all the radio channels available
 app.get('/channels', function(req, res) {
    let rawdata = fs.readFileSync('channels.json');
    let json = JSON.parse(rawdata);
    res.send(JSON.stringify(json));
  })


   // Returns the name connected to the given channel ID
app.get('/channelName', function(req, res) {
    let rawdata = fs.readFileSync('channels.json');
    let json = JSON.parse(rawdata);
    let channelID = req.query.channelID;
    res.send(json[channelID]);
  })


app.listen(PORT)