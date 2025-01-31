/**
 * Unreal Bloom Effect
 * Implementation for A-Frame
 * Code modified from Akbartus's UnrealBloomPass.js
 * https://github.com/akbartus/A-Frame-Component-Postprocessing
 */

import AFRAME from "aframe";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

/////////////////////////////////////
// A-FRAME COMPONENT: BLOOM        //
/////////////////////////////////////
AFRAME.registerComponent("bloom", {
  schema: {
    threshold: { type: "number", default: 0 },
    strength: { type: "number", default: 0.4 },
    radius: { type: "number", default: 0 },
  },
  init: function () {
    this.bind();
  },
  update: function (oldData) {
    this.evaluateEffect();
  },
  evaluateEffect: function () {
    this.scene = this.el.object3D;
    this.renderer = this.el.renderer;
    this.camera = this.el.camera;
    this.composer = new EffectComposer(this.renderer);
    const renderScene = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderScene);

    // creating bloom pass    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(
        this.renderer.domElement.clientWidth,
        this.renderer.domElement.clientHeight
      ),
      1.5,
      0.4,
      0.85
    );

    bloomPass.fsQuad.render = function (renderer) {
      // Disable XR projection for fullscreen effects
      // https://github.com/mrdoob/three.js/pull/18846
      const xrEnabled = renderer.xr.enabled;
      const _camera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
      renderer.xr.enabled = false;
      renderer.render(this._mesh, _camera);
      renderer.xr.enabled = xrEnabled;
    }

    bloomPass.threshold = this.data.threshold;
    bloomPass.strength = this.data.strength;
    bloomPass.radius = this.data.radius;
    this.composer.addPass(bloomPass);
  },

  bind: function () {
    const render = this.el.renderer.render;
    const self = this;
    let isInsideComposerRender = false;

    this.el.renderer.render = function () {

      if (isInsideComposerRender) {
        render.apply(this, arguments);
      } else {
        isInsideComposerRender = true;
        self.composer.render(self.el.sceneEl.delta / 1000);
        isInsideComposerRender = false;
      }

    };
  },
});
