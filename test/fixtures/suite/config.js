// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

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
