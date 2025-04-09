// Import the `uuid` library to generate unique message IDs.
const uuid = require('uuid').v4
 // Import Lodash for utility functions like object merging.
const _ = require('lodash')
// Import the DOMAIN variable from the configuration file.
const { DOMAIN } = require('../config')

class Directive {
  constructor({namespace, name, payload}) {
     // The Directive class creates a directive object for Clova responses.
    this.header = {
      messageId: uuid(), // Generate a unique ID for the directive.
      namespace: namespace, // Namespace defines the category of the directive.
      name: name, // Name specifies the type of directive.
    }
    this.payload = payload // Payload contains additional data for the directive.
  }
}

function resultText({midText, sum, diceCount}) {
   // This function generates a text response based on the dice results.
  if (diceCount == 1) {
    return `결과는 ${sum}입니다.` // If only one die is rolled, return its value directly.
  } else if (diceCount < 4) {
    return `결과는 ${midText} 이며 합은 ${sum} 입니다.`
  } else {
    return `주사위 ${diceCount}개의 합은 ${sum} 입니다.`
  }
}

function throwDice(diceCount) {
  // This function simulates rolling dice and returns the results.
  const results = [] // Array to store individual dice results.
  let midText = '' // String to hold intermediate text (individual dice values).
  // let resultText = ''
  let sum = 0 // Variable to store the sum of all dice rolls.
  console.log(`throw ${diceCount} times`)
  for (let i = 0; i < diceCount; i++) {
    const rand = Math.floor(Math.random() * 6) + 1
    console.log(`${i + 1} time: ${rand}`)
    results.push(rand)
    sum += rand
    midText += `${rand}, `
  }

  midText = midText.replace(/, $/, '')
  return {midText, sum, diceCount} // Return an object containing all results and metadata.
}

class CEKRequest {
  constructor (httpReq) {
    // The CEKRequest class parses incoming requests from Clova and extracts relevant data.
    this.request = httpReq.body.request // Extract request details (e.g., type, intent).
    this.context = httpReq.body.context // Extract context information (e.g., device info).
    this.session = httpReq.body.session // Extract session information (e.g., attributes).
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  do(cekResponse) {
    // This method determines which handler to call based on the request type.
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse) // Handle skill launch requests.
      case 'IntentRequest':
        return this.intentRequest(cekResponse) // Handle specific intents from users.

      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse) // Handle session termination requests.
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest')
    cekResponse.setSimpleSpeechText('몇개의 주사위를 던질까요?')
    cekResponse.setMultiturn({
      intent: 'ThrowDiceIntent',
      /* Multiturn allows maintaining conversation context. 
         Here, it sets up a follow-up intent for rolling dice. */
    })
  }

  intentRequest(cekResponse) {
    console.log('intentRequest')
    console.dir(this.request)
    const intent = this.request.intent.name // Extract intent name from the request.
    const slots = this.request.intent.slots // Extract slots (parameters provided by users).

    switch (intent) {
    case 'ThrowDiceIntent':
      let diceCount = 1
      if (!!slots) {
        const diceCountSlot = slots.diceCount
        /* Check if slots exist and extract `diceCount` slot value. */
        if (slots.length != 0 && diceCountSlot) {
          diceCount = parseInt(diceCountSlot.value)
        }

        if (isNaN(diceCount)) {
          /* If parsing fails or slot value is invalid, default to rolling one die. */
          diceCount = 1
        }
      }
      cekResponse.appendSpeechText(`주사위를 ${diceCount}개 던집니다.`)
      cekResponse.appendSpeechText({
        lang: 'ko',
        type: 'URL',
        value: `${DOMAIN}/rolling_dice_sound.mp3`,
      })
      /* Append speech output with a URL pointing to a sound effect for rolling dice. */
      const throwResult = throwDice(diceCount)
      cekResponse.appendSpeechText(resultText(throwResult))
      /* Generate and append speech output describing the dice results. */
      break
    case 'Clova.GuideIntent':
    default:
      cekResponse.setSimpleSpeechText("주사위 한 개 던져줘, 라고 시도해보세요.")
      /* Default response for unsupported intents or help requests. */
    }

    if (this.session.new == false) {
      cekResponse.setMultiturn()
       /* If it's not a new session, maintain context for further interactions. */
    }
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.setSimpleSpeechText('주사위 놀이 익스텐션을 종료합니다.')
    cekResponse.clearMultiturn()
     /* Clear multiturn context as the session is ending. */
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
      /* Initialize response structure with empty directives, speech output, etc. */
    }
    this.version = '0.1.0'
     /* Specify version of the extension response format. */
    this.sessionAttributes = {}
     /* Initialize session attributes for maintaining conversation context. */
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
    /* Enable multiturn by keeping session open and storing attributes. */
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
    /* Disable multiturn by closing session and clearing attributes. */
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
          type: 'PlainText',
          lang: 'ko',
          value: outputText,
      },
      /* Set simple speech output in Korean language with plain text format. */
    }
  }

  appendSpeechText(outputText) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
      /* Convert speech output type to a list if not already set. */
    }
    if (typeof(outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      })
      /* Append plain text speech output in Korean language. */
    } else {
      outputSpeech.values.push(outputText)
       /* Append complex speech output objects directly. */
    }
  }
}

const clovaReq = function (httpReq, httpRes, next) {
  /* Middleware function that handles incoming HTTP requests from Clova devices */
  cekResponse = new CEKResponse()
  cekRequest = new CEKRequest(httpReq)
  cekRequest.do(cekResponse)
  console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
  console.log(`httpReq: ${httpReq}`)
  console.log(`httpRes: ${httpRes}`)
  return httpRes.send(cekResponse)
};

module.exports = clovaReq;
