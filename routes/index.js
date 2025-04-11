const express = require('express');
const clova = require('../clova');
const router = express.Router();

router.post('/', (req, res) => {
    const cmd = req.body.header.name;
    switch(cmd){
        case 'DiscoverAppliancesRequest':
            DiscoverAppliancesRequest(req, res);
            break;
        default:
            res.sendStatus(403);
            break;
    }
})
// router.post(`/clova`, clova);
router.get('/login', function (req, res) {
	console.log(req.query);
	let url = decodeURIComponent(req.query.redirect_uri)+"?state="+req.query.state+"&code="+"FakeToken"+"&token_type=Bearer";
	res.redirect(url);
});
router.post('/token',function(req,res){
    res.send(`
  {
	"access_token":"testToken",
	"refresh_token":"testRefresh"
  }
  `);
});

function DiscoverAppliancesRequest(req, res) {
	let messageId = req.body.header.messageId;
	let resultObject = new Object();
	resultObject.header = new Object();
	resultObject.header.messageId = messageId;
	resultObject.header.name = "DiscoverAppliancesResponse ";
	resultObject.header.namespace = "ClovaHome";
	resultObject.header.payloadVersion = "1.0";
	resultObject.payload = new Object();
	resultObject.payload.discoveredAppliances = new Array();

    let laundary = new Object();
	laundary.applianceId = "device-001";
	laundary.manufacturerName = "manu전등";
	laundary.modelName = "light-123";
	laundary.friendlyName = "전등";
	laundary.version = "9.5.0"
	laundary.isIr = false;
	laundary.actions = ["TurnOn", "TurnOff"];
	laundary.applianceTypes = ["LIGHT"];
	resultObject.payload.discoveredAppliances.push(laundary);

	res.send(resultObject);
}

module.exports = router;
