var stream = function() {
  var domain = 'http://94.25.53.133:80';
  var flow   = '/ultra-128.mp3';
  return {
    domain : domain,
    url    : domain+flow,
    info   : domain+flow+'.xspf'
  };
};

var Player = {
  counter: 0,
  intervalId: 0,
  currentTrack: null,
  previousTrack: '',
  songUpdateIntervalId: 0,

  audioElement: function() {
    return document.querySelector('audio');
  },
  start: function() {
    Player.connect();
    Player.audioElement().addEventListener('error', Player.connect);
    Player.intervalId = setInterval(Player.animate, 150);
    Player.fetchSongName();
    Player.songUpdateIntervalId = setInterval(Player.fetchSongName, 5000);
  },
  stop: function() {
    Player.audioElement().pause();
    Player.audioElement().removeEventListener('error', Player.connect, false);
    Player.audioElement().src = null;
    clearInterval(Player.intervalId);
    clearInterval(Player.songUpdateIntervalId);
    if (Player.currentTrack) {
      Player.scrobble([Player.currentTrack.artist, Player.currentTrack.song]);
      Player.currentTrack = null;
    }
    chrome.browserAction.setBadgeText({text:''});
  },
  paused: function() {
    return Player.audioElement().paused;
  },
  currentTime: function() {
    return Player.audioElement().currentTime;
  },
  connect: function() {
    Player.audioElement().src = stream().url+'?nocache='+Math.floor(Math.random() * 100000);
    Player.audioElement().play();
  },
  animate: function() {
    var animation = ["....:",":..::","..::.",":.:.:","::.:.",":.:..",".:.:.",":.:.:","::.:.","..:::","..:..",":..:.","..:.:","...::",":.::.",".::::","..::.",":.::.",":..:.",".:::."];
    if(Player.counter < 19){
      Player.counter += 1;
    }
    else{
      Player.counter = 0;
    }
    chrome.browserAction.setBadgeText({text:animation[Player.counter]});
  },
  fetchSongName: function() {
    playlist.parseXml = true;
    playlist.download();
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
  parseXml : false,

  download: function (force) {
    var destination = function() {
      return (playlist.parseXml ? stream().info : stream().domain);
    };
    new XHRequest({
      url: destination(),
      async: true,
      success: function(response, responseXML) {
        playlist.parse(response, responseXML);
      }
    });
  },
  parse: function (response, responseXML) {
    if (response) {
      var track;
      if (playlist.parseXml) {
        track = responseXML.querySelector('track > title').textContent;
      } else {
        track = response.split('streamdata">').pop().split('\</td')[0];
      }

      if (!Player.currentTrack || track !== Player.currentTrack.origin) {
        Player.previousTrack = (Player.currentTrack ? Player.currentTrack.origin : null);
        var newTrack = track.split(" - ");
        var oldTrack = (Player.previousTrack ? Player.previousTrack.split(' - ') : null);
        lastfmData.init(newTrack);

        Player.scrobble(oldTrack);
        Player.updNowPlaying(newTrack);

        var encode = function(string) {
          return escape(string.replace(/\s/g, '+'));
        };
        Player.currentTrack = {
          origin : track,
          artist : newTrack[0],
          song   : newTrack[1],
          links  : {
            vk     : 'http://vk.com/audio?q='+escape(track),
            lastfm : 'http://last.fm/music/'+encode(newTrack[0])+'/_/'+encode(newTrack[1])
          }
        };
      }
    } else {
      Player.currentTrack = null;
    }
  }
};
var lastfmData = {
  artist  : null,
  song    : null,
  cover   : null,

  init: function (trackArray) {
    this.artist = trackArray[0];
    this.song   = trackArray[1];
    this.fetchCover('track', 2);
  },
  fetchCover: function(type, size) {
    lastfm[type].getInfo({artist: this.artist, track: this.song}, {
      success: function (response, responseXML) {
        if (responseXML) {
          var coverTag = responseXML.getElementsByTagName("image")[size];
          if (coverTag && coverTag.textContent) {
            lastfmData.cover = coverTag.textContent;
          } else if (type == 'track') {
            lastfmData.fetchCover('artist', 3);
          } else {
            lastfmData.cover = '/images/no_cover.png';
          }
          lastfmData.preloadCover();
        } else {
          lastfmData.cover = '/images/no_cover.png';
        }
      }
    });
  },
  preloadCover: function() {
    var imageHolder = document.querySelector('img');
    if (this.cover) {
      imageHolder.style.display = 'none';
      imageHolder.src = lastfmData.cover;
      imageHolder.style.display = 'block';
    }
  }
};

Settings.default();
setTimeout(function(){
  if (Player.paused()) {
    Player.stop();
  }
},100);
