


 // Returns a JSON object of all the radio channels available

 /*
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


app.listen(PORT)*/