---
title: Systems
type: core
layout: docs
parent_section: core
order: 9
---

> Note: the systems API is new and may be unstable.

Systems, of the [entity-component-system pattern][ecs], provide global scope, services, and management to classes of components. They provide public APIs (methods and properties) for classes of components as systems can be accessed through the scene element. Systems also help components interface with the global scene.

For example, the camera system manages all entities with the [camera component][camera], controlling which camera is the active camera.

## Registering a System

Systems are registered similarly to [components][components]. If the system name matches a component name, then the component will have a reference to the system as `this.system`:

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

Systems, like components, define lifecycle handlers. They can also define methods intended to be public API.

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
