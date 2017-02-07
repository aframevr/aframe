---
title: shadow
type: components
layout: docs
parent_section: components
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
