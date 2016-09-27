---
title: hand-controls
type: components
layout: docs
parent_section: components
---

[tracked]: ./tracked-controls.md
[vive]: ./vive-controls.md

The hand-controls gives tracked hands (using a prescribed model) with animated
gestures. It wraps the [vive-controls component][vive], which wraps the
[tracked-controls component][tracked]. It adds additional events, semantically
named, and handles hand animations.

## Example

```html
<a-entity hand-controls="left"></a-entity>
<a-entity hand-controls="right"></a-entity>
```

## Values

| Value | Description                                      |
|-------|--------------------------------------------------|
| left  | The entity will track the left hand controller.  |
| right | The entity will track the right hand controller. |

## Events

| Event Name | Description                                          |
| ---------- | -----------                                          |
| gripclose  | Grip buttons pressed. Hand is closed.                |
| gripopen   | Grip buttons released. Hand is open.                 |
| pointup    | Trigger button pressed. Index finger pointing up.    |
| pointdown  | Trigger button released. Index finger pointing down. |
| thumbup    | Thumbpad pressed. Thumb is pointing up.              |
| thumbdown  | Thumbpad released. Thumb is pointing down.           |

## Assets

- [Left hand model](https://media.aframe.io/controllers/hands/leftHand.json)
- [Right hand model](https://media.aframe.io/controllers/hands/rightHand.json)
