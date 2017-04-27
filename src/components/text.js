var createTextGeometry = require('three-bmfont-text');
var loadBMFont = require('load-bmfont');
var path = require('path');

var registerComponent = require('../core/component').registerComponent;
var coreShader = require('../core/shader');
var THREE = require('../lib/three');
var utils = require('../utils/');

var error = utils.debug('components:text:error');
var shaders = coreShader.shaders;
var warn = utils.debug('components:text:warn');

// 1 to match other A-Frame default widths.
var DEFAULT_WIDTH = 1;

// @bryik set anisotropy to 16. Improves look of large amounts of text when viewed from angle.
var MAX_ANISOTROPY = 16;

var FONT_BASE_URL = 'https://cdn.aframe.io/fonts/';
var FONTS = {
  aileronsemibold: FONT_BASE_URL + 'Aileron-Semibold.fnt',
  dejavu: FONT_BASE_URL + 'DejaVu-sdf.fnt',
  exo2bold: FONT_BASE_URL + 'Exo2Bold.fnt',
  exo2semibold: FONT_BASE_URL + 'Exo2SemiBold.fnt',
  kelsonsans: FONT_BASE_URL + 'KelsonSans.fnt',
  monoid: FONT_BASE_URL + 'Monoid.fnt',
  mozillavr: FONT_BASE_URL + 'mozillavr.fnt',
  roboto: FONT_BASE_URL + 'Roboto-msdf.json',
  sourcecodepro: FONT_BASE_URL + 'SourceCodePro.fnt'
};
var MSDF_FONTS = ['roboto'];
var DEFAULT_FONT = 'roboto';
module.exports.FONTS = FONTS;

var cache = new PromiseCache();
var fontWidthFactors = {};

/**
 * SDF-based text component.
 * Based on https://github.com/Jam3/three-bmfont-text.
 *
 * All the stock fonts are for the `sdf` registered shader, an improved version of jam3's
 * original `sdf` shader.
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
    font: {type: 'string', default: DEFAULT_FONT},
    // `fontImage` defaults to the font name as a .png (e.g., mozillavr.fnt -> mozillavr.png).
    fontImage: {type: 'string'},
    // `height` has no default, will be populated at layout.
    height: {type: 'number'},
    letterSpacing: {type: 'number', default: 0},
    // `lineHeight` defaults to font's `lineHeight` value.
    lineHeight: {type: 'number'},
    opacity: {type: 'number', default: 1.0},
    shader: {default: 'sdf', oneOf: shaders},
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
    wrapPixels: {type: 'number'},
    // `yOffset` to adjust generated fonts from tools that may have incorrect metrics.
    yOffset: {type: 'number', default: 0},
    // `zOffset` will provide a small z offset to avoid z-fighting.
    zOffset: {type: 'number', default: 0.001}
  },

  init: function () {
    this.texture = new THREE.Texture();
    this.texture.anisotropy = MAX_ANISOTROPY;

    this.geometry = createTextGeometry();

    this.createOrUpdateMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.el.setObject3D(this.attrName, this.mesh);
  },

  update: function (oldData) {
    var data = coerceData(this.data);
    var font = this.currentFont;

    // Update material.
    this.createOrUpdateMaterial();

    // New font. `updateFont` will later change data and layout.
    if (oldData.font !== data.font) {
      this.updateFont();
      return;
    }

    // Update geometry and layout.
    if (font) {
      updateGeometry(this.geometry, data, font);
      this.updateLayout(data);
    }
  },

  /**
   * Clean up geometry, material, texture, mesh, objects.
   */
  remove: function () {
    this.geometry.dispose();
    this.geometry = null;
    this.el.removeObject3D(this.attrName);
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
   */
  createOrUpdateMaterial: function () {
    var data = this.data;
    var hasChangedShader;
    var material = this.material;
    var NewShader;
    var shaderData;
    var shaderName;

    // Infer shader if using a stock font (or from `-msdf` filename convention).
    shaderName = data.shader;
    if (MSDF_FONTS.indexOf(data.font) !== -1 || data.font.indexOf('-msdf.') >= 0) {
      shaderName = 'msdf';
    } else if (data.font in FONTS && MSDF_FONTS.indexOf(data.font) === -1) {
      shaderName = 'sdf';
    }

    hasChangedShader = (this.shaderObject && this.shaderObject.name) !== shaderName;
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
      // Update shader material.
      this.shaderObject.update(shaderData);
      // Apparently, was not set on `init` nor `update`.
      material.transparent = shaderData.transparent;
      updateBaseMaterial(material, shaderData);
      return;
    }

    // Shader has changed. Create a shader material.
    NewShader = createShader(this.el, shaderName, shaderData);
    this.material = NewShader.material;
    this.shaderObject = NewShader.shader;

    // Set new shader material.
    updateBaseMaterial(this.material, shaderData);
    if (this.mesh) { this.mesh.material = this.material; }
  },

  /**
   * Load font for geometry, load font image for material, and apply.
   */
  updateFont: function () {
    var data = this.data;
    var el = this.el;
    var fontSrc;
    var geometry = this.geometry;
    var self = this;

    if (!data.font) { warn('No font specified. Using the default font.'); }

    // Make invisible during font swap.
    this.mesh.visible = false;

    // Look up font URL to use, and perform cached load.
    fontSrc = this.lookupFont(data.font || DEFAULT_FONT) || data.font;
    cache.get(fontSrc, function doLoadFont () {
      return loadFont(fontSrc, data.yOffset);
    }).then(function setFont (font) {
      var coercedData;
      var fontImgSrc;

      if (font.pages.length !== 1) {
        throw new Error('Currently only single-page bitmap fonts are supported.');
      }

      if (!fontWidthFactors[fontSrc]) {
        font.widthFactor = fontWidthFactors[font] = computeFontWidthFactor(font);
      }

      // Update geometry given font metrics.
      coercedData = coerceData(data);
      updateGeometry(geometry, data, font);

      // Set font and update layout.
      self.currentFont = font;
      self.updateLayout(coercedData);

      // Look up font image URL to use, and perform cached load.
      fontImgSrc = data.fontImage || fontSrc.replace(/(\.fnt)|(\.json)/, '.png') ||
                   path.dirname(data.font) + '/' + font.pages[0];
      cache.get(fontImgSrc, function () {
        return loadTexture(fontImgSrc);
      }).then(function (image) {
        // Make mesh visible and apply font image as texture.
        self.mesh.visible = true;
        self.texture.image = image;
        self.texture.needsUpdate = true;
        el.emit('textfontset', {font: data.font, fontObj: font});
      }).catch(function (err) {
        error(err);
        throw err;
      });
    }).catch(function (err) {
      error(err);
      throw err;
    });
  },

  /**
   * Update layout with anchor, alignment, baseline, and considering any meshes.
   */
  updateLayout: function (data) {
    var anchor;
    var baseline;
    var el = this.el;
    var geometry = this.geometry;
    var geometryComponent = el.getAttribute('geometry');
    var height;
    var layout = geometry.layout;
    var mesh = this.mesh;
    var textRenderWidth;
    var textScale;
    var width;
    var x;
    var y;

    // Determine width to use (defined width, geometry's width, or default width).
    geometryComponent = el.getAttribute('geometry');
    width = data.width || (geometryComponent && geometryComponent.width) || DEFAULT_WIDTH;

    // Determine wrap pixel count. Either specified or by experimental fudge factor.
    // Note that experimental factor will never be correct for variable width fonts.
    textRenderWidth = computeWidth(data.wrapPixels, data.wrapCount,
                                   this.currentFont.widthFactor);
    textScale = width / textRenderWidth;

    // Determine height to use.
    height = textScale * (layout.height + layout.descender);

    // Update geometry dimensions to match text layout if width and height are set to 0.
    // For example, scales a plane to fit text.
    if (geometryComponent) {
      if (!geometryComponent.width) { el.setAttribute('geometry', 'width', width); }
      if (!geometryComponent.height) { el.setAttribute('geometry', 'height', height); }
    }

    // Calculate X position to anchor text left, center, or right.
    anchor = data.anchor === 'align' ? data.align : data.anchor;
    if (anchor === 'left') {
      x = 0;
    } else if (anchor === 'right') {
      x = -1 * layout.width;
    } else if (anchor === 'center') {
      x = -1 * layout.width / 2;
    } else {
      throw new TypeError('Invalid text.anchor property value', anchor);
    }

    // Calculate Y position to anchor text top, center, or bottom.
    baseline = data.baseline;
    if (baseline === 'bottom') {
      y = 0;
    } else if (baseline === 'top') {
      y = -1 * layout.height + layout.ascender;
    } else if (baseline === 'center') {
      y = -1 * layout.height / 2;
    } else {
      throw new TypeError('Invalid text.baseline property value', baseline);
    }

    // Position and scale mesh to apply layout.
    mesh.position.x = x * textScale;
    mesh.position.y = y * textScale;
    // Place text slightly in front to avoid Z-fighting.
    mesh.position.z = data.zOffset;
    mesh.scale.set(textScale, -1 * textScale, textScale);
    this.geometry.computeBoundingSphere();
  },

  /**
   * Grab font from the constant.
   * Set as a method for test stubbing purposes.
   */
  lookupFont: function (key) {
    return FONTS[key];
  }
});

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

