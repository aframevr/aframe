// /**
//  * Checks if Valid default coordinates
//  * @param unknown
//  * @param {number} 2 for 2D Vector or 3 for 3D vector
//  * @returns {boolean} A boolean determining if coordinates are parsed correctly.
//  */
function isValidDefaultCoordinate (possibleCoordinates, dimensions) {
  if (typeof possibleCoordinates !== 'object' || possibleCoordinates === null) {
    return false;
  } else if (Object.keys(possibleCoordinates).length !== dimensions) {
    return false;
  } else {
    if (dimensions === 2 && (possibleCoordinates.x === 0 || possibleCoordinates.x) && (possibleCoordinates.y === 0 || possibleCoordinates.y)) {
      if (typeof possibleCoordinates.x === 'number' && typeof possibleCoordinates.y === 'number') {
        return true;
      }
    }
    if (dimensions === 3 && (possibleCoordinates.x === 0 || possibleCoordinates.x) && (possibleCoordinates.y === 0 || possibleCoordinates.y) && (possibleCoordinates.z === 0 || possibleCoordinates.z)) {
      if (typeof possibleCoordinates.x === 'number' && typeof possibleCoordinates.y === 'number' && typeof possibleCoordinates.z === 'number') {
        return true;
      }
    }
    if (dimensions === 4 && (possibleCoordinates.x === 0 || possibleCoordinates.x) && (possibleCoordinates.y === 0 || possibleCoordinates.y) && (possibleCoordinates.z === 0 || possibleCoordinates.z) && (possibleCoordinates.w === 0 || possibleCoordinates.w)) {
      if (typeof possibleCoordinates.x === 'number' && typeof possibleCoordinates.y === 'number' && typeof possibleCoordinates.z === 'number' && typeof possibleCoordinates.w === 'number') {
        return true;
      }
    }
  }

  return false;
}

module.exports.isValidDefaultCoordinate = isValidDefaultCoordinate;

// /**
//  * Validates the default values in a schema
//  * @param {string} type - type in a prop
//  * @param {unknown} defaultVal - default in a prop
//  * @returns {boolean} A boolean determining if defaults are valid.
//  */
function isValidDefaultValue (type, defaultVal) {
  if (type === 'audio' && typeof defaultVal !== 'string') return false;
  if (type === 'array' && !Array.isArray(defaultVal)) return false;
  if (type === 'asset' && typeof defaultVal !== 'string') return false;
  if (type === 'boolean' && typeof defaultVal !== 'boolean') return false;
  if (type === 'color' && typeof defaultVal !== 'string') return false;
  if (type === 'int' && typeof defaultVal !== 'number') return false;
  if (type === 'number' && typeof defaultVal !== 'number') return false;
  if (type === 'map' && typeof defaultVal !== 'string') return false;
  if (type === 'model' && typeof defaultVal !== 'string') return false;
  if (type === 'selector' && typeof defaultVal !== 'string') return false;
  if (type === 'selectorAll' && typeof defaultVal !== 'string') return false;
  if (type === 'src' && typeof defaultVal !== 'string') return false;
  if (type === 'string' && typeof defaultVal !== 'string') return false;
  if (type === 'time' && typeof defaultVal !== 'number') return false;
  if (type === 'vec2') return isValidDefaultCoordinate(defaultVal, 2);
  if (type === 'vec3') return isValidDefaultCoordinate(defaultVal, 3);
  if (type === 'vec4') return isValidDefaultCoordinate(defaultVal, 4);

  return true;
}

module.exports.isValidDefaultValue = isValidDefaultValue;
