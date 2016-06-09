---
title: "Device & Platform Support"
type: guide
layout: docs
parent_section: guide
order: 5
---

Support of devices and platforms depends how well the browsers support certain
devices and APIs. A-Frame supports both flat (3D on a normal screen) and WebVR
experiences.  Though its focus is heavily VR. We will break up support into two
categories: flat and VR.

<!--toc-->

## Support for Flat Experiences

Support for flat experiences primarily depends on the browsers' WebGL support.
We can see what browsers support WebGL at [Can I use WebGL?][caniusewebgl].

## Support for VR Experiences

Support for VR experiences, along with WebGL support, depends on the browsers'
WebVR API support. The browsers that support the WebVR API *at the moment you
read this* depends on the browsers and not on A-Frame. As more and more
browsers adopt the WebVR APIs, they will inherit support from A-Frame.

You can see what browsers *currently* support the WebVR API at [Is WebVR
Ready?][iswebvrready].

This version of A-Frame supports these forms of the WebVR API:

| WebVR API                     | Details                                                                             |
|-------------------------------|-------------------------------------------------------------------------------------|
| [WebVR 1.0][webvr-1.0]        | Primary support.                                                                    |
| Deprecated `getVRDevices` API | Supported through the [WebVR Polyfill][webvr-polyfill].                             |
| WebVR Polyfill                | Supports mobile devices using device motion and orientation APIs (Cardboard-style). |

### Support for Controllers

*Out-of-the-box*, A-Frame supports `6DoF` controllers using Brandon Jones'
4/24/16 experimental build of Chromium with experimental controller support.

*However*, A-Frame is equipped to support any future changes to the controller
APIs through the component system. [Components][components] can be developed
and published parallel to the core A-Frame library.

## Hardware Specifications

For the Oculus Rift and HTC Vive, we defer to the [Rift recommended
requirements](https://www.oculus.com/en-us/oculus-ready-pcs/) and the [Vive
recommended requirements](https://www.htcvive.com/us/product-optimized/).

For mobile, we recommend at least an *iPhone 6 for iOS* and at least a *Galaxy
S6 for Android*.

[caniusewebgl]: http://caniuse.com/#feat=webgl
[chromium]: https://chromium.googlesource.com/experimental/chromium/src/+/refs/wip/bajones/webvr_1
[components]: ./components.md
[iswebvrready]: https://iswebvrready.org
[nightly]: https://nightly.mozilla.org/
[mozvr]: https://mozvr.com
[spec]: https://mozvr.com/webvr-spec/
[webvr-polyfill]: https://github.com/borismus/webvr-polyfill
[webvr-1.0]: https://hacks.mozilla.org/2016/03/introducing-the-webvr-1-0-api-proposal/
