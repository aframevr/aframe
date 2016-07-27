---
title: FAQ
type: introduction
layout: docs
parent_section: introduction
order: 5
---

<!--toc-->

## What is A-Frame?

A-Frame is an open-source WebVR framework for quickly creating 3D and VR
experiences with HTML. Under the hood, it is a [three.js][three] framework that
brings the [entity-component-system][ecs] pattern to the DOM. Read the
[introductory guide][guide] for more information.

## Why was A-Frame created?

A-Frame was created to pull the entire web community into the WebVR effort and
to more quickly prototype WebVR patterns and experiences. A-Frame reduces
boilerplate, is tailored for web developers, and brings structure to three.js.

## How is A-Frame different from VRML?

A-Frame is built on top of an [entity-component-system pattern][ecs] and is
fully extensible. Developers are able to fully tap into three.js through
A-Frame.

A-Frame is a JavaScript framework and not a web standard. It embraces the
[Extensible Web Manifesto][extensible]. Only look at standardization as winning
ideas emerge.

## How can I get started?

Check out the [guide][guide] to see several ways to quickly get started with
A-Frame.

## Does A-Frame support X feature?

A-Frame ships with a handful of components and primitives. However being based
on top of an [entity-component-system pattern][ecs], if a feature doesn't
exist, we can [write a component][writecomponent] to enable it. Or if one of
the standard components is too limiting, we can [fork it][fork].

Check out what the features that the ecosystem has enabled at [awesome-aframe's
collection of components][awesomecomponents].

## Does A-Frame support X library or framework?

A-Frame is built on top of the DOM so most libraries and frameworks work out
of the box. We've found A-Frame works wonderfully with:

- [React][aframe-react]
- [D3.js][d3]
- [Handlebars/Mustache/Nunjucks/Jade][template]
- [Meteor][meteor]
- [Popmotion Role][popmotion]

## Does A-Frame support Leap Motion?

