let registerGeometry = require('../core/geometry').registerGeometry;
let THREE = require('../lib/three');

let quaternion = new THREE.Quaternion();
let rotateVector = new THREE.Vector3(0, 0, 1);
let uvMinVector = new THREE.Vector2();
let uvMaxVector = new THREE.Vector2();
let uvScaleVector = new THREE.Vector2();

registerGeometry('triangle', {
  schema: {
    vertexA: {type: 'vec3', default: {x: 0, y: 0.5, z: 0}},
    vertexB: {type: 'vec3', default: {x: -0.5, y: -0.5, z: 0}},
    vertexC: {type: 'vec3', default: {x: 0.5, y: -0.5, z: 0}}
  },

  init: function (data) {
    let geometry;
    let normal;
    let triangle;
    let uvA;
    let uvB;
    let uvC;

    triangle = new THREE.Triangle();
    triangle.a.set(data.vertexA.x, data.vertexA.y, data.vertexA.z);
    triangle.b.set(data.vertexB.x, data.vertexB.y, data.vertexB.z);
    triangle.c.set(data.vertexC.x, data.vertexC.y, data.vertexC.z);
    normal = triangle.getNormal(new THREE.Vector3());

    // Rotate the 3D triangle to be parallel to XY plane.
    quaternion.setFromUnitVectors(normal, rotateVector);
    uvA = triangle.a.clone().applyQuaternion(quaternion);
    uvB = triangle.b.clone().applyQuaternion(quaternion);
    uvC = triangle.c.clone().applyQuaternion(quaternion);

    // Compute UVs.
    // Normalize x/y values of UV so they are within 0 to 1.
    uvMinVector.set(Math.min(uvA.x, uvB.x, uvC.x), Math.min(uvA.y, uvB.y, uvC.y));
    uvMaxVector.set(Math.max(uvA.x, uvB.x, uvC.x), Math.max(uvA.y, uvB.y, uvC.y));
    uvScaleVector.set(0, 0).subVectors(uvMaxVector, uvMinVector);
    uvA = new THREE.Vector2().subVectors(uvA, uvMinVector).divide(uvScaleVector);
    uvB = new THREE.Vector2().subVectors(uvB, uvMinVector).divide(uvScaleVector);
    uvC = new THREE.Vector2().subVectors(uvC, uvMinVector).divide(uvScaleVector);

    geometry = this.geometry = new THREE.Geometry();
    geometry.vertices.push(triangle.a);
    geometry.vertices.push(triangle.b);
    geometry.vertices.push(triangle.c);
    geometry.faces.push(new THREE.Face3(0, 1, 2, normal));
    geometry.faceVertexUvs[0] = [[uvA, uvB, uvC]];
  }
});
