const fs = require('fs');

async function test() {
  try {
    const wavBuffer = fs.readFileSync('test.wav');
    const response = await fetch('https://stt.vocabdotai.com/v1/transcribe?language=hinglish', { 
        method: 'POST', 
        headers: { 
            'Authorization': 'Token stt_PKUmPpAE3evEm-ndoV3Jq0ju5rxeMTpbWlA-h8jqwse', 
            'Content-Type': 'audio/wav' 
        }, 
        body: new Blob([new Uint8Array(wavBuffer)], {type: 'audio/wav'})
    });
    const data = await response.json();
    console.log('API_RESPONSE:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
}
test();
