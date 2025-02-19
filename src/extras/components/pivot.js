import * as THREE from 'three';
import { registerComponent } from '../../core/component.js';

var originalPosition = new THREE.Vector3();
var originalRotation = new THREE.Vector3();

/**
 * Wrap el.object3D within an outer group. Apply pivot to el.object3D as position.
 */
registerComponent('pivot', {
  dependencies: ['position'],

  schema: {type: 'vec3'},

  init: function () {
    var data = this.data;
    var el = this.el;
    var originalParent = el.object3D.parent;
    var originalGroup = el.object3D;
    var outerGroup = new THREE.Group();

    originalPosition.copy(originalGroup.position);
    originalRotation.copy(originalGroup.rotation);

    // Detach current group from parent.
    originalParent.remove(originalGroup);
    outerGroup.add(originalGroup);

    // Set new group as the outer group.
    originalParent.add(outerGroup);

    // Set outer group as new object3D.
    el.object3D = outerGroup;

    // Apply pivot to original group.
    originalGroup.position.set(-1 * data.x, -1 * data.y, -1 * data.z);

    // Offset the pivot so that world position not affected.
    // And restore position onto outer group.
    outerGroup.position.set(data.x + originalPosition.x, data.y + originalPosition.y,
                            data.z + originalPosition.z);

    // Transfer rotation to outer group.
    outerGroup.rotation.copy(originalGroup.rotation);
    originalGroup.rotation.set(0, 0, 0);
  }
});
