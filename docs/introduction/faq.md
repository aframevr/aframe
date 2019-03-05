---
title: FAQ
type: introduction
layout: docs
parent_section: introduction
order: 14
---

[ecs]: ./entity-component-system.md
[github]: http://github.com/aframevr/aframe/
[three]: http://threejs.org
[slack]: https://aframevr-slack.herokuapp.com/
[twitter]: https://twitter.com/aframevr/
[stackoverflow]: http://stackoverflow.com/questions/tagged/aframe/

<!--toc-->

## How is A-Frame's performance?

[a-painter]: https://blog.mozvr.com/a-painter
[tiltbrush]: https://www.tiltbrush.com/

A-Frame can achieve native-like latency and framerate with proper browsers
(e.g., Firefox with WebVR). For example, [A-Painter][a-painter] is [Tilt
Brush][tiltbrush] in the browser that can smoothly run 90 frames per second
and can be indiscernible from native.

A-Frame being based on HTML is not an issue. While the browser's 2D layout has
been a primary performance concern for normal web applications, A-Frame uses
Custom Elements to act merely as data containers and does not trigger the
layout engine. 3D operations are done in memory with minimal overhead and
are rendered with WebGL, which binds to OpenGL or Direct3D.

Some measures that A-Frame takes to minimize overhead include:

- Making `setAttribute` synchronous with a reduced code path. Modifying an
  entity's position via `setAttribute('position', {x: 1, y: 2, z: 3})` almost
  directly touches the underlying three.js objects. The overhead involves
  comparing new data to old data to determine whether a change needs to be triggered
  and invoking lifecycle handlers.
- Not serializing data back to the DOM. When changing an entity's properties, the actual
  HTML as seen in the browser's DOM inspector is not updated to reduce stringification
  operations. This makes most operations done in memory, a tiny bit similar to
  Virtual DOM.
- Keeping everything under a single `requestAnimationFrame` and letting
  components hook into a single global render loop via the `tick` handler.
- Caching HTML attributes values.
- Caching assets, materials, textures, geometries.
- Providing community components that implement performance techniques used in the
  3D and game industry (e.g., geometry instancing, level-of-detail, object pooling).

[bestpractices]: ../introduction/best-practices.md

A-Frame provides reasonable defaults that yield good performance for most
common use cases. However, performance is ultimately determined by the
complexity and characteristics of each individual application. To get the best
use of resources, we will need deeper understanding about 3D graphics.  See
[best performance practices and guidelines][bestpractices] to get started.

## Why does my asset (e.g., image, video, model) not load?

