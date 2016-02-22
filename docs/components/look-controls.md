---
title: "Look Controls"
type: components
layout: docs
parent_section: components
order: 8
---

The `look-controls` component defines the following behavior of an entity:

- Track the rotation of a VR headset.
- Rotate when the mouse is clicked and dragged.
- Rotate when a touchscreen is tapped and dragged.

Notice that `look-controls` acts upon the VR headset, mouse, *and* touchscreen inputs. A-Frame controls are grouped together based upon configuration and behavior rather than by device.

The `look-controls` component is generally meant to be registered alongside the [`camera` component](../components/).

```html
<a-entity camera look-controls wasd-controls></a-entity>
```

| Property  | Description                        | Default Value |
|-----------|-----------------------------------------------------
| enabled   | Whether look controls are enabled. | true          |
