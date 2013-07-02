var Player = {
  counter: 0,
  intervalId: 0,
  currentTrack: null,
  songUpdateIntervalId: 0,

  audioElement: function() {
    return document.querySelector('audio');
  },
  start: function() {
    this.connect();
    this.audioElement().addEventListener('error', Player.connect);
    this.intervalId = setInterval(this.animate, 150);
    this.song();
    this.songUpdateIntervalId = setInterval(this.song, 5000);
  },
  stop: function() {
    this.audioElement().pause();
    this.audioElement().removeEventListener('error', Player.reconnect, false);
    this.audioElement().src = null;
    clearInterval(this.intervalId);
    clearInterval(this.songUpdateIntervalId);
    this.currentTrack = null;
    chrome.browserAction.setBadgeText({text:''});
  },
  paused: function() {
    return this.audioElement().paused;
  },
  currentTime: function() {
    return this.audioElement().currentTime;
  },
  connect: function() {
    Player.audioElement().src = "http://94.25.53.133:80/ultra-128.mp3?nocache="+Math.floor(Math.random() * 100000);
    Player.audioElement().play();
  },
  animate: function() {
    var animation = ["....:",":..::","..::.",":.:.:","::.:.",":.:..",".:.:.",":.:.:","::.:.","..:::","..:..",":..:.","..:.:","...::",":.::.",".::::","..::.",":.::.",":..:.",".:::."];
    if(this.counter < 19){
      this.counter += 1;
    }
    else{
      this.counter = 0;
    }
    chrome.browserAction.setBadgeText({text:animation[this.counter]});
  },
  song: function() {
    playlist.download();
  },
  XHRequest: function (method, url, async) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, async);
    return xhr;
  },
  cover: function () {
    return lastfmData.cover;
  }
};

var playlist = {
  domain : "http://94.25.53.133/",
  stream : "ultra-128.mp3.xspf",

  download: function () {
    var request = Player.XHRequest("get", this.domain, true);
    request.onreadystatechange = function(){
      if (request.readyState===4 && request.status===200) {
        playlist.parse(request.responseText);
      }
    };
    request.send();
  },
  parse: function (responseText) {
    if (responseText) {
      var responseXML = document.createElement('div');
      responseXML.innerHTML = responseText;

      var stations  = responseXML.querySelectorAll('.newscontent');
      var ultra     = stations[stations.length-1];
      var ultraInfo = ultra.querySelectorAll('.streamdata');
      var track     = ultraInfo[ultraInfo.length-1].innerText;

      var trackArray = track.split(" - ");
      lastfmData.init(trackArray);

      Player.currentTrack = {
        artist : trackArray[0],
        song   : trackArray[1],
        links  : {
          vk     : 'http://vk.com/audio?q='+escape(track),
          lastfm : lastfmData.link
        }
      };
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
    var request = Player.XHRequest("get", url, false);
    request.onload = function() {
      lastfmData.saveCoverUrl(request.responseXML, coverType, size);
    };
    request.send();
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

