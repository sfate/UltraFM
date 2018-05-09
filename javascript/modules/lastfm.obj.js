define('ultra.lastfm.obj', function(require) { 'use strict';
  var LastFM = require('ultra.lastfm.api'),
      config = require('ultra.config');

  return new LastFM({
    apiKey    : config.lastFM.key,
    apiSecret : config.lastFM.sig
  });
});
