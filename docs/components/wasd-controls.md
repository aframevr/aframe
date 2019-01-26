---
title: wasd-controls
type: components
layout: docs
parent_section: components
source_code: src/components/wasd-controls.js
---

[components-camera]: ./camera.md

The wasd-controls component controls an entity with the WASD or arrow keyboard
keys. The wasd-controls component is commonly attached to an entity with the [camera
component][components-camera].

## Example

```html
<a-entity camera look-controls wasd-controls position="0 1.6 0"></a-entity>
```

## Properties

| Property     | Description                                                              | Default Value |
|--------------|--------------------------------------------------------------------------|---------------|
| acceleration | How fast the entity accelerates when holding the keys.                   | 65            |
| adAxis       | Axis that the `A` and `D` keys act upon.                                 | x             |
| adInverted   | Whether the axis that the `A` and `D` keys act upon are inverted.        | false         |
| enabled      | Whether the WASD controls are enabled.                                   | true          |
| fly          | Whether or not movement is restricted to the entity's initial plane.     | false         |
| wsAxis       | Axis that the `W` and `S` keys act upon.                                 | z             |
| wsInverted   | Whether the axis that the W and S keys act upon are inverted.            | false         |
