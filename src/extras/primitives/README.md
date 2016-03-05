### Primitives

Primitives extend entities to:

- Introduce a syntax to something more familiar for newcomers to A-Frame.
- Alias `<a-entity>` into something more specific like `<a-sphere>`.
- Define a mapping from flat HTML attributes to inner-component properties.
- Introduce magic by allowing transformation of incoming HTML values.
- Bake certain components and component properties for a specific use case.

Example:

```html
<a-box color="red" depth="5" height="2" width="3"></a-box>
<a-videosphere src="360.mp4"></a-videosphere>
```
