const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const stream = require('stream');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function convert(mp3Buffer) {
  return new Promise((resolve, reject) => {
    const inputStream = new stream.Readable();
    inputStream.push(mp3Buffer);
    inputStream.push(null);
    const bufs = [];
    const outputStream = new stream.PassThrough();
    outputStream.on('data', c => bufs.push(c));
    outputStream.on('end', () => resolve(Buffer.concat(bufs)));
    outputStream.on('error', reject);
    ffmpeg(inputStream)
      .inputFormat('mp3')
      .outputFormat('wav')
      .audioChannels(1)
      .audioFrequency(16000)
      .duration(2) // only process 2 seconds
      .on('error', err => reject(err))
      .pipe(outputStream);
  });
}

async function run() {
  try {
    const file = fs.readFileSync('public/media/audio/006_lifeWave2k_pial5o.mp3');
    const wav = await convert(file);
    const response = await fetch('https://stt.vocabdotai.com/v1/transcribe?language=en-IN', { 
          method: 'POST', 
          headers: { 
              'Authorization': 'Token stt_PKUmPpAE3evEm-ndoV3Jq0ju5rxeMTpbWlA-h8jqwse', 
              'Content-Type': 'audio/wav' 
          }, 
          body: new Blob([new Uint8Array(wav)], {type: 'audio/wav'})
    });
    const data = await response.json();
    console.log('JSON_RESPONSE_TRUE:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
