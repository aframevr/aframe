---
title: JavaScript, Events, DOM APIs
type: introduction
layout: docs
parent_section: introduction
order: 6
examples:
  - title: A-Frame School &mdash; Getting Entities
    src: https://glitch.com/edit/#!/aframe-school-js?path=solution.html
  - title: A-Frame School &mdash; Modifying Entities
    src: https://glitch.com/edit/#!/aframe-school-js?path=solution2.html
  - title: A-Frame School &mdash; Creating Entities
    src: https://glitch.com/edit/#!/aframe-school-js?path=solution3.html
  - title: A-Frame School &mdash; Handling Events
    src: https://glitch.com/edit/#!/aframe-school-js?path=solution4.html
  - title: Animated Lights
    src: https://glitch.com/edit/#!/aframe-animated-lights?path=index.html
---

[geometry]: ../components/geometry.md
[DOM]: https://developer.mozilla.org/docs/Web/API/Document_Object_Model/Introduction
[object3d]: https://threejs.org/docs/#api/core/Object3D

Since A-Frame is just HTML, we can control the scene and its entities using
JavaScript and [DOM] APIs as we mostly would in ordinary web development.

[vrjump]: http://vrjump.de

[jsimage]: https://cloud.githubusercontent.com/assets/674727/20290105/e1573210-aa92-11e6-8f1a-8a31fb6dad52.jpg
![With JavaScript][jsimage]
<small class="image-caption"><i>Image by Ruben Mueller from [The VR Jump][vrjump].</i></small>

[entity]: ../core/entity.md
Every element in the scene, even elements such as `<a-box>` or `<a-sky>`, are entities (represented as `<a-entity>`). A-Frame modifies the HTML element prototype to add some extra behavior for certain DOM APIs to tailor them to
A-Frame. See the [Entity API documentation][entity] for reference on most of
the APIs discussed below.

<!--toc-->

## Where to Place JavaScript Code for A-Frame

[A-Frame components]: ../core/component.md

**Important:** Before we go over the different ways to use JavaScript and DOM
APIs, we prescribe encapsulating your JavaScript code within [A-Frame
components].  Components modularize code, make logic and behavior visible from
HTML, and ensure that code is executed at the correct time (e.g., after the
scene and entities have attached and initialized). As the most basic example,
to register a `console.log` component *before* `<a-scene>`:

```js
AFRAME.registerComponent('log', {
  schema: {type: 'string'},

  init: function () {
    var stringToLog = this.data;
    console.log(stringToLog);
  }
});
```

And *after* the registration, use the component from HTML:

```html
<a-scene log="Hello, Scene!">
  <a-box log="Hello, Box!"></a-box>
</a-scene>
```

Components encapsulate all of our code to be reusable, declarative, and
shareable. Though if we're just poking around at runtime, we can use our
browser's Developer Tools Console to run JavaScript on our scene.

[contentscripts]: ../core/scene.md#running-content-scripts-on-the-scene

Do **not** try to put A-Frame-related JavaScript in a raw `<script>` tag after
`<a-scene>` as we would with traditional 2D scripting. If we do, we'd have to
take special measures to make sure code runs at the right time (see [Running
Content Scripts on the Scene][contentscripts]).

## Getting Entities by Querying and Traversing

[queryselector]: https://developer.mozilla.org/docs/Web/API/Document/querySelector
[jqueryselector]: https://api.jquery.com/category/selectors/

The wonderful thing about the DOM as a scene graph is that the standard DOM
provides utilities for traversal, querying, finding, and selecting through
`.querySelector()` and `.querySelectorAll()`. Originally inspired by [jQuery
selectors][jqueryselector], we can [learn about query selectors on
MDN][queryselector].

Let's run a few example query selectors. Take the scene below for example.

```html
<html>
  <a-scene>
    <a-box id="redBox" class="clickable" color="red"></a-box>
    <a-sphere class="clickable" color="blue"></a-sphere>
    <a-box color="green"></a-box>
    <a-entity light="type: ambient"></a-entity>
    <a-entity light="type: directional"></a-entity>
  </a-scene>
</html>
```

### With `.querySelector()`

