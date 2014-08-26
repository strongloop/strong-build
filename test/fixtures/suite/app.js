/**
 * App Dependencies.
 */

var loopback = require('loopback')
  , app = module.exports = loopback()
  , fs = require('fs')
  , path = require('path')
  , cors = require('cors')
  , request = require('request')
  , TaskEmitter = require('strong-task-emitter');

// Require models, make sure it happens before api explorer
fs
  .readdirSync(path.join(__dirname, './models'))
  .filter(function(m) {
    return path.extname(m) === '.js';
  })
  .forEach(function(m) {
    // expose model over rest
    app.model(require('./models/' + m));
  });

// Setup LoopBack access-control
var db = require('./data-sources/db');
loopback.AccessToken.attachTo(db);
loopback.Role.attachTo(db);
loopback.ACL.attachTo(db);
loopback.RoleMapping.attachTo(db);
app.dataSources.db = db;

app.enableAuth();

// Set up the HTTP listener ip & port
var ip = process.env.IP || '0.0.0.0';
var port = process.env.PORT || 3000;
var baseURL = 'http://' + (ip === '0.0.0.0' ? 'localhost' : ip) + ':' + port;
app.set('ip', ip);
app.set('port', port);

app.use(loopback.favicon());
// app.use(loopback.logger(app.get('env') === 'development' ? 'dev' : 'default'));
app.use(loopback.bodyParser());
app.use(loopback.methodOverride());

// Establish our overly-permissive CORS rules.
app.use(cors());

app.use(loopback.token());

var apiPath = '/api';

// Expose a rest api
app.use(apiPath, loopback.rest());

// API explorer (if present)
var explorerPath = '/explorer';
try {
  var explorer = require('loopback-explorer');
  app.use(explorerPath, explorer(app, { basePath: apiPath }));
} catch(e){
  // ignore errors, explorer stays disabled
}


// Let express routes handle requests that were not handled
// by any of the middleware registered above.
// This way LoopBack REST and API Explorer take precedence over
// express routes.
app.use(app.router);

// The static file server should come after all other routes
// Every request that goes through the static middleware hits
// the file system to check if a file exists.
app.use(loopback.static(path.join(__dirname, 'public')));

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

app.start = function() {
  // Start the server
  return app.listen(port, ip, function() {
    if(process.env.C9_PROJECT) {
      // Customize the url for the Cloud9 environment
      baseURL = 'https://' + process.env.C9_PROJECT + '-c9-' + process.env.C9_USER + '.c9.io';
    }
    console.error('LoopBack sample is now ready at ' + baseURL);
  });
};

// Optionally start the server
// (only if this module is the main module)
if(require.main === module) {
  app.start();
}

