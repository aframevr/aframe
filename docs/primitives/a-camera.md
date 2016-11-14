---
title: <a-camera>
type: primitives
layout: docs
parent_section: primitives
---

The camera primitive determines what the user sees. We can change the viewport
by modifying the camera entity's position and rotation.

[userheight]: ../components/camera.md#vr-behavior

Note that by default, the camera origin will be at `0 1.6 0` in desktop mode
and `0 0 0` in VR mode. Read about the [`camera.userHeight` property][userheight].

## Example

```html
<a-scene>
  <a-box></a-box>
  <a-camera></a-camera>
</a-scene>
```

## Attributes

| Attribute             | Component Mapping              | Default Value |
|-----------------------|--------------------------------|---------------|
| far                   | camera.far                     | 10000         |
| fov                   | camera.fov                     | 80            |
| look-controls-enabled | look-controls.enabled          | true          |
| near                  | camera.near                    | 0.5           |
| user-height           | camera.userHeight              | 1.6           |
| reverse-mouse-drag    | look-controls.reverseMouseDrag | false         |
| wasd-controls-enabled | wasd-controls.enabled          | true          |

## Manually Positioning the Camera

To position the camera, set the position on a wrapper `<a-entity>`. Don't set
the position directly on the camera primitive because controls will quickly
override the set position:

```html
<a-entity position="0 0 5">
  <a-camera></a-camera>
</a-entity>
```
