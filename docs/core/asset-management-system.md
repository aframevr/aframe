---
title: Asset Management System
type: core
layout: docs
parent_section: core
order: 8
---

Games and rich 3D experiences traditionally preload many of their assets, such as models or textures, before rendering their scenes. This makes sure that assets aren't missing visually, and this is benenficial for performance to ensure scenes don't try to fetch assets while rendering. A-Frame has an asset management system that allows us to place all of our assets in one place and to preload and cache assets for better performance.

Assets are placed within `<a-assets>`, and `<a-assets>` is placed within `<a-scene>`. Assets include:

- `<a-asset-item>` - Miscellaneous assets such as 3D models
- `<a-mixin>` - Reusable [mixins][mixins]
- `<audio>` - Sound files
- `<img>` - Image textures
- `<video>` - Video textures

Then the scene will block until all of these assets are fetched (or error out) before playing.

## Example

We can define all of our assets in `<a-assets>` and point to those assets from our entities using selectors:

```html
<a-scene>
  <!-- Asset management system. -->
  <a-assets>
    <a-asset-item id="horse-obj" src="horse.obj></a-asset-item>
    <a-asset-item id="horse-mtl" src="horse.mtl></a-asset-item>

    <a-mixin id="giant" scale="5 5 5"></a-mixin>

    <audio src="neigh.mp3"></a-mixin>

    <img id="advertisement" src="ad.png">

    <video id="kentucky-derby" src="derby.mp4>
  </a-assets>

  <!-- Scene. -->
  <a-entity mixin="giant" obj-model="obj: #horse-obj; mtl: #horse-mtl"></a-entity>
  <a-entity geometry="primitive: plane" material="src: #kentucky-derby"></a-entity>
  <a-entity geometry="primitive: plane" material="src: #advertisement></a-entity>
</a-scene>
```

Then the scene will wait for all of the assets for rendering.

## Preloading Audio and Video

Audio and video assets will only block the scene if `autoplay` is set or if `preload="auto"`:

```html
<a-scene>
  <a-assets>
    <!-- These will not block. -->
    <audio src="blockus.mp3">
    <video src="loadofblocks.mp4">

    <!-- These will block. -->
    <audio src="blocky.mp3" autoplay>
    <video src="blockiscooking.mp4" preload="auto">
  </a-assets>
</a-scene>
```

## Setting a Timeout

If some assets are taking an extremely long time to load, we may want to set an appropriate timeout such that the user isn't waiting all day. When the timeout is reached, then the scene will start playing regardless of whether all the assets have loaded.

The default timeout is 3 seconds. To set a different timeout, we just pass in the number of milliseconds to the `timeout` attribute:

```html
<a-scene>
  <a-assets timeout="10000">
    <!-- You got until the count of 10 to load, else the show will go on without you. -->
    <img src="bigimage.png">
  </a-asset>
</a-scene>
```

## Events

Since `<a-assets>` and `<a-asset-item>` are *nodes* in A-Frame, they will emit the `loaded` event when they say they have finished loading.

### <a-assets>

| Event Name | Description                                  |
|------------|----------------------------------------------|
| loaded     | All assets were loaded, or assets timed out. |
| timeout    | Assets timed out.                            |

### <a-asset-item>

| Event Name | Description                           |
|------------|---------------------------------------|
| loaded     | Asset pointed to by `src` was loaded. |

## HTMLMediaElement

Audio and video assets are [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)s. These events are provided by the browser, but noted here for convenience:

| Event Name | Description                           |
|------------|---------------------------------------|
| error      | There was an error loading the asset. |
| loadeddata | Progress.                             |
| progress   | Progress.                             |

A-Frame uses the progress events, comparing how much time was buffered with the duration of the asset, in order to detect when the asset has been loaded.

[mixins]: ./mixins.md
