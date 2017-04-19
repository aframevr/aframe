---
title: FAQ
type: introduction
layout: docs
parent_section: introduction
order: 5
---

[awesome]: https://github.com/aframevr/awesome-aframe
[ecs]: ../core/index.md
[github]: http://github.com/aframevr/aframe
[html-shader]: https://github.com/mayognaise/aframe-html-shader
[three]: http://threejs.org
[slack]: https://aframevr-slack.herokuapp.com/
[twitter]: https://twitter.com/aframevr
[stackoverflow]: http://stackoverflow.com/questions/tagged/aframe

<!--toc-->

## What is A-Frame?

A-Frame is an open-source web framework for building virtual reality
experiences. We can build VR web pages that we can walk inside with just HTML.
Under the hood, it is a [three.js][three] framework that brings the
[entity-component-system][ecs] pattern to the DOM.

## Why was A-Frame built?

A-Frame was built to make virtual reality more accessible to the web community
and to kick-start the WebVR content ecosystem. It is easy to learn and fast to
develop, allowing us to quickly prototype patterns and experiences. A-Frame is
a vehicle in which to make WebVR successful.

## How can I get started?

[intro]: ../introduction/index.md
[gettingstarted]: ../introduction/getting-started.md
[guides]: ../guides/index.md

Read the [Introduction][intro] to get a deeper feel of what A-Frame is.

See the [Getting Started][gettingstarted] guide to get set up.

Check out the [guides][guides] for basic tutorials.

Past that, you can browse the resources on the [`awesome-aframe`
repository][awesome]. If you need additional support, [ask on
StackOverflow][stackoverflow].

## How is A-Frame's performance?

[a-painter]: https://blog.mozvr.com/a-painter

The layout system of the DOM have been one of the primary performance
bottlenecks for web applications. A-Frame uses the DOM via Custom Elements as
effectively data containers for objects in the scene graph. These elements are
not touched by the browser's rendering system and ultimately rendered with
WebGL. This allows us to run 90+ FPS room-scale experiences in the HTC Vive.
See [A-Painter][a-painter] for an example of a full A-Frame application running
with smooth performance.

- The effects of `setAttribute` are synchronous. When modifying an entity's
position, there is almost zero overhead. Doing `setAttribute('position', {x:
1, y: 2, z: 3})` is practically directly modifying the underlying three.js
objects themselves.
- When changing an entity's properties, data is not serialized back to the DOM. This
reduces the DOM overhead and most modifications are done directly in memory,
similar to Virtual DOM.
- HTML attributes explicitly set from an HTML file are cached in memory.

[bestpractices]: ../introduction/best-practices.md

A-Frame provides reasonable defaults that yield good performance for the most
common use cases. However, performance is ultimately determined by the
complexity and characteristics of each individual scene. To get the best use of
resources, we will need deeper understanding about 3D graphics. Read these
[best performance practices and guidelines][bestpractices] to help get you
started.

## Why does my asset (e.g., image, video, model) not load?

