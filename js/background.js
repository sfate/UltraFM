var Player = {
  counter: 0,
  intervalId: 0,
  songUpdateIntervalId: 0,
  popup: chrome.extension.getViews({type: "popup"})[0],

  start: function() {
  	this.intervalId = setInterval(this.animate, 150);
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
    playlist.current_track;
    if (this.popup) {
      this.popup.updateStatus(playlist.current_track);
    }
  }
}

var playlist = {
  playlist_url: "http://94.25.53.133/ultra-320.xspf",
  current_track: "Artist - Track",

  download: function () {
    var request = XHRequest("get", "http://94.25.53.133/ultra-320.xspf");
    request.onload = function(){
      playlist.parse(request.responseXML);
    };
    request.send();
  },

  parse: function (xml) {
    if (xml) {
      this.current_track = xml.getElementsByTagName("title")[1].textContent
    }
  }
}

function XHRequest(method, url) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  return xhr;
}
