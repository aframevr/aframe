var path = require('path');
var webpack = require('webpack');

var config = {
  entry: './src/index.js',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      INSPECTOR_VERSION: JSON.stringify(
        process.env.INSPECTOR_VERSION
      )
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};

if (process.env.WEBGPU === 'true') {
  config.resolve = {
    alias: {
      'three$': path.resolve(__dirname, 'node_modules/three/build/three.webgpu.js')
    }
  };
}

module.exports = config;
