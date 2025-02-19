import * as THREE from 'three';
import { registerComponent } from '../core/component.js';
import { registerShader } from '../core/shader.js';
var DEFAULT_PREVIEW_DISTANCE = 15.0;

/**
 * Link component. Connect experiences and traverse between them in VR
 *
 * @member {object} hiddenEls - Store the hidden elements during peek mode.
 */
export var Component = registerComponent('link', {
  schema: {
    backgroundColor: {default: 'red', type: 'color'},
    borderColor: {default: 'white', type: 'color'},
    highlighted: {default: false},
    highlightedColor: {default: '#24CAFF', type: 'color'},
    href: {default: ''},
    image: {type: 'asset'},
    on: {default: 'click'},
    peekMode: {default: false},
    title: {default: ''},
    titleColor: {default: 'white', type: 'color'},
    visualAspectEnabled: {default: false}
  },

  init: function () {
    this.navigate = this.navigate.bind(this);
    this.previousQuaternion = undefined;
    this.quaternionClone = new THREE.Quaternion();
    // Store hidden elements during peek mode so we can show them again later.
    this.hiddenEls = [];
  },

  update: function (oldData) {
    var data = this.data;
    var el = this.el;
    var backgroundColor;
    var strokeColor;

    if (!data.visualAspectEnabled) { return; }

    var elScale = this.el.getAttribute('scale');
    this.previewDistance = DEFAULT_PREVIEW_DISTANCE * (elScale.x + elScale.y) / 2;

    this.initVisualAspect();

    backgroundColor = data.highlighted ? data.highlightedColor : data.backgroundColor;
    strokeColor = data.highlighted ? data.highlightedColor : data.borderColor;
    el.setAttribute('material', 'backgroundColor', backgroundColor);
    el.setAttribute('material', 'strokeColor', strokeColor);

    if (data.on !== oldData.on) { this.updateEventListener(); }

    if (oldData.peekMode !== undefined &&
        data.peekMode !== oldData.peekMode) { this.updatePeekMode(); }

    if (!data.image || oldData.image === data.image) { return; }

    el.setAttribute('material', 'pano',
                    typeof data.image === 'string' ? data.image : data.image.src);
  },

  /*
   * Toggle all elements and full 360 preview of the linked page.
   */
  updatePeekMode: function () {
    var el = this.el;
    var sphereEl = this.sphereEl;
    if (this.data.peekMode) {
      this.hideAll();
      el.getObject3D('mesh').visible = false;
      sphereEl.setAttribute('visible', true);
    } else {
      this.showAll();
      el.getObject3D('mesh').visible = true;
      sphereEl.setAttribute('visible', false);
    }
  },

  play: function () {
    this.updateEventListener();
  },

  pause: function () {
    this.removeEventListener();
  },

  updateEventListener: function () {
    var el = this.el;
    if (!el.isPlaying) { return; }
    this.removeEventListener();
    el.addEventListener(this.data.on, this.navigate);
  },

  removeEventListener: function () {
    var on = this.data.on;
    if (!on) { return; }
    this.el.removeEventListener(on, this.navigate);
  },

  initVisualAspect: function () {
    var el = this.el;
    var semiSphereEl;
    var sphereEl;
    var textEl;

    if (!this.data.visualAspectEnabled || this.visualAspectInitialized) { return; }

    textEl = this.textEl = this.textEl || document.createElement('a-entity');
    sphereEl = this.sphereEl = this.sphereEl || document.createElement('a-entity');
    semiSphereEl = this.semiSphereEl = this.semiSphereEl || document.createElement('a-entity');

    // Set portal.
    el.setAttribute('geometry', {primitive: 'circle', radius: 1.0, segments: 64});
    el.setAttribute('material', {shader: 'portal', pano: this.data.image, side: 'double', previewDistance: this.previewDistance});

    // Set text that displays the link title and URL.
    textEl.setAttribute('text', {
      color: this.data.titleColor,
      align: 'center',
      font: 'kelsonsans',
      value: this.data.title || this.data.href,
      width: 4
    });
    textEl.setAttribute('position', '0 1.5 0');
    el.appendChild(textEl);

    // Set sphere rendered when camera is close to portal to allow user to peek inside.
    semiSphereEl.setAttribute('geometry', {
      primitive: 'sphere',
      radius: 1.0,
      phiStart: 0,
      segmentsWidth: 64,
      segmentsHeight: 64,
      phiLength: 180,
      thetaStart: 0,
      thetaLength: 360
    });
    semiSphereEl.setAttribute('material', {
      shader: 'portal',
      borderEnabled: 0.0,
      pano: this.data.image,
      side: 'back',
      previewDistance: this.previewDistance
    });
    semiSphereEl.setAttribute('rotation', '0 180 0');
    semiSphereEl.setAttribute('position', '0 0 0');
    semiSphereEl.setAttribute('visible', false);
    el.appendChild(semiSphereEl);

    // Set sphere rendered when camera is close to portal to allow user to peek inside.
    sphereEl.setAttribute('geometry', {
      primitive: 'sphere',
      radius: 10,
      segmentsWidth: 64,
      segmentsHeight: 64
    });
    sphereEl.setAttribute('material', {
      shader: 'portal',
      borderEnabled: 0.0,
      pano: this.data.image,
      side: 'back',
      previewDistance: this.previewDistance
    });
    sphereEl.setAttribute('visible', false);
    el.appendChild(sphereEl);

    this.visualAspectInitialized = true;
  },

  navigate: function () {
    window.location = this.data.href;
  },

  /**
   * 1. Swap plane that represents portal with sphere with a hole when the camera is close
   * so user can peek inside portal. Sphere is rendered on opposite side of portal
   * from where user enters.
   * 2. Place the url/title above or inside portal depending on distance to camera.
   * 3. Face portal to camera when far away from user.
   */
  tick: (function () {
    var cameraWorldPosition = new THREE.Vector3();
    var elWorldPosition = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();

    return function () {
      var el = this.el;
      var object3D = el.object3D;
      var camera = el.sceneEl.camera;
      var cameraPortalOrientation;
      var distance;
      var textEl = this.textEl;

      if (!this.data.visualAspectEnabled) { return; }

      // Update matrices
      object3D.updateMatrixWorld();
      camera.parent.updateMatrixWorld();
      camera.updateMatrixWorld();

      object3D.matrix.decompose(elWorldPosition, quaternion, scale);
      elWorldPosition.setFromMatrixPosition(object3D.matrixWorld);
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
      distance = elWorldPosition.distanceTo(cameraWorldPosition);

      if (distance > this.previewDistance * 1.33333) {
        // Store original orientation to be restored when the portal stops facing the camera.
        if (!this.previousQuaternion) {
          this.quaternionClone.copy(quaternion);
          this.previousQuaternion = this.quaternionClone;
        }
        // If the portal is far away from the user, face portal to camera.
        object3D.lookAt(cameraWorldPosition);
      } else {
        // When portal is close to the user/camera.
        cameraPortalOrientation = this.calculateCameraPortalOrientation();
        // If user gets very close to portal, replace with holed sphere they can peek in.
        if (distance < 0.5) {
          // Configure text size and sphere orientation depending side user approaches portal.
          if (this.semiSphereEl.getAttribute('visible') === true) { return; }
          textEl.setAttribute('text', 'width', 1.5);
          if (cameraPortalOrientation <= 0.0) {
            textEl.setAttribute('position', '0 0 0.75');
            textEl.setAttribute('rotation', '0 180 0');
            this.semiSphereEl.setAttribute('rotation', '0 0 0');
          } else {
            textEl.setAttribute('position', '0 0 -0.75');
            textEl.setAttribute('rotation', '0 0 0');
            this.semiSphereEl.setAttribute('rotation', '0 180 0');
          }
          el.getObject3D('mesh').visible = false;
          this.semiSphereEl.setAttribute('visible', true);
          this.peekCameraPortalOrientation = cameraPortalOrientation;
        } else {
          // Calculate which side the camera is approaching the camera (back / front).
          // Adjust text orientation based on camera position.
          if (cameraPortalOrientation <= 0.0) {
            textEl.setAttribute('rotation', '0 180 0');
          } else {
            textEl.setAttribute('rotation', '0 0 0');
          }
          textEl.setAttribute('text', 'width', 5);
          textEl.setAttribute('position', '0 1.5 0');
          el.getObject3D('mesh').visible = true;
          this.semiSphereEl.setAttribute('visible', false);
          this.peekCameraPortalOrientation = undefined;
        }
        if (this.previousQuaternion) {
          object3D.quaternion.copy(this.previousQuaternion);
          this.previousQuaternion = undefined;
        }
      }
    };
  })(),

  hideAll: function () {
    var el = this.el;
    var hiddenEls = this.hiddenEls;
    var self = this;
    if (hiddenEls.length > 0) { return; }
    el.sceneEl.object3D.traverse(function (object) {
      if (object && object.el && object.el.hasAttribute('link-controls')) { return; }
      if (!object.el || object === el.sceneEl.object3D || object.el === el ||
          object.el === self.sphereEl || object.el === el.sceneEl.cameraEl ||
          object.el.getAttribute('visible') === false || object.el === self.textEl ||
          object.el === self.semiSphereEl) {
        return;
      }
      object.el.setAttribute('visible', false);
      hiddenEls.push(object.el);
    });
  },

  showAll: function () {
    this.hiddenEls.forEach(function (el) { el.setAttribute('visible', true); });
    this.hiddenEls = [];
  },

  /**
   * Calculate whether the camera faces the front or back face of the portal.
   * @returns {number} > 0 if camera faces front of portal, < 0 if it faces back of portal.
   */
  calculateCameraPortalOrientation: (function () {
    var mat4 = new THREE.Matrix4();
    var cameraPosition = new THREE.Vector3();
    var portalNormal = new THREE.Vector3(0, 0, 1);
    var portalPosition = new THREE.Vector3(0, 0, 0);

    return function () {
      var el = this.el;
      var camera = el.sceneEl.camera;

      // Reset tmp variables.
      cameraPosition.set(0, 0, 0);
      portalNormal.set(0, 0, 1);
      portalPosition.set(0, 0, 0);

      // Apply portal orientation to the normal.
      el.object3D.matrixWorld.extractRotation(mat4);
      portalNormal.applyMatrix4(mat4);

      // Calculate portal world position.
      el.object3D.updateMatrixWorld();
      el.object3D.localToWorld(portalPosition);

      // Calculate camera world position.
      camera.parent.parent.updateMatrixWorld();
      camera.parent.updateMatrixWorld();
      camera.updateMatrixWorld();
      camera.localToWorld(cameraPosition);

      // Calculate vector from portal to camera.
      // (portal) -------> (camera)
      cameraPosition.sub(portalPosition).normalize();
      portalNormal.normalize();

      // Side where camera approaches portal is given by sign of dot product of portal normal
      // and portal to camera vectors.
      return Math.sign(portalNormal.dot(cameraPosition));
    };
  })(),

  remove: function () {
    this.removeEventListener();
  }
});

