---
title: <a-camera>
type: primitives
layout: docs
parent_section: primitives
---

The camera primitive places the user somewhere within the scene. It is an
entity that prescribes the [camera component](../components/) with mappings to
controls-related components.

## Example

```html
<a-scene>
  <a-box></a-box>

  <a-entity position="0 1.8 5">
    <a-camera></a-camera>
  </a-entity>
</a-scene>
```

## Attributes

| Attribute             | Component Mapping     | Default Value |
|-----------------------|-----------------------|---------------|
| far                   | camera.far            | 10000         |
| fov                   | camera.fov            | 80            |
| look-controls-enabled | look-controls.enabled | true          |
| near                  | camera.near           | 0.5           |
| user-height           | camera.userHeight     | 0             |
| wasd-controls-enabled | wasd-controls.enabled | true          |

## Manually Positioning the Camera

To position the camera, set the position on a wrapper `<a-entity>`. Don't set
the position directly on the camera primitive because controls will quickly
override the set position:

```html
<a-entity position="0 0 5">
  <a-camera></a-camera>
</a-entity>
```

## Differences with the Default Camera

When we use the camera primitive, A-Frame will not prescribe a default camera.

Note the default camera is positioned at `0 1.6 0` whereas the camera primitive
will be positioned at `0 0 0`. In the example below, we would see a box:

```html
<a-box></a-box>
```

But if we prescribe our own camera and do not adjust its position:

```html
<a-box></a-box>
<a-camera></a-camera>
```

Then both the cube and camera wll be positioned at `0 0 0`, the camera will be
*inside* the cube, and thus the box won't be visible without moving the camera.
So make sure the have the camera well-positioned.
