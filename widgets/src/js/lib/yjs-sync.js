Y({
          db: {
            name: 'memory' // use memory database adapter.
            // name: 'indexeddb' // use indexeddb database adapter instead for offline apps
          },
          connector: {
            //name: 'webrtc', // use webrtc connector
            name: 'websockets-client',
            // name: 'xmpp'
            room: 'SBFModeling', // clients connecting to the same room share data
            url: 'http://127.0.0.1:1234'
          },
          sourceDir: '/bower_components', // location of the y-* modules (browser only)
          share: {
            textarea: 'Text' // y.share.textarea is of type y-text
          }
        }).then(function (y) {
          // The Yjs instance `y` is available
          // y.share.* contains the shared types

          // Bind `y.share.textarea` to `<textarea/>`
          console.log("cool");
          //y.share.textarea.bind(document.querySelector('textarea'))
        })