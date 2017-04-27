---
title: blend-model
type: components
layout: docs
parent_section: components
---

Loads a three.js format JSON model containing skeletal animation blending using
`THREE.BlendCharacter`. This is mainly used to represent the hand and Vive
controllers.

## Example

We can load the model by pointing using the ID to an `<a-asset-item>` that
specifies the `src` to a file:

```html
<a-scene>
  <a-assets>
    <a-asset-item id="hand" src="/path/to/hand.json"></a-asset-item>
  </a-assets>

  <a-entity blend-model="#hand"></a-entity>
</a-scene>
```

## Values

| Type     | Description                             |
|----------|-----------------------------------------|
| selector | Selector to an `<a-asset-item>`         |
| string   | `url()`-enclosed path to a JSON file    |

## Events

| Event Name   | Description                                                                                 |
| ----------   | ------------------------------------------------------------------------------------------- |
| model-loaded | JSON model was loaded into the scene.                                                  |
