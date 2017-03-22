// /* global AFRAME, assert, process, suite, teardown, test, setup, sinon, HTMLElement */
// var buildData = require('core/component').buildData;
// var Component = require('core/component');
// var components = require('index').components;
// var helpers = require('../helpers');
// var registerComponent = require('index').registerComponent;
// var processSchema = require('core/schema').process;

// var isValidDefaultCoordinate = require('../src/utils/validate').isValidDefaultCoordinate;
// var isValidDefaultValue = require('../src/utils/validate').isValidDefaultValue;
// suite('isValidDefaultValue', function () {
//   test.only('vec2 and vec3 default string values are converted to coordinate objects', function (done) {
//     var schemaVec2 = processSchema({
//       v: {type: 'vec2', default: '1 1'}
//     });
//     var schemaVec3 = processSchema({
//       v: {type: 'vec3', default: '2 2 2'}
//     });
//     var el = document.createElement('a-entity');
//     var dataVec2 = buildData(el, 'dummy', 'dummy', schemaVec2, {}, null);
//     var dataVec3 = buildData(el, 'dummy', 'dummy', schemaVec3, {}, null);
//     assert.equal(dataVec2.v.x, 1);
//     assert.equal(dataVec2.v.y, 1);
//     assert.equal(dataVec3.v.x, 2);
//     assert.equal(dataVec3.v.y, 2);
//     assert.equal(dataVec3.v.z, 2);
//     done();
//   });
// });
