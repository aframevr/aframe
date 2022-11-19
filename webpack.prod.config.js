var path = require('path');
var merge = require('webpack-merge').merge;
var commonConfiguration = require('./webpack.config.js');

module.exports = merge(commonConfiguration, {
  output: {
    library: 'AFRAME',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'aframe-master.min.js'
  },
  mode: 'production'
});
