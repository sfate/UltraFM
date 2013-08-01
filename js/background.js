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
    Player.audioElement().src = "http://94.25.53.133:80/ultra-128.mp3?nocache="+Math.floor(Math.random() * 100000);
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
  domain : "http://94.25.53.133/",
  stream : "ultra-128.mp3.xspf",

  download: function () {
    new XHRequest({
      url: this.domain,
      async: true,
      success: function(response) {
        playlist.parse(response);
      }
    });
  },
  parse: function (response) {
    if (response) {
      var responseXML = document.createElement('div');
      responseXML.innerHTML = response;

      var stations  = responseXML.querySelectorAll('.newscontent');
      var ultra     = stations[stations.length-1];
      var ultraInfo = ultra.querySelectorAll('.streamdata');
      var track     = ultraInfo[ultraInfo.length-1].innerText;

      if (!Player.currentTrack || track !== Player.currentTrack.origin) {
        Player.previousTrack = (Player.currentTrack ? Player.currentTrack.origin : null);
        var newTrack = track.split(" - ");
        var oldTrack = (Player.previousTrack ? Player.previousTrack.split(' - ') : null);
        lastfmData.init(newTrack);

        Player.scrobble(oldTrack);
        Player.updNowPlaying(newTrack);

        Player.currentTrack = {
          origin : track,
          artist : newTrack[0],
          song   : newTrack[1],
          links  : {
            vk     : 'http://vk.com/audio?q='+escape(track),
            lastfm : lastfmData.link
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
  link    : null,
  cover   : null,
  noCover : '/images/loading.gif',
  apiKey  : '0b26cafa64819d3b41788dc848ec0926',

  init: function (trackArray) {
    this.artist = escape(trackArray[0].replace(/\s/g, '+'));
    this.song   = escape(trackArray[1].replace(/\s/g, '+'));
    this.link   = 'http://last.fm/music/'+this.artist+'/_/'+this.song;
    this.fetchCover('track', 2);
  },
  fetchCover: function(coverType, size) {
    var url = 'http://ws.audioscrobbler.com/2.0/?method='+coverType+'.getinfo&api_key='+this.apiKey+'&artist='+this.artist+'&track='+this.song;
    new XHRequest({
      url: url,
      async: false,
      success: function(response, responseXML) {
        lastfmData.saveCoverUrl(responseXML, coverType, size);
      }
    });
  },
  saveCoverUrl: function (coverXML, coverType, size) {
    if (coverXML) {
      var coverTag = coverXML.getElementsByTagName("image")[size];
      if (coverTag && coverTag.textContent) {
        this.cover = coverTag.textContent;
      } else if (coverType == 'track') {
        this.fetchCover('artist', 3);
      } else {
        this.cover = this.noCover;
      }
      this.preloadCover();
    }
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