If we want to grab just one element, we use `.querySelector()` which returns
one element. Let's grab the scene element:

```js
var sceneEl = document.querySelector('a-scene');
```

Note if we were working within a component, we'd already have a reference to
the scene element without needing to query. All entities have reference to
their scene element:

```js
AFRAME.registerComponent('foo', {
  init: function () {
    console.log(this.el.sceneEl);  // Reference to the scene element.
  }
});
```

If an element has an ID, we can use an ID selector (i.e., `#<ID>`). Let's grab
the red box which has an ID. Before we did a query selector on the entire
document. Here, we'll do a query selector just within the scope of the scene.
With query selectors, we're able to limit to scope of the query to within any
element:

```js
var sceneEl = document.querySelector('a-scene');
console.log(sceneEl.querySelector('#redBox'));
// <a-box id="redBox" class="clickable" color="red"></a-box>
```

### With `.querySelectorAll()`

If we want to grab a group of elements, we use `.querySelectorAll()` which returns
an array of elements. We can query across element names:

```js
console.log(sceneEl.querySelectorAll('a-box'));
// [
//  <a-box id="redBox" class="clickable" color="red"></a-box>,
//  <a-box color="green"></a-box>
// ]
```

We can query for elements that have a class with a class selector (i.e.,
`.<CLASS_NAME>`). Let's grab every entity that has the `clickable` class:

```js
console.log(sceneEl.querySelectorAll('.clickable'));
// [
//  <a-box id="redBox" class="clickable" color="red"></a-box>
//  <a-sphere class="clickable" color="blue"></a-sphere>
// ]
```

We can query for elements containing an attribute (or in this case, a
component) with an attribute selector (i.e., `[<ATTRIBUTE_NAME>]`). Let's grab
every entity that has a light:

```js
console.log(sceneEl.querySelectorAll('[light]'));
// [
//  <a-entity light="type: ambient"></a-entity>
// <a-entity light="type: directional"></a-entity>
// ]
```

### Looping Over Entities from `.querySelectorAll()`

If we grabbed a group of entities using `.querySelectorAll()`, we can loop over
them with a `for` loop. Let's loop over every element in the scene with `*`.

```js
var els = sceneEl.querySelectorAll('*');
for (var i = 0; i < els.length; i++) {
  console.log(els[i]);
}
```

## Retrieving Component Data with `.getAttribute()`

