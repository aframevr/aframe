/**
 * Find the disatance from a plane defined by a point on the plane and the normal of the plane to any point.
 * @param {THREE.Vector3} positionOnPlane any point on the plane.
 * @param {THREE.Vector3} planeNormal the normal of the plane
 * @param {THREE.Vector3} pointToTest point to test
 * @returns Number
 */
 function distanceOfPointFromPlane (positionOnPlane, planeNormal, pointToTest) {
  // the d value in the plane equation a*x + b*y + c*z=d
   var d = planeNormal.dot(positionOnPlane);

  // distance of point from plane
   return (d - planeNormal.dot(pointToTest)) / planeNormal.length();
 }

/**
 * Find the point on a plane that lies closest to
 * @param {THREE.Vector3} positionOnPlane any point on the plane.
 * @param {THREE.Vector3} planeNormal the normal of the plane
 * @param {THREE.Vector3} pointToTest point to test
 * @param {THREE.Vector3} resultPoint where to store the result.
 * @returns
 */
 function nearestPointInPlane (positionOnPlane, planeNormal, pointToTest, resultPoint) {
   var t = distanceOfPointFromPlane(positionOnPlane, planeNormal, pointToTest);
  // closest point on the plane
   resultPoint.copy(planeNormal);
   resultPoint.multiplyScalar(t);
   resultPoint.add(pointToTest);
   return resultPoint;
 }

 module.exports.distanceOfPointFromPlane = distanceOfPointFromPlane;
 module.exports.nearestPointInPlane = nearestPointInPlane;
