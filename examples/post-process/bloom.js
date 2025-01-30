/**
 * Unreal Bloom Effect
 * Implementation for A-Frame
 * Code modified from Akbartus's UnrealBloomPass.js
 * https://github.com/akbartus/A-Frame-Component-Postprocessing
 */

import AFRAME from "aframe";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"; // This uses the same three instance.
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"; // This uses the same three instance.
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js"; // This uses the same three instance.

/////////////////////////////////////
// A-FRAME COMPONENT: POST-PROCESSING //
/////////////////////////////////////
AFRAME.registerComponent("bloom", {
  schema: {
    threshold: {
      type: "number",
      default: 0,
    },
    strength: {
      type: "number",
      default: 0.4,
    },
    radius: {
      type: "number",
      default: 0,
    },
    exposure: {
      type: "number",
      default: 1,
    },
  },
  init: function () {

    this.scene = this.el.object3D;
    this.renderer = this.el.renderer;
    this.camera = this.el.camera;
    this.bound = false;

    var that = this;

    // delay half second to get the right resolution
    setTimeout(function () {
      that.evaluateEffect();
      that.bind();
    }, 500);
  },
  update: function (oldData) {
    console.log("Post-processing UPDATE effect");
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

    bloomPass.threshold = this.data.threshold;
    bloomPass.strength = this.data.strength;
    bloomPass.radius = this.data.radius;
    this.composer.addPass(bloomPass);
  },
  bind: function () {
    const render = this.renderer.render;
    const system = this;
    let isDigest = false;

    this.renderer.render = function () {

      if (isDigest) {
        render.apply(this, arguments);
      } else {
        isDigest = true;
        if (system.occlusionComposer) {
          system.occlusionComposer.render(system.dt);
        } else {
          system.composer.render(system.dt);
        }
        isDigest = false;
      }

    };

  },
});
