---
title: <a-videosphere>
type: primitives
layout: docs
parent_section: primitives
---

The videosphere primitive easily adds a 360-degree video background to a scene or display a 360-degree video. It is an entity that prescribes a large sphere with the video texture mapped to the inside.

## Examples

```html
<a-scene>
  <a-assets>
    <video id="antarctica" autoplay loop="true" src="antarctica.mp4">
  </a-assets>

  <!-- Using the asset management system. -->
  <a-videosphere src="#antarctica"></a-videosphere>

  <!-- Defining the URL inline. Not recommended but more comfortable for web developers. -->
  <a-videosphere src="africa.mp4"></a-videosphere>
</a-scene>
```

## Attributes

Note that the videosphere primitive inherits [common attributes](./common-attributes.md).

| Attribute       | Component Mapping       | Default Value |
|-----------------|-------------------------|---------------|
| autoplay        | `<video>`.autoplay      | true          |
| crossOrigin     | `<video>`.crossOrigin   | anonymous     |
| loop            | `<video>`.loop          | true          |
| radius          | geometry.radius         | 5000          |
| segments-height | geometry.segmentsHeight | 64            |
| segments-width  | geometry.segmentsWidth  | 64            |

## Equirectangular Video

In order to be seamless, videos should be [equirectangular](https://en.wikipedia.org/wiki/Equirectangular_projection).

## Caveats

iOS has a lot of restrictions on playing videos in the browser. To play an inline video texture, we must:

- Set the `<meta name="apple-mobile-web-app-capable" content="yes">` meta tag (will be injected if missing).
- Set the `webkit-playsinline` attribute to the video element (is automatically added to all videos).
- Pin the webpage to the iOS homescreen.

Inline video support on iOS 10 may change this. On certain Android devices or
browsers, we must:

[android-touch-bug]: https://bugs.chromium.org/p/chromium/issues/detail?id=178297

- Require user interaction to trigger the video (such as a click or tap event). See [Chromium Bug 178297][android-touch-bug]
