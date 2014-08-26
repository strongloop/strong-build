/**
 * Run `node import.js` to import the test data into the db.
 */

var db = require('../data-sources/db');
var cars = require('./cars.json');
var customers = require('./customers.json');
var inventory = require('./inventory.json');
var locations = require('./locations.json');
// var loopback = require('loopback');
var Inventory = require('../models/inventory');
var Location = require('../models/location');
var Customer = require('../models/customer');
var Car = require('../models/car');

var async = require('async');

var events = require('events');
var emitter = new events.EventEmitter();

module.exports = emitter;

var ids = {
};

function importData(Model, data, cb) {

  // console.log('Importing data for ' + Model.modelName);
  Model.destroyAll(function (err) {
    if(err) {
      cb(err);
      return;
    }
    async.each(data, function (d, callback) {
      if(ids[Model.modelName] === undefined) {
        ids[Model.modelName] = 1;
      }
      d.id = ids[Model.modelName]++;
      Model.create(d, callback);
    }, cb);
  });
}

async.series(
  [
    function (cb) {
      db.autoupdate(cb);
    },

    importData.bind(null, Location, locations),
    importData.bind(null, Car, cars),
    importData.bind(null, Inventory, inventory),
    importData.bind(null, Customer, customers)

    /*
    function (cb) {
      Car.destroyAll(function (err) {
        if(err) {
          cb(err);
          return;
        }
        async.eachSeries(cars, function (car, callback) {
          car.id = ids.car++;
          delete car.dealerId;
          Car.create(car, callback);
        }, cb);
      });
    },
    */], function (err, results) {
    if(err) {
      console.error(err);
      emitter.emit('error', err);
    } else {
      emitter.emit('done');
    }
  });



