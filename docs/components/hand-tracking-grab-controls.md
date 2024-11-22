---
title: hand-tracking-grab-controls
type: components
layout: docs
parent_section: components
source_code: src/components/hand-tracking-grab-controls.js
examples: []
---

Grab any entity with hand tracking using the pinch gesture.

## Example

```html
<a-entity id="leftHand" hand-tracking-grab-controls="hand: left;"></a-entity>
<a-entity id="rightHand" hand-tracking-grab-controls="hand: right;"></a-entity>
```

The `grabbable` component makes any entity hand grababble.

```html
<a-box grabbable></a-box>
```

For debugging purposes you can make the colliders visible, changing color when a collision is detected, as shown below:

```html
<a-scene obb-collider="showColliders: true"></a-scene>
```

## Properties

| Property       | Description                                                                            | Default Value |
|----------------|----------------------------------------------------------------------------------------|---------------|
| hand           | The hand that will be tracked (i.e., right, left).                                     | left          |
| color          | The color of the hand model.                                                           | white         |
| hoverColor     | Hand color when hand intersects a grabbable entity bounding box.                       | #538df1       |
| hoverEnabled   | If the hand model changes color when intersecting a grabbable entity.                  | false         |

