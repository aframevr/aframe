---
title: real-world-meshing
type: components
layout: docs
parent_section: components
source_code: src/components/scene/real-world-meshing.js
examples: []
---

Set this component on the scene element to render meshes corresponding to 3D surfaces detected in user's enviornment: this includes planes and meshes corresponding to floor, ceiling, walls and other objects. Each plane or meshes comes with a label indicating the type of surface or object.

This component requires a browser with support for the [WebXR Mesh Detection Module]([object
pooling](https://en.wikipedia.org/wiki/Object_pool_pattern) and the [WebXR Plane Detection Module](https://immersive-web.github.io/real-world-geometry/plane-detection.html). The system / headset used might require additional scene setup by the use like setting up floor, walls, ceiling or labeling furniture in the space.

## Example

```html
<a-scene real-world-meshing></a-scene>
```

## Properties

| Property      | Description                                                                           | Default Value
|---------------|---------------------------------------------------------------------------------------|---------------
| filterLabels  | List of labels corresponding to the surfaces that will be rendered. Can constrain rendering to certain surfaces like desks, walls, tables... All surfaces will be rendered if left empty. | [] |
| meshesEnabled | If meshes will be rendered as returned by the WebXR Mesh Detection Module. | true         |
| meshMixin     | Mixin applied to the entities corresponding to the detected meshes.                             | ''            |
| planesEnabled | If planes will be rendered as returned by the WebXR Plane Detection Module.                                         | true            |
| planeMixin     | Mixin applied to the entities corresponding to the detected planes.                             | ''            |