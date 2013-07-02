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
  Player        : null,

  init: function(){
    RadioPlayer.Player = chrome.extension.getBackgroundPage().Player;

    RadioPlayer.initButtons();
    RadioPlayer.setClass();
    RadioPlayer.refreshInfo();
  },
  initButtons: function () {
    RadioPlayer.buttons.play.onclick = function(e) {
      RadioPlayer.changeState('play');
    };

    RadioPlayer.buttons.stop.onclick = function() {
      RadioPlayer.toggleButton(this);
      RadioPlayer.changeState('stop');
    };

    RadioPlayer.buttons.vk.onclick     = function () { RadioPlayer.toggleButton(this); return false; };
    RadioPlayer.buttons.lastfm.onclick = function () { RadioPlayer.toggleButton(this); return false; };
    RadioPlayer.buttons.github.onclick = function () { RadioPlayer.toggleButton(this); return false; };
  },
  toggleButton: function (button) {
    button.classList.add('active');
    setTimeout(function() {
      button.classList.remove('active');
      if (button.href) {
        window.open(button.href,'_newtab');
      }
    }, 100);
  },
  play: function() {
    RadioPlayer.Player.start();
    RadioPlayer.setClass();
  },
  pause: function() {
    RadioPlayer.Player.stop();
    RadioPlayer.setClass();
  },
  changeState: function(action) {
    if (RadioPlayer.Player.paused() && action == 'play') {
      RadioPlayer.play();
    } else {
      RadioPlayer.pause();
    }
  },
  setClass: function() {
    if (RadioPlayer.Player.paused()) {
      RadioPlayer.buttons.play.classList.remove('active');
      clearInterval(RadioPlayer.refreshInfoId);
      RadioPlayer.refreshInfo();
    } else {
      RadioPlayer.refreshInfoId = setInterval(function(){RadioPlayer.refreshInfo()},1000);
      RadioPlayer.buttons.play.classList.add('active');
    }
  },
  refreshInfo: function () {
    if (RadioPlayer.Player.paused()) {
      RadioPlayer.track.artist.innerText = "UltraFM";
      RadioPlayer.track.song.innerText   = "stopped";
      for (var i=0;i<RadioPlayer.track.cover.length;i++) {
        RadioPlayer.track.cover[i].style.backgroundImage = 'url(/images/logo-big.png)';
      }
      RadioPlayer.buttons.vk.removeAttribute('href');
      RadioPlayer.buttons.lastfm.removeAttribute('href');
      RadioPlayer.connAnimation.style.display = 'none';
    } else {
      RadioPlayer.connAnimation.style.display = (RadioPlayer.Player.currentTime() ? 'none':'block');
      var currentTrack = RadioPlayer.Player.currentTrack;
      if (currentTrack) {
        RadioPlayer.track.artist.innerText = currentTrack.artist;
        RadioPlayer.track.song.innerText   = currentTrack.song;
        for (var i=0;i<RadioPlayer.track.cover.length;i++) {
          RadioPlayer.track.cover[i].style.backgroundImage = 'url('+RadioPlayer.Player.cover()+')';
        }
        RadioPlayer.buttons.vk.setAttribute('href', currentTrack.links.vk);
        RadioPlayer.buttons.lastfm.setAttribute('href', currentTrack.links.lastfm);
      }
    }
  }
};

setTimeout(RadioPlayer.init, 0);
