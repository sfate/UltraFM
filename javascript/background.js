require(
  ['ultra.config', 'ultra.settings', 'ultra.ajax', 'ultra.lastfm.obj'],
  function(config, settings, ajax, lastfm) { 'use strict';

  var stream = (function() {
    var domain = 'http://nashe2.hostingradio.ru';
    var flow   = '/ultra-128.mp3';
    return {
      domain : domain,
      url    : domain+flow,
      info   : domain+flow+'.xspf'
    };
  })();

  var Player = {
    counter       : 0,
    currentTrack  : null,
    previousTrack : '',
    animateID     : 0,
    songUpdateID  : 0,
    playedTime    : 0,
    playedTimeID  : 0,
    animateDelay  : 150,
    checkDelay    : 1000,
    fetchDelay    : 5000,

    audioElement: function() {
      return document.querySelector('audio');
    },
    start: function() {
      Player.connect();
      Player.audioElement().addEventListener('error', Player.connect);
      Player.audioElement().addEventListener('streamfail', Player.connect);
      Player.animate();
      Player.fetchSongName();
      setTimeout(Player.checkStreamState, Player.fetchDelay);
    },
    stop: function() {
      Player.audioElement().pause();
      Player.audioElement().removeEventListener('error', Player.connect, false);
      Player.audioElement().removeEventListener('streamfail', Player.connect, false);
      Player.audioElement().src = '';
      clearTimeout(Player.animateID);
      clearTimeout(Player.songUpdateID);
      clearTimeout(Player.playedTimeID);
      Player.playedTime = 0;
      if (Player.currentTrack) {
        Player.scrobble([Player.currentTrack.artist, Player.currentTrack.song]);
        Player.currentTrack = null;
      }
      chrome.browserAction.setBadgeText({text:''});
    },
    isPaused: function() {
      return Player.audioElement().paused;
    },
    currentTime: function() {
      return Player.audioElement().currentTime;
    },
    connect: function() {
      Player.stop();
      Player.audioElement().src = stream.url+'?nocache='+Math.floor(Math.random() * 100000);
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
    animate: function() {
      var animation = ["....:",":..::","..::.",":.:.:","::.:.",":.:..",".:.:.",":.:.:","::.:.","..:::","..:..",":..:.","..:.:","...::",":.::.",".::::","..::.",":.::.",":..:.",".:::."];
      if(Player.counter < 19){
        Player.counter += 1;
      }
      else{
        Player.counter = 0;
      }
      chrome.browserAction.setBadgeText({text:animation[Player.counter]});
      Player.animateID = setTimeout(Player.animate, Player.animateDelay);
    },
    fetchSongName: function(delay) {
      playlist.parseXml = true;
      playlist.download();
      Player.songUpdateID = setTimeout(Player.fetchSongName, Player.fetchDelay);
    },
    cover: function() {
      return lastfmData.cover;
    },
    scrobble: function(track) {
      if (track && settings.get('scrobbling')['session']['key']) {
        var ts = Math.floor(new Date().getTime()/1000);
        lastfm.track.scrobble({artist: track[0], track: track[1], timestamp: ts}, {key: settings.get('scrobbling')['session']['key']}, {});
      }
    },
    updNowPlaying: function(track) {
      if (track && settings.get('scrobbling')['session']['key']) {
        lastfm.track.updateNowPlaying({artist: track[0], track: track[1]}, {key: settings.get('scrobbling')['session']['key']}, {});
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

    encode: function(string) {
      return escape(string.replace(/\s/g, '+'));
    },
    download: function (force) {
      new ajax({
        url: stream[playlist.parseXml ? 'info':'domain'],
        async: true,
        success: playlist.setCurrentTrack
      });
    },
    setCurrentTrack: function(r, rXML) {
      r && (Player.currentTrack = playlist.parse(r, rXML));
    },
    parse: function (response, responseXML) {
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

        return {
          origin : track,
          artist : newTrack[0],
          song   : newTrack[1],
          links  : {
            vk     : 'http://vk.com/audio?q='+escape(track),
            lastfm : 'http://last.fm/music/'+playlist.encode(newTrack[0])+'/_/'+playlist.encode(newTrack[1])
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

  settings.default();
  setTimeout(function(){
    Player.isPaused() && Player.stop();
  },100);

  // TODO: remove this with proper module load
  window.Player = Player;
});
