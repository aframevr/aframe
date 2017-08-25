---
title: link
type: components
layout: docs
parent_section: components
image:
  src: https://user-images.githubusercontent.com/674727/27721720-19388346-5d17-11e7-912b-499886be0a8d.gif
source_code: src/components/link.js
examples: []
---

The link component connects between experiences and allows for traversing
between VR web pages. When activated via an event, the link component sends the
user to a different page, just like a normal web page redirect. To maintain VR
across pages, the following conditions must apply:

[vrdisplayactivate]: https://w3c.github.io/webvr/spec/1.1/#interface-window

- The browser is up-to-date with the WebVR specification and implements the `vrdisplayactivate` event.
- The destination web page listens to the window [`vrdisplayactivate`] event and enters VR.

## Link UX

A link in VR can be anything such as grabbing onto an object, placing something
on our head, clicking something, even eating something! We provide a default
implementation of links as a portal or window, using a 360&deg; image thumbnail
to preview the destination.

The UX of link traversal will continue to refine as we iterate and experiment,
both in content and from the browser.

### Controls

[link-controls]: https://github.com/aframevr/aframe/blob/master/examples/showcase/link-traversal/js/components/link-controls.js

The default UX of the link component as a portal can be interacted with using a
cursor or controllers. This is not provided directly in the A-Frame core, but
there is a [link-controls component in the A-Frame examples][link-controls]. This component
shows tooltips and provides button mappings for peeking and entering portals.

## Example

```html
<a-scene>
  <a-assets>
    <img id="homeThumbnail" src="home.jpg">
  </a-assets>

  <a-entity link="href: index.html; title: My Homepage; image: #homeThumbnail"></a-entity>
</a-scene>
```

We also provide a link primitive with a different syntax:

```html
<a-link href="index.html" title="My Homepage" image="#homeThumbnail"></a-link>
```

## Properties

| Property            | Description                                                                                                                                  | Default Value |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| color               | Background color of the portal.                                                                                                              | white         |
| highlighted         | Boolean to toggle link highlight color.                                                                                                      | false         |
| highlightedColor    | Border color when highlighted.                                                                                                               | '#24CAFF'     |
| href                | Destiantion URL where the link points to.                                                                                                    | ''            |
| on                  | Event to listen to that triggers link traversal.                                                                                             | ''            |
| image               | 360&deg; image used as scene preview in the portal. Can be a selector to an `<img>` element or a URL.                                        | ''            |
| peekMode            | Whether the 360&deg; image is fully expanded for preview.                                                                                    | false         |
| title               | Text displayed on the link. The `href` or page URL is used if not defined.                                                                   | ''            |
| visualAspectEnabled | Whether to enable the default visual appearance of a portal. Set to false if we want to implement our own pattern or form of link traversal. | true          |


## Methods

### .navigate (url)

Sends the user to the page specified by the `href` property:

```js
document.querySelector('a-link').navigate('destination.html');
```
