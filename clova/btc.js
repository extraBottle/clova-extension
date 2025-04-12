const axios = require('axios');
require('dotenv').config();

const btcVol = async(req, res) => {
    // authorize tradingview only
    const url = 'https://apis.naver.com/clovahome/clova-platform/sendNotification'
    if(req.body.text == process.env.BTC_MSG){
        try {
            const header = {
                headers: {
                    'X-Clova-Extension-Id': process.env.CLOVA_ID,
                    'X-Clova-Extension-Secret': process.env.CLOVA_SECRET,
                }
            }
            const body = {
                'applianceId': 'device-001',
                'messageId': 'test-msg-19338d0b05234b33a6410727dff25b44'
            }
            const response = await axios.post(url, body, header);
            console.log('push success! =', response.data);
            res.sendStatus(200);
        }
        catch(e) {
            console.log('err: ', e.message);
            res.sendStatus(200);
        }
    }
    else{
        res.status(200).send({ msg: "unAuthorized"});
    }
}

module.exports = btcVol;
