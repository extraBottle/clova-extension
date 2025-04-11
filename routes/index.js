const express = require('express');
const clova = require('../clova');
const btc = require('../clova/btc');
const router = express.Router();

require('dotenv').config();

// LG iot 관련 기능
router.post('/',clova);
// 트레이딩뷰 알림
router.post('/vol', btc);
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

module.exports = router;
