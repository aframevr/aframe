var path = require('path');
var webpack = require('webpack');

module.exports = {
  extends: ['webpack.common.cjs'],
  output: {
    library: {
      name: 'AFRAME',
      type: 'var',
      export: 'default'
    },
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'aframe-master.js'
  },
  mode: 'development',
  devServer: {
    port: process.env.PORT || 9000,
    hot: false,
    liveReload: true,
    static: [
      {
        directory: 'examples'
      },
      {
        directory: 'dist',
        publicPath: '/dist'
      }
    ]
  }
};
