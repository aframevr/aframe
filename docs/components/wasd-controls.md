title: "WASD Controls"
type: components
layout: docs
parent_section: components
order: 16
---

The `wasd-controls` component defines the behavior of entities to be controlled by the WASD keyboard keys, which are a common way to control the camera in first-person experiences.

The `wasd-controls` component is generally meant to be registered alongside the [`camera` component](../components/).

```html
<a-entity camera look-controls wasd-controls></a-entity>
```

| Property     | Description                                                              | Default Value |
|--------------|--------------------------------------------------------------------------|---------------|
| acceleration | How fast the entity accelerates when holding the keys.                   | 65            |
| adAxis       | Axis that the `A` and `D` keys act upon.                                 | x             |
| adInverted   | Whether the axis that the `A` and `D` keys act upon are inverted.        | false         |
| easing       | How fast the entity decelerates after releasing the keys. Like friction. | 20            |
| enabled      | Whether the WASD controls are enabled.                                   | true          |
| fly          | Whether or not movement is restricted to the entity's initial plane.     | false         |
| wsAxis       | Axis that the `W` and `S` keys act upon.                                 | z             |
| wsInverted   | Whether the axis that the W and S keys act upon are inverted.            | false         |
