var registerComponent = require('../core/component').registerComponent;
var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');

/**
 * Link component. Connect experiences and traverse between them in VR
 *
 * @member {object} hiddenEls - Stores the hidden elements during peek mode.
 */
module.exports.Component = registerComponent('link', {
  schema: {
    color: {default: 'white', type: 'color'},
    highlighted: {default: false},
    highlightedColor: {default: '#24CAFF', type: 'color'},
    href: {default: ''},
    image: {type: 'asset'},
    on: {default: 'click'},
    peekMode: {default: false},
    title: {default: ''},
    visualAspectEnabled: {default: true}
  },

  init: function () {
    this.navigate = this.navigate.bind(this);
    this.previousQuaternion = undefined;
    // Store hidden elements during peek mode so we can show them again later.
    this.hiddenEls = [];
    this.initVisualAspect();
  },

  update: function (oldData) {
    var data = this.data;
    var el = this.el;
    var strokeColor = data.highlighted ? data.highlightedColor : data.color;
    el.setAttribute('material', 'strokeColor', strokeColor);
    if (data.on !== oldData.on) { this.updateEventListener(); }
    if (data.visualAspectEnabled && oldData.peekMode !== undefined && data.peekMode !== oldData.peekMode) {
      this.updatePeekMode();
    }
    if (!data.image || oldData.image === data.image) { return; }
    el.setAttribute('material', 'pano',
                    typeof data.image === 'string' ? data.image : data.image.src);
  },

  /*
   * Hide / Show all elements and Hide / Show the full 360 preview
   * of the linked page.
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
    var textEl;
    var sphereEl;
    var semiSphereEl;
    if (!this.data.visualAspectEnabled) { return; }
    textEl = this.textEl = this.textEl || document.createElement('a-entity');
    sphereEl = this.sphereEl = this.sphereEl || document.createElement('a-entity');
    semiSphereEl = this.semiSphereEl = this.semiSphereEl || document.createElement('a-entity');

    // Set Portal
    el.setAttribute('geometry', {primitive: 'circle', radius: 1.0, segments: 64});
    el.setAttribute('material', {
      shader: 'portal',
      pano: this.data.image,
      side: 'double'
    });
    // Set text that displays the link title / url
    textEl.setAttribute('text', {
      color: 'white',
      align: 'center',
      font: 'kelsonsans',
      value: this.data.title || this.data.href,
      width: 4
    });
    textEl.setAttribute('position', '0 1.5 0');
    el.appendChild(textEl);

    // Set the sphere that is rendered when the camera is close
    // to the portal to allow the user peek inside
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
      side: 'back'
    });
    semiSphereEl.setAttribute('rotation', '0 180 0');
    semiSphereEl.setAttribute('position', '0 0 0');
    semiSphereEl.setAttribute('visible', false);
    el.appendChild(semiSphereEl);

    // Set the sphere that is rendered when the camera is close
    // to the portal to allow the user peek inside
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
      side: 'back'
    });
    sphereEl.setAttribute('visible', false);
    el.appendChild(sphereEl);
  },

  navigate: function () {
    window.location = this.data.href;
  },

  /**
   * The tick handles:
   * 1. Swap the plane the represents the portal with a sphere with a hole when the camera is close
   * so the user can peek inside the portal. The sphere is rendered on the oposite side of the portal
   * from where the user enters.
   * 2. It places the url / title above or inside the portal depending on the distance to the camera.
   * 3. The portal faces the camera when it's far away from the user.
   *
   */
  tick: (function () {
    var elWorldPosition = new THREE.Vector3();
    var cameraWorldPosition = new THREE.Vector3();
    var scale = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    return function () {
      if (!this.data.visualAspectEnabled) { return; }
      var el = this.el;
      var object3D = el.object3D;
      var camera = el.sceneEl.camera;
      var cameraPortalOrientation;
      var distance;
      var textEl = this.textEl;
      // Update matrices
      object3D.updateMatrixWorld();
      camera.parent.updateMatrixWorld();
      camera.updateMatrixWorld();

      object3D.matrix.decompose(elWorldPosition, quaternion, scale);
      elWorldPosition.setFromMatrixPosition(object3D.matrixWorld);
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
      distance = elWorldPosition.distanceTo(cameraWorldPosition);
      // Store original orientation to be restored when the portal
      // stops facing the camera
      this.previousQuaternion = this.previousQuaternion || quaternion.clone();

      // If the portal is far away from the user the portal faces the camera
      if (distance > 20) {
        object3D.lookAt(cameraWorldPosition);
      } else { // When the portal is close to the user (camera)
        cameraPortalOrientation = this.calculateCameraPortalOrientation();
        // If the user gets very close to the portal it is replaced
        // by a holed sphere where she can peek inside
        if (distance < 0.5) {
          // Configure text size and sphere orientation depending
          // the side the user approaches the portal
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
          // Calculate wich side the camera is approaching the camera (back / front)
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
      if (!object.el || object === el.sceneEl.object3D || object.el === el || object.el === self.sphereEl ||
          object.el === el.sceneEl.cameraEl || object.el.getAttribute('visible') === false || object.el === self.textEl || object.el === self.semiSphereEl) { return; }
      object.el.setAttribute('visible', false);
      hiddenEls.push(object.el);
    });
  },

  showAll: function () {
    this.hiddenEls.forEach(function (el) { el.setAttribute('visible', true); });
    this.hiddenEls = [];
  },

  /**
   *  Calculate if the camera / user faces the front or back face of the portal
   *  @returns {number} > 0 if the camera faces the front of the portal < 0 if it faces the back.
   */
  calculateCameraPortalOrientation: (function () {
    var mat4 = new THREE.Matrix4();
    var cameraPosition = new THREE.Vector3();
    var portalNormal = new THREE.Vector3(0, 0, 1);
    var portalPosition = new THREE.Vector3(0, 0, 0);

    return function () {
      var el = this.el;
      var camera = el.sceneEl.camera;

      // Reset tmp variables
      cameraPosition.set(0, 0, 0);
      portalNormal.set(0, 0, 1);
      portalPosition.set(0, 0, 0);

      // Apply portal orientation to the normal
      el.object3D.matrixWorld.extractRotation(mat4);
      portalNormal.applyMatrix4(mat4);

      // Calculate portal world position
      el.object3D.updateMatrixWorld();
      el.object3D.localToWorld(portalPosition);

      // Calculate camera world position
      camera.parent.parent.updateMatrixWorld();
      camera.parent.updateMatrixWorld();
      camera.updateMatrixWorld();
      camera.localToWorld(cameraPosition);

      // Calculate vector from portal to camera
      // (portal) -------> (camera)
      cameraPosition.sub(portalPosition).normalize();
      portalNormal.normalize();

      // The side where the camera (user) approaches the portal
      // is given by the sign of the dot product of the portal normal
      // and the portal to camera vectors.
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
    pano: {type: 'map', is: 'uniform'},
    borderEnabled: {default: 1.0, type: 'int', is: 'uniform'},
    strokeColor: {default: 'white', type: 'color', is: 'uniform'}
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
    'uniform float borderEnabled;',
    'varying float vDistanceToCenter;',
    'varying float vDistance;',
    'varying vec3 vWorldPosition;',
    'void main() {',
      'vec3 direction = normalize(vWorldPosition - cameraPosition);',
      'vec2 sampleUV;',
      'float borderThickness = clamp(exp(-vDistance / 50.0), 0.6, 0.95);',
      'sampleUV.y = saturate(direction.y * 0.5  + 0.5);',
      'sampleUV.x = atan(direction.z, -direction.x) * -RECIPROCAL_PI2 + 0.5;',
      'if (vDistanceToCenter > borderThickness && borderEnabled == 1.0) {',
        'gl_FragColor = vec4(strokeColor, 1.0);',
      '} else {',
        'gl_FragColor = mix(texture2D(pano, sampleUV), vec4(0.93, 0.17, 0.36, 1.0), clamp(pow((vDistance / 15.0), 2.0), 0.0, 1.0));',
      '}',
    '}'
  ].join('\n')
});
/* eslint-enable */
