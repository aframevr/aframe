var createTextGeometry = require('three-bmfont-text');
var loadBMFont = require('load-bmfont');
var path = require('path');
var createBasic = require('three-bmfont-text/shaders/basic');
var createMSDF = require('three-bmfont-text/shaders/msdf');
var createSDF = require('three-bmfont-text/shaders/sdf');

var registerComponent = require('../core/component').registerComponent;
var coreShader = require('../core/shader');
var THREE = require('../lib/three');
var utils = require('../utils/');

var shaders = coreShader.shaders;
var warn = utils.debug('components:text:warn');

// 1 to match other A-Frame default widths.
var DEFAULT_WIDTH = 1;

// @bryik set anisotropy to 16. Improves look of large amounts of text when viewed from angle.
var MAX_ANISOTROPY = 16;

var FONT_BASE_URL = 'https://cdn.aframe.io/fonts/';
var FONTS = {
  aileronsemibold: FONT_BASE_URL + 'Aileron-Semibold.fnt',
  default: FONT_BASE_URL + 'DejaVu-sdf.fnt',
  dejavu: FONT_BASE_URL + 'DejaVu-sdf.fnt',
  exo2bold: FONT_BASE_URL + 'Exo2Bold.fnt',
  exo2semibold: FONT_BASE_URL + 'Exo2SemiBold.fnt',
  kelsonsans: FONT_BASE_URL + 'KelsonSans.fnt',
  monoid: FONT_BASE_URL + 'Monoid.fnt',
  mozillavr: FONT_BASE_URL + 'mozillavr.fnt',
  sourcecodepro: FONT_BASE_URL + 'SourceCodePro.fnt'
};

var cache = new PromiseCache();
var fontWidthFactors = {};

/**
 * SDF-based text component.
 * Based on https://github.com/Jam3/three-bmfont-text.
 *
 * Comes with several shaders:
 *   All the stock fonts are for `sdf` and `modifiedsdf`. We added `modifiedsdf` shader to
 *   improve jam3's original `sdf` shader. `msdf` and `basic` are available for the fonts that
 *   use those.
 */
