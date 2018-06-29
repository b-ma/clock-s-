import 'source-map-support/register'; // enable sourcemaps in node
import path from 'path';
import { server, ControllerExperience } from 'soundworks/server';
import BeatsExperience from './BeatsExperience';

// init configuration
const configName = process.env.ENV || 'default';
const configPath = path.join(__dirname, 'config', configName);
let config = null;

// rely on node `require` for synchronicity
try {
  config = require(configPath).default;
} catch(err) {
  console.error(`Invalid ENV "${configName}", file "${configPath}.js" not found`);
  process.exit(1);
}

// configure express environment ('production' enables `express` cache systems)
process.env.NODE_ENV = config.env;
// initialize application with configuration options
server.init(config);

const clientConfig = {
  env: config.env,
  websockets: config.websockets,
  appName: config.appName,
  version: config.version,
  defaultType: config.defaultClient,
  assetsDomain: config.assetsDomain,
};

// define the configuration object to be passed to the `.ejs` template
server.setClientConfigDefinition((clientType, config, httpRequest) => {
  clientConfig.clientType = clientType;
  return clientConfig;
});

server.router.get('/config', (req, res) => {
  clientConfig.clientType = 'thing';
  clientConfig.websockets.url = 'http://127.0.0.1:8000';
  console.log('[thing connected]');
  res.json(clientConfig);
});

const sharedParams = server.require('shared-params');
sharedParams.addEnum('start-stop', 'start/stop', ['start', 'stop'], 'stop');
sharedParams.addNumber('gain', 'gain', 0, 1, 0.01, 1);

const beatsExperience = new BeatsExperience(['player', 'thing']);
const controllerExperience = new ControllerExperience('controller');

server.start();
