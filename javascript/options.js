require(
  ['ultra.config', 'ultra.settings'],
  function(config, settings) { 'use strict';

  var Options = {
    storeLfmToken: function() {
      var stored = false;
      var token  = this.getURLParameter('token');
      if ( Options.isRefererLfm() && token) {
        Options.storeScrobblingParam('token', token);
        stored = true;
      }
      return stored;
    },
    isRefererLfm: function() {
      var parser = document.createElement('a');
      parser.href = document.referrer;
      return !!~(parser.hostname.indexOf('last') && parser.hostname.indexOf('fm'));
    },
    getLfmSession: function() {
      lastfm.auth.getSession({token: settings.get('scrobbling')['token'], format: 'json'}, {success: function(data){
        if(data) {
          Options.storeScrobblingParam('session', JSON.parse(data).session);
          Options.storeScrobblingParam('enabled', true);
          window.location.replace('?#_#');
        } else {
          Options.storeScrobblingParam('session', {});
          Options.storeScrobblingParam('enabled', false);
        }
      }});
    },
    setScrobblingState: function(state) {
      Options.storeScrobblingParam('enabled', state);
    },
    storeScrobblingParam: function(key, value) {
      var scrobbling = settings.get('scrobbling');
      scrobbling[key] = value;
      settings.set('scrobbling', scrobbling, true);
    },
    getURLParameter: function(key) {
      return decodeURIComponent((new RegExp('[?|&]' + key + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    },
    initControls: function() {
      var lastfmConf = config['lastFM'];
      var scrobbleFlag = document.querySelector('.scrobble .checkbox');
      var scrobbleHint = document.querySelector('.scrobble .renew-hint');
      scrobbleHint.href = lastfmConf['authUri']+lastfmConf['key'];
      scrobbleFlag.checked = settings.get('scrobbling')['enabled'];
      scrobbleFlag.onchange = function(e) {
        if(settings.get('scrobbling')['session']['key']) {
          Options.storeScrobblingParam('enabled', e.target.checked);
        } else {
          Options.storeScrobblingParam('enabled', false);
          location.href = lastfmConf['authUri']+lastfmConf['key'];
        }
      };
    }
  }

  window.onload = function() {
    if(Options.storeLfmToken()) {
      Options.getLfmSession();
    }
    Options.initControls();
  };
});
