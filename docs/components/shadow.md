---
title: shadow
type: components
layout: docs
parent_section: components
source_code: src/components/shadow.js
examples: []
---

The shadow component enables shadows for an entity and its children. Receiving
shadows from surrounding objects and casting shadows onto other objects may
(and often should) be enabled independently.

Without this component, an entity will not cast nor receive shadows.

## Example

The example below configures a tree model to cast shadows onto the surrounding
scene but not receive shadows itself.

```html
<a-entity light="type:directional; castShadow:true;" position="1 1 1"></a-entity>
<a-gltf-model src="tree.gltf" shadow="receive: false"></a-gltf-model>
```

[light]: ./light.md#configuring-shadows
**IMPORTANT:** Adding the `shadow` component alone is not enough to display
shadows in your scene. We must have at least one light with `castShadow:
true` enabled.  Additionally, the light's shadow camera (used for depth
projection) usually must be configured correctly. Refer to the [light][light]
component for more information.

## Properties

| Property | Description                                                     | Default Value |
|----------|-----------------------------------------------------------------|---------------|
| cast     | Whether the entity casts shadows onto the surrounding scene.    | true          |
| receive  | Whether the entity receives shadows from the surrounding scene. | true          |

## Scene Properties

The shadow system exposes scene-level properties for configuring the renderer
for shadows. These are set on `<a-scene>` (e.g., `<a-scene shadow="autoUpdate:
  false">`).

| Property           | Description                                                                                                                                                                                           | Default Value                       |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| enabled            | Whether to disable shadows globally, even if there is a shadow component and a light with `castShadow: true` enabled.                                                                                 | true                                |
| autoUpdate         | Whether to dynamically update the shadow map every frame. Disable and manually update by setting `renderer.shadowMap.needsUpdate = true` for best performance. Calculating shadow maps is expensive. | true                                |
| type               | Shadow type. One of `pcf`, `basic`, `pcfsoft`.                                                                                                                                                        | `pcf` (percentage closer filtering) |
