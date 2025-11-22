(function (root, factory, exp) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery', 'jsonrpc'], factory);
  } else {
    // Browser globals
    root[exp] = factory();
  }
}(this, function (_jQuery, jsonrpc) {
  //'use strict'; // TODO : ES5

  window.attractionsTools = {};
  window.attractionsBindJqFormChangeEvent   =   window.attractionsBindJqFormChangeEvent || void 0;
  window.attractionsLogEnabled              =   window.attractionsLogEnabled || false;
  window.attractionsLogPerformance          =   window.attractionsLogPerformance || false;
  /**
   * @deprecated : use setFormBinders({..., async:true})
   * @type {boolean}
   */
  window.attractionsIsAsync                 =   window.attractionsIsAsync || false;
  window.attractionsDetachFormOnExecute     =   window.attractionsDetachFormOnExecute || false;
  window.attractionsSearchWithinForm        =   window.attractionsSearchWithinForm || false;
  window.attractionsRowAffix                =   window.attractionsRowAffix || ' - ';

  /**
   *
   * @param {string} msg - alert message
   */
  window.attractionsAlert = window.attractionsAlert || function(msg) {
    alert( msg );
  };

  /**
   *
   * @param {string} msg - message
   * @param {Array<string>} messages
   * @returns {Array<string>}
   */
  window.attractionsPushMessage = window.attractionsPushMessage || function(msg, messages) {

    if(!msg || !messages || messages.length === void 0) {
      return [];
    }
    if(!isArray(messages)) {
      return messages;
    }

    var rowAffix = window.attractionsRowAffix;

    var len = messages.length;
    if( len > 0 ) {
      if( len === 1 ) {
        messages[0] = rowAffix + messages[0];
      }
      msg = rowAffix + msg;
    }

    messages.push(msg);

    return messages;
  };

  /**
   *
   * @param {HTMLElement} o
   * @param {string} v - tag name
   * @returns {string|boolean}
   */
  function checkTag(o, v) {
    return (o && o.tagName)?(v) ? (o.tagName.toLowerCase() === v.toLowerCase()) : o.tagName.toLowerCase(): (v) ? false :"";
  }
  /**
   *
   * @param {HTMLElement} o
   * @param {string} v - element suggested type
   * @returns {string|boolean}
   */
  function checkType(o, v) {
    return (o && o.tagName && o.type) ? (v) ? (o.type.toLowerCase() === v.toLowerCase()) : o.type.toLowerCase(): (v) ? false :"";
  }

  /**
   *
   * @param {Array|*} arr
   * @returns {boolean}
   */
  function isArray(arr) {
    if( window.Array && Array.isArray ) return Array.isArray(arr);
    return typeof(arr) === 'object' && arr.length !== void 0;
  }

  /**
   *
   * @param {RegExp|string} pattern
   * @param {HTMLElement} startTag
   * @param {boolean} findFirst
   * @returns {Array}
   */
  function getElementByIdPattern(pattern, startTag, findFirst) {
    var o = [];
    if (!pattern || (typeof(pattern) !== "string"  )) return o;
    var re = makePatternRegExp(pattern);

    var st = (!startTag || !startTag.tagName) ? document.body : startTag;
    var elems = st.querySelectorAll("[id],label") , i = 0, el;
    while (el = elems[i++]) {
      if (el.id.search) {
        if (el.id.search(re) !== -1) {
          if (o === null) o = [el];
          else o[o.length] = el;
          if (findFirst) break;
        }
      }
      if(el.tagName.toLowerCase() === "label") {
        var str = el.getAttribute("for");
        if(str && str.search(re) !== -1){
          if (o === null) o = [el];
          else o[o.length] = el;
          if (findFirst) break;
        }
      }
    }
    return o;
  }


  function makePatternRegExp(pattern){
    if (!pattern || (typeof(pattern) !== "string" && !(pattern instanceof RegExp) )) return null;
    if(pattern instanceof RegExp) return pattern;
    return new RegExp("^\\b"+pattern+"\\b|_+"+pattern+"\\b|_+"+pattern+"_+|\\b"+pattern+"_+|-?\\b"+pattern+"\\b$|\\("+pattern+"\\)",'ig');
  }
  /**
   * @param {HTMLFormElement} form
   * @param {string} pattern
   * @param {int} mode - fields to collect
   0, false,null - all fields
   1 - just visible fields
   2 - just hidden fields
   */
  function getFormElementsByNamePattern(form, pattern, mode){
    var o = null;
    if(!form || !form.tagName) return o;
    var re = makePatternRegExp(pattern);
    if(!(re instanceof RegExp)) return o;

    var elems = form.tagName.toLowerCase()==="form" ? form.elements: form.querySelectorAll("[name]"), i = 0, el;
    while (el = elems[i++]) {
      if (!el.name || !el.name.search) continue; //element does not have name attribute
      var name = el.name.replace(/^\s+|\s+$/gm,'');
      if (name.search(re) === -1) continue; //mismatch pattern
      var elemType = el.type || "";
      if (mode){
        if (mode === 1 && (elemType.toLowerCase() === "hidden")) continue; //just visible fields needed
        if (mode === 2 && (elemType.toLowerCase() !== "hidden")) continue; //just hidden fields needed
      }
      if (o == null) o = [el];
      else o[o.length] = el;
    }
    return o;
  }

  // closest() polyfill
  function getClosest(elem, selector) {

    // Element.matches() polyfill
    if (!Element.prototype.matches) {
      Element.prototype.matches =
          Element.prototype.matchesSelector ||
          Element.prototype.mozMatchesSelector ||
          Element.prototype.msMatchesSelector ||
          Element.prototype.oMatchesSelector ||
          Element.prototype.webkitMatchesSelector ||
          function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
          };
    }

    // Get the closest matching element
    for ( ; elem && elem !== document; elem = elem.parentNode ) {
      if ( elem.matches( selector ) ) return elem;
    }
    return null;

  }

  /**
   * @see autoMask.js
   * @param {HTMLElement} field
   * @param {string} newMask
   * @param {boolean} errors
   * @param {object} setter
   * @returns {void}
   */
  function maskWork(field, newMask, errors, setter) {
    if (!field) {
      return;
    }
    var mask = field.getAttribute("mask"),
        haveMask = mask || false,
        regExp = field.getAttribute("regexp_rule"),
        haveRegExp = regExp || false,
        addNewMaskToField = false;

    if(haveMask || haveRegExp){
      /* there can be mask or regexp rule or them both on field*/

      /* setting condition is not Correct! So we have errors!*/
      if (errors) {
        // if we have the same mask/regexp_Rule to be removed, just do it.
        if (field._sxattrsetter === setter) {
          if (typeof(removeMaskFromField) === 'function') {
            removeMaskFromField(field);
          }
          field._sxattrsetter = null;
        } else {
          // we have to remove mask/regexp_rule but do not find it on field. So do nothing.
          return;
        }
      } else {
        /* setting condition is Correct! And none errors detected!*/
        // change mask if it is differ from current
        if (field._sxattrsetter !== setter) {

          // remove old mask from field
          if (typeof(removeMaskFromField) === 'function') {
            removeMaskFromField(field);
          }

          addNewMaskToField = true;
        }
      }
    } else {
      /* there are no mask and no regexp rule on field*/

      /* setting condition is not Correct! So we have errors!*/
      if (errors) {
        return; //nothing to do here
      } else {
        /* setting condition is Correct! And none errors detected!*/

        addNewMaskToField = true;
      }
    }

    if(addNewMaskToField) {
      // just add new mask(it also can be regexp_rule) to field
      if (typeof(setFieldMask) === 'function') {
        setFieldMask(
            field,
            newMask,
            {
              skipSetVal:true,
              force:true
            }
        );
      }
      field._sxattrsetter = setter;

      // make custom change Event to activate change handlers but with skip flag to prevent handling here in f2 method
      var ce = new CustomEvent("change", {
        detail: {"skipAttrActions": true}
      });
      field.dispatchEvent(ce);
    }
  }


  /**
   * log performance
   * @param {string} key - performance key
   * @param {boolean} end - end performance
   */
  function attractionsPerf(key, end){
    if(!attractionsLogPerformance) return;
    if(!window.console) return;
    key = 'attractions__' + key;
    if(!end) console.time(key);
    else console.timeEnd(key);
  }

  function getJq(){
    // -----
    // _jQuery - is module dependencie result
    // can be undefined, if there are no modules
    // -----
    // window.jQuery - used becase jQuery can be loaded anytime,
    // may be after attractions.js ,
    // or may be after page load
    // -----
    return _jQuery || window.jQuery;
  }

  /**
   *
   * actual usage : setFormBinders({form : HTMLFormElement, className : string, objId : string, callback : function, ...})
   *
   * @param {HTMLElement|object} form - form element or options object
   * @param {string|Array<string>} [className]
   * @param {string} [objId]
   *
   * @param {object|function} [options]
   * @param {function} [options.callback]
   * @param {string|HTMLElement|jQuery} [options.form]
   * @param {string} [options.objId]
   * @param {string|Array<string>} [options.className]
   * @param {function} [options.onAAToggleDisplay] - aaToggleDisplay callback
   * @param {boolean} [options.async] - is attractions async
   * @param {string} [options.skipBinders] - whether to skip binders. onInit - skip only on init Check; total - skip totaly, otherwise do not skip
   * @returns {boolean}
   */
  function setFormBinders(form, className, objId, options) {


    /* check if first argument is options object! Not Form Html Element. */
    if( typeof(form) === 'object' && form.form && typeof(form.form) === 'object' ) {
      options = form;
      form = options.form;
    }

    if( typeof(options) === 'function' ) {
      options = {callback : options};
    }

    if(!options || typeof(options) !== 'object' ) {
      options = {};
    }

    var callback = options.callback;
    if( typeof(callback) !== 'function' ) {
      callback = null;
    }

    form = form || options.form;
    className = className || options.className;
    objId = objId || options.objId || "";

    var jQuery = getJq();
    if( jQuery && form && form.jquery ) form = jQuery(form).get(0);
    if(!form) return false;
    if(!form.tagName) return false;

    options.objId = objId;
    options.className = className;
    options.form = form;

    var args = [options];
    var context = this;
    var isAsync = options.async || window.attractionsIsAsync;
    var isForced = options.force;

    jsonrpc = window.jsonrpc = jsonrpc || window.jsonrpc || new JSONRpcClient();

    if (form && isForced) {
      return _setFormBinders(options);
    }

    // synced attractions is deprecated
    // but used in a lot of projects,
    // so use it only on specified projects (at now)

    var _onSupported = function() {

       var _getAttrBinders = (isArray(className))? jsonrpc[options.basicMethod] : jsonrpc[altMethod];
      if( isAsync ) {
        attractionsPerf('setFormBinders_ASYNC', false);
        _getAttrBinders(function(obj){
          args.push(obj);
          _setFormBinders.apply( context, args );
          attractionsPerf('setFormBinders_ASYNC', true);
          if(callback) {
            callback( window._isExtFormsSupported );
          }
        }, className, objId);
      }
      else {
        args.push(_getAttrBinders( className, objId ));
        attractionsPerf('setFormBinders_SYNC', false);
        _setFormBinders.apply( context, args );
        attractionsPerf('setFormBinders_SYNC', true);
        if(callback) {
          callback( window._isExtFormsSupported );
        }
      }

    };

    jsonrpc.onReady(function(){
      if( window._isExtFormsSupported !== void 0 ) {
        _onSupported();
        return;
      }

      if( isAsync ) {
        jsonrpc['supported'](function( isSupported ) {
          if( window._isExtFormsSupported = isSupported ) {
            _onSupported();
          }
        });
      }
      else {
        if( window._isExtFormsSupported = jsonrpc['supported'] ) {
          _onSupported();
        }
      }
    });

    return true;
  }

  /**
   * setFormBinders logger
   * @returns {Console}
   * @private
   */
  function _getAttractionsLogger() {
    var defLogger = (new function(){this.log=function(){};this.warn=function(){}});
    if(!attractionsLogEnabled ) return defLogger;
    return window.logger || window.console || defLogger;
  }

  /**
   *
   * @param {object} options
   * @param {object} [obj]
   * @returns {boolean}
   * @private
   */
  function _setFormBinders(options, obj) {
    var form = options.form;
    var className = options.className;
    var objId = options.objId;
    var skipBinders = options.skipBinders || "";

    var fileMandatorySignData = {};
    // this prefix is used for signMandatory Action in Settings to find hidden field with signed data
    fileMandatorySignData.idPrefix = options.signDataFieldPrefix || "id_validityMarker_";

    // reset form elements cache
    resetFormCache(form);

    var getClassNameString = function(){
          return (isArray(className))?"":className;
        },
        myTrim = function(s){
          return (!s || typeof(s) !== "string") ? "" : s.replace(/^\s+|\s+$/gm,'');
        },
        escapeIdStr = function(id) {
          return (typeof(id) === "string") ? id.replace(/([/.@$()])/g, "\\$1").replace(/\s/g,"\\ ") : "";
        };

    var isEditMode = myTrim(objId) !== ""; // try to understand if we are on edit object form

    // start to set binders
    var d = window.document,
        jQuery = getJq(),
        logger = _getAttractionsLogger(),
        // this prefix is set in template (templates/console/actions/pubobj/includes/attrs/edit/inner_object.jsp)
        // we can get it from container(form or else) passed to attractions
        innerObjAttrPrefix = myTrim(form.getAttribute("data-attrPrefix")) || "",
        postfix = (!className && objId && objId.indexOf('@')>-1) ? objId.split('@')[1] : getClassNameString();

    /**
     *
     * @param {string} pattern - html tag identifier
     * @param {HTMLElement} startTag - container where we have to find html tag with identifier like pattern
     * @returns {HTMLElement || null}
     */
    var getElemById = function(pattern, startTag){
      var elem,holder = (!startTag || !startTag.tagName) ? document.body : startTag;
      if (typeof(pattern) !== "string" || !pattern || !holder.querySelector) return null;
      var selector = "#"+escapeIdStr(pattern);
      try {
        elem = holder.querySelector(selector);
      } catch(e){
        logger.warn('[attractions][getElemById] fail to got HTML element by "'+selector+'" selector! Get it by [id=...] selector.');
        elem = holder.querySelector('[id="'+pattern+'"]');
      }
      return elem;
    };

    /**
     *
     * @param {string} pattern - html tag name string
     * @param {HTMLElement} startTag - container where we have to find html tag with identifier like pattern
     * @returns {HTMLElement || null}
     */
    var getElemByName = function(pattern, startTag){
      var holder = (!startTag || !startTag.tagName) ? document.body : startTag;
      return (typeof(pattern) !== "string" || !pattern || !holder.querySelector)? null : holder.querySelector('[name="'+pattern+'"]');
    };
    /**
     *
     * @param {string|object} params
     * @param {string|Array<string>} params.id - field id or array of field ids
     * @param {string|Array<string>} params.name - field name or array of field names. Used if param.id is empty!
     * @param {string} [params.attrName] - attribute name to find field by name pattern
     * @param {boolean} [params.justHidden] - return only hidden field if true or visible field otherwise
     * @returns {HTMLElement}
     */
    var _elem = function(params) {
      if(!params) return null;
      var field;
      //try to find field by id attribute
      var i,len,id = (typeof(params)==="string")? params :params.id || "";
      if( form && attractionsSearchWithinForm ) field = getFormBinderFieldById(form, id);
      if(field) return field;

      if( typeof(id) === 'string') id = id?[id]:[];
      if((len=id.length) > 0) {
        for (i = 0; i < len; ++i) {
          if ((field = (postfix && getElemById(id[i] + '_' + postfix, form)) || getElemById(id[i], form))) {
            return field;
          }
        }
      }

      var fieldName = (typeof(params)==="string")? params :params.name || "";
      if(typeof(fieldName) === 'string') fieldName = fieldName?[fieldName]:[];
      if((len=fieldName.length) > 0) {
        for (i = 0; i < len; ++i) {
          if ((field = (postfix && getElemByName(fieldName[i] + '_' + postfix, form)) || getElemByName(fieldName[i], form))) {
            return field;
          }
        }
      }

      //try to find field by name attribute. Use name pattern for it
      var attrName = (typeof(params)==="object") ? params.attrName : "";
      if(!attrName) return null;
      var fields = getFormElementsByNamePattern(form, attrName, (params.justHidden?2:1));
      return (fields && fields.length)? fields[0]: null;
    };

    var attractionsOnValidated = window.attractionsOnValidated || function(opts) {
      opts = opts||{};
      var id = opts.id, hid = _elem({id:'id_' + id,attrName:id,justHidden:true});

      if (!opts.flag) {
        this.value = '';
        if (hid != this) hid.value = '';
        if (calendarField = _elem('cal_' + id)) calendarField.value = '';
      }
    };

    if (options.getAttrElem && typeof(options.getAttrElem) === 'function') {
      var defaultGetAttrElem = _elem;
      _elem = function(params) {
        return (options.getAttrElem(params, defaultGetAttrElem));
      }
    }

    /**
     *
     * @param {string} jsonString
     * @returns {object}
     */
    var _parseObj = function(jsonString) {
      try {
        logger.warn('[attractions] eval is deprecated for object parse!');
        return eval('(' + jsonString + ')') || {};
      }
      catch(e){
        logger.warn('cannot parse attractions object');
        return {};
      }
    };

    var
        sxFormHandler = {},
        data = _parseObj(obj),
        attrs = data.attrs || {},
        mandatoryAmounts = data.mandatoryAmount || {},
        listItemsAmount = data.listItemsAmount,
        settings = data.settings || {},
        values = data.values || {},
        hiddens = {},
        errorCss="attraction-error",
        _target,
        isInitializeMoment=false,
        depArray=[],
        session = {
          activatedFields:{}
        };

    var
        checkAndGetName = function(name){
          return (!name || typeof(name) !== "string") ? "" : ((innerObjAttrPrefix || "") + name);
        },
        getTarget = function(e) {
          if (!e && window.event) e = window.event;
          return ((!_target && !e) ? null : (_target || e.target || e.srcElement));
        },
        addEvent = function(o, type, f) {
          return ((o.addEventListener) ? o.addEventListener(type, f, true) : o.attachEvent("on" + type, function () {
            f.call(o)
          }));
        },
        getAttrName = function (field){
          if(!field) return "";

          var aname=(field.tagName)?field.getAttribute("attrName"):"",
              id=(field.tagName)?field.getAttribute("id"):(typeof(field)==="string")?field:"";

          if (typeof(id)!=='string') return "";
          if (id) id=id.replace('_'+postfix,'');

          if(!aname || aname==="") {
            var ida = (!id || id==="") ? [] :id.split('_');
            aname=(ida.length > 0 ) ? ida[ida.length-1]:"";
          }
          return aname;
        },
        makeCSSPattern = function (pattern,modifiers){
          if(!pattern || typeof(pattern)!=="string") return "";
          var  m = (!modifiers || typeof(modifiers)!=="string")?"":modifiers;
          return  new RegExp("^\\b"+pattern+"\\b|\\b"+pattern+"\\b$|\\s+\\b"+pattern+"\\b\\s+",m);
        },
        removeClass = function (tag,cssName){
          if(!tag || !tag.tagName) return;
          tag.className = tag.className.replace(makeCSSPattern(cssName,"ig"),"");
        },
        addClass = function addCssClass(tag,cssName){
          if(!tag || !tag.tagName) return;
          if(!hasClass(tag,cssName)) tag.className = tag.className + " " + cssName;
        },
        hasClass = function (tag,cssName) {
          if(!tag || !tag.tagName) return false;
          return tag.className.search(makeCSSPattern(cssName,"ig"))!==-1;
        },
        /**
         * Check if field is empty
         * @param fld
         * @return {boolean}
         */
        isNotFilled = function(fld){
          var field = (fld.tagName)?fld:(fld.obj)?fld.obj:null;
          if(!field) return true;
          if (fld && fld.uploadifyItem) {
            var fileId = field.getAttribute("id");
            //check multiload elements existence
            var items = getElemById("upload" + fileId + "-queue", form);
            if (items && items.children.length === 0) {
              return true;
            }
          } else if (field.value === null || myTrim(field.value) === "" ||
              (checkType(field,'checkbox') && field && !field.checked) ) {
            return true;
          }
          return false;
        },
        isActiveField=function(o) {
          return (o && !o.disabled && !o.readOnly);
        },

        aaToggleDisplay = function(el, isHidden, isGroup) {

          if( typeof(options.onAAToggleDisplay) === 'function' ) {
            var res = options.onAAToggleDisplay.apply(this, arguments);
            //TODO why we use result of external function ? Check this moment.
            // it seems like we have to make return without any conditions because this external function fully overwrites standard method
            if( res === false ) {
              return;
            }
          }

          // set flag that we manage view of this group by direct attraction rules.
          // so we have to skip any manipulations with this group from toggleEmptyGroup
          if(isGroup) {
            el.setAttribute("skipSwitchViewIfEmpty", true);
          }

          if( isHidden ) {
            el.style.display = 'none';
            el.setAttribute('hidden', true);
          }
          else {
            el.style.display = '';
            el.removeAttribute('hidden');
          }
        },

        handleRelativeSelect = function (o, field, attr_name, itemStringValue, depArray, objId, className, errors) {

          if (errors) {
            field.options.length = 1;
            field.prevDepVals = null;
            return (false);
          }

          if (o.value !== '') {

            var params = {}, option, defValue = field.value, prevDepVals ='';

            for (var i=0, key, tmpEl, val; key=depArray[i++];) {
              tmpEl = _elem('id_'+checkAndGetName(key));
              val = (tmpEl) ? tmpEl.value : '';
              params[key.split('.').pop()] = val;
              prevDepVals+= ((prevDepVals.length)?',':'')+key+'='+val;
            }

            params["sbr_attr"] = itemStringValue.split('.').pop(); //in case of nested object we use only original part of name
            params[itemStringValue] = field.defaultValue||'';
            params["sbr_obj_id"] = objId;
            params["sbr_class"] = className;

            if (field.prevDepVals === prevDepVals) return (false);
            field.prevDepVals = prevDepVals;

            var ajaxParams = {
              "javaClass": "java.util.HashMap",
              "map": params
            };

            field.parentNode.className += ' ajax-loading';
            jsonrpc['getSelectBoxAttrValues'](function (result) {
              try {
                field.options.length = 1;
                var map =  result.map;
                for (var key in map) {
                  if(!map.hasOwnProperty(key)) continue;
                  option = document.createElement("OPTION");
                  option.text = map[key].title;
                  option.value = key;
                  option.selected = key === defValue;

                  if (map[key].disabled === true) {
                    option.disabled = true;
                  }
                  field.add(option);
                }

              } catch (ex) {
                if (window && window.console && window.console.error) {
                  console.error("Control.SimpleList.ajaxLinkAttr:Control.SimpleList.findById: ", ex.message, ex.stack);
                }
                field.prevDepVals = null;
              }

              field.parentNode.className = field.parentNode.className.replace(/\s*ajax-loading/g, '');
            }, ajaxParams);
          }
        },

        getDateFieldValue = function(field,attrName){
          if(!field || !field.tagName || !attrName || attrName ==="") { return undefined;}

          var re = makePatternRegExp('cal');
          //check if current field is visible(with calendar)
          var isDateField = ((re instanceof RegExp)? field.id.search(re) : field.id.indexOf('cal')) >= 0;

          // try to find hidden field with timestamp value or suppose that current field is hidden
          var hidden;
          if(isDateField) {
            hidden = _elem({id:'id_' + attrName, attrName:attrName, justHidden:true});
            if (!hidden) {return undefined; }
          } else {
            hidden = field;
          }

          if (hidden.value === '') { return '';}

          var v = hidden.value * 1;
          if(isNaN(v)) { return undefined; }

          var dateType = "date";
          if(typeof(field.getType)==="function") dateType=field.getType(); // method getType for date fields defines in cal2.js

          var m, d1 = new Date(v);
          if(dateType === "date") {
            d1.setHours(0,0,0,0);
          }
          m = d1.getMonth()+1;
          return  ""+d1.getFullYear()+(((m < 10) ? "0" : "") + m) +(((d1.getDate() < 10) ? "0" : "") + d1.getDate());
        },



        // key (string) attr code name. Do init only that setting which have this KEY in attrs array
        init_groups = function (key) {

          logger.log('[attractions] init_groups()');

          detach();
          var haveKey = key && attrs[key];

          session.activatedFields = {};
          for (var i in attrs) {
            if(!attrs.hasOwnProperty(i)) continue;
            if (haveKey && i !== key ) {
              continue;
            }
            if (attrs[i].settings) {
              (function(i){
                var _wrapInit = function(){
                  attractionsPerf('get attribute field'+i, false);
                  //first of all search for calendar field, then field with "id_"(it can be visible such as select or input for string type, and it can be hidden for link type attrs )
                  var t = _elem({id:['cal_'+i, 'id_'+i, 'title_'+i],attrName:i});
                  attractionsPerf('get attribute field'+i, true);

                  // TODO : check possible problems with values map for InnerObject Case!
                  if (t === null && values[i]) t = i; //handle readonly;
                  else {
                    try{
                      t.setAttribute("autocomplete","off");
                    } catch(ex){
                      logger.log('[attractions] try to add autocomplete=off attr to field. FAILED ', t);
                    }
                  }
                  attractionsPerf('init_settings_'+i, false);
                  initSettings(t, true);
                  attractionsPerf('init_settings_'+i, true);
                };
                if(attractionsIsAsync) setTimeout(_wrapInit, 0);
                else _wrapInit();
              })(i);
            }

            if(skipBinders === "onInit" || skipBinders === "total") { continue; }

            var attrBinders = attrs[i].binders;
            attrBinders && !haveKey && (function(i){
              var _bindersInit = function () {
                if (document.readyState === 'complete') {
                  var t = _elem({id: ['cal_' + i, 'id_' + i, 'title_' + i], attrName: i});
                  if (t) (t.value !== '') ? validateField(t, i) : (function () {
                    var _handlername = t.getAttribute('data-actionhandler'),
                        _handler = (_handlername) ? window[_handlername] : t['data-actionhandler'];
                    if (typeof (_handler) === 'function')
                      for (var _i in attrBinders) {
                        if(!attrBinders.hasOwnProperty(_i)) continue;
                        _handler.call(null, t, attrBinders[_i] || [], true);
                      }
                  })();
                }
              };

              (document.readyState === 'complete') ? _bindersInit() : addEvent(document, 'readystatechange', _bindersInit);
            })(i);
          }

          reattach();
        },
        set_val = function (name, value, setnew, skipChangeIfNotEmpty, makeChangeOnlyForMandatoryAttr) {

          //evaluate if value is an object converted to a string
          if (typeof (value) === 'string' && value.indexOf('{')===0 && value.indexOf('}')===value.length-1) {
            value = eval('('+value+')');
          }

          var elem = _elem({name:'data('+name+')'}) ,
              changedElems;
          var elems = changedElems = (elem && elem.tagName) ? [elem] : elem || [];
          var e, i = 0, j = 0, title, cal, val=(typeof(value)==='string') ? value : value.value;

          if (typeof (val) === 'string' && val.indexOf('\'')===0) {
            //sometimes a string value comes with additional commas - we remove them
            val = val.replace(/'/g,'');
          }

          while (e = elems[i++]) {
            if (setnew && e._prevval === undefined) {
              e._prevval = checkType(e, 'checkbox') ? e.checked.toString() : e.value;
            }

            var currentFieldValue = checkType(e, 'checkbox') ? e.checked.toString() : e.value;
            var fieldMask = e.getAttribute("mask") || "";
            if(fieldMask && currentFieldValue) {
              if(typeof(e.__unmaskedvalue) === "function") {
                currentFieldValue = e.__unmaskedvalue(currentFieldValue, fieldMask);
              }
            }

            if(skipChangeIfNotEmpty && currentFieldValue !== "") {
              continue;
            }
            // in edit mode with meta flag notWriteValue = true and set New value to field only if it is mandatory
            if(isEditMode && currentFieldValue === "" && makeChangeOnlyForMandatoryAttr) {
              var mandatory = e.getAttribute("ismandatory") || e.getAttribute("isMandatory") || "";
              if(!mandatory || mandatory.toLowerCase() !== "true") {
                continue;
              }
            }

            if(!setnew) {

              if(val !== currentFieldValue){
                continue;
              }
              if(e._prevval !== undefined) {
                val = e._prevval;
              }
            }

            if (checkType(e, 'checkbox')) {
              e.checked = (val === 'true');
            } else if (checkType(e, 'radio')) {
              e.checked = (val === e.value);
            } else if (e.selectedIndex !== undefined) {
              var opt;
              j=0;
              while (opt = e.options[j++]) {
                if (opt.value === val) e.selectedIndex = j-1;
              }

              // make custom change Event to activate change handlers but with skip flag to prevent handling here in f2 method
              var ce = new CustomEvent("change", {
                detail: {"skipAttrActions": true}
              });
              e.dispatchEvent(ce);

            } else if (checkType(e,'hidden')) {
              var formElems = getFormElementsByNamePattern(form,name,1);
              title = (formElems && formElems.length)?formElems[0]:null;
              cal = _elem('cal_'+name);

              if (title && title!=cal) {
                if(checkType(title,"checkbox")){
                  if (title._prevval === undefined) {
                    title._prevval = e._prevval; //set to checkbox the same default value as hidden have
                  }
                  title.checked = (setnew) ? (val == 'true') : (title._prevval == 'true');
                } else {
                  if (title._prevval === undefined) {
                    title._prevval = title.value;
                  }
                  title.value = (setnew) ? (value.title)? value.title : val : title._prevval;
                }
                e.value = (setnew) ? val : (e._prevval || "");
              }
              else {
                e.value = val;
                if (cal && !isNaN(val*1)) {
                  // push calendar element to results
                  // parent caller function
                  // should know we've changed
                  // value of the calendar field

                  // update value
                  if(val === '') {
                    cal.value = val;
                  }
                  else {
                    // if calendar value != "" then we try to get it
                    if (window.getFormatedDate) {
                      var dateObj = new Date();
                      var isAsync = typeof define === 'function' && define.amd;
                      if( isAsync && window.tzFix ) {
                        (function(dateObj, cal, val){
                          tzFix.fixTimeZoneIn(val, function(val) {
                            dateObj.setTime(val);
                            cal.value = getFormatedDate(dateObj);
                          });
                        })(dateObj, cal, val);
                      }
                      else {
                        dateObj.setTime((window.tzFix) ? tzFix.fixTimeZoneIn(val) : val);
                        cal.value = getFormatedDate(dateObj);
                      }
                    }
                  }

                }
              }
            } else {
              e.value = val;
            }
          }

          if (elems.length > 0) {
            initSettings(elems[0]);
          }

          return changedElems;
        },

        /*  execute one validator of any type
         *  return true/false
         *  params.field - form Field tag or readOnly Value
         *  params.validator - validator object
         *  params.isBinder - handle validator over single field (binder)
         */
        handleValidator = function(params){
          if(!params || typeof(params)!=="object") return true;
          var result,field = params.field || null,
              validator = params.validator || null;
          if(!field || !validator || typeof(validator)!=="object") return true;
          switch(validator.type){
            case "complex":
              var valid, op=(typeof(validator.operator)==="string" && validator.operator!=="")?validator.operator:"&&",
                  cvs = (!validator.value || typeof(validator)!=="object")? {} : validator.value;
              for (var i in cvs) {
                valid = handleValidator({"field":field, "validator":cvs[i], "isBinder":(params.isBinder || null)});
                if(op === "&&") {
                  if(!valid) {
                    result = false;
                    break;
                  }
                  result=true;
                } else {
                  result =  (result || valid);
                }
              }
              cvs = null;
              break;
            case 'simple':
            default:
              result = use_validator(field, validator, (params.isBinder || null));
              break;
          }
          return result;
        },


        isnull_func = function() {return (arguments[0] === '')},
        like_func = function() {return (arguments[0].indexOf(arguments[1])>-1)},

        cond_handler = {
          'IS NULL': isnull_func,
          'IS NOT NULL': isnull_func /* we use same method, later invert value */ ,
          'LIKE': like_func,
          'NOT LIKE': like_func /* we use same method, later invert value */ ,
          'default':function(v, v2, operator) {return (eval("v " + operator + " v2"));} // default method
        },

        //isBinder - handle validator over single field (binder)
        use_validator = function (field, validator, isBinder) {

          logger.log('use_validator', field );

          var i, is_tag = (typeof(field) !== 'string'), success = false, vals,
              id = (is_tag) ? getAttrName(field) : field, v = '';

          if( is_tag && field.type ) {
            v = field.type.toLowerCase() === 'checkbox' ? field.checked.toString() : field.value;
            // if field has mask and field is empty and has focus it can be that field.value === mask, so make value empty in this case
            if(myTrim(field.getAttribute("mask")) === v) {
              v = "";
            }
          }
          else
          if( id !== '' && typeof(values[id])==="object" && values[id] ) {
            v = values[id].value;
          }

          var attrType = ( id && typeof(attrs[id])==="object" && attrs[id].type )? parseInt(attrs[id].type) : 0;
          attrType = (isNaN(attrType))? 0 : attrType;

          //if readonly mode and attr value = null skip all chekings and return false.
          // Additional logic to prevent check of 'erased' fields or groups
          //in case of validating field(handle binders) we have to return TRUE, to skip checkings and skip error message appear
          //if(!is_tag && v=='null' || is_tag && field.disabled && field._defaultDisabled !== undefined) return (isBinder==true);

          if(!is_tag && v == 'null') return (isBinder === true);
          if(is_tag && field.disabled && field._defaultDisabled !== undefined) {
            if(isBinder) return true; // we have to return TRUE only in case of binders! In case of settings we have to continue validating
          }

          // check if this hidden field contains file id. if so we do not separate it with ","
          vals = (is_tag && field.type === 'hidden' && myTrim(field.getAttribute('data-filesize')) === "") ? ((field.value.charAt(0) === ",")? field.value.slice(1):field.value).split(',') : [v];
          if(!is_tag && v && v.indexOf('[')===0) try {eval('vals='+v)}  catch(e) {}

          var _handleValue = function(str, type) {
            switch (type) {
              case 'dictionaries2':
               try {
                 return str.replace(/\$\d+\$\d+/,'').replace(/V\d+\.dictionaries2/,'')
               } catch(e) {
                 console.log(e)
               }

              default:
                return str;
            }
          }

          var operator, valRes;
          switch (validator.type) {
            case 'regexp':
              for (i=0; i<vals.length; i++) {
                v= myTrim(vals[i]);

                try {
                  if (!v.match(new RegExp(validator.value))) {
                    success = false; continue;
                  }
                } catch (e) {
                  success = false; continue;
                }

                success = true; break;
              }
              break;

            case 'cond':
              for (i=0; i<vals.length; i++) {
                v = myTrim(vals[i]);

                if (v !== '') {
                  try {
                    if(isNaN(v * 1)) {
                      var w = v.replace(",","."); //maybe we have float number with "," instead of "." so we try to change only first ","
                      if(!isNaN(w * 1)) v = w*1;
                    } else v = (v>Number.MAX_SAFE_INTEGER&&window.BigInt)?BigInt(v):Number(v);
                  }
                  catch (e) {}
                }

                if (is_tag) {
                  // make additional checks for attrs with type Date (attrType = 5)
                  if(attrType === 5) {
                    v = getDateFieldValue(field, id);
                    if(v === undefined) { success = false; continue;}
                  }
                }
                operator = (validator.operator || "").toUpperCase();
                if(typeof(operator)==="string" && operator!=="") {
                  valRes = false;
                  try {
                    var v2 = (typeof v == 'bigint') ? BigInt(validator.value) : validator.value;
                    valRes = (cond_handler[operator] || cond_handler['default'])(_handleValue(v, validator.typeObj), _handleValue(v2, validator.typeObj), operator);
                  } catch (e) {}
                  if (!valRes) {
                    success = false;
                    continue; /*return (false);*/
                  }
                }

                success = true;
                break;
              }
              if (operator === 'NOT LIKE' || operator === 'IS NOT NULL') success = !success;
              break;

            case 'file':
              var isFileField = checkType(field,"file");
              var isHiddenField = checkType(field,"hidden");
              if(!isFileField && !isHiddenField) {
                //skip check if field type is text! Check only file or hidden fields
                success = true;
                break;
              }
              var form = field && field.closest('form');
              var fileField = form ? form.querySelector('#file_' + field.id) : null;
              var skipFilesizeValidate = isSkipFilesizeValidate(field) || isSkipFilesizeValidate(fileField);
              for ( i=0; i<vals.length; i++) {
                v = myTrim(vals[i]).toLowerCase();
                if( skipFilesizeValidate || v === '' ) {
                  // if field value is empty - skip check
                  success = true;
                }
                else
                if(v !== '' || (field.getAttribute('data-filesize') && field.getAttribute('data-filename'))) {
                  var fileTypes = validator.typeFile || '';
                  var haveTypesCondition=(typeof(fileTypes)==="string" && fileTypes!=="");

                  if(haveTypesCondition) {
                    var thisFileType = getFileExtension(v || field.getAttribute('data-filename'), isHiddenField);
                    var goodFileType=false,
                        fileTypesArray = fileTypes.split(',');
                    for (var j = 0; j < fileTypesArray.length; j++) {
                      var fileType = myTrim(fileTypesArray[j]);
                      if (thisFileType === fileType) {
                        goodFileType = true;
                        break;
                      }
                    }
                    success = goodFileType;
                    if(!success) {
                      break;
                    }
                  }
                  //  if(!haveTypesCondition || (haveTypesCondition && success)) {
                  var maxSize = validator.maxSize || ''; // Mb
                  if(maxSize !== null && maxSize !== void 0 && maxSize !== "") {
                    var msie = !!window.ActiveXObject, size;
                    if(isFileField ) {
                      if (field.files && field.files.length) {
                        //get fileSize in bytes
                        size = field.files[0].size;
                      }
                      else
                      if (msie) {
                        var fso = new ActiveXObject("Scripting.FileSystemObject");
                        var filepath = field.value;
                        var thefile = fso.getFile(filepath);
                        //get fileSize in bytes
                        size = thefile.size;
                      }
                    } else {
                      //get fileSize in bytes
                      size =  field.getAttribute('data-filesize');
                    }
                    if (!size) {
                      success = false;
                      break;
                    }

                    //use MegaBytes in Validation, so convert KiloBytes to MegaBytes
                    var sizeInMB = size / 1048576; // bytes to Mb;
                    if (sizeInMB > maxSize) {
                      success = false; break;
                    }
                    success = true;
                  }

                  // if file is valid do upload it and save its size to hidden;
                  if(success && isFileField){
                    var hidElem = _elem({id:'id_' + id,attrName:id,justHidden:true});
                    if(hidElem) hidElem.setAttribute('data-filesize',size);
                  }

                }
              }
              break;

              /* This validator check if attribute have empty or notEmpty(depends on isEmpty setting) default value in form field. Default Value itself was set in Meta settings of this attribute.
                 we check 3 conditions by "and":
                 1) attribute have default value in its Meta settings
                 2) the moment of validation is the moment of initialization of attractions ( the html code with this attribute was just loaded)
                 3) the form field which is representing this attribute is empty or not empty (have value)
               */
            case 'defvalmetaattr':
              var checkEmpty = validator.isEmpty || false;
              var initDefValIsEmpty = (is_tag)? field.getAttribute("_initDefValIsEmpty"): myTrim(v) === "";
              if (!isInitializeMoment) {
                return checkEmpty ? initDefValIsEmpty === "true" : initDefValIsEmpty !== "true";
              }
              var validatorData = (typeof(validator.value) === "object" && validator.value.length) ? validator.value : [];
              var validatorParams = (validatorData[0] && typeof(validatorData[0]) === "object") ? validatorData[0]:{};
              var haveMetaDefValue = validatorParams.defValMeta === 'true' && values[validatorParams.attrCode] && values[validatorParams.attrCode].value !== "";
              for (i=0; i<vals.length; i++) {
                v = myTrim(vals[i]);
                var checkField = checkEmpty ? v === "" : v!=="";
                if(haveMetaDefValue && isInitializeMoment && checkField) {
                  success = true;
                  if(is_tag) {
                    field.setAttribute("_initDefValIsEmpty", v==="");
                  }
                  break;
                }
                success = false;
              }
              break;

            case 'condattr':

              var field2 = _elem({id:'id_'+validator.value,attrName:validator.value}),
                  v2 = (field2) ? field2.value : values[validator.value] || '';

              //skip if value2 is empty
              if (v2 === '') {success = true; break;}
              if(attrType === 5) {
                v2 = getDateFieldValue(field2, validator.value);
                if(v2 === undefined) { success = false;}
              }

              for ( i=0; i<vals.length; i++) {
                v=vals[i];

                if (is_tag) {
                  // make additional checks for attrs with type Date (attrType = 5)
                  if(attrType === 5) {
                    v = getDateFieldValue(field, id);
                    if(v === undefined) { success = false; continue;}
                  }
                }

                operator = validator.operator || "";
                if(typeof(operator)==="string" && operator!=="") {
                  valRes = false;
                  try {
                    valRes = (cond_handler[operator.toUpperCase()] || cond_handler['default'])(v, v2, operator);
                  } catch (e) {}
                  if (!valRes) {
                    success = false;
                    continue;
                  }
                }
                success = true;
                break;
              }

              break;

              /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                 !!!!  This type of Validator could possibly be very harmful for the stable work of the system! So PLEASE do NOT use it!
                 !!!!  this validator is strictly deprecated!
                 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  */
            case 'function':
              for ( i=0; i<vals.length; i++) {
                v=vals[i];

                try {
                  eval('var f=' + validator.value);
                  if (typeof(f)==="function" && !f(v)) {
                    success = false; continue;
                  }
                } catch (error) {
                  logger.error('[attractinos][use_validator] Error at eval validator', error);
                  success = false; continue;
                }

                success = true; break;
              }
              break;
          }

          return (success);
        },

        isSkipFilesizeValidate = function (field) {
          var skip = field && field.dataset ? field.dataset.skipFilesizeValidate : false;
          return skip === true || skip === 'true' || skip === '1';
        },

        /**
         *
         * @param {HTMLElement} fieldEl
         * @param {string} [attrName]
         * @returns {boolean}
         */
        validateField = function (fieldEl, attrName) {
          var validators, id = attrName || getAttrName(fieldEl);
          var binders = (id==="" || !attrs[id]) ? {} : (typeof(attrs[id].binders)==="object")?attrs[id].binders:{};
          var result = true, valid, showMessage = false, messages = [];
          var isFileField = false;

          var i,x, binder;
          for (i in binders) {
            if(!binders.hasOwnProperty(i)) continue;
            if(!(binder = binders[i])) continue;
            validators = binder.validators || {};
            valid = true;

            var skipFilesizeValidate = false;
            if( fieldEl && fieldEl.dataset ) {
              skipFilesizeValidate = fieldEl.dataset.skipFilesizeValidate;
              if(typeof(skipFilesizeValidate) !== 'boolean' ) {
                skipFilesizeValidate = skipFilesizeValidate === 'true' || skipFilesizeValidate === '1';
              }
            }

            if(!skipFilesizeValidate ) {
              // loop trought validators
              for (var j in validators) {
                if(!validators.hasOwnProperty(j)) continue;
                valid = (valid && handleValidator({"field":fieldEl, "validator":validators[j], "isBinder":true}));
                if(!valid) break;
              }

              // if not valid
              if(!valid) {

                // reset file field
                isFileField = (validators[j].type === "file" || checkType(fieldEl, 'file'));
                if( isFileField && typeof(window.resetMyFile) === 'function' ) {
                  // there are 2 different id variants of file field: file_id_attrKey[_className]  where  attrKey=(attrPrefix+attrName)- just in core!
                  // so we have to get field id and cut everything after "id_"
                  var a, realAttrName = (a=fieldEl.id)? a.substring(((x=a.indexOf("id_"))===-1)?0:x+3) : id;
                  window.resetMyFile.call(fieldEl, realAttrName);
                }

                // prepare message
                // affix will be added for multiple messages
                messages = attractionsPushMessage(binder.message, messages);

                // forced to be valid
                if(binder.forcedsave === true) {
                  valid = true; // override error flag due to meta Settings
                  showMessage = true;
                }
              }
            }

            // accumulate result
            result = (result && valid);

            if(!result) {
              break;
            }
          }

          // concat message
          messages = messages.join("\n");

          var skipErrorIndication = false;
          var errHandler,errClass=errorCss,
              row = _elem('row_' + id),
              atools = form.attractionsTools;
          if(atools && typeof(atools) === "object" ) {
            if(x=atools["errorCss"]) errClass = x;
            if(x=atools["errHandler"]) errHandler = x;
          }

          if(!result || showMessage) {
            if(typeof(errHandler)==="function") errHandler(fieldEl,false,messages);
            else {
              if(isFileField) {
                // for NoN mandatory file Attrs we will show just error message and skip error indication!
                // because wrong file was not applied and the file attr value is empty!
                var hiddenFld = _elem({id:'id_' + attrName, attrName:attrName, justHidden:true});
                if(hiddenFld) {
                  var mandatory = hiddenFld.getAttribute("ismandatory") || hiddenFld.getAttribute("isMandatory") || "";
                  if (myTrim(hiddenFld.value) === "" && (!mandatory || mandatory.toLowerCase() !== "true")) {
                    skipErrorIndication = true;
                  }
                } else {
                  logger.warn('[attractions][validateField][validate FILE field] WARNING! Hidden field for attribute "'+attrName+'" not found!', fieldEl);
                }
              }
              if(row && !skipErrorIndication) addClass(row,errClass);
              try {
                var hasTitle = attrs[id] && typeof(attrs[id].title) === "string" && attrs[id].title !== "";
                var attrTitle = hasTitle && !isFileField ? attrs[id].title + "\n" : "";
                attractionsAlert(attrTitle + messages);
              } catch (e) {
                // nothing
              }
            }
          } else {
            if(typeof(errHandler)==="function") errHandler(fieldEl,true,messages);
            else {
              if(row) removeClass(row,errClass);
            }
            // try to find custom handler on the field and execute it if it exists
            var handlerName = fieldEl.getAttribute("data-actionhandler");
            var handler = (typeof(handlerName)==="function") ? handlerName : (handlerName && handlerName!=="")? window[handlerName] :fieldEl['data-actionhandler']||null;
            if (typeof(handler)==="function") handler.call(null, fieldEl, binder, result);
          }

          // garbage collector
          validators = null;
          binders = null;

          return skipErrorIndication ? true : result;
        },

        /*  test condition of any type (simple or complex)
         *  return true/false
         *  params.field - field to check
         *  params.condition - condition object
         */
        handleCondition = function(params){
          if(!params || typeof(params)!=="object") return (false);
          var condition = params.condition || null;
          if(!condition || typeof(condition)!=="object") return (false);
          var i,result, valid, items=(!condition.value || typeof(condition)!=="object")? {} : condition.value;
          switch(condition.type){
            case "complex":
              var op=(typeof(condition.operator)==="string" && condition.operator!=="")? condition.operator : "&&";
              for ( i in items) {
                valid = handleCondition({"field":params.field,"condition":items[i]});
                if(op === "&&") {  // AND
                  if(!valid) {
                    result = false;
                    break;
                  }
                  result=true;
                } else {  // OR
                  result = (result || valid);
                }
              }
              break;
            default:
              var j,attr;
              result=true;
              for (i in items) {
                if(!items.hasOwnProperty(i)) continue;
                attr = items[i];

                depArray.push(i);

                var validators = attr.validators || {},
                    re = new RegExp("^(id_|cal_|title_|file_id_)?"+(checkAndGetName(i))+"$","ig"),
                    field = (params.field && params.field.tagName && params.field.id.search(re)===0)? params.field : _elem({id:['cal_'+i,'id_'+i,'title_'+i,'file_id_'+i,i]});

                valid = true;
                for (j in validators) {
                  if(!validators.hasOwnProperty(j)) continue;
                  valid = (valid && handleValidator({"field":field || i, "validator":validators[j]}));
                  if(!valid) break;
                }
                result = (result && valid);
                if(!result) break;
              }
              break;
          }
          items = null;
          return result;
        },

        toggleElem = function (t, turn_on, caller) {
          var elems = t.getElementsByTagName('*');
          for (var i = 0, o; o = elems[i]; i++) {
            if (o._defaultDisabled === undefined) o._defaultDisabled = (!turn_on && o.disabled) ? true : false;

            if (o.form && o.id && !o._defaultDisabled) {
              if (o.selectedIndex !== undefined) {
                o.disabled = !turn_on;
              } else if (o.checked) {
                o.disabled = !turn_on;
              } else {
                o.disabled = !turn_on;
              }
            }
          }
        },

        //<editor-fold desc="form detach-reattach">
        _ = {},
        detach = function() {
          if( !attractionsDetachFormOnExecute ) return;
          if( _.form ) return;
          _.parent = form.parentNode;
          if(!_.parent) return;
          _.form   = form;
          _.next   = form.nextSibling;
          _.parent.removeChild(form);
        },
        reattach = function() {
          if( !attractionsDetachFormOnExecute ) return;
          if( !_.form ) return;
          if( _.next ) _.parent.insertBefore(_.form, _.next);
          else _.parent.appendChild( _.form );
          _.parent = _.next = _.form = null;
          delete _.parent, _.next, _.form;
        },
        //</editor-fold>

        initSettings = function (o, initialize) {
          if (!o) return (false);

          isInitializeMoment = initialize || false;
          logger.log('[attractions] init_settings()');

          var attr_name = (typeof(o) === 'string') ? o :getAttrName(o),
              attr = attrs[attr_name],
              form = (o.tagName) ? o.form : null;

          var field,i, j, k, z, itm, objitm, conditions, actions, errors;
          var settings = (attr && typeof(attr)==="object") ? attr.settings:{};
          var changedElements = [];

          for (i in settings) {
            if(!settings.hasOwnProperty(i)) continue;
            /*--- check conditions ---*/
            conditions = settings[i].conditions;
            var valid = true,haveConds=false;

            logger.log('[attractions] before conditions');

            for (j in conditions) {
              if(!conditions.hasOwnProperty(j)) continue;
              haveConds=true;

              depArray.length = 0;

              valid = (valid && handleCondition({"field":o,"condition":conditions[j]}));
              if(!valid) break;
            }

            logger.log('[attractions] after conditions');

            errors = (!haveConds || (haveConds && !valid));

            /*--- make actions ---*/
            actions = settings[i].actions;
            for (j in actions) {
              if(!actions.hasOwnProperty(j)) continue;
              if(!actions[j].value) continue;
              var itms;

              if( typeof(actions[j].value) === 'object' && actions[j].value !== null) {
                itms = actions[j].value;
              }
              else {
                // @deprecated
                logger.warn('[attractions] eval is deprecated for ', actions[j].value );
                eval('itms=(' + actions[j].value + ')');
                actions[j].value = itms;
              }

              if( typeof(itms)!=="object" && !itms.length ) {
                itms = [];
              }

              for (k = 0; k < itms.length; k++) {
                itm = itms[k];
                var dependentAttrCode = "",
                    actionType = actions[j].type.toLowerCase();

                var pattern, // Pattern for search by id. Pattern is used in getElementByIdPattern! We make RegExp there!
                    itemStringValue, // if itm is String then we put it value here
                    itemObjectKey,itemObjectValue; // if itm is Object( examp: mask value) then we put its value here

                if(typeof(itm)!=="object") {
                  itemStringValue = checkAndGetName(itm);
                  dependentAttrCode = itemStringValue;
                  pattern = (itemStringValue.indexOf('group_') >= 0) ? itemStringValue.replace(/group_/, '') : itemStringValue;

                  field = _elem({id:'id_' + itemStringValue,attrName:'id_' +itemStringValue});   // try to search by ID with fixed prefix "id_"

                  if (field && checkType(field,'hidden')) {
                    //hidden is not operable => search root of widget
                    var fieldNew = null;
                    //checkbox
                    var fieldTmp = _elem('title_' + itemStringValue);
                    if ((fieldTmp) && (checkType(fieldTmp,"checkbox")) ) {
                      fieldNew = fieldTmp;
                    }
                    //selectBox
                    if (!fieldNew) {
                      fieldTmp = _elem('selectBox_' + itemStringValue);
                      if (fieldTmp) {
                        fieldNew = fieldTmp;
                      }
                    }
                    //linkobj
                    if (!fieldNew) {
                      fieldTmp = _elem('linkobjCaption_' + itemStringValue);
                      if (fieldTmp) {
                        fieldNew = fieldTmp;
                      }
                    }

                    if (fieldNew) {
                      field = fieldNew;
                    }
                    fieldNew = null;
                    fieldTmp = null;

                  }
                } else {
                  for(objitm in itm) {
                    // in common case we have only one pair(key:value) to make changes to the field
                    // it is looking strange when we set several values to the same field one by one in same time!
                    // so we get only one(last) pair from itm object. Commonly it is first and the last at the same time.
                    itemObjectKey = checkAndGetName(objitm);
                    dependentAttrCode = itemObjectKey;
                    itemObjectValue = itm[objitm];

                    field = _elem({id:'id_' + itemObjectKey, attrName:'id_' + itemObjectKey});
                    if (field && checkType(field,'hidden')) {
                      var field2 = _elem('title_' + itemObjectKey);
                      if (checkType(field2,"checkbox") ) field = field2;
                    }
                  }
                  pattern = itemObjectKey || "";
                }

                //check if this dependent attribute was activated already. It can be activated once with each actionType if there was no errors!
                if(errors) {
                  var saf = session.activatedFields, found=false;
                  for(z in saf){
                    if(!saf.hasOwnProperty(z)) continue;
                    var doneActions = saf[z]+"";
                    if(z === dependentAttrCode && doneActions.indexOf(actionType) !== -1) {
                      found=true;
                      break;
                    }
                  }
                  if(found) continue;
                }

                var el, titleElem, spans, elems, tagName;
                var usedFormTags = ['input','select','textarea','label'];
                switch (actionType) {
                  case 'signmandatory':
                    var signMarkerPattern = fileMandatorySignData.idPrefix + pattern,
                        signMarker=null,signStatusField;
                    elems = getElementByIdPattern(signMarkerPattern, form, false) || [];
                    elems.forEach(function(el) {
                      // loop through array of founded by pattern tags
                      // and skip form tags here...
                      tagName = el.tagName.toLowerCase();
                      // skip label tags in this handle
                      if (usedFormTags.indexOf(tagName) >= 0) {
                        return;
                      }
                      if (!el.getAttribute("signstatusfield")) {
                        // skip tags that are not validity markers
                        return;
                      }
                      signMarker = el;
                    });

                    if(!signMarker){
                      //todo add logger to show warning: "validityMarker not found behind the signed file field"
                      break;
                    }

                    // set mandatory to validityMarker tag. See:admin/scripts/classes/ecp/EcpFileAttrSigner.js
                    if(errors) {
                      signMarker.removeAttribute("mandatory");
                    } else {
                      signMarker.setAttribute("mandatory","");
                    }

                    var signStatusFieldId = signMarker.getAttribute("signStatusField") || "";
                    elems = signStatusFieldId ? getElementByIdPattern(signStatusFieldId, form, true) || [] : [];
                    if(elems.length >0){
                      signStatusField = elems[0];
                    }

                    if(!signStatusField) {
                      break;
                    }
                    // set mandatory to hidden field with signed data
                    // we check it during form validation
                    signStatusField.setAttribute('isMandatory', !errors);

                    break;
                  case 'mandatory':
                    // if we find field - OK! else we try to find fields by pattern
                    elems = field ? [field] : getElementByIdPattern(pattern, form, false) || [];
                    elems.forEach(function(el) {
                      // loop through array of founded by pattern tags
                      // and get only form tags! See usedFormTags definition!
                      tagName = el.tagName.toLowerCase();
                      // skip label tags in this handle
                      if (usedFormTags.indexOf(tagName) === -1 || tagName === "label") {
                        return;
                      }
                      if(checkType(el, 'file') && el.getAttribute("hasFile") === "true") {
                        // skip setting mandatory to input[type=file] if file attribute already has value
                        return;
                      }
                      // TODO  decide what we can do about this hardcode
                      if(String(el.id).indexOf('_deletelist') !== -1) {
                        // skip setting mandatory to input[type=hidden] id=attrname_deletelist
                        return;
                      }
                      // update mandatory attr
                      el.setAttribute('isMandatory', !errors);
                    });

                    titleElem = _elem('attrtitle_' + itemStringValue) || _elem('caption_' + itemStringValue);
                    if (!titleElem) break;

                    spans = titleElem.getElementsByTagName('span') || [];
                    for (z = 0; el = spans[z]; z++) {
                      if (el.innerHTML.indexOf('*') >= 0) {
                        el.parentNode.removeChild(el);
                      }
                    }

                    if (!errors) {
                      var star = d.createElement('span');
                      star.className = 'star';
                      star.innerHTML = '*';
                      titleElem.appendChild(star);
                    }
                    break;
                  case 'actmask':
                    elems = field ? [field] : getElementByIdPattern(pattern, form, false) || [];
                    elems.forEach(function(el) {
                      // loop through array of founded by pattern tags
                      // and work around only form tags! See usedFormTags definition!
                      tagName = el.tagName.toLowerCase();
                      // skip label tags in this handle also!
                      if (usedFormTags.indexOf(tagName) === -1 || tagName === "label") {
                        return;
                      }
                      maskWork(el,itemObjectValue,errors, settings[i]);
                      changedElements.push( el );
                    });
                    break;

                  case 'defvalue':
                    if (!itemObjectKey) break;
                    var notWriteValue = actions[j].notWriteValue === true || actions[j].notWriteValue === "true" || false;
                    var setValueIfMandatory = false;

                    // if we are on edit object page and notWriteValue flag is set to true in Meta then we add some addition logic
                    if(isEditMode && notWriteValue) {
                      if(errors) {
                        // skip any changes to the field when we have errors in applying the condition
                        break;
                      } else {
                        // set value to the field only if field is mandatory and its value is empty
                        setValueIfMandatory = true;
                      }
                    }

                    elems = set_val(itemObjectKey, itemObjectValue, !errors, notWriteValue, setValueIfMandatory);
                    for(z=0;z<elems.length;++z) {
                      changedElements.push( elems[z] );
                    }
                    break;

                  case 'acthelp':
                    if (!itemObjectKey || !field) break;
                    if (!field._sxnote) {
                      var row = _elem('row_'+itemObjectKey);
                      spans = (!row)?[]:row.getElementsByTagName('span');
                      for (z = 0; el = spans[z]; z++) {
                        if (el.className === 'note') break;
                      }
                      if (!el) {
                        el = d.createElement('span');
                        el.className = 'note';
                        field.parentNode.appendChild(el);
                      }
                      el.def_val = el.innerHTML;
                      field._sxnote = el;
                    }

                    if (!errors) {
                      aaToggleDisplay(field._sxnote, false);
                      field._sxnote.innerHTML = itemObjectValue;
                    } else {
                      if (field._sxnote.innerHTML !== itemObjectValue) break;
                      if (field._sxnote.def_val) {
                        aaToggleDisplay(field._sxnote, false);
                        field._sxnote.innerHTML = field._sxnote.def_val
                      }
                      else {
                        aaToggleDisplay(field._sxnote, true);
                      }
                    }
                    break;

                  case 'enable':
                    var tabindexVal;
                    // if we find field - OK! else we try to find fileds by pattern
                    // if field - is hidden or checkbox or radio we go to find elements by pattern because there could be lable tags
                    elems = (field && !checkType(field,'hidden') && !checkType(field,'checkbox') && !checkType(field,'radio')) ? [field] : getElementByIdPattern(pattern, form, false) || [];
                    elems.forEach(function(el) {
                      // loop through array of founded by pattern tags
                      // and work around only with form tags! See usedFormTags definition!
                      tagName = el.tagName.toLowerCase();
                      if (usedFormTags.indexOf(tagName) === -1) {
                        return;
                      }
                      if(checkType(el,'hidden')) {
                        return;
                      }
                      tabindexVal = el.getAttribute((errors)?"tabindex":"_deftabindex");
                      if(errors) {
                        el.setAttribute('_deftabindex', tabindexVal);
                        el.setAttribute('tabindex', -1);
                        el.style.pointerEvents = "none";
                        if(tagName !== "label") {
                          el.setAttribute('readonly', "readonly");
                        }
                      } else {
                        el.setAttribute('tabindex', tabindexVal);
                        el.removeAttribute('_deftabindex');
                        el.style.pointerEvents = "inherit";
                        if(tagName !== "label") {
                          el.removeAttribute('readonly');
                        }

                        checkType(el,'text') && removeClass(el, 'disabled')
                      }
                    });
                    var attrRow = _elem('row_' + itemStringValue);
                    if(attrRow && attrRow.tagName) {
                      var buttonsElements = attrRow.getElementsByTagName("button");
                      var linkElements = attrRow.getElementsByTagName("a");

                      // merge links and buttons elements in one list
                      elems = [].slice.call(buttonsElements).concat([].slice.call(linkElements));

                      for (z = 0; z < elems.length; z++) {
                        el = elems[z];

                        // skip disabling for attributes that have the
                        // data-skip-attractions-disabling="true" parameter
                        if (el.dataset.skipAttractionDisabling === true ||
                            el.dataset.skipAttractionDisabling === "true") continue;

                        if (el.tagName === 'BUTTON') el.disabled = errors;
                        else el.style.pointerEvents = (errors) ? "none" : "inherit";
                      }
                    }
                    break;

                  case 'relative':
                    if (!field || !o) break;

                    if (field.tagName.toLowerCase() === 'select' ) {
                      handleRelativeSelect(o, field, attr_name, itemStringValue, depArray, objId, className, errors);
                    }
                    //QI
                    else  {
                      if (errors) break;

                      var params = {}, titleField = _elem('title_'+itemStringValue), depValue = o.value, defValue = field.value, innerClassName = (attr_name.indexOf('.')<0)?'': attr_name.split('.')[0]+'.';

                      params[attr_name.split('.').pop()] = o.value; //in case of nested object we use only original part of name

                      for (var i=0, key, tmpEl; key=depArray[i++];) {
                        tmpEl = _elem('id_'+checkAndGetName(key));
                        params[key.split('.').pop()] = (tmpEl) ? tmpEl.value : '';
                      }

                      var o1 = JSON.stringify(depValue);
                      var o2 = JSON.stringify(params);

                      if(o1 !== o2 && titleField) {

                        // Представление default или quick input
                        field.formAttrs = params;

                        if (titleField.achdlr) {
                          titleField.achdlr.lastResultCache = {};
                          titleField.achdlr.formAttrs = params;
                        }


                      }
                    }

                    break;


                  case 'listitem':

                    if (!itemObjectValue) break;


                    for (var i=0,
                             _item,
                             _items=field.getElementsByTagName('option'),
                             match,
                             mode = itemObjectValue.mode,
                             _values = itemObjectValue.values||[];
                         _item=_items[i++];) {

                      match=false;
                      for (var j=0, v; v=_values[j++];) {
                        match = (itemObjectValue.regExpSign) ? _item.value.match(v) : _item.value === v;
                        if (match) break;
                      }


                      if (match) {

                        if (mode === 'hide') _item.setAttribute('data-AttractionsDisabledItem', !errors)
                        else _item.removeAttribute('data-AttractionsDisabledItem'); // we show selected option in "show" mode so we remove flag "disabled"

                        if (mode === 'hide' && field.getAttribute('data-AttractionsItemsHidden') === 'true') break;

                        if (mode === 'show') field.setAttribute('data-AttractionsItemsHidden', !errors);

                        _item.disabled = _item.hidden = (mode === 'hide') ? !errors : false;
                      } else {
                        if (mode === 'show' && _item.getAttribute('data-AttractionsDisabledItem') !== 'true') _item.disabled = _item.hidden = !errors;
                      }

                      if (_item.disabled && field.value === _item.value) field.value='';

                    }

                    (function (field) {
                      setTimeout(function () {
                        var ce = new CustomEvent("change", {
                          detail: {"skipAttrActions": true}
                        });
                        field.dispatchEvent(ce);
                      }, 0);
                    })(field);

                    break;

                  case 'show':
                    // try to find group or row by ID with fixed prefix like "", "group_" or "row_"
                    var isGroup = (itemStringValue.indexOf('group_') >= 0),
                        toggle = (isGroup) ?
                            (_elem(itemStringValue) || _elem(itemStringValue.replace(/group_/, '')) ) : _elem('row_' + itemStringValue);

                    //if found - OK!
                    if (toggle) {
                      var tag = (isGroup) ? _elem(itemStringValue.replace(/group_/, 'td')) : null;
                      if (!(tag && initialize)) {
                        aaToggleDisplay(toggle, errors, isGroup);
                      }
                      if (isGroup && tag) {
                        var parent_id = tag.getAttribute('parent');
                        el = (parent_id !== undefined) ? _elem('td'+parent_id) : null;
                        aaToggleDisplay(tag, (errors || el && !el.getAttribute('data-active')) , isGroup );
                        (errors) ? tag.setAttribute('data-attractions-hidden','1') : tag.removeAttribute('data-attractions-hidden');  //setting the attibute to prevent other services from showing the hidden tab
                        if (!initialize) {
                          // hide the group connected to tag (only when triggered by field)
                          if (!errors && tag.getAttribute('data-active')) {//Do nothing
                          } else {aaToggleDisplay(toggle, true, isGroup);}
                        }
                      }

                      var toggleId = toggle.id;
                      if (errors) {
                        hiddens[toggleId] = toggle;
                        toggleElem(toggle, 0, attr_name);
                      } else {
                        if (hiddens[toggleId]) {
                          delete hiddens[toggleId];
                          toggleElem(toggle, 1, attr_name);
                        }
                      }

                      toggleEmptyGroup(toggle, isGroup);

                    } else {
                      //else look if we have field founded by ID with fixed prefix "id_"
                      // if we have field - OK! else we try to find fields by pattern
                      elems = field ? [field] : getElementByIdPattern(pattern, form, false) || [];
                      elems.forEach(function(el) {
                        // loop through array of founded by pattern tags
                        aaToggleDisplay(el, errors);
                        var elId = el.id;
                        if (errors) {
                          hiddens[elId] = el;
                          toggleElem(el, 0, attr_name)
                        } else {
                          if (hiddens[elId]) {
                            delete hiddens[elId];
                            toggleElem(el, 1, attr_name)
                          }
                        }

                        // toggle - is field here
                        toggleEmptyGroup(toggle);
                      });

                      titleElem = _elem('attrtitle_' + itemStringValue) || _elem('caption_' + itemStringValue);
                      if (titleElem) {
                        aaToggleDisplay(titleElem, errors);
                      }
                    }


                }
                // if condition is true then we save dependent field in session
                if(!errors) {
                  var safElem = session.activatedFields[dependentAttrCode];
                  if(safElem) {
                    session.activatedFields[dependentAttrCode] = safElem + "," + actionType;
                  }
                  else {
                    session.activatedFields[dependentAttrCode] = actionType;
                  }
                }

                // try to find custom handler on the field and execute it if it exists
                if (field) {
                  var handlerName = field.getAttribute("data-actionhandler");
                  if(typeof(handlerName)==="function" || (handlerName && handlerName!=="")){
                    var handler = (typeof(handlerName)==="function") ? handlerName : (handlerName && handlerName!=="")?window[handlerName] :null;
                    if (typeof(handler)==="function") handler.call(null, field, actionType, errors, o);
                  }
                }
              }
            }

          }

          if( changedElements.length > 0 ) {
            dispatchSetValEventForElements(changedElements);
            changedElements = null;
          }

          // garbage collector
          actions = null;
          settings = null;

          isInitializeMoment = false;
          return true;
        },

        getClosestGroup = function (someTag){
          var group = getClosest(someTag,"fieldset");
          if(!group) {
            group = getClosest(someTag,"[id^='group_']");
          }
          return group;
        },

        // try to understand if we better to hide automaticaly empty group
        // someTag - tag - container with attribute row or group
        // isGroup - flag if someTag is group and we show/hide this group already
        toggleEmptyGroup = function (someTag, isGroup) {

          // make possibility to overwrite get closest group method in projects
          var group = (isGroup)? someTag : typeof(options.getClosestGroup) === 'function' ? options.getClosestGroup(someTag) : getClosestGroup(someTag);
          // we have no group so do nothing
          if(!group || !group.tagName) return;

          if(!isGroup) {
            // check if we have to skip handle this group even it is empty
            var skipHandleGroupFlag = group.getAttribute('skipSwitchViewIfEmpty');
            if (skipHandleGroupFlag && skipHandleGroupFlag === "true") return;
          }

          if( typeof(options.onToggleEmptyGroup) === 'function' ) {
            var res = options.onToggleEmptyGroup.apply(this, group);

            //TODO why we use result of external function ? Check this moment.
            // it seems like we have to make return without any conditions because this external function fully overwrites standard method
            if( res === false ) {
              return;
            }
          }

          var skipCheckParents = true;
          var items = [];
          if(!isGroup) {

            // check  if there are  not hidden rows with attributes
            var nodesList = group.querySelectorAll('[id^="row_"]');
            var tmpArray = (Array.from)? Array.from(nodesList) : Array.prototype.slice.call(nodesList);
            tmpArray.forEach(function (row) {
              if (row.getAttribute("hidden")) return;
              if (window.getComputedStyle(row).getPropertyValue("display") === "none") return;
              // row is situated in hidden container and in child group!
              var grp = typeof(options.getClosestGroup) === 'function' ? options.getClosestGroup(row) : getClosestGroup(row);
              if (grp !== group && !(row.offsetWidth > 0 && row.offsetHeight > 0)) return;
              items.push(row);
            });

            // check if there are not hidden subgroups (subgoups that have type: with or without border)
            nodesList = group.querySelectorAll('fieldset');
            tmpArray = (Array.from)? Array.from(nodesList) : Array.prototype.slice.call(nodesList);
            tmpArray.forEach(function (grp) {
              if (grp.getAttribute("hidden")) return;
              if (window.getComputedStyle(grp).getPropertyValue("display") === "none") return;

              items.push(grp);
            });

            // check if we proActively hide this group
            var isProActiveHidden = group.getAttribute('isProActiveHidden');
            var doHideGroup = !items.length;

            // we hide only groups with really no one visible row and no one visible subgroup
            // we show only proActively hidden groups
            if (doHideGroup || isProActiveHidden && isProActiveHidden === "true") {
              aaToggleDisplay(group, doHideGroup);
              skipCheckParents = false;
              if (doHideGroup) {
                group.setAttribute("isProActiveHidden", true);
              } else {
                group.removeAttribute("isProActiveHidden");
              }
            }
          }

          //if we have to show current group we have to check its parent groups for visibility
          if ((!skipCheckParents && items.length > 0) || isGroup) {
            toggleEmptyGroup(group.parentNode)
          }

        },

        dispatchSetValEventForElements = function(elementsList) {
          if(!elementsList || !elementsList.length) return;

          var _dispatchEvent = function (target, type, d, ev) {
            try {
              d = d || document;
              if (d.createEvent) {
                ev = d.createEvent('Event');
                ev.initEvent(type, true, true);
                target.dispatchEvent(ev);
              } else {
                ev = d.createEventObject();
                target.fireEvent('on' + type, ev);
              }
            } catch(e) {
              // FF can throw exception, if target is not visible
              // IE8- can throw exception if `'on'+type` event doesnt supported
              logger.warn('dispatch event `'+type+' ` failed for target ', target);
            }
          };

          var i = 0, ii = elementsList.length;
          for(;i<ii;++i) _dispatchEvent(elementsList[i], 'attractions_set_val');
        },

        prepareSettings = function(conditions,setting){
          if(!conditions || typeof(conditions)!=="object") return;
          var c,items,index;
          for (var j in conditions) {
            if(!conditions.hasOwnProperty(j)) continue;
            c = conditions[j];
            if(!c) continue;
            items = c.value;
            switch(c.type){
              case "complex":
                prepareSettings(items,setting);
                break;
              default:
                for (var k in items) {
                  if(!items.hasOwnProperty(k)) continue;
                  index = checkAndGetName(k);
                  if (!attrs[index]) attrs[index] = {};
                  if (!attrs[index].settings)  attrs[index].settings = {};
                  attrs[index].settings[i] = setting || {};
                }
                break;
            }
          }

          // grabage collector
          items = null;
        },

        /**
         *
         * @param {string} fileUri
         * @param {boolean} isHiddenField
         * @returns {string}
         */
        getFileExtension = function(fileUri, isHiddenField) {
          if(typeof(fileUri) !== 'string') return '';
          if(isHiddenField) {
            fileUri = fileUri.split('@').shift(); // shift sxClass
          }
          var extension = fileUri.split('.').pop();
          extension = extension.split('#').shift(); // shift location.hash
          return extension;
        };

    logger.log('[attractions] setFormBinders init');

    //  var conditions,cond,items;
    for (var i in settings) {
      if(!settings.hasOwnProperty(i)) continue;
      prepareSettings(settings[i].conditions, settings[i]);
    }
    settings = null;

    logger.log('[attractions] settings prepared');

    form.init_group = init_groups;
    init_groups();

    logger.log('[attractions] groups inited');

    var f = function (e, noDomManipulations) {

          logger.log('[attractions] f', e);

          if(!noDomManipulations) {
            detach();
          }

          var x,targetEl = getTarget(e);

          //do not validate not form elements
          if (!targetEl || !targetEl.form) return (false);

          var objClassName = getClassNameString();
          if( targetEl && targetEl.getAttribute ) {
            var dataClassName = targetEl.getAttribute('data-classname') || targetEl.getAttribute('data-objClass');
            if(dataClassName !== void 0 && dataClassName !== null && dataClassName !== objClassName) {
              return false;
            }
          }

          var id = getAttrName(targetEl);
          if (id && attrs[id]) {
            /* handle calendar field */
            if (targetEl.id.indexOf('cal_') === 0 || (x = _elem('cal_'+id)) ){
              if(x && x.tagName) targetEl=x;
              if(typeof(targetEl.getFieldValue)==="function") {
                targetEl.getFieldValue();
              }
            }

            if (attrs[id].binders && skipBinders !== "total"){
              var shouldValidate=false, calendarField,hiddenField = _elem({id:'id_' + id,attrName:id,justHidden:true});
              var isFileAttr =  checkType(targetEl, 'file');
              var maskAttr = targetEl.getAttribute("mask");

              // if visible field have mask attribute
              // and its value === mask so nothing to check here.
              // go away.  (example: date fields)
              // custom logic for file attrs

              // file fields are always should be validated except they are empty
              // validate for files (on <input file/> change)
              if(isFileAttr) {
                shouldValidate = targetEl.value !== '';
              } else {
                // do not validate fields with empty value
                shouldValidate = shouldValidate || (hiddenField && hiddenField.value);
                // do not validate empty masked fields
                shouldValidate = shouldValidate || (targetEl.value && targetEl.value !== maskAttr);
              }

              if (shouldValidate) {
                if (!validateField(targetEl,id)) {
                  attractionsOnValidated.call(targetEl, {id:id, flag:false});
                } else {
                  attractionsOnValidated.call(targetEl, {id:id, flag:true});
                }
              }
            }

            if (attrs[id].settings) {
              session.activatedFields = {};
              initSettings(targetEl);
              if (typeof form.cond_handler === 'function') {
                form.cond_handler();
              }
            }
          }
          _target = null;

          if(!noDomManipulations) {
            reattach();
          }

        },
        f1e = function(e) {

          logger.log('[attractions] f1e', e);

          if(e && e.stopPropagation) e.stopPropagation();
          return f1(e);
        },
        f1Blocked = false,
        f1 = function(e) {

          // double blur fix
          if( f1Blocked ) return;
          else f1Blocked = true;
          setTimeout(function() {f1Blocked = false}, 0);

          var o = getTarget(e);
          logger.log('[attractions] f1', e, o);

          if(!o || !isActiveField(o)) return;
          if (o.getAttribute("setBlur")) {//handler for attributes with mask
            (o.detachEvent) ? o.detachEvent('onblur', applyRegExpRule) : o.removeEventListener("blur", applyRegExpRule, false);
            if (window.applyRegExpRule && !applyRegExpRule(e)) {
              logger.log('[attractions] event prevented');
              return (false);
            }
          }
          if (!checkType(o, 'radio') && !checkType(o, 'checkbox') && !checkTag(o, 'select')) {
            f(e);
          }
        },
        f2 = function (e) {

          // get custom change event call from set_val method! So skip it to prevent endless looping
          if(e instanceof Event && e.detail && typeof(e.detail) === "object" && e.detail.skipAttractions) return;

          var o = getTarget(e);
          logger.log('[attractions] f2', e, o);

          if(!o) return;
          if (checkTag(o, 'select') || checkType(o, 'file') || checkType(o, 'hidden')) {
            f(e, true);
          }
        },
        doHandleOnChangeOnForm = (!('onchange' in form)),
        f3 = function (e) {

          var x, z,o = getTarget(e), name=getAttrName(o);
          logger.log('[attractions] f3', e, o);

          if(!o || !isActiveField(o)) return;
          if ((z=checkType(o,"checkbox")) || checkType(o,"radio")) {
            x = _elem('id_'+name);
            if(x && !_elem('idAll_'+name)) x.value = z?(o.checked): o.value;
            f(e, true);
          }
          if (doHandleOnChangeOnForm) {   // onselect doesn't bubble in old browsers
            if (checkTag(o,"select")) {   //add onselect emulation
              if (o._prevSelected != null && o._prevSelected !== o.selectedIndex) f(e);
              o._prevSelected = o.selectedIndex;
            }
          }
        };

    // onfocusout event is @deprecated, and especially used only for ie8- support to handle bubbling from element to form.
    // there are differences between this two events (bubbling support for blur is not the same), blur should be used instead
    // @see support details : http://www.quirksmode.org/dom/events/
    var isFocusOut = (!d.addEventListener && 'onfocusout' in d.createElement('input'));
    isFocusOut ? addEvent(form, 'focusout', f1e) : addEvent(form, 'blur', f1);
    addEvent(form, 'change', f2);
    addEvent(form, 'click', f3);

    var submit_handler, submit = function (formPart) {
      var filledMap={}, x,i,fields=[], area, field, id, submitButton, result=true;
      if(formPart && formPart.tagName) {
        var nl = formPart.getElementsByTagName('TEXTAREA');
        for (i = 0; i < nl.length; i++) {fields[fields.length] = nl.item(i);}
        nl = formPart.getElementsByTagName('SELECT');
        for (i = 0; i < nl.length; i++) {fields[fields.length] = nl.item(i);}
        nl = formPart.getElementsByTagName('INPUT');
        for (i = 0; i < nl.length; i++) {fields[fields.length] = nl.item(i);}
        area = formPart;
      }
      else {
        fields = form.elements;
        area = form;
      }

      for (i = 0; field = fields[i]; i++) { //revalidate fields with binders
        id = getAttrName(field);
        if(!id || id==="") continue;
        filledMap[id] = (filledMap[id]) || !(isNotFilled(field));  //if field is already checked and is filled

        if ((checkType(field,"hidden")) ) continue;

        if (attrs[id]) {
          if (field.id.indexOf('cal_') === 0 || (x = _elem('cal_'+id)) ){
            if(x && x.tagName) field=x;
            if(typeof(field.getFieldValue)==="function") field.getFieldValue();
          }
          //if (field.id.indexOf('cal_') == 0) calendarConvert('calendar(' + id + ')');
          if(!field.value) continue; //skip check empty fields
          if (attrs[id].binders && skipBinders !== "total" && !validateField(field)) {
            result=false;
            break;
          }
        }
      }

      //check amount of filled attrs
      var maId;
      for ( maId in mandatoryAmounts ) {
        if(!mandatoryAmounts.hasOwnProperty(maId)) continue;
        var mandatoryAmount = mandatoryAmounts[maId],
            amount = mandatoryAmount["attrAmount"],
            attrsToBeFilled = mandatoryAmount["attrs"],
            filledCounter = 0,fieldsExist=0;
        for(i=0; i<attrsToBeFilled.length; i++){
          var code = attrsToBeFilled[i];
          if(typeof(filledMap[code])=== "undefined") continue;
          fieldsExist++;
          if(filledMap[code]) filledCounter++;
        }
        if(fieldsExist>=amount && filledCounter<amount){
          if((mandatoryAmount['forcedsave'] !== true)) {
            result=false;
            attractionsAlert(mandatoryAmount['message']);
          }
        }
      }
      // check the number of items in list attrs
      if (result) {
        var errors = checkListAttrItemNumbers();
        if (errors.length) {
          attractionsAlert(errors[0].message);
          result = false;
        }
      }

      if(result){
        for (i in hiddens) { //clear hidden fields
          if(!hiddens.hasOwnProperty(i)) continue;
          if (hiddens[i].value) {
            hiddens[i].value = '';
          } else {
            var elems = hiddens[i].querySelectorAll('input,textarea,select');
            for (var j = 0, o; o = elems[j]; j++) {
              if (o.value) o.value = '';
              if (o.selectedIndex !== undefined) o.selectedIndex=-1;
            }
          }
        }
        result = (submit_handler) ? submit_handler.call(area) : true;   //call generic submit
      }

      if(!result) {
        for (i = 0; field = fields[i]; i++) {
          if (!checkType(field,"submit")) continue;
          submitButton = field;
        }
      }

      if(submitButton && !result) {
        submitButton.removeAttribute("disabled");
      }

      filledMap = null;

      return result;
    };

    function checkListAttrItemNumbers(withCreation) {
      var result = [];
      if (listItemsAmount) {
        var operations = {
          eq: function (a, b) { return a === b },
          ne: function (a, b) { return a !== b },
          gt: function (a, b) { return a > b },
          lt: function (a, b) { return a < b },
          ge: function (a, b) { return a >= b },
          le: function (a, b) { return a <= b }
        };
        var binders = Object.values(listItemsAmount);
        for (var i = 0; i < binders.length; ++i) {
          var binder = binders[i];
          for (var j = 0; j < binder.attrs.length; ++j) {
            var attrName = binder.attrs[j];
            var element = _elem({
              attrName: attrName,
              justHidden: 2
            });
            if (element) {
              var container = getClosest(element, '[id="row_' + attrName + '"]');
              if (container) {
                var operation = operations[binder.listAmountRule];
                var rows = container.querySelectorAll('tr.gridRow');
                if (operation) {
                  var numRows = rows.length;
                  if (!operation(numRows, binder.listAmount)) {
                    result.push({
                      attrName: attrName,
                      element: element,
                      message: binder.message
                    });
                  }
                  if (withCreation && !operation(numRows + 1, binder.listAmount)) {
                    result.push({
                      attrName: attrName,
                      element: element,
                      noCreation: true
                    });
                  }
                }
              }
            }
          }
        }
      }
      return result;
    }
    form.attractionsCheckListAttrItemNumbers = checkListAttrItemNumbers;

    var prepareSubmit = function() {   //onload redefine form submit
      if(!form || !form.tagName || form.tagName.toLowerCase() !== "form") return;
      submit_handler = form.onsubmit;  //save generic submit

      if (!jQuery) {
        form.onsubmit = submit;
        return;
      }


      jQuery(form)
          .data("submithandler",submit)
          .on('submit', submit)
          .removeAttr("onsubmit"); //remove submit handler from form tag!


    };
    var doesAttrFieldHasValidators = function(el,attrName){
      if(!(el instanceof HTMLElement)) return false;
      var id = attrName || getAttrName(el);
      if(!id) return false;
      if(!attrs[id]) return false;
      return attrs[id].binders ? true : false;
    };

    attractionsTools.addAttractionsElement = function(key, obj) {
      if(typeof(obj) === "undefined" || obj == null) return;
      if (attrs[key]) {
        var rule, rulekey;

        for (rule in obj.settings) {
          rulekey = (attrs[key].settings[rule] !== undefined) ? '_custom_'+rule : rule;
          attrs[key].settings[rulekey] = obj.settings[rule];
        }

      } else {
        attrs[key] = obj;
      }
      init_groups(key);
    };

    attractionsTools.doesFieldHasValidators = doesAttrFieldHasValidators;
    attractionsTools.prepareSubmit = prepareSubmit;
    attractionsTools.initField = function(o) {_target = o; f(); _target = null};
    attractionsTools.elem = _elem;

    addEvent(window, 'load', prepareSubmit);

    form.attractionsTools = attractionsTools;

    var isJqEvChange = attractionsBindJqFormChangeEvent;
    if( isJqEvChange === void 0 || isJqEvChange ) {
      try {
        if (jQuery)  {
          jQuery(form).change(f2);
        }
      } catch (e) {}
    }
    return (true);

  }

  /**
   * @param {HTMLFormElement} form
   */
  function resetFormCache(form) {
    if(!form || !form._attractionsUniqId) return;
    form._elementsCache = null;
  }

  /**
   * form.elements loop is 3x faster than .querySelector()
   * @param {HTMLElement} form
   * @param {string|Array<string>} elId - element id or array of ids
   * @returns {HTMLElement}
   */
  function getFormBinderFieldById(form, elId) {
    if(!elId || !form) return null;
    if(window.HTMLElement && !(form instanceof HTMLElement)) return null;

    var _uniqId = form._attractionsUniqId;
    if(!_uniqId) {
      var rand = Math.round(+Math.random().toString().replace('.',''));
      var date = new Date().getTime();
      _uniqId = form._attractionsUniqId = [date, rand].join('_');
    }

    if(!form._elementsCache) {
      form._elementsCache = {};
    }

    if(!form._elementsCache[_uniqId]) {
      form._elementsCache[_uniqId] = {};
    }

    if( typeof(elId) === 'string' ) {
      elId = [elId];
    }

    var el, elIndx, i = 0, ii = elId.length;
    for(; i < ii; ++i) {
      elIndx = elId[i];
      if( el = form._elementsCache[_uniqId][elIndx] ) {
        return el;
      }
    }

    i = 0;
    for(; i < ii; ++i) {
      elIndx = elId[i];
      if(elIndx.indexOf('id_') === 0 || elIndx.indexOf('title_') === 0) {
        el = filterFormBinderFieldById(elIndx, form.elements || form.querySelectorAll("input,select,textarea,label"));
      } else {
        el = (form.querySelector && form.querySelector('[id="' + elIndx + '"]')) || null;
      }
      if( form._elementsCache[_uniqId][elIndx] = el ) {
        return el;
      }
    }

    return el;
  }
  /**
   *
   * @param {string} elId
   * @param {Array<HTMLElement>} elements
   * @returns {HTMLElement}
   */
  function filterFormBinderFieldById(elId, elements) {
    if(!elements || typeof(elements) !== 'object') return null;
    var id, el, i = 0, ii = elements.length;
    if(!ii) return null;
    for(;i<ii;++i) {
      el = elements[i];
      if(!(id=el.id)) continue;
      if( id === elId ) return el;
    }
    return null;
  }

  ///////////////////////
  // EXPORTS
  ///////////////////////

  return setFormBinders;
}, 'setFormBinders'));