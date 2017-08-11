---
title: look-controls
type: components
layout: docs
parent_section: components
source_code: src/components/look-controls.js
---

The look-controls component:

- Rotates the entity when we rotate a VR head-mounted display (HMD).
- Rotates the entity when we click-drag mouse.
- Rotates the entity when we touch-drag the touchscreen.

## Example

The look-controls component is usually used alongside the [camera
component](camera.md).

```html
<a-entity camera look-controls></a-entity>
```

## Properties

| Property         | Description                                                      | Default Value |
|------------------|------------------------------------------------------------------|---------------|
| enabled          | Whether look controls are enabled.                               | true          |
| hmdEnabled       | Whether to use VR headset pose in VR mode.                       | true          |
| reverseMouseDrag | Whether to reverse mouse drag.                                   | false         |
| standing         | Whether standing mode is enabled (passed to `THREE.VRControls`). | true          |
| mobileHmdAlways  | Always rotate the entity based on mobile device movement.        | true          |
| mobileFixedPitch | Prevent pitch (vertical) movement based on mobile touch events.  | true          |

## Caveats

If you want to create your own component for look controls, you will have to
copy and paste the HMD-tracking bits into your component. In the future, we may
have a system for people to more easily create their controls.
