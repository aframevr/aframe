### Declarative Events

Registers `<a-event>`, a declarative event handler to trigger `setAttribute`s.

```html
<a-entity id="cube" mixin="cube"></a-entity>
<a-entity>
  <a-event name="click" property="material.color" target="#cube" value="red"></a-event>
</a-entity>
```
