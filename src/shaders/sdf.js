var registerShader = require('../core/shader').registerShader;

var isWebGL2AVailable = !!document.createElement('canvas').getContext('webgl2');

var VERTEX_SHADER_WEBGL1 = [
  'attribute vec2 uv;',
  'attribute vec3 position;',
  'uniform mat4 projectionMatrix;',
  'uniform mat4 modelViewMatrix;',
  'varying vec2 vUV;',
  'void main(void) {',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
  '  vUV = uv;',
  '}'
].join('\n');

var VERTEX_SHADER_WEBGL2 = [
  '#version 300 es',
  'in vec2 uv;',
  'in vec3 position;',
  'uniform mat4 projectionMatrix;',
  'uniform mat4 modelViewMatrix;',
  'out vec2 vUV;',
  'void main(void) {',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
  '  vUV = uv;',
  '}'
].join('\n');

var VERTEX_SHADER = isWebGL2AVailable ? VERTEX_SHADER_WEBGL2 : VERTEX_SHADER_WEBGL1;

var FRAGMENT_SHADER_WEBGL1 = [
  '#ifdef GL_OES_standard_derivatives',
  '#extension GL_OES_standard_derivatives: enable',
  '#endif',

  'precision highp float;',
  'uniform float alphaTest;',
  'uniform float opacity;',
  'uniform sampler2D map;',
  'uniform vec3 color;',
  'varying vec2 vUV;',

  '#ifdef GL_OES_standard_derivatives',
  '  float contour(float width, float value) {',
  '    return smoothstep(0.5 - value, 0.5 + value, width);',
  '  }',
  '#else',
  '  float aastep(float value, float afwidth) {',
  '    return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);',
  '  }',
  '#endif',

  // FIXME: Experimentally determined constants.
  '#define BIG_ENOUGH 0.001',
  '#define MODIFIED_ALPHATEST (0.02 * isBigEnough / BIG_ENOUGH)',
  '#define ALL_SMOOTH 0.4',
  '#define ALL_ROUGH 0.02',
  '#define DISCARD_ALPHA (alphaTest / (2.2 - 1.2 * ratio))',

  'void main() {',
     // When we have derivatives and can get texel size for supersampling.
  '  #ifdef GL_OES_standard_derivatives',
  '    vec2 uv = vUV;',
  '    vec4 texColor = texture2D(map, uv);',
  '    float dist = texColor.a;',
  '    float width = fwidth(dist);',
  '    float alpha = contour(dist, width);',
  '    float dscale = 0.353505;',

  '    vec2 duv = dscale * (dFdx(uv) + dFdy(uv));',
  '    float isBigEnough = max(abs(duv.x), abs(duv.y));',

       // When texel is too small, blend raw alpha value rather than supersampling.
       // FIXME: experimentally determined constant
  '    if (isBigEnough > BIG_ENOUGH) {',
  '      float ratio = BIG_ENOUGH / isBigEnough;',
  '      alpha = ratio * alpha + (1.0 - ratio) * dist;',
  '    }',

       // Otherwise do weighted supersampling.
       // FIXME: why this weighting?
  '    if (isBigEnough <= BIG_ENOUGH) {',
  '      vec4 box = vec4 (uv - duv, uv + duv);',
  '      alpha = (alpha + 0.5 * (',
  '        contour(texture2D(map, box.xy).a, width)',
  '        + contour(texture2D(map, box.zw).a, width)',
  '        + contour(texture2D(map, box.xw).a, width)',
  '        + contour(texture2D(map, box.zy).a, width)',
  '      )) / 3.0;',
  '    }',

       // Do modified alpha test.
  '    if (alpha < alphaTest * MODIFIED_ALPHATEST) { discard; return; }',

  '  #else',
       // When we don't have derivatives, use approximations.
  '    vec4 texColor = texture2D(map, vUV);',
  '    float value = texColor.a;',
       // FIXME: if we understood font pixel dimensions, this could probably be improved
  '    float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));',
  '    float alpha = aastep(value, afwidth);',

       // Use gl_FragCoord.w to guess when we should blend.
       // FIXME: If we understood font pixel dimensions, this could probably be improved.
  '    float ratio = (gl_FragCoord.w >= ALL_SMOOTH) ? 1.0 : (gl_FragCoord.w < ALL_ROUGH) ? 0.0 : (gl_FragCoord.w - ALL_ROUGH) / (ALL_SMOOTH - ALL_ROUGH);',
  '    if (alpha < alphaTest) { if (ratio >= 1.0) { discard; return; } alpha = 0.0; }',
  '    alpha = alpha * ratio + (1.0 - ratio) * value;',
  '    if (ratio < 1.0 && alpha <= DISCARD_ALPHA) { discard; return; }',
  '  #endif',

  '  gl_FragColor = vec4(color, opacity * alpha);',
  '}'
].join('\n');