/**
 * Coerce some data to numbers.
 * as they will be passed directly into text creation and update
 */
function coerceData (data) {
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
function loadFont (src, yOffset) {
  return new Promise(function (resolve, reject) {
    loadBMFont(src, function (err, font) {
      if (err) {
        error('Error loading font', src);
        reject(err);
        return;
      }

      // Fix negative Y offsets for Roboto MSDF font from tool. Experimentally determined.
      if (src.indexOf('/Roboto-msdf.json') >= 0) { yOffset = 30; }
      if (yOffset) { font.chars.map(function doOffset (ch) { ch.yoffset += yOffset; }); }

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
      error('Error loading font image', src);
      reject(null);
    });
  });
}

function createShader (el, shaderName, data) {
  var shader;
  var shaderObject;

  // Set up Shader.
  shaderObject = new shaders[shaderName].Shader();
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
 * Update the text geometry using `three-bmfont-text.update`.
 */
function updateGeometry (geometry, data, font) {
  geometry.update(utils.extend({}, data, {
    font: font,
    width: computeWidth(data.wrapPixels, data.wrapCount, font.widthFactor),
    text: data.value.replace(/\\n/g, '\n').replace(/\\t/g, '\t'),
    lineHeight: data.lineHeight || font.common.lineHeight
  }));
}

/**
 * Determine wrap pixel count. Either specified or by experimental fudge factor.
 * Note that experimental factor will never be correct for variable width fonts.
 */
function computeWidth (wrapPixels, wrapCount, widthFactor) {
  return wrapPixels || ((0.5 + wrapCount) * widthFactor);
}

/**
 * Compute default font width factor to use.
 */
function computeFontWidthFactor (font) {
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
  return digits ? digitsum / digits : sum / font.chars.length;
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
