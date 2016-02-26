---
title: Scene
type: core
layout: docs
parent_section: core
order: 4
---

Scenes, defined as `<a-scene>` set up what to render, where to render, and is where all of the entities live.

## Initialization

In A-Frame, the scene handles most of the initialization including:

- Creating a canvas
- Instantiating a renderer
- Attaching event and full screen listeners
- Setting up default lighting and camera
- Injecting `<meta>` tags and button to Enter VR
- Registering keyboard shortcuts

Notably, the scene waits for all declaratively defined entities to load (by waiting on their `loaded` events) before kicking off the render loop.

## Render Loop

The scene handles the render loop under a `requestAnimationFrame`. On each tick the scene will render itself and all of its entities to the canvas. At this point animations and any other registered behaviors are ticked or updated.

## Events

| Name   | Description |
| ----   | ----------- |
| loaded | Emitted when all declaratively defined elements on the scene has loaded and when the scene has started rendering. |

## Keyboard Shortcuts

The scene sets a couple of keyboard shortcuts:

- `f` enters full-screen mode (and stereo-rendering [VR] mode if available).
- `z` resets the headset sensors (if available).

## Stats

To view performance statistics, enable the `stats` component on `<a-scene>`:

```html
<a-scene stats="true"></a-scene>
```
