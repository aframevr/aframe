---
title: Utils
type: core
layout: docs
parent_section: core
order: 11
---

A-Frame's utility modules are public through `AFRAME.utils`.

<!--toc-->

## `AFRAME.utils.coordinates`

Module for handling vec3 and vec4 types.

### `.isCoordinate (value)`

Tests whether a string is a vec3.

```js
AFRAME.utils.coordinates.isCoordinate('1 2 3')
// >> true
```

### `.parse (value)`

Parses an "x y z" string to an `{x, y, z}` vec3 object. Or parses an "x y z w" string to an {x, y, z, w} vec4 object.

```js
AFRAME.utils.coordinates.parse('1 2 -3')
// >> {x: 1, y: 2, z: -3}
```

### `.stringify (data)`

Stringifies an `{x, y, z}` vec3 object to an "x y z" string.

```js
AFRAME.utils.coordinates.stringify({x: 1, y: 2, z: -3})
// >> "1 2 -3"
```

## `AFRAME.utils.entity`

[getattr]: ./entity.md#getattribute-componentname

### `.getComponentProperty(entity, componentName, delimiter='.')`

Performs like [`Entity.getAttribute`][getattr], but with support for
return an individual property for a multi-property component. `componentName`
is a string that can either be a component name, or a component name delimited
with a property name.

```js
// <a-entity id="box" geometry="primitive: box"></a-entity>
var entity = document.querySelector('#box');

AFRAME.utils.entity.getComponentProperty(entity, 'geometry.primitive');
AFRAME.utils.entity.getComponentProperty(entity, 'geometry|primitive', '|');
// >> 'box'

AFRAME.utils.entity.getComponentProperty(entity, 'geometry');
// >> {primitive: 'box', width: 1, ...}
```

This is useful for components that need a way to reference a property of a
multi-property component.

### `.setComponentProperty (entity, componentName, value, delimiter)`

[setattr]: ./entity.md#setattribute-attr-value-componentattrvalue

Performs like [`Entity.setAttribute`][setattr], but with support for setting an
individual property for a multi-property component. `componentName` is a string
that can either be a component name, or a component name delimited with a
property name.

```js
// <a-entity id="box" geometry="primitive: box"></a-entity>
var entity = document.querySelector('#box');

AFRAME.utils.entity.setComponentProperty(entity, 'geometry.width', 1);
AFRAME.utils.entity.setComponentProperty(entity, 'geometry|height', 2, '|');
AFRAME.utils.entity.setComponentProperty(entity, 'geometry', {depth: 3});
```

## AFRAME.utils.styleParser

### `.parse (value)`

Parses a CSS style-like string to an object.

```js
AFRAME.utils.styleParser.parse('attribute: color; dur: 5000;')
// >> {"attribute": "color", "dur": "5000"}
```

### `.stringify (data)`

Stringifies an object to a CSS style-like string.

```js
AFRAME.utils.styleParser.stringify({height: 10, width: 5})
// >> "height: 10; width: 5"
```

## Object Utils

### `AFRAME.utils.deepEqual (a, b)`

Checks if two objects have the same attributes and values, including nested objects.

```
deepEqual({a: 1, b: {c: 3}}, {a: 1, b: {c: 3}})
// >> true
```

### `AFRAME.utils.diff (a, b)`

Returns difference between two objects. The returned object's set of keys denote which values were not equal, and the set of values are `b`'s values.

```js
diff({a: 1, b: 2, c: 3}, {b: 2, c: 4})
// >> {"a": undefined, "c": 4}
```

### `AFRAME.utils.extend(target, source, [source, ...])`

[Object Assign polyfill](https://www.npmjs.com/package/object-assign)

### `AFRAME.utils.extendDeep (target, source, [source, ...])`

[Deep Assign](https://www.npmjs.com/package/deep-assign)

## `AFRAME.utils.device`

### `AFRAME.utils.device.checkHasPositionalTracking ()`

Checks if there is positional tracking available. Returns a `boolean`.

### `AFRAME.utils.device.checkHeadsetConnected ()`

Checks if a VR headset is connected by looking for orientation data. Returns a `boolean`.

### `AFRAME.utils.device.isGearVR ()`

Checks if device is Gear VR. Returns a `boolean`.

### `AFRAME.utils.device.isMobile ()`

Checks if device is a smartphone. Returns a `boolean`.

## Function Utils

### `AFRAME.utils.throttle (function, interval [, optionalContext])`

Returns a throttled function that is called at most once every
`minimumInterval` milliseconds. A context such as `this` can be provided to
handle function binding for convenience.

### `AFRAME.utils.throttleTick (function (t, dt) {...}, interval [, optionalContext])`

Returns a throttled function that is called at most once every
`minimumInterval` milliseconds. A context such as `this` can be provided to
handle function binding for convenience.

This variant of `.throttle()` is slightly more performant and tailored for
`tick` handlers as it uses the `t` and `dt` timestamps passed by the global
render loop.

```js
AFRAME.registerComponent('foo', {
  init: function () {
    // Set up the tick throttling.
    this.tick = AFRAME.utils.throttleTick(this.throttledTick, 500, this);
  },

  /**
   * Tick function that will be wrapped to be throttled.
   */
  throttledTick: function (t, dt) {}
});
```
