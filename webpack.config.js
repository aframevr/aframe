var path = require('path');
var webpack = require('webpack');
var NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'AFRAME',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'aframe-master.js'
  },
  devtool: 'source-map',
  mode: 'development',
  devServer: {
    port: process.env.PORT || 9000,
    hot: false,
    liveReload: true,
    static: {
      directory: 'examples'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.INSPECTOR_VERSION': JSON.stringify(
        process.env.INSPECTOR_VERSION
      )
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, '');
    }),
    new NodePolyfillPlugin()
  ],
  resolve: {
    alias: {
      three: 'super-three'
    },
    fallback: {
      // fixes proxy-agent dependencies
      crypto: false,
      net: false,
      dns: false,
      tls: false,
      assert: false,
      http: false,
      https: false,
      // fixes next-i18next dependencies
      path: false,
      fs: false,
      // fixes mapbox dependencies
      events: false,
      // fixes sentry dependencies
      process: false
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
          // options: {
          //   presets: ['@babel/preset-env'],
          // },
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
