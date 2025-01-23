var path = require('path');
var TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  extends: ['webpack.common.cjs'],
  output: {
    libraryTarget: 'module',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'aframe-master.module.min.js'
  },
  experiments: {
    outputModule: true
  },
  externalsType: 'module',
  externals: {
    three: 'three'
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
};
