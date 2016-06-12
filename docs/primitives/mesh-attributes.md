---
title: Mesh Attributes
type: primitives
layout: docs
parent_section: primitives
order: 2
---

Many of the primitives are entities that compose a geometric mesh, meaning they primarily prescribe the [geometry](../components/geometry.md) and [material](../components/material.md) components. Most of the mesh primitives share common attributes, especially for mapping to the material component. These common attributes won't be described in individual documentation pages for each primitive so they will be listed here.

## Example

`<a-box>`, `<a-cylinder>`, `<a-sphere>` are some primitives that prescribe a geometric mesh. They share common attributes relating to the material component:

```html
<a-box opacity="0.5" shader="flat" src="dirt.png"></a-box>
<a-cylinder opacity="0.75" shader="flat" src="soda.png"></a-cylinder>
<a-sphere opacity="1.0" shader="standard" src="sun.png"></a-sphere>
```

## Attributes

| Attribute   | Component Mapping    | Default Value |
|-------------|----------------------|---------------|
| color       | material.color       | gray          |
| metalness   | material.metalness   | 0             |
| opacity     | material.opacity     | 1             |
| roughness   | material.roughness   | 0.5           |
| shader      | material.shader      | standard      |
| src         | material.src         | None          |
| translate   | geometry.translate   | 0 0 0         |
| transparent | material.transparent | true          |
