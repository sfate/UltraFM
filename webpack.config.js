var webpack = require('webpack');

module.exports = {
  entry: {
    popup: './javascript/popup.js',
    options: './javascript/options.js',
    background: './javascript/background.js'
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    path: './chrome-extension/js',
    publicPath: './js/'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      filename: './commons.js',
      name: 'commons'
    })
  ],

  resolve: {
    root: './javascript/modules',
    alias: {
      'ultra.ajax': 'xhr.js',
      'ultra.rsa': 'rsa.js',
      'ultra.settings': 'settings.js',
      'ultra.config': 'config.js',
      'ultra.config.dev': 'config.dev.js',
      'ultra.lastfm.api': 'lastfm.api.js',
      'ultra.lastfm.obj': 'lastfm.obj.js',
    },
    modulesDirectories: [
      './javascript/modules'
    ]
  }
};
