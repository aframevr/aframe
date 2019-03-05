---
title: Writing a Component
type: introduction
layout: docs
parent_section: introduction
order: 8
examples: []
---

[component]: ../core/component.md
[ecs]: ../introduction/entity-component-system.md
[emit]: ./javascript-events-dom-apis.md#emitting-an-event-with-emit

Components of A-Frame's [entity-component framework][ecs] are JavaScript
modules that can be mixed, matched, and composed onto entities to build
appearance, behavior, and functionality. We can register component in
JavaScript and use it declaratively from the DOM. Components are configurable,
reusable, and shareable. Most code in an A-Frame application should live within
components.

[vehicleimage]: https://cloud.githubusercontent.com/assets/674727/21803890/0d44f0c2-d6e1-11e6-8b4f-7fb14c05a492.jpg
![vehicleimage]
<small class="image-caption"><i>Image by Ruben Mueller from vrjump.de</i></small>

This guide will take it pretty slow. We recommend skimming over the [Component
API documentation][component] before going through this guide as that
documentation will be more concise. Note that components should be defined
before `<a-scene>` like:

```html
<html>
  <head>
    <script src="foo-component.js"></script>
  </head>
  <body>
    <script>
      // Or inline before the <a-scene>.
      AFRAME.registerComponent('bar', {
        // ...
      });
    </script>

    <a-scene>
    </a-scene>
  </body>
</html>
```

[learning]: #learning-through-components-in-ecosystem

We'll go over examples on writing components. The examples will do mostly
trivial things, but will demonstrate data flow, API, and usage. To see examples
of non-trivial components, see the [Learning Through Components in Ecosystem
section][learning].

<!-- toc -->

## Example: `hello-world` Component

[init]: ../core/component.md#init

Let's start with the most basic component to get a general idea. This component
will log a simple message once when the component's entity is attached using
the [`.init()` handler][init].

### Registering the Component with `AFRAME.registerComponent`

Components are registered with `AFRAME.registerComponent()`. We pass the name of
the component, which will be used as the HTML attribute name in the component's
representation in the DOM. Then we pass the **component definition** which is a
JavaScript object of methods and properties. Within the definition, we can
define **lifecycle handler methods**. One of which is [`.init()`][init], which
is called once when the component is first plugged into its entity.

In the example below, we just have our `.init()` handler log a simple message.

```js
AFRAME.registerComponent('hello-world', {
  init: function () {
    console.log('Hello, World!');
  }
});
```

### Using the Component from HTML

Then we can use our `hello-world` component declaratively as an HTML attribute.

```html
<a-scene>
  <a-entity hello-world></a-entity>
</a-scene>
```

Now after the entity is attached and initialized, it will initialize our
`hello-world` component. The wonderful thing about components is that they are
called only after the entity is ready. **We don't have to worry about waiting
for the scene or entity to set up**, it'll just work! If we check the console,
`Hello, World!` will be logged once after the scene has started running and the
entity has attached.

### Using the Component from JS

Another way to set a component, rather than via static HTML, is to set it
programmatically with `.setAttribute()`. The scene element can take components
too, let's set our `hello-world` component on the scene programmatically:

```js
document.querySelector('a-scene').setAttribute('hello-world', '');
```

## Example: `log` Component

Similar to the `hello-world` component, let's make a `log` component. It'll
still only just do `console.log`, but we'll make it able to `console.log` more
than just `Hello, World!`. Our `log` component will log whatever string its
passed in. We'll find out how to pass data to components by defining
configurable properties via the schema.

### Defining Properties with the Schema

The **schema** defines the **properties** of its component. As an analogy, if
we think of a component as a function, then a component's properties are like
its function arguments. A property has a name (if the component has more than
one property), a default value, and a **property type**. Property types define
how data is parsed if its passed as a string (i.e., from the DOM).

For our `log` component, let's define a `message` property type via the
`schema`. The `message` property type will have a `string` property type and
have a default value of `Hello, World!`:

