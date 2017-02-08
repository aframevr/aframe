---
title: Asset Management System
type: core
layout: docs
parent_section: core
order: 9
---

A-Frame has an asset management system that allows us to place our assets in
one place and to preload and cache assets for better performance.

Games and rich 3D experiences traditionally preload their assets, such as
models or textures, before rendering their scenes. This makes sure that assets
aren't missing visually, and this is beneficial for performance to ensure
scenes don't try to fetch assets while rendering.

We place assets within `<a-assets>`, and we place `<a-assets>` within
`<a-scene>`. Assets include:

- `<a-asset-item>` - Miscellaneous assets such as 3D models and materials
- `<audio>` - Sound files
- `<img>` - Image textures
- `<video>` - Video textures

The scene won't render or initialize until the browser fetches (or errors out)
all the assets or the asset system reaches the timeout.

<!--toc-->

## Example

We can define our assets in `<a-assets>` and point to those assets from our
entities using selectors:

```html
<a-scene>
  <!-- Asset management system. -->
  <a-assets>
    <a-asset-item id="horse-obj" src="horse.obj"></a-asset-item>
    <a-asset-item id="horse-mtl" src="horse.mtl"></a-asset-item>
    <a-mixin id="giant" scale="5 5 5"></a-mixin>
    <audio id="neigh" src="neigh.mp3">
    <img id="advertisement" src="ad.png">
    <video id="kentucky-derby" src="derby.mp4">
  </a-assets>

  <!-- Scene. -->
  <a-plane src="advertisement"></a-plane>
  <a-sound src="#neigh"></a-sound>
  <a-entity geometry="primitive: plane" material="src: #kentucky-derby"></a-entity>
  <a-entity mixin="giant" obj-model="obj: #horse-obj; mtl: #horse-mtl"></a-entity>
</a-scene>
```

The scene and its entities will wait for every asset (up until the timeout)
before initializing and rendering.

## Cross-Origin Resource Sharing (CORS)

[cors]: https://wikipedia.org/wiki/Cross-origin_resource_sharing
[xhr]: https://developer.mozilla.org/docs/Web/API/XMLHttpRequest

Since A-Frame fetches assets using [XHRs][xhr], browser security requires the
browser to serve assets with [cross-origin resource sharing (CORS)
headers][cors] if the asset is on a different domain. Otherwise, we'd have
to host assets on the same origin as the scene.

[ghpages]: https://pages.github.com/
[uploader]: https://cdn.aframe.io

For some options, [GitHub Pages][ghpages] serves everything with CORS headers.
We recommend GitHub Pages as a simple deployment platform.  Or you could also
upload assets using the [A-Frame + Uploadcare Uploader][uploader], a service
that serves files with CORS headers set.

[corsimage]: https://developer.mozilla.org/docs/Web/HTML/CORS_enabled_image

Given that [CORS headers][corsimage] *are* set, `<a-assets>` will automatically set
`crossorigin` attributes on media elements (e.g., `<audio>`, `<img>`,
`<video>`) if it detects the resource is on a different domain.

## Preloading Audio and Video

Audio and video assets will only block the scene if we set `autoplay` or if we
set `preload="auto"`:

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

We can set a timeout that when reached, the scene will begin rendering and
entities will begin initializing regardless of whether all the assets have
loaded. The default timeout is 3 seconds. To set a different timeout, we just
pass in the number of milliseconds to the `timeout` attribute:

If some assets are taking a long time to load, we may want to set an
appropriate timeout such that the user isn't waiting all day in case their
network is slow.

```html
<a-scene>
  <a-assets timeout="10000">
    <!-- You got until the count of 10 to load else the show will go on without you. -->
    <img src="bigimage.png">
  </a-asset>
</a-scene>
```

## Events

Since `<a-assets>` and `<a-asset-item>` are *nodes* in A-Frame, they will emit
the `loaded` event when they say they have finished loading.

### <a-assets>

| Event Name | Description                                  |
|------------|----------------------------------------------|
| loaded     | All assets were loaded, or assets timed out. |
| timeout    | Assets timed out.                            |

## Load Progress on Individual Assets

### `<a-asset-item>`

`<a-asset-item>` invokes the [three.js
FileLoader](https://threejs.org/docs/#Reference/Loaders/FileLoader).  We can use
`<a-asset-item>` for any file type. When finished, it will set its `data`
member with the text response.

| Event Name | Description                                                                                                       |
|------------|-------------------------------------------------------------------------------------------------------------------|
| error      | Fetch error. Event detail contains `xhr` with `XMLHttpRequest` instance.                                          |
| progress   | Emitted on progress. Event detail contains `xhr` with `XMLHttpRequest` instance, `loadedBytes`, and `totalBytes`. |
| loaded     | Asset pointed to by `src` was loaded.                                                                             |

### `<img>`

Images are a standard DOM element so we can listen to the standard DOM events.

| Event Name | Description       |
|------------|-------------------|
| load       | Image was loaded. |

### `HTMLMediaElement`

[mediael]: https://developer.mozilla.org/docs/Web/API/HTMLMediaElement

Audio and video assets are [`HTMLMediaElement`][mediael]s. The browser triggers
particular events on these elements; noted here for convenience:

| Event Name | Description                           |
|------------|---------------------------------------|
| error      | There was an error loading the asset. |
| loadeddata | Progress.                             |
| progress   | Progress.                             |

A-Frame uses these progress events, comparing how much time the browser
buffered with the duration of the asset, to detect when the asset becomes loaded.

## How It Works Internally

Every element in A-Frame inherits from `<a-node>`, the `AFRAME.ANode`
prototype. `ANode` controls load and initialization order. For an element to
initialize (whether it be `<a-assets>`, `<a-asset-item>`, `<a-scene>`, or
`<a-entity>`), its children must have already initialized. Nodes initialize
bottom up.

`<a-assets>` is an `ANode`, and it waits for its children to load before
it loads. And since `<a-assets>` is a child of `<a-scene>`, the scene
effectively must wait for all assets to load. We also added extra load logic to
`<a-entity>` such that they explicitly wait for `<a-assets>` to load if we have
defined `<a-assets>`.

`<a-asset-item>` uses `THREE.FileLoader` to fetch files. three.js stores the
returned data in `THREE.Cache`. Every three.js loader inherits from
`THREE.FileLoader`, whether they are a `ColladaLoader`, `OBJLoader`,
`ImageLoader`, etc. And they all have access and are aware of the central
`THREE.Cache`. If A-Frame already fetched a file, A-Frame won't try to fetch it
again.

Thus, since we block entity initialization on assets, by the time entities
load, all assets will have been already fetched. As long as we define
`<a-asset-item>`s, and the entity is fetching files using some form
`THREE.FileLoader`, then caching will automatically work.

## Accessing the `FileLoader` and Cache

To access the three.js `FileLoader` if we want to listen more closely:

```js
console.log(document.querySelector('a-assets').fileLoader);
```

To access the cache that stores XHR responses:

```js
console.log(THREE.Cache);
```
