---
title: oculus-touch-controls
type: components
layout: docs
parent_section: components
---

[trackedcontrols]: ./tracked-controls.md

The oculus-touch-controls component interfaces with the Oculus Touch controllers. It
wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and a Touch controller model.

## Example

```html
<a-entity oculus-touch-controls="hand: left"></a-entity>
<a-entity oculus-touch-controls="hand: right"></a-entity>
```

## Value

| Property             | Description                                        | Default Value        |
|----------------------|----------------------------------------------------|----------------------|
| emulated             | Whether to emulate (treat as present regardless).  | false                |
| hand                 | The hand that will be tracked (i.e., right, left). | left                 |
| model                | Whether the Touch controller model is loaded.      | true                 |
| rotationOffset       | Offset to apply to model rotation.                 | 0                    |

## Events

| Event Name           | Description                    |
| ----------           | -----------                    |
| triggerdown          | Trigger pressed.               |
| triggerup            | Trigger released.              |
| triggertouchstart    | Trigger touched.               |
| triggertouchend      | Trigger no longer touched.     |
| triggerchanged       | Trigger changed.               |
| thumbstickdown       | Thumbstick pressed.            |
| thumbstickup         | Thumbstick released.           |
| thumbsticktouchstart | Thumbstick touched.            |
| thumbsticktouchend   | Thumbstick no longer touched.  |
| thumbstickchanged    | Thumbstick changed.            |
| gripdown             | Grip button pressed.           |
| gripup               | Grip button released.          |
| griptouchstart       | Grip button touched.           |
| griptouchend         | Grip button no longer touched. |
| gripchanged          | Grip button changed.           |
| Adown                | A button pressed.              |
| Aup                  | A button released.             |
| Atouchstart          | A button touched.              |
| Atouchend            | A button no longer touched.    |
| Achanged             | A button changed.              |
| Bdown                | B button pressed.              |
| Bup                  | B button released.             |
| Btouchstart          | B button touched.              |
| Btouchend            | B button no longer touched.    |
| Bchanged             | B button changed.              |
| Xdown                | X button pressed.              |
| Xup                  | X button released.             |
| Xtouchstart          | X button touched.              |
| Xtouchend            | X button no longer touched.    |
| Xchanged             | X button changed.              |
| Ydown                | Y button pressed.              |
| Yup                  | Y button released.             |
| Ytouchstart          | Y button touched.              |
| Ytouchend            | Y button no longer touched.    |
| Ychanged             | Y button changed.              |
| menudown             | Menu button pressed.           |
| menuup               | Menu button released.          |
| menuchanged          | Menu button changed.           |
| systemdown           | System button pressed.         |
| systemup             | System button released.        |
| systemchanged        | System button changed.         |

## Assets

- [Left Controller OBJ](https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-left.obj)
- [Left Controller MTL](https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-left.mtl)
- [Right Controller OBJ](https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-right.obj)
- [Right Controller MTL](https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-right.mtl)