```js
AFRAME.registerComponent('log', {
  schema: {
    message: {type: 'string', default: 'Hello, World!'}
  },
  // ...
});
```

### Using Property Data from a Lifecycle Handler

The `string` property type doesn't do any parsing on the incoming data and will
pass it to the lifecycle method handlers as is. Now let's `console.log` that
`message` property type. Like the `hello-world` component, we write a `.init()`
handler, but this time we won't be logging a hardcoded string. The component's
property type values are available through `this.data`. So let's log
`this.data.message`!

```js
AFRAME.registerComponent('log', {
  schema: {
    message: {type: 'string', default: 'Hello, World!'}
  },

  init: function () {
    console.log(this.data.message);
  }
});
```

[inlinecss]: http://webdesign.about.com/od/beginningcss/qt/tipcssinlinesty.htm

Then from HTML, we can attach the component to an entity. For a multi-property
component, the syntax is the same as [inline css styles][inlinecss] (property
name/value pairs separated by `:` and properties separated by `;`):

```html
<a-scene>
  <a-entity log="message: Hello, Metaverse!"></a-entity>
</a-scene>
```

### Handling Property Updates

So far, we've been using just the `.init()` handler which is called only once
at the beginning of the component lifecycle with only its initial properties.
But components often have their properties updated dynamically. We can use the
`.update()` handler to handle property updates.

[methodsimage]: https://cloud.githubusercontent.com/assets/674727/21803913/2966ba7e-d6e1-11e6-9179-8acafc87540c.jpg
![methodsimage]
<small class="image-caption"><i>Lifecycle method handlers. Image by Ruben Mueller from vrjump.de</i></small>

To demonstrate this, we'll have our `log` component only log whenever its
entity [emits an event][emit]. First, we'll add an `event` property type that
specifies which event the component should listen on.

```js
// ...
schema: {
  event: {type: 'string', default: ''},
  message: {type: 'string', default: 'Hello, World!'},
},
// ...
```

[addeventlistener]: ./javascript-events-dom-apis.md#adding-an-event-listener-with-addeventlistener

Then we'll actually move everything from our `.init()` handler to our
`.update()` handler. The `.update()` handler is also called right after
`.init()` when the component is attached. Sometimes, we have most of our logic
in the `.update()` handler so we can initialize *and* handle updates all at
once without repeating code.

What we want to do is [add an event listener][addeventlistener] that will
listen to the event before logging a message. If the `event` property type is
not specified, we'll just log the message:

```js
AFRAME.registerComponent('log', {
  schema: {
    event: {type: 'string', default: ''},
    message: {type: 'string', default: 'Hello, World!'}
  },

  update: function () {
    var data = this.data;  // Component property values.
    var el = this.el;  // Reference to the component's entity.

    if (data.event) {
      // This will log the `message` when the entity emits the `event`.
      el.addEventListener(data.event, function () {
        console.log(data.message);
      });
    } else {
      // `event` not specified, just log the message.
      console.log(data.message);
    }
  }
});
```

[remove an event listener]: ./javascript-events-dom-apis.md#removing-an-event-listener-with-removeeventlistener

Now that we've added our event listener property, let's handle an actual
property update. When the `event` property type changes (e.g., as a result of
`.setAttribute()`), we need to remove the previous event listener, and add a
new one.

But to [remove an event listener], we need a reference to the function. So
let's first store the function on `this.eventHandlerFn` whenever we attach an
event listener. When we attach properties to the component via `this`, they'll
be available throughout all the other lifecycle handlers.

