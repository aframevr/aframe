---
title: <a-plane>
type: primitives
layout: docs
parent_section: primitives
---

The plane primitive creates flat surfaces using the [geometry][geometry]
component with the type set to `plane`.

## Example

```html
<a-scene>
  <a-assets>
    <img id="ground" src="ground.jpg">
  </a-assets>

  <!-- Basic plane. -->
  <a-plane color="#CCC" height="20" width="20"></a-plane>

  <!-- Textured plane parallel to ground. -->
  <a-plane src="#ground" height="100" width="100" rotation="-90 0 0"></a-plane>
</a-scene>
```

## Attributes

| Attribute       | Component Mapping       | Default Value |
| --------        | -----------------       | ------------- |
| color           | material.color          | #FFF          |
| height          | geometry.height         | 1             |
| metalness       | material.metalness      | 0             |
| opacity         | material.opacity        | 1             |
| repeat          | material.repeat         | None          |
| roughness       | material.roughness      | 0.5           |
| segments-height | geometry.segmentsHeight | 1             |
| segments-width  | geometry.segmentsWidth  | 1             |
| shader          | material.shader         | standard      |
| side            | material.side           | front         |
| src             | material.src            | None          |
| transparent     | material.transparent    | false         |
| width           | geometry.width          | 1             |

## Parallelizing to the Ground

To make a plane parallel to the ground or make a plane the ground itself,
rotate it around the X-axis:

```html
<a-plane rotation="-90 0 0"></a-plane>
```

[common]: ./common-attributes.md
[geometry]: ../components/geometry.md
