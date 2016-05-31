---
title: Component
type: core
layout: docs
parent_section: core
order: 3
---

In the [entity-component-system pattern](./index.md), a component is a reusable and modular chunks of data that plugged into an entity to add appearance, behavior, and/or functionality. As an abstract analogy, if a smartphone were defined as an entity, we might use components to give it appearance (color, shape), to define its behavior (vibrate when called, shut down on low battery), or to add functionality (camera, screen). In A-Frame, a component modifies entities which are 3D objects in the scene.

> Try to contain most logic within components in A-Frame experiences, even if the logic is one-off or ad-hoc. This encourages reusability, modularity, and sharing of code.

Components are roughly analoguous to CSS. Like how CSS rules modify the appearance of elements, component properties modify the appearance, behavior, and functionality of entities.

## Table of Contents

Components provide all of the features and extensibility of A-Frame. There is a lot to cover:

- [What a Component Looks Like](#what-a-component-looks-like)
    - [From the DOM](#from-the-dom)
    - [Under the Hood](#under-the-hood)
- [Schema](#schema)
    - [Property Types](#property-types)
    - [Single-Property Schemas](#single-property-schemas)
    - [Multi-Property Schemas](#multi-property-schemas)
- [Lifecycle Methods](#lifecycle-methods)
    - [Component.init()](#component-init)
    - [Component.update(oldData)](#component-update-olddata)
    - [Component.remove()](#component-remove)
    - [Component.tick(time)](#component-tick-time)
    - [Component.pause()](#component-pause-component-play)
    - [Component.play()](#component-pause-component-play)
- [Writing a Component](#writing-a-component)
    - [Line Component](#line-component)
    - [Skeleton](#skeleton)
    - [Schema](#schema)
    - [Update](#update)
    - [Usage](#usage)

## What a Component Looks Like

A component holds a bucket of data in the form of one or more component properties. This data is used to modify the entity. Consider an *engine* component, we might define properties such as *horsepower* or *cylinders*.

![](http://thevrjump.com/assets/img/articles/aframe-system/aframe-system.jpg)
<div class="page-caption"><span>
Abstract representation of a component by @rubenmueller of [The VR Jump][vrjump].
</span></div>

### From the DOM

In A-Frame, we attach and configure a component to an entity using an HTML attribute for a component name and a inline-style-like syntax for the properties:

```html
<a-entity light="type: point; color: crimson; intensity: 2.5"></a-entity>
```

For a component that takes a single flat property value, it looks like a normal HTML attribute:

```html
<a-entity position="0 1 4"></a-entity>
```

## Under the Hood

A component is registered using `AFRAME.registerComponent`, which we pass a component name to register a component under and a component definition. Below is the outer skeleton for the [position component][position]:

```js
AFRAME.registerComponent('position', {
  // ...
});
```

A component defines a **schema** that defines its properties, giving *anatomy* to the component. The position component takes a flat `vec3`, or an `{x, y, z}` object.

```js
AFRAME.registerComponent('position', {
  schema: { type: 'vec3' },

  // ...
});
```

Then a component defines lifecycle methods that handles what it does with its data, giving *physiology* to the component. During initialization and on attribute updates, the position component takes its `vec3` value and applies it to its [three.js Object3D][object3d]:

> Components will often be talking to the three.js API.

```js
AFRAME.registerComponent('position', {
  schema: { type: 'vec3' },

  update: function () {
    var object3D = this.el.object3D;
    var data = this.data;
    object3D.position.set(data.x, data.y, data.z);
  }
});
```

The position component uses only a small subset of the component API. We'll go over everything the component API has to offer.

### Properties

| Property | Description                                                                                                      |
|----------|------------------------------------------------------------------------------------------------------------------|
| data     | Parsed data object of the component derived from the schema default values, mixins, and the entity's attributes. |
| el       | Reference to the [entity][entity] element.                                                                       |
| schema   | Component property names, types, default values, parsers, and stringifiers.                                      |

### Methods

| Method | Description                                                                                                                                   |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| init   | Called once when the component is initialized. Used to set up initial state and instantiate variables.                                        |
| update | Called both when the component is initialized and whenever the component's data changes (e.g, via *setAttribute*). Used to modify the entity. |
| remove | Called when the component detaches from the element (e.g., via *removeAttribute*). Used to undo all previous modifications to the entity.     |
| tick   | Called on each render loop or tick of the scene. Used for continuous changes.                                                                 |
| play   | Called whenever the scene or entity plays to add any background or dynamic behavior. Used to start or resume behavior.                        |
| pause  | Called whenever the scene or entity pauses to remove any background or dynamic behavior. Used to pause behavior.                              |

## Schema

A component's schema defines and describes the property or properties it takes. A component can either be a single-property component (one flat value) or a multi-property component (multiple named values).

A single-property schema might look like:

```js
schema: {
  type: 'int', default: 5
}
```

A multi-property schema might look like:

```js
schema: {
  color: { default: '#FFF' },
  target: { type: 'selector' },
  uv: {
    default: '1 1',
    parse: function (value) {
      return value.split(' ').map(parseFloat);
    }
  },
}
```

### Property Types

All properties have **property types**. Property types define how the component parses incoming data from the DOM, and they prescribe a default value if one is not defined in the property definition. A-Frame comes with several built-in property types such as `boolean`, `int`, `number`, `selector`, `src`, `string`, and `vec3`.

Each type assigns a `parse` and a `stringify` function. Parsers deserialize the incoming string value from the DOM to be put into the component's data object. Stringifiers serialize values back to the DOM when calling `setAttribute` with a non-string value. Alternatively, we can define our own property types by providing our own `parse` and/or `stringify` functions.

### Schema Inference

Property types can either be assigned explicitly, or the schema will infer one given the default value.

Given a default value, the schema will infer a property type and inject a parser and stringifer into the property definition:

```js
schema: {
  default: 32
}

// Will process to:

schema: {
  default: 32,
  type: 'number',
  parse: function numberParse (value) {
    return parseFloat(value);
  },
  stringify: function defaultStringify (value) {
    return value.toString();
  }
}
```

And given only a type, the schema will infer a default value:

```
schema: {
  type: 'vec3'
}

// Will process to:

schema: {
  type: 'vec3',
  default: { x: 0, y: 0, z: 0 },
  parse: AFRAME.utils.coordinates.parse,
  stringify: AFRAME.utils.coordinates.stringify
}
```

### Single-Property Schemas

Single-property schemas define only a single anonymous flat property. They must define either a `type` or a `default` value to be able to infer an appropriate parser and stringifier.

For example, the [rotation component][rotation] takes a `vec3`:

```js
AFRAME.registerComponent('rotation', {
  schema: {
    // Default value will be 0, 0, 0 as defined by the vec3 property type.
    type: 'vec3'
  }

  // ...
});
```

And for example, the [visible component][visible] takes a boolean:

```js
AFRAME.registerComponent('visible', {
  schema: {
    // Type will be inferred to be boolean.
    default: true
  },

  // ...
});
```

### Multi-Property Schemas

Multi-property schemas it consists of one or more named property definitions. Unlike single-property schemas, each property has a name. When a component has properties then the HTML usage syntax will look like `physics="mass: 2; velocity: 1 1 1"`.

For example, a physics component might look like:

```js
AFRAME.registerComponent('physics-body', {
  schema: {
    boundingBox: {
      type: 'vec3',
      default: { x: 1, y: 1, z: 1 }
    },
    mass: {
      default: 0
    },
    velocity: {
      type: 'vec3'
    }
  }
}
```

## Lifecycle Methods

With the schema being the anatomy, the lifecycle methods are the physiology; the schema defines the data, the lifecycle methods *use* the data. A component has access to `this.data` which in a single-property schema is a value and in a multi-property schema is an object.

The handlers will almost always interact with the entity. We recommend checking out the [Entity documentation](./entity.md).

### Component.init()

`init` is called once in a component's lifecycle when it is attached to the entity. The init handler is generally used to set up state and instantiate variables that may used throughout a component. Not every component will need to define `init`. It is similar to `createdCallback` or `React.ComponentDidMount`.

For example, the [look-at component](../components/look-at.md)'s init handler sets the state of the target to `null` and instantiates a Vector object:

```js
init: function () {
  this.target3D = null;
  this.vector = new THREE.Vector3();
},

// ...
```

Example uses of `init` by some A-Frame components:

| Component     | Usage                                                             |
|---------------|-------------------------------------------------------------------|
| camera        | Create and set a THREE.PerspectiveCamera on the entity.           |
| cursor        | Attach event listeners.                                           |
| light         | Register light to the lighting system.                            |
| look-at       | Create a helper vector.                                           |
| material      | Set up variables, mainly to visualize the state of a component. |
| wasd-controls | Set up an object to keep track of pressed keys. Bind methods.     |

### Component.update(oldData)

`update` is called both at the beginning of a component's lifecycle and every time a component's data changes (e.g., as a result of `setAttribute`). The update handler often uses `this.data` to modify the entity. The update handler has access to the previous state of a component's data via its first argument. The previous state of a component can be used to tell exactly which properties changed in order to do granular updates.

For example, the [visible][visible] component's update handler toggles the visibility of the [entity](./entity.md):

```js
update: function () {
  this.el.object3D.visible = this.data;
}
```

Example uses of `update` by some A-Frame components:

| Component     | Usage                                                                                                                                       |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| camera        | Set THREE.PerspectiveCamera object properties such as aspect ratio, fov, or near/far clipping planes.                                       |
| look-at       | Set or update target entity to track the position of.
| material      | If component is just attaching, create a material. If shader has not changed, update material. If shader has changed, replace the material.
| wasd-controls | Update the position based on the current velocity. Update the velocity based on the keys pressed.

### Component.remove()

`remove` is called when a component detaches from the entity (e.g., as a result of `removeAttribute`). This is used to remove all modifications, listeners, and behaviors to the entity that a component has added in its lifetime.

For example, when the [light component][light] detaches, it removes the light it previously attached to the entity:

```js
remove: function () {
  this.el.removeObject3D('light');
}
```

Example uses of `remove` by some A-Frame components:

| Component     | Usage                                                                                      |
|---------------|--------------------------------------------------------------------------------------------|
| camera        | Remove the THREE.PerspectiveCamera from the entity.                                        |
| geometry      | Set a plain THREE.Geometry on the mesh.                                                    |
| material      | Set a default THREE.MeshBasicMaterial on the mesh and unregister material from the system. |
| wasd-controls | Remove keydown and keyup listeners.                                                        |

### Component.tick(time)

`tick` is called on every single tick or render loop of the scene. Expect it to run on the order of 60-90 times per second. The global uptime of the scene in seconds is passed into the tick handler, which is used to calculate time deltas.

For example, the [look-at][look-at] component's tick handler updates the entity's rotation to face towards a potentially moving target entity:

```js
tick: function (t) {
  // target3D and vector are set from the update handler.
  if (this.target3D) {
    this.el.object3D.lookAt(this.vector.setFromMatrixPosition(target3D.matrixWorld));
  }
}
```

Example uses of `tick` by some A-Frame components:

| Component     | Usage                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------|
| look-at       | Update rotation of entity to face towards tracked target, in case the target is moving.              |
| physics       | Update the physics world simulation.                                                                 |
| wasd-controls | Use current velocity to move the entity (generally the camera), update velocity if keys are pressed. |

### Component.pause(), Component.play()

To support pause and play, just as with a video game or to toggle entities for performance, a component can implement the `play` and `pause` handlers. These are invoked when a component's entity calls its `play` or `pause` method. When an entity plays or pauses, all of its child entities are also played or paused. A component should implement a play and pause handler if it registers dynamic, asynchronous, or background behaviors such as animations or event listeners.

For example, the [look-controls component]'s play and pause handlers toggles its event listeners for listening to input:

```js
pause: function () {
  this.removeEventListeners()
},

play: function () {
  this.addEventListeners()
}
```

Example uses of `pause` and `play` by some A-Frame components:

| Component     | Usage                          |
|---------------|--------------------------------|
| sound         | Pause/play sound.              |
| wasd-controls | Remove/attach event listeners. |

## Writing a Component

### Line Component

Let's build a basic line component that renders a line. We want to make the property API flexible enough to be able to specify the color and vertices:

```html
<a-entity line="color: red; path: -1 1 0, -1 0.5 0, -1 0 0"></a-entity>
```

#### Skeleton

Here is a skeleton of the component. We'll just need a schema, a update handler, and a remove handler:

```js
var coordinates = AFRAME.utils.coordinates;

AFRAME.registerComponent('line', {
  // Allow line component to accept vertices and color.
  schema: {},

  // Create or update the line geometry.
  update: {},

  // Remove the line geometry.
  remove: {}
});
```

#### Schema

We have two properties we want to accept: `color` and `path`. Thus we will need a multi-property schema. The `color` property will be a simple string that will be fed to `THREE.Color`. The `path` property will need a custom parser and stringifier to handle an array of `vec3`s for the vertices.

```js
  // Allow line component to accept vertices and color.
  schema: {
    color: { default: '#333' },

    path: {
      default: [
        { x: -0.5, y: 0, z: 0 },
        { x: 0.5, y: 0, z: 0 }
      ],

      // Deserialize path in the form of comma-separated vec3s: `0 0 0, 1 1 1, 2 0 3`.
      parse: function (value) {
        return value.split(',').map(coordinates.parse);
      },

      // Serialize array of vec3s in case someone does
      // setAttribute('line', 'path', [...]).
      stringify: function (data) {
        return data.map(coordinates.stringify).join(',');
      }
    }
  },

  //...
```

The component API is entirely up to us. If we wanted the path to take a different syntax or abstract it further such that it maybe only accepts a starting point and a length and handle the math for the developer, we could do so.

#### Update

The schema will hand the data to the update handler all parsed and ready to go. Here, we want to create a line geometry if it doesn't exist yet and update it if it does. We can create a line in three.js by combining a `THREE.LineBasicMaterial` and `THREE.Geometry` and then manually pushing vertices.

```js
update: function (oldData) {
  // Set color with material.
  var material = new THREE.LineBasicMaterial({
    color: this.data.color
  });

  // Add vertices to geometry.
  var geometry = new THREE.Geometry();
  this.data.path.forEach(function (vec3) {
    geometry.vertices.push(
      new THREE.Vector3(vec3.x, vec3.y, vec3.z)
    );
  });

  // Apply mesh.
  this.el.setObject3D('mesh', new THREE.Line(geometry, material));
},

// ...
```

Here, we update the line by completely replacing it. Though sometimes, we might want to more granularly update objects for better performance.

#### Remove

For removal of the line mesh from the entity, we use [`Entity.removeObject3D`][removeObject3d]:

```js
remove: function () {
  this.el.removeObject3D('mesh');
}
```

This will remove the object from the entity's scene graph.

#### Usage

Then with the line component written and registered, we can use it in HTML:

```html
<a-scene>
  <a-assets>
    <a-mixin id="red" line="color: #E20049"></a-mixin>
  </a-assets>

  <a-entity id="happy-face" position="0 2 -10">
    <a-entity mixin="red" line="path: -1 1 0, -1 0.5 0, -1 0 0"></a-entity>
    <a-entity mixin="red" line="path: 1 1 0, 1 0.5 0, 1 0 0"></a-entity>
    <a-entity mixin="red" line="path: -2 -1 0, 0 -2 0, 2 -1"></a-entity>
  </a-entity>

  <a-sky color="#FFEED0"></a-sky>
</a-scene>
```

And voila!

![](http://i.imgur.com/icggby2.jpg)
<div class="page-caption"><span>
  Happy face with the line component! Play with it on [Codepen][line-codepen].
</span></div>

[collide]: https://github.com/dmarcos/a-invaders/tree/master/js/components
[docs]: ./index.md
[entity]: ./entity.md
[follow]: https://jsbin.com/dasefeh/edit?html,output
[geometry]: ../components/geometry.md
[layout]: https://github.com/ngokevin/aframe-layout-component
[light]: ../components/light.md
[line-codepen]: http://codepen.io/team/mozvr/pen/yeEQNG
[look-at]: ../components/look-at.md
[look-controls]: ../components/look-controls.md
[object3d]: http://threejs.org/docs/#Reference/Core/Object3D
[physics]: https://github.com/ngokevin/aframe-physics-components
[position]: ../components/position.md
[removeObject3d]: ./entity.md#remove-object3d
[rotation]: ../components/rotation.md
[text]: https://github.com/ngokevin/aframe-text-component
[three]: http://threejs.org/
[visible]: ../components/visible.md
[vrjump]: http://thevrjump.com
