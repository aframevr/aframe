var path = require('path');
var webpack = require('webpack');

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
    port: process.env.PORT || 8080,
    hot: false,
    liveReload: true,
    static: {
      directory: 'examples'
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
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
    })
  ],
  resolve: {
    alias: {
      three: 'super-three'
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
