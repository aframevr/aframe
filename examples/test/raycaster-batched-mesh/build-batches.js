/* global AFRAME, THREE */
// Demonstrates per-instance hover / click on THREE.BatchedMesh and THREE.InstancedMesh.
//
// A-Frame's raycaster and cursor keep treating the host a-entity as the hover
// target, but they fire `mouseenter` / `mouseleave` / `click` whenever the
// (entity, batchId, instanceId) tuple changes. The event detail includes the
// per-instance ids on `detail.intersection`. Apps hold their own map from
// ids to logical entities and proxy events to them — the mapping stays in
// app code, not in A-Frame core.

var BOX_COLOR = new THREE.Color('#4cc3d9');
var CONE_COLOR = new THREE.Color('#f1ea65');
var HOVER_COLOR = new THREE.Color('#ff6b9d');

AFRAME.registerComponent('log-events', {
  events: {
    mouseenter: function () { console.log('[mouseenter]', this.el.id); },
    mouseleave: function () { console.log('[mouseleave]', this.el.id); },
    click: function () { console.log('[click]', this.el.id); }
  }
});

AFRAME.registerComponent('hover-tint', {
  events: {
    mouseenter: function () { this.setColor(HOVER_COLOR); },
    mouseleave: function () { this.setColor(this.baseColor); }
  },
  setColor: function (color) {
    var slot = this.el.object3D.userData.batchSlot;
    if (!slot || !color) { return; }
    slot.mesh.setColorAt(slot.id, color);
    if (slot.mesh.instanceColor) { slot.mesh.instanceColor.needsUpdate = true; }
  }
});

// Host-level proxy: reads detail.intersection.batchId / instanceId, looks up the
// logical per-instance entity in the host's local map, and re-dispatches the
// cursor events to that entity so components like hover-tint / log-events can
// react on the per-instance side.
AFRAME.registerComponent('batch-proxy', {
  schema: { key: { default: 'batchId' } }, // 'batchId' or 'instanceId'
  init: function () {
    this.map = [];
  },
  register: function (id, memberEl) {
    this.map[id] = memberEl;
  },
  events: {
    mouseenter: function (evt) { this.forward(evt, 'mouseenter'); },
    mouseleave: function (evt) { this.forward(evt, 'mouseleave'); },
    click: function (evt) { this.forward(evt, 'click'); }
  },
  forward: function (evt, name) {
    var id = evt.detail.intersection && evt.detail.intersection[this.data.key];
    var target = id !== undefined ? this.map[id] : null;
    if (!target) { return; }
    target.emit(name, { cursorEl: evt.detail.cursorEl, intersection: evt.detail.intersection });
  }
});

function stashSlot (el, mesh, id, baseColor) {
  el.object3D.userData.batchSlot = { mesh: mesh, id: id };
  var tint = el.components['hover-tint'];
  if (tint) { tint.baseColor = baseColor; }
}

function buildBatchedMesh (hostEl, memberEls, baseColor) {
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshStandardMaterial();
  var batched = new THREE.BatchedMesh(
    memberEls.length,
    geometry.attributes.position.count,
    geometry.index.count,
    material
  );
  var geomId = batched.addGeometry(geometry);
  var proxy = hostEl.components['batch-proxy'];

  memberEls.forEach(function (el) {
    var instanceId = batched.addInstance(geomId);
    el.object3D.updateMatrix();
    batched.setMatrixAt(instanceId, el.object3D.matrix);
    batched.setColorAt(instanceId, baseColor);
    proxy.register(instanceId, el);
    stashSlot(el, batched, instanceId, baseColor);
  });

  hostEl.setObject3D('mesh', batched);
}

function buildInstancedMesh (hostEl, memberEls, baseColor) {
  var geometry = new THREE.ConeGeometry(0.5, 1, 16);
  var material = new THREE.MeshStandardMaterial();
  var mesh = new THREE.InstancedMesh(geometry, material, memberEls.length);
  var proxy = hostEl.components['batch-proxy'];

  memberEls.forEach(function (el, i) {
    el.object3D.updateMatrix();
    mesh.setMatrixAt(i, el.object3D.matrix);
    mesh.setColorAt(i, baseColor);
    proxy.register(i, el);
    stashSlot(el, mesh, i, baseColor);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) { mesh.instanceColor.needsUpdate = true; }

  hostEl.setObject3D('mesh', mesh);
}

document.addEventListener('DOMContentLoaded', function () {
  var sceneEl = document.querySelector('a-scene');
  sceneEl.addEventListener('loaded', function () {
    buildBatchedMesh(
      document.getElementById('batchHost'),
      [
        document.getElementById('boxA'),
        document.getElementById('boxB'),
        document.getElementById('boxC')
      ],
      BOX_COLOR
    );

    buildInstancedMesh(
      document.getElementById('instanceHost'),
      [
        document.getElementById('coneA'),
        document.getElementById('coneB'),
        document.getElementById('coneC')
      ],
      CONE_COLOR
    );
  });
});
