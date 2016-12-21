var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var createTextGeometry = require('three-bmfont-text');
var loadBMFont = require('load-bmfont');
var path = require('path');
var assign = require('object-assign');
var createSDF = require('three-bmfont-text/shaders/sdf');
var createMSDF = require('three-bmfont-text/shaders/msdf');
var createBasic = require('three-bmfont-text/shaders/basic');

var coreShader = require('../core/shader');
var shaders = coreShader.shaders;
var shaderNames = coreShader.shaderNames;

var alignments = ['left', 'right', 'center'];
var anchors = ['left', 'right', 'center', 'align'];
var baselines = ['top', 'center', 'bottom'];

var DEFAULT_WIDTH = 1; // 1 matches other AFRAME default widths... 5 matches prior bmfont examples etc.

// @bryik set anisotropy to 16 because I think it improves the look
// of large amounts of text particularly when viewed from an angle.
var MAX_ANISOTROPY = 16;

var FONT_BASE_URL = 'https://cdn.aframe.io/fonts/';
var fontMap = {
  'default': FONT_BASE_URL + 'DejaVu-sdf.fnt',
  'Aileron-Semibold': FONT_BASE_URL + 'Aileron-Semibold.fnt',
  'DejaVu': FONT_BASE_URL + 'DejaVu-sdf.fnt',
  'Exo2Bold': FONT_BASE_URL + 'Exo2Bold.fnt',
  'Exo2SemiBold': FONT_BASE_URL + 'Exo2SemiBold.fnt',
  'KelsonSans': FONT_BASE_URL + 'KelsonSans.fnt',
  'Monoid': FONT_BASE_URL + 'Monoid.fnt',
  'SourceCodePro': FONT_BASE_URL + 'SourceCodePro.fnt',
  'mozillavr': FONT_BASE_URL + 'mozillavr.fnt'
};

var loadedFontPromises = {};
var loadedTexturePromises = {};

coreShader.registerShader('modified-SDF', {
  schema: {
    map: { type: 'map', is: 'uniform' },
    color: { type: 'color', is: 'uniform', default: 'white' },
    opacity: { type: 'number', is: 'uniform', default: 1.0 }
  },
  vertexShader: [
    'varying vec2 vUV;',
    'void main(void) {',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '  vUV = uv;',
    '}'
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D map;',
    'uniform vec3 color;',
    'uniform float opacity;',
    'varying vec2 vUV;',
    '#define ALL_SMOOTH 0.5',
    '#define ALL_ROUGH 0.4',
    'float aastep(float value) {',
    '  float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));',
    '  float smooth = smoothstep(0.5 - afwidth, 0.5 + afwidth, value);',
    '  float ratio = (gl_FragCoord.w >= ALL_SMOOTH) ? 1.0 : (gl_FragCoord.w < ALL_ROUGH) ? 0.0 : (gl_FragCoord.w - ALL_ROUGH) / (ALL_SMOOTH - ALL_ROUGH);',
    '  return smooth * ratio + (1.0 - ratio) * value;',
    '}',
    'void main() {',
    '  vec4 texColor = texture2D(map, vUV);',
    '  float alpha = aastep(texColor.a);',
    '  gl_FragColor = vec4(color, opacity * alpha);',
    '}'
  ].join('\n')
});

