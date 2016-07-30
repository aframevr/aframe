---
title: keyboard-shortcuts
type: components
layout: docs
parent_section: components
---

The keyboard-shortcuts component toggles global keyboard shortcuts. The keyboard-shortcuts component applies only to the [`<a-scene>` element][scene]

## Example

```html
<a-scene keyboard-shortcuts="enterVR: false"></a-scene>
```

## Properties

| Property    | Description                                           | Default Value |
|-------------|-------------------------------------------------------|---------------|
| enterVR     | Enables the shortcut to press 'F' to enter VR.        | true          |
| resetSensor | Enables to shortcut to press 'Z' to reset the sensor. | true          |

[scene]: ../core/scene.md
