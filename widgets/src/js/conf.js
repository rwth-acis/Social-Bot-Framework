var conf = {
  external : {
    ROOT : 'http://127.0.0.1:8081/methodselector/',
    ROLE : 'http://127.0.0.1:8073/',
    editor : 'storyeditor',
    viewer : 'storyviewer',
    LAS : 'http://127.0.0.1:9011',
    Y : 'http://127.0.0.1:1234'
  },
  general : {
    refresh_timeout : 1000,
    cones_scale_timeout : 200,
    semcheck_timeout : 2000,
    reload_trials : 2
  },
  y : {
    ROOM_EDITOR : '3dst_editor',
    ROOM_VIEWER : '3dst_viewer'
  },
  viewer : {
    CAM_OUTPUT_PRECISION : 3,
    TAG_OUTPUT_PRECISION : 3,
    cones : {
      CONE_COLOR : '0 1 0',
      CONE_COLOR_SELECT : '0 0.4 1',
      CONE_COLOR_LINK : '1 0.4 0',
      CONE_SIZE : 3,
      CONE_SCALE : 30,
      TRANSPARENCY_DEFAULT : 0.3,
      TRANSPARENCY_HIGHLIGHT : 0.1
    }
  },
  intents : {
    story_currentNode : "STORY_CURRNODE",
    syncmeta : "ACTION_DATA"
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
