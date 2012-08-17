var Player = {
  counter: 0,
  intervalId: 0,
  currentTrack: "Artist - Track",
  songUpdateIntervalId: 0,

  start: function() {
    this.intervalId = setInterval(this.animate, 150);
    this.song();
    this.songUpdateIntervalId = setInterval(this.song, 5000);
  },
  stop: function() {
    clearInterval(this.intervalId);
    clearInterval(this.songUpdateIntervalId);
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
  }
}

var playlist = {
  playlist_url: "http://94.25.53.133/ultra-320.xspf",

  download: function () {
    var request = XHRequest("get", this.playlist_url);
    request.onload = function(){
      playlist.parse(request.responseXML);
    };
    request.send();
  },
  parse: function (xml) {
    if (xml) {
      Player.currentTrack = xml.getElementsByTagName("title")[1].textContent;
    }
  }
}

function XHRequest(method, url) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  return xhr;
}