var FRAGMENT_SHADER_WEBGL2 = [
  '#version 300 es',
  'precision highp float;',
  'uniform float alphaTest;',
  'uniform float opacity;',
  'uniform sampler2D map;',
  'uniform vec3 color;',
  'in vec2 vUV;',
  'out vec4 fragColor;',

  '#ifdef GL_OES_standard_derivatives',
  '  float contour(float width, float value) {',
  '    return smoothstep(0.5 - value, 0.5 + value, width);',
  '  }',
  '#else',
  '  float aastep(float value, float afwidth) {',
  '    return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);',
  '  }',
  '#endif',

  // FIXME: Experimentally determined constants.
  '#define BIG_ENOUGH 0.001',
  '#define MODIFIED_ALPHATEST (0.02 * isBigEnough / BIG_ENOUGH)',
  '#define ALL_SMOOTH 0.4',
  '#define ALL_ROUGH 0.02',
  '#define DISCARD_ALPHA (alphaTest / (2.2 - 1.2 * ratio))',

  'void main() {',
     // When we have derivatives and can get texel size for supersampling.
  '  #ifdef GL_OES_standard_derivatives',
  '    vec2 uv = vUV;',
  '    vec4 texColor = texture(map, uv);',
  '    float dist = texColor.a;',
  '    float width = fwidth(dist);',
  '    float alpha = contour(dist, width);',
  '    float dscale = 0.353505;',

  '    vec2 duv = dscale * (dFdx(uv) + dFdy(uv));',
  '    float isBigEnough = max(abs(duv.x), abs(duv.y));',

       // When texel is too small, blend raw alpha value rather than supersampling.
       // FIXME: experimentally determined constant
  '    if (isBigEnough > BIG_ENOUGH) {',
  '      float ratio = BIG_ENOUGH / isBigEnough;',
  '      alpha = ratio * alpha + (1.0 - ratio) * dist;',
  '    }',

       // Otherwise do weighted supersampling.
       // FIXME: why this weighting?
  '    if (isBigEnough <= BIG_ENOUGH) {',
  '      vec4 box = vec4 (uv - duv, uv + duv);',
  '      alpha = (alpha + 0.5 * (',
  '        contour(texture(map, box.xy).a, width)',
  '        + contour(texture(map, box.zw).a, width)',
  '        + contour(texture(map, box.xw).a, width)',
  '        + contour(texture(map, box.zy).a, width)',
  '      )) / 3.0;',
  '    }',

       // Do modified alpha test.
  '    if (alpha < alphaTest * MODIFIED_ALPHATEST) { discard; return; }',

  '  #else',
       // When we don't have derivatives, use approximations.
  '    vec4 texColor = texture(map, vUV);',
  '    float value = texColor.a;',
       // FIXME: if we understood font pixel dimensions, this could probably be improved
  '    float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));',
  '    float alpha = aastep(value, afwidth);',

       // Use gl_FragCoord.w to guess when we should blend.
       // FIXME: If we understood font pixel dimensions, this could probably be improved.
  '    float ratio = (gl_FragCoord.w >= ALL_SMOOTH) ? 1.0 : (gl_FragCoord.w < ALL_ROUGH) ? 0.0 : (gl_FragCoord.w - ALL_ROUGH) / (ALL_SMOOTH - ALL_ROUGH);',
  '    if (alpha < alphaTest) { if (ratio >= 1.0) { discard; return; } alpha = 0.0; }',
  '    alpha = alpha * ratio + (1.0 - ratio) * value;',
  '    if (ratio < 1.0 && alpha <= DISCARD_ALPHA) { discard; return; }',
  '  #endif',

  '  fragColor = vec4(color, opacity * alpha);',
  '}'
].join('\n');

var FRAGMENT_SHADER = isWebGL2AVailable ? FRAGMENT_SHADER_WEBGL2 : FRAGMENT_SHADER_WEBGL1;

/**
 * Signed distance field.
 * Used by text component.
 */
module.exports.Shader = registerShader('sdf', {
  schema: {
    alphaTest: {type: 'number', is: 'uniform', default: 0.5},
    color: {type: 'color', is: 'uniform', default: 'white'},
    map: {type: 'map', is: 'uniform'},
    opacity: {type: 'number', is: 'uniform', default: 1.0}
  },

  raw: true,

  vertexShader: VERTEX_SHADER,

  fragmentShader: FRAGMENT_SHADER
});
