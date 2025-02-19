/* global MutationObserver */

import * as THREE from 'three';
import { registerComponent } from '../core/component.js';
import * as utils from '../utils/index.js';

var warn = utils.debug('components:raycaster:warn');

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

var EVENTS = {
  INTERSECT: 'raycaster-intersected',
  INTERSECTION: 'raycaster-intersection',
  INTERSECT_CLEAR: 'raycaster-intersected-cleared',
  INTERSECTION_CLEAR: 'raycaster-intersection-cleared',
  INTERSECTION_CLOSEST_ENTITY_CHANGED: 'raycaster-closest-entity-changed'
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
export var Component = registerComponent('raycaster', {
  schema: {
    autoRefresh: {default: true},
    direction: {type: 'vec3', default: {x: 0, y: 0, z: -1}},
    enabled: {default: true},
    far: {default: 1000},
    interval: {default: 0},
    near: {default: 0},
    objects: {default: ''},
    origin: {type: 'vec3'},
    showLine: {default: false},
    lineColor: {default: 'white'},
    lineOpacity: {default: 1},
    useWorldCoordinates: {default: false}
  },

  multiple: true,

  init: function () {
    this.clearedIntersectedEls = [];
    this.unitLineEndVec3 = new THREE.Vector3();
    this.intersectedEls = [];
    this.intersections = [];
    this.newIntersectedEls = [];
    this.newIntersections = [];
    this.objects = [];
    this.prevCheckTime = undefined;
    this.prevIntersectedEls = [];
    this.rawIntersections = [];
    this.raycaster = new THREE.Raycaster();
    this.updateOriginDirection();
    this.setDirty = this.setDirty.bind(this);
    this.updateLine = this.updateLine.bind(this);
    this.observer = new MutationObserver(this.setDirty);
    this.dirty = true;
    this.lineEndVec3 = new THREE.Vector3();
    this.otherLineEndVec3 = new THREE.Vector3();
    this.lineData = {end: this.lineEndVec3};

    this.getIntersection = this.getIntersection.bind(this);
    this.intersectedDetail = {el: this.el, getIntersection: this.getIntersection};
    this.intersectedClearedDetail = {el: this.el};
    this.intersectionClearedDetail = {clearedEls: this.clearedIntersectedEls};
    this.intersectionDetail = {};
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
         data.direction !== oldData.direction || !oldData.showLine)) {
      // Calculate unit vector for line direction. Can be multiplied via scalar and added
      // to origin to adjust line length.
      this.unitLineEndVec3.copy(data.direction).normalize();
      this.drawLine();
    }

    if (!data.showLine && oldData.showLine) {
      el.removeAttribute('line');
    }

    if (data.objects !== oldData.objects && !OBSERVER_SELECTOR_RE.test(data.objects)) {
      warn('[raycaster] Selector "' + data.objects +
           '" may not update automatically with DOM changes.');
    }

    if (!data.objects) {
      warn('[raycaster] For performance, please define raycaster.objects when using ' +
           'raycaster or cursor components to whitelist which entities to intersect with. ' +
           'e.g., raycaster="objects: [data-raycastable]".');
    }

    if (data.autoRefresh !== oldData.autoRefresh && el.isPlaying) {
      data.autoRefresh
        ? this.addEventListeners()
        : this.removeEventListeners();
    }

    if (oldData.enabled && !data.enabled) { this.clearAllIntersections(); }

    if (data.objects !== oldData.objects) {
      this.setDirty();
    }
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
    this.clearAllIntersections();
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
    var els;

    // If objects not defined, intersect with everything.
    els = data.objects
      ? this.el.sceneEl.querySelectorAll(data.objects)
      : this.el.sceneEl.querySelectorAll('*');
    this.objects = this.flattenObject3DMaps(els);
    this.dirty = false;
  },

  /**
   * Check for intersections and cleared intersections on an interval.
   */
  tock: function (time) {
    var data = this.data;
    var prevCheckTime = this.prevCheckTime;

    if (!data.enabled) { return; }

    // Only check for intersection if interval time has passed.
    if (prevCheckTime && (time - prevCheckTime < data.interval)) { return; }

    // Update check time.
    this.prevCheckTime = time;
    this.checkIntersections();
  },

  /**
   * Raycast for intersections and emit events for current and cleared intersections.
   */
  checkIntersections: function () {
    var clearedIntersectedEls = this.clearedIntersectedEls;
    var el = this.el;
    var data = this.data;
    var i;
    var intersectedEls = this.intersectedEls;
    var intersection;
    var intersections = this.intersections;
    var newIntersectedEls = this.newIntersectedEls;
    var newIntersections = this.newIntersections;
    var prevIntersectedEls = this.prevIntersectedEls;
    var rawIntersections = this.rawIntersections;

    // Refresh the object whitelist if needed.
    if (this.dirty) { this.refreshObjects(); }

    // Store old previously intersected entities.
    copyArray(this.prevIntersectedEls, this.intersectedEls);

    // Raycast.
    this.updateOriginDirection();
    rawIntersections.length = 0;
    this.raycaster.intersectObjects(this.objects, true, rawIntersections);

    // Only keep intersections against objects that have a reference to an entity.
    intersections.length = 0;
    intersectedEls.length = 0;
    for (i = 0; i < rawIntersections.length; i++) {
      intersection = rawIntersections[i];
      // Don't intersect with own line.
      if (data.showLine && intersection.object === el.getObject3D('line')) {
        continue;
      }
      if (intersection.object.el) {
        intersections.push(intersection);
        intersectedEls.push(intersection.object.el);
      }
    }

    // Get newly intersected entities.
    newIntersections.length = 0;
    newIntersectedEls.length = 0;
    for (i = 0; i < intersections.length; i++) {
      if (prevIntersectedEls.indexOf(intersections[i].object.el) === -1) {
        newIntersections.push(intersections[i]);
        newIntersectedEls.push(intersections[i].object.el);
      }
    }

    // Emit intersection cleared on both entities per formerly intersected entity.
    clearedIntersectedEls.length = 0;
    for (i = 0; i < prevIntersectedEls.length; i++) {
      if (intersectedEls.indexOf(prevIntersectedEls[i]) !== -1) { continue; }
      prevIntersectedEls[i].emit(EVENTS.INTERSECT_CLEAR,
                                 this.intersectedClearedDetail);
      clearedIntersectedEls.push(prevIntersectedEls[i]);
    }
    if (clearedIntersectedEls.length) {
      el.emit(EVENTS.INTERSECTION_CLEAR, this.intersectionClearedDetail);
    }

    // Emit intersected on intersected entity per intersected entity.
    for (i = 0; i < newIntersectedEls.length; i++) {
      newIntersectedEls[i].emit(EVENTS.INTERSECT, this.intersectedDetail);
    }

    // Emit all intersections at once on raycasting entity.
    if (newIntersections.length) {
      this.intersectionDetail.els = newIntersectedEls;
      this.intersectionDetail.intersections = newIntersections;
      el.emit(EVENTS.INTERSECTION, this.intersectionDetail);
    }

    // Emit event when the closest intersected entity has changed.
    if (prevIntersectedEls.length === 0 && intersections.length > 0 ||
        prevIntersectedEls.length > 0 && intersections.length === 0 ||
        (prevIntersectedEls.length && intersections.length &&
        prevIntersectedEls[0] !== intersections[0].object.el)) {
      this.intersectionDetail.els = this.intersectedEls;
      this.intersectionDetail.intersections = intersections;
      el.emit(EVENTS.INTERSECTION_CLOSEST_ENTITY_CHANGED, this.intersectionDetail);
    }

    // Update line length.
    if (data.showLine) { setTimeout(this.updateLine); }
  },

  updateLine: function () {
    var el = this.el;
    var intersections = this.intersections;
    var lineLength;

    if (intersections.length) {
      if (intersections[0].object.el === el && intersections[1]) {
        lineLength = intersections[1].distance;
      } else {
        lineLength = intersections[0].distance;
      }
    }
    this.drawLine(lineLength);
  },

  /**
   * Return the most recent intersection details for a given entity, if any.
   * @param {AEntity} el
   * @returns {object|null}
   */
  getIntersection: function (el) {
    var i;
    var intersection;
    for (i = 0; i < this.intersections.length; i++) {
      intersection = this.intersections[i];
      if (intersection.object.el === el) { return intersection; }
    }
    return null;
  },

  /**
   * Update origin and direction of raycaster using entity transforms and supplied origin or
   * direction offsets.
   */
  updateOriginDirection: (function () {
    var direction = new THREE.Vector3();
    var originVec3 = new THREE.Vector3();

    // Closure to make quaternion/vector3 objects private.
    return function updateOriginDirection () {
      var el = this.el;
      var data = this.data;

      if (data.useWorldCoordinates) {
        this.raycaster.set(data.origin, data.direction);
        return;
      }

      el.object3D.updateMatrixWorld();
      originVec3.setFromMatrixPosition(el.object3D.matrixWorld);

      // If non-zero origin, translate the origin into world space.
      if (data.origin.x !== 0 || data.origin.y !== 0 || data.origin.z !== 0) {
        originVec3 = el.object3D.localToWorld(originVec3.copy(data.origin));
      }

      // three.js raycaster direction is relative to 0, 0, 0 NOT the origin / offset we
      // provide. Apply the offset to the direction, then rotation from the object,
      // and normalize.
      direction.copy(data.direction).transformDirection(el.object3D.matrixWorld).normalize();

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
  drawLine: function (length) {
    var data = this.data;
    var el = this.el;
    var endVec3;

    // Switch each time vector so line update triggered and to avoid unnecessary vector clone.
    endVec3 = this.lineData.end === this.lineEndVec3
      ? this.otherLineEndVec3
      : this.lineEndVec3;

    // Treat Infinity as 1000m for the line.
    if (length === undefined) {
      length = data.far === Infinity ? 1000 : data.far;
    }

    // Update the length of the line if given. `unitLineEndVec3` is the direction
    // given by data.direction, then we apply a scalar to give it a length and the
    // origin point to offset it.
    this.lineData.start = data.origin;
    this.lineData.end = endVec3.copy(this.unitLineEndVec3).multiplyScalar(length).add(data.origin);
    this.lineData.color = data.lineColor;
    this.lineData.opacity = data.lineOpacity;
    el.setAttribute('line', this.lineData);
  },

  /**
   * Return A-Frame attachments of each element's object3D group (e.g., mesh).
   * Children are flattened by one level, removing the THREE.Group wrapper,
   * so that non-recursive raycasting remains useful.
   *
   * Only push children defined as component attachments (e.g., setObject3D),
   * NOT actual children in the scene graph hierarchy.
   *
   * @param {Array<Element>} els
   * @returns {Array<THREE.Object3D>}
   */
  flattenObject3DMaps: function (els) {
    var key;
    var i;
    var objects = this.objects;
    var scene = this.el.sceneEl.object3D;

    function isAttachedToScene (object) {
      if (object.parent) {
        return isAttachedToScene(object.parent);
      } else {
        return (object === scene);
      }
    }

    // Push meshes and other attachments onto list of objects to intersect.
    objects.length = 0;
    for (i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.isEntity && el.object3D && isAttachedToScene(el.object3D)) {
        for (key in el.object3DMap) {
          objects.push(el.getObject3D(key));
        }
      }
    }

    return objects;
  },

  clearAllIntersections: function () {
    var i;
    for (i = 0; i < this.intersectedEls.length; i++) {
      this.intersectedEls[i].emit(EVENTS.INTERSECT_CLEAR,
                                  this.intersectedClearedDetail);
    }
    copyArray(this.clearedIntersectedEls, this.intersectedEls);
    this.intersectedEls.length = 0;
    this.intersections.length = 0;
    this.el.emit(EVENTS.INTERSECTION_CLEAR, this.intersectionClearedDetail);
  }
});

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
