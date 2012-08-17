var RadioPlayer = {
  background: null,
  actions: null,
  player: null,
  controlbar: null,
  counterMin: 0,
  counterMax: 10,
  streamUrl: 'http://94.25.53.133/ultra-320',

  init: function(){
    this.background = chrome.extension.getBackgroundPage();
    this.actions = chrome.browserAction;
    this.player = this.background.document.getElementById('player');
    this.controlbar = document.getElementById('controlbar');
    this.statusbar  = document.getElementById('statusbar');
    this.controlbar.onclick = function(e){
    	e.preventDefault();
      RadioPlayer.changeState.call(RadioPlayer);
    };

    this.setClass();
  },
  play: function(){
    this.player.setAttribute('src', this.streamUrl);
    this.player.play();
    this.background.Player.start();
  },
  pause: function(){
    this.player.pause();
    this.player.setAttribute('src', null);
    this.background.Player.stop();
  },
  changeState: function(){
    if(this.player.paused){
      this.play();
    }
    else{
      this.pause();
    }
    this.setClass();
  },
  setClass: function(){
    if(this.player.paused){
    	this.controlbar.className = "play";
      this.statusbar.innerHTML  = "paused" ;
    } else {
      var trackStubText = "Artist - Track";
      this.controlbar.className = "pause";
      if (this.background.Player.currentTrack == trackStubText) {
        this.statusbar.innerHTML = "connecting...";
        setTimeout(function(){
            // refresh track info in 5 seconds
            RadioPlayer.setClass();
        },5000);
      } else {
        this.statusbar.innerHTML  =  this.background.Player.currentTrack;
      }
    }
  }
};
RadioPlayer.init();

