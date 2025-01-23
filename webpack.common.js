var path = require('path');
var webpack = require('webpack');

module.exports = {
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
