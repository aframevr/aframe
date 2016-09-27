---
title: <a-video>
type: primitives
layout: docs
parent_section: primitives
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

| Attribute       | Component Mapping       | Default Value |
| --------        | -----------------       | ------------- |
| color           | material.color          | #FFF          |
| height          | geometry.height         | 1.75          |
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
| width           | geometry.width          | 3             |

## Caveats

iOS has a lot of restrictions on playing videos in the browser. To play an inline video texture, we must:

- Set the `<meta name="apple-mobile-web-app-capable" content="yes">` meta tag (will be injected if missing).
- Set the `webkit-playsinline` attribute to the video element (is automatically added to all videos).
- Pin the webpage to the iOS homescreen.

Inline video support on iOS 10 may change this. On certain Android devices or
browsers, we must:

[android-touch-bug]: https://bugs.chromium.org/p/chromium/issues/detail?id=178297

- Require user interaction to trigger the video (such as a click or tap event). See [Chromium Bug 178297][android-touch-bug].