/* eslint-disable */
registerShader('portal', {
  schema: {
    borderEnabled: {default: 1.0, type: 'int', is: 'uniform'},
    backgroundColor: {default: 'red', type: 'color', is: 'uniform'},
    pano: {type: 'map', is: 'uniform'},
    strokeColor: {default: 'white', type: 'color', is: 'uniform'},
    previewDistance: {default: DEFAULT_PREVIEW_DISTANCE, type: 'float', is: 'uniform'}
  },

  vertexShader: [
    'vec3 portalPosition;',
    'varying vec3 vWorldPosition;',
    'varying float vDistanceToCenter;',
    'varying float vDistance;',
    'void main() {',
    'vDistanceToCenter = clamp(length(position - vec3(0.0, 0.0, 0.0)), 0.0, 1.0);',
    'portalPosition = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;',
    'vDistance = length(portalPosition - cameraPosition);',
    'vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n'),

  fragmentShader: [
    '#define RECIPROCAL_PI2 0.15915494',
    'uniform sampler2D pano;',
    'uniform vec3 strokeColor;',
    'uniform vec3 backgroundColor;',
    'uniform float borderEnabled;',
    'uniform float previewDistance;',
    'varying float vDistanceToCenter;',
    'varying float vDistance;',
    'varying vec3 vWorldPosition;',
    'void main() {',
    'vec3 direction = normalize(vWorldPosition - cameraPosition);',
    'vec2 sampleUV;',
    'float borderThickness = clamp(exp(-vDistance / 50.0), 0.6, 0.95);',
    'sampleUV.y = clamp(direction.y * 0.5  + 0.5, 0.0, 1.0);',
    'sampleUV.x = atan(direction.z, -direction.x) * -RECIPROCAL_PI2 + 0.5;',
    'if (vDistanceToCenter > borderThickness && borderEnabled == 1.0) {',
    'gl_FragColor = vec4(strokeColor, 1.0);',
    '} else {',
    'gl_FragColor = mix(texture2D(pano, sampleUV), vec4(backgroundColor, 1.0), clamp(pow((vDistance / previewDistance), 2.0), 0.0, 1.0));',
    '}',
    '}'
  ].join('\n')
});
/* eslint-enable */
