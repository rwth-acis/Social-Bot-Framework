(function(){
  var cnt = 30; // 5 attempts per second => 6 seconds
  var timeout = function(){
    var btn = document.getElementById("oauthPersonalizeButton");
    var wrapper = document.getElementById("oauthPersonalize");
    if(wrapper && wrapper.offsetParent !== null && btn && btn.onclick){
      var win = null;
      var openWindow = window.open;
      window.open = function(){return win = openWindow.apply(window,arguments);};
      btn.onclick.call(btn);
      if(win){
        win.onload = function(){
          win.document.getElementsByTagName("form")[0].submit();
          setTimeout(function(){
            window.location.reload();
            if(win){
              win.close();
            }
          },1500);
        };
      }
    } else {
      if(cnt > 0){
        cnt -= 1;
        setTimeout(timeout,700);
      }
    }
  };
  timeout();
})();
