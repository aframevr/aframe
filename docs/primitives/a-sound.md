---
title: <a-sound>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/a-sound.js
---

The sound primitive wraps the [sound component](../components/sound.md).

## Example

```html
<a-scene>
  <a-sound src="src: url(click.mp3)" autoplay="true" position="0 2 5"></a-sound>
</a-scene>
```

## Attributes

| Attribute | Component Mapping | Default Value |
|-----------|-------------------|---------------|
| autoplay  | sound.autoplay    | false         |
| loop      | sound.loop        | false         |
| on        | sound.on          | null          |
| src       | sound.src         | null          |
| volume    | sound.volume      | 1             |
