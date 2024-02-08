---
title: vive-focus-controls
type: components
layout: docs
parent_section: components
source_code: src/components/vive-focus-controls.js

examples: []
---

[trackedcontrols]: ./tracked-controls.md

The vive-focus-controls component interfaces with the Vive Focus controller.
It wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and an Vive Focus controller model that highlights the touched
and/or pressed buttons (trackpad, trigger).

## Example

```html
<!-- Match Vive Focus controller if present, regardless of hand. -->
<a-entity vive-focus-controls></a-entity>

<!-- Match Vive Focus controller if present and for specified hand. -->
<a-entity vive-focus-controls="hand: left"></a-entity>
<a-entity vive-focus-controls="hand: right"></a-entity>
```

## Value

| Property             | Description                                        | Default              |
|----------------------|----------------------------------------------------|----------------------|
| buttonTouchedColor   | Button colors when touched (Trackpad only).        | #777777              |
| buttonHighlightColor | Button colors when pressed and active.             | #FFFFFF              |
| hand                 | The hand that will be tracked (e.g., right, left). |                      |
| model                | Whether the Vive Focus controller model is loaded. | true                 |

## Events

| Event Name         | Description           |
| ----------         | -----------           |
| trackpadchanged    | Trackpad changed.     |
| trackpaddown       | Trackpad pressed.     |
| trackpadmoved      | Trackpad axis changed.|
| trackpadup         | Trackpad released.    |
| trackpadtouchstart | Trackpad touched.     |
| trackpadtouchend   | Trackpad not touched. |
| triggerchanged     | Trigger changed.      |
| triggerdown        | Trigger pressed.      |
| triggerup          | Trigger released.     |

As this controller's buttons are digital, the changed events only fire when
a button is fully pressed or released (value 0 or 1).

## Assets

- [Controller GLTF](https://cdn.aframe.io/controllers/vive/focus-controller/focus-controller.gltf)

