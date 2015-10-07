/**
 * http://www.alexandre-pestana.com/webgl/PBRViewer.html
 */
attribute vec4 tangent;

uniform vec2 uvScale;

varying vec2 vUv;
varying mat3 tbn;
varying vec3 vLightVector;
varying vec3 vTestNormal;
varying vec3 vPosition;

void main() {
  vUv = uvScale * uv;

  vec3 vNormal = normalize(normalMatrix * normal);
  vec3 vTangent = normalize(normalMatrix * tangent.xyz);
  vec3 vBinormal = normalize(cross(vNormal, vTangent) * tangent.w);

  tbn = mat3(vTangent, vBinormal, vNormal);

  vLightVector = normalize(vec3(0.4, 0.2 ,0.2));

  vPosition = position;
  vTestNormal = normal;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
