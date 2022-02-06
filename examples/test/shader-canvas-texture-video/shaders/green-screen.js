/* global AFRAME */
/**
 * The Green screen shader
 */
AFRAME.registerShader('green-screen', {

    schema: {
        uMap: {type: 'map', is: 'uniform'},
        gthreshold:{type: 'float', is: 'uniform', default:0.08}
    },

    vertexShader: `varying vec2 vUv;

                          void main() {
                              vec4 worldPosition = modelViewMatrix * vec4( position, 1.0 );
                              vec3 vWorldPosition = worldPosition.xyz;
                              vUv = uv;
                              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                          }`,

    fragmentShader: `varying vec2 vUv;
                     uniform sampler2D uMap;
                     uniform float gthreshold;

                     void main() {
                                  vec2 uv = vUv;
                                  vec4 tex1 = texture2D(uMap, uv * 1.0);
                                   if (tex1.g - tex1.r > gthreshold)
                                      gl_FragColor = vec4(0,0,0,0);
                                   else
                                      gl_FragColor = vec4(tex1.r,tex1.g,tex1.b,1.0);
                              }`

});