[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[localserver]: ./installation.md#local-development

First, if you are doing local development, make sure you are [using a local
server][localserver] so that asset requests work properly.

If you are loading the asset from a different domain, make sure that the asset
is served with [cross-origin resource sharing (CORS) headers][cors]. You could
either find a host to serve the asset with CORS headers, or place the asset on
the same domain (directory) as your application.

If you are trying to load a video, make sure the browser supports the video
(i.e., encoding, framerate, size).

Read the [*Hosting and Publishing* guide](./hosting-and-publishing.md) for more
information.

## Why is the HTML not updating when I check the browser inspector?

[debug]: ../components/debug.md
[flushtodom]: ../core/entity.md#flushtodom-recursive

If you open up your browser's developer tools, you'll see that the HTML
attribute values are empty.

![HTML](https://cloud.githubusercontent.com/assets/674727/25720562/2b243bda-30c2-11e7-98d5-479157d20046.jpg)

To improve performance, A-Frame does not update the HTML to save on
stringification operations. This also means mutation observations will not
fire. Use the [debug component][debug] or [`.flushToDOM` methods][flushtodom]
if you need to sync to the DOM.

## Why does my video not play on mobile?

[iosvideo]: https://developer.apple.com/library/iad/documentation/UserExperience/Conceptual/iAdJSProgGuide/PlayingVideosinAds/PlayingVideosinAds.html

Mobile browsers have had limitations playing inline video.

Because of an [iOS platform restriction][iosvideo] in order to get inline video
(with or without autoplay), we must:

- Set the `<meta name="apple-mobile-web-app-capable" content="yes">` meta tag (will be injected if missing).
- Set the `playsinline` attribute to the video element (is automatically added to all videos).
- Possibly pin the webpage to the homescreen for older iOS versions.

Inline video support on iOS 10 may change this. On certain Android devices or
browsers, we must:

[android-touch-bug]: https://bugs.chromium.org/p/chromium/issues/detail?id=178297

- Require user interaction to trigger the video (such as a click or tap event). See [Chromium Bug 178297][android-touch-bug].

Lately, there has been improving support. We do not focus too much on video,
but below are GitHub issues that may contain helpful information from community:

- [*Videos and videospheres don't work on mobile*](https://github.com/aframevr/aframe/issues/316)
- [*Document iOS video encoding restrictions*](https://github.com/aframevr/aframe/issues/1846)
- [*Official videosphere demo does not work on mobile*](https://github.com/aframevr/aframe/issues/2152)

## How do I display `<iframe>`s or render HTML in A-Frame?

There is no way for the browser to display `<iframe>`s within WebGL. While it
is possible to overlay an `<iframe>` on top of the canvas, the `<iframe>` will
not display in VR nor can it integrate with the scene.

[html-shader]: https://github.com/mayognaise/aframe-html-shader/

Though, we can render basic HTML and CSS as a texture without interactivity.
We can paint to a `<canvas>` and use the canvas as source for a texture. There
are components in the ecosystem that enable this:

- [HTML Shader][html-shader]

## Which 3D model formats work?

[gltf]: https://en.wikipedia.org/wiki/GlTF
[whygltf]: ../components/gltf-model.md#why-use-gltf

The ideal format is the GL Transmission Format [glTF (`.gltf`)][gltf] since
glTF is feature-rich, compact, and efficient. glTF focuses on providing a
*transmission format* rather than an editor format and is more interoperable
with web technologies.  [Read more about glTF and A-Frame's glTF
component][whygltf].

[obj]: https://en.wikipedia.org/wiki/Wavefront_.obj_file

[Wavefront (`.obj`)][obj] is also a well-known format but has some limitations
like the lack of animation and vertex color support.

There are also components in the ecosystem for loading other formats:

- [`.PLY` models](https://github.com/donmccurdy/aframe-extras/blob/master/src/loaders/ply-model.js)
- [three.js `.JSON` Object](https://github.com/donmccurdy/aframe-extras/blob/master/src/loaders/json-model.js)
- [three.js `.JSON` Scene](https://github.com/donmccurdy/aframe-extras/blob/master/src/loaders/object-model.js)

Below are a couple basic examples for using models:

- [Model Example 1](https://aframe.io/aframe/examples/test/model/)
- [Model Example 2](https://aframe.io/aframe/examples/primitives/models/)

## Where can I find assets?

[awesomestock]: https://github.com/neutraltone/awesome-stock-resources

In general, [awesome-stock-resources][awesomestock] is a great collection of
free assets.

[textures]: https://www.textures.com/

For images, check out [textures.com][textures].

[flickr]: https://www.flickr.com/groups/equirectangular/

For 360&deg; images, search for [equirectangular images on Flickr][flickr].

For 3D models, check out:

- [Google Blocks](https://vr.google.com/objects)
- [Sketchfab](https://sketchfab.com)
- [Clara.io](http://clara.io)
- [Archive3D](http://archive3d.net)
- [Sketchup's 3D Warehouse](https://3dwarehouse.sketchup.com)
- [TurboSquid](http://www.turbosquid.com/Search/3D-Models/free)

For sounds, check out:

- [Freesound.org](http://www.freesound.org/)
- [Annual GDC Game Audio Bundles by Sonniss](http://www.sonniss.com/gameaudiogdc2016/)

## Can I render Vimeo videos as a texture?

Yes. [Vimeo has an A-Frame plugin](https://github.com/vimeo/vimeo-webvr-demo), but rendering is limited to just videos from your personal Vimeo account.

## Can I render YouTube videos as a texture?

[proxy]: https://github.com/cvan/webvr360

No. You could [proxy YouTube videos][proxy] as a texture or download them locally
to serve, but that is against their terms of service.

## Can I add links to my scene?

Browsers provide the ability to go from WebVR page to WebVR page via the
`vrdisplayactivate` event described in the WebVR specification. Currently, not
all browsers implement this. Firefox with WebVR implements this. A link
component for link traversal was released with A-Frame 0.6.0:

```html
<a-entity link="on: click; href: https://aframe-aincraft.glitch.me"></a-entity>
```

## Can I prevent the camera from going through obstacles?

This depends on what devices you plan to support and how you allow users to
navigate your scene. For most VR experiences, follow best practices and only
move the camera proportionately to the user's motion.

[teleport]: https://github.com/fernandojsg/aframe-teleport-controls

Don't block the camera if the user steps forward in a room-scale VR space. For
most VR applications it's better to do locomotion with methods such as using
[teleportation controls][teleport], designing your scene to keep obstacles out
of the way or not require much movement, or explore more creative ways of
moving users through the world.

[physics]: https://github.com/donmccurdy/aframe-physics-system

For non-VR desktop experiences with a gamepad or keyboard controls or for VR
scenes where the camera is inside a vehicle, you can add a [physics
engine][physics] to prevent movement through obstacles.

## What type of units does A-Frame use?

A-Frame uses meters with a 1:1 ratio since the WebVR API also uses meters. 5
units in A-Frame is equal to 5 meters in real life. Furthermore, when using
programs like Blender, configured in imperial or metric mode, measurements will
also translate 1:1. 10 feet in Blender will equal 10 feet in real life.

## How is A-Frame different from VRML?

[extensible]: https://extensiblewebmanifesto.org/

A-Frame is a JavaScript framework. Unlike VRML, A-Frame is not a 3D file
format, markup language, nor a standard. A-Frame embraces the [Extensible Web
Manifesto][extensible]. Only look at standardization as winning ideas emerge.

Technically, A-Frame is an [entity-component-system][ecs] game engine on top of
three.js. As it is a JavaScript framework, coding is to be expected for more
complex applications. Unlike 3D file formats, A-Frame provides power and
interactivity via full access to JavaScript, three.js, and Web APIs.

## Does A-Frame support `X` feature?

[aframecomponents]: https://github.com/aframevr/aframe/tree/master/src/components
[writingcomponent]: ./writing-a-component.md

A-Frame ships with a number of components and primitives. Being based on top of
an [entity-component-system architecture][ecs], if a feature doesn't exist, you
can [write or find a component][writingcomponent] to enable it. Or if one of
the standard components doesn't fit your use cases, you can [copy and modify
it][aframecomponents].

[finding]: ./entity-component-system.md#where-to-find-components

Read [*Where to Find Components*][finding] for more information.

## Does A-Frame support `X` library or framework?

A-Frame is built on top of the DOM so most libraries and frameworks work
including:

- [Vue.js](https://github.com/frederic-schwarz/aframe-vuejs-3dio)
- [Preact](https://github.com/aframevr/aframe-react#using-with-preact)
- [D3.js](http://blockbuilder.org/search#text=aframe)
- [React](https://github.com/aframevr/aframe-react)
- [Angular](https://stackoverflow.com/questions/46464103/various-errors-when-attempting-to-integrate-aframe-into-angular2-project-esp-wi)
- jQuery
- Ember.js
- Meteor

## Which headsets, browsers, devices, and platforms does A-Frame support?

[deviceplatform]: ./vr-headsets-and-webvr-browsers.md

Most of them. Read *[VR Headsets and WebVR Browsers][deviceplatform]* for more
information.

## How can I improve performance?

[bestpractices-perf]: ./best-practices.md#performance

Read *[Best Practices &mdash; Performance][bestpractices-perf]* for more information.

## How can I get in touch with the A-Frame team?

We try to be responsive and helpful! We love questions, feedback, bug reports,
and pull requests:

- Got a question? Ask us using the [A-Frame StackOverflow tag][stackoverflow].
- Want to chat? Hang out with us on the community [A-Frame Slack channel][slack].
- Want to share? Tweet at us at [@aframevr][twitter].
- Find an issue? File issues on the [A-Frame GitHub repo][github].

## Where is the roadmap?

[roadmap]: https://github.com/aframevr/aframe/blob/master/ROADMAP.md

The [roadmap is on GitHub][roadmap]!

## Do I call it "A-Frame" or "aframe" or "aframevr" or "aFrame"?

A-Frame!

## Why do my textures render black?

[precision]: ../components/renderer.md#precision

Phones with Adreno 300 series GPUs are notoriously problematic. Set [renderer precision][precision] to `medium` as a workaround. Real fix has to happen at the driver / device level.
