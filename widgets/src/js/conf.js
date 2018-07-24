var conf = {
  external : {
    ROOT : 'http://127.0.0.1:8081/methodselector/',
    ROLE : 'http://127.0.0.1:8073/',
    LAS : 'http://127.0.0.1:9011',
    Y : 'http://127.0.0.1:1234'
  },
  operations : {
    entitySelect : "EntitySelectOperation"
  },
  regex : {
    view : /^position=".*" orientation=".*"( centerOfRotation=".*")?$/,
    tag : /^position=".*" orientation=".*"$/,
    video : /^((https:\/\/)?youtu\.be\/.*)|((https:\/\/)?www\.)?youtube\..*\/watch\?v=.*$/,
    image : /^.*((\.jpg)|(\.png)|(\.gif))$/,
    audio : /^.*((\.mp3)|(\.ogg))$/
  }  
};
