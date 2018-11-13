---
title: <a-camera>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/a-camera.js
---

The camera primitive determines what the user sees. We can change the viewport
by modifying the camera entity's position and rotation.

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
| reverse-mouse-drag    | look-controls.reverseMouseDrag | false         |
| wasd-controls-enabled | wasd-controls.enabled          | true          |

## Manually Positioning the Camera

A camera is situated by default at the average height of human eye level (1.6
meters). When used with controls that receive rotation or position (e.g. from a
VR device) this position will be overridden.

```html
<!-- Place camera at ground level (will be overridden by VR devices) -->
<a-camera position="0 0 0"></a-camera>
```

When moving or rotating the camera relative to the scene, use a camera rig.
By doing so, the camera's height offset can be updated by roomscale devices,
while still allowing the tracked area to be moved independently around the
scene.

```html
<a-entity id="rig" position="25 10 0">
  <a-camera id="camera"></a-camera>
</a-entity>
```
