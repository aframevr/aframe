---
title: Developing with three.js
type: introduction
layout: docs
parent_section: introduction
order: 7
examples: []
---

[three.js]: http://threejs.org

Being a framework based on [three.js], A-Frame provides full access to the
three.js API. We'll go over how to access the underlying three.js scene,
objects, and API that lay underneath A-Frame.

<!-- toc -->

## Relationship Between A-Frame and three.js Scene Graphs

- A-Frame's `<a-scene>` maps one-to-one with a three.js scene.
- A-Frame's `<a-entity>` maps to one or more three.js objects.
- three.js's objects have a reference to their A-Frame entity via `.el`, which is
set by A-Frame.

### Parent-Child Relationships

When A-Frame entities are nested in parent-child relationships, so are their
three.js objects. For example, take this A-Frame scene:

```html
<a-scene>
  <a-box>
    <a-sphere></a-sphere>
    <a-light></a-light>
  </a-box>
</a-scene>
```

The three.js scene graph will correspond and look like:

```
THREE.Scene
  THREE.Mesh
    THREE.Mesh
    THREE.Light
```

## Accessing the three.js API

three.js is available as a global object on the window:

```js
console.log(THREE);
```

## Working With three.js Objects

A-Frame is an abstraction on top of three.js, but we still operate with
three.js underneath. A-Frame's elements have doors that lead to three.js's
scene graph.

### Accessing the three.js Scene

[scene]: https://threejs.org/docs/#api/scenes/Scene

The [three.js scene][scene] is accessible from the `<a-scene>` element as `.object3D`:

```js
document.querySelector('a-scene').object3D;  // THREE.Scene
```

And every A-Frame entity also has a reference to `<a-scene>` via `.sceneEl`:

```js
document.querySelector('a-entity').sceneEl.object3D;  // THREE.Scene
```

[component]: ../core/component.md

From a [component][component], we access the scene through its entity
(i.e., `this.el`):

```js
AFRAME.registerComponent('foo', {
  init: function () {
    var scene = this.el.sceneEl.object3D;  // THREE.Scene
  }
});
```

### Accessing an Entity's three.js Objects

[group]: https://threejs.org/docs/#api/objects/Group
[object3d]: https://threejs.org/docs/#api/core/Object3D

Every A-Frame entity (e.g., `<a-entity>`) has its own
[`THREE.Object3D`][object3d], more specifically a [`THREE.Group`][group] that
contains different types of `Object3D`s. The root `THREE.Group` of an entity is
accessed via `.object3D`:

```js
document.querySelector('a-entity').object3D;  // THREE.Group
```

[entity]: ../core/entity.md

Entities can be composed of multiple types of `Object3D`s. For example,
an entity can be both a `THREE.Mesh` and a `THREE.Light` by having both
a geometry component and light component:

```html
<a-entity geometry light></a-entity>
```

Components add the mesh and light under the entity's root `THREE.Group`.
References to the mesh and light are stored as different types of three.js
objects in the entity's `.object3DMap`.

```js
console.log(entityEl.object3DMap);
// {mesh: THREE.Mesh, light: THREE.Light}
```

But we can access them through the entity's `.getObject3D(name)` method:

```js
entityEl.getObject3D('mesh');  // THREE.Mesh
entityEl.getObject3D('light');  // THREE.Light
```

Now let's see how these three.js objects were set in the first place.

### Setting an `Object3D` on an Entity

Setting an `Object3D` on an entity adds the `Object3D` to the entity's `Group`,
which makes the newly set `Object3D` part of the three.js scene. We set the
`Object3D` with the entity's `.setObject3D(name)` method where the name
denotes the `Object3D`s purpose.

For example, to set a point light from within a component:

```js
AFRAME.registerComponent('pointlight', {
  init: function () {
    this.el.setObject3D('light', new THREE.PointLight());
  }
});
// <a-entity light></a-entity>
```

We set the light with the name `light`. To later access it, we can use the
entity's `.getObject3D(name)` method as described before:

```js
entityEl.getObject3D('light');
```

And when we set a three.js object on an A-Frame entity, A-Frame will set a
reference to the A-Frame entity from the three.js object via `.el`:

```js
entityEl.getObject3D('light').el;  // entityEl
```

There's also a `.getOrCreateObject3D(name, constructor)` method for creating
and setting an `Object3D` if one has not been set with the name. This is
commonly used in the case of `THREE.Mesh` when both the geometry and material
components need to get or create a mesh. Whichever component gets initialized
first creates the mesh, then the other component gets the mesh.

### Removing an `Object3D` From an Entity

To remove an `Object3D` from an entity, and consequently the three.js scene, we
can use the entity's `.removeObject3D(name)` method. Going back to our example
with the point light, we remove the light when the component is detached:

```js
AFRAME.registerComponent('pointlight', {
  init: function () {
    this.el.setObject3D('light', new THREE.PointLight());
  },

  remove: function () {
    // Remove Object3D.
    this.el.removeObject3D('light');
  }
});
```

## Transforming Between Coordinate Spaces

Every object and the scene (world) in general has their own coordinate space. A
parent object's position, rotation, and scale transformations are applied to
its children's position, rotation, and scale transformations. Consider this scene:

```html
<a-entity id="foo" position="1 2 3">
  <a-entity id="bar" position="2 3 4"></a-entity>
</a-entity>
```

From the world's reference point, foo has position (1,2,3) and bar has position
(3, 5, 7) since foo's transformations apply onto bar's. From foo's reference
point, foo has position (0, 0, 0) and bar has position (2, 3, 4).

Often we will want to transform between these reference points and coordinate
spaces. Above was a simple example, but we might want to do operations such as
finding the world-space coordinate of bar's position, or translate an arbitrary
coordinate into foo's coordinate space. In 3D programming, these operations are
accomplished with matrices, but three.js provides helpers to make them easier.

### Local to World Transforms

Normally, we'd need to call `.updateMatrixWorld ()` on parent `Object3D`s, but
three.js defaults `Object3D.matrixAutoUpdate` to `true`. We can use three.js's
`.getWorldPosition ()` and `.getWorldRotation ()`.

To get the world position of an `Object3D`:

```js
entityEl.object3D.getWorldPosition();
```

To get the world rotation of an `Object3D`:

```js
entityEl.object3D.getWorldRotation();
```

three.js `Object3D` has [more functions available for local-to-world transforms][object3d]:

- `.localToWorld (vector)`
- `.getWorldDirection ()`
- `.getWorldQuaternion ()`
- `.getWorldScale ()`

### World to Local Transforms

To obtain a matrix that transforms from world to an object's local space, get
the inverse of the object's world matrix.

```js
var worldToLocal = new THREE.Matrix4().getInverse(object3D.matrixWorld)
```

Then we can apply that `worldToLocal` matrix to anything we want to transform:

```js
anotherObject3D.applyMatrix(worldToLocal);
```
