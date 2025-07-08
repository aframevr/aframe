---
title: logitech-mx-ink-controls
type: components
layout: docs
parent_section: components
source_code: src/components/logitech-mx-ink-controls.js
examples: []
---

[trackedcontrols]: ./tracked-controls.md

The `logitech-mx-ink-controls` component interfaces with the Logitech MX Ink tracked pen. It
wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and a pencil model.

## Example

```html
<a-entity logitech-mx-ink-controls="hand: left"></a-entity>
<a-entity logitech-mx-ink-controls="hand: right"></a-entity>
```

## Value

| Property             | Description                                        | Default Value        |
|----------------------|----------------------------------------------------|----------------------|
| hand                 | The hand that will be tracked (i.e., right, left). | left                 |
| model                | Whether the Touch controller model is loaded.      | true                 |

## Events

| Event Name           | Description                       |
| ----------           | -----------                       |
| tiptouchstart        | Tip touched.                      |
| tiptouchend          | Tip no longer touched.            |
| tipchanged           | Tip changed.                      |
| frontdown            | Front button pressed.             |
| frontup              | Front button released.            |
| frontchanged         | Front button changed.             |
| reardown             | Rear button pressed.              |
| rearup               | Rear button released.             |
| rearchanged          | Rear button changed.              |

## Read tip changes

Listen to the `tipchanged` event.

```html
<a-entity logitech-mx-ink-controls="hand: left" tip-logging></a-entity>
<a-entity logitech-mx-ink-controls="hand: right" tip-logging></a-entity>
```

```javascript
AFRAME.registerComponent('tip-logging',{
  init: function () {
    this.el.addEventListener('tipchanged', this.tipChanged);
  },
  tipChanged: function (evt) {
    console.log("Pen tip changed");
  }
});
```

## Assets

- [Logitech MX Ink glTF](https://cdn.aframe.io/controllers/logitech/logitech-mx-ink.glb)
