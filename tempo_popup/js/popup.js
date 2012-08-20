initButtons = function () {
  button_play   = document.getElementsByClassName("play")[0];
  button_stop   = document.getElementsByClassName("stop")[0];
  button_vk     = document.getElementsByClassName("vk")[0];
  button_lastfm = document.getElementsByClassName("lastfm")[0];
  button_github = document.getElementsByClassName("github")[0];

  button_vk.addEventListener('click', function () {
    var self = this;
    self.classList.add('pressed');
    setTimeout(function() {self.classList.remove('pressed'); }, 100);
  });
  button_lastfm.addEventListener('click', pushTheButton(button_lastfm));
  button_github.addEventListener('click', pushTheButton(button_github));

  button_play.addEventListener('click', function() {
    button_play.classList.add('pressed');
  });
  button_stop.addEventListener('click', function() {
    button_stop.classList.add('pressed');
    button_play.classList.remove('pressed');
    setTimeout(function() {button_stop.classList.remove('pressed'); }, 100);
  });
}
pushTheButton = function (self) {
  self.classList.add('pressed');
  setTimeout(function() {self.classList.remove('pressed'); }, 100);
}
window.onload = function () {
  initButtons();
}