```js
AFRAME.registerComponent('log', {
  schema: {
    event: {type: 'string', default: ''},
    message: {type: 'string', default: 'Hello, World!'}
  },

  init: function () {
    // Closure to access fresh `this.data` from event handler context.
    var self = this;

    // .init() is a good place to set up initial state and variables.
    // Store a reference to the handler so we can later remove it.
    this.eventHandlerFn = function () { console.log(self.data.message); };
  },

  update: function () {
    var data = this.data;
    var el = this.el;

    if (data.event) {
      el.addEventListener(data.event, this.eventHandlerFn);
    } else {
      console.log(data.message);
    }
  }
});
```

Now that we have the event handler function stored. We can remove the event
listener whenever the `event` property type changes. We want to only update the
event listener when the `event` property type changes. We do this by checking
`this.data` against the `oldData` argument provided by the `.update()` handler:

```js
AFRAME.registerComponent('log', {
  schema: {
    event: {type: 'string', default: ''},
    message: {type: 'string', default: 'Hello, World!'}
  },

  init: function () {
    var self = this;
    this.eventHandlerFn = function () { console.log(self.data.message); };
  },

  update: function (oldData) {
    var data = this.data;
    var el = this.el;

    // `event` updated. Remove the previous event listener if it exists.
    if (oldData.event && data.event !== oldData.event) {
      el.removeEventListener(oldData.event, this.eventHandlerFn);
    }

    if (data.event) {
      el.addEventListener(data.event, this.eventHandlerFn);
    } else {
      console.log(data.message);
    }
  }
});
```

Now let's test our component with an updating event listener. Here's our scene:

```html
<a-scene>
  <a-entity log="event: anEvent; message: Hello, Metaverse!"></a-entity>
</a-scene>
```

Let's have our entity [emit the event][emit] to test it out:

```js
var el = document.querySelector('a-entity');
el.emit('anEvent');
// >> "Hello, Metaverse!"
```

Now let's update our event to test the `.update()` handler:

```js
var el = document.querySelector('a-entity');
el.setAttribute('log', {event: 'anotherEvent', message: 'Hello, new event!'});
el.emit('anotherEvent');
// >> "Hello, new event!"
```

### Handling Component Removal

[remove]: ./javascript-events-dom-apis.md#removing-a-component-with-removeattribute

Let's handle the case where the [component unplugs from the entity][remove]
(i.e., `.removeAttribute('log')`). We can implement the `.remove()` handler
which is called when the component is removed. For the `log` component, we
remove any event listeners the component attached to the entity:

```js
AFRAME.registerComponent('log', {
  schema: {
    event: {type: 'string', default: ''},
    message: {type: 'string', default: 'Hello, World!'}
  },

  init: function () {
    var self = this;
    this.eventHandlerFn = function () { console.log(self.data.message); };
  },

  update: function (oldData) {
    var data = this.data;
    var el = this.el;

    if (oldData.event && data.event !== oldData.event) {
      el.removeEventListener(oldData.event, this.eventHandlerFn);
    }

    if (data.event) {
      el.addEventListener(data.event, this.eventHandlerFn);
    } else {
      console.log(data.message);
    }
  },

  /**
   * Handle component removal.
   */
  remove: function () {
    var data = this.data;
    var el = this.el;

    // Remove event listener.
    if (data.event) {
      el.removeEventListener(data.event, this.eventHandlerFn);
    }
  }
});
```

Now let's test out the remove handler. Let's remove the component and check
that emitting the event no longer does anything:

```html
<a-scene>
  <a-entity log="event: anEvent; message: Hello, Metaverse!"></a-entity>
</a-scene>
```

```js
var el = document.querySelector('a-entity');
el.removeAttribute('log');
el.emit('anEvent');
// >> Nothing should be logged...
```

### Allowing Multiple Instances of a Component

[multiple]: ../core/component.md#multiple

Let's allow having multiple `log` components attached to the same entity. To do
so, we enable [multiple instancing with the `.multiple` flag][multiple]. Let's
set that to `true`:

```js
AFRAME.registerComponent('log', {
  schema: {
    event: {type: 'string', default: ''},
    message: {type: 'string', default: 'Hello, World!'}
  },

  multiple: true,

  // ...
});
```

