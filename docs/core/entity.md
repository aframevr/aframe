---
title: Entity
type: core
layout: docs
parent_section: core
order: 2
---

[ecs]: ./index.md
               .
A-Frame represents an entity via the `<a-entity>` element. As defined in the
[entity-component-system pattern][ecs], entities are placeholder objects to
which we plug in components to provide them appearance, behavior, and
functionality.

[position]: ../components/position.md
[rotation]: ../components/rotation.md
[scale]: ../components/scale.md

In A-Frame, entities are inherently attached with the [position][position],
[rotation][rotation], and [scale][scale] components.

<!--toc-->

## Example

Consider the entity below. By itself, it has no appearance, behavior, or
functionality. It does nothing:

```html
<a-entity>
```

[geometry]: ../components/geometry.md
[material]: ../components/material.md

We can attach components to it to make it render something or do something. To
give it shape and appearance, we can attach the [geometry][geometry] and
[material][material] components:

```html
<a-entity geometry="primitive: box" material="color: red">
```

[light]: ../components/light.md

Or to make it emit light, we can further attach the [light][light] component:

```html
<a-entity geometry="primitive: box" material="color: red"
          light="type: point; intensity: 2.0">
```

## Retrieving an Entity

We can simply retrieve an entity using DOM APIs.

```html
<a-entity id="mario"></a-entity>
```

```js
var el = document.querySelector('#mario');
```

Once we have an entity, we have access to its properties and methods detailed
below.

## Properties

### `components`

`<a-entity>.components` is an object of components attached to the entity. This
gives us access to the entity's components including each component's data,
state, and methods.

For example, if we wanted to grab an entity's three.js camera object or
material object, we could reach into its components:

```js
var camera = document.querySelector('a-entity[camera]').components.camera.camera;
var material = document.querySelector('a-entity[material]').components.material.material;
```

Or if a component exposes an API, we can call its methods:

```js
document.querySelector('a-entity[sound]').components.sound.pause();
```

### `isPlaying`

Whether the entity is active and playing. If we pause the entity , then
`isPlaying` becomes `false`.

### `object3D`

[object3d]: http://threejs.org/docs/#Reference/Core/Object3D

`<a-entity>.object3D` is a reference to the entity's [three.js
`Object3D`][object3d] representation. More specifically, `object3D` will be a
`THREE.Group` object that may contain different types of `THREE.Object3D`s such
as cameras, meshes, lights, or sounds:

```js
// Gaining access to the internal three.js scene graph.
var groupObject3D = document.querySelector('a-entity').object3D;
console.log(groupObject3D.parent);
console.log(groupObject3D.children);
```

We can access the different types of `Object3D`s through `object3DMap`.

### `object3DMap`

An entity's `object3DMap` is an object that gives access to the different types
of `THREE.Object3D`s (e.g., camera, meshes, lights, sounds) that components
have set.

For an entity with a [geometry][geometry] and [light][light] components
attached, `object3DMap` might look like:

```js
{
  light: <THREE.Light Object>,
  mesh: <THREE.Mesh Object>
}
```

We can manage an entity's set of `THREE.Object3D`s by using `getOrCreateObject3D`,
`setObject3D`, and `removeObject3D`.

### `sceneEl`

An entity has a reference to its scene element.

```js
var sceneEl = document.querySelector('a-scene');
var entity = sceneEl.querySelector('a-entity');
console.log(entity.sceneEl === sceneEl);  // >> true.
```

## Methods

### `addState (stateName)`

`addState` will push a state onto the entity. This will emit the `stateadded`
event, and we can check the state can for existence using `.is`:


```js
entity.addEventListener('stateadded', function (evt) {
  if (evt.detail.state === 'selected') {
    console.log('Entity now selected!');
  }
});

entity.addState('selected');
entity.is('selected');  // >> true
```

### `emit (name, detail, bubbles)`

[animation-begin]: ./animations.md#begin

`emit` emits a custom DOM event on the entity. For example, we can emit an event to
[trigger an animation][animation-begin]:

```js
// <a-entity>
//   <a-animation attribute="rotation" begin="rotate" to="0 360 0"></a-animation>
// </a-entity>
entity.emit('rotate');
```

We can also pass event detail or data as the second argument:

```js
entity.emit('collide', { target: collidingEntity });
```

The event will bubble by default. we can tell it not to bubble by passing
`false` for `bubble`:

```js
entity.emit('sink', null, false);
```

### `flushToDOM (recursive)`

