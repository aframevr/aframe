---
title: Templates
type: core
layout: docs
parent_section: core
order: 5
---

> Note that templates are not actually part of the core. They will soon be rearchitected and placed on a separate abstraction layer.

Whereas [primitives](../primitives/) wrap a single [entity](entity.html), templates package multiple entities or primitives into a custom element for easy reuse. Take our primitive example above for example. Let's say we want to wrap that into a single element, `<a-lot-of-cubes>`. We can wrap them in a template using the [`<template>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).

```html
<template is="a-template" element="a-lot-of-cubes">
  <a-cube color="red" depth="1" height="1" width="1" position="-1 0 0"></a-cube>
  <a-cube color="blue" depth="1" height="1" width="1" position="0 1 0"></a-cube>
  <a-cube color="green" depth="1" height="1" width="1" position="1 0 0"></a-cube>
</template>
```

Then we can reuse it multiple times:

```html
<a-lot-of-cubes></a-lot-of-cubes>
<a-lot-of-cubes position="10 0 0"></a-lot-of-cubes>
```

That doesn't offer too much practicality. We can have templates specify attributes. Let's say we want to allow the ability to scale the size of the cubes. We can have the template expose parameters and apply templating.

```html
<template is="a-template" element="a-lot-of-cubes" size="1">
  <a-cube color="red" depth="${size}" height="${size}" width="${size}" position="-${size} 0 0"></a-cube>
  <a-cube color="green" depth="${size}" height="${size}" width="${size}" position="-${size} 0 0"></a-cube>
  <a-cube color="blue" depth="${size}" height="${size}" width="${size}" position="-${size} 0 0"></a-cube>
</template>
```

Then we can pass in a `size` attribute which will be passed down to the cubes.

```html
<a-lot-of-cubes size="5"></a-lot-of-cubes>
<a-lot-of-cubes position="10 0 0"></a-lot-of-cubes>
```

## Publishing and Sharing Templates

For now, we can share our templates on the [Awesome A-Frame](https://github.com/aframevr/awesome-aframe) repository. Just add your template to the list and make a pull request!

We hope to later create a more formal system for publishing and sharing templates.
