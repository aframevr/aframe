import { registerPrimitive } from '../primitives.js';

registerPrimitive('a-link', {
  defaultComponents: {
    link: {
      visualAspectEnabled: true
    }
  },

  mappings: {
    href: 'link.href',
    image: 'link.image',
    title: 'link.title'
  }
});
