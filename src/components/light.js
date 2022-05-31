var bind = require('../utils/bind');
var utils = require('../utils');
var diff = utils.diff;
var debug = require('../utils/debug');
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var mathUtils = require('../utils/math');

var degToRad = THREE.MathUtils.degToRad;
var warn = debug('components:light:warn');
var CubeLoader = new THREE.CubeTextureLoader();

var probeCache = {};

/**
 * Light component.
 */
module.exports.Component = registerComponent('light', {
  schema: {
    angle: {default: 60, if: {type: ['spot']}},
    color: {type: 'color', if: {type: ['ambient', 'directional', 'hemisphere', 'point', 'spot']}},
    envMap: {default: '', if: {type: ['probe']}},
    groundColor: {type: 'color', if: {type: ['hemisphere']}},
    decay: {default: 1, if: {type: ['point', 'spot']}},
    distance: {default: 0.0, min: 0, if: {type: ['point', 'spot']}},
    intensity: {default: 1.0, min: 0, if: {type: ['ambient', 'directional', 'hemisphere', 'point', 'spot', 'probe']}},
    penumbra: {default: 0, min: 0, max: 1, if: {type: ['spot']}},
    type: {
      default: 'directional',
      oneOf: ['ambient', 'directional', 'hemisphere', 'point', 'spot', 'probe'],
      schemaChange: true
    },
    target: {type: 'selector', if: {type: ['spot', 'directional']}},

    // Shadows.
    castShadow: {default: false, if: {type: ['point', 'spot', 'directional']}},
    shadowBias: {default: 0, if: {castShadow: true}},
    shadowCameraFar: {default: 500, if: {castShadow: true}},
    shadowCameraFov: {default: 90, if: {castShadow: true}},
    shadowCameraNear: {default: 0.5, if: {castShadow: true}},
    shadowCameraTop: {default: 5, if: {castShadow: true}},
    shadowCameraRight: {default: 5, if: {castShadow: true}},
    shadowCameraBottom: {default: -5, if: {castShadow: true}},
    shadowCameraLeft: {default: -5, if: {castShadow: true}},
    shadowCameraVisible: {default: false, if: {castShadow: true}},
    shadowCameraAutomatic: {default: '', if: {type: ['directional']}},
    shadowMapHeight: {default: 512, if: {castShadow: true}},
    shadowMapWidth: {default: 512, if: {castShadow: true}},
    shadowRadius: {default: 1, if: {castShadow: true}}
  },

  /**
   * Notifies scene a light has been added to remove default lighting.
   */
  init: function () {
    var el = this.el;
    this.light = null;
    this.defaultTarget = null;
    this.rendererSystem = this.el.sceneEl.systems.renderer;
    this.system.registerLight(el);
  },

  /**
   * (Re)create or update light.
   */
  update: function (oldData) {
    var data = this.data;
    var diffData = diff(data, oldData);
    var light = this.light;
    var rendererSystem = this.rendererSystem;
    var self = this;

    // Existing light.
    if (light && !('type' in diffData)) {
      var shadowsLoaded = false;
      // Light type has not changed. Update light.
      Object.keys(diffData).forEach(function (key) {
        var value = data[key];

        switch (key) {
          case 'color': {
            light.color.set(value);
            rendererSystem.applyColorCorrection(light.color);
            break;
          }

          case 'groundColor': {
            light.groundColor.set(value);
            rendererSystem.applyColorCorrection(light.groundColor);
            break;
          }

          case 'angle': {
            light.angle = degToRad(value);
            break;
          }

          case 'target': {
            // Reset target if selector is null.
            if (value === null) {
              if (data.type === 'spot' || data.type === 'directional') {
                light.target = self.defaultTarget;
              }
            } else {
              // Target specified, set target to entity's `object3D` when it is loaded.
              if (value.hasLoaded) {
                self.onSetTarget(value, light);
              } else {
                value.addEventListener('loaded', bind(self.onSetTarget, self, value, light));
              }
            }
            break;
          }

          case 'envMap':
            self.updateProbeMap(data, light);
            break;

          case 'castShadow':
          case 'shadowBias':
          case 'shadowCameraFar':
          case 'shadowCameraFov':
          case 'shadowCameraNear':
          case 'shadowCameraTop':
          case 'shadowCameraRight':
          case 'shadowCameraBottom':
          case 'shadowCameraLeft':
          case 'shadowCameraVisible':
          case 'shadowMapHeight':
          case 'shadowMapWidth':
          case 'shadowRadius':
            if (!shadowsLoaded) {
              self.updateShadow();
              shadowsLoaded = true;
            }
            break;

          case 'shadowCameraAutomatic':
            if (data.shadowCameraAutomatic) {
              self.shadowCameraAutomaticEls = Array.from(document.querySelectorAll(data.shadowCameraAutomatic));
            } else {
              self.shadowCameraAutomaticEls = [];
            }
            break;

          default: {
            light[key] = value;
          }
        }
      });
      return;
    }

    // No light yet or light type has changed. Create and add light.
    this.setLight(this.data);
    this.updateShadow();
  },

  tick: (function () {
    var bbox = new THREE.Box3();
    var normal = new THREE.Vector3();
    var cameraWorldPosition = new THREE.Vector3();
    var tempMat = new THREE.Matrix4();
    var sphere = new THREE.Sphere();
    var tempVector = new THREE.Vector3();

    return function () {
      if (!(
        this.data.type === 'directional' &&
        this.light.shadow &&
        this.light.shadow.camera instanceof THREE.OrthographicCamera &&
        this.shadowCameraAutomaticEls.length
      )) return;

      var camera = this.light.shadow.camera;
      camera.getWorldDirection(normal);
      camera.getWorldPosition(cameraWorldPosition);
      tempMat.copy(camera.matrixWorld);
      tempMat.invert();

      camera.near = 1;
      camera.left = 100000;
      camera.right = -100000;
      camera.top = -100000;
      camera.bottom = 100000;
      this.shadowCameraAutomaticEls.forEach(function (el) {
        bbox.setFromObject(el.object3D);
        bbox.getBoundingSphere(sphere);
        var distanceToPlane = mathUtils.distanceOfPointFromPlane(cameraWorldPosition, normal, sphere.center);
        var pointOnCameraPlane = mathUtils.nearestPointInPlane(cameraWorldPosition, normal, sphere.center, tempVector);

        var pointInXYPlane = pointOnCameraPlane.applyMatrix4(tempMat);
        camera.near = Math.min(-distanceToPlane - sphere.radius - 1, camera.near);
        camera.left = Math.min(-sphere.radius + pointInXYPlane.x, camera.left);
        camera.right = Math.max(sphere.radius + pointInXYPlane.x, camera.right);
        camera.top = Math.max(sphere.radius + pointInXYPlane.y, camera.top);
        camera.bottom = Math.min(-sphere.radius + pointInXYPlane.y, camera.bottom);
      });
      camera.updateProjectionMatrix();
    };
  }()),

  setLight: function (data) {
    var el = this.el;
    var newLight = this.getLight(data);
    if (newLight) {
      if (this.light) {
        el.removeObject3D('light');
      }

      this.light = newLight;
      this.light.el = el;
      el.setObject3D('light', this.light);

      // HACK solution for issue #1624
      if (data.type === 'spot' || data.type === 'directional' || data.type === 'hemisphere') {
        el.getObject3D('light').translateY(-1);
      }

      // set and position default lighttarget as a child to enable spotlight orientation
      if (data.type === 'spot') {
        el.setObject3D('light-target', this.defaultTarget);
        el.getObject3D('light-target').position.set(0, 0, -1);
      }

      if (data.shadowCameraAutomatic) {
        this.shadowCameraAutomaticEls = Array.from(document.querySelectorAll(data.shadowCameraAutomatic));
      } else {
        this.shadowCameraAutomaticEls = [];
      }
    }
  },

  /**
   * Updates shadow-related properties on the current light.
   */
  updateShadow: function () {
    var el = this.el;
    var data = this.data;
    var light = this.light;

    light.castShadow = data.castShadow;

    // Shadow camera helper.
    var cameraHelper = el.getObject3D('cameraHelper');
    if (data.shadowCameraVisible && !cameraHelper) {
      el.setObject3D('cameraHelper', new THREE.CameraHelper(light.shadow.camera));
    } else if (!data.shadowCameraVisible && cameraHelper) {
      el.removeObject3D('cameraHelper');
    }

    if (!data.castShadow) { return light; }

    // Shadow appearance.
    light.shadow.bias = data.shadowBias;
    light.shadow.radius = data.shadowRadius;
    light.shadow.mapSize.height = data.shadowMapHeight;
    light.shadow.mapSize.width = data.shadowMapWidth;

    // Shadow camera.
    light.shadow.camera.near = data.shadowCameraNear;
    light.shadow.camera.far = data.shadowCameraFar;
    if (light.shadow.camera instanceof THREE.OrthographicCamera) {
      light.shadow.camera.top = data.shadowCameraTop;
      light.shadow.camera.right = data.shadowCameraRight;
      light.shadow.camera.bottom = data.shadowCameraBottom;
      light.shadow.camera.left = data.shadowCameraLeft;
    } else {
      light.shadow.camera.fov = data.shadowCameraFov;
    }
    light.shadow.camera.updateProjectionMatrix();

    if (cameraHelper) { cameraHelper.update(); }
  },

  /**
   * Creates a new three.js light object given data object defining the light.
   *
   * @param {object} data
   */
  getLight: function (data) {
    var angle = data.angle;
    var color = new THREE.Color(data.color);
    this.rendererSystem.applyColorCorrection(color);
    color = color.getHex();
    var decay = data.decay;
    var distance = data.distance;
    var groundColor = new THREE.Color(data.groundColor);
    this.rendererSystem.applyColorCorrection(groundColor);
    groundColor = groundColor.getHex();
    var intensity = data.intensity;
    var type = data.type;
    var target = data.target;
    var light = null;

    switch (type.toLowerCase()) {
      case 'ambient': {
        return new THREE.AmbientLight(color, intensity);
      }

      case 'directional': {
        light = new THREE.DirectionalLight(color, intensity);
        this.defaultTarget = light.target;
        if (target) {
          if (target.hasLoaded) {
            this.onSetTarget(target, light);
          } else {
            target.addEventListener('loaded', bind(this.onSetTarget, this, target, light));
          }
        }
        return light;
      }

      case 'hemisphere': {
        return new THREE.HemisphereLight(color, groundColor, intensity);
      }

      case 'point': {
        return new THREE.PointLight(color, intensity, distance, decay);
      }

      case 'spot': {
        light = new THREE.SpotLight(color, intensity, distance, degToRad(angle), data.penumbra, decay);
        this.defaultTarget = light.target;
        if (target) {
          if (target.hasLoaded) {
            this.onSetTarget(target, light);
          } else {
            target.addEventListener('loaded', bind(this.onSetTarget, this, target, light));
          }
        }
        return light;
      }

      case 'probe': {
        light = new THREE.LightProbe();
        this.updateProbeMap(data, light);
        return light;
      }

      default: {
        warn('%s is not a valid light type. ' +
           'Choose from ambient, directional, hemisphere, point, spot.', type);
      }
    }
  },

  /**
   * Generate the spherical harmonics for the LightProbe from a cube map
   */
  updateProbeMap: function (data, light) {
    if (!data.envMap) {
      // reset parameters if no map
      light.copy(new THREE.LightProbe());
    }

    if (probeCache[data.envMap] instanceof window.Promise) {
      probeCache[data.envMap].then(function (tempLightProbe) {
        light.copy(tempLightProbe);
      });
    }
    if (probeCache[data.envMap] instanceof THREE.LightProbe) {
      light.copy(probeCache[data.envMap]);
    }
    probeCache[data.envMap] = new window.Promise(function (resolve) {
      utils.srcLoader.validateCubemapSrc(data.envMap, function loadEnvMap (urls) {
        CubeLoader.load(urls, function (cube) {
          var tempLightProbe = THREE.LightProbeGenerator.fromCubeTexture(cube);
          probeCache[data.envMap] = tempLightProbe;
          light.copy(tempLightProbe);
        });
      });
    });
  },

  onSetTarget: function (targetEl, light) {
    light.target = targetEl.object3D;
  },

  /**
   * Remove light on remove (callback).
   */
  remove: function () {
    var el = this.el;
    el.removeObject3D('light');
    if (el.getObject3D('cameraHelper')) {
      el.removeObject3D('cameraHelper');
    }
  }
});
