title: "Look Controls"
category: component
---

The look-controls component defines the behavior of an entity to

- Track the rotation of a VR headset
- Rotate when the mouse is clicked and dragged.
- Rotate when a touchscreen is tapped and dragged.

Notice that look-controls acts upon the VR headset, mouse, *and* touchscreen
inputs. A-Frame controls are grouped together based upon configuration and behavior
rather than by device.

The look-controls component is generally meant to be registered alongside the
camera component.

```html
<a-entity camera look-controls wasd-controls></a-entity>
```

| Attribute | Description                        | Default Value |
|-----------|-----------------------------------------------------
| enabled   | Whether look controls are enabled. | true          |
