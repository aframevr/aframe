---
title: anchored
type: components
layout: docs
parent_section: components
source_code: src/components/anchored.js
examples: []
---

[webxranchors]: https://immersive-web.github.io/anchors/

It requires a browser supporting the [WebXR Anchors module][webxranchors].

Fix any entity to a position and rotation in the real world. Apply the anchored component to an entity and call the method `el.components.anchored.createAnchor(position, quaternion)` to anchor it to a position and rotation corresponding to real world coordinates. If `creatorAnchor` is not called the entity is anchored to its initial position and rotation. The anchoring only applies when in immersive mode.


## Example

```html
<a-entity id="myBox" anchored="persistent: true" geometry="primitive: box" material="color: red"></a-entity>
```

## Properties

| Properties        | Description                                                             |
|-------------------|-------------------------------------------------------------------------|
| persistent        | If the anchor persists on page reloads. The entity must have an id.     |

