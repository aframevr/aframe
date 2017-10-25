/* global MutationObserver */

var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var utils = require('../utils/');

var warn = utils.debug('components:raycaster:warn');

var dummyVec = new THREE.Vector3();

// Defines selectors that should be 'safe' for the MutationObserver used to
// refresh the whitelist. Matches classnames, IDs, and presence of attributes.
// Selectors for the value of an attribute, like [position=0 2 0], cannot be
// reliably detected and are therefore disallowed.
var OBSERVER_SELECTOR_RE = /^[\w\s-.,[\]#]*$/;

// Configuration for the MutationObserver used to refresh the whitelist.
// Listens for addition/removal of elements and attributes within the scene.
var OBSERVER_CONFIG = {
  childList: true,
  attributes: true,
  subtree: true
};

/**
 * Raycaster component.
 *
 * Pass options to three.js Raycaster including which objects to test.
 * Poll for intersections.
 * Emit event on origin entity and on target entity on intersect.
 *
 * @member {array} intersectedEls - List of currently intersected entities.
 * @member {array} objects - Cached list of meshes to intersect.
 * @member {number} prevCheckTime - Previous time intersection was checked. To help interval.
 * @member {object} raycaster - three.js Raycaster.
 */
module.exports.Component = registerComponent('raycaster', {
  schema: {
    autoRefresh: {default: true},
    direction: {type: 'vec3', default: {x: 0, y: 0, z: -1}},
    enabled: {default: true},
    far: {default: 1000},
    interval: {default: 100},
    near: {default: 0},
    objects: {default: ''},
    origin: {type: 'vec3'},
    recursive: {default: true},
    showLine: {default: false},
    useWorldCoordinates: {default: false}
  },

  init: function () {
    // Calculate unit vector for line direction. Can be multiplied via scalar to performantly
    // adjust line length.
    this.clearedIntersectedEls = [];
    this.unitLineEndVec3 = new THREE.Vector3();
    this.intersections = [];
    this.intersectedEls = [];
    this.objects = [];
    this.prevCheckTime = undefined;
    this.prevIntersectedEls = [];
    this.raycaster = new THREE.Raycaster();
    this.updateOriginDirection();
    this.setDirty = this.setDirty.bind(this);
    this.observer = new MutationObserver(this.setDirty);
    this.dirty = true;
    this.intersectedClearedDetail = {el: this.el};
    this.intersectionClearedDetail = {clearedEls: this.clearedIntersectedEls};
    this.intersectionDetail = {els: this.intersectedEls, intersections: this.intersections};
  },

  /**
   * Create or update raycaster object.
   */
  update: function (oldData) {
    var data = this.data;
    var el = this.el;
    var raycaster = this.raycaster;

    // Set raycaster properties.
    raycaster.far = data.far;
    raycaster.near = data.near;

    // Draw line.
    if (data.showLine &&
        (data.far !== oldData.far || data.origin !== oldData.origin ||
         data.direction !== oldData.direction || data.showLine !== oldData.showLine)) {
      this.unitLineEndVec3.copy(data.origin).add(data.direction).normalize();
      this.drawLine();
    }
    if (!data.showLine && oldData.showLine) {
      el.removeAttribute('line');
    }

    if (data.objects !== oldData.objects && !OBSERVER_SELECTOR_RE.test(data.objects)) {
      warn('Selector "' + data.objects + '" may not update automatically with DOM changes.');
    }

    if (data.autoRefresh !== oldData.autoRefresh && el.isPlaying) {
      data.autoRefresh
        ? this.addEventListeners()
        : this.removeEventListeners();
    }

    this.setDirty();
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
  },

  remove: function () {
    if (this.data.showLine) {
      this.el.removeAttribute('line');
    }
  },

  addEventListeners: function () {
    if (!this.data.autoRefresh) { return; }
    this.observer.observe(this.el.sceneEl, OBSERVER_CONFIG);
    this.el.sceneEl.addEventListener('object3dset', this.setDirty);
    this.el.sceneEl.addEventListener('object3dremove', this.setDirty);
  },

  removeEventListeners: function () {
    this.observer.disconnect();
    this.el.sceneEl.removeEventListener('object3dset', this.setDirty);
    this.el.sceneEl.removeEventListener('object3dremove', this.setDirty);
  },

  /**
   * Mark the object list as dirty, to be refreshed before next raycast.
   */
  setDirty: function () {
    this.dirty = true;
  },

  /**
   * Update list of objects to test for intersection.
   */
  refreshObjects: function () {
    var data = this.data;
    // If objects not defined, intersect with everything.
    var els = data.objects
      ? this.el.sceneEl.querySelectorAll(data.objects)
      : this.el.sceneEl.children;
    this.objects = flattenChildrenShallow(els);
    this.dirty = false;
  },

  /**
   * Check for intersections and cleared intersections on an interval.
   */
  tick: function (time) {
    var clearedIntersectedEls = this.clearedIntersectedEls;
    var el = this.el;
    var data = this.data;
    var i;
    var intersectedEls = this.intersectedEls;
    var intersection;
    var intersections = this.intersections;
    var lineLength;
    var prevCheckTime = this.prevCheckTime;
    var prevIntersectedEls = this.prevIntersectedEls;
    var rawIntersections;

    if (!this.data.enabled) { return; }

    // Only check for intersection if interval time has passed.
    if (prevCheckTime && (time - prevCheckTime < data.interval)) { return; }
    // Update check time.
    this.prevCheckTime = time;

    // Refresh the object whitelist if needed.
    if (this.dirty) { this.refreshObjects(); }

    // Store old previously intersected entities.
    copyArray(this.prevIntersectedEls, this.intersectedEls);

    // Raycast.
    this.updateOriginDirection();
    rawIntersections = this.raycaster.intersectObjects(this.objects, data.recursive);

    // Only keep intersections against objects that have a reference to an entity.
    intersections.length = 0;
    for (i = 0; i < rawIntersections.length; i++) {
      intersection = rawIntersections[i];
      // Don't intersect with own line.
      if (data.showLine && intersection.object === el.getObject3D('line')) {
        continue;
      }
      if (intersection.object.el) {
        intersections.push(intersection);
      }
    }

    // Update intersectedEls.
    intersectedEls.length = intersections.length;
    for (i = 0; i < intersections.length; i++) {
      intersectedEls[i] = intersections[i].object.el;
    }

    // Emit intersected on intersected entity per intersected entity.
    for (i = 0; i < intersections.length; i++) {
      intersections[i].object.el.emit('raycaster-intersected', {
        el: el,
        intersection: intersections[i]
      });
    }

    // Emit all intersections at once on raycasting entity.
    if (intersections.length) { el.emit('raycaster-intersection', this.intersectionDetail); }

    // Emit intersection cleared on both entities per formerly intersected entity.
    clearedIntersectedEls.length = 0;
    for (i = 0; i < prevIntersectedEls.length; i++) {
      if (intersectedEls.indexOf(prevIntersectedEls[i]) !== -1) { continue; }
      prevIntersectedEls[i].emit('raycaster-intersected-cleared',
                                 this.intersectedClearedDetail);
      clearedIntersectedEls.push(prevIntersectedEls[i]);
    }
    if (clearedIntersectedEls.length) {
      el.emit('raycaster-intersection-cleared', this.intersectionClearedDetail);
    }

    // Update line length.
    if (data.showLine) {
      if (intersections.length) {
        if (intersections[0].object.el === el && intersections[1]) {
          lineLength = intersections[1].distance;
        } else {
          lineLength = intersections[0].distance;
        }
      }
      this.drawLine(lineLength);
    }
  },

  /**
   * Update origin and direction of raycaster using entity transforms and supplied origin or
   * direction offsets.
   */
  updateOriginDirection: (function () {
    var direction = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var originVec3 = new THREE.Vector3();

    // Closure to make quaternion/vector3 objects private.
    return function updateOriginDirection () {
      var el = this.el;
      var data = this.data;

      if (data.useWorldCoordinates) {
        this.raycaster.set(data.origin, data.direction);
        return;
      }

      // Grab the position and rotation.
      el.object3D.updateMatrixWorld();
      el.object3D.matrixWorld.decompose(originVec3, quaternion, dummyVec);

      // If non-zero origin, translate the origin into world space.
      if (data.origin.x !== 0 || data.origin.y !== 0 || data.origin.z !== 0) {
        originVec3 = el.object3D.localToWorld(originVec3.copy(data.origin));
      }

      // three.js raycaster direction is relative to 0, 0, 0 NOT the origin / offset we
      // provide. Apply the offset to the direction, then rotation from the object,
      // and normalize.
      direction.copy(data.direction).add(data.origin).applyQuaternion(quaternion).normalize();

      // Apply offset and direction, in world coordinates.
      this.raycaster.set(originVec3, direction);
    };
  })(),

  /**
   * Create or update line to give raycaster visual representation.
   * Customize the line through through line component.
   * We draw the line in the raycaster component to customize the line to the
   * raycaster's origin, direction, and far.
   *
   * Unlike the raycaster, we create the line as a child of the object. The line will
   * be affected by the transforms of the objects, so we don't have to calculate transforms
   * like we do with the raycaster.
   *
   * @param {number} length - Length of line. Pass in to shorten the line to the intersection
   *   point. If not provided, length will default to the max length, `raycaster.far`.
   */
  drawLine: (function (length) {
    var lineEndVec3 = new THREE.Vector3();
    var otherLineEndVec3 = new THREE.Vector3();
    var lineData = {end: lineEndVec3};

    return function (length) {
      var data = this.data;
      var el = this.el;
      // We switch each time the vector so the line update is triggered
      // and to avoid unnecessary vector clone.
      var endVec3 = lineData.end === lineEndVec3 ? otherLineEndVec3 : lineEndVec3;

      // Treat Infinity as 1000m for the line.
      if (length === undefined) {
        length = data.far === Infinity ? 1000 : data.far;
      }

      // Update the length of the line if given. `unitLineEndVec3` is the direction
      // given by data.direction, then we apply a scalar to give it a length.
      lineData.start = data.origin;
      lineData.end = endVec3.copy(this.unitLineEndVec3).multiplyScalar(length);
      el.setAttribute('line', lineData);
    };
  })()
});

/**
 * Returns children of each element's object3D group. Children are flattened
 * by one level, removing the THREE.Group wrapper, so that non-recursive
 * raycasting remains useful.
 *
 * @param  {Array<Element>} els
 * @return {Array<THREE.Object3D>}
 */
function flattenChildrenShallow (els) {
  var groups = [];
  var objects = [];
  var children;
  var i;

  // Push meshes onto list of objects to intersect.
  for (i = 0; i < els.length; i++) {
    if (els[i].object3D) {
      groups.push(els[i].object3D);
    }
  }

  // Each entity's root is a THREE.Group. Return the group's chilrden.
  for (i = 0; i < groups.length; i++) {
    children = groups[i].children;
    if (children && children.length) {
      objects.push.apply(objects, children);
    }
  }

  return objects;
}

/**
 * Copy contents of one array to another without allocating new array.
 */
function copyArray (a, b) {
  var i;
  a.length = b.length;
  for (i = 0; i < b.length; i++) {
    a[i] = b[i];
  }
}
