/**
 * Find the disatance from a plane defined by a point on the plane and the normal of the plane to any point.
 * @param {THREE.Vector3} positionOnPlane any point on the plane.
 * @param {THREE.Vector3} planeNormal the normal of the plane
 * @param {THREE.Vector3} p1 point to test
 * @returns Number
 */
 function distanceOfPointFromPlane (positionOnPlane, planeNormal, p1) {
  // the d value in the plane equation a*x + b*y + c*z=d
   var d = planeNormal.dot(positionOnPlane);

  // distance of point from plane
   return (d - planeNormal.dot(p1)) / planeNormal.length();
 }

/**
 * Find the point on a plane that lies closest to
 * @param {THREE.Vector3} positionOnPlane any point on the plane.
 * @param {THREE.Vector3} planeNormal the normal of the plane
 * @param {THREE.Vector3} p1 point to test
 * @param {THREE.Vector3} out where to store the result.
 * @returns
 */
 function nearestPointInPlane (positionOnPlane, planeNormal, p1, out) {
   var t = distanceOfPointFromPlane(positionOnPlane, planeNormal, p1);
  // closest point on the plane
   out.copy(planeNormal);
   out.multiplyScalar(t);
   out.add(p1);
   return out;
 }

 module.exports.distanceOfPointFromPlane = distanceOfPointFromPlane;
 module.exports.nearestPointInPlane = nearestPointInPlane;
