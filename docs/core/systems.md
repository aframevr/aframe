---
title: System
type: core
layout: docs
parent_section: core
order: 4
---

A system, of the [entity-component-system pattern][ecs], provides global scope,
services, and management to classes of components. It provides public APIs
(methods and properties) for classes of components. A system can be accessed
through the scene element, and can help components interface with the global
scene.

For example, the camera system manages all entities with the [camera
component][camera], controlling which camera is the active camera.

<!--toc-->

## Registering a System

A system is registered similarly to a [component][components].

If the system name matches a component name, then the component will have a
reference to the system as `this.system`:

```js
AFRAME.registerSystem('my-component', {
  schema: {},  // System schema. Parses into `this.data`.

  init: function () {
    // Called on scene initialization.
  },

  // Other handlers and methods.
});

AFRAME.registerComponent('my-component', {
  init: function () {
    console.log(this.system);
  }
});
```

## Properties

[schema]: ./component.md#schema

| Property | Description                                                        |
| -------- | -------------                                                      |
| schema   | Behaves the same as [component schemas][schema]. Parses to `data`. |
| data     | Data provided by the schema available across handlers and methods. |

## Methods

A system, like a component, defines lifecycle handlers. It can also define
methods intended to be public API.

| Method   | Description                                                              |
| -------- | -------------                                                            |
| init     | Called once when the system is initialized. Used to initialize.          |
| pause    | Called when the scene pauses. Used to stop dynamic behavior.             |
| play     | Called when the scene starts or resumes. Used to start dynamic behavior. |
| tick     | If defined, will be called on every tick of the scene's render loop.     |

## Accessing a System

An instantiated system can be accessed through the scene:

```js
document.querySelector('a-scene').systems[systemName];
```

Registered system prototypes can be accessed through `AFRAME.systems`.

## Patterns

### Separation of Logic and Data

Systems can help separate logic and behavior from data if desired. We let
systems handle the heavy lifting, and components only worry about managing its
data through its lifecycle methods:

```js
AFRAME.registerSystem('my-component', {
  createComplexObject: function (data) {
    // Do calculations and stuff with data.
    return new ComplexObject(data);
  }
});

AFRAME.registerComponent('my-component', {
  init: function () {
    this.myObject = null;
  },

  update: function () {
    // Do stuff with `this.data`.
    this.myObject = this.system.createComplexObject(this.data);
  }
});
```

### Gathering All Components of a System

There is no strict API for defining how systems manage components. A common
pattern is to have components subscribe themselves to the system. The system
then has references to all of its components:

```js
AFRAME.registerSystem('my-component', {
  init: function () {
    this.entities = [];
  },

  registerMe: function (el) {
    this.entities.push(el);
  },

  unregisterMe: function (el) {
    var index = this.entities.indexOf(el);
    this.entities.splice(index, 1);
  }
});

AFRAME.registerComponent('my-component', {
  init: function () {
    this.system.registerMe(this.el);
  },

  remove: function () {
    this.system.unregisterMe(this.el);
  }
});
```

[camera]: ../components/camera.md
[components]: ./component.md
[ecs]: ./index.md
