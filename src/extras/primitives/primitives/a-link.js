var registerPrimitive = require('../primitives').registerPrimitive;

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