module.exports.Component = registerComponent('text', {
  multiple: true,

  schema: {
    align: {type: 'string', default: 'left', oneOf: ['left', 'right', 'center']},
    alphaTest: {default: 0.5},
    // `anchor` defaults to center to match geometries.
    anchor: {default: 'center', oneOf: ['left', 'right', 'center', 'align']},
    baseline: {default: 'center', oneOf: ['top', 'center', 'bottom']},
    color: {type: 'color', default: '#FFF'},
    font: {type: 'string', default: 'default'},
    // `fontImage` defaults to the font name as a .png (e.g., mozillavr.fnt -> mozillavr.png).
    fontImage: {type: 'string'},
    // `height` has no default, will be populated at layout.
    height: {type: 'number'},
    letterSpacing: {type: 'number', default: 0},
    // `lineHeight` defaults to font's `lineHeight` value.
    lineHeight: {type: 'number'},
    opacity: {type: 'number', default: '1.0'},
    shader: {default: 'modifiedsdf', oneOf: ['modifiedsdf', 'sdf', 'basic', 'msdf']},
    side: {default: 'front', oneOf: ['front', 'back', 'double']},
    tabSize: {default: 4},
    transparent: {default: true},
    value: {type: 'string'},
    whiteSpace: {default: 'normal', oneOf: ['normal', 'pre', 'nowrap']},
    // `width` defaults to geometry width if present, else `DEFAULT_WIDTH`.
    width: {type: 'number'},
    // `wrapCount` units are about one default font character. Wrap roughly at this number.
    wrapCount: {type: 'number', default: 40},
    // `wrapPixels` will wrap using bmfont pixel units (e.g., dejavu's is 32 pixels).
    wrapPixels: {type: 'number'}
  },

  init: function () {
    this.texture = new THREE.Texture();
    this.texture.anisotropy = MAX_ANISOTROPY;

    this.geometry = createTextGeometry();

    this.createOrUpdateMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.el.setObject3D('text', this.mesh);
  },

  update: function (oldData) {
    var data = coerceData(this.data);
    var font = this.currentFont;

    // Update material.
    if (Object.keys(oldData).length) {
      this.createOrUpdateMaterial(oldData && {shader: oldData.shader});
    }

    // New font. `updateFont` will later change data and layout.
    if (oldData.font !== data.font) {
      this.updateFont();
      return;
    }

    // Update geometry and layout.
    if (font) {
      this.geometry.update(utils.extend({}, data, {
        font: font,
        lineHeight: data.lineHeight || font.common.lineHeight,
        text: data.value,
        width: data.wrapPixels || ((0.5 + data.wrapCount) * font.widthFactor)
      }));
      this.updateLayout(data);
    }
  },

  /**
   * Clean up geometry, material, texture, mesh, objects.
   */
  remove: function () {
    this.geometry.dispose();
    this.geometry = null;
    this.el.removeObject3D('text');
    this.material.dispose();
    this.material = null;
    this.texture.dispose();
    this.texture = null;
    if (this.shaderObject) {
      delete this.shaderObject;
    }
  },

  /**
   * Update the shader of the material.
   *
   * @param {object} oldShader - Object describing the previous properties of the shader.
   *   Currently only contains the shader name, but other properties could be introduced
   *   in order to provide heuristics to select the most appropriate type of shader based
   *   on the text component properties.
   */
  createOrUpdateMaterial: function (oldShader) {
    var data = this.data;
    var hasChangedShader;
    var ModifiedSDFShader;
    var material = this.material;
    var shaderData;

    hasChangedShader = (oldShader && oldShader.shader) !== data.shader;
    shaderData = {
      alphaTest: data.alphaTest,
      color: data.color,
      map: this.texture,
      opacity: data.opacity,
      side: parseSide(data.side),
      transparent: data.transparent
    };

    // Shader has not changed, do an update.
    if (!hasChangedShader) {
      if (data.shader === 'modifiedsdf') {
        // Update modifiedsdf shader material.
        this.shaderObject.update(shaderData);
        // Apparently, was not set on `init` nor `update`.
        material.transparent = shaderData.transparent;
      } else {
        // Update other shader materials.
        material.uniforms.opacity.value = data.opacity;
        material.uniforms.color.value.set(data.color);
        material.uniforms.map.value = this.texture;
      }
      updateBaseMaterial(material, shaderData);
      return;
    }

    // Shader has changed. Create a shader material.
    if (data.shader === 'modifiedsdf') {
      ModifiedSDFShader = createModifiedSDFShader(this.el, shaderData);
      this.material = ModifiedSDFShader.material;
      this.shaderObject = ModifiedSDFShader.shader;
    } else if (data.shader === 'sdf') {
      this.material = new THREE.RawShaderMaterial(createSDF(shaderData));
    } else if (data.shader === 'msdf') {
      this.material = new THREE.RawShaderMaterial(createMSDF(shaderData));
    } else {
      this.material = new THREE.RawShaderMaterial(createBasic(shaderData));
    }

    // Set new shader material.
    updateBaseMaterial(this.material, shaderData);
    if (this.mesh) { this.mesh.material = this.material; }
  },

  /**
   * Fetch and apply font.
   */
  updateFont: function () {
    var fontSrc;
    var geometry = this.geometry;
    var self = this;

    if (!this.data.font) {
      warn('No font specified for `text`. Using the default font.');
    }
    this.mesh.visible = false;

    // Look up font URL to use, and perform cached load.
    fontSrc = lookupFont(this.data.font || 'default');
    cache.get(fontSrc, function () { return loadFont(fontSrc); }).then(function (font) {
      var fontImgSrc;

      if (font.pages.length !== 1) {
        throw new Error('Currently only single-page bitmap fonts are supported.');
      }

      if (!fontWidthFactors[fontSrc]) {
        // Compute default font width factor to use.
        var sum = 0;
        var digitsum = 0;
        var digits = 0;
        font.chars.map(function (ch) {
          sum += ch.xadvance;
          if (ch.id >= 48 && ch.id <= 57) {
            digits++;
            digitsum += ch.xadvance;
          }
        });
        font.widthFactor = fontWidthFactors[font] = digits ? digitsum / digits : sum / font.chars.length;
      }

      // Update geometry given font metrics.
      var data = coerceData(self.data);
      var textRenderWidth = data.wrapPixels || ((0.5 + data.wrapCount) * font.widthFactor);
      var options = utils.extend({}, data, {
        text: data.value,
        font: font,
        width: textRenderWidth,
        lineHeight: data.lineHeight || font.common.lineHeight
      });
      var object3D;
      geometry.update(options);
      self.mesh.geometry = geometry;

      // Add mesh if not already there.
      object3D = self.el.object3D;
      if (object3D.children.indexOf(self.mesh) === -1) {
        object3D.add(self.mesh);
      }

      // Look up font image URL to use, and perform cached load.
      fontImgSrc = self.data.fontImage || fontSrc.replace('.fnt', '.png') ||
                   path.dirname(data.font) + '/' + font.pages[0];
      cache.get(fontImgSrc, function () {
        return loadTexture(fontImgSrc);
      }).then(function (image) {
        // Make mesh visible and apply font image as texture.
        self.mesh.visible = true;
        if (!image) { return; }
        self.texture.image = image;
        self.texture.needsUpdate = true;
      }).catch(function () {
        console.error('Could not load font texture "' + fontImgSrc +
          '"\nMake sure it is correctly defined in the bitmap .fnt file.');
      });

      self.currentFont = font;
      self.updateLayout(data);
    }).catch(function (error) {
      throw new Error('Error loading font ' + self.data.font +
          '\nMake sure the path is correct and that it points' +
          ' to a valid BMFont file (xml, json, fnt).\n' + error.message);
    });
  },

  updateLayout: function (data) {
    var el = this.el;
    var font = this.currentFont;
    var geometry = this.geometry;
    var layout = geometry.layout;
    var elGeo = el.getAttribute('geometry');
    var width;
    var textRenderWidth;
    var textScale;
    var height;
    var x;
    var y;
    var anchor;
    var baseline;

    // Determine width to use.
    width = data.width || (elGeo && elGeo.width) || DEFAULT_WIDTH;
    // Determine wrap pixel count, either as specified or by experimentally determined fudge factor.
    // (Note that experimentally determined factor will never be correct for variable width fonts.)
    textRenderWidth = data.wrapPixels || ((0.5 + data.wrapCount) * font.widthFactor);
    textScale = width / textRenderWidth;
    // Determine height to use.
    height = textScale * (geometry.layout.height + geometry.layout.descender);

    // update geometry dimensions to match layout, if not specified
    if (elGeo) {
      if (!elGeo.width) { el.setAttribute('geometry', 'width', width); }
      if (!elGeo.height) { el.setAttribute('geometry', 'height', height); }
    }

    // anchors text left/center/right
    anchor = data.anchor === 'align' ? data.align : data.anchor;
    if (anchor === 'left') {
      x = 0;
    } else if (anchor === 'right') {
      x = -layout.width;
    } else if (anchor === 'center') {
      x = -layout.width / 2;
    } else {
      throw new TypeError('invalid anchor ' + anchor);
    }

    // anchors text to top/center/bottom
    baseline = data.baseline;
    if (baseline === 'bottom') {
      y = 0;
    } else if (baseline === 'top') {
      y = -layout.height + layout.ascender;
    } else if (baseline === 'center') {
      y = -layout.height / 2;
    } else {
      throw new TypeError('invalid baseline ' + baseline);
    }

    // Position and scale mesh.
    this.mesh.position.x = x * textScale;
    this.mesh.position.y = y * textScale;
    this.mesh.position.z = 0.001; // put text slightly in front in case there is a plane or other geometry
    this.mesh.scale.set(textScale, -textScale, textScale);
    this.geometry.computeBoundingSphere();
  }
});

