---
title: hand-controls
type: components
layout: docs
parent_section: components
---

It handles events coming from the vive-controls
Translate button events to hand related actions:
gripclose, gripopen, thumbup, thumbdown, pointup, pointdown
It loads a hand model with gestures that are applied based
on the button pressed

## Example

```html
<a-entity hand-controls="left"></a-entity>
```

## Value

| Value | Description                           |
|-------|---------------------------------------|
| left  | The entity will track the left hand.  |
| right | The entity will track the right hand. |                                             |

## Events

| Event Name   | Description                                                                                 |
| ----------   | ------------------------------------------------------------------------------------------- |
| gripclose    | Hand is closed
| gripopen     | Hand is open
| pointup      | Index is up
| pointdown    | Index is down
| thumbup      | Thumb is up
| thumbdown    | Thumb is down