We can get the data of components of an entity via `.getAttribute`. A-Frame
augments `.getAttribute` to return values rather than strings (e.g., returning
objects in most cases since components usually consist of multiple properties,
or returning an actual boolean for like `.getAttribute('visible')`.  Often,
`.getAttribute` will return the internal data object of the component so do not
modify the object directly:

```js
// <a-entity geometry="primitive: sphere; radius: 2"></a-entity>
el.getAttribute('geometry');
// >> {"primitive": "sphere", "radius: 2", ...}
```

### Retrieving `position` and `scale`

[vector3]: https://threejs.org/docs/#api/math/Vector3
[updatepos]: #updating-position-rotation-scale-visible

Doing `el.getAttribute('position')` or `el.getAttribute('scale')` will return
the three.js [Object3D][object3d] position and scale properties which are
[Vector3][vector3]s. Keep in mind that modifying these objects will modify the
actual entity data.

This is because A-Frame allows us to [modify position, rotation, scale,
visible][updatepos] at the three.js level, and in order for `.getAttribute` to
return the correct data, A-Frame returns the actual three.js Object3D objects.

This is not true for the `.getAttribute('rotation')` because A-Frame, for
better or worse, uses degrees instead of radians. In such case, a normal
JavaScript object with x/y/z properties is returned. The Object3D Euler can be
retrieved via `el.object3D.rotation` if we need to work at a lower level with
radians.

## Modifying the A-Frame Scene Graph

With JavaScript and DOM APIs, we can dynamically add and remove entities as we
would with normal HTML elements.

### Creating an Entity with `.createElement()`

To create an entity, we can use `document.createElement`. This will give us a
blank entity:

```js
var el = document.createElement('a-entity');
```

However, this entity will not be initialized or be a part of the scene until we
attach it to our scene.

### Adding an Entity with `.appendChild()`

To add an entity to the DOM, we can use `.appendChild(element)`. Specifically,
we want to add it to our scene. We grab the scene, create the entity, and
append the entity to our scene.

```js
var sceneEl = document.querySelector('a-scene');
var entityEl = document.createElement('a-entity');
// Do `.setAttribute()`s to initialize the entity.
sceneEl.appendChild(entityEl);
```

Note that `.appendChild()` is an *asynchronous* operation in the browser. Until
the entity has finished appending to the DOM, we can't do many operations on
the entity (such as calling `.getAttribute()`). If we need to query an
attribute on an entity that has just been appended, we can listen to the
`loaded` event on the entity, or place logic in an A-Frame component so that
it is executed once it is ready:

```js
var sceneEl = document.querySelector('a-scene');

AFRAME.registerComponent('do-something-once-loaded', {
  init: function () {
    // This will be called after the entity has properly attached and loaded.
    console.log('I am ready!');
  }
});

var entityEl = document.createElement('a-entity');
entityEl.setAttribute('do-something-once-loaded', '');
sceneEl.appendChild(entityEl);
```

### Removing an Entity with `.removeChild()`

To remove an entity from the DOM and thus from the scene, we call
`.removeChild(element)` from the parent element. If we have an entity, we have to
ask its parent (`parentNode`) to remove the entity.

```js
entityEl.parentNode.removeChild(entityEl);
```

## Modifying an Entity

A blank entity doesn't do anything. We can modify the entity by adding
components, configuring component properties, and removing components.

### Adding a Component with `.setAttribute()`

To add a component, we can use `.setAttribute(componentName, data)`. Let's add
a geometry component to the entity.

```js
entityEl.setAttribute('geometry', {
  primitive: 'box',
  height: 3,
  width: 1
});
```

[physics]: https://github.com/donmccurdy/aframe-physics-system

Or adding [the community physics component][physics]:

```js
entityEl.setAttribute('dynamic-body', {
  shape: 'box',
  mass: 1.5,
  linearDamping: 0.005
});
```

[setattr]:  ../core/entity.md#setattribute-attr-value-componentattrvalue

Unlike a normal HTML `.setAttribute()`, an entity's `.setAttribute()` is
improved to take a variety of types of arguments such as objects, or to be able
to update a single property of a component. [Read more about
`Entity.setAttribute()`][setattr].

### Updating a Component with `.setAttribute()`

To update a component, we also use `.setAttribute()`. Updating a component
takes several forms.

#### Updating Property of Single-Property Component

[position]: ../components/position.md

Let's update the property of the [position component][position], a
single-property component. We can pass either an object or a string. It is
slightly preferred to pass an object so A-Frame doesn't have to parse the
string.

```js
entityEl.setAttribute('position', {x: 1, y: 2, z: -3});
// Read on to see why `entityEl.object3D.position.set(1, 2, -3)` is preferred though.
```

#### Updating Single Property of Multi-Property Component

[material]: ../components/material.md

Let's update a single property of the [material component][material], a
multi-property component. We do this by providing the component name, property
name, and then property value to `.setAttribute()`:

```js
entityEl.setAttribute('material', 'color', 'red');
```

#### Updating Multiple Properties of a Multi-Property Component

[light]: ../components/light.md

Let's update multiple properties at once of the [light component][material], a
multi-property component. We do this by providing the component name and an
object of properties to `.setAttribute()`. We'll change the light's color and
intensity but leave the type the same:

```js
// <a-entity light="type: directional; color: #CAC; intensity: 0.5"></a-entity>
entityEl.setAttribute('light', {color: '#ACC', intensity: 0.75});
// <a-entity light="type: directional; color: #ACC; intensity: 0.75"></a-entity>
```

#### Updating `position`, `rotation`, `scale`, and `visible`.

As a special case, for better performance, memory, and access to utilities, we
recommend modifying `position`, `rotation`, `scale`, and `visible` directly at
the three.js level via the entity's [Object3D][object3d] rather than via
`.setAttribute`:

```js
// Examples for position.
entityEl.object3D.position.set(1, 2, 3);
entityEl.object3D.position.x += 5;
entityEl.object3D.position.multiplyScalar(5);

// Examples for rotation.
entityEl.object3D.rotation.y = THREE.Math.degToRad(45);
entityEl.object3D.rotation.divideScalar(2);

// Examples for scale.
entityEl.object3D.scale.set(2, 2, 2);
entityEl.object3D.scale.z += 1.5;

// Examples for visible.
entityEl.object3D.visible = false;
entityEl.object3D.visible = true;
```

This lets us skip over the `.setAttribute` overhead and instead do simple
setting of properties for components that are most commonly updated. Updates at
the three.js level will still be reflected when doing for example
`entityEl.getAttribute('position');`.

#### Replacing Properties of a Multi-Property Component

Let's replace all the properties of the [geometry component][geometry], a
multi-property component. We do this by providing the component name, an object
of properties to `.setAttribute()`, and a flag that specifies to clobber the
existing properties. We'll replace all of the geometry's existing properties with new properties:

```js
// <a-entity geometry="primitive: cylinder; height: 4; radius: 2"></a-entity>
entityEl.setAttribute('geometry', {primitive: 'torusKnot', p: 1, q: 3, radiusTubular: 4}, true);
// <a-entity geometry="primitive: torusKnot; p: 1; q: 3; radiusTubular: 4"></a-entity>
```

### Removing a Component with `.removeAttribute()`

To remove or detach a component from an entity, we can use
`.removeAttribute(componentName)`. Let's remove the default `wasd-controls`
from the camera entity:

```js
var cameraEl = document.querySelector('[camera]');
cameraEl.removeAttribute('wasd-controls');
```

## Events and Event Listeners

[eventlistener]: http://javascript.info/tutorial/introduction-browser-events

With JavaScript and the DOM, there is an easy way for entities and components
to communicate with one another: events and event listeners.  Events are a way
to send out a signal that other code can pick up and respond to. [Read more
about browser events][eventlistener].

### Emitting an Event with `.emit()`

A-Frame elements provide an easy way to emit custom events with
`.emit(eventName, eventDetail, bubbles)`. For example, let's say we are
building a physics component and we want the entity to send out a signal when
it has collided with another entity:

```js
entityEl.emit('physicscollided', {collidingEntity: anotherEntityEl}, false);
```

Then other parts of the code can wait and listen on this event and run code in
response. We can pass information and data through the event detail as the
second argument. And we can specify whether the event *bubbles*, meaning that
the parent entities will also emit the event. So other parts of the code can
register an event listener.

### Adding an Event Listener with `.addEventListener()`

Like with normal HTML elements, we can register an event listener with
`.addEventListener(eventName, function)`. When the event the listener is
registered to is emitted, then the function will be called and handle the
event. For example, continuing from the previous example with the physics
collision event:

```js
entityEl.addEventListener('physicscollided', function (event) {
  console.log('Entity collided with', event.detail.collidingEntity);
});
```

When the entity emits the `physicscollided` event, the function will be called
with the event object. Notably in the event object, we have the event detail
which contains data and information passed through the event.

### Removing an Event Listener with `.removeEventListener()`

Like with normal HTML elements, when we want to remove the event listener, we
can use `.removeEventListener(eventName, function)`. We have to pass the same
event name and function that the listener was registered with. For example,
continuing from the previous example with the physics collision event:

```js
// We have to define this function with a name if we later remove it.
function collisionHandler (event) {
  console.log('Entity collided with', event.detail.collidingEntity);
}

entityEl.addEventListener('physicscollided', collisionHandler);
entityEl.removeEventListener('physicscollided', collisionHandler);
```

## Caveats

[faq]: ./faq.md#why-is-the-html-not-updating-when-i-check-the-browser-inspector
[mutation-observer]: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
[attr-selectors]: https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors

A-Frame entities and primitives are implemented in a way that
[favours performance][faq] such that some HTML APIs may not work as expected.
For instance, [attribute selectors involving values][attr-selectors] won't work
and a [mutation observer][mutation-observer] won't trigger changes when a entity's
component is altered.