module.exports.Component = registerComponent('bmfont-text', {
  schema: {
    // scale is now determined by width and wrappixels/wrapcount... scale: {default: 0.003},
    tabSize: {default: 4},
    anchor: {default: 'center', oneOf: anchors}, // center default to match primitives like plane; if 'align', null or undefined, same as align
    baseline: {default: 'center', oneOf: baselines},
    text: {type: 'string'},
    width: {type: 'number'}, // use AFRAME units i.e. meters, not arbitrary numbers... // default to geometry width, or if not present then DEFAULT_WIDTH
    height: {type: 'number'}, // use AFRAME units i.e. meters, not arbitrary numbers... // no default, will be populated at layout
    align: {type: 'string', default: 'left', oneOf: alignments},
    letterSpacing: {type: 'number', default: 0},
    lineHeight: {type: 'number'},  // default to font's lineHeight value
    font: {type: 'string', default: 'default'},
    fontImage: {type: 'string'}, // default to fnt but with .fnt replaced by .png
    whiteSpace: {default: 'normal', oneOf: ['normal', 'pre', 'nowrap']},
    color: {type: 'color', default: '#000'},
    opacity: {type: 'number', default: '1.0'},
    shader: {default: 'custom', oneOf: ['custom', 'SDF', 'basic', 'MSDF']},
    customShader: {default: 'modified-SDF', oneOf: shaderNames},
    side: {default: 'front', oneOf: ['front', 'back', 'double']},
    transparent: {default: true},
    alphaTest: {default: 0.5},
    wrappixels: {type: 'number'}, // if specified, units are bmfont pixels (e.g. DejaVu default is size 32)
    wrapcount: {type: 'number', default: 40} // units are 0.6035 * font size e.g. about one default font character (monospace DejaVu size 32)
  },

  init: function () {
    this.texture = new THREE.Texture();
    this.texture.anisotropy = MAX_ANISOTROPY;

    this.geometry = createTextGeometry();

    this.updateMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.el.setObject3D('bmfont-text', this.mesh);
  },

  update: function (oldData) {
    var data = this.coerceData(this.data);

    // decide whether to update font, or just text data
    if (!oldData || oldData.font !== data.font) {
      // new font, will also subsequently change data & layout
      this.updateFont();
    } else if (this.currentFont) {
      // new data like change of text string
      var font = this.currentFont;
      var textRenderWidth = data.wrappixels || (data.wrapcount * 0.6035 * font.info.size);
      var options = assign({}, data, { font: font, width: textRenderWidth, lineHeight: data.lineHeight || font.common.lineHeight });
      this.geometry.update(options);
      this.updateLayout(data);
    }
    // if shader changed, update
    this.updateMaterial(oldData && {shader: oldData.shader, customShader: oldData.customShader});
  },

  remove: function () {
    this.geometry.dispose();
    this.geometry = null;
    this.el.removeObject3D('bmfont-text');
  },

  coerceData: function (data) {
    // We have to coerce some data to numbers/booleans,
    // as they will be passed directly into text creation and update
    data = assign({}, data);
    if (data.lineHeight !== undefined) {
      data.lineHeight = parseFloat(data.lineHeight);
      if (!isFinite(data.lineHeight)) { data.lineHeight = undefined; }
    }
    if (data.width !== undefined) {
      data.width = parseFloat(data.width);
      if (!isFinite(data.width)) { data.width = undefined; }
    }
    return data;
  },

  updateMaterial: function (oldShader) {
    var data;
    var changedShader = (oldShader && oldShader.shader) !== this.data.shader || (oldShader && oldShader.customShader) !== this.data.customShader;

    if (changedShader || this.data.customShader) {
      data = {
        side: threeSideFromString(this.data.side),
        transparent: this.data.transparent,
        alphaTest: this.data.alphaTest,
        color: this.data.color,
        opacity: this.data.opacity,
        map: this.texture
      };
    }
    if (changedShader) {
      var shader;
      if (this.data.shader === 'custom') {
        var ShaderType = shaders[this.data.customShader].Shader;
        var shaderObject = this.shaderObject = new ShaderType();
        shaderObject.el = this.el;
        shaderObject.init(data);
        shaderObject.update(data);
        shader = shaderObject.material;
        shader.transparent = data.transparent; // apparently this is not set on either init or update
        this.material = shader;
        if (this.mesh) { this.mesh.material = this.material; }
        return;
      }
      if (this.data.shader === 'SDF') {
        shader = createSDF(data);
      } else if (this.data.shader === 'MSDF') {
        shader = createMSDF(data);
      } else {
        shader = createBasic(data);
      }
      this.material = new THREE.RawShaderMaterial(shader);
    } else if (this.data.shader === 'custom') {
      this.shaderObject.update(data);
      this.shaderObject.material.transparent = data.transparent; // apparently this is not set on either init or update
    } else {
      this.material.uniforms.opacity.value = this.data.opacity;
      this.material.uniforms.color.value.set(this.data.color);
      this.material.uniforms.map.value = this.texture;
    }

    if (this.mesh) { this.mesh.material = this.material; }
  },

  registerFont: function (key, url) { fontMap[key] = url; },

  lookupFont: function (keyOrUrl) { return fontMap[keyOrUrl] || keyOrUrl; },

  loadBMFontPromise: function (src) {
    return new Promise(function (resolve, reject) {
      loadBMFont(src, function (err, font) {
        if (err) { reject(err); } else { resolve(font); }
      });
    });
  },

  loadTexturePromise: function (src) {
    return new Promise(function (resolve, reject) {
      var loader = new THREE.ImageLoader();
      loader.load(src, function (image) {
        resolve(image);
      }, undefined, function () {
        reject(null);
      });
    });
  },

  updateFont: function () {
    if (!this.data.font) {
      console.error(new TypeError('No font specified for bmfont text!'));
      return;
    }

    var geometry = this.geometry;
    var self = this;
    this.mesh.visible = false;
    var font = this.lookupFont(this.data.font);
    var promise = loadedFontPromises[font] = loadedFontPromises[font] || this.loadBMFontPromise(font);
    promise.then(function (font) {
      if (font.pages.length !== 1) {
        throw new Error('Currently only single-page bitmap fonts are supported.');
      }
      var data = self.coerceData(self.data);

      var src = self.data.fontImage || self.lookupFont(self.data.font).replace('.fnt', '.png') || path.dirname(data.font) + '/' + font.pages[0];
      var textRenderWidth = data.wrappixels || (data.wrapcount * 0.6035 * font.info.size);
      var options = assign({}, data, { font: font, width: textRenderWidth, lineHeight: data.lineHeight || font.common.lineHeight });
      var object3D;
      geometry.update(options);
      self.mesh.geometry = geometry;

      object3D = self.el.object3D;
      if (object3D.children.indexOf(self.mesh) === -1) {
        object3D.add(self.mesh);
      }

      var texpromise = loadedTexturePromises[src] || self.loadTexturePromise(src);
      texpromise.then(function (image) {
        self.mesh.visible = true;
        if (image) {
          self.texture.image = image;
          self.texture.needsUpdate = true;
        }
      }).catch(function () {
        console.error('Could not load bmfont texture "' + src +
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
    var elGeo = el.getAttribute('geometry');
    var width = data.width || (elGeo && elGeo.width) || DEFAULT_WIDTH;
    var textRenderWidth = data.wrappixels || (data.wrapcount * 0.6035 * font.info.size);
    var textScale = width / textRenderWidth;
    var height = textScale * geometry.layout.height;
    var x;
    var y;
    var layout = this.geometry.layout;
    var anchor = data.anchor === 'align' ? data.align : data.anchor;
    var baseline = data.baseline;

    // update geometry dimensions to match layout, if not specified
    if (elGeo) {
      if (!elGeo.width) { el.setAttribute('geometry', 'width', width); }
      if (!elGeo.height) { el.setAttribute('geometry', 'height', height); }
    }

    // anchors text left/center/right
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
    if (baseline === 'bottom') {
      y = 0;
    } else if (baseline === 'top') {
      y = -layout.height + layout.ascender;
    } else if (baseline === 'center') {
      y = -layout.height / 2;
    } else {
      throw new TypeError('invalid baseline ' + baseline);
    }

    this.mesh.position.x = x * textScale;
    this.mesh.position.y = y * textScale;
    this.mesh.position.z = 0.001; // put text slightly in front in case there is a plane or other geometry
    this.mesh.scale.set(textScale, -textScale, textScale);
    this.geometry.computeBoundingSphere();
  }
});

function threeSideFromString (str) {
  switch (str) {
    case 'double': return THREE.DoubleSide;
    case 'front': return THREE.FrontSide;
    case 'back': return THREE.BackSide;
    default:
      throw new TypeError('Unknown side string ' + str);
  }
}
