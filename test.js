var parser = require('./parser'); 
var assert = require('assert');

var address = {
    '1 Darling Island Road, Pyrmont NSW 2009':{
        streetNumber: '1',
        streetName: 'Darling Island',
        streetType: 'Road',
        suburb: 'Pyrmont',
        state: 'NSW',
        postcode: '2009'
    }
}

let tests = Object.keys(address).reduce((promiseChain, k) => {
    return promiseChain.then(() => new Promise((resolve) => {
        var parsed = parser.parseLocation(k);
        assert.deepEqual(address[k], parsed);
        resolve();
    }));
}, Promise.resolve());

tests.then(() => console.log('All passed.'))