[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing

If you are loading the asset from a different domain, make sure that the asset
is served with [cross-origin resource sharing (CORS) headers][cors]. You could
either find a host to serve the asset with CORS headers, or place the asset on
the same domain as your scene.

[ghpages]: https://github.com/blog/2228-simpler-github-pages-publishing
[uploader]: https://cdn.aframe.io/

For some options, all resources hosted on [GitHub Pages][ghpages] are served
with CORS headers. We recommend GitHub Pages as a simple deployment platform.
Or you could also upload assets using the [A-Frame + Uploadcare
Uploader][uploader], a service that serves files with CORS headers set.

## Why is the HTML/DOM not updating in A-Frame?

[debug]: https://aframe.io/docs/0.3.0/components/debug.html

For performance reasons, A-Frame does not update the DOM with component data.
Use the [debug component][debug] to enable component-to-DOM serialization.

## Why does my video not play on mobile?

[iosvideo]: https://developer.apple.com/library/iad/documentation/UserExperience/Conceptual/iAdJSProgGuide/PlayingVideosinAds/PlayingVideosinAds.html

Mobile browsers have limitations with displaying inline video.

Because of an [iOS platform restriction][iosvideo] in order to get inline video
(with or without autoplay), we must:

- Set the `<meta name="apple-mobile-web-app-capable" content="yes">` meta tag (will be injected if missing).
- Set the `playsinline` attribute to the video element (is automatically added to all videos).
- Pin the webpage to the iOS homescreen.

Inline video support on iOS 10 may change this. On certain Android devices or
browsers, we must:

[android-touch-bug]: https://bugs.chromium.org/p/chromium/issues/detail?id=178297

- Require user interaction to trigger the video (such as a click or tap event). See [Chromium Bug 178297][android-touch-bug].

We will try to create a video boilerplate that has all the configurations to
work on mobile devices.

## How do I display `<iframe>`s or render HTML in A-Frame?

As a limitation of the browser, `<iframe>`s cannot be displayed in A-Frame,
used as a texture, or be mixed with WebGL or WebVR. While it is possible to
[overlay an iframe on top of the scene, it will not display properly in VR with
proper distortion nor can it be shaded.

Solutions involve painting to a `<canvas>` and using the canvas as source for a
texture. There are some components in the ecosystem that enable this:

- [HTML Shader][html-shader]

## Which 3D model formats work?

The ideal format is the GL Transmission Format [glTF
(`.gltf`)](https://en.wikipedia.org/wiki/GlTF) since glTF is feature-rich,
compact, and efficient. glTF focuses on providing a *transmission format*
rather than an editor format and is more interoperable with web technologies.
[Read more about glTF and A-Frame's glTF
component](../components/gltf-model.md#why-use-gltf).

[COLLADA (`.dae`)](https://en.wikipedia.org/wiki/COLLADA) is an XML-based
format with a rich feature set. COLLADA is more common in comparison to glTF
since it is older, but more suited to native applications that package all
their contents together. COLLADA is not recommended since they're like the
`.PSD` files of 3D models whereas glTF are like the `.JPG` of 3D models.
They're heavy because they contain complete subscenes.

[Wavefront (`.obj`)](https://en.wikipedia.org/wiki/Wavefront_.obj_file) is also
a well-known format but has some limitations like the lack of animation and
vertex color support.

There are also components in the ecosystem for loading:

- [`.PLY` models](https://github.com/donmccurdy/aframe-extras/blob/master/src/loaders/ply-model.js)
- [three.js `.JSON` Object](https://github.com/donmccurdy/aframe-extras/blob/master/src/loaders/json-model.js)
- [three.js `.JSON` Scene](https://github.com/donmccurdy/aframe-extras/blob/master/src/loaders/object-model.js)

Below are a couple basic example scenes for using models:

- [Model Example 1](https://aframe.io/aframe/examples/test/model/)
- [Model Example 2](https://aframe.io/aframe/examples/primitives/models/)

## Where can I find assets?

[archive3d]: http://archive3d.net
[awesomestock]: https://github.com/neutraltone/awesome-stock-resources
[clara]: http://clara.io
[sketchfab]: https://sketchfab.com
[sketchup]: https://3dwarehouse.sketchup.com
[turbosquid]: http://www.turbosquid.com/Search/3D-Models/free

In general, [awesome-stock-resources][awesomestock] is a great collection of
free assets.

[textures]: https://www.textures.com/

For images, check out [textures.com](https://www.textures.com/).

[flickr]: https://www.flickr.com/groups/equirectangular/

For 360&deg; images, search for [equirectangular images on Flickr][flickr].

For 3D models, also check out:

- [Sketchfab][sketchfab]
- [Clara.io][clara]
- [Sketchup's 3D Warehouse][sketchup]
- [Archive3D][archive3d]
- [TurboSquid][turbosquid]

## Can I render YouTube videos as a texture?

With manual effort, you could either proxy YouTube videos as a texture or
download them locally to serve, but that is against their terms of service.

For inspiration, Chris Van has [a project that proxies YouTube videos for
WebVR](https://github.com/cvan/webvr360).

## Can I add links to my scene?

We (Mozilla) are currently improving the link traversal user experience within
the browser as well as helping iterate the API. Once link traversal gets into a
good state on the platform side, A-Frame should have a link component ready.

## Can I prevent the camera from going through obstacles?

This depends on what devices you plan to support, and how you allow users to
navigate your scene. For most VR experiences, follow best practices and only
move the camera proportionately to the user's motion. If the user steps
forward in roomscale space and the camera is "blocked," this is a very bad 
experience. For most VR applications it's better to do locomotion with 
[teleportation](https://github.com/fernandojsg/aframe-teleport-controls),
design your scene to keep obstacles out of the way, or explore more creative
ways of moving users through the world.

For non-VR desktop experiences with a gamepad or WASD controls, or for VR scenes
where the camera is inside a vehicle, you can add a
[physics engine](https://github.com/donmccurdy/aframe-physics-system) to 
prevent movement through obstacles.

## What type of units does A-Frame use?

A-Frame uses life-like meters. It maintains a 1:1 ratio. 5 units in A-Frame is
equal to 5 meters in real life. Furthermore, when using programs like Blender,
configured in imperial or metric mode, measurements will also translate 1:1. 10
feet in Blender will equal 10 feet in real life.

## How is A-Frame different from VRML?

[extensible]: https://extensiblewebmanifesto.org/

A-Frame is a JavaScript framework, not a 3D or web standard. It embraces the
[Extensible Web Manifesto][extensible]. Only look at standardization as winning
ideas emerge.

More technically, A-Frame is built on top of an [entity-component-system
pattern][ecs], is fully extensible, and integrates well with all of the
existing web development frameworks and tools.

## Does A-Frame support `X` feature?

[aframe-components]: https://github.com/aframevr/aframe/tree/master/src/components
[awesome-components]: https://github.com/aframevr/awesome-aframe#components
[component]: ../core/component.md

A-Frame ships with a handful of components and primitives. However being based
on top of an [entity-component-system pattern][ecs], if a feature doesn't
exist, you can [write a component][component] to enable it. Or if one of the
standard components is too limiting, you can [fork it][aframe-components].

Check out what the features that the ecosystem has enabled at [awesome-aframe's
collection of components][awesome-components].

## Does A-Frame support `X` library or framework?

[aframe-react]: https://github.com/ngokevin/aframe-react
[d3]: https://www.youtube.com/watch?v=Tb2b5nFmmsM
[meteor]: https://github.com/vladbalan/meteor-aframe
[popmotion]: https://github.com/cvan/aframe-role
[template]: https://github.com/ngokevin/aframe-template-component

A-Frame is built on top of the DOM so most libraries and frameworks work out
of the box. We've found A-Frame works wonderfully with:

- [React][aframe-react]
- [D3.js][d3]
- [Handlebars/Mustache/Nunjucks/Jade][template]
- [Meteor][meteor]
- [Popmotion Role][popmotion]

## Does A-Frame support Leap Motion?

[cadavr]: https://github.com/drryanjames/CadaVR
[leap]: https://github.com/openleap/aframe-leap-hands

Don McCurdy has published a [Leap Hands component][leap] for Leap Motion
controls.

Dr. Ryan James has built a [medical education project][cadavr] that also
features Leap Motion controls code.

## Which devices, headsets, platforms does A-Frame support?

[deviceplatform]: ./device-and-platform-support.md

See *[Device and Platform Support][deviceplatform]*.

## How do I improve performance?

[bestpractices-perf]: ./best-practices.md#performance

See *[Best Practices][bestpractices-perf]*.

## How can I share my work?

[blog]: https://aframe.io/blog/
[reddit-webvr]: https://www.reddit.com/r/webvr
[slack-webvr]: https://webvr-slack.herokuapp.com/

If you make something with A-Frame, please share it with us! Any of the
channels below are great:

- Tweet at us [@aframevr][twitter].
- Share with the community on the community [A-Frame Slack channel][slack].
- Ask us to feature it on [A Week of A-Frame][blog].
- Add it to the collection on the [awesome-aframe repository][awesome].
- Share with the greater community on the [WebVR Slack channel][slack-webvr].
- Post it on the [WebVR subreddit][reddit-webvr].
- Write a case study and ask us to feature on the [A-Frame Blog][blog].

## How can I get in touch with the A-Frame team?

We are an extremely responsive and helpful bunch:

- Got a question? Ask us using the [A-Frame StackOverflow tag][stackoverflow].
- Want to chat? Hang out with us on the community [A-Frame Slack channel][slack].
- Want to share? Tweet at us at [@aframevr][twitter].
- Find an issue? File issues on the [A-Frame GitHub repo][github].

We love questions, feedback, bug reports, and pull requests!

## Where is the roadmap?

[roadmap]: https://github.com/aframevr/aframe/blob/master/ROADMAP.md

Yes, check out the [A-Frame Roadmap on GitHub][roadmap]

## Do I call it "A-Frame" or "aframe" or "aframevr" or "aFrame"?

A-Frame!
