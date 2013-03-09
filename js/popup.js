var RadioPlayer = {
  track: {
    artist : document.getElementsByClassName("artist")[0],
    song   : document.getElementsByClassName("title")[0],
    cover  : document.getElementsByClassName("cover")[0]
  },
  buttons: {
    play   : document.getElementsByClassName("play")[0],
    stop   : document.getElementsByClassName("stop")[0],
    vk     : document.getElementsByClassName("vk")[0],
    lastfm : document.getElementsByClassName("lastfm")[0],
    github : document.getElementsByClassName("github")[0]
  },
  connAnimation : document.getElementById('connecting'),
  refreshInfoId : null,
  background    : null,
  actions       : null,
  player        : null,

  init: function(){
    this.background = chrome.extension.getBackgroundPage();
    this.actions    = chrome.browserAction;
    this.player     = this.background.document.getElementById('player');

    this.initButtons();
    this.setClass();
  },
  initButtons: function () {
    this.buttons.play.onclick = function(e) {
      RadioPlayer.changeState('play');
    };

    this.buttons.stop.onclick = function() {
      RadioPlayer.toggleButton(this);
      RadioPlayer.changeState('stop');
    };

    this.buttons.vk.onclick     = function () { RadioPlayer.toggleButton(this); return false; };
    this.buttons.lastfm.onclick = function () { RadioPlayer.toggleButton(this); return false; };
    this.buttons.github.onclick = function () { RadioPlayer.toggleButton(this); return false; };
  },
  toggleButton: function (self) {
    self.classList.add('pressed');
    setTimeout(function() { 
      self.classList.remove('pressed');
      if (self.parentNode.href) {
        window.open(self.parentNode.href,'_newtab');
      }
    }, 100);
  },
  play: function() {
    this.player.pause();
    this.player.load();
    this.player.play();
    this.setClass();
    this.background.Player.start();
  },
  pause: function() {
    this.player.pause();
    this.setClass();
    this.background.Player.stop();
  },
  changeState: function(action) {
    if (this.player.paused && action == 'play') {
      this.play();
    } else {
      this.pause();
    }
  },
  setClass: function() {
    if(this.player.paused){
      this.buttons.play.classList.remove('pressed');
      clearInterval(this.refreshInfoId);
      this.refreshInfo();
    } else {
      this.refreshInfoId = setInterval(function(){RadioPlayer.refreshInfo()},1000);
      this.buttons.play.classList.add('pressed');
    }
  },
  refreshInfo: function () {
    if(this.player.paused){
      this.track.artist.innerText = "UltraFM";
      this.track.song.innerText   = "stopped";
      this.track.cover.style.backgroundImage = 'url(/images/icon_128.png)';
      this.buttons.vk.parentNode.removeAttribute('href');
      this.buttons.lastfm.parentNode.removeAttribute('href');
      this.connAnimation.style.display = 'none';
    } else {
      this.connAnimation.style.display = (this.player.currentTime ? 'none':'block');
      var currentTrack = this.background.Player.currentTrack;
      if (currentTrack) {
        this.track.artist.innerText = currentTrack.artist;
        this.track.song.innerText   = currentTrack.song;
        this.track.cover.style.backgroundImage = 'url('+this.background.Player.cover()+')';
        this.buttons.vk.parentNode.setAttribute('href', currentTrack.links.vk);
        this.buttons.lastfm.parentNode.setAttribute('href', currentTrack.links.lastfm);
      }
    }
  }
};
RadioPlayer.init();
