title: "Sound"
category: component
---

The sound component defines the entity as a source of sound or audio. The sound
component is positional and is therefore affected by the position component.

```html
<a-entity id="river" geometry="primitive: plane" material="color: blue"
          position="-10 0 0" sound="src: river.mp3; autoplay: true"></a-entity>
```

The sound component can also listen to an event before playing as well. For
example, we might have a damage sound play every time a monster is clicked:

```html
<a-entity id="elmo" geometry="primitive: box" material="src: elmo.png"
          sound="src: ticklelaugh.mp3; on: click"></a-entity>

<a-entity cursor position="0 0 -5"></a-entity>
```

| Attribute | Description                                                     | Default Value |
|-----------|-----------------------------------------------------------------|---------------|
| autoplay  | Whether to automatically play sound once set.                   | false         |
| on        | An event for the entity to listen to before playing sound.      | click         |
| loop      | Whether to loop the sound once the sound finishes playing.      | false         |
| volume    | How loud to play the sound.                                     | 1             |
