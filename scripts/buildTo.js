var execSync = require('child_process').execSync;
var pkg = require('../package.json');

var name = process.argv[2] || '8frame-master';

console.log('Building 8frame as:', name);

const distMin = pkg.scripts['dist:min'].replace(/aframe-master/g, name);
const distMax = pkg.scripts['dist:max'].replace(/aframe-master/g, name);

console.log('>', distMin);
execSync(distMin, {stdio: 'inherit'});

console.log('>', distMax);
execSync(distMax, {stdio: 'inherit'});
