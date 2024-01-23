var path = require('path');
var merge = require('webpack-merge').merge;
var commonConfiguration = require('./webpack.config.js');
var TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(commonConfiguration, {
  output: {
    library: 'AFRAME',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: '8frame-1.5.0-beta.min.js'
  },
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            passes: 2
          },
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  }
});
