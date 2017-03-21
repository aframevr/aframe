// /**
//  * Checks if is valid default coordinates
//  * @param unknown
//  * @param {number} schema - Component schema
//  * @returns {boolean} A boolean determining if coordinates are parsed correctly.
//  */
function isValidDefaultCoordinate (possibleCoordinates, dimensions) {
  if (typeof possibleCoordinates !== 'object' || possibleCoordinates === null) {
    return false;
  } else {
    if (dimensions === 2) {
      if (Object.keys(possibleCoordinates).length !== 2) {
        return false;
      }
      if (possibleCoordinates.x && possibleCoordinates.y) {
        if (typeof possibleCoordinates.x === 'number' && typeof possibleCoordinates.y === 'number') {
          return true;
        }
      }
    } else if (dimensions === 3) {
      if (Object.keys(possibleCoordinates).length !== 3) {
        return false;
      }
      if (possibleCoordinates.x && possibleCoordinates.y && possibleCoordinates.z) {
        if (typeof possibleCoordinates.x === 'number' && typeof possibleCoordinates.y === 'number' && typeof possibleCoordinates.z === 'number') {
          return true;
        }
      }
    }
  }

  return false;
}

module.exports.isValidDefaultCoordinate = isValidDefaultCoordinate;

// /**
//  * Validates the schema passed in if type is specified
//  * @param {object} schema - Component schema
//  * @returns {boolean} A boolean determining if schema is valid.
//  */
function isValidSchema (schema) {
  var validTypes = {
    string: true,
    boolean: true,
    number: true,
    array: true,
    vec2: true,
    vec3: true
  };

  var properties = Object.keys(schema);

  for (var i = 0; i < properties.length; i++) {
    var type = schema[properties[i]].type;
    var defaultVal = schema[properties[i]].default;

    if (type) {
      if (validTypes[type] && defaultVal) {
        if (type === 'vec2') {
          return isValidDefaultCoordinate(defaultVal, 2);
        } else if (type === 'vec3') {
          return isValidDefaultCoordinate(defaultVal, 3);
        } else if (type === 'array' && !Array.isArray(defaultVal)) {
          return false;
        } else if (type !== typeof defaultVal) {
          return false;
        }
      }
    }
  }

  return true;
}

module.exports.isValidSchema = isValidSchema;

// console.log(isValidSchema({
//   v: {
//     type: 'vec2',
//     default: '5'
//   }
// }), false)

// console.log(isValidSchema({
//   v: {
//     type: 'vec2',
//     default: {
//       x: 1,
//       y: 1
//     }
//   }
// }), true)

// console.log(isValidSchema({
//   v: {
//     type: 'vec2',
//     default: {
//       x: 1,
//       y: 1,
//       z: 1
//     }
//   }
// }), false)

// console.log(isValidSchema({
//   v: {
//     type: 'vec3',
//     default: {
//       x: 1,
//       y: 1,
//       z: 1
//     }
//   }
// }), true)

// console.log(isValidSchema({
//   v: {
//     type: 'vec3',
//     default: {
//       x: 1,
//       y: 1,
//       z: '1'
//     }
//   }
// }), false)
