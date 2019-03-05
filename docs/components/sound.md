---
title: sound
type: components
layout: docs
parent_section: components
source_code: src/components/sound.js
examples: []
---

[position]: ./position.md

The sound component defines the entity as a source of sound or audio. The sound
component is positional and is thus affected by the
[components-position][position].

> **NOTE:** Playing sound on iOS — in any browser — requires a physical user interaction.
> This is a browser limitation, and internal A-Frame events (like fusing cursors) do
> not count as interaction. Ways to deal with this include using a *Begin Experience*
> button to start ambient music, or creating audio sprites with libraries like
> [Howler.js](https://github.com/goldfire/howler.js).

## Example

```html
<a-entity id="river" geometry="primitive: plane" material="color: blue"
          position="-10 0 0" sound="src: url(river.mp3); autoplay: true"></a-entity>
```

## Properties

| Property      | Description                                                                                                    | Default Value |
|---------------|----------------------------------------------------------------------------------------------------------------|---------------|
| autoplay      | Whether to automatically play sound once set.                                                                  | false         |
| distanceModel | `linear`, `inverse`, or `exponential`                                                                          | inverse        |
| loop          | Whether to loop the sound once the sound finishes playing.                                                     | false         |
| maxDistance   | Maximum distance between the audio source and the listener, after which the volume is not reduced any further. | 10000         |
| on            | An event for the entity to listen to before playing sound.                                                     | null          |
| poolSize      | Numbers of simultaneous instances of this sound that can be playing at the same time                           | 1             |
| positional    | Whether or not the audio is positional (movable).                                                               | true          |
| refDistance   | Reference distance for reducing volume as the audio source moves further from the listener.                    | 1             |
| rolloffFactor | Describes how quickly the volume is reduced as the source moves away from the listener.                        | 1             |
| src           | Selector to an asset `<audio>`or `url()`-enclosed path to sound file.                                          | null          |
| volume        | How loud to play the sound.                                                                                    | 1             |


## Methods

| Event Name | Description  |
|------------|--------------|
| pauseSound | Pause sound. |
| playSound  | Play sound.  |
| stopSound  | Stop sound.  |

## Events

| Event Name   | Description                                                                                             |
|--------------|---------------------------------------------------------------------------------------------------------|
| sound-loaded | Triggered when sound file is loaded. Event detail will contain the sound's `name` and `id`.             |
| sound-ended  | Triggered when sound finishes playing.  Event detail will contain the sound's `name` and `id`. |

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
