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

A system is registered similarly to a [component][components]. If the system
name matches a component name, then the component will have a reference to the
system as `this.system`:

```js
AFRAME.registerSystem('my-component', {
  // System handlers and methods.
});

AFRAME.registerComponent('my-component', {
  init: function () {
    console.log(this.system);
  }
});
```

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
console.log(document.querySelector('a-scene').systems);
```

Registered system prototypes can be accessed through `AFRAME.systems`.

[camera]: ../components/camera.md
[components]: ./component.md
[ecs]: ./index.md
