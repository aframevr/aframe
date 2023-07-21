// Custom A-Frame sort functions.
// Variations of Three.js default sort orders here:
// https://github.com/mrdoob/three.js/blob/ebbaecf9acacf259ea9abdcba7b6fb25cfcea2ab/src/renderers/webgl/WebGLRenderLists.js#L1
// See: https://github.com/aframevr/aframe/issues/5332

// Default sort for opaque objects:
// - respect groupOrder & renderOrder settings
// - sort front-to-back by z-depth from camera (this should minimize overdraw)
// - otherwise leave objects in default order (object tree order)

function aframeSortOpaqueDefault (a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  } else if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  } else if (a.z !== b.z) {
    return a.z - b.z;
  } else {
    return 0;
  }
}

// Default sort for transparent objects:
// - respect groupOrder & renderOrder settings
// - otherwise leave objects in default order (object tree order)
function aframeSortTransparentDefault (a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  } else if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  } else {
    return 0;
  }
}

// Spatial sort for transparent objects:
// - respect groupOrder & renderOrder settings
// - sort back-to-front by z-depth from camera
// - otherwise leave objects in default order (object tree order)
function aframeSortTransparentSpatial (a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  } else if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  } else if (a.z !== b.z) {
    return b.z - a.z;
  } else {
    return 0;
  }
}

module.exports = {
  aframeSortOpaqueDefault: aframeSortOpaqueDefault,
  aframeSortTransparentDefault: aframeSortTransparentDefault,
  aframeSortTransparentSpatial: aframeSortTransparentSpatial
};
