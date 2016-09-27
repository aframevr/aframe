---
title: Component
type: core
layout: docs
parent_section: core
order: 3
---

In the [entity-component-system pattern][ecs], a component is a reusable and
modular chunk of data that is plugged into an entity to add appearance, behavior,
and/or functionality.

In A-Frame, components modify entities which are 3D objects in the scene. We
mix and compose components together to build complex objects. They let us
encapsulate [three.js][three] and JavaScript code into modules that can be used
declaratively from HTML.

As an abstract analogy, if a smartphone were defined as an entity, we might use
components to give it appearance (color, shape), to define its behavior
(vibrate when called, shut down on low battery), or to add functionality
(camera, screen).

Components are roughly analogous to CSS. Like how CSS rules modify the
appearance of elements, component properties modify the appearance, behavior,
and functionality of entities.

<!--toc-->

## What a Component Looks Like

A component holds a bucket of data in the form of one or more component
properties. This data is used to modify the entity. Consider an *engine*
component, we might define properties such as *horsepower* or *cylinders*.

![](http://thevrjump.com/assets/img/articles/aframe-system/aframe-system.jpg)
<div class="page-caption"><span>
Abstract representation of a component by @rubenmueller of [The VR Jump][vrjump].
</span></div>

### From HTML

HTML attributes represent component names and the value of those attributes
represent component data.

#### Single-Property Component

If a component is a *single-property* component, meaning its data is
represented by a single value, then in HTML, the component value looks like a normal
HTML attribute:

```html
<!-- `position` is the name of the position component. -->
<!-- `1 2 3` is the data of the position component. -->
<a-entity position="1 2 3"></a-entity>
```

#### Multi-Property Component

If a component is a *multi-property* component, meaning its data is represented
by several properties and values, then in HTML, the component value looks like
inline CSS styles:

```html
<!-- `light` is the name of the light component. -->
<!-- The `type` property of the light is set to `point`. -->
<!-- The `color` property of the light is set to `crimson`. -->
<a-entity light="type: point; color: crimson"></a-entity>
```

## Under the Hood

A component is registered using `AFRAME.registerComponent`, which we pass a
component name to register a component under and a component definition. Below
is the outer skeleton for the [position component][position]:

```js
AFRAME.registerComponent('position', {
  // ...
});
```

A component defines a **schema** that defines its properties, giving *anatomy*
to the component. The position component takes a flat `vec3`, or an `{x, y, z}`
object.

```js
AFRAME.registerComponent('position', {
  schema: { type: 'vec3' },

  // ...
});
```

Then a component defines lifecycle methods that handles what it does with its
data, giving *physiology* to the component. During initialization and on
attribute updates, the position component takes its `vec3` value and applies it
to its [three.js Object3D][object3d]:

Components will often be talking to the three.js API.

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

The position component uses only a small subset of the component API. We'll go
over everything the component API has to offer.

### Properties

| Property     | Description                                                                                                                  |
|--------------|------------------------------------------------------------------------------------------------------------------------------|
| attrName     | Full HTML attribute name used to define the component. Used if component can have [multiple instances][multiple].            |
| data         | Parsed data object of the component derived from the schema default values, mixins, and the entity's attributes.             |
| dependencies | Components to initialize first and wait for.                                                                                 |
| el           | Reference to the [entity][entity] element.                                                                                   |
| id           | ID or name of the individual instance of the component. Used if component can have [multiple instances][multiple].           |
| multiple     | Whether component can have [multiple instances][multiple] by suffixing `__<id>` to the HTML attribute name of the component. |
| name         | Base name used to register the component.                                                                                    |
| schema       | Component property names, types, default values, parsers, and stringifiers.                                                  |

### Methods

| Method       | Description                                                                                                                                   |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| init         | Called once when the component is initialized. Used to set up initial state and instantiate variables.                                        |
| update       | Called both when the component is initialized and whenever the component's data changes (e.g, via *setAttribute*). Used to modify the entity. |
| remove       | Called when the component detaches from the element (e.g., via *removeAttribute*). Used to undo all previous modifications to the entity.     |
| tick         | Called on each render loop or tick of the scene. Used for continuous changes.                                                                 |
| play         | Called whenever the scene or entity plays to add any background or dynamic behavior. Used to start or resume behavior.                        |
| pause        | Called whenever the scene or entity pauses to remove any background or dynamic behavior. Used to pause behavior.                              |
| updateSchema | Called on every update. Can be used to dynamically modify the schema.                                                                         |

## Dependencies

Specifying `dependencies` will guarantee that another component or other
components are initialized *before* initializing the current component:

```js
// Initializes last.
AFRAME.registerComponent('a', {
  dependencies: ['b']
});

// Initializes second.
AFRAME.registerComponent('b', {
  dependencies: ['c']
});

// Initializes first.
AFRAME.registerComponent('c', {});
```

## Multiple Instancing

By default, a component can only have one instance. For example, an entity can
only have one geometry component attached. But some components like [the sound
component][sound] can have multiple instances on a single entity. We use double
underscores (i.e., `__`) to separate the component name and the ID of
individual instances of the component

For example, to attach multiple instances of the sound component:

```html
<a-entity sound="src: url(sound.mp3)"
          sound__1="src: url(sound1.mp3)"
          sound__2="src: url(sound2.mp3)"
          sound__beep="src: url(beep.mp3)"
          sound__boop="src: url(beep.mp3)"></a-entity>
```

To enable multiple instancing on your component, set `multiple: true` in the
component definition:

```js
AFRAME.registerComponent('my-multiple-component', {
  multiple: true,

  init: function () {
    // ...
  }
});
```

The base component name is available through `this.name`. The HTML attribute
name used to attach the component is available through `this.attrName`. And
just the ID or name of the instance that follows the double underscore is
available through `this.id`.

## Schema

A component's schema defines and describes the property or properties it takes.
A component can either be a single-property component (one flat value) or a
multi-property component (multiple named values).

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

All properties have **property types**. Property types define how the component
parses incoming data from the DOM, and they prescribe a default value if one is
not defined in the property definition. Below is the list of built-in property
types:

| Property Type   | Description                                                                                                       | Default Value            |
| --------------- | -------------                                                                                                     | -------------            |
| array           | Comma-separated values to array (e.g., `"1, 2, 3" to ['1', '2', '3'].                                             | []                       |
| boolean         | Convert to boolean (i.e., `"false"` to false, everything else truthy).                                            | false                    |
| color           | Currently does no parsing. Used by the A-Frame Inspector for widgets.                                             | #FFF                     |
| int             | Calls `parseInt` (e.g., `"124.5"` to `124`).                                                                      | 0                        |
| number          | Calls `parseFloat` (e.g., `"124.5" to `124.5').                                                                   | 0                        |
| selector        | Calls `querySelector` (e.g., `"#box" to `<a-entity id="box">`).                                                   | null                     |
| selectorAll     | Calls `querySelectorAll` and converts `NodeList` to `Array` (e.g., `".boxes"` to [<a-entity class="boxes", ...]), | null                     |
| src             | Parses URL out of `url(<url>)` or if it is a selector, calls `querySelector` and `getAttribute('src')`.           | ''                       |
| string          | Does no parsing.                                                                                                  | ''                       |
| vec2            | Parses two numbers into an `{x, y}` object (e.g., `1 -2` to `{x: 1, y: -2}`.                                      | {x: 0, y: 0}             |
| vec3            | Parses three numbers into an `{x, y, z}` object (e.g., `1 -2 3` to `{x: 1, y: -2, z: 3}`.                         | {x: 0, y: 0, z: 0}       |
| vec4            | Parses four numbers into an `{x, y, z, w}` object (e.g., `1 -2 3 -4.5` to `{x: 1, y: -2, z: 3, w: -4.5}`.         | {x: 0, y: 0, z: 0, w: 0} |

The property types will parse incoming string values from the DOM and store it
in the component's `data` property. Alternatively, we can define our own
property types by providing our own `parse` functions:

```js
schema: {
  // Takes "a/b" and turns to ["a", "b'".
  myProperty: {
    default: ['a', 'b'],
    parse: function (value) {
      return value.split('/');
    }
  }
}
```

### Schema Inference

Property types can either be assigned explicitly, or the schema will infer one
given the default value.

Given a default value, the schema will infer a property type and inject a
parser and stringifer into the property definition:

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

Single-property schemas define only a single anonymous flat property. They must
define either a `type` or a `default` value to be able to infer an appropriate
parser and stringifier.

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

Multi-property schemas it consists of one or more named property definitions.
Unlike single-property schemas, each property has a name. When a component has
properties then the HTML usage syntax will look like `physics="mass: 2;
velocity: 1 1 1"`.

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

With the schema being the anatomy, the lifecycle methods are the physiology;
the schema defines the data, the lifecycle methods *use* the data. A component
has access to `this.data` which in a single-property schema is a value and in a
multi-property schema is an object.

The handlers will almost always interact with the entity. Read about the
[entity API](./entity.md) if you have not already.

### `.init()`

`.init` is called once in a component's lifecycle when it is attached to the
entity. The init handler is generally used to set up state and instantiate
variables that may used throughout a component. Not every component will need
to define `.init`. It is similar to `createdCallback` or
`React.ComponentDidMount`.

For example, the [camera component][camera]'s `init` creates
and sets the camera.

```js
init: function () {
  var camera = this.camera = new THREE.PerspectiveCamera();
  this.el.setObject3D('camera', camera);
},

// ...
```

Example uses of `init` by some A-Frame components:

| Component     | Usage                                                             |
|---------------|-------------------------------------------------------------------|
| camera        | Create and set a THREE.PerspectiveCamera on the entity.           |
| cursor        | Attach event listeners.                                           |
| light         | Register light to the lighting system.                            |
| material      | Set up variables, mainly to visualize the state of a component.   |

### `.update(oldData)`

`.update` is called both at the beginning of a component's lifecycle and every
time a component's data changes (e.g., as a result of `setAttribute`). The
update handler often uses `this.data` to modify the entity. The update handler
has access to the previous state of a component's data via its first argument.
The previous state of a component can be used to tell exactly which properties
changed in order to do granular updates.

For example, the [visible][visible] component's update handler toggles the
visibility of the [entity][entity].

```js
update: function () {
  this.el.object3D.visible = this.data;
}
```

Example uses of `update` by some A-Frame components:

| Component | Usage                                                                                                                                       |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| camera    | Set THREE.PerspectiveCamera object properties such as aspect ratio, fov, or near/far clipping planes.                                       |
| geometry  | Create new geometry given new data.                                                                                                         |
| material  | If component is just attaching, create a material. If shader has not changed, update material. If shader has changed, replace the material. |

### `.remove()`

`.remove` is called when a component detaches from the entity (e.g., as a result
of `removeAttribute`). This is used to remove all modifications, listeners, and
behaviors to the entity that a component has added in its lifetime.

For example, when the [light component][light] detaches, it removes the light
it previously attached to the entity:

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

### `.tick(time, timeDelta)`

`.tick` is called on every single tick or render loop of the scene. Expect it
to run on the order of 60 to 120 times per second. The global uptime of the
scene in milliseconds and the time difference from the last frame is passed
into the tick handler.

This is useful for things that need to update constantly such as controls or
physics.

### `.pause() and `.play()`

The `.pause` and `.play` methods are invoked when the entity calls its own
`.pause` or `.play` methods. Components should use this to stop or resume any
dynamic behavior such as event listeners.

Example uses of `.pause` and `.play` by some A-Frame components:

| Component     | Usage                          |
|---------------|--------------------------------|
| sound         | Pause/play sound.              |

### `.updateSchema()`

`.updateSchema` is optionally used to dynamically modify the schema.

Example uses of `.updateSchema` by some A-Frame components:

| Component | Usage                                                                                                 |
|-----------|-------------------------------------------------------------------------------------------------------|
| geometry  | Check if `primitive` has changed in order to change the schema to be respective to the geometry type. |
| material  | Check if `shader` has changed in order to change the schema to be respective to the material type.    |

## Methods

### `.flushToDOM()`

`flushToDOM` will manually serialize the component's data and update the DOM.
Read more about [component-to-DOM serialization][component-to-dom-serialization].

## Write a Component

### Line Component

Let's build an example line component that renders a line. We want to make the
property API flexible enough to be able to specify the color and vertices:

```html
<a-entity line="color: red; path: -1 1 0, -1 0.5 0, -1 0 0"></a-entity>
```

#### Skeleton

Here is a skeleton of the component. We'll just need a schema, a update
handler, and a remove handler:

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

We have two properties we want to accept: `color` and `path`. Thus we will need
a multi-property schema. The `color` property will be a simple string that will
be fed to `THREE.Color`. The `path` property will need a custom parser and
stringifier to handle an array of `vec3`s for the vertices.

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

The component API is entirely up to us. If we wanted the path to take a
different syntax or abstract it further such that it maybe only accepts a
starting point and a length and handle the math for the developer, we could do
so.

#### Update

The schema will hand the data to the update handler all parsed and ready to go.
Here, we want to create a line geometry if it doesn't exist yet and update it
if it does. We can create a line in three.js by combining a
`THREE.LineBasicMaterial` and `THREE.Geometry` and then manually pushing
vertices.

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

Here, we update the line by completely replacing it. Though sometimes, we might
want to more granularly update objects for better performance.

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

![](https://i.imgur.com/icggby2.jpg)
<div class="page-caption"><span>
  Happy face with the line component! Play with it on [CodePen][line-codepen].
</span></div>

[camera]: ../components/camera.md
[collide]: https://github.com/dmarcos/a-invaders/tree/master/js/components
[component-to-dom-serialization]: ../components/debug.md#component-to-dom-serialization
[docs]: ./index.md
[ecs]: ./index.md
[entity]: ./entity.md
[follow]: https://jsbin.com/dasefeh/edit?html,output
[geometry]: ../components/geometry.md
[layout]: https://github.com/ngokevin/aframe-layout-component
[light]: ../components/light.md
[line-codepen]: http://codepen.io/team/mozvr/pen/yeEQNG
[look-controls]: ../components/look-controls.md
[object3d]: http://threejs.org/docs/#Reference/Core/Object3D
[multiple]: #multiple-instancing
[physics]: https://github.com/ngokevin/aframe-physics-components
[position]: ../components/position.md
[removeObject3d]: ./entity.md#remove-object3d
[rotation]: ../components/rotation.md
[sound]: ../components/sound.md
[text]: https://github.com/ngokevin/aframe-text-component
[three]: http://threejs.org/
[visible]: ../components/visible.md
[vrjump]: http://thevrjump.com
