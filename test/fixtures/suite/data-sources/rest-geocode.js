// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var loopback = require('loopback');

module.exports = loopback.createDataSource({
    connector: require('loopback-connector-rest'),
    debug: false,
    operations: [
        {
            template: {
                'method': 'GET',
                'url': 'http://maps.googleapis.com/maps/api/geocode/{format=json}',
                'headers': {
                    'accepts': 'application/json',
                    'content-type': 'application/json'
                },
                'query': {
                    'address': '{street},{city},{zipcode}',
                    'sensor': '{sensor=false}'
                },
                'responsePath': '$.results[0].geometry.location'
            },
            functions: {
               'geocode': ['street', 'city', 'zipcode']
            }
        }
    ]});


