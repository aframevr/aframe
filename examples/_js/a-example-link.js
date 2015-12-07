/**
 * Helper component to render example links.
 *
 * @namespace <a-example-link>
 */
document.registerElement('a-example-link', {
  prototype: Object.create(HTMLLIElement.prototype, {
    attachedCallback: {
      value: function () {
        var exampleLink;
        var href = this.getAttribute('href');
        var title = this.innerHTML;
        var viewSourceLink;
        this.innerHTML = '';

        // Link to example.
        exampleLink = document.createElement('a');
        exampleLink.setAttribute('href', href);
        exampleLink.innerHTML = title;
        this.appendChild(exampleLink);

        // Link to source code.
        var githubLink =
          'https://github.com/aframevr/aframe-core/blob/master/examples/';
        if (!navigator.onLine && navigator.appName === 'Netscape') {
          // Chrome doesn't allow `view-source:` links.
          githubLink = 'view-source:';
        }
        viewSourceLink = document.createElement('a');
        viewSourceLink.setAttribute('href',
          githubLink + href + 'index.html');
        viewSourceLink.innerHTML = 'view source';
        viewSourceLink.classList.add('note');
        viewSourceLink.classList.add('view-source');
        this.appendChild(viewSourceLink);
      }
    }
  })
});
