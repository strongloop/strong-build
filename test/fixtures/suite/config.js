/**
 * We leave `rc` responsible for loading and merging the various configuration
 * sources.
 */
var nodeEnv = process.env.NODE_ENV || 'demo';
var config = require('rc')('loopback', {
  name: 'loopback-sample-app',
  env: nodeEnv
});

if (!config[nodeEnv]) {
  config[nodeEnv] = nodeEnv == 'test' ? config.demo : {};
}

module.exports = config;
