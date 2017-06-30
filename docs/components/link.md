---
title: link
type: components
layout: docs
parent_section: components
---

The link component allows for connecting experiences and traversing between VR web pages. Upon activation, the link component sends the user to a different page. If the web page is WebVR-enabled, the page correctly listens to the `vrdisplayactivate` event, and the browser is up-to-date with the WebVR specification, then the user will stay in VR.

## Example

```html
<a-entity link="href: index.htm; title: My Homepage; src: #homeThumbnail"></a-entity>
```

We also provide a primitive with a slightly more compact syntax.

```html
<a-link href="index.html" title="My Homepage" src="#homeThumbnail"></a-link>
```
## Properties

| Property | Description                                                                           | Default Value |
|----------|---------------------------------------------------------------------------------------|---------------|
| href  | URL where the link points to | ''         |
| title    | Text displayed on the link. href is used if not defined                                | ''            |
| on     | event that triggers link traversal                                          | ''             |
| src     | 360 panorama used as scene preview in the portal                                        | ''             |
| color     | Background color of the portal                                       | white             |
| highlighted     | true if the link is highlighted                                       | false             |
| highlightedColor     | border color when highlighted                                      | '#24CAFF'             |
| visualAspectEnabled     | enable/disable the visual aspect if you want to implement your own                                      | 'true            |


## Methods

Sends the user to the page specified by the href property

### .navigate ()