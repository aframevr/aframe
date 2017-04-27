---
title: "Device & Platform Support"
type: introduction
layout: docs
parent_section: introduction
order: 3
---

Devices and platform support depends on how well the browsers support certain
devices and APIs. A-Frame supports both flat (3D on a normal screen) and WebVR
experiences, though its focus is heavily VR. We will break up support into two
categories: flat and VR.

<!--toc-->

## Support for Flat Experiences

Support for flat experiences primarily depends on a browser's WebGL support.
We can see which browsers support WebGL at [Can I use WebGL?][caniusewebgl].

## Support for VR Experiences

Support for VR experiences, along with WebGL support, depends on a browser's
support for the [WebVR API][webvr-1.0]. You can see which browsers currently
support the WebVR API at [Is WebVR Ready?][iswebvrready]. A-Frame supports
version 1.0 of the WebVR API.

The exception to this is for mobile devices, which are supported through the
[WebVR Polyfill][webvr-polyfill].

### Support for Controllers

A-Frame currently supports [`6DoF`][6dof] controllers using Brandon Jones' 4/24/16
[experimental build of Chromium][chrome] with experimental controller support
(e.g., Vive controllers).

## Hardware Specifications

For the Oculus Rift and HTC Vive, we defer to the [Rift recommended
requirements](https://www.oculus.com/en-us/oculus-ready-pcs/) and the [Vive
recommended requirements](https://www.vive.com/us/ready/).

For mobile, we recommend at least an *iPhone 6 for iOS* and at least a *Galaxy
S6 for Android*.

[6dof]: https://en.wikipedia.org/wiki/Six_degrees_of_freedom
[caniusewebgl]: http://caniuse.com/#feat=webgl
[chrome]: https://webvr.info/get-chrome/
[iswebvrready]: https://iswebvrready.org
[webvr-1.0]: https://w3c.github.io/webvr/
[webvr-polyfill]: https://github.com/borismus/webvr-polyfill
