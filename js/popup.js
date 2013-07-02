var RadioPlayer = {
  track: {
    artist : document.getElementsByClassName("artist")[0],
    song   : document.getElementsByClassName("song")[0],
    cover  : document.getElementsByClassName("half")
  },
  buttons: {
    play   : document.getElementsByClassName("play")[0].parentNode,
    stop   : document.getElementsByClassName("stop")[0].parentNode,
    vk     : document.getElementsByClassName("vk")[0].parentNode,
    lastfm : document.getElementsByClassName("lastfm")[0].parentNode,
    github : document.getElementsByClassName("github")[0].parentNode
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
    self.classList.add('active');
    setTimeout(function() {
      self.classList.remove('active');
      if (self.href) {
        window.open(self.href,'_newtab');
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
      this.buttons.play.classList.remove('active');
      clearInterval(this.refreshInfoId);
      this.refreshInfo();
    } else {
      this.refreshInfoId = setInterval(function(){RadioPlayer.refreshInfo()},1000);
      this.buttons.play.classList.add('active');
    }
  },
  refreshInfo: function () {
    if(this.player.paused){
      this.track.artist.innerText = "UltraFM";
      this.track.song.innerText   = "stopped";
      for (var i=0;i<this.track.cover.length;i++) {
        this.track.cover[i].style.backgroundImage = 'url(/images/logo-big.png)';
      }
      this.buttons.vk.removeAttribute('href');
      this.buttons.lastfm.removeAttribute('href');
      this.connAnimation.style.display = 'none';
    } else {
      this.connAnimation.style.display = (this.player.currentTime ? 'none':'block');
      var currentTrack = this.background.Player.currentTrack;
      if (currentTrack) {
        this.track.artist.innerText = currentTrack.artist;
        this.track.song.innerText   = currentTrack.song;
        for (var i=0;i<this.track.cover.length;i++) {
          this.track.cover[i].style.backgroundImage = 'url('+this.background.Player.cover()+')';
        }
        this.buttons.vk.setAttribute('href', currentTrack.links.vk);
        this.buttons.lastfm.setAttribute('href', currentTrack.links.lastfm);
      }
    }
  }
};
RadioPlayer.init();
