---
title: Entering VR
type: guide
layout: docs
parent_section: guide
order: 5
show_guide: true
---

A-Frame provides out-of-the-box support for desktop, mobile, and Oculus Rift.

## For iOS and Android

1. Load your site in a browser.
2. Hold up your phone and move it around to "look," or touch-and-drag to rotate.
3. Tap the "VR" icon button, and drop your phone in a Cardboard holder.

### Notes

* Requires a WebGL-compatible browser. The faster the phone the better. We recommend Google Cardboard V2-compatible headsets for best results. Tested with Mobile Safari and Firefox for iOS, and Firefox for Android, and Chrome on Android.
* Requires iOS 9.1 or greater. The faster the iPhone the better. Tested in Mobile Safari and Firefox for iOS. We recommend Google Cardboard V2-compatible headset for best results with iPhones.
* iPhone 6+ users will want to disable the Safari Tab Bar when viewing VR content.  This can be done in `Settings > Safari > Show Tab Bar`.

## For Oculus Rift

1. Install the latest [Oculus runtime](https://developer.oculus.com/downloads/).
2. Install [Firefox Nightly](https://nightly.mozilla.org/) or [experimental builds of Chromium](https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ&usp=sharing#list).
3. Install the [WebVR Enabler Add-on](https://addons.mozilla.org/en-US/firefox/addon/mozilla-webvr-enabler/) (Firefox only).
4. Open your site.
5. Make sure your headset is plugged in and working properly. Lights on the headset and camera should be blue.
6. Press the "Enter VR" button.

### Notes

Unfortunately, Macs are not recommended for consuming content with the Oculus Rift. Oculus froze Mac and Linux SDK development in the summer of 2015, and while the 0.5.0.1 SDK is still currently available from their [developer site](https://developer.oculus.com/downloads/), newer versions of OS X are beginning to break support for the Rift DK2. We still use the 0.5.0.1 with our Macs on the MozVR team, but only during development, to test basics of tracking and scene composition. For actually consuming VR experiences, we use Windows PCs or our mobile phones.

If you experience difficulties getting WebVR to work properly, try the following:

1. Confirm that your headset is working properly with the built-in native Oculus demo app. It can be accessed through the Oculus Rift Configuration utility, and "Show Demo Scene." If the demo scene loads and tracks properly, it narrows the problem down to the browser.
2. Make sure you open the browser _after_ plugging in the headset. WebVR browsers do not reliably support plug-and-play (yet), and can fail to recognise a VR headset if it is plugged in when the browser is already open.
3. Confirm that the WebVR enabler is installed and running. You can do this by checking `Tools > Add-ons > Mozilla WebVR Enabler` is present.

## For Desktop

1. Load your site into any desktop browser with WebGL support (all latest stable browsers).
2. Click-and-drag to "look." Use arrow keys to walk.
