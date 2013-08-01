var Radio = {
  refreshInfoId : null,
  Player        : null,

  loadControls: function() {
    Radio.track = {
      artist : document.getElementsByClassName("artist")[0],
      song   : document.getElementsByClassName("song")[0],
      cover  : document.getElementsByClassName("half")
    };
    Radio.buttons = {
      play   : document.getElementsByClassName("play")[0],
      stop   : document.getElementsByClassName("stop")[0],
      vk     : document.getElementsByClassName("vk")[0],
      lastfm : document.getElementsByClassName("lastfm")[0],
      github : document.getElementsByClassName("github")[0]
    };
    Radio.connAnimation = document.getElementById('connecting');
  },
  init: function(){
    Radio.Player = chrome.extension.getBackgroundPage().Player;

    Radio.loadControls();
    Radio.initButtons();
    Radio.setClass();
    Radio.refreshInfo();
    Radio.initScrobbleLink();
  },
  initButtons: function () {
    Radio.buttons.play.onclick = function(e) {
      Radio.changeState('play');
    };

    Radio.buttons.stop.onclick = function() {
      Radio.toggleButton(this);
      Radio.changeState('stop');
    };

    Radio.buttons.vk.onclick     = function () { Radio.toggleButton(this); return false; };
    Radio.buttons.lastfm.onclick = function () { Radio.toggleButton(this); return false; };
    Radio.buttons.github.onclick = function () { Radio.toggleButton(this); return false; };
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
  changeState: function(action) {
    if (Radio.Player.paused() && action == 'play') {
      Radio.Player.start();
    } else {
      Radio.Player.stop();
    }
    Radio.setClass();
  },
  setClass: function() {
    if (Radio.Player.paused()) {
      Radio.buttons.play.classList.remove('active');
      clearInterval(Radio.refreshInfoId);
      Radio.refreshInfo();
    } else {
      Radio.refreshInfoId = setInterval(Radio.refreshInfo,1000);
      Radio.buttons.play.classList.add('active');
    }
  },
  refreshInfo: function () {
    if (Radio.Player.paused()) {
      Radio.track.artist.innerText = "UltraFM";
      Radio.track.song.innerText   = "stopped";
      Radio.track.cover[0].style.backgroundImage = 'url(/images/logo-big.png)';
      Radio.track.cover[1].style.backgroundImage = 'url(/images/logo-big.png)';
      Radio.buttons.vk.removeAttribute('href');
      Radio.buttons.lastfm.removeAttribute('href');
      Radio.connAnimation.style.display = 'none';
    } else {
      Radio.connAnimation.style.display = (Radio.Player.currentTime() ? 'none':'block');
      var currentTrack = Radio.Player.currentTrack;
      if (currentTrack) {
        Radio.track.artist.innerText = currentTrack.artist;
        Radio.track.song.innerText   = currentTrack.song;
        Radio.track.cover[0].style.backgroundImage = 'url('+Radio.Player.cover()+')';
        Radio.track.cover[1].style.backgroundImage = 'url('+Radio.Player.cover()+')';
        Radio.buttons.vk.setAttribute('href', currentTrack.links.vk);
        Radio.buttons.lastfm.setAttribute('href', currentTrack.links.lastfm);
      }
    }
  },
  initScrobbleLink: function() {
    var scrobbling = Settings.get('scrobbling');
    var lastfmConf = CONFIG['lastFM'];
    var scrobbleLink = document.querySelector('.scrobbling');
    if (scrobbling['enabled']) {
      scrobbleLink.href = 'http://last.fm/user/'+scrobbling['session']['name'];
      scrobbleLink.innerText = 'Scrobbled as: ' + scrobbling['session']['name'];
    } else {
      scrobbleLink.href = lastfmConf['authUri']+lastfmConf['key'];
      scrobbleLink.innerText = 'Turn on scrobbling?';
    }
  }
};

setTimeout(Radio.init, 0);
