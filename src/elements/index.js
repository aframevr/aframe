var modules = {
  'a-event': require('./a-event'),
  'a-template': require('./a-template')
};

// This injects the template definitions into the page.
require('./templates/index.html');

module.exports = modules;
