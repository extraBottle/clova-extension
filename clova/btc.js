const axios = require('axios');

const btcVol = async(req, res) => {
    // authorize tradingview only
    const ipList = ['52.89.214.238', '34.212.75.30', '54.218.53.128', '52.32.178.7'];
    const url = 'https://apis.naver.com/clovahome/clova-platform/sendNotification'
    if(ipList.includes(req.ip)){
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
        res.status(200).send({ msg: "invalid ip"});
    }
}

module.exports = btcVol;