Don McCurdy has published a [Leap Hands
component](https://github.com/donmccurdy/aframe-leap-hands) for Leap Motion
controls.

Dr. Ryan James has built a [medical education
project](https://github.com/drryanjames/CadaVR) that also features Leap Motion
controls code.

## Why does my video not play on mobile?

Mobile browsers have limitations with displaying inline video.

Because of an [iOS platform
restriction](https://developer.apple.com/library/iad/documentation/UserExperience/Conceptual/iAdJSProgGuide/PlayingVideosinAds/PlayingVideosinAds.html)
in order to get inline video (with or without autoplay), we must:

- Set the `<meta name="apple-mobile-web-app-capable" content="yes">` metatag.
- Set the `webkit-playsinline` attribute to the video element.
- Pin the webpage to the iOS homescreen.

On certain Android devices or browsers, we must:

- Require user interaction to trigger the video (such as a click or tap event).

These issues are filed on [GitHub][videoissue]. We plan on improving the user experience by providing:

- Instructions and UI to the user the necessary steps to get mobile video playing (pin-to-homescreen, tap).
- Out-of-the-box components for routing user-triggered events in order to play videos.

## Can I render YouTube videos as a texture?

With manual effort, you could either proxy YouTube videos as a texture or
download them locally to serve, but that is against their terms of service.

For inspiration, Chris Van has [a project that proxies YouTube videos for
WebVR](https://github.com/cvan/webvr360).

## How do I display `<iframe>`s or render HTML in A-Frame?

As a limitation of the browser, `<iframe>`s cannot be displayed in A-Frame, used
as a texture, or be mixed with WebGL or WebVR. While it is possible to [overlay
an iframe on top of the
scene](http://learningthreejs.com/blog/2013/04/30/closing-the-gap-between-html-and-webgl/),
it will not display properly in VR with proper distortion nor can it be shaded.

Solutions involve painting to a `<canvas>` and using the canvas as source for a
texture. There are some components in the ecosystem that enable this:

- [HTML Shader][htmlshader]
- [HTML Texture Component][htmltexturecomponent]
- [Draw Component][drawcomponent]

## How do I display text in A-Frame?

There are several possible solutions:

- [Text Geometry Component][textgeometrycomponent]
- [HTML Shader][htmlshader]
- [Text Wrap Component][textwrapcomponent]
- Use images

## Why does my asset (e.g., image, video, model) not loading?

If you are loading the asset from a different domain, you will need
[cross-origin resource sharing (CORS) headers][cors] set on the asset. Else we
have to serve the asset on the same domain as the A-Frame site. For some
options, all resources hosted on [GitHub Pages][ghpages] are served with CORS
headers. We highly recommend GitHub Pages as a simple deployment platform.
Alternatively, you could also upload assets using the [A-Frame + Uploadcare
Uploader][uploader], a service that will help serve our assets CORS'd.

Given that CORS headers are set, if fetching a texture from a different origin
or domain such as from an image hosting service or a CDN, then we should
specify the `crossorigin` attribute on the `<img>`, `<video>`, or `<canvas>`
element used to create a texture. [CORS][cors] security mechanisms in the
browser generally disallow reading raw data from media elements from other
domains if not explicitly allowed.

## Which devices and platforms does A-Frame support?

A-Frame supports the [Oculus Rift][riftspec] and modern smartphones using
[Cardboard holders][cardboard]. A-Frame also works on desktop computers as a
normal 3D experience. A-Frame's device support is built on the [WebVR
API][webvrspec] and the [WebVR Polyfill][webvrpolyfill]. As the WebVR API and
Polyfill mature and as WebVR-enabled browsers add support for additional
devices like the [HTC Vive][vive], A-Frame will keep up-to-date to support
those devices.

## Which mobile devices does A-Frame support?

On mobile, A-Frame works best on modern smartphones running iOS and Android. We
recommend higher-end smartphones within the last two generations (e.g., iPhone
6 and higher, Samsung Galaxy S6 and higher). We don't guarantee support on
tablet devices.

## How can I share my work?

There are several community channels available for sharing experiences built with A-Frame:

- Share with the community on the [A-Frame Slack channel][slack]
- Feature it on the [A-Frame Blog][blog]
- Add it to the collection on the [awesome-aframe repository][awesome]
- Share with the greater community on the [WebVR Slack channel][slackwebvr]
- Post it on the [WebVR subreddit][redditwebvr]

## How can I get in touch with the A-Frame team?

We are an extremely responsive and helpful bunch. You can reach us via:

- [A-Frame Slack channel][slack]
- Twitter [@aframevr][twitter]
- GitHub by filing issues against the [A-Frame GitHub repo][github].

We love questions, feedback, bug reports, and pull requests!

## How do I improve performance?

Virtual reality is a new and performance-intensive technology. The right
combination of hardware and software settings can make the difference between
presence and nausea:

- For the Oculus Rift, we recommend using a Windows PC that meets the
recommended specs of the [Oculus Rift CV1][riftspec] (consumer version)
including a GeForce GTX 970. Unfortunately, OS X is not recommended for
consuming content with the Oculus Rift. Oculus froze Mac and Linux SDK
development in the summer of 2015, and while the 0.5.0.1 SDK is still currently
available from their [developer site][oculusdev], newer versions of OS X are
beginning to break support for the Rift DK2. We still use the 0.5.0.1 with our
Macs on the MozVR team, but only during development, to test basics of tracking
and scene composition. For actually consuming VR experiences, we use Windows
PCs and iOS/Android mobile phones.
- On mobile, the faster the phone the better. We recommend higher-end
smartphones within the last two generations (e.g., iPhone 6 and higher,
Samsung Galaxy S6 and higher).

A-Frame is a young framework with several known opportunities for performance
improvements. Steadily improving performance and addressing bugs is an ongoing
high priority for the development team. If you find bugs or performance
improvement opportunities, please file [issues][ghissue] and [pull
requests][ghpull]!

## Where can I find assets?

In general, [awesome-stock-resources][awesomestock] is a great collection of free assets.

For 3D models, also check out:

- [Clara.io][clara]
- [Sketchup's 3D Warehouse][sketchup]
- [Archive3D][archive3d]
- [TurboSquid][turbosquid]

## Can I add links to my scene?

At time of writing, the [new WebVR API][webvrhacks] is currently rolling out.
Once that stabilizes, A-Frame will support link traversal in VR. In the
interim, developers are encouraged to design experiences as self-contained
single-page web applications.

The previous WebVR API that A-Frame was initially built on did not support
traversal of domains within virtual reality. Due to restrictions in the
underlying [`requestFullScreen` API][requestfs] that the WebVR API is built on,
the browser drops out of VR display mode when leaving one domain for another.
At the moment, Firefox Nightly is still using this WebVR API.

## Is there a feature roadmap?

We use [GitHub issues on the A-Frame repo][ghissue] to track feature requests
and bugs. Please file new requests for things you would like to see, or bugs
that you would like fixed!

For a long term roadmap, stay tuned.

## Do I call it "A-Frame" or "aframe" or "aframevr"?

Call it A-Frame.

We express it in code and domains as "aframe" as much as possible. Sometimes we
cannot get "aframe" and have to resort to "aframevr". The site is at
[aframe.io](https://aframe.io/) while the GitHub organization is
[github.com/aframevr](https://github.com/aframevr/). We're not thrilled about
this inconsistency, but it's something we accept begrudgingly. Sorry for any
confusion!

## Why aren't my transparent images rendering correctly?

Transparency is tricky in 3D graphics. If you are having issues where
transparent images in the foreground do not composite correctly over images in
the background, it is probably due to underlying design of the OpenGL
compositor (which WebGL is an API for). In an ideal scenario, transparency in
A-Frame would "just work", regardless of where the developer places an image in
3D space, or in which order they define the elements in markup. In the current
version of A-Frame, however, it is easy to create scenarios where foreground
images occlude background images. This creates confusion and unwanted visual
defects. A possible workaround is to try reordering your elements defined in
HTML and see if that produces more expected results.

Take a look at this [example](http://codepen.io/bryik/pen/pyMoGb). Here we have
two sets of identical transparent circles. One set is positioned front-to-back
while the other is back-to-front. Notice that the circles are only transparent
when positioned back-to-front (relative to the camera).

[aframe-react]: https://github.com/ngokevin/aframe-react
[archive3d]: http://archive3d.net/
[awesome]: https://github.com/aframevr/awesome-aframe
[awesomecomponents]: https://github.com/aframevr/awesome-aframe#components
[awesomestock]: https://github.com/neutraltone/awesome-stock-resources
[cardboard]: https://www.google.com/get/cardboard/
[blog]: https://aframe.io/blog/
[clara]: http://clara.io
[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[d3]: https://www.youtube.com/watch?v=Tb2b5nFmmsM
[drawcomponent]: https://github.com/maxkrieger/aframe-draw-component
[ecs]: ../docs/core
[extensible]: https://extensiblewebmanifesto.org/
[fork]: https://github.com/aframevr/aframe/tree/master/src/components
[ghissue]: https://github.com/aframevr/aframe/issues
[ghpages]: https://pages.github.com/
[ghpull]: https://github.com/aframevr/aframe/pulls
[github]: http://github.com/aframevr/aframe
[glam]: https://github.com/tparisi/glam
[guide]: /docs/
[htmlshader]: https://github.com/mayognaise/aframe-html-shader
[htmltexturecomponent]: https://github.com/scenevr/htmltexture-component
[leapmotion]: https://www.leapmotion.com/
[janus]: http://www.janusvr.com/
[mediael]: https://developer.mozilla.org/docs/Web/API/HTMLMediaElement
[meteor]: https://github.com/vladbalan/meteor-aframe
[mozvr]: http://mozvr.com
[oculus]: https://www.oculus.com/
[oculusdev]: https://developer.oculus.com/downloads/
[overlayiframe]: http://learningthreejs.com/blog/2013/04/30/closing-the-gap-between-html-and-webgl/
[popmotion]: https://github.com/Popmotion/aframe-role
[redditwebvr]: https://www.reddit.com/r/webvr
[requestfs]: https://developer.mozilla.org/docs/Web/API/Element/requestFullScreen
[riftspec]: https://www.oculus.com/en-us/blog/powering-the-rift/
[scene]: http://scenevr.com/
[sketchup]: https://3dwarehouse.sketchup.com/
[slack]: https://aframevr-slack.herokuapp.com/
[slackwebvr]: https://webvr-slack.herokuapp.com/
[template]: https://github.com/ngokevin/aframe-template-component
[textgeometrycomponent]: https://github.com/ngokevin/aframe-text-component
[textwrapcomponent]: https://github.com/maxkrieger/aframe-textwrap-component
[three]: http://threejs.org
[turbosquid]: http://www.turbosquid.com/Search/3D-Models/free
[twitter]: https://twitter.com/aframevr
[uploader]: https://aframe.io/aframe/examples/_uploader/
[videoissue]: https://github.com/aframevr/aframe/issues/316
[vive]: http://www.htcvive.com/us/
[webvrhacks]: https://hacks.mozilla.org/2016/03/introducing-the-webvr-1-0-api-proposal/
[webvrpolyfill]: https://github.com/borismus/webvr-polyfill
[webvrspec]: https://github.com/MozVR/webvr-spec
[writecomponent]: ../docs/core/component.html
