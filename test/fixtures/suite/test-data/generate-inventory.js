/*
 * This short script is only for generating data in a JSON file.
 *
 * Usage:
 *    node app.js # in the app dir
 *    node generate-inventory.js # in this dir
 */

var fs = require('fs');
var inventory = [];
var request = require('request');

request('http://localhost:3000/cars', {json: true}, function(err, res, cars) {
  request('http://localhost:3000/locations', {json: true}, function(err, res, locations) {
    locations.forEach(function(loc) {
      cars.forEach(function(car) {
        var availableAtLocation = rand(0, 100);

        inventory.push({
          productId: car.id,
          locationId: loc.id,
          available: rand(0, availableAtLocation),
          total: availableAtLocation
        });

      });
    });

    fs.writeFileSync('inventory.json', JSON.stringify(inventory, null, 2));
  });
});

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
