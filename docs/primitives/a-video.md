---
title: <a-video>
type: primitives
layout: docs
parent_section: primitives
order: 17
---

The video primitive displays a video on a flat plane as a texture. It is an entity that prescribes the [geometry](../components/geometry.md) with its geometric primitive set to `plane`.

## Example

```html
<a-scene>
  <a-assets>
    <video id="penguin-sledding" autoplay loop="true" src="penguin-sledding.mp4">
  </a-assets>

  <!-- Using the asset management system. -->
  <a-video src="#penguin-sledding" width="16" height="9" position="0 0 -20"></a-video>

  <!-- Defining the URL inline. Not recommended but more comfortable for web developers. -->
  <a-video src="airbending.mp4"></a-video>
</a-scene>
```

## Attributes

Note that the video primitive inherits common [mesh attributes](./mesh-attributes.md).

| Attribute       | Component Mapping     | Default Value |
|-----------------|-----------------------|---------------|
| height          | geometry.height       | 1.75          |
| width           | geometry.width        | 3             |

## Caveats

iOS has a lot of restrictions on playing videos in the browser. To play an inline video texture, we must:

- Set the `<meta name="apple-mobile-web-app-capable" content="yes"` metatag.
- Set the `webkit-playsinline` attribute to the video element.
- Pin the webpage to the iOS homescreen.
