var Player = {
  counter: 0,
  intervalId: 0,
  currentTrack: null,
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
    Player.audioElement().removeEventListener('error', Player.reconnect, false);
    Player.audioElement().src = null;
    clearInterval(Player.intervalId);
    clearInterval(Player.songUpdateIntervalId);
    Player.currentTrack = null;
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
  cover: function () {
    return lastfmData.cover;
  },
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
        var trackArray = track.split(" - ");
        lastfmData.init(trackArray);

        Player.currentTrack = {
          origin : track,
          artist : trackArray[0],
          song   : trackArray[1],
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

var lastfm = new LastFM({
  apiKey    : CONFIG.lastFM.key,
  apiSecret : CONFIG.lastFM.sig
});
Settings.set('config', CONFIG);
setTimeout(function(){
  if (Player.paused()) {
    Player.stop();
  }
},100);
