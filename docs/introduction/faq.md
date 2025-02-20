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
[slack]: https://aframevr.slack.com/join/shared_invite/zt-f6rne3ly-ekVaBU~Xu~fsZHXr56jacQ
[twitter]: https://twitter.com/aframevr/
[stackoverflow]: http://stackoverflow.com/questions/tagged/aframe/

<!--toc-->

## How is A-Frame's performance?

[a-painter]: https://github.com/aframevr/a-painter/
[tiltbrush]: https://github.com/icosa-foundation/open-brush

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

## Why is my experience not entering VR or AR mode?

[release]: https://github.com/aframevr/aframe/releases
[webxr]: https://immersive-web.github.io/webxr/

If you are using A-Frame 1.7.0 or older you probably need to update to the [latest release][release]. Browsers are migrating to the [WebXR standard][webxr] and old versions might no longer work.

You also have to serve your content over HTTPS. The WebXR API won't be available over HTTP.

## Why does my asset (e.g., image, video, model) not load?

[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[localserver]: ./installation.md#local-development
[startplayback]: https://aframe.io/aframe/examples/test/video/
[videotestcode]: https://github.com/aframevr/aframe/blob/master/examples/test/video/index.html
[videoplaycomponent]: https://github.com/aframevr/aframe/blob/master/examples/js/play-on-click.js

First, if you are doing local development, make sure you are [using a local
server][localserver] so that asset requests work properly.

If you are loading the asset from a different domain, make sure that the asset
is served with [cross-origin resource sharing (CORS) headers][cors]. You could
either find a host to serve the asset with CORS headers, or place the asset on
the same domain (directory) as your application.

If you are trying to load a video, make sure the browser supports the video
(i.e., encoding, framerate, size).

Video autoplay policies are getting more and more strict and rules might vary across browsers. Mandatory user gesture is now commonly enforced. For maximum compatibility, you can offer a button that the user can click to start [video playback][startplayback]. [Simple sample code][videotestcode] can be found in the docs. Pay particular attention to the [play-on-click component][videoplaycomponent]

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

## Why does my video not play?

[iosvideo]: https://developer.apple.com/library/iad/documentation/UserExperience/Conceptual/iAdJSProgGuide/PlayingVideosinAds/PlayingVideosinAds.html

Mobile and now desktop browsers have limitations playing inline video.

Because of an [iOS platform restriction][iosvideo] in order to get inline video
(with or without autoplay), we must:

- Set the `<meta name="apple-mobile-web-app-capable" content="yes">` meta tag (will be injected if missing).
- Set the `playsinline` attribute to the video element (is automatically added to all videos).
- Possibly pin the webpage to the homescreen for older iOS versions.

Mobile and desktop browsers have been tightening the video autoplay policies to preserve battery and avoid intrusive advertisements. Most browsers now require a user action (such as a click or tap event) to start video playback:

-[Chrome for Android](https://bugs.chromium.org/p/chromium/issues/detail?id=178297)
-[Chrome desktop](https://www.chromium.org/audio-video/autoplay)
-[Safari](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/)
-[Firefox](https://hacks.mozilla.org/2019/02/firefox-66-to-block-automatically-playing-audible-video-and-audio/)

[video-playback-example]: https://aframe.io/aframe/examples/test/video/
[video-playback-code]: https://github.com/aframevr/aframe/blob/master/examples/test/video/index.html

There's an [A-Frame example that includes the necessary logic][video-playback-example] to request the user clicking or tapping to start video playback. [The source code is also available][video-playback-code]

We do not focus too much on video, but below are GitHub issues that may contain helpful information from community:

- [*Videos and videospheres don't work on mobile*](https://github.com/aframevr/aframe/issues/316)
- [*Document iOS video encoding restrictions*](https://github.com/aframevr/aframe/issues/1846)
- [*Official videosphere demo does not work on mobile*](https://github.com/aframevr/aframe/issues/2152)

## How do I display `<iframe>`s or render HTML in A-Frame?

There is no way for the browser to display `<iframe>`s within WebGL. While it
is possible to overlay an `<iframe>` on top of the canvas, the `<iframe>` will
not display in VR nor can it integrate with the scene.

[html-shader]: https://github.com/mayognaise/aframe-html-shader/
[html-mesh]: https://github.com/AdaRoseCannon/aframe-htmlmesh

Though, we can render basic HTML and CSS as a texture without interactivity.
We can paint to a `<canvas>` and use the canvas as source for a texture. There
are components in the ecosystem that enable this:

- [HTML Shader][html-shader]
- [HTML Mesh][html-mesh]

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

[link-traversal-example]: https://aframe.io/aframe/examples/showcase/link-traversal/

Browsers provide the ability to go from WebVR page to WebVR page via the
`vrdisplayactivate` event described in the WebVR specification. Currently, not
all browsers implement this. Firefox with WebVR implements this. A link
component for link traversal ([example][link-traversal-example]) was released with A-Frame 0.6.0:

```html
<a-entity link="on: click; href: https://aframe-aincraft.glitch.me"></a-entity>
```

## Can I prevent the camera from going through obstacles?

This depends on what devices you plan to support and how you allow users to
navigate your scene. For most VR experiences, follow best practices and only
move the camera proportionately to the user's motion.

[teleport]: https://github.com/jure/aframe-blink-controls

Don't block the camera if the user steps forward in a room-scale VR space. For
most VR applications it's better to do locomotion with methods such as using
[teleportation controls][teleport], designing your scene to keep obstacles out
of the way or not require much movement, or explore more creative ways of
moving users through the world.

[physics]: https://github.com/c-frame/aframe-physics-system

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
including jQuery, HTMX, React, SolidJS, Vue and Svelte.

Some meta frameworks like TanStack Start and SolidStart hide the `index.html`,
so you may encounter issues adding additional script tags and template tags (for
Networked-Aframe).

We advice you to use a template for your framework that still has an `index.html`
you can edit and render the UI to a specific div while keeping your `<a-scene>`
directly in `index.html`. That way you can easily follow A-Frame examples.
If you're creating a complex app with several routes and only specific routes
render an A-Frame scene, you'll want to add a router library and render
`<a-scene>` via a component in your framework.
Reactive frameworks like SolidJS and latest versions of Vue and Svelte are
well suited for this because they doesn't do unnecessary computation to check
if something needs to be updated. You can do that also in React but be sure to wrap
your Scene and UI components with React.memo and proper usage of useMemo/useCallback
or better enable the React Compiler that does this for you to avoid any performance
issues.

The Vite build tool has templates for most of the popular frameworks.
You can follow the [Vite Guide](https://vite.dev/guide/) to create a new project
and then add the aframe `<script>` tag in the head and the `<a-scene>` tag in
the body.

For SolidJS and Networked-Aframe, you have a
[dedicated tutorial](https://aframe.wiki/en/#!pages/solidjs.md) explaining how
to set up a project, and using a router to render the scene for a specific
route. For React, it should be very similar.

## Which headsets, browsers, devices, and platforms does A-Frame support?

[deviceplatform]: ./vr-headsets-and-webxr-browsers.md

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

## Why is the gyroscope / magic window mode not working?

[New browser policies](https://www.w3.org/TR/orientation-event/#dom-deviceorientationevent-requestpermission) require sites to prompt the user for permission before getting access to DeviceMotionEvents. [Starting with iOS 13](https://webkit.org/blog/9674/new-webkit-features-in-safari-13/) DeviceMotionEvents are only available for pages served over `https`. Other browsers will also apply same policies and restrictions. A-Frame now [incorporates customizable UI](https://aframe.io/docs/1.0.0/components/device-orientation-permission-ui.html#sidebar) to request the necessary permissions to the user. Make sure to update to [A-Frame latest version](https://github.com/aframevr/aframe/releases)


## Can I use A-Frame offline or self hosted?

Using A-Frame online sometimes is not possible or inconvenient, for instance when traveling or during public events with poor Internet connectivity. A-Frame is mostly self-contained so including the build (aframe.min.js) in your project will be sufficient in many cases. Some specific parts are lazy loaded and only fetched when used. This is for example the case of the fonts for the text component and the 3D models for controllers. In order to make an A-Frame build work either offline or without relying on A-Frame hosting infrastructure (typically cdn.aframe.io), you can monitor network requests on your browser console. This will show precisely what assets are being loaded and thus as required for your specific experience. Fonts can be found via FONT_BASE_URL in the whereas controllers via MODEL_URLS. Both can be modified in the source and included in your own [custom build](https://github.com/aframevr/aframe#generating-builds).

Alternatively one can set `window.AFRAME_CDN_ROOT='./assets/'` before loading AFrame. That directory can contain [files from the assets repository](https://github.com/aframevr/assets), in particular the `./fonts` and `./controllers` directories. Note that not all files are required, for example for controllers only the `.glb` files are required, others can thus be safely removed. Once again it is good to check with the browser network inspector that all needed files are loading properly locally before going truly offline.


## Can I load A-Frame as an ES module?

You can load A-Frame as an ES module using a [side effect import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#import_a_module_for_its_side_effects_only). A-Frame will then initialize any `<a-scene>` in the document. It's still important to register any components or systems you need before this happens:

```HTML
<head>
  <script type="importmap">
    {
        "imports": {
            "aframe": "https://aframe.io/releases/1.7.0/aframe.min.js",
        }
    }
  </script>
  <script type="module">
    import 'aframe';
    AFRAME.registerComponent('my-component', {
      ...
    });
  </script>
</head>
```

If it's not possible to register everything synchronously to importing A-Frame, you can set the `window.AFRAME_ASYNC` flag. This prevents A-Frame from initializing `<a-scene>` tags, until you give a ready signal by calling `window.AFRAME.emitReady()`. Note that this flag must be set before importing A-Frame, as shown in the following example:

```JS
window.AFRAME_ASYNC = true;
await import('aframe');

// Asynchronously register components/systems

window.AFRAME.ready();
```

Since version 1.7.0, A-Frame ships an ES module bundle without the three dependency.
Developers can import from `three` and `three/addons` and avoid the
"Multiple instances of Three.js being imported." warning. Add the three dependency in the importmap like the example below. 
Make sure the three and A-Frame versions are compatible. See browser console (or package.json) to see what THREE version A-Frame ships with by default.

```HTML
<head>
  <script type="importmap">
    {
      "imports": {
        "aframe": "https://aframe.io/releases/1.7.0/aframe.module.min.js",
        "three": "https://cdn.jsdelivr.net/npm/super-three@0.173.4/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/super-three@0.173.4/examples/jsm/",
        "aframe-extras/controls": "https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.5.x/dist/aframe-extras.controls.min.js"
      }
    }
  </script>
  <script type="module">
    import AFRAME from "aframe";
    // AFRAME and THREE variables are available globally, the imported aframe-master.module.min.js bundle basically does:
    // import * as THREE from "three"
    // window.THREE = THREE
    import { TeapotGeometry } from "three/addons/geometries/TeapotGeometry.js"; // This uses the same three instance.
    AFRAME.registerComponent("teapot", {
      ...
    }
  </script>
</head>
```

The [importmap example](https://aframe.io/aframe/examples/boilerplate/importmap/index.html) uses the above code.

## "Multiple instances of Three.js being imported." warning

See `Can I load A-Frame as an ES module?` above.

As a library author of aframe components, be sure to configure your bundler configuration to produce a build with the three dependency declared as external if you're using any `import ... from three` in your code or any addons you import like `import ... from three/addons/...js`.
You can look at the webpack configuration in the [aframe-extras repository](https://github.com/c-frame/aframe-extras) as an example.

## What order does A-Frame render objects in?

[sortTransparentObjects]: ../components/renderer.md#sorttransparentobjects

In many cases, the order in which objects is rendered doesn't matter much - most scenes will look the same whatever order the objects are rendered in - but there are a few cases where sorting is important:

- for transparent objects, it's typically better to render objects furthest to nearest (although some cases are more complex and require [more sophisticated approaches](https://threejs.org/manual/?q=transp[#en/transparency)).  However, when the camera and/or objects are moving, this can result in undesirable visual effects when objects switch in terms of their relative distance from the camera
- for performance reasons, it's typically desirable to render objects nearest to furthest, so that GPU doesn't spend time drawing pixels that end up being drawn over.
- for AR "hider material" used to hide parts of the scene to create the appearance of occlusion by real-world objects, it's typically necessary to render these before the rest of the scene.

By default, A-Frame sorts objects as follows:

- for all objects, if [`renderOrder`](https://threejs.org/docs/index.html?q=object3D#api/en/core/Object3D.renderOrder) is set on the Object3D or a Group that it is a member of, the specified order will be respected
- otherwise, opaque objects are rendered furthest to nearest, and transparent objects are rendered in the order they appear in the THREE.js Object tree (in most cases, this is the same as the order they appear in the DOM)

The `renderer` system has a [`sortTransparentObjects`][sortTransparentObjects] property, which can be used to render transparent objects furthest to nearest, rather than in DOM order.

