---
title: <a-circle>
type: primitives
layout: docs
parent_section: primitives
---

The circle primitive creates circles surfaces using the [geometry][geometry]
component with the type set to `circle`.

## Example

```html
<a-scene>
  <a-assets>
    <img id="platform" src="platform.jpg">
  </a-assets>

  <!-- Basic circle. -->
  <a-circle color="#CCC" radius="20"></a-circle>

  <!-- Textured circle parallel to ground. -->
  <a-circle src="#platform" radius="50" rotation="-90 0 0"></a-circle>
</a-scene>
```

## Attributes

| Attribute    | Component Mapping    | Default Value |
| --------     | -----------------    | ------------- |
| color        | material.color       | #FFF          |
| metalness    | material.metalness   | None          |
| opacity      | material.opacity     | 1             |
| radius       | geometry.radius      | 1             |
| repeat       | material.repeat      | None          |
| roughness    | material.roughness   | 0.5           |
| segments     | geometry.segments    | 32            |
| shader       | material.shader      | standard      |
| side         | material.side        | front         |
| src          | material.src         | None          |
| theta-length | geometry.thetaLength | 360           |
| theta-start  | geometry.thetaStart  | 0             |
| transparent  | material.transparent | None          |

## Parallelizing to the Ground

To make a circle parallel to the ground, rotate it around the X-axis:

```html
<a-plane rotation="-90 0 0"></a-plane>
```

[common]: ./common-attributes.md
[geometry]: ../components/geometry.md
