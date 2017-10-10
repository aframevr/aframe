---
title: <a-sky>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/a-sky.js
examples:
  - title: Adding a Sky
    src: https://glitch.com/edit/#!/aframe-adding-a-sky?path=index.html
  - title: Changing the Sky
    src: https://glitch.com/edit/#!/aframe-changing-the-sky?path=index.html
---

The sky primitive adds a background color or 360&deg; image to a scene.  A sky
is a large sphere with a color or texture mapped to the inside.

## Example

An equirectangular image as a background:

```html
<a-scene>
  <a-assets>
    <img id="sky" src="sky.png">
  </a-assets>
  <a-sky src="#sky"></a-sky>
</a-scene>
```

A plain color as a background:

```html
<a-sky color="#6EBAA7"></a-sky>
```

## Attributes

| Attribute       | Component Mapping       | Default Value |
| --------        | -----------------       | ------------- |
| color           | material.color          | #FFF          |
| metalness       | material.metalness      | 0             |
| opacity         | material.opacity        | 1             |
| phi-length      | geometry.phiLength      | 360           |
| phi-start       | geometry.phiStart       | 0             |
| radius          | geometry.radius         | 5000          |
| repeat          | material.repeat         | None          |
| roughness       | material.roughness      | 0.5           |
| segments-height | geometry.segmentsHeight | 20            |
| segments-width  | geometry.segmentsWidth  | 64            |
| shader          | material.shader         | flat          |
| side            | material.side           | front         |
| src             | material.src            | None          |
| theta-length    | geometry.thetaLength    | 180           |
| theta-start     | geometry.thetaStart     | 0             |
| transparent     | material.transparent    | false         |

## Equirectangular Image

To be seamless, images should be
[equirectangular](https://en.wikipedia.org/wiki/Equirectangular_projection). We
can find some sample equirectangular images on
[Flickr](https://www.flickr.com/groups/equirectangular/). To take an
equirectangular photo, check out this [360-degree photography
guide](http://ngokevin.com/blog/360-photography/).
