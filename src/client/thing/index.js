import 'source-map-support/register';
import http from 'http';
import * as soundworks from 'soundworks-thing';
import BeatsExperience from './BeatsExperience';
import pd from 'node-libpd';

const SERVER_IP = process.env.SERVER_IP || 'http://127.0.0.1:8000';

console.log('------------------------------------------------');
console.log('> connecting to server:', SERVER_IP);
console.log('------------------------------------------------');

const initialized = pd.init({
  numInputChannels: 0,
  numOutputChannels: 1,
  sampleRate: 48000,
  ticks: 1,
});

console.log('[pd initialized]');

http.get(`${SERVER_IP}/config`, res => {
  let data = '';

  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const config = JSON.parse(data);
    config.websockets.url = SERVER_IP;

    soundworks.client.init(config.clientType, config);

    const experience = new BeatsExperience(pd);
    soundworks.client.start();
  });
}).on("error", (err) => console.log("Error: " + err.message));
