---
title: FAQ
type: introduction
layout: docs
parent_section: introduction
order: 5
---

[awesome]: https://github.com/aframevr/awesome-aframe
[github]: http://github.com/aframevr/aframe
[html-shader]: https://github.com/mayognaise/aframe-html-shader
[three]: http://threejs.org
[ecs]: ../docs/core
[slack]: https://aframevr-slack.herokuapp.com/
[twitter]: https://twitter.com/aframevr

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

[contact]: #how-can-i-get-in-touch-with-the-aframe-team
[homepage]: https://aframe.io
[guides]: ../guides/index.md

A-Frame is very extensive across different disciplines so it can be difficult
to know how to get started. We've tried our best to compile resources to get
your started on your journey.

The examples on the [homepage][homepage] act as a starting point for you to
read, copy, and paste code to quickly get started. Each example comes with an
accompanying guide explaining how it was built and what components were used to
built it that will help your understanding.

Below the examples are various workflow [guides][guides] featuring different
tools and libraries. Select a guide based on what you are comfortable with
(e.g., whether you know how to code, whether you know a certain framework,
whether you know how to model).

If you need additional support, [contact us][contact]! We are very interested
in understanding learning curve difficulties.

## Why does my asset (e.g., image, video, model) not load?

[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[uploader]: https://cdn.aframe.io/

If you are loading the asset from a different domain, make sure that the asset
is served with [cross-origin resource sharing (CORS) headers][cors]. You could
either find a host to serve the asset with CORS headers, or place the asset on
the same domain as your scene.

For some options, all resources hosted on [GitHub Pages][ghpages] are served
with CORS headers. We recommend GitHub Pages as a simple deployment platform.
Or you could also upload assets using the [A-Frame + Uploadcare
Uploader][uploader], a service that serves files with CORS headers set.

## Why does my video not play on mobile?

[iosvideo]: https://developer.apple.com/library/iad/documentation/UserExperience/Conceptual/iAdJSProgGuide/PlayingVideosinAds/PlayingVideosinAds.html

Mobile browsers have limitations with displaying inline video.

Because of an [iOS platform restriction][iosvideo] in order to get inline video
(with or without autoplay), we must:

- Set the `<meta name="apple-mobile-web-app-capable" content="yes">` meta tag (will be injected if missing).
- Set the `webkit-playsinline` attribute to the video element (is automatically added to all videos).
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

## How do I display text in A-Frame?

[bmfont-text-component]: https://github.com/bryik/aframe-bmfont-text-component
[text-geometry-component]: https://github.com/ngokevin/aframe-text-component
[text-wrap-component]: https://github.com/maxkrieger/aframe-textwrap-component

There are several possible solutions:

- [Bitmap Font Text Component (recommended)][bmfont-text-component]
- [Text Geometry Component][text-geometry-component]
- [HTML Shader][html-shader]
- [Text Wrap Component][text-wrap-component]
- Use images

## Where can I find assets?

[archive3d]: http://archive3d.net/
[awesomestock]: https://github.com/neutraltone/awesome-stock-resources
[clara]: http://clara.io
[sketchup]: https://3dwarehouse.sketchup.com/
[turbosquid]: http://www.turbosquid.com/Search/3D-Models/free

In general, [awesome-stock-resources][awesomestock] is a great collection of
free assets.

For 3D models, also check out:

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
[component]: ../docs/core/component.html

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
[popmotion]: https://github.com/Popmotion/aframe-role
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

[stackoverflow]: https://stackoverflow.com/questions/ask/?tags=aframe

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
