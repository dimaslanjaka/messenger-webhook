function callSendAPI(sender_id, response) {
        // Construct the message body
        let request_body = {
            "recipient": {
                "id": sender_id
            },
            "message": response
        }

        // Send the HTTP request to the Messenger Platform
        request({
            "uri": "https://graph.facebook.com/v2.8/me/messages",
            "qs": {
                "access_token": PAGE_ACCESS_TOKEN
            },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (!err) {
                console.log('message sent!')
            } else if (err) {
                console.error("Unable to send message:" + err);
            }
        });
    }