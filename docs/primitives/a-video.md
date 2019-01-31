---
title: <a-video>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/a-video.js
---

The video primitive plays a video as a texture on a flat plane.

## Example

```html
<a-scene>
  <a-assets>
    <video id="penguin-sledding" autoplay loop="true" src="penguin-sledding.mp4"></video>
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
| shader          | material.shader         | flat          |
| side            | material.side           | front         |
| src             | material.src            | None          |
| transparent     | material.transparent    | false         |
| width           | geometry.width          | 3             |

## Caveats

iOS has a lot of restrictions on playing videos in the browser. To play an inline video texture, we must:

- Set the `<meta name="apple-mobile-web-app-capable" content="yes">` meta tag. A-Frame will inject this if missing.
- Set the `webkit-playsinline` and `playsinline` attribute to the video element. A-Frame will add this to all videos if missing).

Since iOS 11, iOS has required user interaction to trigger video playback. This is also true on a number of Android device and
browser combinations.

## Fine-Tuning

Ensuring that the video is not distorted by stretching requires us to appropriately set the `width` and `height` preserving the original aspect ratio of the video. This properties are set in meters, don't confuse with pixels.

For example, a 2:1 video:

```html
<a-video src="#myvideo" width="3" height="1.5"></a-video>
```


