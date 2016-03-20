---
title: sound
type: components
layout: docs
parent_section: components
order: 17
---

The sound component defines the entity as a source of sound or audio. The sound component is positional and is therefore affected by the [components-position](position.md).

## Example

```html
<a-entity id="river" geometry="primitive: plane" material="color: blue"
          position="-10 0 0" sound="src: river.mp3; autoplay: true"></a-entity>
```

## Properties

| Property | Description                                                | Default Value |
|----------|------------------------------------------------------------|---------------|
| autoplay | Whether to automatically play sound once set.              | false         |
| on       | An event for the entity to listen to before playing sound. | click         |
| loop     | Whether to loop the sound once the sound finishes playing. | false         |
| src      | Path to sound file.                                        | null          |
| volume   | How loud to play the sound.                                | 1             |

## Events

| Event Name  | Description                           |
|-------------+---------------------------------------|
| sound-ended | triggered when sound finishes playing |

## Playing on an Event

The `sound` component can also listen to an event before playing as well. For example, we might have a laughing sound play every time a monster is clicked:

```html
<a-entity cursor position="0 0 -5"></a-entity>

<a-entity id="elmo" geometry="primitive: box" material="src: elmo.png"
          sound="src: ticklelaugh.mp3; on: click"></a-entity>
```

## Preloading a Sound Asset

For performance, it is recommended to block the scene on the sound asset to preload and cache. We can do so through the asset management system:

```html
<a-scene>
  <a-assets>
    <audio id="river" src="river.mp3">
  </a-assets>

  <a-entity sound="src: river.mp3"></a-entity>
</a-scene>
```

## Pause and Resume

To programmatically pause or resume a playing sound, we can tell the entity to pause or resume:

```js
var entity = document.querySelector('[sound]');
entity.pause();
```

Or to pause only the sound:

```
entity.components.sound.pause();
```

Then call `.play()` on either the entity or the sound component to resume.

[components-position]: ./position.md
