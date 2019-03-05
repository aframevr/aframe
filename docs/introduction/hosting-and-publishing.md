---
title: "Hosting & Publishing"
type: introduction
layout: docs
parent_section: introduction
order: 12
---

This section will show several ways to deploy, host, and publish an A-Frame
site and its assets onto the Web for the world to see.

<!--toc-->

## Publishing a Site

There are many free services to deploy and host a site. We'll go over some of
the more easy or popular options, but there are certainly other options such
as AWS, Heroku, or self-hosting. An important note is that these sites should
be served with SSL/HTTPS due to a common security restriction of the browser's
WebVR API. All the options below serve with SSL/HTTPS.

### Glitch

![Glitch](https://cloud.githubusercontent.com/assets/674727/25643449/b5ee2542-2f54-11e7-9d45-22f3aa0b208f.jpg)

*"Glitch is the friendly community where you'll build the app of your dreams
With working example apps to remix, a code editor to modify them, instant
hosting and deployment - anybody can build a web app on Glitch, for free."*

[Glitch](https://glitch.com) is the easiest and fastest way to create and
publish a site from within the browser. Glitch lets us add code and files,
upload assets, edit with other people, define our own URL name, and instantly
deploy changes on every change. We don't even need to make an account nor
login:

1. Try going to the [A-Frame Starter Glitch](https://glitch.com/~aframe/).
2. Hit **Remix your own** to copy the project.
3. Click the *Project info and options* icon on the top-left to rename our
application (e.g., `https://yoursitename.glitch.me`).
4. Edit the HTML, add files, modify the project.
5. Click **Show** to view the application (e.g., the starter glitch is hosted at `https://aframe.glitch.me`).
6. Every change to the project will update the application instantly. This can
be toggled off by signing in, clicking your user avatar, and toggling **Refresh
App on Changes**.

### Neocities

![Neocities](https://cloud.githubusercontent.com/assets/674727/25643397/6db47790-2f54-11e7-9eb3-ac18a1513e9f.jpg)

*"Create your own free website.  Unlimited creativity, zero ads.  Neocities is
a social network of 129,100 web sites that are bringing back the lost
individual creativity of the web. We offer free web hosting and tools that
allow you to create your own web site. Join us!"*

[Neocities](https://neocities.org) is also another free and easy way to create
and publish a site from within the browser. While it doesn't have some of the
features of Glitch, Neocities is friendly and lets us upload assets into the
project directory versus a CDN.  This makes Neocities at least better at
hosting models. With Neocities, we can create and edit files. They'll then be
hosted and published for us (e.g., `ngokevin.neocities.org`):

![Neocities Editor](https://cloud.githubusercontent.com/assets/674727/25643399/704cffe0-2f54-11e7-8d32-868b51407f81.jpg)

### Surge

*"Static web publishing for Front-End Developers Simple, single-command web
publishing. Publish HTML, CSS, and JS for free, without leaving the command
line."*

![Surge](https://cloud.githubusercontent.com/assets/674727/25644655/a0172784-2f5c-11e7-9e44-002d61d4d076.jpg)

[Surge](https://surge.sh) is a tool to publish web sites with a single command
from the command line. This is a great tool if you're comfortable with the
command line.

![Surge Usage](https://cloud.githubusercontent.com/assets/674727/25644695/e80f6ccc-2f5c-11e7-8442-7a963b9786ef.jpg)

### GitHub Pages

*"Websites for you and your projects.  Hosted directly from your GitHub
repository. Just edit, push, and your changes are live."*

[GitHub Pages](https://pages.github.com/) is a preferred way of publishing our
project if our project is on GitHub. The easiest way is to go our project's
GitHub **Settings**, scroll down to the **GitHub Pages** section, and set to
publish **master branch**. This will publish the project at
`https://<username>.github.io/<repositoryname>`.

![GitHub](https://cloud.githubusercontent.com/assets/674727/25644905/5694c7c2-2f5e-11e7-8cde-9d4be7498850.jpg)

Alternatively, we can set to publish the `gh-pages` branch if we don't want
`master` changes to be published. Command line tools such as
[`ghpages`](https://github.com/cvan/ghpages) can make that a one-command
publish process.

## Hosting Assets

We'll also go over hosting assets such as audio, textures, models, and video.

If the A-Frame site is being published alongside its assets in the same
directory (i.e., the same domain), then we don't need to worry much about
hosting assets. The A-Frame site can use relative URLs to reference the asset,
and since they're on the same domain, there is no issue with fetching that
asset. For example, if we have all your resources in the same root directory
and we publish everything via Neocities, GitHub Pages, or Surge, there will be
no issues.

## Content Delivery Network (CDN)

If we're hosting assets externally, like on a CDN, then we need to take in
considerations .The primary requirement for assets is that they be served with
[cross-origin resource sharing
(CORS)](https://developer.mozilla.org/docs/Web/HTTP/Access_control_CORS)
enabled. This allows the A-Frame site to fetch the asset to display in the
scene. Plus, if we're using `<a-assets>`, we should usually set
`crossorigin="anonymous"` on assets such as `<img>`, `<audio>`, and `<video>`.

There are several simple options to host assets via a CDN:

- [Glitch Asset Uploader](https://glitch.com/) - The Glitch code editor has a
  panel to upload assets and get CDN URLs in return.
- [imgur](https://imgur.com/) - For images, we could use imgur, a popular image
  hosting service.

### Hosting Models

Hosting models is not as simple. Models usually come as groups of files in a
folder, where the model file relatively references other files such as images.
Thus, models have to be uploaded as a single folder in the same directory. Many
of the free asset hosting services support only uploading one file a time. One
solution would be to rename all of the image paths to the CDN paths after the
images are individually uploaded, but that is tedious. There are a couple known
solutions for easily hosting models via CDN:

If publishing a site via Neocities, we can upload any number of files and
directories into the site directory:

![Neocities](https://cloud.githubusercontent.com/assets/674727/25639880/713c8266-2f42-11e7-9f2a-8e552bda80fa.jpg)

*Neocities Asset Uploader*

[jsdelivr]: https://www.jsdelivr.com/?docs=gh

Or we can upload assets to a GitHub repository, and use GitHub to serve the
model files.

1. Go to one of our GitHub repositories.
2. Click **Upload files**.
3. Upload our assets and wait for the upload to finish.
4. Type a quick message at the bottom and hit **Commit changes**.
5. Wait for processing.
6. Once finished, click on the primary asset file.
7. Click on **Raw**.
8. Then we have our asset URL hosted on GitHub. Then the asset can be
hosted and referenced via [JSDelivr CDN][jsdelivr].

Below is a video of the workflow:

<div style="position:relative;height:0;padding-bottom:56.25%"><iframe src="https://www.youtube.com/embed/_D_C_oSKp9Y?ecver=2" width="640" height="360" frameborder="0" style="position:absolute;width:100%;height:100%;left:0" allowfullscreen></iframe></div>

## Sharing Our Project

Once we've published our awesome project, we'll want to share it so other
people dive inside!

### Creating Media

[gifpardy]: https://github.com/ngokevin/gifpardy
[obs]: https://obsproject.com/

A-Frame and VR are very visual; we'll want to create videos and GIFs of our
project.

First, we want to record the screen. On OS X, record the screen using built-in
QuickTime Player's Screen Recording or [OBS Studio][obs]. On Windows, we can
use [OBS Studio][obs]. OBS Studio also supports streaming and compositing a
webcam image on top of the screen, which is useful to show the person using the
headset in reality (even with mixed reality).

Then, we can possibly want to trim the video. On OS X, we can use QuickTime
Player's trim tool (`<cmd> + t`).

To convert to a GIF with one command, use [gifpardy][gifpardy]. `gifpardy` uses ffmpeg
and gifsicle under the hood:

```
gifpardy in.mp4
gifpardy in.mp4 out.gif
gifpardy -r 320x240 --delay 8 in.mp4
```

[brewery]: https://itunes.apple.com/us/app/gif-brewery-by-gfycat-capture-make-video-gifs/id1081413713?mt=12

Alternatively, we can use [GIF Brewery][brewery] which has UI to trim, resize,
crop, and preview a GIF before exporting. Or capture straight to GIF using
[LICECap](https://licecap.en.softonic.com/).

### Sharing Media

[blog]: https://aframe.io/blog/
[reddit-webvr]: https://www.reddit.com/r/webvr
[slack-webvr]: https://webvr-slack.herokuapp.com/

If you create something with A-Frame, please share it with us! If you share
your project, we'll feature it on [*A Week of
A-Frame*](https://aframe.io/blog/) for the community to see. Great channels
include:

- [Twitter](https://twitter.com) - Mention `@aframevr` or include the `#webvr`
  hashtag.
- [`#projects` channel on Slack](http://aframevr.slackarchive.io/projects/)
- [WebVR Slack channel][slack-webvr].
- [/r/WebVR subreddit][reddit-webvr].
- Write a case study and tell us to feature on the [A-Frame Blog][blog].
- [Featuring on Supermedium](https://www.supermedium.com/blog/webvr-guidelines)

## Embedding

If we want to embed an A-Frame scene into the layout of 2D web page, we can use
the [embedded component](../components/embedded.md) to remove fullscreen styles
and allow us to style the canvas with CSS.

Note we can only embed one scene at a time into a page. If we need multiple
scenes, we can use
[`<iframe>`s](https://developer.mozilla.org/docs/Web/HTML/Element/iframe).
