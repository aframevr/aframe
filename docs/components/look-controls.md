---
title: look-controls
type: components
layout: docs
parent_section: components
source_code: src/components/look-controls.js
examples: []
---

The look-controls component:

- Rotates the entity when we rotate a VR head-mounted display (HMD).
- Rotates the entity when we move the mouse.
- Rotates the entity when we touch-drag the touchscreen.

## Example

The look-controls component is usually used alongside the [camera
component](camera.md).

```html
<a-entity camera look-controls position="0 1.6 0"></a-entity>
```

## Properties

[pointer-lock-api]: https://developer.mozilla.org/docs/Web/API/Pointer_Lock_API

| Property         | Description                                                      | Default Value |
|------------------|------------------------------------------------------------------|---------------|
| enabled          | Whether look controls are enabled.                               | true          |
| reverseMouseDrag | Whether to reverse mouse drag.                                   | false         |
| reverseTouchDrag | Whether to reverse touch drag.                                   | false         |
| touchEnabled     | Whether to use touch controls in magic window mode.              | true          |
| mouseEnabled     | Whether to use mouse to move the camera in 2D mode.              | true          |
| pointerLockEnabled | Whether to hide the cursor using the [Pointer Lock API][pointer-lock-api]. | false |
| magicWindowTrackingEnabled | Whether gyroscope camera tracking is enabled on mobile devices. | true |

## Customizing look-controls

[look-controls]: https://github.com/aframevr/aframe/blob/master/src/components/look-controls.js

While A-Frame's look-controls component is primarily meant for VR with sensible
defaults to work across platforms, many developers want to use A-Frame for
non-VR use cases (e.g., desktop, touchscreen). We might want to modify the
mouse and touch behaviors.

The best way to configure the behavior is to [copy and customize the current
look-controls component code][look-controls]. This allows us to configure the
controls how we want (e.g., limit the pitch on touch, reverse one axis). If we
were to include every possible configuration into the core component, we would
be left maintaining a wide array of flags.

The component lives within a Browserify/Webpack context so you'll need to
replace the `require` statements with A-Frame globals (e.g.,
`AFRAME.registerComponent`, `window.THREE`), and get rid of the `module.exports`.

## Caveats

If you want to create your own component for look controls, you will have to
copy and paste the HMD-tracking bits into your component. In the future, we may
have a system for people to more easily create their controls.
