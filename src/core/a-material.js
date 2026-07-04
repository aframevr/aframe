/* global customElements */
import { ANode } from './a-node.js';
import { components } from './component.js';
import { shaders } from './shader.js';
import { parseProperty } from './schema.js';
import { setInlineMaterialFactory } from './propertyTypes.js';
import * as styleParser from '../utils/styleParser.js';
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

    if (!this.isInlineMaterial && (!this.parentNode || !this.parentNode.isAssets)) {
      warn('<a-material> should be a child of <a-assets>.');
    }

    this.getMaterial();

    if (this.sceneEl && this.sceneEl.systems.material) {
      // Texture loading was deferred if the material was created before the scene
      // systems were available (e.g., on-demand creation by the property type parser).
      if (!this.shaderUpdated) {
        this.shader.update(this.data);
        this.shaderUpdated = true;
      }
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

    // Texture loading requires the scene's material system, which is not available
    // before the scene initialized its systems (e.g., when the material is created
    // on-demand by an early `material` property type parse). Deferred to
    // doConnectedCallback in that case.
    if (this.sceneEl && this.sceneEl.systems && this.sceneEl.systems.material) {
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

// Cache of <a-material> elements backing inline `material(...)` definitions, keyed by
// their properties string, so identical inline definitions share one material instance.
var inlineMaterialEls = {};

/**
 * Create (or reuse) a material from an inline `material(...)` definition used by the
 * `material` property type, e.g., `handMaterial: material(shader: flat; color: red)`.
 *
 * A detached <a-material> element backs the material. It is attached under the scene's
 * <a-assets> so textures load and updates flow through the normal element lifecycle.
 *
 * @param {string} propsString - Inner properties string (e.g., `shader: flat; color: red`).
 * @returns {object|null} THREE.Material or null on invalid input.
 */
setInlineMaterialFactory(function getOrCreateInlineMaterial (propsString) {
  var el = inlineMaterialEls[propsString];
  var key;
  var props;

  if (!el) {
    props = styleParser.parse(propsString);
    if (typeof props !== 'object') {
      warn('Invalid inline material value: material(' + propsString + ')');
      return null;
    }
    el = document.createElement('a-material');
    el.isInlineMaterial = true;
    el.inlineString = 'material(' + propsString + ')';
    for (key in props) { el.setAttribute(key, props[key]); }
    inlineMaterialEls[propsString] = el;
  }

  attachInlineMaterial(el);
  return el.getMaterial();
});

/**
 * Attach an inline material element to the scene so its textures can load.
 * No-op until a scene exists; retried on every parse of the same definition.
 */
function attachInlineMaterial (el) {
  var assetsEl;
  var sceneEl;

  if (el.isConnected) { return; }
  sceneEl = document.querySelector('a-scene');
  if (!sceneEl) { return; }

  assetsEl = sceneEl.querySelector('a-assets');
  if (assetsEl) {
    assetsEl.appendChild(el);
    return;
  }

  // No <a-assets>; wire the scene directly so textures can still load.
  el.sceneEl = sceneEl;
  el.getMaterial();
  if (!el.shaderUpdated && sceneEl.systems.material) {
    el.shader.update(el.data);
    el.shaderUpdated = true;
    sceneEl.systems.material.registerMaterial(el.material);
  }
}
