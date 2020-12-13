/* global assert, setup, suite, teardown, test */
let PropertyTypes = require('core/propertyTypes');

let isValidDefaultCoordinate = PropertyTypes.isValidDefaultCoordinate;
let isValidDefaultValue = PropertyTypes.isValidDefaultValue;
let propertyTypes = PropertyTypes.propertyTypes;
let register = PropertyTypes.registerPropertyType;

suite('propertyTypes', function () {
  suite('asset', function () {
    let parse = propertyTypes.asset.parse;

    setup(function () {
      let el = this.el = document.createElement('div');
      document.body.appendChild(el);
    });

    teardown(function () {
      this.el.parentNode.removeChild(this.el);
    });

    test('parses asset as string', function () {
      assert.equal(parse('url(file.jpg)'), 'file.jpg');
      assert.equal(parse('file.jpg'), 'file.jpg');
    });

    test('parses <a-asset-item> asset', function () {
      let asset = document.createElement('a-asset-item');
      asset.setAttribute('id', 'foo');
      asset.setAttribute('src', 'bar.gltf');
      this.el.appendChild(asset);
      assert.equal(parse('#foo'), 'bar.gltf');
    });

    test('parses <img> asset', function () {
      let img = document.createElement('img');
      img.setAttribute('id', 'foo');
      this.el.appendChild(img);
      assert.equal(parse('#foo'), img);
    });

    test('parses <canvas> asset', function () {
      let canvas = document.createElement('canvas');
      canvas.setAttribute('id', 'foo');
      this.el.appendChild(canvas);
      assert.equal(parse('#foo'), canvas);
    });

    test('parses <video> asset', function () {
      let video = document.createElement('video');
      video.setAttribute('id', 'foo');
      this.el.appendChild(video);
      assert.equal(parse('#foo'), video);
    });
  });

  suite('boolean', function () {
    let parse = propertyTypes.boolean.parse;
    let stringify = propertyTypes.boolean.stringify;

    test('parses false', function () {
      assert.equal(parse('false'), false);
      assert.equal(parse(false), false);
    });

    test('parses true', function () {
      assert.equal(parse('true'), true);
      assert.equal(parse(''), true);
    });

    test('stringifies false', function () {
      assert.equal(stringify(false), 'false');
      assert.equal(stringify(true), 'true');
    });
  });

  suite('registerPropertyType', function () {
    test('registers type', function () {
      assert.notOk('mytype' in propertyTypes);
      register('mytype', 5);
      assert.ok('mytype' in propertyTypes);
      assert.equal(propertyTypes.mytype.default, 5);
    });
  });

  suite('int', function () {
    let parse = propertyTypes.int.parse;

    test('parses int', function () {
      assert.equal(parse('5'), 5);
      assert.equal(parse(5), 5);
      assert.equal(parse('4.5'), 4);
      assert.equal(parse(4.5), 4);
    });
  });

  suite('selector', function () {
    let parse = propertyTypes.selector.parse;
    let stringify = propertyTypes.selector.stringify;

    setup(function () {
      let el = this.el = document.createElement('div');
      el.setAttribute('id', 'hello');
      el.setAttribute('class', 'itsme');
      document.body.appendChild(el);
    });

    teardown(function () {
      this.el.parentNode.removeChild(this.el);
    });

    test('parses ID only', function () {
      assert.equal(parse('#hello'), this.el);
    });

    test('parses id with hyphen', function () {
      this.el.setAttribute('id', 'hello-world');
      assert.equal(parse('#hello-world'), this.el);
    });

    test('parses valid selector', function () {
      assert.equal(parse('#hello.itsme'), this.el);
    });

    test('parses valid selector with child', function () {
      document.body.setAttribute('id', 'body');
      assert.equal(parse('#body #hello'), this.el);
      document.body.setAttribute('id', '');
    });

    test('parses valid selector with attribute selector', function () {
      assert.equal(parse('#hello[id]'), this.el);
    });

    test('parses valid selector with last-child', function () {
      assert.equal(parse('#hello:last-child'), this.el);
    });

    test('parses null selector', function () {
      assert.equal(parse('#goodbye'), null);
    });

    test('stringifies valid selector', function () {
      assert.equal(stringify(this.el), '#hello');
    });
  });

  suite('selectorAll', function () {
    let parse = propertyTypes.selectorAll.parse;
    let stringify = propertyTypes.selectorAll.stringify;
    let slice = function (nodes) {
      return Array.prototype.slice.call(nodes, 0);
    };

    setup(function () {
      let el = this.el = document.createElement('div');

      let el1 = this.el1 = document.createElement('div');
      el1.setAttribute('id', 'hello');
      el1.setAttribute('class', 'itsme');

      let el2 = this.el2 = document.createElement('div');
      el2.setAttribute('id', 'cool');
      el2.setAttribute('class', 'itworks');

      el.appendChild(el1);
      el.appendChild(el2);

      document.body.appendChild(el);
    });

    teardown(function () {
      this.el1.parentNode.removeChild(this.el1);
      this.el2.parentNode.removeChild(this.el2);
      this.el.parentNode.removeChild(this.el);
    });

    test('parses a set of valid selectors', function () {
      assert.deepEqual(parse('#hello.itsme, #cool.itworks'), slice(this.el.childNodes));
    });

    test('parses null selector', function () {
      assert.deepEqual(parse('#goodbye'), slice(this.el1.childNodes));
    });

    test('stringifies valid selector', function () {
      assert.equal(stringify(slice(this.el.childNodes)), '#hello, #cool');
    });
  });

  suite('array', function () {
    let parse = propertyTypes.array.parse;
    let stringify = propertyTypes.array.stringify;

    test('parses array', function () {
      assert.deepEqual(parse(''), []);
      assert.deepEqual(parse('5,test, 5 0 5           '), ['5', 'test', '5 0 5']);
      assert.deepEqual(parse([]), []);
      assert.deepEqual(parse([1, 'five', null]), [1, 'five', null]);
    });

    test('stringifies array', function () {
      assert.equal(stringify([]), '');
      assert.equal(stringify([5, 10]), '5, 10');
      assert.equal(stringify([1, 'five', true, '5 0 5']), '1, five, true, 5 0 5');
    });
  });

  suite('src', function () {
    let parse = propertyTypes.src.parse;

    setup(function () {
      let el = this.el = document.createElement('div');
      el.setAttribute('id', 'hello');
      el.setAttribute('src', 'file2.jpg');
      document.body.appendChild(el);
    });

    teardown(function () {
      this.el.parentNode.removeChild(this.el);
    });

    test('parses src', function () {
      assert.equal(parse('url(file.jpg)'), 'file.jpg');
      assert.equal(parse('file.jpg'), 'file.jpg');
      assert.equal(parse('#hello'), 'file2.jpg');
    });
  });

  suite('isValidDefaultCoordinate', function () {
    test('is true for null', function () {
      assert.equal(isValidDefaultCoordinate(null, 2), true);
    });
    test('is true for vec2 if {x: num, y:num}', function () {
      let validCoordinates = {x: 1, y: 2};
      assert.equal(isValidDefaultCoordinate(validCoordinates, 2), true);
    });

    test('is true for vec3 if {x: num, y:num z: num}', function () {
      let validCoordinates = {x: 1, y: 2, z: 3};
      assert.equal(isValidDefaultCoordinate(validCoordinates, 3), true);
    });

    test('is true for vec4 if {x: num, y:num z: num w: num}', function () {
      let validCoordinates = {x: 1, y: 2, z: 3, w: 4};
      assert.equal(isValidDefaultCoordinate(validCoordinates, 4), true);
    });

    test('is false for everything else', function () {
      let invalidCoordinates1 = {notX: 1};
      let invalidCoordinates2 = {x: ''};
      let invalidCoordinates3 = {x: 0, z: 5};
      let invalidCoordinates4 = {x: 5, y: {}};
      let invalidCoordinates5 = {x: 1, y: []};
      let invalidCoordinates6 = {notX: 'not coordinates at all'};
      let invalidCoordinates7 = {x: 5, y: 1, z: 2};  // Invalid for vec4.
      assert.equal(isValidDefaultCoordinate(invalidCoordinates1, 2), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates2, 2), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates3, 2), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates4, 3), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates5, 4), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates6, 4), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates7, 4), false);
    });
  });

  suite('isValidDefaultValue', function () {
    test('is true when type and typeof default value matches', function () {
      assert.equal(isValidDefaultValue('audio', 'string'), true);
      assert.equal(isValidDefaultValue('array', []), true);
      assert.equal(isValidDefaultValue('asset', 'string'), true);
      assert.equal(isValidDefaultValue('boolean', true), true);
      assert.equal(isValidDefaultValue('color', '#FFF'), true);
      assert.equal(isValidDefaultValue('int', 9000), true);
      assert.equal(isValidDefaultValue('number', 42), true);
      assert.equal(isValidDefaultValue('map', 'string'), true);
      assert.equal(isValidDefaultValue('model', 'string'), true);
      assert.equal(isValidDefaultValue('selector', 'string'), true);
      assert.equal(isValidDefaultValue('selectorAll', 'string'), true);
      assert.equal(isValidDefaultValue('src', 'string'), true);
      assert.equal(isValidDefaultValue('string', 'string'), true);
      assert.equal(isValidDefaultValue('time', 24), true);
      assert.equal(isValidDefaultValue('vec2', {x: 1, y: 1}), true);
      assert.equal(isValidDefaultValue('vec3', {x: 0, y: 9, z: 0}), true);
      assert.equal(isValidDefaultValue('vec4', {x: 9, y: 9, z: 9, w: 9}), true);
      assert.equal(isValidDefaultValue('vec4', null), true);
    });

    test('is false for everything else', function () {
      assert.equal(isValidDefaultValue('audio', 1), false);
      assert.equal(isValidDefaultValue('array', {}), false);
      assert.equal(isValidDefaultValue('asset', 2), false);
      assert.equal(isValidDefaultValue('boolean', {not: 'a boolean'}), false);
      assert.equal(isValidDefaultValue('color', 123456), false);
      assert.equal(isValidDefaultValue('int', 'not a number'), false);
      assert.equal(isValidDefaultValue('number', ['something else']), false);
      assert.equal(isValidDefaultValue('map', 3), false);
      assert.equal(isValidDefaultValue('model', 4), false);
      assert.equal(isValidDefaultValue('selector', 5), false);
      assert.equal(isValidDefaultValue('selectorAll', 6), false);
      assert.equal(isValidDefaultValue('src', 7), false);
      assert.equal(isValidDefaultValue('string', 8), false);
      assert.equal(isValidDefaultValue('time', 'string'), false);
      assert.equal(isValidDefaultValue('vec2', [1, 2, 3]), false);
      assert.equal(isValidDefaultValue('vec3', undefined), false);
      assert.equal(isValidDefaultValue('vec4', false), false);
    });
  });
});
