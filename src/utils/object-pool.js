/*
  Adapted deePool by Kyle Simpson.
  MIT License: http://getify.mit-license.org
*/
var EMPTY_SLOT = Object.freeze(Object.create(null));

// Default object factory.
function defaultObjectFactory () { return {}; }

/**
 * Create a new pool.
 */
export function createPool (objectFactory) {
  var objPool = [];
  var nextFreeSlot = null;  // Pool location to look for a free object to use.

  objectFactory = objectFactory || defaultObjectFactory;

  function use () {
    var objToUse;
    if (nextFreeSlot === null || nextFreeSlot === objPool.length) {
      grow(objPool.length || 5);
    }
    objToUse = objPool[nextFreeSlot];
    objPool[nextFreeSlot++] = EMPTY_SLOT;
    clearObject(objToUse);
    return objToUse;
  }

  function recycle (obj) {
    if (!(obj instanceof Object)) { return; }
    if (nextFreeSlot === null || nextFreeSlot === -1) {
      objPool[objPool.length] = obj;
      return;
    }
    objPool[--nextFreeSlot] = obj;
  }

  function grow (count) {
    var currentLength;
    var i;

    count = count === undefined ? objPool.length : count;
    if (count > 0 && nextFreeSlot == null) {
      nextFreeSlot = 0;
    }

    if (count > 0) {
      currentLength = objPool.length;
      objPool.length += Number(count);
      for (i = currentLength; i < objPool.length; i++) {
        // Add new obj to pool.
        objPool[i] = objectFactory();
      }
    }

    return objPool.length;
  }

  function size () {
    return objPool.length;
  }

  return {
    grow: grow,
    pool: objPool,
    recycle: recycle,
    size: size,
    use: use
  };
}

export function clearObject (obj) {
  var key;
  if (!obj || obj.constructor !== Object) { return; }
  for (key in obj) { obj[key] = undefined; }
}

export function removeUnusedKeys (obj, schema) {
  var key;
  if (!obj || obj.constructor !== Object) { return; }
  for (key in obj) {
    if (!(key in schema)) {
      delete obj[key];
    }
  }
}
