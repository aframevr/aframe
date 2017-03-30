---
title: sound
type: components
layout: docs
parent_section: components
---

[position]: ./position.md

The sound component defines the entity as a source of sound or audio. The sound
component is positional and is thus affected by the
[components-position][position].

## Example

```html
<a-entity id="river" geometry="primitive: plane" material="color: blue"
          position="-10 0 0" sound="src: url(river.mp3); autoplay: true"></a-entity>
```

## Properties

| Property | Description                                                           | Default Value |
|----------|-----------------------------------------------------------------------|---------------|
| autoplay | Whether to automatically play sound once set.                         | false         |
| on       | An event for the entity to listen to before playing sound.            | null          |
| loop     | Whether to loop the sound once the sound finishes playing.            | false         |
| src      | Selector to an asset `<audio>`or `url()`-enclosed path to sound file. | null          |
| volume   | How loud to play the sound.                                           | 1             |
| poolSize | Numbers of simultaneous instances of this sound that can be playing at the same time | 1             |

## Methods

| Event Name | Description  |
|------------|--------------|
| pauseSound | Pause sound. |
| playSound  | Play sound.  |
| stopSound  | Stop sound.  |

## Events

| Event Name   | Description                            |
|--------------|----------------------------------------|
| sound-loaded | Triggered when sound file is loaded.   |
| sound-ended  | Triggered when sound finishes playing. |

## Playing on an Event

The `sound` component can also listen to an event before playing as well. For
example, we might have a laughing sound play every time we click a monster:

```html
<a-entity cursor position="0 0 -5"></a-entity>

<a-entity id="elmo" geometry="primitive: box" material="src: elmo.png"
          sound="src: url(ticklelaugh.mp3); on: click"></a-entity>
```

## Preloading a Sound Asset

For performance, we recommend to block the scene on the sound asset to preload
and cache. We can do so through the asset management system:

```html
<a-scene>
  <a-assets>
    <audio id="river" src="river.mp3" preload="auto"></audio>
  </a-assets>

  <a-entity sound="src: #river"></a-entity>
</a-scene>
```

## Pause and Resume

To programmatically pause or resume a playing sound, we can tell the entity to
pause or resume:

```js
var entity = document.querySelector('[sound]');
entity.components.sound.stopSound();
```

Or to pause only the sound:

```js
entity.components.sound.pauseSound();
```

And to play the sound:

```js
entity.components.sound.playSound();
```