[component-to-dom-serialization]: ../components/debug.md#component-to-dom-serialization

`flushToDOM` will manually serialize an entity's components' data and update the DOM.
Read more about [component-to-DOM serialization][component-to-dom-serialization].

### `getAttribute (componentName)`

`getAttribute` retrieves parsed component data (including mixins and defaults).

```js
// <a-entity geometry="primitive: box; width: 3">

entity.getAttribute('geometry');
// >> {primitive: "box", depth: 2, height: 2, translate: "0 0 0", width: 3, ...}

entity.getAttribute('geometry').primitive;
// >> "box"

entity.getAttribute('geometry').height;
// >> 2

entity.getAttribute('position');
// >> {x: 0, y: 0, z: 0}
```

If `componentName` is not the name of a registered component, `getAttribute`
will behave as it normally would:

```js
// <a-entity data-position="0 1 1">

entity.getAttribute('data-position');
// >> "0 1 1"
```

### `getDOMAttribute (componentName)`

`getDOMAttribute` retrieves only parsed component data that is explicitly
defined in the DOM or via `setAttribute`. If `componentName` is the name of a
registered component, `getDOMAttribute` will return only the component data
defined in the HTML as a parsed object. `getDOMAttribute` for components is
the partial form of `getAttribute` since the returned component data does not
include applied mixins or default values:

