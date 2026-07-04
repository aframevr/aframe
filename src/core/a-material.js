/* global customElements */
import { ANode } from './a-node.js';
import { components } from './component.js';
import { shaders } from './shader.js';
import { parseProperty } from './schema.js';
import * as utils from '../utils/index.js';

var warn = utils.debug('core:a-material:warn');

/**
 * Material asset element (`<a-material>`), defined within `<a-assets>`.
 *
 * Creates a THREE.Material from a shader (e.g., standard, flat) and per-attribute
 * properties during scene loading so it can be shared across entities via the
 * `material` property type (e.g., `material="material: #myMaterial"`).
 *
 * Properties are set as individual HTML attributes following the material component
 * base schema and the schema of the selected shader:
 *
 *   <a-material id="wood" shader="standard" src="#woodTexture" roughness="0.8"></a-material>
 *
 * @member {object} material - Underlying THREE.Material, created lazily.
 * @member {object} shader - A-Frame shader instance backing the material.
 * @member {object} data - Parsed property data (base material + shader schema).
 */
class AMaterial extends ANode {
  constructor () {
    super();
    this.isMaterialAsset = true;
    this.material = null;
    this.shader = null;
    this.data = null;
    this.schema = null;
    this.attrNameMap = null;
    this.shaderUpdated = false;
  }

  doConnectedCallback () {
    super.doConnectedCallback();

    if (!this.parentNode || !this.parentNode.isAssets) {
      warn('<a-material> should be a child of <a-assets>.');
    }

    this.getMaterial();

    // Texture loading was deferred if the material was created while detached.
    if (!this.shaderUpdated) {
      this.shader.update(this.data);
      this.shaderUpdated = true;
    }

    if (this.sceneEl && this.sceneEl.systems.material) {
      this.sceneEl.systems.material.registerMaterial(this.material);
    }

    this.loadWhenTexturesLoaded();
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    if (!this.material) { return; }
    if (this.sceneEl && this.sceneEl.systems && this.sceneEl.systems.material) {
      utils.material.disposeMaterial(this.material, this.sceneEl.systems.material);
    } else {
      this.material.dispose();
    }
    this.material = null;
    this.shader = null;
    this.shaderUpdated = false;
  }

  attributeChangedCallback (attr, oldVal, newVal) {
    var key;
    super.attributeChangedCallback(attr, oldVal, newVal);

    if (!this.material) { return; }
    key = this.attrNameMap[attr.toLowerCase()];
    if (!key) { return; }
    if (key === 'shader') {
      warn('Cannot change the shader of <a-material> after creation.');
      return;
    }

    this.data[key] = parseProperty(newVal === null ? undefined : newVal, this.schema[key]);
    this.shader.update(this.data);
    utils.material.updateBaseMaterial(this.material, this.data);
    if (key === 'alphaTest' || key === 'side' || key === 'vertexColorsEnabled') {
      this.material.needsUpdate = true;
    }
  }

  /**
   * Return the THREE.Material, creating it if it does not exist yet.
   *
   * @returns {object} THREE.Material
   */
  getMaterial () {
    if (this.material) { return this.material; }
    this.initMaterial();
    return this.material;
  }

  /**
   * Create shader instance and THREE.Material from the element attributes.
   * Texture loading (shader update) is deferred if not attached to a scene yet,
   * as it requires the scene's material system.
   */
  initMaterial () {
    var data;
    var Shader;
    var shader;

    this.sceneEl = this.sceneEl || this.closestScene();
    data = this.data = this.buildData();

    Shader = shaders[data.shader].Shader;
    shader = this.shader = new Shader();
    shader.el = this;
    shader.init(data);
    this.material = shader.material;
    this.material.el = this;
    if (this.id) { this.material.name = this.id; }
    utils.material.updateBaseMaterial(this.material, data);

    if (this.sceneEl) {
      shader.update(data);
      this.shaderUpdated = true;
    }
  }

  /**
   * Parse element attributes against the combined base material + shader schema.
   * HTML attributes are lowercase, so schema keys are matched case-insensitively
   * (e.g., `metalnessmap` attribute maps to `metalnessMap`).
   *
   * @returns {object} Parsed data with defaults filled in.
   */
  buildData () {
    var attr;
    var attrNameMap = {};
    var data = {};
    var i;
    var key;
    var schema;
    var shaderName = window.HTMLElement.prototype.getAttribute.call(this, 'shader') || 'standard';

    if (!shaders[shaderName]) {
      warn('Unknown shader `' + shaderName + '` for <a-material>. Falling back to `standard`.');
      shaderName = 'standard';
    }

    schema = utils.extend({}, components.material.schema, shaders[shaderName].schema);
    // An <a-material> cannot reference another material asset.
    delete schema.material;

    for (key in schema) {
      attrNameMap[key.toLowerCase()] = key;
      data[key] = parseProperty(undefined, schema[key]);
    }

    for (i = 0; i < this.attributes.length; i++) {
      attr = this.attributes[i];
      key = attrNameMap[attr.name];
      if (!key) {
        if (attr.name !== 'id' && attr.name !== 'mixin') {
          warn('Unknown property `' + attr.name + '` for <a-material> with shader `' +
               shaderName + '`.');
        }
        continue;
      }
      data[key] = parseProperty(attr.value, schema[key]);
    }

    data.shader = shaderName;
    this.schema = schema;
    this.attrNameMap = attrNameMap;
    return data;
  }

  /**
   * Emit `loaded` once all textures referenced by the material have loaded,
   * so `<a-assets>` blocks scene rendering until the material is fully ready.
   */
  loadWhenTexturesLoaded () {
    var data = this.data;
    var key;
    var pending = 0;
    var schema = this.schema;
    var self = this;

    for (key in schema) {
      // `sphericalEnvMap` is deprecated and handled through the `envMap` path below.
      if (schema[key].type !== 'map' || key === 'sphericalEnvMap') { continue; }
      if (data[key]) { pending++; }
    }
    if (data.envMap || data.sphericalEnvMap) { pending++; }

    if (pending === 0) {
      this.load();
      return;
    }

    this.addEventListener('materialtextureloaded', function onTextureLoaded () {
      pending--;
      if (pending > 0) { return; }
      self.removeEventListener('materialtextureloaded', onTextureLoaded);
      self.load();
    });
  }
}

customElements.define('a-material', AMaterial);
