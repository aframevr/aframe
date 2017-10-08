var registerShader = require('../core/shader').registerShader;

/**
 * Custom shader for MacOS HTTP Live Streaming (HLS).
 * For more information on HLS, see https://datatracker.ietf.org/doc/draft-pantos-http-live-streaming/
 */
module.exports.Shader = registerShader('macoshls', {
  schema: {
    src: {type: 'map', is: 'uniform'},
    opacity: {type: 'number', is: 'uniform', default: 1}
  },

  vertexShader: [
    'varying vec2 vUV;',
    'void main(void) {',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '  vUV = uv;',
    '}'
  ].join('\n'),

  fragmentShader: [
    'uniform sampler2D src;',
    'uniform float opacity;',
    'varying vec2 vUV;',
    'void main() {',
    '  vec2 offset = vec2(0, 0);',
    '  vec2 repeat = vec2(1, 1);',
    '  vec3 color = texture2D(src, vec2(vUV.x / repeat.x + offset.x, (1.0 - vUV.y) / repeat.y + offset.y)).rgb;',
    '  gl_FragColor = vec4(color, opacity);',
    '}'
  ].join('\n')
});