The syntax for an attribute name for a multiple-instanced component has the
form of `<COMPONENTNAME>__<ID>`, a double-underscore with an ID suffix. The ID
can be whatever we choose. For example, in HTML:

```html
<a-scene>
  <a-entity log__helloworld="message: Hello, World!"
            log__metaverse="message: Hello, Metaverse!"></a-entity>
</a-scene>
```

Or from JS:

```js
var el = document.querySelector('a-entity');
el.setAttribute('log__helloworld', {message: 'Hello, World!'});
el.setAttribute('log__metaverse', {message: 'Hello, Metaverse!'});
```

Within the component, if we wanted, we can tell between different instances
using `this.id` and `this.attrName`. Given `log__helloworld`, `this.id` would
be `helloworld` and `this.attrName` would be the full `log__helloworld`.

And there we have our basic `log` component!

## Example: `box` Component

[usingthree]: ./developing-with-threejs.md

For a less trivial example, let's find out how we can add 3D objects and affect
the scene graph by writing a component that [uses three.js][usingthree]. To get
the idea, we'll just make a basic `box` component that creates a box mesh with both
geometry and material.

[geometry]: ../components/geometry.md
[material]: ../components/material.md

[boximage]: https://cloud.githubusercontent.com/assets/674727/20326452/b7f94966-ab3d-11e6-95e1-47cabf425278.jpg
![boximage]
<small class="image-caption"><i>Image by Ruben Mueller from vrjump.de</i></small>

**Note:** this is just a 3D equivalent of writing a `Hello, World!` component.
A-Frame provides [geometry][geometry] and [material][material] components if we
actually wanted to make a box in practice.

### Schema and API

Let's start with the schema. The schema defines the API of your component.
We'll make the `width`, `height`, `depth`, and `color` configurable through the
properties. The `width`, `height`, and `depth` will be number types (i.e.,
floats) with a default of 1 meter. The `color` type will have a color type
(i.e., a string) with a default of gray:

```js
AFRAME.registerComponent('box', {
  schema: {
    width: {type: 'number', default: 1},
    height: {type: 'number', default: 1},
    depth: {type: 'number', default: 1},
    color: {type: 'color', default: '#AAA'}
  }
});
```

Later, when we use this component via HTML, the syntax will look like:

```html
<a-scene>
  <a-entity box="width: 0.5; height: 0.25; depth: 1; color: orange"
            position="0 0 -5"></a-entity>
</a-scene>
```

### Creating the Box Mesh

[mesh]: https://threejs.org/docs/index.html#Reference/Objects/Mesh
[threegeometry]: https://threejs.org/docs/index.html#Reference/Geometries/BoxBufferGeometry
[threematerial]: https://threejs.org/docs/index.html#Reference/Materials/MeshStandardMaterial
[setobject3d]: ./developing-with-threejs.md#setting-an-object3d-on-an-entity

Let's create our three.js box mesh from the `.init()`, and we'll later let the
`.update()` handler handle all the property updates. To create a box in
three.js, we'll create a [`THREE.BoxBufferGeometry`][threegeometry],
[`THREE.MeshStandardMaterial`][threematerial], and finally a
[`THREE.Mesh`][mesh]. Then we set the mesh on our entity to add the mesh to the
three.js scene graph [using `.setObject3D(name, object)`][setobject3d]:

```js
AFRAME.registerComponent('box', {
  schema: {
    width: {type: 'number', default: 1},
    height: {type: 'number', default: 1},
    depth: {type: 'number', default: 1},
    color: {type: 'color', default: '#AAA'}
  },

  /**
   * Initial creation and setting of the mesh.
   */
  init: function () {
    var data = this.data;
    var el = this.el;

    // Create geometry.
    this.geometry = new THREE.BoxBufferGeometry(data.width, data.height, data.depth);

    // Create material.
    this.material = new THREE.MeshStandardMaterial({color: data.color});

    // Create mesh.
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // Set mesh on entity.
    el.setObject3D('mesh', this.mesh);
  }
});
```