function registerFont (key, url) {
  FONTS[key] = url;
}
module.exports.registerFont = registerFont;

function unregisterFont (key) {
  delete FONTS[key];
}
module.exports.unregisterFont = unregisterFont;

function lookupFont (keyOrUrl) {
  return FONTS[keyOrUrl] || keyOrUrl;
}

function parseSide (side) {
  switch (side) {
    case 'back': {
      return THREE.BackSide;
    }
    case 'double': {
      return THREE.DoubleSide;
    }
    default: {
      return THREE.FrontSide;
    }
  }
}

function coerceData (data) {
  // We have to coerce some data to numbers/booleans,
  // as they will be passed directly into text creation and update
  data = utils.clone(data);
  if (data.lineHeight !== undefined) {
    data.lineHeight = parseFloat(data.lineHeight);
    if (!isFinite(data.lineHeight)) { data.lineHeight = undefined; }
  }
  if (data.width !== undefined) {
    data.width = parseFloat(data.width);
    if (!isFinite(data.width)) { data.width = undefined; }
  }
  return data;
}

/**
 * @returns {Promise}
 */
function loadFont (src) {
  return new Promise(function (resolve, reject) {
    loadBMFont(src, function (err, font) {
      if (err) {
        reject(err);
        return;
      }
      resolve(font);
    });
  });
}

/**
 * @returns {Promise}
 */
function loadTexture (src) {
  return new Promise(function (resolve, reject) {
    new THREE.ImageLoader().load(src, function (image) {
      resolve(image);
    }, undefined, function () {
      reject(null);
    });
  });
}

function createModifiedSDFShader (el, data) {
  var shader;
  var shaderObject;

  // Set up Shader.
  shaderObject = new shaders.modifiedsdf.Shader();
  shaderObject.el = el;
  shaderObject.init(data);
  shaderObject.update(data);

  // Get material.
  shader = shaderObject.material;
  // Apparently, was not set on `init` nor `update`.
  shader.transparent = data.transparent;

  return {
    material: shader,
    shader: shaderObject
  };
}

/**
 * @todo Add more supported material properties (e.g., `visible`).
 */
function updateBaseMaterial (material, data) {
  material.side = data.side;
}

/**
 * Get or create a promise given a key and promise generator.
 * @todo Move to a utility and use in other parts of A-Frame.
 */
function PromiseCache () {
  var cache = this.cache = {};

  this.get = function (key, promiseGenerator) {
    if (key in cache) {
      return cache[key];
    }
    cache[key] = promiseGenerator();
    return cache[key];
  };
}
