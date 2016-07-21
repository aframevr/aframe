---
title: look-controls
type: components
layout: docs
parent_section: components
---

The look-controls component defines the following behavior of an entity. The look-controls component acts upon the HMD headset, mouse, *and* touchscreen inputs. A-Frame standard controls are grouped together based upon configuration and behavior rather than by individual input methods:

- Rotate when the head-mounted display (HMD) is rotated.
- Rotate when the mouse is clicked and dragged.
- Rotate when the touchscreen is tapped and dragged.

## Example

The look-controls component is usually used alongside the [camera component][components-camera].

```html
<a-entity camera look-controls></a-entity>
```

## Properties

| Property  | Description                        | Default Value |
|-----------|-----------------------------------------------------
| enabled   | Whether look controls are enabled. | true          |

## Caveats

If you want to create your own component for look controls, you will have to copy and paste the HMD-tracking bits into your component. In the future, we may have a system for people to more easily implement their controls.

[components-camera](../components/index.md)