Now let's handle updates. If the geometry-related properties (i.e., `width`,
`height`, `depth`) update, we'll just recreate the geometry. If the
material-related properties (i.e., `color`) update, we'll just update the
material in place. To access the mesh to update it, we use
`.getObject3D('mesh')`.

```js
AFRAME.registerComponent('box', {
  schema: {
    width: {type: 'number', default: 1},
    height: {type: 'number', default: 1},
    depth: {type: 'number', default: 1},
    color: {type: 'color', default: '#AAA'}
  },

  init: function () {
    var data = this.data;
    var el = this.el;
    this.geometry = new THREE.BoxBufferGeometry(data.width, data.height, data.depth);
    this.material = new THREE.MeshStandardMaterial({color: data.color});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    el.setObject3D('mesh', this.mesh);
  },

  /**
   * Update the mesh in response to property updates.
   */
  update: function (oldData) {
    var data = this.data;
    var el = this.el;

    // If `oldData` is empty, then this means we're in the initialization process.
    // No need to update.
    if (Object.keys(oldData).length === 0) { return; }

    // Geometry-related properties changed. Update the geometry.
    if (data.width !== oldData.width ||
        data.height !== oldData.height ||
        data.depth !== oldData.depth) {
      el.getObject3D('mesh').geometry = new THREE.BoxBufferGeometry(data.width, data.height,
                                                                    data.depth);
    }

    // Material-related properties changed. Update the material.
    if (data.color !== oldData.color) {
      el.getObject3D('mesh').material.color = new THREE.Color(data.color);
    }
  }
});
```

### Removing the Box Mesh

Lastly, we'll handle when the component or entity is removed. In this case,
we'll want to remove the mesh from the scene. We can do so with the `.remove()`
handler and `.removeObject3D(name)`:

```js
AFRAME.registerComponent('box', {
  // ...

  remove: function () {
    this.el.removeObject3D('mesh');
  }
});
```

And that wraps up the basic three.js `box` component! In practice, a three.js
component would do something more useful. Anything that can be accomplished in
three.js can be wrapped in an A-Frame component to make it declarative. So
check out the three.js features and ecosystem and see what components you can
write!

## Example: `follow` Component

Let's write a `follow` component where we tell one entity to follow another.
This will demonstrate the use of the `.tick()` handler which adds a
continuously running behavior that runs on every frame of the render loop to
the scene. This will also demonstrate relationships between entities.

### Schema and API

First off, we'll need a `target` property that specifies which entity to
follow. A-Frame has a `selector` property type to do the trick, allowing
us to pass in a query selector and get back an entity element. We'll also add a
`speed` property (in m/s) to tell specify how fast the entity should follow.

```js
AFRAME.registerComponent('follow', {
  schema: {
    target: {type: 'selector'},
    speed: {type: 'number'}
  }
});
```

### Creating a Helper Vector

Since the `.tick()` handler will be called on every frame (e.g., 90 times per
second), we want to make sure its performant. One thing we don't want to do is
be creating unnecessary objects on each tick such as `THREE.Vector3` objects.
That would help lead to garbage collection pauses. Since we'll need to do
some vector operations using a `THREE.Vector3`, we'll create it once in the
`.init()` handler so we can later reuse it:

```js
AFRAME.registerComponent('follow', {
  schema: {
    target: {type: 'selector'},
    speed: {type: 'number'}
  },

  init: function () {
    this.directionVec3 = new THREE.Vector3();
  }
});
```

### Defining a Behavior With the `.tick()` Handler

Now we'll write the `.tick()` handler so the component continuously moves the
entity towards its target at the desired speed. A-Frame passes in the global
scene uptime as `time` and time since the last frame as `timeDelta` into the
`tick()` handler, in milliseconds. We can use the `timeDelta` to calculate how
far the entity should travel towards the target this frame, given the speed.

