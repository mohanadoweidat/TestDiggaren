// Adds buttons for each radio channel to a dropdown menu
function addChannelButtons() {
    // Requests a list of channels from the backend
    var getChannels = $.get('/channels', function() {
            console.log('Channels fetched');
        })
            .done(function() {
                var channels = JSON.parse(getChannels.responseText);
                // Adds a button for each channel in the JSON object
                for(var channel in channels) {
                    if(channels.hasOwnProperty(channel)) {
                        let button = $('<div />', {
                            class: "channels",
                            text: channels[channel],
                            value: channel,
                            on: {
                                click: function() {
                                    //radio(this.textContent, this.getAttribute('value'));
                                    alert(this.getAttribute('value'))
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



// Gets the name of the channel corresponding the the channel ID from the backend
function getChannelName(channelID) {
    var channelName = $.get('/channelName?channelID=' + channelID, function() {
        console.log("Getting channel name som har id:" + channelID);
    })
        .done(function() {
           // radio(channelName.responseText, channelID);
        })

        
}


// When page is loaded, adds various buttons
$(document).ready(function(){
    addChannelButtons();
});