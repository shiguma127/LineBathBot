const express = require('express')
const port = 8800
app = express()
app.use(express.json()) //body-parserを使うため
app.use(express.urlencoded({ extended: true })) //parsing the URL-encoded data
const crypto = require("crypto");
const line = require('@line/bot-sdk');

const property = require("./property.json")
const channelSecret = property.channelSecret
const client = new line.Client({
    channelAccessToken: property.channelAccessToken
});

app.listen(port, () => {
    console.log("Listening on " + port);
})

app.post('/', function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (!signatureValidate(JSON.stringify(req.body), req.headers['x-line-signature'], channelSecret)) {
        return
    }
    const message = req.body.events[0].message
    if (message.type !== 'text') {
        res.sendStatus(200)
        return;
    }
    const quic = {
        "type": "text",
        "text": "クイックリプライのテスト",
        "quickReply": {
            "items": [
                {
                    "type": "action",
                    "action": {
                        "type": "message",
                        "label": "ボタン1",
                        "text": "ボタン1"
                    }
                },
                {
                    "type": "action",
                    //"imageUrl": "https://example.com/tempura.png",
                    "action": {
                        "type": "message",
                        "label": "ボタン2",
                        "text": "ボタン2"
                    }
                }
            ]
        }
    }
    client.replyMessage(req.body.events[0].replyToken, quic)
    res.sendStatus(200)
})


function signatureValidate(bodyString, signature, channelSecret) {
    const calculatedSignature = crypto
        .createHmac('SHA256', channelSecret)
        .update(bodyString).digest('base64');
    console.log(calculatedSignature)
    return calculatedSignature === signature
}