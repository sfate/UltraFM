define('ultra.settings', function(require) { 'use strict';
  var settings = {
    set: function(key, value, override) {
      if (override || !window.localStorage[key]) {
        window.localStorage[key] = JSON.stringify(value);
      }
    },
    get: function(key, all) {
      if (all) {
        return window.localStorage;
      } else {
        return JSON.parse(window.localStorage[key]);
      }
    },
    reset: function(key, all) {
      if (all) {
        window.localStorage.clear();
      } else {
        window.localStorage.removeItem(key);
      }
    },
    default: function() {
      this.set('scrobbling', {
        session: {}
      });
      this.set('volume', {
        muted: false,
        value: 100
      });
    }
  };

  return settings;
});
