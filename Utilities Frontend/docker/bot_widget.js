requirejs(['jqueryui', 'lodash', 'lib/yjs-sync','promise!Guidancemodel'],
 function ($, _, yjsSync, guidance) {
    $(function () {
        yjsSync().done(function (y, spaceTitle) {
            console.info('DEBUG: Yjs successfully initialized in room ' + spaceTitle + ' with y-user-id: ' + y.db.userId);

            var $submitModel = $("#submit-model"),
                $storeModel = $("#store-model"),
                $loadModel = $("#load-model");
            
            var sbfManagerEndpointInput = document.querySelector("#sbfManagerEndpointInput");
            if (!y.share.sbfManager.toString()) {
                y.share.sbfManager.insert(0, '{SBF_MANAGER}');
            }
            y.share.sbfManager.bindTextarea(sbfManagerEndpointInput);
            
            storeNameInput = document.querySelector("#storeNameInput");
            loadNameInput = document.querySelector("#loadNameInput");
            y.share.storeName.bindTextarea(storeNameInput);
            y.share.loadName.bindTextarea(loadNameInput);

            $submitModel.click(function () {
                var sendStatus = $('#sendStatus');
                var endpoint = y.share.sbfManager.toString();
                var model = y.share.data.get('model');
                sendStatus.text("Sending...");
                
                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    if (xhr.status == 200) {
                        sendStatus.text("Successfully sent.");
                    } else {
                        sendStatus.text("Sending failed.");
                    }
                    cleanStatus('sendStatus');
                }
                
                xhr.open('POST', endpoint + '/bots');
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify(model));
            });

            $storeModel.click(function () {
                var name = y.share.storeName.toString();
                var endpoint = y.share.sbfManager.toString();
                var model = y.share.data.get('model');
                var storeStatus = $('#storeStatus');
                storeStatus.text("Storing...");

                if (name && model) {
                    var xhr = new XMLHttpRequest();
                    xhr.onload = function() {
                        if (xhr.status == 200) {
                            storeStatus.text("Successfully stored.");
                        } else {
                            storeStatus.text("Storing failed.");
                        }
                        cleanStatus('storeStatus');
                    };
                    xhr.open('POST', endpoint + '/models/' + name);
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.send(JSON.stringify(model)); 
                } else {
                    if (!name) {
                        storeStatus.text("Invalid model name.");
                    } else {
                        storeStatus.text("Model is empty.");
                    }
                    cleanStatus('storeStatus');
                    
                }
            });

            $loadModel.click(function () {
                var name = y.share.loadName.toString();
                var endpoint = y.share.sbfManager.toString();
                var loadStatus = $('#loadStatus');
                $(loadStatus).text("Loading...");

                var xhr = new XMLHttpRequest();
                xhr.addEventListener("load", () => {
                    $(loadStatus).text("Successfully loaded.");
                    cleanStatus('loadStatus');
                })
                xhr.addEventListener("error", () => {
                    $(loadStatus).text("Loading failed.");
                    cleanStatus('loadStatus');
                });
                xhr.open('GET', endpoint + '/models/' + name);
                xhr.responseType = 'json';
                xhr.onload = function() {
                    var data = xhr.response;
                    if (data && name) {
                        var initAttributes = function(attrs, map){
                            if(attrs.hasOwnProperty('[attributes]')){
                                var attr = attrs['[attributes]'].list;
                                for(var key in attr){
                                    if(attr.hasOwnProperty(key)){
                                        if(attr[key].hasOwnProperty('key')){
                                            var ytext = map.set(attr[key].key.id, Y.Text);
                                            ytext.insert(0, attr[key].key.value);
                                        }
                                        else { 
                                            var ytext = map.set(attr[key].value.id, Y.Text);
                                            ytext.insert(0, attr[key].value.value);
                                        }
                                    }
                                }
        
                            }else{
                                for(var key in attrs){
                                    if(attrs.hasOwnProperty(key)){
                                        var value = attrs[key].value;
                                        if(!value.hasOwnProperty('option')){
                                            if(value.value instanceof String){
                                                var ytext = map.set(value.id, Y.Text);
                                                ytext.insert(0, value.value);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if(guidance.isGuidanceEditor())
                            y.share.data.set('guidancemodel', data);
                        else
                            y.share.data.set('model', data);
                        for(var key in data.nodes){
                            if (data.nodes.hasOwnProperty(key)) {
                                var entity = data.nodes[key];
                                var map = y.share.nodes.set(key, Y.Map);
                                var attrs = entity.attributes;
                                if(entity.hasOwnProperty('label')){
                                    var ytext = map.set(entity.label.value.id, Y.Text);
                                    ytext.insert(0, entity.label.value.value);
                                }
                                initAttributes(attrs, map);
                            }
                        }
                        for(var key in data.edges){
                            if (data.edges.hasOwnProperty(key)) {
                                var entity = data.edges[key];
                                var map = y.share.edges.set(key, Y.Map);
                                var attrs = entity.attributes;
                                if(entity.hasOwnProperty('label')){
                                    var ytext = map.set(entity.label.value.id, Y.Text);
                                    ytext.insert(0, entity.label.value.value);
                                }
                                initAttributes(attrs, map);
                            }
                        }
                        y.share.canvas.set('ReloadWidgetOperation', 'import');
                    } else {
                        $(loadStatus).text("Loading failed.");
                        cleanStatus('loadStatus');
                    }
                    
                }
                xhr.send(null)
            });

            function cleanStatus(field) {
                setTimeout(_ => {
                  var status = document.querySelector('#' + field);
                  $(status).text("");
                }, 7000);
            }
        });
    });
});