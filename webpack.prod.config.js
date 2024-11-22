var path = require('path');
var TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  extends: ['webpack.config.js'],
  output: {
    library: 'AFRAME',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'aframe-master.min.js'
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
