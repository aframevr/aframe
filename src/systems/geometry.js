import { geometries } from '../core/geometry.js';
import { registerSystem } from '../core/system.js';

/**
 * System for geometry component.
 * Handle geometry caching.
 *
 * @member {object} cache - Mapping of stringified component data to THREE.BufferGeometry objects.
 * @member {object} cacheCount - Keep track of number of entities using a geometry to
 *         know whether to dispose on removal.
 */
export var System = registerSystem('geometry', {
  init: function () {
    this.cache = {};
    this.cacheCount = {};
  },

  /**
   * Reset cache. Mainly for testing.
   */
  clearCache: function () {
    this.cache = {};
    this.cacheCount = {};
  },

  /**
   * Attempt to retrieve from cache.
   *
   * @returns {object|null} A geometry if it exists, else null.
   */
  getOrCreateGeometry: function (data) {
    var cache = this.cache;
    var cachedGeometry;
    var hash;

    // Skip all caching logic.
    if (data.skipCache) { return createGeometry(data); }

    // Try to retrieve from cache first.
    hash = this.hash(data);
    cachedGeometry = cache[hash];
    incrementCacheCount(this.cacheCount, hash);

    if (cachedGeometry) { return cachedGeometry; }

    // Create geometry.
    cachedGeometry = createGeometry(data);

    // Cache and return geometry.
    cache[hash] = cachedGeometry;
    return cachedGeometry;
  },

  /**
   * Let system know that an entity is no longer using a geometry.
   */
  unuseGeometry: function (data) {
    var cache = this.cache;
    var cacheCount = this.cacheCount;
    var geometry;
    var hash;

    if (data.skipCache) { return; }

    hash = this.hash(data);

    if (!cache[hash]) { return; }

    decrementCacheCount(cacheCount, hash);

    // Another entity is still using this geometry. No need to do anything.
    if (cacheCount[hash] > 0) { return; }

    // No more entities are using this geometry. Dispose.
    geometry = cache[hash];
    geometry.dispose();
    delete cache[hash];
    delete cacheCount[hash];
  },

  /**
   * Use JSON.stringify to turn component data into hash.
   * Should be deterministic within a single browser engine.
   * If not, then look into json-stable-stringify.
   */
  hash: function (data) {
    return JSON.stringify(data);
  }
});

/**
 * Create geometry using component data.
 *
 * @param {object} data - Component data.
 * @returns {object} Geometry.
 */
function createGeometry (data) {
  var geometryType = data.primitive;
  var GeometryClass = geometries[geometryType] && geometries[geometryType].Geometry;
  var geometryInstance = new GeometryClass();

  if (!GeometryClass) { throw new Error('Unknown geometry `' + geometryType + '`'); }

  geometryInstance.init(data);
  return geometryInstance.geometry;
}

/**
 * Decrease count of entity using a geometry.
 */
function decrementCacheCount (cacheCount, hash) {
  cacheCount[hash]--;
}

/**
 * Increase count of entity using a geometry.
 */
function incrementCacheCount (cacheCount, hash) {
  cacheCount[hash] = cacheCount[hash] === undefined ? 1 : cacheCount[hash] + 1;
}
