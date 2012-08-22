var Player = {
  counter: 0,
  intervalId: 0,
  currentTrack: null,
  songUpdateIntervalId: 0,

  start: function() {
    this.intervalId = setInterval(this.animate, 150);
    this.song();
    this.songUpdateIntervalId = setInterval(this.song, 5000);
  },
  stop: function() {
    clearInterval(this.intervalId);
    clearInterval(this.songUpdateIntervalId);
    this.currentTrack = null;
    chrome.browserAction.setBadgeText({text:''});
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
  XHRequest: function (method, url) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    return xhr;
  }
}

var playlist = {
  playlist_url: "http://94.25.53.133/ultra-320.xspf",

  download: function () {
    var request = Player.XHRequest("get", this.playlist_url);
    request.onload = function(){
      playlist.parse(request.responseXML);
    };
    request.send();
  },
  parse: function (xml) {
    if (xml) {
      var track      = xml.getElementsByTagName("title")[1].textContent;
      var trackArray = track.split(" - ");
      lastfmData.init(trackArray);

      Player.currentTrack = {
        artist : trackArray[0],
        song   : trackArray[1],
        links  : {
          vk     : 'http://vk.com/audio?q='+escape(track),
          lastfm : lastfmData.link
        },
        cover  : lastfmData.cover
      };
    } else {
      Player.currentTrack = null;
    }
  }
}
var lastfmData = {
  artist : null,
  song   : null,
  link   : null,
  cover  : null,
  apiKey : 'b25b959554ed76058ac220b7b2e0a026',

  init: function (trackArray) {
    this.artist = trackArray[0].replace(/\s/g, '+');
    this.song   = trackArray[1].replace(/\s/g, '+');

    this.link = 'http://last.fm/music/'+escape(this.artist)+'/_/'+escape(this.song);

    var url     = "http://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key="+this.apiKey+"&artist="+this.artist+"&track="+this.song;
    var request = Player.XHRequest("get", url);
    request.onload = function(){
      lastfmData.parseCoverUrl(request.responseXML);
    };
    request.send();
  },
  parseCoverUrl: function (coverXML) {
    if (coverXML) {
      this.cover = coverXML.getElementsByTagName("album")[0].getElementsByTagName("image")[0].textContent;
    }
  }
}

