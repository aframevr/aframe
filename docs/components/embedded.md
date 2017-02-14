---
title: embedded
type: components
layout: docs
parent_section: components
---

The embedded component removes fullscreen CSS styles from A-Frame's `<canvas>`
element, making it easier to embed within the layout of an existing webpage. It
removes fixed positioning from the canvas and makes the Enter VR / Fullscreen
UI smaller.

## Example

```html
<a-scene embedded></a-scene>
```

<script src="/aframe/dist/aframe-master.min.js"></script>
<div id="myEmbeddedScene">
<a-scene embedded>
  <a-entity position="0 0 3.8"><a-camera></a-camera></a-entity>
  <a-sphere position="0 1.25 -1" radius="1.25" color="#EF2D5E"></a-sphere>
  <a-box position="-1 0.5 1" rotation="0 45 0" width="1" height="1" depth="1"  color="#4CC3D9">
    <a-animation attribute="rotation" dur="10000" fill="forwards" to="0 360 0" repeat="indefinite"></a-animation>
  </a-box>
  <a-cylinder position="1 0.75 1" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
  <a-plane rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
</a-scene>
</div>
<style>
#myEmbeddedScene {
  width:100%;
  height:200px;
}
</style>
AFrame scene embedded as on your page page. You can use your mouse 

## Example of CSS integration
Using CSS on the above example allows for betting integration of the scene with the rest of the content.
```css
#myEmbeddedScene {
  width:100%;
  height:200px;
}
```

## Better integration
Embedded scenes make AFrame content visually and programmatically available to the rest of the page.

Amongst other things you can:
* use CSS z-index to put element above or under the scene
* use a transparent `<a-sky>` to overlay on top of an existing page, background and HTML elements includued
* use HTML elements to control entities based on interactions with the content on your page
* use `look-controls="enabled:false"` on the camera to prevent the user from freely looking in the scene


## Known limitations
* only one a-scene can exist on a page. Alternatively you can use `<iframe>` with ```allowvr="yes"```, preferably from the same origin, and display several scenes on the same page.
* because of limited fullscreen capabilities of mobile browsers proper positionning on mobile can be problematic. It should be tested thoroughly. As a partial solution you can put the embedded scene at the top of the page.
