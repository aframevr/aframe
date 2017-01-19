var registerShader = require('../core/shader').registerShader;

/**
 * Used by text component.
 */
module.exports.Shader = registerShader('modifiedsdf', {
  schema: {
    alphaTest: {type: 'number', is: 'uniform', default: 0.5},
    color: {type: 'color', is: 'uniform', default: 'white'},
    map: {type: 'map', is: 'uniform'},
    opacity: {type: 'number', is: 'uniform', default: 1.0}
  },

  vertexShader: [
    'varying vec2 vUV;',
    'void main(void) {',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '  vUV = uv;',
    '}'
  ].join('\n'),

  fragmentShader: [
    '#define ALL_SMOOTH 0.5',
    '#define ALL_ROUGH 0.4',
    '#define DISCARD_ALPHA 0.1',
    'uniform sampler2D map;',
    'uniform vec3 color;',
    'uniform float opacity;',
    'uniform float alphaTest;',
    'varying vec2 vUV;',
    'float aastep(float value) {',
    '  float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));',
    '  return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);',
    '}',
    'void main() {',
    '  vec4 texColor = texture2D(map, vUV);',
    '  float value = texColor.a;',
    '  float alpha = aastep(value);',
    '  float ratio = (gl_FragCoord.w >= ALL_SMOOTH) ? 1.0 : (gl_FragCoord.w < ALL_ROUGH) ? 0.0 : (gl_FragCoord.w - ALL_ROUGH) / (ALL_SMOOTH - ALL_ROUGH);',
    '  if (alpha < alphaTest) { if (ratio >= 1.0) { discard; return; } alpha = 0.0; }',
    '  alpha = alpha * ratio + (1.0 - ratio) * value;',
    '  if (ratio < 1.0 && alpha <= DISCARD_ALPHA) { discard; return; }',
    '  gl_FragColor = vec4(color, opacity * alpha);',
    '}'
  ].join('\n')
});
