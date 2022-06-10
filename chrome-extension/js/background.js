var stream = (function() {
  return {
    audio: 'https://main.hostingradio.ru/ultra-256',
    currentSong: 'https://meta.fmgid.com/stations/ultra/current.json',
    fallbackAudio: 'https://main.hostingradio.ru:80/ultra-128.mp3',
    fallbackCurrentSong: 'http://www.radiobells.com/whoplay_new/23012020/47.json'
  };
})();

var rand = function() {
  return +new Date;
};

var capitalize = function(str) {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

var Player = {
  counter       : 0,
  currentTrack  : null,
  previousTrack : '',
  songUpdateID  : 0,
  playedTime    : 0,
  playedTimeID  : 0,
  animateDelay  : 150,
  checkDelay    : 1000,
  fetchDelay    : 5000,
  badge         : {
    playText: 'on',
    pauseText: 'off',
    playBgColor: '#009900',
    pauseBgColor: '#990000'
  },

  audioElement: function() {
    return document.querySelector('audio');
  },
  start: function() {
    Player.connect();
    Player.audioElement().addEventListener('error', Player.connect);
    Player.audioElement().addEventListener('streamfail', Player.connect);
    Player.setBadgeBgColor(true);
    Player.setBadgeText(true);
    Player.fetchSongName();
    setTimeout(Player.checkStreamState, Player.fetchDelay);
  },
  stop: function() {
    Player.audioElement().pause();
    Player.audioElement().removeEventListener('error', Player.connect, false);
    Player.audioElement().removeEventListener('streamfail', Player.connect, false);
    Player.audioElement().src = '';
    clearTimeout(Player.songUpdateID);
    clearTimeout(Player.playedTimeID);
    Player.playedTime = 0;
    if (Player.currentTrack) {
      Player.scrobble([Player.currentTrack.artist, Player.currentTrack.song]);
      Player.currentTrack = null;
    }
    Player.setBadgeBgColor(false);
    Player.setBadgeText(false);
  },
  isPaused: function() {
    return Player.audioElement().paused;
  },
  currentTime: function() {
    return Player.audioElement().currentTime;
  },
  connect: function() {
    Player.stop();
    Player.audioElement().src = stream.audio+'?t='+rand();
    Player.audioElement().play();
  },
  checkStreamState: function(delay) {
    if (Player.isStucked()) {
      var event = new Event('streamfail');
      Player.audioElement().dispatchEvent(event);
      Player.playedTime = 0;
    } else {
      Player.playedTime = Player.currentTime();
    }
    Player.playedTimeID = setTimeout(Player.checkStreamState, Player.checkDelay);
  },
  isStucked: function() {
    return (Player.currentTime() == 0 || Player.playedTime == Player.currentTime());
  },
  setBadgeBgColor: function(is_onair) {
    var bgColor = is_onair ? Player.badge.playBgColor : Player.badge.pauseBgColor;
    chrome.browserAction.setBadgeBackgroundColor({ color: bgColor });
  },
  setBadgeText: function(is_onair) {
    var text = is_onair ? Player.badge.playText : Player.badge.pauseText;
    chrome.browserAction.setBadgeText({ text: text });
  },
  fetchSongName: function(delay) {
    playlist.download();
    Player.songUpdateID = setTimeout(Player.fetchSongName, Player.fetchDelay);
  },
  cover: function() {
    return lastfmData.cover;
  },
  scrobble: function(track) {
    if (track && Settings.get('scrobbling')['session']['key']) {
      var ts = Math.floor(new Date().getTime()/1000);
      lastfm.track.scrobble({artist: track[0], track: track[1], timestamp: ts}, {key: Settings.get('scrobbling')['session']['key']}, {});
    }
  },
  updNowPlaying: function(track) {
    if (track && Settings.get('scrobbling')['session']['key']) {
      lastfm.track.updateNowPlaying({artist: track[0], track: track[1]}, {key: Settings.get('scrobbling')['session']['key']}, {});
    }
  },
  setVolume: function(value) {
    Player.audioElement().volume = parseInt(value) / 100;
  },
  setMuted: function(value) {
    Player.audioElement().muted = value;
  }
};

var playlist = {
  encode: function(string) {
    return escape(string.replace(/\s/g, '+'));
  },
  download: function (force) {
    new XHRequest({
      url: stream.currentSong+'?t='+rand(),
      async: true,
      success: playlist.setCurrentTrack
    });
  },
  setCurrentTrack: function(r, rXML) {
    r && (Player.currentTrack = playlist.parse(r, rXML));
  },
  parse: function (response) {
    var info = JSON.parse(response);
    var artist = info.artist;
    var song = info.title;
    var track = [artist, song].join(' - ');

    if (!Player.currentTrack || track !== Player.currentTrack.origin) {
      Player.previousTrack = (Player.currentTrack ? Player.currentTrack.origin : null);
      var newTrack = [artist, song];
      var oldTrack = (Player.previousTrack ? [Player.previousTrack.artist, Player.previousTrack.song] : null);
      lastfmData.init(newTrack);

      Player.scrobble(oldTrack);
      Player.updNowPlaying(newTrack);

      return {
        origin : track,
        artist : artist,
        song   : song,
        links  : {
          spotify : 'http://open.spotify.com/search/'+escape(track),
          lastfm  : 'https://last.fm/music/'+playlist.encode(artist)+'/_/'+playlist.encode(song)
        }
      };
    } else {
      return Player.currentTrack;
    }
  },
  parseFallback: function (response, responseXML) {
    var info, track;
    info = JSON.parse(response);
    track = [capitalize(info.artist), capitalize(info.song)].join(' - ');

    if (!Player.currentTrack || track !== Player.currentTrack.origin) {
      Player.previousTrack = (Player.currentTrack ? Player.currentTrack.origin : null);
      var newTrack = track.split(" - ");
      var oldTrack = (Player.previousTrack ? Player.previousTrack.split(' - ') : null);
      lastfmData.init(newTrack);

      Player.scrobble(oldTrack);
      Player.updNowPlaying(newTrack);

      return {
        origin : track,
        artist : newTrack[0],
        song   : newTrack[1],
        links  : {
          spotify : 'http://open.spotify.com/search/'+escape(track),
          lastfm  : 'https://last.fm/music/'+playlist.encode(newTrack[0])+'/_/'+playlist.encode(newTrack[1])
        }
      };
    } else {
      return Player.currentTrack;
    }
  }
};

var lastfmData = {
  artist  : null,
  song    : null,
  cover   : null,
  defaultCover: '/images/no_cover.png',

  init: function (trackArray) {
    this.artist = trackArray[0];
    this.song   = trackArray[1];
    this.fetchCover('track', 2);
  },
  fetchCover: function(type, size) {
    lastfm[type].getInfo({artist: this.artist, track: this.song, autocorrect: 1}, {
      success: function (r, rXML) {
        var cover;
        if (rXML) {
          var coverTag = rXML.getElementsByTagName("image")[size];
          if (coverTag && coverTag.textContent) {
            cover = coverTag.textContent;
          } else if (type == 'track') {
            lastfmData.fetchCover('artist', 3);
          } else {
            cover = lastfmData.defaultCover;
          }
        } else {
          cover = lastfmData.defaultCover;
        }
        lastfmData.loadCover(cover);
      }
    });
  },
  loadCover: function(c) {
    var imageHolder = document.querySelector('img');
    imageHolder.onload = function() {
      lastfmData.cover = imageHolder.src;
    };
    imageHolder.src = c || lastfmData.defaultCover;
  }
};

Settings.default();
setTimeout(function(){
  Player.isPaused() && Player.stop();
},100);
