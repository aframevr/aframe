var path = require('path');

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
      },
      {
        directory: 'node_modules/three/',
        publicPath: '/super-three-package'
      }
    ]
  }
};
