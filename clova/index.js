// Import the `uuid` library to generate unique message IDs.
const uuid = require('uuid').v4
 // Import Lodash for utility functions like object merging.
const _ = require('lodash')


class CEKRequest {
  constructor (httpReq) {    
    this.header = httpReq.body.header
    this.payload = httpReq.body.payload
    console.log(`CEK Request: ${JSON.stringify(this.header)}, ${JSON.stringify(this.payload)}`)
  }
  // 메시지지에 따라서 어떤 함수를 실행할지 결정하는 method
  do(cekResponse) {    
    switch (this.header.name){
      // 전체 기기 목록 불러오기기
      case 'DiscoverAppliancesRequest':
        return this.discoverAppliancesResponse(cekResponse)
    }
  }
  
  discoverAppliancesResponse(cekResponse) {
    console.log('discoverAppliancesRequest')
    cekResponse.header.messageId = uuid();
    cekResponse.header.name = 'DiscoverAppliancesResponse';
    // LG thinQ에서 전체 기기 목록 불러와서 loop 돌면서 아래에 넣으면 됨
    cekResponse.payload.customCommands = [];
    cekResponse.payload.discoveredAppliances = [];

    //   let messageId = req.body.header.messageId;
    //   let resultObject = new Object();
    //   resultObject.header = new Object();
    //   resultObject.header.messageId = messageId;
    //   resultObject.header.name = "DiscoverAppliancesResponse ";
    //   resultObject.header.namespace = "ClovaHome";
    //   resultObject.header.payloadVersion = "1.0";
    //   resultObject.payload = new Object();
    //   resultObject.payload.discoveredAppliances = new Array();
    
    //     let laundary = new Object();
    //   laundary.applianceId = "device-001";
    //   laundary.manufacturerName = "manu전등";
    //   laundary.modelName = "light-123";
    //   laundary.friendlyName = "전등";
    //   laundary.version = "9.5.0"
    //   laundary.isIr = false;
    //   laundary.actions = ["TurnOn", "TurnOff"];
    //   laundary.applianceTypes = ["LIGHT"];
    //   resultObject.payload.discoveredAppliances.push(laundary);
    
    //   res.send(resultObject);
  }
}

class CEKResponse {
  constructor () {
    this.header ={
      "messageId": '',
      "namespace": 'ClovaHome',
      "name": '',
      "payloadVersion": '1.0'
    };
    this.payload= {};
    }
  }

  // 텍스트 읽어주기 
  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
          type: 'PlainText',
          lang: 'ko',
          value: outputText,
      },      
    }
  }
}

// 외부로 내보낼 함수
const clovaReq = function (httpReq, httpRes, next) {
  /* Middleware function that handles incoming HTTP requests from Clova devices */
  const cekResponse = new CEKResponse()
  const cekRequest = new CEKRequest(httpReq)
  cekRequest.do(cekResponse)
  console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
  httpRes.set({ 'Content-Type': 'application/json;charset-UTF-8' })
  return httpRes.status(200).send(cekResponse)
};

module.exports = clovaReq;