To calculate the direction the entity should head in, we subtract the entity's
position vector from the target entity's direction vector. We have access to
the entities' three.js objects via `.object3D`, and from there the position
vector `.position`. We store the direction vector in the `this.directionVec3`
we previously allocated in the `init()` handler.

Then we factor in the distance to go, the desired speed, and how much time
has passed since the last frame to find the appropriate vector to add to
the entity's position. We translate the entity with `.setAttribute` and in
the next frame, the `.tick()` handler will be run again.

The full `.tick()` handler is below. `.tick()` is great because it allows an
easy way to hook into the render loop without actually having a reference to
the render loop. We just have to define a method. Follow along below with the
code comments:

```js
AFRAME.registerComponent('follow', {
  schema: {
    target: {type: 'selector'},
    speed: {type: 'number'}
  },

  init: function () {
    this.directionVec3 = new THREE.Vector3();
  },

  tick: function (time, timeDelta) {
    var directionVec3 = this.directionVec3;

    // Grab position vectors (THREE.Vector3) from the entities' three.js objects.
    var targetPosition = this.data.target.object3D.position;
    var currentPosition = this.el.object3D.position;

    // Subtract the vectors to get the direction the entity should head in.
    directionVec3.copy(targetPosition).sub(currentPosition);

    // Calculate the distance.
    var distance = directionVec3.length();

    // Don't go any closer if a close proximity has been reached.
    if (distance < 1) { return; }

    // Scale the direction vector's magnitude down to match the speed.
    var factor = this.data.speed / distance;
    ['x', 'y', 'z'].forEach(function (axis) {
      directionVec3[axis] *= factor * (timeDelta / 1000);
    });

    // Translate the entity in the direction towards the target.
    this.el.setAttribute('position', {
      x: currentPosition.x + directionVec3.x,
      y: currentPosition.y + directionVec3.y,
      z: currentPosition.z + directionVec3.z
    });
  }
});
```

## Learning Through Components in Ecosystem

There are a large number of components in the ecosystem, most of them open
source on GitHub.  One way to learn is to browse the source code of other
components to see how they're built and what use cases they provide for. Here
are a few places to look:

[registry]: https://aframe.io/registry/
[corecomponents]: https://github.com/aframevr/aframe/tree/master/src/components
[paintercomponents]: https://github.com/aframevr/a-painter/tree/master/src/components

- [A-Frame Registry][registry] - Curated community components.
- [A-Frame core components][corecomponents] - Source code of A-Frame's standard components.
- [A-Painter components][paintercomponents] - Application-specific components for A-Painter.

## Publishing a Component

[angle]: https://www.npmjs.com/package/angle
[awesome]: https://github.com/aframevr/awesome-aframe
[registry]: https://aframe.io/registry/

Many components in practice will be application-specific or one-off components.
But if you wrote a component that could be useful to the community and is
generalized enough to work in other applications, you should publish it to the
ecosystem via [the A-Frame Registry][registry] and [`awesome-aframe`][awesome]!

For a component template, we recommend using [`angle`][angle].  `angle` is a
command-line interface for A-Frame; one of its features is to set up a
component template for publishing to GitHub and npm and also to be consistent
with all the other components in the ecosystem. To install the template:

```sh
npm install -g angle && angle initcomponent
```

[guidelines]: https://github.com/aframevr/aframe-registry#submitting-a-component
[pr]: https://www.digitalocean.com/community/tutorials/how-to-create-a-pull-request-on-github

`initcomponent` will ask for some information like the component name to get
the template set up. Write some code, examples, and documentation, and [send a
pull request][pr] to the [A-Frame Registry][registry] to get it featured! Follow the
[Registry guidelines][guidelines], we'll do a quick code review, and then the
community will be able to use your component, and hopefully send some helpful
pull requests back if needed!
