/* E.g.
  new XHRequest({
    url: 'http://ws.audioscrobbler.com/2.0/?method=auth.getToken&api_key=0b26cafa64819d3b41788dc848ec0926&api_sig=b1a6971cb9020acaa2facb5a2376da91&format=json',
    success: function(data){console.log(data)}
  });
*/

function XHRequest(options) {
  var init = function() {
    if (!options['url'] || options['url'].length < 5) {
      throw new Error("Url for XHRequest can't be empty");
    }
    set('method', 'GET');
    set('async', false);
    set('success', function(){});
    set('error', function(){});
  };
  var set = function(key, reserve) {
    options[key] = options[key] || reserve;
  };
  init();
  var xhr = new XMLHttpRequest();
  xhr.open(options.method, options.url, options.async);

  xhr.onreadystatechange = function() {
    if (xhr.readyState===4 && xhr.status===200) {
      options.success(xhr.response, xhr.responseXML);
    } else {
      options.error(xhr.response);
    }
  };
  xhr.send();
}
