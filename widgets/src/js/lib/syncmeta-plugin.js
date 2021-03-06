//Copyright 2012, etc.

(function (root, factory) {
    //if (syncmeta_api && typeof syncmeta_api.define === 'function' && syncmeta_api.define.amd) {
        // AMD.
   //     define(['jquery'], factory);
   // } else {
        // Browser globals
        root.syncmeta = factory(root.$, root._);
    //}
}(this, function ($, _) {


var syncmeta_api;(function () { if (!syncmeta_api || !syncmeta_api.requirejs) {
if (!syncmeta_api) { syncmeta_api = {}; } else { require = syncmeta_api; }
/**
 * almond 0.1.2 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice,
        main, req;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {},
            nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part;

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            return true;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, ret, map, i;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name],
                        config: makeConfig(name)
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else if (!defining[depName]) {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                    cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

syncmeta_api.requirejs = requirejs;syncmeta_api.require = require;syncmeta_api.define = define;
}
}());
syncmeta_api.define("../..//tools/almond", function(){});

!function e(t,r,n){function i(s,o){if(!r[s]){if(!t[s]){var u="function"==typeof require&&require;if(!o&&u)return u(s,!0);if(a)return a(s,!0);var c=new Error("Cannot find module '"+s+"'");throw c.code="MODULE_NOT_FOUND",c}var l=r[s]={exports:{}};t[s][0].call(l.exports,function(e){var r=t[s][1][e];return i(r?r:e)},l,l.exports,e,t,r,n)}return r[s].exports}for(var a="function"==typeof require&&require,s=0;s<n.length;s++)i(n[s]);return i}({1:[function(e,t,r){function n(){l&&o&&(l=!1,o.length?c=o.concat(c):d=-1,c.length&&i())}function i(){if(!l){var e=setTimeout(n);l=!0;for(var t=c.length;t;){for(o=c,c=[];++d<t;)o&&o[d].run();d=-1,t=c.length}o=null,l=!1,clearTimeout(e)}}function a(e,t){this.fun=e,this.array=t}function s(){}var o,u=t.exports={},c=[],l=!1,d=-1;u.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];c.push(new a(e,t)),1!==c.length||l||setTimeout(i,0)},a.prototype.run=function(){this.fun.apply(null,this.array)},u.title="browser",u.browser=!0,u.env={},u.argv=[],u.version="",u.versions={},u.on=s,u.addListener=s,u.once=s,u.off=s,u.removeListener=s,u.removeAllListeners=s,u.emit=s,u.binding=function(e){throw new Error("process.binding is not supported")},u.cwd=function(){return"/"},u.chdir=function(e){throw new Error("process.chdir is not supported")},u.umask=function(){return 0}},{}],2:[function(e,t,r){(function(e,r){"use strict";var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e};!function(r){function i(e,t,r,n){var i=Object.create((t||s).prototype),a=new g(n||[]);return i._invoke=f(e,r,a),i}function a(e,t,r){try{return{type:"normal",arg:e.call(t,r)}}catch(n){return{type:"throw",arg:n}}}function s(){}function o(){}function u(){}function c(e){["next","throw","return"].forEach(function(t){e[t]=function(e){return this._invoke(t,e)}})}function l(e){this.arg=e}function d(t){function r(e,n,i,s){var o=a(t[e],t,n);if("throw"!==o.type){var u=o.arg,c=u.value;return c instanceof l?Promise.resolve(c.arg).then(function(e){r("next",e,i,s)},function(e){r("throw",e,i,s)}):Promise.resolve(c).then(function(e){u.value=e,i(u)},s)}s(o.arg)}function i(e,t){function n(){return new Promise(function(n,i){r(e,t,n,i)})}return s=s?s.then(n,n):n()}"object"===("undefined"==typeof e?"undefined":n(e))&&e.domain&&(r=e.domain.bind(r));var s;this._invoke=i}function f(e,t,r){var n=R;return function(i,s){if(n===S)throw new Error("Generator is already running");if(n===T){if("throw"===i)throw s;return y()}for(;;){var o=r.delegate;if(o){if("return"===i||"throw"===i&&o.iterator[i]===v){r.delegate=null;var u=o.iterator["return"];if(u){var c=a(u,o.iterator,s);if("throw"===c.type){i="throw",s=c.arg;continue}}if("return"===i)continue}var c=a(o.iterator[i],o.iterator,s);if("throw"===c.type){r.delegate=null,i="throw",s=c.arg;continue}i="next",s=v;var l=c.arg;if(!l.done)return n=I,l;r[o.resultName]=l.value,r.next=o.nextLoc,r.delegate=null}if("next"===i)r.sent=r._sent=s;else if("throw"===i){if(n===R)throw n=T,s;r.dispatchException(s)&&(i="next",s=v)}else"return"===i&&r.abrupt("return",s);n=S;var c=a(e,t,r);if("normal"===c.type){n=r.done?T:I;var l={value:c.arg,done:r.done};if(c.arg!==C)return l;r.delegate&&"next"===i&&(s=v)}else"throw"===c.type&&(n=T,i="throw",s=c.arg)}}}function h(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function p(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t}function g(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(h,this),this.reset(!0)}function b(e){if(e){var t=e[x];if(t)return t.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var r=-1,n=function i(){for(;++r<e.length;)if(m.call(e,r))return i.value=e[r],i.done=!1,i;return i.value=v,i.done=!0,i};return n.next=n}}return{next:y}}function y(){return{value:v,done:!0}}var v,m=Object.prototype.hasOwnProperty,k="function"==typeof Symbol?Symbol:{},x=k.iterator||"@@iterator",w=k.toStringTag||"@@toStringTag",O="object"===("undefined"==typeof t?"undefined":n(t)),Y=r.regeneratorRuntime;if(Y)return void(O&&(t.exports=Y));Y=r.regeneratorRuntime=O?t.exports:{},Y.wrap=i;var R="suspendedStart",I="suspendedYield",S="executing",T="completed",C={},E=u.prototype=s.prototype;o.prototype=E.constructor=u,u.constructor=o,u[w]=o.displayName="GeneratorFunction",Y.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return t?t===o||"GeneratorFunction"===(t.displayName||t.name):!1},Y.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,u):(e.__proto__=u,w in e||(e[w]="GeneratorFunction")),e.prototype=Object.create(E),e},Y.awrap=function(e){return new l(e)},c(d.prototype),Y.async=function(e,t,r,n){var a=new d(i(e,t,r,n));return Y.isGeneratorFunction(t)?a:a.next().then(function(e){return e.done?e.value:a.next()})},c(E),E[x]=function(){return this},E[w]="Generator",E.toString=function(){return"[object Generator]"},Y.keys=function(e){var t=[];for(var r in e)t.push(r);return t.reverse(),function n(){for(;t.length;){var r=t.pop();if(r in e)return n.value=r,n.done=!1,n}return n.done=!0,n}},Y.values=b,g.prototype={constructor:g,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=v,this.done=!1,this.delegate=null,this.tryEntries.forEach(p),!e)for(var t in this)"t"===t.charAt(0)&&m.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=v)},stop:function(){this.done=!0;var e=this.tryEntries[0],t=e.completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(e){function t(t,n){return a.type="throw",a.arg=e,r.next=t,!!n}if(this.done)throw e;for(var r=this,n=this.tryEntries.length-1;n>=0;--n){var i=this.tryEntries[n],a=i.completion;if("root"===i.tryLoc)return t("end");if(i.tryLoc<=this.prev){var s=m.call(i,"catchLoc"),o=m.call(i,"finallyLoc");if(s&&o){if(this.prev<i.catchLoc)return t(i.catchLoc,!0);if(this.prev<i.finallyLoc)return t(i.finallyLoc)}else if(s){if(this.prev<i.catchLoc)return t(i.catchLoc,!0)}else{if(!o)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return t(i.finallyLoc)}}}},abrupt:function(e,t){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&m.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var i=n;break}}i&&("break"===e||"continue"===e)&&i.tryLoc<=t&&t<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=e,a.arg=t,i?this.next=i.finallyLoc:this.complete(a),C},complete:function(e,t){if("throw"===e.type)throw e.arg;"break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=e.arg,this.next="end"):"normal"===e.type&&t&&(this.next=t)},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var r=this.tryEntries[t];if(r.finallyLoc===e)return this.complete(r.completion,r.afterLoc),p(r),C}},"catch":function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var r=this.tryEntries[t];if(r.tryLoc===e){var n=r.completion;if("throw"===n.type){var i=n.arg;p(r)}return i}}throw new Error("illegal catch attempt")},delegateYield:function(e,t,r){return this.delegate={iterator:b(e),resultName:t,nextLoc:r},C}}}("object"===("undefined"==typeof r?"undefined":n(r))?r:"object"===("undefined"==typeof window?"undefined":n(window))?window:"object"===("undefined"==typeof self?"undefined":n(self))?self:void 0)}).call(this,e("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{_process:1}],3:[function(e,t,r){"use strict";console.warn("The regenerator/runtime module is deprecated; please import regenerator-runtime/runtime instead."),t.exports=e("regenerator-runtime/runtime")},{"regenerator-runtime/runtime":2}],4:[function(e,t,r){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var i=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}();t.exports=function(e){var t=function(){function t(e,r){if(n(this,t),this.y=e,null==r&&(r={}),null==r.role||"master"===r.role)this.role="master";else{if("slave"!==r.role)throw new Error("Role must be either 'master' or 'slave'!");this.role="slave"}this.y.db.forwardAppliedOperations=r.forwardAppliedOperations||!1,this.role=r.role,this.connections={},this.isSynced=!1,this.userEventListeners=[],this.whenSyncedListeners=[],this.currentSyncTarget=null,this.syncingClients=[],this.forwardToSyncingClients=r.forwardToSyncingClients!==!1,this.debug=r.debug===!0,this.broadcastedHB=!1,this.syncStep2=Promise.resolve(),this.broadcastOpBuffer=[],this.protocolVersion=11}return i(t,[{key:"reconnect",value:function(){}},{key:"disconnect",value:function(){return this.connections={},this.isSynced=!1,this.currentSyncTarget=null,this.broadcastedHB=!1,this.syncingClients=[],this.whenSyncedListeners=[],this.y.db.stopGarbageCollector()}},{key:"setUserId",value:function(e){return null==this.userId?(this.userId=e,this.y.db.setUserId(e)):null}},{key:"onUserEvent",value:function(e){this.userEventListeners.push(e)}},{key:"userLeft",value:function(e){if(null!=this.connections[e]){delete this.connections[e],e===this.currentSyncTarget&&(this.currentSyncTarget=null,this.findNextSyncTarget()),this.syncingClients=this.syncingClients.filter(function(t){return t!==e});var t=!0,r=!1,n=void 0;try{for(var i,a=this.userEventListeners[Symbol.iterator]();!(t=(i=a.next()).done);t=!0){var s=i.value;s({action:"userLeft",user:e})}}catch(o){r=!0,n=o}finally{try{!t&&a["return"]&&a["return"]()}finally{if(r)throw n}}}}},{key:"userJoined",value:function(e,t){if(null==t)throw new Error("You must specify the role of the joined user!");if(null!=this.connections[e])throw new Error("This user already joined!");this.connections[e]={isSynced:!1,role:t};var r=!0,n=!1,i=void 0;try{for(var a,s=this.userEventListeners[Symbol.iterator]();!(r=(a=s.next()).done);r=!0){var o=a.value;o({action:"userJoined",user:e,role:t})}}catch(u){n=!0,i=u}finally{try{!r&&s["return"]&&s["return"]()}finally{if(n)throw i}}null==this.currentSyncTarget&&this.findNextSyncTarget()}},{key:"whenSynced",value:function(e){this.isSynced?e():this.whenSyncedListeners.push(e)}},{key:"findNextSyncTarget",value:function(){if(null==this.currentSyncTarget&&!this.isSynced){var e=null;for(var t in this.connections)if(!this.connections[t].isSynced){e=t;break}var r=this;null!=e?(this.currentSyncTarget=e,this.y.db.requestTransaction(regeneratorRuntime.mark(function n(){var t,i;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.delegateYield(this.getStateSet(),"t0",1);case 1:return t=n.t0,n.delegateYield(this.getDeleteSet(),"t1",3);case 3:i=n.t1,r.send(e,{type:"sync step 1",stateSet:t,deleteSet:i,protocolVersion:r.protocolVersion});case 5:case"end":return n.stop()}},n,this)}))):this.y.db.requestTransaction(regeneratorRuntime.mark(function i(){var e,t,n,a,s,o;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return r.isSynced=!0,i.delegateYield(this.garbageCollectAfterSync(),"t0",2);case 2:for(e=!0,t=!1,n=void 0,i.prev=5,a=r.whenSyncedListeners[Symbol.iterator]();!(e=(s=a.next()).done);e=!0)(o=s.value)();i.next=13;break;case 9:i.prev=9,i.t1=i["catch"](5),t=!0,n=i.t1;case 13:i.prev=13,i.prev=14,!e&&a["return"]&&a["return"]();case 16:if(i.prev=16,!t){i.next=19;break}throw n;case 19:return i.finish(16);case 20:return i.finish(13);case 21:r.whenSyncedListeners=[];case 22:case"end":return i.stop()}},i,this,[[5,9,13,21],[14,,16,20]])}))}}},{key:"send",value:function(e,t){this.debug&&console.log("send "+this.userId+" -> "+e+": "+t.type,t)}},{key:"broadcastOps",value:function(t){function r(){n.broadcastOpBuffer.length>0&&(n.broadcast({type:"update",ops:n.broadcastOpBuffer}),n.broadcastOpBuffer=[])}t=t.map(function(t){return e.Struct[t.struct].encode(t)});var n=this;0===this.broadcastOpBuffer.length?(this.broadcastOpBuffer=t,this.y.db.transactionInProgress?this.y.db.whenTransactionsFinished().then(r):setTimeout(r,0)):this.broadcastOpBuffer=this.broadcastOpBuffer.concat(t)}},{key:"receiveMessage",value:function(e,t){var r=this;if(e!==this.userId){if(this.debug&&console.log("receive "+e+" -> "+this.userId+": "+t.type,JSON.parse(JSON.stringify(t))),null!=t.protocolVersion&&t.protocolVersion!==this.protocolVersion)return console.error("You tried to sync with a yjs instance that has a different protocol version\n          (You: "+this.protocolVersion+", Client: "+t.protocolVersion+").\n          The sync was stopped. You need to upgrade your dependencies (especially Yjs & the Connector)!\n          "),void this.send(e,{type:"sync stop",protocolVersion:this.protocolVersion});if("sync step 1"===t.type)!function(){var n=r,i=t;r.y.db.requestTransaction(regeneratorRuntime.mark(function a(){var t,r,s;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.delegateYield(this.getStateSet(),"t0",1);case 1:return t=a.t0,a.delegateYield(this.applyDeleteSet(i.deleteSet),"t1",3);case 3:return a.delegateYield(this.getDeleteSet(),"t2",4);case 4:return r=a.t2,a.delegateYield(this.getOperations(i.stateSet),"t3",6);case 6:s=a.t3,n.send(e,{type:"sync step 2",os:s,stateSet:t,deleteSet:r,protocolVersion:this.protocolVersion}),this.forwardToSyncingClients?(n.syncingClients.push(e),setTimeout(function(){n.syncingClients=n.syncingClients.filter(function(t){return t!==e}),n.send(e,{type:"sync done"})},5e3)):n.send(e,{type:"sync done"}),n._setSyncedWith(e);case 10:case"end":return a.stop()}},a,this)}))}();else if("sync step 2"===t.type){var n,i,a;!function(){var s=r;n=!r.broadcastedHB,r.broadcastedHB=!0,i=r.y.db,a={},a.promise=new Promise(function(e){a.resolve=e}),r.syncStep2=a.promise;var o=t;i.requestTransaction(regeneratorRuntime.mark(function u(){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.delegateYield(this.applyDeleteSet(o.deleteSet),"t0",1);case 1:this.store.apply(o.os),i.requestTransaction(regeneratorRuntime.mark(function r(){var t;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.delegateYield(this.getOperations(o.stateSet),"t0",1);case 1:t=r.t0,t.length>0&&(n?s.broadcastOps(t):s.send(e,{type:"update",ops:t})),a.resolve();case 4:case"end":return r.stop()}},r,this)}));case 3:case"end":return t.stop()}},u,this)}))}()}else if("sync done"===t.type){var s=this;this.syncStep2.then(function(){s._setSyncedWith(e)})}else if("update"===t.type){if(this.forwardToSyncingClients){var o=!0,u=!1,c=void 0;try{for(var l,d=this.syncingClients[Symbol.iterator]();!(o=(l=d.next()).done);o=!0){var f=l.value;this.send(f,t)}}catch(h){u=!0,c=h}finally{try{!o&&d["return"]&&d["return"]()}finally{if(u)throw c}}}if(this.y.db.forwardAppliedOperations){var p=t.ops.filter(function(e){return"Delete"===e.struct});p.length>0&&this.broadcastOps(p)}this.y.db.apply(t.ops)}}}},{key:"_setSyncedWith",value:function(e){var t=this.connections[e];null!=t&&(t.isSynced=!0),e===this.currentSyncTarget&&(this.currentSyncTarget=null,this.findNextSyncTarget())}},{key:"parseMessageFromXml",value:function(e){function t(e){var n=!0,i=!1,a=void 0;try{for(var s,o=e.children[Symbol.iterator]();!(n=(s=o.next()).done);n=!0){var u=s.value;return"true"===u.getAttribute("isArray")?t(u):r(u)}}catch(c){i=!0,a=c}finally{try{!n&&o["return"]&&o["return"]()}finally{if(i)throw a}}}function r(e){var n={};for(var i in e.attrs){var a=e.attrs[i],s=parseInt(a,10);isNaN(s)||""+s!==a?n[i]=a:n[i]=s}for(var o in e.children){var u=o.name;"true"===o.getAttribute("isArray")?n[u]=t(o):n[u]=r(o)}return n}r(e)}},{key:"encodeMessageToXml",value:function(e,t){function r(e,t){for(var i in t){var a=t[i];null==i||(a.constructor===Object?r(e.c(i),a):a.constructor===Array?n(e.c(i),a):e.setAttribute(i,a))}}function n(e,t){e.setAttribute("isArray","true");var i=!0,a=!1,s=void 0;try{for(var o,u=t[Symbol.iterator]();!(i=(o=u.next()).done);i=!0){var c=o.value;c.constructor===Object?r(e.c("array-element"),c):n(e.c("array-element"),c)}}catch(l){a=!0,s=l}finally{try{!i&&u["return"]&&u["return"]()}finally{if(a)throw s}}}if(t.constructor===Object)r(e.c("y",{xmlns:"http://y.ninja/connector-stanza"}),t);else{if(t.constructor!==Array)throw new Error("I can't encode this json!");n(e.c("y",{xmlns:"http://y.ninja/connector-stanza"}),t)}}}]),t}();e.AbstractConnector=t}},{}],5:[function(e,t,r){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var s=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),o=function u(e,t,r){null===e&&(e=Function.prototype);var n=Object.getOwnPropertyDescriptor(e,t);if(void 0===n){var i=Object.getPrototypeOf(e);return null===i?void 0:u(i,t,r)}if("value"in n)return n.value;var a=n.get;return void 0===a?void 0:a.call(r)};t.exports=function(e){var t={users:{},buffers:{},removeUser:function(e){for(var t in this.users)this.users[t].userLeft(e);delete this.users[e],delete this.buffers[e]},addUser:function(e){this.users[e.userId]=e,this.buffers[e.userId]={};for(var t in this.users)if(t!==e.userId){var r=this.users[t];r.userJoined(e.userId,"master"),e.userJoined(r.userId,"master")}},whenTransactionsFinished:function(){var e=[];for(var t in this.users)e.push(this.users[t].y.db.whenTransactionsFinished());return Promise.all(e)},flushOne:function(){var e=[];for(var r in t.buffers){var n=t.buffers[r],i=!1;for(var a in n)if(n[a].length>0){i=!0;break}i&&e.push(r)}if(e.length>0){var s=getRandom(e),o=t.buffers[s],u=getRandom(Object.keys(o)),c=o[u].shift();0===o[u].length&&delete o[u];var l=t.users[s];return l.receiveMessage(c[0],c[1]),l.y.db.whenTransactionsFinished()}return!1},flushAll:function(){return new Promise(function(e){function r(){var n=t.flushOne();if(n){for(;n;)n=t.flushOne();t.whenTransactionsFinished().then(r)}else setTimeout(function(){var n=t.flushOne();n?n.then(function(){t.whenTransactionsFinished().then(r)}):e()},0)}t.whenTransactionsFinished().then(r)})}};e.utils.globalRoom=t;var r=0,u=function(u){function c(e,a){if(n(this,c),void 0===a)throw new Error("Options must not be undefined!");a.role="master",a.forwardToSyncingClients=!1;var s=i(this,Object.getPrototypeOf(c).call(this,e,a));return s.setUserId(r++ +"").then(function(){t.addUser(s)}),s.globalRoom=t,s.syncingClientDuration=0,s}return a(c,u),s(c,[{key:"receiveMessage",value:function(e,t){o(Object.getPrototypeOf(c.prototype),"receiveMessage",this).call(this,e,JSON.parse(JSON.stringify(t)))}},{key:"send",value:function(e,r){var n=t.buffers[e];null!=n&&(null==n[this.userId]&&(n[this.userId]=[]),n[this.userId].push(JSON.parse(JSON.stringify([this.userId,r]))))}},{key:"broadcast",value:function(e){for(var r in t.buffers){var n=t.buffers[r];null==n[this.userId]&&(n[this.userId]=[]),n[this.userId].push(JSON.parse(JSON.stringify([this.userId,e])))}}},{key:"isDisconnected",value:function(){return null==t.users[this.userId]}},{key:"reconnect",value:function(){return this.isDisconnected()&&(t.addUser(this),o(Object.getPrototypeOf(c.prototype),"reconnect",this).call(this)),e.utils.globalRoom.flushAll()}},{key:"disconnect",value:function(){return this.isDisconnected()||(t.removeUser(this.userId),o(Object.getPrototypeOf(c.prototype),"disconnect",this).call(this)),this.y.db.whenTransactionsFinished()}},{key:"flush",value:function(){var e=this;return async(regeneratorRuntime.mark(function r(){var n,i,a;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:for(n=t.buffers[e.userId];Object.keys(n).length>0;)i=getRandom(Object.keys(n)),a=n[i].shift(),0===n[i].length&&delete n[i],this.receiveMessage(a[0],a[1]);return r.next=4,e.whenTransactionsFinished();case 4:case"end":return r.stop()}},r,this)}))}}]),c}(e.AbstractConnector);e.Test=u}},{}],6:[function(e,t,r){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var i=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}();t.exports=function(e){var t=function(){function t(e,r){function i(){return a.whenTransactionsFinished().then(function(){return a.gc1.length>0||a.gc2.length>0?(a.y.isConnected()||console.warn("gc should be empty when disconnected!"),new Promise(function(e){a.requestTransaction(regeneratorRuntime.mark(function t(){var r,n;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(null==a.y.connector||!a.y.connector.isSynced){t.next=10;break}r=0;case 2:if(!(r<a.gc2.length)){t.next=8;break}return n=a.gc2[r],t.delegateYield(this.garbageCollectOperation(n),"t0",5);case 5:r++,t.next=2;break;case 8:a.gc2=a.gc1,a.gc1=[];case 10:a.gcTimeout>0&&(a.gcInterval=setTimeout(i,a.gcTimeout)),e();case 12:case"end":return t.stop()}},t,this)}))})):(a.gcTimeout>0&&(a.gcInterval=setTimeout(i,a.gcTimeout)),Promise.resolve())})}n(this,t),this.y=e;var a=this;this.userId=null;var s;this.userIdPromise=new Promise(function(e){s=e}),this.userIdPromise.resolve=s,this.forwardAppliedOperations=!1,this.listenersById={},this.listenersByIdExecuteNow=[],this.listenersByIdRequestPending=!1,this.initializedTypes={},this.waitingTransactions=[],this.transactionInProgress=!1,this.transactionIsFlushed=!1,"undefined"!=typeof YConcurrency_TestingMode&&(this.executeOrder=[]),this.gc1=[],this.gc2=[],this.gcTimeout=r.gcTimeout?r.gcTimeouts:5e4,this.garbageCollect=i,this.gcTimeout>0&&i()}return i(t,[{key:"queueGarbageCollector",value:function(e){this.y.isConnected()&&this.gc1.push(e)}},{key:"emptyGarbageCollector",value:function(){var e=this;return new Promise(function(t){var r=function n(){e.gc1.length>0||e.gc2.length>0?e.garbageCollect().then(n):t()};setTimeout(r,0)})}},{key:"addToDebug",value:function(){if("undefined"!=typeof YConcurrency_TestingMode){var e=Array.prototype.map.call(arguments,function(e){return"string"==typeof e?e:JSON.stringify(e)}).join("").replace(/"/g,"'").replace(/,/g,", ").replace(/:/g,": ");this.executeOrder.push(e)}}},{key:"getDebugData",value:function(){console.log(this.executeOrder.join("\n"))}},{key:"stopGarbageCollector",value:function(){var e=this;return new Promise(function(t){e.requestTransaction(regeneratorRuntime.mark(function r(){var n,i,a;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:n=e.gc1.concat(e.gc2),e.gc1=[],e.gc2=[],i=0;case 4:if(!(i<n.length)){r.next=13;break}return r.delegateYield(this.getOperation(n[i]),"t0",6);case 6:if(a=r.t0,null==a){r.next=10;break}return delete a.gc,r.delegateYield(this.setOperation(a),"t1",10);case 10:i++,r.next=4;break;case 13:t();case 14:case"end":return r.stop()}},r,this)}))})}},{key:"addToGarbageCollector",value:regeneratorRuntime.mark(function r(e,t){var n;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:if(null!=e.gc||e.deleted!==!0){r.next=15;break}if(n=!1,null==t||t.deleted!==!0){r.next=6;break}n=!0,r.next=10;break;case 6:if(!(null!=e.content&&e.content.length>1)){r.next=10;break}return r.delegateYield(this.getInsertionCleanStart([e.id[0],e.id[1]+1]),"t0",8);case 8:e=r.t0,n=!0;case 10:if(!n){r.next=15;break}return e.gc=!0,r.delegateYield(this.setOperation(e),"t1",13);case 13:return this.store.queueGarbageCollector(e.id),r.abrupt("return",!0);case 15:return r.abrupt("return",!1);case 16:case"end":return r.stop()}},r,this)})},{key:"removeFromGarbageCollector",value:function(t){function r(r){return!e.utils.compareIds(r,t.id)}this.gc1=this.gc1.filter(r),this.gc2=this.gc2.filter(r),delete t.gc}},{key:"destroy",value:regeneratorRuntime.mark(function a(){var e,t;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:clearInterval(this.gcInterval),this.gcInterval=null;for(e in this.initializedTypes)t=this.initializedTypes[e],null!=t._destroy?t._destroy():console.error("The type you included does not provide destroy functionality, it will remain in memory (updating your packages will help).");case 3:case"end":return r.stop()}},a,this)})},{key:"setUserId",value:function(e){if(!this.userIdPromise.inProgress){this.userIdPromise.inProgress=!0;var t=this;t.requestTransaction(regeneratorRuntime.mark(function r(){var n;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return t.userId=e,r.delegateYield(this.getState(e),"t0",2);case 2:n=r.t0,t.opClock=n.clock,t.userIdPromise.resolve(e);case 5:case"end":return r.stop()}},r,this)}))}return this.userIdPromise}},{key:"whenUserIdSet",value:function(e){this.userIdPromise.then(e)}},{key:"getNextOpId",value:function(e){if(null==e)throw new Error("getNextOpId expects the number of created ids to create!");if(null==this.userId)throw new Error("OperationStore not yet initialized!");var t=[this.userId,this.opClock];return this.opClock+=e,t}},{key:"apply",value:function(t){for(var r=0;r<t.length;r++){var n=t[r];if(null==n.id||n.id[0]!==this.y.connector.userId){var i=e.Struct[n.struct].requiredOps(n);null!=n.requires&&(i=i.concat(n.requires)),this.whenOperationsExist(i,n)}}}},{key:"whenOperationsExist",value:function(e,t){if(e.length>0)for(var r={op:t,missing:e.length},n=0;n<e.length;n++){var i=e[n],a=JSON.stringify(i),s=this.listenersById[a];null==s&&(s=[],this.listenersById[a]=s),s.push(r)}else this.listenersByIdExecuteNow.push({op:t});if(!this.listenersByIdRequestPending){this.listenersByIdRequestPending=!0;var o=this;this.requestTransaction(regeneratorRuntime.mark(function u(){var e,t,r,n,i,a,s,c,l,d,f;return regeneratorRuntime.wrap(function(u){for(;;)switch(u.prev=u.next){case 0:e=o.listenersByIdExecuteNow,o.listenersByIdExecuteNow=[],t=o.listenersById,o.listenersById={},o.listenersByIdRequestPending=!1,r=0;case 6:if(!(r<e.length)){u.next=12;break}return n=e[r].op,u.delegateYield(o.tryExecute.call(this,n),"t0",9);case 9:r++,u.next=6;break;case 12:u.t1=regeneratorRuntime.keys(t);case 13:if((u.t2=u.t1()).done){u.next=39;break}if(i=u.t2.value,a=t[i],s=JSON.parse(i),"string"!=typeof s[1]){u.next=22;break}return u.delegateYield(this.getOperation(s),"t3",19);case 19:c=u.t3,u.next=24;break;case 22:return u.delegateYield(this.getInsertion(s),"t4",23);case 23:c=u.t4;case 24:if(null!=c){u.next=28;break}o.listenersById[i]=a,u.next=37;break;case 28:l=0;case 29:if(!(l<a.length)){u.next=37;break}if(d=a[l],f=d.op,0!==--d.missing){u.next=34;break}return u.delegateYield(o.tryExecute.call(this,f),"t5",34);case 34:l++,u.next=29;break;case 37:u.next=13;break;case 39:case"end":return u.stop()}},u,this)}))}}},{key:"tryExecute",value:regeneratorRuntime.mark(function s(t){var r,n,i;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(this.store.addToDebug("yield* this.store.tryExecute.call(this, ",JSON.stringify(t),")"),"Delete"!==t.struct){a.next=5;break}return a.delegateYield(e.Struct.Delete.execute.call(this,t),"t0",3);case 3:a.next=29;break;case 5:return a.delegateYield(this.getInsertion(t.id),"t1",6);case 6:r=a.t1;case 7:if(null==r||null==r.content){a.next=21;break}if(!(r.id[1]+r.content.length<t.id[1]+t.content.length)){a.next=18;break}return n=r.content.length-(t.id[1]-r.id[1]),t.content.splice(0,n),t.id=[t.id[0],t.id[1]+n],t.left=e.utils.getLastId(r),t.origin=t.left,a.delegateYield(this.getOperation(t.id),"t2",15);case 15:r=a.t2,a.next=19;break;case 18:return a.abrupt("break",21);case 19:a.next=7;break;case 21:if(null!=r){a.next=29;break}return a.delegateYield(this.isGarbageCollected(t.id),"t3",23);case 23:if(i=a.t3){a.next=29;break}return a.delegateYield(e.Struct[t.struct].execute.call(this,t),"t4",26);case 26:return a.delegateYield(this.addOperation(t),"t5",27);case 27:return a.delegateYield(this.store.operationAdded(this,t),"t6",28);case 28:return a.delegateYield(this.tryCombineWithLeft(t),"t7",29);case 29:case"end":return a.stop()}},s,this)})},{key:"operationAdded",value:regeneratorRuntime.mark(function o(t,r){var n,i,a,s,u,c,l,d,f,h,p,g,b,y,v,m,k;return regeneratorRuntime.wrap(function(o){for(;;)switch(o.prev=o.next){case 0:if("Delete"!==r.struct){o.next=8;break}return o.delegateYield(t.getInsertion(r.target),"t0",2);case 2:if(n=o.t0,i=this.initializedTypes[JSON.stringify(n.parent)],null==i){o.next=6;break}return o.delegateYield(i._changed(t,r),"t1",6);case 6:o.next=35;break;case 8:return o.delegateYield(t.updateState(r.id[0]),"t2",9);case 9:for(a=null!=r.content?r.content.length:1,s=0;a>s;s++)if(u=JSON.stringify([r.id[0],r.id[1]+s]),c=this.listenersById[u],delete this.listenersById[u],null!=c)for(l in c)d=c[l],0===--d.missing&&this.whenOperationsExist([],d.op);if(f=this.initializedTypes[JSON.stringify(r.parent)],null==r.parent){o.next=18;break}return o.delegateYield(t.isDeleted(r.parent),"t3",14);case 14:if(h=o.t3,!h){o.next=18;break}return o.delegateYield(t.deleteList(r.id),"t4",17);case 17:return o.abrupt("return");case 18:if(null==f){o.next=21;break}return p=e.utils.copyOperation(r),o.delegateYield(f._changed(t,p),"t5",21);case 21:if(r.deleted){o.next=35;break}g=null!=r.content?r.content.length:1,b=r.id,y=0;case 25:if(!(g>y)){o.next=35;break}return v=[b[0],b[1]+y],o.delegateYield(t.isDeleted(v),"t6",28);case 28:if(m=o.t6,!m){o.next=32;break}return k={struct:"Delete",target:v},o.delegateYield(this.tryExecute.call(t,k),"t7",32);case 32:y++,o.next=25;break;case 35:case"end":return o.stop()}},o,this)})},{key:"whenTransactionsFinished",value:function(){if(this.transactionInProgress){if(null==this.transactionsFinished){var e,t=new Promise(function(t){e=t});return this.transactionsFinished={resolve:e,promise:t},t}return this.transactionsFinished.promise}return Promise.resolve()}},{key:"getNextRequest",value:function(){return 0===this.waitingTransactions.length?this.transactionIsFlushed?(this.transactionInProgress=!1,this.transactionIsFlushed=!1,null!=this.transactionsFinished&&(this.transactionsFinished.resolve(),this.transactionsFinished=null),null):(this.transactionIsFlushed=!0,regeneratorRuntime.mark(function e(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.delegateYield(this.flush(),"t0",1);case 1:case"end":return e.stop()}},e,this)})):(this.transactionIsFlushed=!1,this.waitingTransactions.shift())}},{key:"requestTransaction",value:function(e,t){var r=this;this.waitingTransactions.push(e),this.transactionInProgress||(this.transactionInProgress=!0,setTimeout(function(){r.transact(r.getNextRequest())},0))}}]),t}();e.AbstractDatabase=t}},{}],7:[function(e,t,r){"use strict";t.exports=function(e){var t={Delete:{encode:function(e){return e},requiredOps:function(e){return[]},execute:regeneratorRuntime.mark(function r(e){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.delegateYield(this.deleteOperation(e.target,e.length||1),"t0",1);case 1:return t.abrupt("return",t.t0);case 2:case"end":return t.stop()}},r,this)})},Insert:{encode:function(e){var t={id:e.id,left:e.left,right:e.right,origin:e.origin,parent:e.parent,struct:e.struct};return null!=e.parentSub&&(t.parentSub=e.parentSub),e.hasOwnProperty("opContent")?t.opContent=e.opContent:t.content=e.content.slice(),t},requiredOps:function(t){var r=[];return null!=t.left&&r.push(t.left),null!=t.right&&r.push(t.right),
null==t.origin||e.utils.compareIds(t.left,t.origin)||r.push(t.origin),r.push(t.parent),null!=t.opContent&&r.push(t.opContent),r},getDistanceToOrigin:regeneratorRuntime.mark(function n(t){var r,i;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:if(null!=t.left){n.next=4;break}return n.abrupt("return",0);case 4:return r=0,n.delegateYield(this.getInsertion(t.left),"t0",6);case 6:i=n.t0;case 7:if(e.utils.matchesId(i,t.origin)){n.next=17;break}if(r++,null!=i.left){n.next=13;break}return n.abrupt("break",17);case 13:return n.delegateYield(this.getInsertion(i.left),"t1",14);case 14:i=n.t1;case 15:n.next=7;break;case 17:return n.abrupt("return",r);case 18:case"end":return n.stop()}},n,this)}),execute:regeneratorRuntime.mark(function i(r){var n,a,s,o,u,c,l,d,f,h,p,g,b;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:if(a=[],null==r.origin){i.next=8;break}return i.delegateYield(this.getInsertionCleanEnd(r.origin),"t0",3);case 3:return s=i.t0,null==s.originOf&&(s.originOf=[]),s.originOf.push(r.id),i.delegateYield(this.setOperation(s),"t1",7);case 7:null!=s.right&&a.push(s.right);case 8:return i.delegateYield(t.Insert.getDistanceToOrigin.call(this,r),"t2",9);case 9:if(o=n=i.t2,null==r.left){i.next=23;break}return i.delegateYield(this.getInsertionCleanEnd(r.left),"t3",12);case 12:if(u=i.t3,e.utils.compareIds(r.left,r.origin)||null==u.right||a.push(u.right),null!=u.right){i.next=18;break}i.t4=null,i.next=20;break;case 18:return i.delegateYield(this.getOperation(u.right),"t5",19);case 19:i.t4=i.t5;case 20:u=i.t4,i.next=34;break;case 23:return i.delegateYield(this.getOperation(r.parent),"t6",24);case 24:if(c=i.t6,d=r.parentSub?c.map[r.parentSub]:c.start,null!=d){i.next=30;break}i.t7=null,i.next=32;break;case 30:return i.delegateYield(this.getOperation(d),"t8",31);case 31:i.t7=i.t8;case 32:l=i.t7,u=l;case 34:if(null==r.right){i.next=37;break}return a.push(r.right),i.delegateYield(this.getInsertionCleanStart(r.right),"t9",37);case 37:if(null==u||e.utils.compareIds(u.id,r.right)){i.next=59;break}return i.delegateYield(t.Insert.getDistanceToOrigin.call(this,u),"t10",40);case 40:if(f=i.t10,f!==n){i.next=45;break}u.id[0]<r.id[0]&&(r.left=e.utils.getLastId(u),o=n+1),i.next=50;break;case 45:if(!(n>f)){i.next=49;break}f>=n-o&&(r.left=e.utils.getLastId(u),o=n+1),i.next=50;break;case 49:return i.abrupt("break",62);case 50:if(n++,null==u.right){i.next=56;break}return i.delegateYield(this.getInsertion(u.right),"t11",53);case 53:u=i.t11,i.next=57;break;case 56:u=null;case 57:i.next=60;break;case 59:return i.abrupt("break",62);case 60:i.next=37;break;case 62:if(h=null,p=null,null!=c){i.next=67;break}return i.delegateYield(this.getOperation(r.parent),"t12",66);case 66:c=i.t12;case 67:if(null==r.left){i.next=75;break}return i.delegateYield(this.getInsertion(r.left),"t13",69);case 69:return h=i.t13,r.right=h.right,h.right=r.id,i.delegateYield(this.setOperation(h),"t14",73);case 73:i.next=76;break;case 75:r.right=r.parentSub?c.map[r.parentSub]||null:c.start;case 76:if(null==r.right){i.next=86;break}return i.delegateYield(this.getOperation(r.right),"t15",78);case 78:if(p=i.t15,p.left=e.utils.getLastId(r),null==p.gc){i.next=85;break}if(!(null!=p.content&&p.content.length>1)){i.next=84;break}return i.delegateYield(this.getInsertionCleanEnd(p.id),"t16",83);case 83:p=i.t16;case 84:this.store.removeFromGarbageCollector(p);case 85:return i.delegateYield(this.setOperation(p),"t17",86);case 86:if(null==r.parentSub){i.next=96;break}if(null!=h){i.next=90;break}return c.map[r.parentSub]=r.id,i.delegateYield(this.setOperation(c),"t18",90);case 90:if(null==r.right){i.next=92;break}return i.delegateYield(this.deleteOperation(r.right,1,!0),"t19",92);case 92:if(null==r.left){i.next=94;break}return i.delegateYield(this.deleteOperation(r.id,1,!0),"t20",94);case 94:i.next=100;break;case 96:if(null!=p&&null!=h){i.next=100;break}return null==p&&(c.end=e.utils.getLastId(r)),null==h&&(c.start=r.id),i.delegateYield(this.setOperation(c),"t21",100);case 100:g=0;case 101:if(!(g<a.length)){i.next=108;break}return i.delegateYield(this.getOperation(a[g]),"t22",103);case 103:return b=i.t22,i.delegateYield(this.tryCombineWithLeft(b),"t23",105);case 105:g++,i.next=101;break;case 108:case"end":return i.stop()}},i,this)})},List:{create:function(e){return{start:null,end:null,struct:"List",id:e}},encode:function(e){var t={struct:"List",id:e.id,type:e.type};return null!=e.requires&&(t.requires=e.requires),null!=e.info&&(t.info=e.info),t},requiredOps:function(){return[]},execute:regeneratorRuntime.mark(function a(e){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:e.start=null,e.end=null;case 2:case"end":return t.stop()}},a,this)}),ref:regeneratorRuntime.mark(function s(e,t){var r,n;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:if(null!=e.start){i.next=2;break}return i.abrupt("return",null);case 2:return r=null,i.delegateYield(this.getOperation(e.start),"t0",4);case 4:n=i.t0;case 5:if(n.deleted||(r=n,t--),!(t>=0&&null!=n.right)){i.next=12;break}return i.delegateYield(this.getOperation(n.right),"t1",9);case 9:n=i.t1,i.next=13;break;case 12:return i.abrupt("break",15);case 13:i.next=5;break;case 15:return i.abrupt("return",r);case 16:case"end":return i.stop()}},s,this)}),map:regeneratorRuntime.mark(function o(e,t){var r,n;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:e=e.start,r=[];case 2:if(null==e){i.next=9;break}return i.delegateYield(this.getOperation(e),"t0",4);case 4:n=i.t0,n.deleted||r.push(t(n)),e=n.right,i.next=2;break;case 9:return i.abrupt("return",r);case 10:case"end":return i.stop()}},o,this)})},Map:{create:function(e){return{id:e,map:{},struct:"Map"}},encode:function(e){var t={struct:"Map",type:e.type,id:e.id,map:{}};return null!=e.requires&&(t.requires=e.requires),null!=e.info&&(t.info=e.info),t},requiredOps:function(){return[]},execute:regeneratorRuntime.mark(function u(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:case"end":return e.stop()}},u,this)}),get:regeneratorRuntime.mark(function c(e,t){var r,n;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:if(r=e.map[t],null==r){i.next=14;break}return i.delegateYield(this.getOperation(r),"t0",3);case 3:if(n=i.t0,null!=n&&!n.deleted){i.next=8;break}return i.abrupt("return",void 0);case 8:if(null!=n.opContent){i.next=12;break}return i.abrupt("return",n.content[0]);case 12:return i.delegateYield(this.getType(n.opContent),"t1",13);case 13:return i.abrupt("return",i.t1);case 14:case"end":return i.stop()}},c,this)})}};e.Struct=t}},{}],8:[function(e,t,r){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var i=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}();t.exports=function(e){var t=function(){function t(){n(this,t)}return i(t,[{key:"getType",value:regeneratorRuntime.mark(function r(t,n){var i,a,s;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:if(i=JSON.stringify(t),a=this.store.initializedTypes[i],null!=a){r.next=9;break}return r.delegateYield(this.getOperation(t),"t0",4);case 4:if(s=r.t0,null==s){r.next=9;break}return r.delegateYield(e[s.type].typeDefinition.initType.call(this,this.store,s,n),"t1",7);case 7:a=r.t1,this.store.initializedTypes[i]=a;case 9:return r.abrupt("return",a);case 10:case"end":return r.stop()}},r,this)})},{key:"createType",value:regeneratorRuntime.mark(function a(t,r){var n,i;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(n=t[0].struct,r=r||this.store.getNextOpId(1),"_"!==r[0]){a.next=7;break}return a.delegateYield(this.getOperation(r),"t0",4);case 4:i=a.t0,a.next=9;break;case 7:i=e.Struct[n].create(r),i.type=t[0].name;case 9:if(null==t[0].appendAdditionalInfo){a.next=11;break}return a.delegateYield(t[0].appendAdditionalInfo.call(this,i,t[1]),"t1",11);case 11:if("_"!==i[0]){a.next=15;break}return a.delegateYield(this.setOperation(i),"t2",13);case 13:a.next=16;break;case 15:return a.delegateYield(this.applyCreatedOperations([i]),"t3",16);case 16:return a.delegateYield(this.getType(r,t[1]),"t4",17);case 17:return a.abrupt("return",a.t4);case 18:case"end":return a.stop()}},a,this)})},{key:"applyCreatedOperations",value:regeneratorRuntime.mark(function s(t){var r,n,i;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:r=[],n=0;case 2:if(!(n<t.length)){a.next=9;break}return i=t[n],a.delegateYield(this.store.tryExecute.call(this,i),"t0",5);case 5:(null==i.id||"string"!=typeof i.id[1])&&r.push(e.Struct[i.struct].encode(i));case 6:n++,a.next=2;break;case 9:!this.store.y.connector.isDisconnected()&&r.length>0&&this.store.y.connector.broadcastOps(r);case 10:case"end":return a.stop()}},s,this)})},{key:"deleteList",value:regeneratorRuntime.mark(function o(e){var t;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:if(null==e){r.next=15;break}return r.delegateYield(this.getOperation(e),"t0",2);case 2:if(e=r.t0,e.gc){r.next=12;break}return e.gc=!0,e.deleted=!0,r.delegateYield(this.setOperation(e),"t1",7);case 7:return t=null!=e.content?e.content.length:1,r.delegateYield(this.markDeleted(e.id,t),"t2",9);case 9:if(null==e.opContent){r.next=11;break}return r.delegateYield(this.deleteOperation(e.opContent),"t3",11);case 11:this.store.queueGarbageCollector(e.id);case 12:e=e.right,r.next=0;break;case 15:case"end":return r.stop()}},o,this)})},{key:"deleteOperation",value:regeneratorRuntime.mark(function u(e,t,r){var n,i,a,s,o,c,l;return regeneratorRuntime.wrap(function(u){for(;;)switch(u.prev=u.next){case 0:return null==t&&(t=1),u.delegateYield(this.markDeleted(e,t),"t0",2);case 2:if(!(t>0)){u.next=64;break}return n=!1,u.delegateYield(this.os.findWithUpperBound([e[0],e[1]+t-1]),"t1",5);case 5:if(i=u.t1,a=null!=i&&null!=i.content?i.content.length:1,!(null==i||i.id[0]!==e[0]||i.id[1]+a<=e[1])){u.next=12;break}i=null,t=0,u.next=22;break;case 12:if(i.deleted){u.next=21;break}if(!(i.id[1]<e[1])){u.next=17;break}return u.delegateYield(this.getInsertionCleanStart(e),"t2",15);case 15:i=u.t2,a=i.content.length;case 17:if(!(i.id[1]+a>e[1]+t)){u.next=21;break}return u.delegateYield(this.getInsertionCleanEnd([e[0],e[1]+t-1]),"t3",19);case 19:i=u.t3,a=i.content.length;case 21:t=i.id[1]-e[1];case 22:if(null==i){u.next=62;break}if(i.deleted){u.next=44;break}if(n=!0,i.deleted=!0,null==i.start){u.next=28;break}return u.delegateYield(this.deleteList(i.start),"t4",28);case 28:if(null==i.map){u.next=35;break}u.t5=regeneratorRuntime.keys(i.map);case 30:if((u.t6=u.t5()).done){u.next=35;break}return s=u.t6.value,u.delegateYield(this.deleteList(i.map[s]),"t7",33);case 33:u.next=30;break;case 35:if(null==i.opContent){u.next=37;break}return u.delegateYield(this.deleteOperation(i.opContent),"t8",37);case 37:if(null==i.requires){u.next=44;break}o=0;case 39:if(!(o<i.requires.length)){u.next=44;break}return u.delegateYield(this.deleteOperation(i.requires[o]),"t9",41);case 41:o++,u.next=39;break;case 44:if(null==i.left){u.next=49;break}return u.delegateYield(this.getInsertion(i.left),"t10",46);case 46:c=u.t10,u.next=50;break;case 49:c=null;case 50:return u.delegateYield(this.setOperation(i),"t11",51);case 51:if(null==i.right){u.next=56;break}return u.delegateYield(this.getOperation(i.right),"t12",53);case 53:l=u.t12,u.next=57;break;case 56:l=null;case 57:if(!n||r){u.next=59;break}return u.delegateYield(this.store.operationAdded(this,{struct:"Delete",target:i.id,length:a}),"t13",59);case 59:return u.delegateYield(this.store.addToGarbageCollector.call(this,i,c),"t14",60);case 60:if(null==l){u.next=62;break}return u.delegateYield(this.store.addToGarbageCollector.call(this,l,i),"t15",62);case 62:u.next=2;break;case 64:case"end":return u.stop()}},u,this)})},{key:"markGarbageCollected",value:regeneratorRuntime.mark(function c(t,r){var n,i,a,s;return regeneratorRuntime.wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return this.store.addToDebug("yield* this.markGarbageCollected(",t,", ",r,")"),o.delegateYield(this.markDeleted(t,r),"t0",2);case 2:if(n=o.t0,!(n.id[1]<t[1])||n.gc){o.next=9;break}return i=n.len-(t[1]-n.id[1]),n.len-=i,o.delegateYield(this.ds.put(n),"t1",7);case 7:return n={id:t,len:i,gc:!1},o.delegateYield(this.ds.put(n),"t2",9);case 9:return o.delegateYield(this.ds.findPrev(t),"t3",10);case 10:return a=o.t3,o.delegateYield(this.ds.findNext(t),"t4",12);case 12:if(s=o.t4,!(t[1]+r<n.id[1]+n.len)||n.gc){o.next=16;break}return o.delegateYield(this.ds.put({id:[t[0],t[1]+r],len:n.len-r,gc:!1}),"t5",15);case 15:n.len=r;case 16:if(n.gc=!0,null==a||!a.gc||!e.utils.compareIds([a.id[0],a.id[1]+a.len],n.id)){o.next=21;break}return a.len+=n.len,o.delegateYield(this.ds["delete"](n.id),"t6",20);case 20:n=a;case 21:if(null==s||!s.gc||!e.utils.compareIds([n.id[0],n.id[1]+n.len],s.id)){o.next=24;break}return n.len+=s.len,o.delegateYield(this.ds["delete"](s.id),"t7",24);case 24:return o.delegateYield(this.ds.put(n),"t8",25);case 25:return o.delegateYield(this.updateState(n.id[0]),"t9",26);case 26:case"end":return o.stop()}},c,this)})},{key:"markDeleted",value:regeneratorRuntime.mark(function l(e,t){var r,n,i,a;return regeneratorRuntime.wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return null==t&&(t=1),s.delegateYield(this.ds.findWithUpperBound(e),"t0",2);case 2:if(r=s.t0,null==r||r.id[0]!==e[0]){s.next=27;break}if(!(r.id[1]<=e[1]&&e[1]<=r.id[1]+r.len)){s.next=23;break}if(n=e[1]+t-(r.id[1]+r.len),!(n>0)){s.next=20;break}if(r.gc){s.next=11;break}r.len+=n,s.next=18;break;case 11:if(n=r.id[1]+r.len-e[1],!(t>n)){s.next=17;break}return r={id:[e[0],e[1]+n],len:t-n,gc:!1},s.delegateYield(this.ds.put(r),"t1",15);case 15:s.next=18;break;case 17:throw new Error("Cannot happen! (it dit though.. :()");case 18:s.next=21;break;case 20:return s.abrupt("return",r);case 21:s.next=25;break;case 23:return r={id:e,len:t,gc:!1},s.delegateYield(this.ds.put(r),"t2",25);case 25:s.next=29;break;case 27:return r={id:e,len:t,gc:!1},s.delegateYield(this.ds.put(r),"t3",29);case 29:return s.delegateYield(this.ds.findNext(r.id),"t4",30);case 30:if(i=s.t4,!(null!=i&&r.id[0]===i.id[0]&&r.id[1]+r.len>=i.id[1])){s.next=61;break}n=r.id[1]+r.len-i.id[1];case 33:if(!(n>=0)){s.next=61;break}if(!i.gc){s.next=44;break}if(r.len-=n,!(n>=i.len)){s.next=41;break}if(n-=i.len,!(n>0)){s.next=41;break}return s.delegateYield(this.ds.put(r),"t5",40);case 40:return s.delegateYield(this.markDeleted([i.id[0],i.id[1]+i.len],n),"t6",41);case 41:return s.abrupt("break",61);case 44:if(!(n>i.len)){s.next=56;break}return s.delegateYield(this.ds.findNext(i.id),"t7",46);case 46:return a=s.t7,s.delegateYield(this.ds["delete"](i.id),"t8",48);case 48:if(null!=a&&r.id[0]===a.id[0]){s.next=52;break}return s.abrupt("break",61);case 52:i=a,n=r.id[1]+r.len-i.id[1];case 54:s.next=59;break;case 56:return r.len+=i.len-n,s.delegateYield(this.ds["delete"](i.id),"t9",58);case 58:return s.abrupt("break",61);case 59:s.next=33;break;case 61:return s.delegateYield(this.ds.put(r),"t10",62);case 62:return s.abrupt("return",r);case 63:case"end":return s.stop()}},l,this)})},{key:"garbageCollectAfterSync",value:regeneratorRuntime.mark(function d(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return(this.store.gc1.length>0||this.store.gc2.length>0)&&console.warn("gc should be empty after sync"),e.delegateYield(this.os.iterate(this,null,null,regeneratorRuntime.mark(function t(e){var r,n,i;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(!e.gc){t.next=3;break}return delete e.gc,t.delegateYield(this.setOperation(e),"t0",3);case 3:if(null==e.parent){t.next=23;break}return t.delegateYield(this.isDeleted(e.parent),"t1",5);case 5:if(r=t.t1,!r){t.next=23;break}if(e.gc=!0,e.deleted){t.next=20;break}return t.delegateYield(this.markDeleted(e.id,null!=e.content?e.content.length:1),"t2",10);case 10:if(e.deleted=!0,null==e.opContent){t.next=13;break}return t.delegateYield(this.deleteOperation(e.opContent),"t3",13);case 13:if(null==e.requires){t.next=20;break}n=0;case 15:if(!(n<e.requires.length)){t.next=20;break}return t.delegateYield(this.deleteOperation(e.requires[n]),"t4",17);case 17:n++,t.next=15;break;case 20:return t.delegateYield(this.setOperation(e),"t5",21);case 21:return this.store.gc1.push(e.id),t.abrupt("return");case 23:if(!e.deleted){t.next=29;break}if(i=null,null==e.left){t.next=28;break}return t.delegateYield(this.getInsertion(e.left),"t6",27);case 27:i=t.t6;case 28:return t.delegateYield(this.store.addToGarbageCollector.call(this,e,i),"t7",29);case 29:case"end":return t.stop()}},t,this)})),"t0",2);case 2:case"end":return e.stop()}},d,this)})},{key:"garbageCollectOperation",value:regeneratorRuntime.mark(function f(t){var r,n,i,a,s,o,u,c,l,d,h,p,g;return regeneratorRuntime.wrap(function(f){for(;;)switch(f.prev=f.next){case 0:return this.store.addToDebug("yield* this.garbageCollectOperation(",t,")"),f.delegateYield(this.getOperation(t),"t0",2);case 2:return r=f.t0,f.delegateYield(this.markGarbageCollected(t,null!=r&&null!=r.content?r.content.length:1),"t1",4);case 4:if(null==r){f.next=76;break}n=[],null!=r.opContent&&n.push(r.opContent),null!=r.requires&&(n=n.concat(r.requires)),i=0;case 9:if(!(i<n.length)){f.next=26;break}return f.delegateYield(this.getOperation(n[i]),"t2",11);case 11:if(a=f.t2,null==a){f.next=22;break}if(a.deleted){f.next=17;break}return f.delegateYield(this.deleteOperation(a.id),"t3",15);case 15:return f.delegateYield(this.getOperation(a.id),"t4",16);case 16:a=f.t4;case 17:return a.gc=!0,f.delegateYield(this.setOperation(a),"t5",19);case 19:this.store.queueGarbageCollector(a.id),f.next=23;break;case 22:return f.delegateYield(this.markGarbageCollected(n[i],1),"t6",23);case 23:i++,f.next=9;break;case 26:if(null==r.left){f.next=31;break}return f.delegateYield(this.getInsertion(r.left),"t7",28);case 28:return s=f.t7,s.right=r.right,f.delegateYield(this.setOperation(s),"t8",31);case 31:if(null==r.right){f.next=62;break}return f.delegateYield(this.getOperation(r.right),"t9",33);case 33:if(o=f.t9,o.left=r.left,!(null!=r.originOf&&r.originOf.length>0)){f.next=61;break}u=r.left,c=null;case 38:if(null==u){f.next=46;break}return f.delegateYield(this.getInsertion(u),"t10",40);case 40:if(c=f.t10,!c.deleted){f.next=43;break}return f.abrupt("break",46);case 43:u=c.left,f.next=38;break;case 46:f.t11=regeneratorRuntime.keys(r.originOf);case 47:if((f.t12=f.t11()).done){f.next=56;break}return l=f.t12.value,f.delegateYield(this.getOperation(r.originOf[l]),"t13",50);case 50:if(d=f.t13,null==d){f.next=54;break}return d.origin=u,f.delegateYield(this.setOperation(d),"t14",54);case 54:f.next=47;break;case 56:if(null==u){f.next=59;break}return null==c.originOf?c.originOf=r.originOf:c.originOf=r.originOf.concat(c.originOf),f.delegateYield(this.setOperation(c),"t15",59);case 59:f.next=62;break;case 61:return f.delegateYield(this.setOperation(o),"t16",62);case 62:if(null==r.origin){f.next=67;break}return f.delegateYield(this.getInsertion(r.origin),"t17",64);case 64:return h=f.t17,h.originOf=h.originOf.filter(function(r){return!e.utils.compareIds(t,r)}),f.delegateYield(this.setOperation(h),"t18",67);case 67:if(null==r.parent){f.next=70;break}return f.delegateYield(this.getOperation(r.parent),"t19",69);case 69:p=f.t19;case 70:if(null==p){f.next=75;break}if(g=!1,null!=r.parentSub?e.utils.compareIds(p.map[r.parentSub],r.id)&&(g=!0,null!=r.right?p.map[r.parentSub]=r.right:delete p.map[r.parentSub]):(e.utils.compareIds(p.start,r.id)&&(g=!0,p.start=r.right),e.utils.matchesId(r,p.end)&&(g=!0,p.end=r.left)),!g){f.next=75;break}return f.delegateYield(this.setOperation(p),"t20",75);case 75:return f.delegateYield(this.removeOperation(r.id),"t21",76);case 76:case"end":return f.stop()}},f,this)})},{key:"checkDeleteStoreForState",value:regeneratorRuntime.mark(function h(e){var t;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.delegateYield(this.ds.findWithUpperBound([e.user,e.clock]),"t0",1);case 1:t=r.t0,null!=t&&t.id[0]===e.user&&t.gc&&(e.clock=Math.max(e.clock,t.id[1]+t.len));case 3:case"end":return r.stop()}},h,this)})},{key:"updateState",value:regeneratorRuntime.mark(function p(e){var t,r,n;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return i.delegateYield(this.getState(e),"t0",1);case 1:return t=i.t0,i.delegateYield(this.checkDeleteStoreForState(t),"t1",3);case 3:return i.delegateYield(this.getInsertion([e,t.clock]),"t2",4);case 4:r=i.t2,n=null!=r&&null!=r.content?r.content.length:1;case 6:if(!(null!=r&&e===r.id[0]&&r.id[1]<=t.clock&&r.id[1]+n>t.clock)){i.next=14;break}return t.clock+=n,i.delegateYield(this.checkDeleteStoreForState(t),"t3",9);case 9:return i.delegateYield(this.os.findNext(r.id),"t4",10);case 10:r=i.t4,n=null!=r&&null!=r.content?r.content.length:1,i.next=6;break;case 14:return i.delegateYield(this.setState(t),"t5",15);case 15:case"end":return i.stop()}},p,this)})},{key:"applyDeleteSet",value:regeneratorRuntime.mark(function g(e){var t,r,n,i,a,s,o,u,c,l,d;return regeneratorRuntime.wrap(function(f){for(;;)switch(f.prev=f.next){case 0:t=[],f.t0=regeneratorRuntime.keys(e);case 2:if((f.t1=f.t0()).done){f.next=11;break}return r=f.t1.value,n=e[r],i=0,a=n[i],f.delegateYield(this.ds.iterate(this,[r,0],[r,Number.MAX_VALUE],regeneratorRuntime.mark(function h(e){var s;return regeneratorRuntime.wrap(function(o){for(;;)switch(o.prev=o.next){case 0:if(null==a){o.next=10;break}if(s=0,!(e.id[1]+e.len<=a[0])){o.next=6;break}return o.abrupt("break",10);case 6:a[0]<e.id[1]?(s=Math.min(e.id[1]-a[0],a[1]),t.push([r,a[0],s,a[2]])):(s=e.id[1]+e.len-a[0],a[2]&&!e.gc&&t.push([r,a[0],Math.min(s,a[1]),a[2]]));case 7:a[1]<=s?a=n[++i]:(a[0]=a[0]+s,a[1]=a[1]-s),o.next=0;break;case 10:case"end":return o.stop()}},h,this)})),"t2",8);case 8:for(;i<n.length;i++)a=n[i],t.push([r,a[0],a[1],a[2]]);f.next=2;break;case 11:s=0;case 12:if(!(s<t.length)){f.next=40;break}return o=t[s],f.delegateYield(this.deleteOperation([o[0],o[1]],o[2]),"t3",15);case 15:if(!o[3]){f.next=36;break}return f.delegateYield(this.markGarbageCollected([o[0],o[1]],o[2]),"t4",17);case 17:u=o[1]+o[2];case 18:if(!(u>=o[1])){f.next=36;break}return f.delegateYield(this.os.findWithUpperBound([o[0],u-1]),"t5",20);case 20:if(c=f.t5,null!=c){f.next=23;break}return f.abrupt("break",36);case 23:if(l=null!=c.content?c.content.length:1,!(c.id[0]!==o[0]||c.id[1]+l<=o[1])){f.next=26;break}return f.abrupt("break",36);case 26:if(!(c.id[1]+l>o[1]+o[2])){f.next=29;break}return f.delegateYield(this.getInsertionCleanEnd([o[0],o[1]+o[2]-1]),"t6",28);case 28:c=f.t6;case 29:if(!(c.id[1]<o[1])){f.next=32;break}return f.delegateYield(this.getInsertionCleanStart([o[0],o[1]]),"t7",31);case 31:c=f.t7;case 32:return u=c.id[1],f.delegateYield(this.garbageCollectOperation(c.id),"t8",34);case 34:f.next=18;break;case 36:this.store.forwardAppliedOperations&&(d=[],d.push({struct:"Delete",target:[a[0],a[1]],length:o[2]}),this.store.y.connector.broadcastOps(d));case 37:s++,f.next=12;break;case 40:case"end":return f.stop()}},g,this)})},{key:"isGarbageCollected",value:regeneratorRuntime.mark(function b(e){var t;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.delegateYield(this.ds.findWithUpperBound(e),"t0",1);case 1:return t=r.t0,r.abrupt("return",null!=t&&t.id[0]===e[0]&&e[1]<t.id[1]+t.len&&t.gc);case 3:case"end":return r.stop()}},b,this)})},{key:"getDeleteSet",value:regeneratorRuntime.mark(function y(){var e;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return e={},t.delegateYield(this.ds.iterate(this,null,null,regeneratorRuntime.mark(function r(t){var n,i,a,s,o;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:n=t.id[0],i=t.id[1],a=t.len,s=t.gc,o=e[n],void 0===o&&(o=[],e[n]=o),o.push([i,a,s]);case 7:case"end":return r.stop()}},r,this)})),"t0",2);case 2:return t.abrupt("return",e);case 3:case"end":return t.stop()}},y,this)})},{key:"isDeleted",value:regeneratorRuntime.mark(function v(e){var t;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.delegateYield(this.ds.findWithUpperBound(e),"t0",1);case 1:return t=r.t0,r.abrupt("return",null!=t&&t.id[0]===e[0]&&e[1]<t.id[1]+t.len);case 3:case"end":return r.stop()}},v,this)})},{key:"setOperation",value:regeneratorRuntime.mark(function m(e){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.delegateYield(this.os.put(e),"t0",1);case 1:return t.abrupt("return",e);case 2:case"end":return t.stop()}},m,this)})},{key:"addOperation",value:regeneratorRuntime.mark(function k(e){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.delegateYield(this.os.put(e),"t0",1);case 1:!this.store.y.connector.isDisconnected()&&this.store.forwardAppliedOperations&&"string"!=typeof e.id[1]&&this.store.y.connector.broadcastOps([e]);case 2:case"end":return t.stop()}},k,this)})},{key:"tryCombineWithLeft",value:regeneratorRuntime.mark(function x(t){var r;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:if(null==t||null==t.left||null==t.content||t.left[0]!==t.id[0]||!e.utils.compareIds(t.left,t.origin)){n.next=9;break}return n.delegateYield(this.getInsertion(t.left),"t0",2);case 2:if(r=n.t0,null==r.content||r.id[1]+r.content.length!==t.id[1]||1!==r.originOf.length||r.gc||r.deleted||t.gc||t.deleted){n.next=9;break}return null!=t.originOf?r.originOf=t.originOf:delete r.originOf,r.content=r.content.concat(t.content),r.right=t.right,n.delegateYield(this.os["delete"](t.id),"t1",8);case 8:return n.delegateYield(this.setOperation(r),"t2",9);case 9:case"end":return n.stop()}},x,this)})},{key:"getInsertion",value:regeneratorRuntime.mark(function w(e){var t,r;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.delegateYield(this.os.findWithUpperBound(e),"t0",1);case 1:if(t=n.t0,null!=t){n.next=6;break}return n.abrupt("return",null);case 6:if(r=null!=t.content?t.content.length:1,!(e[0]===t.id[0]&&e[1]<t.id[1]+r)){n.next=11;break}return n.abrupt("return",t);case 11:return n.abrupt("return",null);case 12:case"end":return n.stop()}},w,this)})},{key:"getInsertionCleanStartEnd",value:regeneratorRuntime.mark(function O(e){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.delegateYield(this.getInsertionCleanStart(e),"t0",1);case 1:return t.delegateYield(this.getInsertionCleanEnd(e),"t1",2);case 2:return t.abrupt("return",t.t1);case 3:case"end":return t.stop()}},O,this)})},{key:"getInsertionCleanStart",value:regeneratorRuntime.mark(function Y(t){var r,n,i;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.delegateYield(this.getInsertion(t),"t0",1);case 1:if(r=a.t0,null==r){a.next=21;break}if(r.id[1]!==t[1]){a.next=7;break}return a.abrupt("return",r);case 7:return n=e.utils.copyObject(r),r.content=n.content.splice(t[1]-r.id[1]),r.id=t,i=e.utils.getLastId(n),r.origin=i,n.originOf=[r.id],n.right=r.id,r.left=i,a.delegateYield(this.setOperation(n),"t1",16);case 16:return a.delegateYield(this.setOperation(r),"t2",17);case 17:return n.gc&&this.store.queueGarbageCollector(r.id),a.abrupt("return",r);case 19:a.next=22;break;case 21:return a.abrupt("return",null);case 22:case"end":return a.stop()}},Y,this)})},{key:"getInsertionCleanEnd",value:regeneratorRuntime.mark(function R(t){var r,n,i;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.delegateYield(this.getInsertion(t),"t0",1);case 1:if(r=a.t0,null==r){a.next=21;break}if(null!=r.content&&r.id[1]+r.content.length-1!==t[1]){a.next=7;break}return a.abrupt("return",r);case 7:return n=e.utils.copyObject(r),n.content=r.content.splice(t[1]-r.id[1]+1),n.id=[t[0],t[1]+1],i=e.utils.getLastId(r),n.origin=i,r.originOf=[n.id],r.right=n.id,n.left=i,a.delegateYield(this.setOperation(n),"t1",16);case 16:return a.delegateYield(this.setOperation(r),"t2",17);case 17:return r.gc&&this.store.queueGarbageCollector(n.id),a.abrupt("return",r);case 19:a.next=22;break;case 21:return a.abrupt("return",null);case 22:case"end":return a.stop()}},R,this)})},{key:"getOperation",value:regeneratorRuntime.mark(function I(t){var r,n,i,a;return regeneratorRuntime.wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.delegateYield(this.os.find(t),"t0",1);case 1:if(r=s.t0,"_"===t[0]&&null==r){s.next=6;break}return s.abrupt("return",r);case 6:if(n=t[1].split("_"),!(n.length>1)){s.next=15;break}return i=n[0],a=e.Struct[i].create(t),a.type=n[1],s.delegateYield(this.setOperation(a),"t1",12);case 12:return s.abrupt("return",a);case 15:return console.error("Unexpected case. How can this happen?"),s.abrupt("return",null);case 18:case"end":return s.stop()}},I,this)})},{key:"removeOperation",value:regeneratorRuntime.mark(function S(e){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.delegateYield(this.os["delete"](e),"t0",1);case 1:case"end":return t.stop()}},S,this)})},{key:"setState",value:regeneratorRuntime.mark(function T(e){var t;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return t={id:[e.user],clock:e.clock},r.delegateYield(this.ss.put(t),"t0",2);case 2:case"end":return r.stop()}},T,this)})},{key:"getState",value:regeneratorRuntime.mark(function C(e){var t,r;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.delegateYield(this.ss.find([e]),"t0",1);case 1:return t=n.t0,r=null==t?null:t.clock,null==r&&(r=0),n.abrupt("return",{user:e,clock:r});case 5:case"end":return n.stop()}},C,this)})},{key:"getStateVector",value:regeneratorRuntime.mark(function E(){var e;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return e=[],t.delegateYield(this.ss.iterate(this,null,null,regeneratorRuntime.mark(function r(t){return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:e.push({user:t.id[0],clock:t.clock});case 1:case"end":return r.stop()}},r,this)})),"t0",2);case 2:return t.abrupt("return",e);case 3:case"end":return t.stop()}},E,this)})},{key:"getStateSet",value:regeneratorRuntime.mark(function L(){var e;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return e={},t.delegateYield(this.ss.iterate(this,null,null,regeneratorRuntime.mark(function r(t){return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:e[t.id[0]]=t.clock;case 1:case"end":return r.stop()}},r,this)})),"t0",2);case 2:return t.abrupt("return",e);case 3:case"end":return t.stop()}},L,this)})},{key:"getOperations",value:regeneratorRuntime.mark(function B(t){var r,n,i,a,s,o,u,c,l,d,f;return regeneratorRuntime.wrap(function(h){for(;;)switch(h.prev=h.next){case 0:return null==t&&(t={}),r=[],h.delegateYield(this.getStateVector(),"t0",3);case 3:n=h.t0,i=!0,a=!1,s=void 0,h.prev=7,o=n[Symbol.iterator]();case 9:if(i=(u=o.next()).done){h.next=23;break}if(c=u.value,l=c.user,"_"!==l){h.next=14;break}return h.abrupt("continue",20);case 14:if(d=t[l]||0,!(d>0)){h.next=19;break}return h.delegateYield(this.getInsertion([l,d]),"t1",17);case 17:f=h.t1,null!=f&&(d=f.id[1]);case 19:return h.delegateYield(this.os.iterate(this,[l,d],[l,Number.MAX_VALUE],regeneratorRuntime.mark(function p(n){var i,a,s,o;return regeneratorRuntime.wrap(function(u){for(;;)switch(u.prev=u.next){case 0:if(n=e.Struct[n.struct].encode(n),"Insert"===n.struct){u.next=5;break}r.push(n),u.next=27;break;case 5:if(!(null==n.right||n.right[1]<(t[n.right[0]]||0))){u.next=27;break}i=n,a=[n],s=n.right;case 9:if(null!=i.left){u.next=15;break}return n.left=null,r.push(n),e.utils.compareIds(i.id,n.id)||(i=e.Struct[n.struct].encode(i),i.right=a[a.length-1].id,r.push(i)),u.abrupt("break",27);case 15:return u.delegateYield(this.getInsertion(i.left),"t0",16);
case 16:for(i=u.t0;a.length>0&&e.utils.matchesId(i,a[a.length-1].origin);)a.pop();if(!(i.id[1]<(t[i.id[0]]||0))){u.next=24;break}return n.left=e.utils.getLastId(i),r.push(n),u.abrupt("break",27);case 24:e.utils.matchesId(i,n.origin)?(n.left=n.origin,r.push(n),n=e.Struct[n.struct].encode(i),n.right=s,a.length>0&&console.log("This should not happen .. :( please report this"),a=[n]):(o=e.Struct[n.struct].encode(i),o.right=a[a.length-1].id,o.left=o.origin,r.push(o),a.push(i));case 25:u.next=9;break;case 27:case"end":return u.stop()}},p,this)})),"t2",20);case 20:i=!0,h.next=9;break;case 23:h.next=29;break;case 25:h.prev=25,h.t3=h["catch"](7),a=!0,s=h.t3;case 29:h.prev=29,h.prev=30,!i&&o["return"]&&o["return"]();case 32:if(h.prev=32,!a){h.next=35;break}throw s;case 35:return h.finish(32);case 36:return h.finish(29);case 37:return h.abrupt("return",r.reverse());case 38:case"end":return h.stop()}},B,this,[[7,25,29,37],[30,,32,36]])})},{key:"flush",value:regeneratorRuntime.mark(function j(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.delegateYield(this.os.flush(),"t0",1);case 1:return e.delegateYield(this.ss.flush(),"t1",2);case 2:return e.delegateYield(this.ds.flush(),"t2",3);case 3:case"end":return e.stop()}},j,this)})}]),t}();e.Transaction=t}},{}],9:[function(e,t,r){"use strict";function n(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e},o=function c(e,t,r){null===e&&(e=Function.prototype);var n=Object.getOwnPropertyDescriptor(e,t);if(void 0===n){var i=Object.getPrototypeOf(e);return null===i?void 0:c(i,t,r)}if("value"in n)return n.value;var a=n.get;return void 0===a?void 0:a.call(r)},u=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}();t.exports=function(e){function t(e){var t={};for(var r in e)t[r]=e[r];return t}function r(e){return e=t(e),null!=e.content&&(e.content=e.content.map(function(e){return e})),e}function c(e,t){return e[0]<t[0]||e[0]===t[0]&&(e[1]<t[1]||s(e[1])<s(t[1]))}function l(e,t){return e.target[0]===t[0]&&e.target[1]<=t[1]&&t[1]<e.target[1]+(e.length||1)}function d(e,t){return null==e||null==t?e===t:e[0]===t[0]&&e[1]===t[1]}function f(e,t){return null==t||null==e?t===e:t[0]===e.id[0]?null==e.content?t[1]===e.id[1]:t[1]>=e.id[1]&&t[1]<e.id[1]+e.content.length:void 0}function h(e){return null==e.content||1===e.content.length?e.id:[e.id[0],e.id[1]+e.content.length-1]}function p(e){for(var t=new Array(e),r=0;r<t.length;r++)t[r]={id:[null,null]};return t}function g(e){var t=function(e){function t(e,r){a(this,t);var i=n(this,Object.getPrototypeOf(t).call(this,e,r));return i.writeBuffer=p(5),i.readBuffer=p(10),i}return i(t,e),u(t,[{key:"find",value:regeneratorRuntime.mark(function r(e,n){var i,a,s;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:i=this.readBuffer.length-1;case 1:if(!(i>=0)){r.next=10;break}if(a=this.readBuffer[i],a.id[1]!==e[1]||a.id[0]!==e[0]){r.next=7;break}for(;i<this.readBuffer.length-1;i++)this.readBuffer[i]=this.readBuffer[i+1];return this.readBuffer[this.readBuffer.length-1]=a,r.abrupt("return",a);case 7:i--,r.next=1;break;case 10:i=this.writeBuffer.length-1;case 11:if(!(i>=0)){r.next=19;break}if(a=this.writeBuffer[i],a.id[1]!==e[1]||a.id[0]!==e[0]){r.next=16;break}return s=a,r.abrupt("break",19);case 16:i--,r.next=11;break;case 19:if(!(0>i&&void 0===n)){r.next=22;break}return r.delegateYield(o(Object.getPrototypeOf(t.prototype),"find",this).call(this,e),"t0",21);case 21:s=r.t0;case 22:if(null!=s){for(i=0;i<this.readBuffer.length-1;i++)this.readBuffer[i]=this.readBuffer[i+1];this.readBuffer[this.readBuffer.length-1]=s}return r.abrupt("return",s);case 24:case"end":return r.stop()}},r,this)})},{key:"put",value:regeneratorRuntime.mark(function s(e){var r,n,i,a;return regeneratorRuntime.wrap(function(s){for(;;)switch(s.prev=s.next){case 0:r=e.id,n=this.writeBuffer.length-1;case 2:if(!(n>=0)){s.next=11;break}if(i=this.writeBuffer[n],i.id[1]!==r[1]||i.id[0]!==r[0]){s.next=8;break}for(;n<this.writeBuffer.length-1;n++)this.writeBuffer[n]=this.writeBuffer[n+1];return this.writeBuffer[this.writeBuffer.length-1]=e,s.abrupt("break",11);case 8:n--,s.next=2;break;case 11:if(!(0>n)){s.next=17;break}if(a=this.writeBuffer[0],null===a.id[0]){s.next=15;break}return s.delegateYield(o(Object.getPrototypeOf(t.prototype),"put",this).call(this,a),"t0",15);case 15:for(n=0;n<this.writeBuffer.length-1;n++)this.writeBuffer[n]=this.writeBuffer[n+1];this.writeBuffer[this.writeBuffer.length-1]=e;case 17:for(n=0;n<this.readBuffer.length-1;n++)i=this.readBuffer[n+1],i.id[1]===r[1]&&i.id[0]===r[0]?this.readBuffer[n]=e:this.readBuffer[n]=i;this.readBuffer[this.readBuffer.length-1]=e;case 19:case"end":return s.stop()}},s,this)})},{key:"delete",value:regeneratorRuntime.mark(function c(e){var r,n;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:for(r=0;r<this.readBuffer.length;r++)n=this.readBuffer[r],n.id[1]===e[1]&&n.id[0]===e[0]&&(this.readBuffer[r]={id:[null,null]});return i.delegateYield(this.flush(),"t0",2);case 2:return i.delegateYield(o(Object.getPrototypeOf(t.prototype),"delete",this).call(this,e),"t1",3);case 3:case"end":return i.stop()}},c,this)})},{key:"findWithLowerBound",value:regeneratorRuntime.mark(function l(e){var r,n=arguments;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return i.delegateYield(this.find(e,!0),"t0",1);case 1:if(r=i.t0,null==r){i.next=6;break}return i.abrupt("return",r);case 6:return i.delegateYield(this.flush(),"t1",7);case 7:return i.delegateYield(o(Object.getPrototypeOf(t.prototype),"findWithLowerBound",this).apply(this,n),"t2",8);case 8:return i.abrupt("return",i.t2);case 9:case"end":return i.stop()}},l,this)})},{key:"findWithUpperBound",value:regeneratorRuntime.mark(function d(e){var r,n=arguments;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return i.delegateYield(this.find(e,!0),"t0",1);case 1:if(r=i.t0,null==r){i.next=6;break}return i.abrupt("return",r);case 6:return i.delegateYield(this.flush(),"t1",7);case 7:return i.delegateYield(o(Object.getPrototypeOf(t.prototype),"findWithUpperBound",this).apply(this,n),"t2",8);case 8:return i.abrupt("return",i.t2);case 9:case"end":return i.stop()}},d,this)})},{key:"findNext",value:regeneratorRuntime.mark(function f(){var e=arguments;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.delegateYield(this.flush(),"t0",1);case 1:return r.delegateYield(o(Object.getPrototypeOf(t.prototype),"findNext",this).apply(this,e),"t1",2);case 2:return r.abrupt("return",r.t1);case 3:case"end":return r.stop()}},f,this)})},{key:"findPrev",value:regeneratorRuntime.mark(function h(){var e=arguments;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.delegateYield(this.flush(),"t0",1);case 1:return r.delegateYield(o(Object.getPrototypeOf(t.prototype),"findPrev",this).apply(this,e),"t1",2);case 2:return r.abrupt("return",r.t1);case 3:case"end":return r.stop()}},h,this)})},{key:"iterate",value:regeneratorRuntime.mark(function g(){var e=arguments;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.delegateYield(this.flush(),"t0",1);case 1:return r.delegateYield(o(Object.getPrototypeOf(t.prototype),"iterate",this).apply(this,e),"t1",2);case 2:case"end":return r.stop()}},g,this)})},{key:"flush",value:regeneratorRuntime.mark(function b(){var e,r;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:e=0;case 1:if(!(e<this.writeBuffer.length)){n.next=9;break}if(r=this.writeBuffer[e],null===r.id[0]){n.next=6;break}return n.delegateYield(o(Object.getPrototypeOf(t.prototype),"put",this).call(this,r),"t0",5);case 5:this.writeBuffer[e]={id:[null,null]};case 6:e++,n.next=1;break;case 9:case"end":return n.stop()}},b,this)})}]),t}(e);return t}e.utils={};var b=function(){function e(){a(this,e),this.eventListeners=[]}return u(e,[{key:"destroy",value:function(){this.eventListeners=null}},{key:"addEventListener",value:function(e){this.eventListeners.push(e)}},{key:"removeEventListener",value:function(e){this.eventListeners=this.eventListeners.filter(function(t){return e!==t})}},{key:"removeAllEventListeners",value:function(){this.eventListeners=[]}},{key:"callEventListeners",value:function(e){for(var t=0;t<this.eventListeners.length;t++)try{this.eventListeners[t](e)}catch(r){console.error("User events must not throw Errors!")}}}]),e}();e.utils.EventListenerHandler=b;var y=function(t){function r(e){a(this,r);var t=n(this,Object.getPrototypeOf(r).call(this));return t.waiting=[],t.awaiting=0,t.onevent=e,t}return i(r,t),u(r,[{key:"destroy",value:function(){o(Object.getPrototypeOf(r.prototype),"destroy",this).call(this),this.waiting=null,this.awaiting=null,this.onevent=null}},{key:"receivedOp",value:function(e){this.awaiting<=0?this.onevent(e):this.waiting.push(e)}},{key:"awaitAndPrematurelyCall",value:function(t){this.awaiting++,t.map(e.utils.copyOperation).forEach(this.onevent)}},{key:"awaitOps",value:regeneratorRuntime.mark(function s(t,r,n){var i,a,o,u,c,l,d,f;return regeneratorRuntime.wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return i=function(t){for(var r=[];t.length>0;)for(var n=0;n<t.length;n++){for(var i=!0,a=0;a<t.length;a++)if(e.utils.matchesId(t[a],t[n].left)){i=!1;break}i&&(r.push(t.splice(n,1)[0]),n--)}return r},a=this.waiting.length,s.delegateYield(r.apply(t,n),"t0",3);case 3:if(this.waiting.splice(a),this.awaiting>0&&this.awaiting--,!(0===this.awaiting&&this.waiting.length>0)){s.next=38;break}o=0;case 7:if(!(o<this.waiting.length)){s.next=36;break}if(u=this.waiting[o],"Insert"!==u.struct){s.next=33;break}return s.delegateYield(t.getInsertion(u.id),"t1",11);case 11:if(c=s.t1,e.utils.compareIds(c.id,u.id)){s.next=16;break}u.left=[u.id[0],u.id[1]-1],s.next=33;break;case 16:if(null!=c.left){s.next=20;break}u.left=null,s.next=33;break;case 20:return s.delegateYield(t.getInsertion(c.left),"t2",21);case 21:l=s.t2;case 22:if(null==l.deleted){s.next=32;break}if(null==l.left){s.next=28;break}return s.delegateYield(t.getInsertion(l.left),"t3",25);case 25:l=s.t3,s.next=30;break;case 28:return l=null,s.abrupt("break",32);case 30:s.next=22;break;case 32:u.left=null!=l?e.utils.getLastId(l):null;case 33:o++,s.next=7;break;case 36:null!=this._pullChanges&&this._pullChanges(),0===this.awaiting&&(d=[],f=[],this.waiting.forEach(function(e){"Delete"===e.struct?f.push(e):d.push(e)}),d=i(d),d.forEach(this.onevent),f.forEach(this.onevent),this.waiting=[]);case 38:case"end":return s.stop()}},s,this)})},{key:"awaitedInserts",value:function(t){for(var r=this.waiting.splice(this.waiting.length-t),n=0;n<r.length;n++){var i=r[n];if("Insert"!==i.struct)throw new Error("Expected Insert Operation!");for(var a=this.waiting.length-1;a>=0;a--){var s=this.waiting[a];"Insert"===s.struct&&(e.utils.matchesId(s,i.left)?(s.right=i.id,i.left=s.left):e.utils.compareIds(s.id,i.right)&&(s.left=e.utils.getLastId(i),i.right=s.right))}}this._tryCallEvents(t)}},{key:"awaitedDeletes",value:function(t,r){for(var n=this.waiting.splice(this.waiting.length-t),i=0;i<n.length;i++){var a=n[i];if("Delete"!==a.struct)throw new Error("Expected Delete Operation!");if(null!=r)for(var s=0;s<this.waiting.length;s++){var o=this.waiting[s];"Insert"===o.struct&&e.utils.compareIds(a.target,o.left)&&(o.left=r)}}this._tryCallEvents(t)}},{key:"_tryCallEvents",value:function(){function t(t){for(var r=[];t.length>0;)for(var n=0;n<t.length;n++){for(var i=!0,a=0;a<t.length;a++)if(e.utils.matchesId(t[a],t[n].left)){i=!1;break}i&&(r.push(t.splice(n,1)[0]),n--)}return r}if(this.awaiting>0&&this.awaiting--,0===this.awaiting&&this.waiting.length>0){var r=[],n=[];this.waiting.forEach(function(e){"Delete"===e.struct?n.push(e):r.push(e)}),r=t(r),r.forEach(this.onevent),n.forEach(this.onevent),this.waiting=[]}}}]),r}(b);e.utils.EventHandler=y;var v=function m(e){if(a(this,m),null==e.struct||null==e.initType||null==e["class"]||null==e.name)throw new Error("Custom type was not initialized correctly!");this.struct=e.struct,this.initType=e.initType,this["class"]=e["class"],this.name=e.name,null!=e.appendAdditionalInfo&&(this.appendAdditionalInfo=e.appendAdditionalInfo),this.parseArguments=(e.parseArguments||function(){return[this]}).bind(this),this.parseArguments.typeDefinition=this};e.utils.CustomType=v,e.utils.isTypeDefinition=function(t){if(null!=t){if(t instanceof e.utils.CustomType)return[t];if(t.constructor===Array&&t[0]instanceof e.utils.CustomType)return t;if(t instanceof Function&&t.typeDefinition instanceof e.utils.CustomType)return[t.typeDefinition]}return!1},e.utils.copyObject=t,e.utils.copyOperation=r,e.utils.smaller=c,e.utils.inDeletionRange=l,e.utils.compareIds=d,e.utils.matchesId=f,e.utils.getLastId=h,e.utils.createSmallLookupBuffer=g}},{}],10:[function(e,t,r){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(t){for(var r="undefined"!=typeof regeneratorRuntime?".js":".es6",n=[],i=0;i<t.length;i++){var s=t[i].split("(")[0],u="y-"+s.toLowerCase();if(null==a[s])if(null==o[s])if("undefined"!=typeof window&&"undefined"!==window.Y){var c;!function(){c=document.createElement("script"),c.src=a.sourceDir+"/"+u+"/"+u+r,document.head.appendChild(c);var e={};o[s]=e,e.promise=new Promise(function(t){e.resolve=t}),n.push(e.promise)}()}else console.info("YJS: Please do not depend on automatic requiring of modules anymore! Extend modules as follows `require('y-modulename')(Y)`"),e(u)(a);else n.push(o[t[i]].promise)}return Promise.all(n)}function a(e){e.types=null!=e.types?e.types:[];var t=[e.db.name,e.connector.name].concat(e.types);for(var r in e.share)t.push(e.share[r]);return a.sourceDir=e.sourceDir,new Promise(function(r,n){setTimeout(function(){a.requestModules(t).then(function(){if(null==e)n("An options object is expected! ");else if(null==e.connector)n("You must specify a connector! (missing connector property)");else if(null==e.connector.name)n("You must specify connector name! (missing connector.name property)");else if(null==e.db)n("You must specify a database! (missing db property)");else if(null==e.connector.name)n("You must specify db name! (missing db.name property)");else if(null==e.share)n("You must specify a set of shared types!");else{var t=new u(e);t.db.whenUserIdSet(function(){t.init(function(){r(t)})})}})["catch"](n)},0)})}var s=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}();e("./Connector.js")(a),e("./Database.js")(a),e("./Transaction.js")(a),e("./Struct.js")(a),e("./Utils.js")(a),e("./Connectors/Test.js")(a);var o={};t.exports=a,a.requiringModules=o,a.extend=function(e,t){t instanceof a.utils.CustomType?a[e]=t.parseArguments:a[e]=t,null!=o[e]&&(o[e].resolve(),delete o[e])},a.requestModules=i;var u=function(){function e(t,r){n(this,e),this.options=t,this.db=new a[t.db.name](this,t.db),this.connector=new a[t.connector.name](this,t.connector)}return s(e,[{key:"init",value:function(e){var t=this.options,r={};this.share=r,this.db.requestTransaction(regeneratorRuntime.mark(function n(){var i,s,o,u,c,l,d;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:n.t0=regeneratorRuntime.keys(t.share);case 1:if((n.t1=n.t0()).done){n.next=21;break}if(i=n.t1.value,s=t.share[i].split("("),o=s.splice(0,1),u=[],1!==s.length){n.next=14;break}n.prev=7,u=JSON.parse("["+s[0].split(")")[0]+"]"),n.next=14;break;case 11:throw n.prev=11,n.t2=n["catch"](7),new Error("Was not able to parse type definition! (share."+i+")");case 14:return c=a[o],l=c.typeDefinition,d=["_",l.struct+"_"+o+"_"+i+"_"+s],n.delegateYield(this.createType(c.apply(l,u),d),"t3",18);case 18:r[i]=n.t3,n.next=1;break;case 21:this.store.whenTransactionsFinished().then(e);case 22:case"end":return n.stop()}},n,this,[[7,11]])}))}},{key:"isConnected",value:function(){return this.connector.isSynced}},{key:"disconnect",value:function(){return this.connector.disconnect()}},{key:"reconnect",value:function(){return this.connector.reconnect()}},{key:"destroy",value:function(){null!=this.connector.destroy?this.connector.destroy():this.connector.disconnect();var e=this;this.db.requestTransaction(regeneratorRuntime.mark(function t(){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.delegateYield(e.db.destroy(),"t0",1);case 1:e.connector=null,e.db=null;case 3:case"end":return t.stop()}},t,this)}))}}]),e}();"undefined"!=typeof window&&(window.Y=a)},{"./Connector.js":4,"./Connectors/Test.js":5,"./Database.js":6,"./Struct.js":7,"./Transaction.js":8,"./Utils.js":9}]},{},[3,10]);
//# sourceMappingURL=y.js.map
;
syncmeta_api.define("yjs", function(){});

syncmeta_api.define('lib/yjs-sync',['jquery', 'yjs'], function($) {
    return function(spaceTitle) {

        var deferred = $.Deferred();
        if (!spaceTitle) {
            //try to get space title from url if space promise fails
            spaceTitle = frameElement.baseURI.substring(frameElement.baseURI.lastIndexOf('/') + 1);
            if (spaceTitle.indexOf('#') != -1 || spaceTitle.indexOf('?') != -1) {
                spaceTitle = spaceTitle.replace(/[#|\\?]\S*/g, '');
            }
        }
        Y({
            db: {
                name: 'memory' // store the shared data in memory
            },
            connector: {
                name: 'websockets-client', // use the websockets connector
                room: spaceTitle,
                //url: 'https://yjs.dbis.rwth-aachen.de:5080'
                url: 'http://yjs.dbis.rwth-aachen.de:5079'
            },
            share: { // specify the shared content
                users: 'Map',
                undo: 'Array',
                redo: 'Array',
                join: 'Map',
                canvas: 'Map',
                nodes: 'Map',
                edges: 'Map',
                userList: 'Map',
                select: 'Map',
                views: 'Map',
                data: 'Map',
                text: "Text"
            },
            sourceDir: 'http://localhost:8081/js/lib/vendor'
        }).then(function(y) {
            deferred.resolve(y);
        });
        return deferred.promise();
    };
});
syncmeta_api.define('plugin/plugin',['jquery', 'lib/yjs-sync'], function($, yjsSync) {
    'use strict';

    /**
        * Listen to node manipulations. Private helper function
         * @private
         * @param {array} keys - the operations to listen to. All possible options are  ['NodeMoveOperation', 'NodeResizeOperation', 'NodeMoveZOperation']
         * @param {function} callback - the callback if one of the operations defined in keys were issued
         */
    var onNode = function(key, callback) {
        var newObersever = function(event) {
            if (key.indexOf(event.name) != -1) {
                callback(event.value);
            }
        };

        var nodeIds = ySyncMetaInstance.share.nodes.keys();
        //var oldObserver = nodeObservers[key];
        //nodeObservers[key] = undefined;
        for (var i = 0; i < nodeIds.length; i++) {
            let n = ySyncMetaInstance.share.nodes.get(nodeIds[i]);
            if (n) {
                n.then(function(ymap) {
                    //Overwrite with new observer
                    //if (oldObserver)
                    //    ymap.unobserve(oldObserver);
                    ymap.observe(newObersever);
                })
            }
        }
        nodeObservers[key].push(newObersever);
    };
    var nodeObservers = {
        NodeMoveOperation: [],
        NodeResizeOperation: [],
        NodeMoveZOperation: []
    };
    var attrObservers = {
        nodes: {
            attributeYTextObserver: undefined,
            attributePrimitiveObserver: undefined
        },
        edges: {
            attributeYTextObserver: undefined,
            attributePrimitiveObserver: undefined
        }
    }
    /*var attrObserverMap = {
        ytext: {},
        primitive: {}
    };*/
    var ySyncMetaInstance = null;

    var jabberId = null;

    /**
         * Listen to changes on Attributes on nodes or edges
         * @param {string} type - 'nodes' or 'edges'
         * @param {onAttributeChangeCallback} callback - calls back if a attribute is changed
         * @param {string} entityId - id of the node to listen to. If null we listen to all of the specified type
         * @private
         */
    var onAttributeChange = function(type, callback) {
        if (!ySyncMetaInstance)
            return new Error('No Connection to Yjs space');


        attrObservers[type].attributePrimitiveObserver = function(entityId) {
            return function(event) {
                if (event.name.search(/\w*\[(\w|\s)*\]/g) != -1) {
                    callback(event.value.value, entityId, event.value.entityId);
                }
            }
        }
        attrObservers[type].attributeYTextObserver = function(entityId, attrId) {
            return function(event) {
                callback(event.object.toString(), entityId, attrId);
            }
        };

        var listenToAttributes = function(ymapPromise, entityId) {
            var listentoAttributesHelper = function(attrId, attrPromise, entityId) {
                if (attrPromise instanceof Promise) {
                    attrPromise.then(function(ytext) {
                        //if (attrObserverMap.ytext[attrId])
                        //    ytext.unobserve(attrObserverMap.ytext[attrId]);
                        var newObserver = attrObservers[type].attributeYTextObserver(entityId, attrId);
                        //attrObserverMap.ytext[attrId] = newObserver;
                        ytext.observe(newObserver);
                    })
                }
            };

            ymapPromise.then(function(ymap) {
                //if (attrObserverMap.primitive[entityId])
                //    ymap.unobserve(attrObserverMap.primitive[entityId]);
                var newObserver = attrObservers[type].attributePrimitiveObserver(entityId);
                //attrObserverMap.primitive[entityId] = newObserver;
                ymap.observe(newObserver);

                var keys = ymap.keys();
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i].search(/\w*\[(\w|\s)*\]/g) != -1) {
                        listentoAttributesHelper(keys[i], ymap.get(keys[i]), entityId);
                    }
                }
            });
        };

        //listen to everything OR return
        var nodeIds = ySyncMetaInstance.share[type].keys();
        for (var i = 0; i < nodeIds.length; i++) {
            let p = ySyncMetaInstance.share[type].get(nodeIds[i]);
            if (p) {
                listenToAttributes(p, nodeIds[i]);
            }
        }
    };


    return {
        /**
         * If are already connected to a syncmeta yjs space then use this funnction to init the plugin
         * Otherwise connect to yjs with the connect function
         * @param {object} yInstance - the y instance 
         */
        init: function(yInstance) {
            ySyncMetaInstance = yInstance;

            var attrObserverInit = function(type, ymap, id) {
                if (attrObservers[type].attributePrimitiveObserver && attrObservers[type].attributeYTextObserver) {
                    ymap.observe(function(e) {
                        if (e.type === 'add' && e.name.search(/\w*\[(\w|\s)*\]/g) != -1) {
                            var attrId = e.name;
                            if (e.value() instanceof Promise) {
                                e.value().then(function(ytext) {
                                    var newObserver = attrObservers[type].attributeYTextObserver(id, attrId);
                                    ytext.observe(newObserver);
                                    //attrObserverMap.ytext[attrId] =newObserver;
                                });
                            } else {
                                var newObersever = attrObservers[type].attributePrimitiveObserver(id);
                                e.object.observe(newObersever);
                                //attrObserverMap.primitive[id] = newObersever;
                            }
                        }
                    });
                }
            }

            ySyncMetaInstance.share.nodes.observe(function(event) {
                var nodeId = event.name;
                if (event.type === 'add') {
                    event.value().then(function(ymap) {
                        for (var key in nodeObservers) {
                            if (nodeObservers.hasOwnProperty(key)) {
                                for (let i = 0; i < nodeObservers[key].length; i++) {
                                    ymap.observe(nodeObservers[key][i]);
                                }
                            }
                        }

                        attrObserverInit('nodes', ymap, nodeId);
                    });
                }
            });

            ySyncMetaInstance.share.edges.observe(function(event) {
                var edgeId = event.name;
                if (event.type === 'add') {
                    event.value().then(function(ymap) {
                        attrObserverInit('edges', ymap, edgeId);
                    });
                }
            })

            openapp.resource.get(openapp.param.user(), function(user) {
                jabberId = user.subject['http://xmlns.com/foaf/0.1/jabberID'][0].value.replace("xmpp:", "");
            })
        },
        /**
         * Connect to a syncmeta yjs space.
         * This or the init function must be called before using the listeners.
         * This interally uses the init function to setup the plugin.
         * @param {string} spaceName - the name of the role space where the widgets are located
         * @see init
         */
        connect: function(spaceName) {
            var that = this;
            if (!ySyncMetaInstance) {
                var deferred = $.Deferred();
                yjsSync(spaceName).done(function(y) {
                    that.init(y);
                    deferred.resolve();
                }).then(function() {
                    return true;
                })
            }
            else deferred.reject();
            return deferred.promise();
        },
        /**
         * Listen to NodeAddOperations on the SyncMeta canvas widget
         * @param {onNodeAddCallback} callback - the callback if a node was created on syncmeta canvas widget
         */
        onNodeAdd: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');

            ySyncMetaInstance.share.canvas.observe(function(event) {
                if (event.name == 'NodeAddOperation')
                    callback(event.value);
            });
        },
        /**
         * @param{function} callback - callback if a users joins the space
         */
        onUserJoin: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');
            ySyncMetaInstance.share.userList.observe(function(event) {
                callback(event.value);
            })
        },
        /**
         * Listen to EdgeAddOperation on the SyncMeta canvas widget
         * @param {onEdgeAddCallback} callback - the callback if a edge was created on syncmeta canvas widget
         */
        onEdgeAdd: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');

            ySyncMetaInstance.share.canvas.observe(function(event) {
                if (event.name == 'EdgeAddOperation')
                    callback(event.value);
            });
        },
        /**
         * Listen to both EdgeAddOperation and NodeAddOperation
         * @param callback - the callback if edge or node was created on syncmeta canvas widget
         * @see onNodeAdd
         * @see onEdgeAdd
         */
        onEntityAdd: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');

            ySyncMetaInstance.share.canvas.observe(function(event) {
                if (event.name == 'NodeAddOperation')
                    callback(event.value);
                else if (event.name == 'EdgeAddOperation')
                    callback(event.value, event.name);
            });

        },
        /**
         * Listen to selections of entities on the Syncmeta canvas widget
         * @param {onEntitySelectCallback} callback - the callback if a entity was selected
         */
        onEntitySelect: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');

            ySyncMetaInstance.share.select.observe(function(event) {
                if (event.value)
                    callback(event.value);
            });
        },
        /**
         * Listen to selections of nodes on the Syncmeta canvas widget
         * @param {onEntitySelectCallback} callback - the callback if a node was selected
         */
        onNodeSelect: function(callback) {

            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');
            ySyncMetaInstance.share.select.observe(function(event) {
                if (event.value && ySyncMetaInstance.share.nodes.keys().indexOf(event.value) != -1)
                    callback(event.value);
            });
        },
        /**
         * Listen to selections of edges on the Syncmeta canvas widget
         * @param {onEntitySelectCallback} callback - the callback if a edge was selected
         */
        onEdgeSelect: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');
            ySyncMetaInstance.share.select.observe(function(event) {
                if (event.value && ySyncMetaInstance.share.edges.keys().indexOf(event.value) != -1)
                    callback(event.value);
            });
        },
        /**
         * Listen to NodeDeleteOperation
         * @param {onEntityDeleteCallback} callback - the callback if a node was deleted
         */
        onNodeDelete: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');
            ySyncMetaInstance.share.nodes.observe(function(event) {
                if (event.type === 'delete')
                    callback(event.name);
            });

        },
        /**
         * Listen to EdgeDeleteOperations
         * @param {onEntityDeleteCallback} callback - the callback if a edge was deleted
         */
        onEdgeDelete: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');
            ySyncMetaInstance.share.edges.observe(function(event) {
                if (event.type === 'delete')
                    callback(event.name);
            });
        },
        /**
         * Listen to NodeMoveOperations
         * Equivalent to onNode(['NodeMoveOperation'], callback, id);
         * @param {onNodeMoveCallback} callback - the callback if a node is moved on the canvas
         * @param {string} id - id of the node to listen to. If null we listen to all
         * @see onNode
         */
        onNodeMove: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');
            onNode('NodeMoveOperation', callback);
        },
        /**
         * Listen to NodeResizeOperations
         * Equivalent to onNode(['NodeResizeOperation'], callback, id);
         * @param {onNodeResizeCallback} callback - the callback if a node is resized on the canvas
         * @param {string} id - id of the node to listen to. If null we listen to all
         * @see OnNode
         */
        onNodeResize: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');
            onNode('NodeResizeOperation', callback);
        },
        /**
         * Listen to NodeMoveZOperations
         * Equivalent to onNode(['NodeMoveZOperation'], callback, id);
         * @param {onNodeMoveZCallback} callback - the callback if a node is moved to the back- or foreground on the canvas
         * @param {string} id - id of the node to listen to. If null we listen to all
         * @see OnNode
         */
        onNodeMoveZ: function(callback) {
            if (!ySyncMetaInstance)
                return new Error('No Connection to Yjs space');
            onNode('NodeMoveZOperation', callback);
        },
        /**
         * Listen to changes on Attributes on nodes
         * Equivalent to onAttributeChange('nodes', callback, entityId);
         * @param {onAttributeChangeCallback} callback - calls back if a attribute is changed
         * @param {string} entityId - id of the node to listen to. If null we listen to all of the specified type
         * @see OnAttributeChange
         */
        onNodeAttributeChange: function(callback) {
            onAttributeChange('nodes', callback);
        },
        /**
         * Listen to changes on Attributes on edges
         * Equivalent to onAttributeChange('edges', callback, entityId);
         * @param {onAttributeChangeCallback} callback - calls back if a attribute is changed
         * @param {string} entityId - id of the edge to listen to. If null we listen to all of the specified type
         * @see OnAttributeChange
         */
        onEdgeAttributeChange: function(callback) {
            onAttributeChange('edges', callback);
        },
        /**
         * Set a value for a attribute of a entity
         * @param {stirng} entity
         * @param {string} attrName
         * @param {string|bool|integer} value
         */
        setAttributeValue: function(entityId, attrName, value) {
            var idx = ySyncMetaInstance.share.nodes.keys().indexOf(entityId);

            var attrId;
            //Does attrName has the form of the id
            if (attrName.search(/\w*\[(\w|\s)*\]/g) != -1)
                //Yes, the attribute name is the attribute id
                attrId = attrName;
            else
                //No, build the attribute id
                attrId = entityId + '[' + attrName.toLowerCase() + ']';

            var findAttr = function(ymap, attrId, value) {
                var keys = ymap.keys().indexOf(attrId);
                if (keys != -1) {
                    var attr = ymap.get(attrId);
                    if (attr instanceof Promise) {
                        attr.then(function(ytext) {
                            setTimeout(function() {
                                var l = ytext.toString().length;
                                if (l > 0) {
                                    ytext.delete(0, l);
                                }
                                ytext.insert(0, value);
                                //lets wait a bit before trigger the save
                                // so that the canvas and attribute widget can process the value change at their callbacks
                                setTimeout(function() {
                                    if (jabberId)
                                        ySyncMetaInstance.share.canvas.set('triggerSave', jabberId);
                                }, 500);

                            }, 500);

                        })
                    }
                    else
                        ymap.set(attrId, { 'entityId': attrId, 'value': value, 'type': 'update', 'position': 0 });
                }
                else
                    ymap.set(attrId, { 'entityId': attrId, 'value': value, 'type': 'update', 'position': 0 });
            }

            if (idx != -1) {
                ySyncMetaInstance.share.nodes.get(entityId).then(function(ymap) {
                    findAttr(ymap, attrId, value);
                });
            } else {
                idx = ySyncMetaInstance.share.edges.keys().indexOf(entityId);
                if (idx != -1) {
                    ySyncMetaInstance.share.edges.get(entityId).then(function(ymap) {
                        findAttr(ymap, attrId, value);
                    });
                }
                else {
                    return;
                }
            }
        }

        /**
         * @callback onNodeAddCallback
         * @param {object} event - the NodeAddOperation event
         * @param {string} event.id - the id of the created node
         * @param {string} event.type - the type of the node
         * @param {string} event.oType - the original type (only set in views, then type is the view type)
         * @param {integer} event.top - y position in the canvas
         * @param {integer} event.left - x position in the canvas
         * @param {integer} event.width - width of the node
         * @param {integer} event.height - height of the node
         * @param {integer} event.zIndex - depth value of the node
         * @param {object} event.json - the json representation. Only used for import of (meta-)models. Should be always null
         * @param {string} event.jabberId - jabberId of the user who created the node
         *
         */

        /**
         * @callback onEdgeAddCallback
         * @param {object} event - the EdgeAddOperation event
         * @param {string} event.id - the id of the created edge
         * @param {string} event.jabberId - jabberId of the user who created the edge
         * @param {string} event.type - the type of the edge
         * @param {string} event.oType - the original type (only set in views, then type is the view type)
         * @param {object} event.json - the json representation. Only used for import of (meta-)models. Should be always null
         * @param {string} event.source - the source of the edge
         * @param {string} event.target - the target of the edge
         */

        /**
         * @callback onEntitySelectCallback
         * @param {string} id - the id of the selected entity (node/edge)
         */

        /**
         * @callback onEntityDeleteCallback
         * @param {string} id - the id of the deleted entity (node/edge)
         */

        /**
         * @callback onNodeMoveCallback
         * @param {object} event - the node move operation
         * @param {string} event.id - the id of node
         * @param {string} event.jabberId - the jabberId of the user
         * @param {integer} event.offsetX
         * @param {integer} event.offsetY
         */

        /**
         *@callback onNodeResizeCallback
         * @param {object} event - the node resize operation
         * @param {string} event.id - the id of node
         * @param {string} event.jabberId - the jabberId of the user
         * @param {integer} event.offsetX
         * @param {integer} event.offsetY
         * */

        /**
         * @callback onNodeMoveZCallback
         * @param {object} event - the NodeMoveZOperation
         * @param {string} event.id - the id of the node
         * @param {integer} event.offsetZ - the offset of the z coordinate
         */

        /**
         * @callback onAttributeChangeCallback
         * @param {string} value - the new value of the attribute
         * @param {string} entityId - the id of the entity (node/edge) the attribute belongs to
         * @param {string} attrId - the id of the attribute
         */
    }
});



/*global define */
syncmeta_api.define('plugin/main.js',['require','../plugin/plugin'],function (require) {
    'use strict';

    var plugin = require('../plugin/plugin');

    window.syncmeta = plugin;

    return plugin;
});

    syncmeta_api.define('jquery', function () {
        return this.$;
    });

    //Use almond's special top-level, synchronous require to trigger factory
    //functions, get the final module value, and export it as the public
    //value.
    return syncmeta_api.require('plugin/main.js');
}));
