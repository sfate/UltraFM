var Settings = {
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
      window.localStorage[key] = null;
    }
  },
  default: function() {
    Settings.set('scrobbling', {
      session: {}
    });
  }
};
