// /**
//  * Faster version of Function.prototype.bind
//  * @param {object} schema - Component schema
//  * @returns {boolean} A boolean determining if schema is valid.
//  */
// module.exports = function validateSchema (schema) {
//   var bool = true;
//   var validTypes = { string: true, boolean: true, array: true, vec2: true, vec3: true, number: true };

//   // can have other valid types

//   Object.keys(schema).forEach(function(key) {
//     var type = schema[key].type;
//     var defaultVal = schema[key].default;

//     // if there's no type we don't need to check the default
//     // if (!type) {
//     //   break;
//     // }

//     if (!validTypes[type]) {
//       bool = false;
//       break;
//     } else if (defaultVal && typeof defaultVal !== type) {
//       // defaultVal is the same ds as type

//       bool = false;
//       break;
//     }
//   });

//   return bool;
// };
