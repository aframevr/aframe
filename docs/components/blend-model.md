---
title: blend-model
type: components
layout: docs
parent_section: components
---

Loads a model with skeletal Animation Blending


## Example

We can load a model by pointing to an asset that specifies the `src` to a  file.

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
| model-loaded | JSON model has been loaded into the scene.                                               |

## Loading Inline

We can also load a model by specifying the path directly within `url()`. Note this is less performant than going through the asset management system.

```html
<a-entity collada-model="url(/path/to/model.json)"></a-entity>
```
