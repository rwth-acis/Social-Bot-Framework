/*
 * Copyright (c) 2015 Advanced Community Information Systems (ACIS) Group, Chair
 * of Computer Science 5 (Databases & Information Systems), RWTH Aachen
 * University, Germany All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * 
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * 
 * Neither the name of the ACIS Group nor the names of its contributors may be
 * used to endorse or promote products derived from this software without
 * specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Instantiates a new Las2peerWidgetLibrary, given its endpoint URL and the
 * IWC-callback function
 */
function Las2peerWidgetLibrary(endpointUrl, iwcCallback, componentName) {
  // care for widget frontends without a microservice backend
  if (endpointUrl === null) {
    endpointUrl = "not specified";
  }
  // care for trailing slash in endpoint URL
  if (endpointUrl.endsWith("/")) {
    this._serviceEndpoint = endpointUrl.substr(0, endpointUrl.length - 1);
  } else {
    this._serviceEndpoint = endpointUrl;
  }
  this.componentName = componentName;
  this.iwcClient = new iwc.Client(componentName);
  this.callback = iwcCallback;
  this.iwcClient.connect(this.callback);
}

/**
 * Sends an AJAX request to a resource.
 * 
 * @override
 * @this {Las2peerWidgetLibrary}
 * @param {string}
 *          method the HTTP method used
 * @param {string}
 *          relativePath the path relative to the client's endpoint URL
 * @param {object}
 *          content the content to be sent in the HTTP request's body
 * @param {string}
 *          mime - the MIME-type of the content
 * @param {string}
 *          customHeaders a JSON string with additional header parameters to be
 *          sent
 * @param {string}
 *          authenticate a boolean, fetches the oidc token from localstorage and
            sends it with the request if true
 * @param {string}
 *          successCallback a callback function invoked in case the request
 *          succeeded. Expects two parameters "data" and "type" where "data"
 *          represents the content of the response and "type" describes the
 *          MIME-type of the response.
 * @param {string}
 *          errorCallback a callback function invoked in case the request
 *          failed. Expects one parameter "error" representing the error
 *          occurred.
 */
Las2peerWidgetLibrary.prototype.sendRequest =
  function(method, relativePath, content, mime, successCallback, errorCallback,
           customHeaders, authenticate) {
  var mtype = "text/plain; charset=UTF-8"
  if (mime !== 'undefined') {
    mtype = mime;
  }

  var rurl = this._serviceEndpoint + "/" + relativePath;

  var ajaxObj = {
    url: rurl,
    type: method.toUpperCase(),
    data: content,
    contentType: mtype,
    crossDomain: true,
    headers: {},
    error: function(xhr, errorType, error) {
      var errorText = error;
      if (xhr.responseText != null && xhr.responseText.trim().length > 0) {
        errorText = xhr.responseText;
      }
      errorCallback(errorText, xhr);
    },
    success: function(data, status, xhr) {
      var type = xhr.getResponseHeader("Content-Type");
      successCallback(data, type);
    },
  };

  if (customHeaders !== undefined && customHeaders !== null) {
    $.extend(ajaxObj.headers, customHeaders);
  }
  if (authenticate === true) {
    console.log("Authenticated request...");
    var tokenHeader = { 'access_token': window.localStorage["access_token"] }
    $.extend(ajaxObj.headers, tokenHeader);
    var endPointHeader = { 'oidc_provider': 'https://accounts.google.com' }
    $.extend(ajaxObj.headers, endPointHeader);
  } else {
    console.log("Anonymous request...");
  }
  $.ajax(ajaxObj);
};

Las2peerWidgetLibrary.prototype.sendIntent = function(action, data, global) {
  if (global == null) {
    global = true;
  }
  var intent = {
    "component": "",
    "data": data,
    "dataType": "text/xml",
    "action": action,
    "categories": ["", ""],
    "flags": [global ? "PUBLISH_GLOBAL" : void 0],
    "extras": {}
  };
  console.log(intent);
  this.iwcClient.publish(intent);
};

// canvas does not react
Las2peerWidgetLibrary.prototype.sendSelectNode = function(id, type) {
  // element creation
  var time = new Date().getTime();
  var data = JSON.stringify({
    selectedEntityId : id,
    selectedEntityType : type});
  var intent = {
    "component": "ATTRIBUTE",
    "data": "",
    "dataType": "",
    "action": "ACTION_DATA",
    "flags": ["PUBLISH_LOCAL"],
    "extras": {"payload":{"data":{"data":data,"type":"EntitySelectOperation"}, "sender":null, "type":"NonOTOperation"}, "time":time},
    "sender": "ATTRIBUTE"
  };
  this.iwcClient.publish(intent);
};

Las2peerWidgetLibrary.prototype.sendAttr = function(node, attr, val) {
  var time = new Date().getTime();
  var valArray = val.split('');
  var arrayLength = valArray.length;
  var payload = [];
  payload.length = arrayLength;
  for (var i = 0; i < arrayLength; i++) {
    var data = {};
    data.name = "val:" + node + "["+attr.toLowerCase()+"]";
    data.position = i;
    data.type = "insert";
    data.value = valArray[i];
    var singlePayload = {};
    
    singlePayload.data = data;
    singlePayload.type = "OTOperation";
    singlePayload.sender = null;
    payload[i] = singlePayload;
  }
  var intent = {
    "component": "MAIN",
    "data": "",
    "dataType": "",
    "action": "ACTION_DATA_ARRAY",
    "flags": ["PUBLISH_LOCAL"],
    "extras": {"payload":payload, "time":time},
    "sender": "3D_VIEWER_WIDGET"
  };
  this.iwcClient.publish(intent);
  intent = {
    "component": "ATTRIBUTE",
    "data": "",
    "dataType": "",
    "action": "ACTION_DATA_ARRAY",
    "flags": ["PUBLISH_LOCAL"],
    "extras": {"payload":payload, "time":time},
    "sender": "3D_VIEWER_WIDGET"
  };
  this.iwcClient.publish(intent);
};

Las2peerWidgetLibrary.prototype.clearAttr = function(node, attr, num) {
  var time = new Date().getTime();
  var payload = [];
  payload.length = num;
  for (var i = 0; i < num; i++) {
    var data = {};
    data.name = "val:" + node + "["+attr.toLowerCase()+"]";
    data.position = 0;
    data.type = "delete";
    var singlePayload = {};
    
    singlePayload.data = data;
    singlePayload.type = "OTOperation";
    singlePayload.sender = null;
    payload[i] = singlePayload;
  }
  var intent = {
    "component": "MAIN",
    "data": "",
    "dataType": "",
    "action": "ACTION_DATA_ARRAY",
    "flags": ["PUBLISH_LOCAL"],
    "extras": {"payload":payload, "time":time},
    "sender": "3D_VIEWER_WIDGET"
  };
  this.iwcClient.publish(intent);
  intent = {
    "component": "ATTRIBUTE",
    "data": "",
    "dataType": "",
    "action": "ACTION_DATA_ARRAY",
    "flags": ["PUBLISH_LOCAL"],
    "extras": {"payload":payload, "time":time},
    "sender": "3D_VIEWER_WIDGET"
  };
  this.iwcClient.publish(intent);
};

/**
 * Convenience function to check if a String ends with a given suffix.
 */
String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
