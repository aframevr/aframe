---
title: "VR Headsets & WebVR Browsers"
type: introduction
layout: docs
parent_section: introduction
order: 3
---

[w3c]: https://w3c.github.io/webvr/

<!--toc-->

## What is Virtual Reality?

Virtual reality (VR) is a technology that uses head-mounted headsets with
displays to generate the realistic images, sounds, and other sensations to put
users into an immersive virtual environment. VR allows us to create unbounded
worlds that people can walk around and interact with using their hands, to feel
as if they were transported to another place.

### What Are the Differences Between Headsets?

There are several consumer VR headsets with different features on the market.
Important distinguishing features include whether they:

- Have positional tracking (six degrees of freedom (6DoF)) or
  Only have rotational tracking (three degrees of freedom (3DoF)).
- Have controllers or not, and whether those controllers have 6DoF
  or 3DoF. Generally, the number of degrees of freedom of the controllers
  matches that of the headset.
- Are powered by a PC or by a mobile device or smartphone.

Rotational tracking allows people to look around or rotate objects. All
headsets provide rotational tracking.

Positional tracking allows people to move around, get closer to objects, reach
forward. As the VR industry evolves, the minimum viable experience will trend
towards having positionally-tracked headsets with positionally-tracked
controllers. Positional tracking is important to give people presence, to make
them feel they are in a real environment. With rotational-only tracking, people
are constrained to looking around and wiggling the controller.

### What Are the Current Headsets on the Market?

[HTC Vive]: https://www.vive.com/
[Oculus Rift]: https://www.oculus.com/rift/
[Google Daydream]: https://vr.google.com/daydream/
[Samsung GearVR]: http://www.samsung.com/global/galaxy/gear-vr/

| Headset           | Platform | Positional Tracking | Controllers        | Controller Positional Tracking |
|-------------------|----------|---------------------|--------------------|---------------------------------|
| [HTC Vive]        | PC       | :white_check_mark:  | :white_check_mark: | :white_check_mark:              |
| [Oculus Rift]     | PC       | :white_check_mark:  | :white_check_mark: | :white_check_mark:              |
| [Google Daydream] | Android  | :x:                 | :white_check_mark: | :x:                             |
| [Samsung GearVR]  | Android  | :x:                 | :white_check_mark: | :x:                             |

Future headsets to look forward to are Mixed Reality and Augmented Reality
headsets from Windows, which work with A-Frame on some level.

## What is WebVR?

[vlad]: https://en.wikipedia.org/wiki/Vladimir_Vuki%C4%87evi%C4%87

WebVR is a JavaScript API for creating immersive 3D, virtual reality
experiences in your browser. WebVR was originally conceived at Mozilla by
[Vladimir Vukicvic]. See the [WebVR API specification on
W3C][w3c].

A-Frame uses the WebVR API to gain access to VR headset sensor data (position,
orientation) to transform the camera and to render content directly to VR
headsets. Note that WebVR, which provides data, should not be confused nor
conflated with WebGL, which provides graphics and rendering.

For up-to-date and detailed information about WebVR, [visit
`https://webvr.rocks`](https://webvr.rocks):

<iframe src="https://webvr.rocks" height="400px" width="100%"></iframe>

## Where Does A-Frame Want to Take WebVR?

A-Frame aims for highly immersive and interactive VR content with native-like
performance. For this, A-Frame believes the minimum viable bar will trend
towards positionally-tracking headsets with positionally-tracked controllers.
This is the paradigm in which A-Frame wants to innovate as well as discover new
grounds that are specific to the VR Web (e.g., link traversal,
decentralization, identity). Contrast this type of content against flat and
static 360&deg; content and menus.

At the same time, A-Frame wants everyone to be able to get involved with VR
content creation. A-Frame supports all major headsets with their controllers.
Fortunately with the large community and contributors, A-Frame is able to both
look far towards the future as well as satisfy the needs of today's VR
landscape.

## Which Platforms Does A-Frame Support?

General platforms that A-Frame supports include:

- VR on desktop with a headset
- VR on mobile with a headset
- Flat on desktop (i.e., mouse and keyboard)
- Flat mobile (i.e., magic window)

[alt]: https://altvr.com/

Some other platforms that have been shown to work with A-Frame include:

- Augmented reality (AR) on AR headsets (e.g., HoloLens, Windows Mixed Reality)
- Augmented reality (AR) on mobile (i.e., magic window)
- [AltSpaceVR][alt] through native SDK

## Which VR Headsets Does A-Frame Support?

VR headsets that A-Frame supports include:

- HTC Vive with controllers and trackers
- Oculus Rift with Touch controllers
- Google Daydream with controller
- Samsung GearVR with controller
- Google Cardboard

For general hardware recommendations (not requirements):

- [Oculus Rift Hardware Recommendations](https://www.oculus.com/en-us/oculus-ready-pcs/)
- [HTC Vive Hardware Recommendedations](https://www.vive.com/us/ready/)
- For smartphones, an iPhone 6 for iOS and at least a Galaxy S6 for Android

## Which Browsers Does A-Frame Support?

Again [see `https://webvr.rocks`](https://webvr.rocks) for information on which
browsers support WebVR. Chances are, this list will quickly become outdated.
A-Frame supports VR for any browser that implements the [WebVR
specification][w3c]:

- [Firefox Nightly](https://www.mozilla.org/en-US/firefox/channel/desktop/) (soon to be on Firefox 55)
- [Experimental builds of Chromium](https://webvr.info/get-chrome/)
- Chrome for Android (Daydream)
- Oculus Carmel (GearVR)
- Samsung Internet (GearVR)
- Microsoft Edge

[webvrpolyfill]: https://github.com/googlevr/webvr-polyfill

A-Frame supports most modern mobile browsers that don't have WebVR support
through the [WebVR polyfill][webvrpolyfill]. Note that these browsers do not
have official WebVR support, and we are using a polyfill; it is important to
lower the expectations that these browsers will provide a quality experience
and not have quirks:

- Safari for iOS
- Chrome for Android
- Firefox for iOS
- Samsung Internet
- UC Browser

For flat or plain 3D support, A-Frame supports all modern browsers,
specifically those that support WebGL including:

- Firefox
- Chrome
- Safari