Compare the output of the above example of [`getAttribute`](#getAttribute):

```js
// <a-entity geometry="primitive: box; width: 3">

entity.getDOMAttribute('geometry');
// >> { primitive: "box", width: 3 }

entity.getDOMAttribute('geometry').primitive;
// >> "box"

entity.getDOMAttribute('geometry').height;
// >> undefined

entity.getDOMAttribute('position');
// >> undefined
```

### `getObject3D (type)`

`getObject3D` looks up a child `THREE.Object3D` referenced by `type` on `object3DMap`.

```js
AFRAME.registerComponent('example-mesh', {
  init: function () {
    var el = this.el;
    el.getOrCreateObject3D('mesh', THREE.Mesh);
    el.getObject3D('mesh');  // Returns THREE.Mesh that was just created.
  }
});
```

### `getOrCreateObject3D (type, Constructor)`

If the entity does not have a `THREE.Object3D` registered under `type`,
`getOrCreateObject3D` will register an instantiated `THREE.Object3D` using the
passed `Constructor`. If the entity does have an `THREE.Object3D` registered
under `type`, `getOrCreateObject3D` will act as `getObject3D`:

```js
AFRAME.registerComponent('example-geometry', {
  update: function () {
    var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
    mesh.geometry = new THREE.Geometry();
  }
});
```

### `pause ()`

`pause()` will stop any dynamic behavior as defined by animations and
components.  When we pause an entity, it will stop its animations and call
`Component.pause()` on each of its components. The components decide to
implement what happens on pause, which is often removing event listeners. An
entity will call `pause()` on its child entities when we pause an entity.

```js
// <a-entity id="spinning-jumping-ball">
entity.pause();
```

For example, the [look-controls component](../components/look-controls.md) on
pause will remove event handlers that listen for input.

### `play ()`

`play()` will start any dynamic behavior as defined by animations and
components.  This is automatically called when the DOM attaches an entity. When
an entity `play()`, the entity calls `play()` on its child entities.

```js
entity.pause();
entity.play();
```

[sound]: ../components/sound.md

For example, the [sound component][sound] on play will begin playing the sound.

### `setAttribute (attr, value, componentAttrValue)`

If `attr` is not the name of a registered component or the component is a
single-property component, `setAttribute` behaves as it normally would:

```js
entity.setAttribute('visible', false);
```

Though if `attr` is the name of a registered component, it may handle special
parsing for the value. For example, the [position component][position] is a
single-property component, but its property type parser allows it to take an
object:

```js
entity.setAttribute('position', { x: 1, y: 2, z: 3 });
```

#### Putting Multi-Property Component Data

To set or replace component data for a multi-property component, we can pass
the name of a registered component as the `attr`, and pass an object of
properties as the `value`:

```js
// All previous properties for the light component will be removed and overwritten.
entity.setAttribute('light', {
  type: 'spot',
  distance: 30,
  intensity: 2.0
});
```

#### Updating Multi-Property Component Data

To update individual properties for a multi-property component, we can pass the
name of registered component as the `attr`, a property name as the second
argument, and the property value to set as the third argument:

```js
// All previous properties for the material component (besides the color)  will be unaffected.
entity.setAttribute('material', 'color', 'crimson');
```

### `setObject3D (type, obj)`

`setObject3D` will register the passed `obj`, a `THREE.Object3D`, as `type`
under the entity's `object3DMap`. A-Frame adds `obj` as a child of the entity's
root `object3D`.

```js
AFRAME.registerComponent('example-orthogonal-camera', {
  update: function () {
    this.el.setObject3D('camera', new THREE.OrthogonalCamera());
  }
});
```

### `removeAttribute (attr, propertyName)`

If `attr` is the name of a registered component, along with removing the
attribute from the DOM, `removeAttribute` will also detach the component from
the entity, invoking the component's `remove` lifecycle method.

```js
entity.removeAttribute('goemetry');  // Detach the geometry component.
entity.removeAttribute('sound');  // Detach the sound component.
```

If `propertyName` is given, `removeAttribute` will reset the property value of
that property specified by `propertyName` to the property's default value:

```js
entity.setAttribute('material', 'color', 'blue');  // The color is blue.
entity.removeAttribute('material', 'color');  // Reset the color to the default value, white.
```

### `removeObject3D (type)`

`removeObject3D` removes the object specified by `type` from the entity's
`THREE.Group` and thus from the scene. This will update the entity's
`object3DMap`, setting the value of the `type` key to `null`. This is generally
called from a component, often within the remove handler:

```js
AFRAME.registerComponent('example-light', {
  update: function () {
    this.el.setObject3D('light', new THREE.Light());
    // Light is now part of the scene.
    // object3DMap.light is now a THREE.Light() object.
  },

  remove: function () {
    this.el.removeObject3D('light');
    // Light is now removed from the scene.
    // object3DMap.light is now null.
  }
});
```

### `removeState (stateName)`

`removeState` will pop a state from the entity. This will emit the
`stateremoved` event, and we can check the state its removal using `.is`:

```js
entity.addEventListener('stateremoved', function (evt) {
  if (evt.detail.state === 'selected') {
    console.log('Entity no longer selected.');
  }
});

entity.addState('selected');
entity.is('selected');  // >> true

entity.removeState('selected');
entity.is('selected');  // >> false
```

## Events

| Event Name       | Description                                                         |
|------------------|---------------------------------------------------------------------|
| child-attached   | A child entity was attached to the entity.                          |
| child-detached   | A child entity was detached from the entity.                        |
| componentchanged | One of the entity's components was modified.                        |
| componentinit    | One of the entity's components was initialized.                     |
| componentremoved | One of the entity's components was removed.                         |
| loaded           | The entity has attached and initialized its components.             |
| pause            | The entity is now inactive and paused in terms of dynamic behavior. |
| play             | The entity is now active and playing in terms of dynamic behavior.  |
| stateadded       | The entity received a new state.                                    |
| stateremoved     | The entity no longer has a certain state.                           |
| schemachanged    | The schema of a component was changed.                              |

### Event Detail

Below is what the event detail contains for each event:

| Event Name           | Property  | Description                                        |
|----------------------|-----------|----------------------------------------------------|
| child-attached       | el        | Reference to the attached child element.           |
| componentchanged     | name      | Name of component that had its data modified.      |
|                      | id        | ID of component that had its data modified.        |
|                      | newData   | Component's new data, after it was modified.       |
|                      | oldData   | Component's previous data, before it was modified. |
| componentinitialized | name      | Name of component that was initialized.            |
|                      | id        | ID of component that had its data modified.        |
|                      | data      | Component data.                                    |
| componentremoved     | name      | Name of component that was removed.                |
|                      | id        | ID of component that was removed.                  |
| stateadded           | state     | The state that was attached (string).              |
| stateremoved         | state     | The state that was detached (string).              |
| schemachanged        | component | Name of component that had it's schema changed.    |

#### Listening for Component Changes

We can use the `componentchanged` event to listen for changes to the entity:

```js
entity.addEventListener('componentchanged', function (evt) {
  if (evt.detail.name === 'position') {
    console.log('Entity has moved from', evt.detail.oldData, 'to', evt.detail.newData, '!');
  }
});
```

#### Listening for Child Elements Being Attached and Detached

We can use the `child-attached` and `child-detached` events to listen for when
the scene attaches or detaches an entity:

```js
entity.addEventListener('child-attached', function (evt) {
  if (evt.detail.el.tagName.toLowerCase() === 'a-box') {
    console.log('a box element has been attached');
  };
});
```
