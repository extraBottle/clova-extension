// Import the `uuid` library to generate unique message IDs.
const uuid = require('uuid').v4
 // Import Lodash for utility functions like object merging.
const _ = require('lodash')

/*
   ====================== 각종 유틸리티 ===========================
   =============================================================
*/

// The Directive class creates a directive object for Clova responses.
class Directive {
  constructor({namespace, name, payload}) {     
    this.header = {
      messageId: uuid(),    // Generate a unique ID for the directive.
      namespace: namespace, // Namespace defines the category of the directive.
      name: name,           // Name specifies the type of directive.
    }
    this.payload = payload  // Payload contains additional data for the directive.
  }
}

/*
  =================== 응답 처리 알고리즘 =======================
  ==========================================================
*/

// The CEKRequest class parses incoming requests from Clova and extracts relevant data.
class CEKRequest {
  constructor (httpReq) {    
    this.request = httpReq.body.request   // Extract request details (e.g., type, intent).
    this.context = httpReq.body.context   // Extract context information (e.g., device info).
    this.session = httpReq.body.session   // Extract session information (e.g., attributes).
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  // request type에 따라서 어떤 함수를 실행할지 결정하는 method
  do(cekResponse) {          
    return this.volumeAlert(cekResponse)
  }
  
  volumeAlert(cekResponse) {
    console.log('volumeAlert')
    cekResponse.setSimpleSpeechText('비트코인 거래량이 높습니다')
  }
}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
      card: {},      
    }
    this.version = '1.0.0'     
    this.sessionAttributes = {}
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
  return httpRes.send(cekResponse)
};

module.exports = clovaReq;
