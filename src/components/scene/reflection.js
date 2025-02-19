/* global XRWebGLBinding */
import * as THREE from 'three';
import { registerComponent as register } from '../../core/component.js';

// source: view-source:https://storage.googleapis.com/chromium-webxr-test/r886480/proposals/lighting-estimation.html
function updateLights (estimate, probeLight, directionalLight, directionalLightPosition) {
  var intensityScalar =
    Math.max(estimate.primaryLightIntensity.x,
             Math.max(estimate.primaryLightIntensity.y,
                      estimate.primaryLightIntensity.z));

  probeLight.sh.fromArray(estimate.sphericalHarmonicsCoefficients);
  probeLight.intensity = 3.14;

  if (directionalLight) {
    directionalLight.color.setRGB(
      estimate.primaryLightIntensity.x / intensityScalar,
      estimate.primaryLightIntensity.y / intensityScalar,
      estimate.primaryLightIntensity.z / intensityScalar);

    directionalLight.intensity = intensityScalar;
    directionalLightPosition.copy(estimate.primaryLightDirection);
  }
}

export var Component = register('reflection', {
  schema: {
    directionalLight: { type: 'selector' }
  },
  sceneOnly: true,
  init: function () {
    var self = this;
    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(16);
    this.cubeCamera = new THREE.CubeCamera(0.1, 1000, this.cubeRenderTarget);
    this.lightingEstimationTexture = (new THREE.WebGLCubeRenderTarget(16)).texture;
    this.needsVREnvironmentUpdate = true;

    // Update WebXR to support light-estimation
    var webxrData = this.el.getAttribute('webxr');
    var optionalFeaturesArray = webxrData.optionalFeatures;
    if (!optionalFeaturesArray.includes('light-estimation')) {
      optionalFeaturesArray.push('light-estimation');
      this.el.setAttribute('webxr', webxrData);
    }

    this.el.addEventListener('enter-vr', function () {
      if (!self.el.is('ar-mode')) { return; }
      var renderer = self.el.renderer;
      var session = renderer.xr.getSession();
      if (session.requestLightProbe) {
        self.startLightProbe();
      }
    });

    this.el.addEventListener('exit-vr', function () {
      if (self.xrLightProbe) { self.stopLightProbe(); }
    });

    this.el.object3D.environment = this.cubeRenderTarget.texture;
  },
  stopLightProbe: function () {
    this.xrLightProbe = null;
    if (this.probeLight) {
      this.probeLight.components.light.light.intensity = 0;
    }
    this.needsVREnvironmentUpdate = true;
    this.el.object3D.environment = this.cubeRenderTarget.texture;
  },
  startLightProbe: function () {
    this.needsLightProbeUpdate = true;
  },
  setupLightProbe: function () {
    var renderer = this.el.renderer;
    var xrSession = renderer.xr.getSession();
    var self = this;
    var gl = renderer.getContext();

    if (!this.probeLight) {
      var probeLight = document.createElement('a-light');
      probeLight.setAttribute('type', 'probe');
      probeLight.setAttribute('intensity', 0);
      this.el.appendChild(probeLight);
      this.probeLight = probeLight;
    }

    // Ensure that we have any extensions needed to use the preferred cube map format.
    switch (xrSession.preferredReflectionFormat) {
      case 'srgba8':
        gl.getExtension('EXT_sRGB');
        break;

      case 'rgba16f':
        gl.getExtension('OES_texture_half_float');
        break;
    }

    this.glBinding = new XRWebGLBinding(xrSession, gl);
    gl.getExtension('EXT_sRGB');
    gl.getExtension('OES_texture_half_float');

    xrSession.requestLightProbe()
      .then(function (lightProbe) {
        self.xrLightProbe = lightProbe;
        lightProbe.addEventListener('reflectionchange', self.updateXRCubeMap.bind(self));
      })
      .catch(function (err) {
        console.warn('Lighting estimation not supported: ' + err.message);
        console.warn('Are you missing: webxr="optionalFeatures: light-estimation;" from <a-scene>?');
      });
  },
  updateXRCubeMap: function () {
    // Update Cube Map, cubeMap maybe some unavailable on some hardware
    var renderer = this.el.renderer;
    var cubeMap = this.glBinding.getReflectionCubeMap(this.xrLightProbe);
    if (cubeMap) {
      var rendererProps = renderer.properties.get(this.lightingEstimationTexture);
      rendererProps.__webglTexture = cubeMap;
      this.lightingEstimationTexture.needsPMREMUpdate = true;
      this.el.object3D.environment = this.lightingEstimationTexture;
    }
  },
  tick: function () {
    var scene = this.el.object3D;
    var renderer = this.el.renderer;
    var frame = this.el.frame;

    if (frame && this.xrLightProbe) {
      // light estimate may not yet be available, it takes a few frames to start working
      var estimate = frame.getLightEstimate(this.xrLightProbe);

      if (estimate) {
        updateLights(
          estimate,
          this.probeLight.components.light.light,
          this.data.directionalLight && this.data.directionalLight.components.light.light,
          this.data.directionalLight && this.data.directionalLight.object3D.position
        );
      }
    }

    if (this.needsVREnvironmentUpdate) {
      scene.environment = null;
      this.needsVREnvironmentUpdate = false;
      this.cubeCamera.position.set(0, 1.6, 0);
      this.cubeCamera.update(renderer, scene);
      scene.environment = this.cubeRenderTarget.texture;
    }

    if (this.needsLightProbeUpdate && frame) {
      // wait until the XR Session has started before trying to make
      // the light probe
      this.setupLightProbe();
      this.needsLightProbeUpdate = false;
    }
  },

  remove: function () {
    this.el.object3D.environment = null;
    if (this.probeLight) {
      this.el.removeChild(this.probeLight);
    }
  }
});
