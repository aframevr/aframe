---
title: <a-sky>
type: primitives
layout: docs
parent_section: primitives
order: 15
---

The sky primitive adds a background to a scene or display a 360-degree photo. It is an entity that prescribes a large sphere with the material mapped to the inside.

## Example

An equirectangular image as a background:

```html
<a-sky src="sky.png"></a-sky>
```

A plain color as a background:

```html
<a-sky color="#6EBAA7"></a-sky>
```

## Attributes

Note that the sky primitive inherits common [mesh attributes](./mesh-attributes.md).

| Attribute       | Component Mapping       | Default Value |
|-----------------|-------------------------|---------------|
| radius          | geometry.radius         | 5000          |
| segments-height | geometry.segmentsHeight | 64            |
| segments-width  | geometry.segmentsWidth  | 64            |

## Equirectangular Image

In order to be seamless, images should be [equirectangular](https://en.wikipedia.org/wiki/Equirectangular_projection). We can find some sample equirectangular images on [Flickr](https://www.flickr.com/groups/equirectangular/). To take an equirectangular photo, check out this [360-degree photography guide](http://ngokevin.com/blog/360-photography/).
