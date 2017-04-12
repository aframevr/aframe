var registerGeometry = require('../core/geometry').registerGeometry;
var THREE = require('../lib/three');

registerGeometry('triangle', {
  schema: {
    vertexA: {type: 'vec3', default: {x: 0, y: 0.5, z: 0}},
    vertexB: {type: 'vec3', default: {x: -0.5, y: -0.5, z: 0}},
    vertexC: {type: 'vec3', default: {x: 0.5, y: -0.5, z: 0}}
  },

  init: function (data) {
    var triangle = new THREE.Triangle();
    triangle.a.set(data.vertexA.x, data.vertexA.y, data.vertexA.z);
    triangle.b.set(data.vertexB.x, data.vertexB.y, data.vertexB.z);
    triangle.c.set(data.vertexC.x, data.vertexC.y, data.vertexC.z);
    var normal = triangle.normal();

    // compute UVs

    // rotate the 3D triangle such that it is parallel to the x-y plane
    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(normal, new THREE.Vector3(0, 0, 1));
    var uvA = triangle.a.clone().applyQuaternion(quaternion);
    var uvB = triangle.b.clone().applyQuaternion(quaternion);
    var uvC = triangle.c.clone().applyQuaternion(quaternion);

    // normalize the x, y values of the UVs such that they are within 0 to 1
    var uvMin = new THREE.Vector2(Math.min(uvA.x, uvB.x, uvC.x), Math.min(uvA.y, uvB.y, uvC.y));
    var uvMax = new THREE.Vector2(Math.max(uvA.x, uvB.x, uvC.x), Math.max(uvA.y, uvB.y, uvC.y));
    var uvScale = new THREE.Vector2().subVectors(uvMax, uvMin);
    uvA = new THREE.Vector2().subVectors(uvA, uvMin).divide(uvScale);
    uvB = new THREE.Vector2().subVectors(uvB, uvMin).divide(uvScale);
    uvC = new THREE.Vector2().subVectors(uvC, uvMin).divide(uvScale);

    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push(triangle.a);
    this.geometry.vertices.push(triangle.b);
    this.geometry.vertices.push(triangle.c);
    this.geometry.faces.push(new THREE.Face3(0, 1, 2, normal));
    this.geometry.faceVertexUvs[0] = [[uvA, uvB, uvC]];
  }
});
