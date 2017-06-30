var Entry = {block:{}, TEXT_ALIGN_CENTER:0, TEXT_ALIGN_LEFT:1, TEXT_ALIGN_RIGHT:2, TEXT_ALIGNS:["center", "left", "right"], clipboard:null, loadProject:function(b) {
  b || (b = Entry.getStartProject(Entry.mediaFilePath));
  "workspace" == this.type && Entry.stateManager.startIgnore();
  Entry.projectId = b._id;
  Entry.variableContainer.setVariables(b.variables);
  Entry.variableContainer.setMessages(b.messages);
  Entry.scene.addScenes(b.scenes);
  Entry.stage.initObjectContainers();
  Entry.variableContainer.setFunctions(b.functions);
  Entry.container.setObjects(b.objects);
  Entry.FPS = b.speed ? b.speed : 60;
  createjs.Ticker.setFPS(Entry.FPS);
  Entry.engine.projectTimer || Entry.variableContainer.generateTimer();
  0 === Object.keys(Entry.container.inputValue).length && Entry.variableContainer.generateAnswer();
  Entry.start();
  if (this.options.programmingMode) {
    var c = this.options.programmingMode;
    if (Entry.Utils.isNumber(c)) {
      var d = c;
      this.mode = c = {};
      0 == d ? (c.boardType = Entry.Workspace.MODE_BOARD, c.textType = -1) : 1 == d ? (c.boardType = Entry.Workspace.MODE_VIMBOARD, c.textType = Entry.Vim.TEXT_TYPE_PY, c.runType = Entry.Vim.WORKSPACE_MODE) : 2 == d && (c.boardType = Entry.Workspace.MODE_VIMBOARD, c.textType = Entry.Vim.TEXT_TYPE_JS, c.runType = Entry.Vim.MAZE_MODE);
      Entry.getMainWS().setMode(c);
    }
  }
  Entry.Loader.isLoaded() && Entry.Loader.handleLoad();
  "workspace" == this.type && Entry.stateManager.endIgnore();
  b.interface && Entry.options.loadInterface && Entry.loadInterfaceState(b.interface);
  window.parent && window.parent.childIframeLoaded && window.parent.childIframeLoaded();
  return b;
}, clearProject:function() {
  Entry.stop();
  Entry.projectId = null;
  "invisible" !== Entry.type && Entry.playground && Entry.playground.changeViewMode("code");
  Entry.variableContainer.clear();
  Entry.container.clear();
  Entry.scene.clear();
}, exportProject:function(b) {
  b || (b = {});
  Entry.engine.isState("stop") || Entry.engine.toggleStop();
  Entry.Func && Entry.Func.workspace && Entry.Func.workspace.visible && Entry.Func.cancelEdit();
  b.objects = Entry.container.toJSON();
  b.scenes = Entry.scene.toJSON();
  b.variables = Entry.variableContainer.getVariableJSON();
  b.messages = Entry.variableContainer.getMessageJSON();
  b.functions = Entry.variableContainer.getFunctionJSON();
  b.scenes = Entry.scene.toJSON();
  b.speed = Entry.FPS;
  b.interface = Entry.captureInterfaceState();
  return b;
}, setBlockByText:function(b, c) {
  b = [];
  c = jQuery.parseXML(c).getElementsByTagName("category");
  for (var d = 0; d < c.length; d++) {
    for (var e = c[d], f = {category:e.getAttribute("id"), blocks:[]}, e = e.childNodes, g = 0; g < e.length; g++) {
      var h = e[g];
      !h.tagName || "BLOCK" != h.tagName.toUpperCase() && "BTN" != h.tagName.toUpperCase() || f.blocks.push(h.getAttribute("type"));
    }
    b.push(f);
  }
  Entry.playground.setBlockMenu(b);
}, setBlock:function(b, c) {
  Entry.playground.setMenuBlock(b, c);
}, enableArduino:function() {
}, initSound:function(b) {
  b.path = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/" + b.filename + b.ext;
  Entry.soundQueue.loadFile({id:b.id, src:b.path, type:createjs.LoadQueue.SOUND});
}, beforeUnload:function(b) {
  Entry.hw.closeConnection();
  Entry.variableContainer.updateCloudVariables();
  if ("workspace" == Entry.type && (localStorage && Entry.interfaceState && localStorage.setItem("workspace-interface", JSON.stringify(Entry.captureInterfaceState())), !Entry.stateManager.isSaved())) {
    return Lang.Workspace.project_changed;
  }
}, captureInterfaceState:function() {
  var b = JSON.parse(JSON.stringify(Entry.interfaceState)), c = Entry.playground;
  "workspace" == Entry.type && c && c.object && (b.object = c.object.id);
  return b;
}, loadInterfaceState:function(b) {
  "workspace" == Entry.type && (b ? Entry.container.selectObject(b.object, !0) : localStorage && localStorage.getItem("workspace-interface") ? (b = localStorage.getItem("workspace-interface"), b = JSON.parse(b)) : b = {menuWidth:280, canvasWidth:480}, this.resizeElement(b));
}, resizeElement:function(b) {
  var c = Entry.getMainWS();
  if (c) {
    b || (b = this.interfaceState);
    if ("workspace" == Entry.type) {
      var d = this.interfaceState;
      !b.canvasWidth && d.canvasWidth && (b.canvasWidth = d.canvasWidth);
      !b.menuWidth && this.interfaceState.menuWidth && (b.menuWidth = d.menuWidth);
      Entry.engine.speedPanelOn && Entry.engine.toggleSpeedPanel();
      (d = b.canvasWidth) ? 325 > d ? d = 325 : 720 < d && (d = 720) : d = 400;
      b.canvasWidth = d;
      var e = 9 * d / 16;
      Entry.engine.view_.style.width = d + "px";
      Entry.engine.view_.style.height = e + "px";
      Entry.engine.view_.style.top = "40px";
      Entry.stage.canvas.canvas.style.width = d + "px";
      400 <= d ? Entry.engine.view_.removeClass("collapsed") : Entry.engine.view_.addClass("collapsed");
      Entry.playground.view_.style.left = d + 0.5 + "px";
      Entry.propertyPanel.resize(d);
      var f = Entry.engine.view_.getElementsByClassName("entryAddButtonWorkspace_w")[0];
      f && Entry.objectAddable && (f.style.top = e + 25 + "px", f.style.width = 0.7 * d + "px");
      if (f = Entry.engine.view_.getElementsByClassName("entryRunButtonWorkspace_w")[0]) {
        Entry.objectAddable ? (f.style.top = e + 25 + "px", f.style.left = 0.7 * d + "px", f.style.width = 0.3 * d + "px") : (f.style.left = "2px", f.style.top = e + 25 + "px", f.style.width = d - 4 + "px");
      }
      if (f = Entry.engine.view_.getElementsByClassName("entryStopButtonWorkspace_w")[0]) {
        Entry.objectAddable ? (f.style.top = e + 25 + "px", f.style.left = 0.7 * d + "px", f.style.width = 0.3 * d + "px") : (f.style.left = "2px", f.style.top = e + 25 + "px", f.style.width = d + "px");
      }
      (d = b.menuWidth) ? 244 > d ? d = 244 : 400 < d && (d = 400) : d = 264;
      b.menuWidth = d;
      c = c.blockMenu;
      e = c.hasCategory() ? -64 : 0;
      $(".blockMenuContainer").css({width:d + e + "px"});
      $(".blockMenuContainer>svg").css({width:d + e + "px"});
      c.setWidth();
      $(".entryWorkspaceBoard").css({left:d + "px"});
      Entry.playground.resizeHandle_.style.left = d + "px";
      Entry.playground.variableViewWrapper_.style.width = d + "px";
      this.interfaceState = b;
    }
    Entry.windowResized.notify();
  }
}, getUpTime:function() {
  return (new Date).getTime() - this.startTime;
}, addActivity:function(b) {
  Entry.stateManager && Entry.stateManager.addActivity(b);
}, startActivityLogging:function() {
  Entry.reporter && Entry.reporter.start(Entry.projectId, window.user ? window.user._id : null, Entry.startTime);
}, getActivityLog:function() {
  var b = {};
  Entry.stateManager && (b.activityLog = Entry.stateManager.activityLog_);
  return b;
}, DRAG_MODE_NONE:0, DRAG_MODE_MOUSEDOWN:1, DRAG_MODE_DRAG:2, cancelObjectEdit:function(b) {
  var c = Entry.playground.object;
  if (c) {
    var d = b.target, e = 0 !== $(c.view_).find(d).length, d = d.tagName.toUpperCase();
    b = b.type;
    !c.isEditing || "INPUT" === d && e || "touchstart" === b || c.editObjectValues(!1);
  }
}, generateFunctionSchema:function(b) {
  b = "func_" + b;
  if (!Entry.block[b]) {
    var c = function() {
    };
    c.prototype = Entry.block.function_general;
    c = new c;
    c.changeEvent = new Entry.Event;
    c.template = Lang.template.function_general;
    Entry.block[b] = c;
  }
}, getMainWS:function() {
  if (Entry.mainWorkspace) {
    var b = Entry.mainWorkspace;
  } else {
    Entry.playground && Entry.playground.mainWorkspace && (b = Entry.playground.mainWorkspace);
  }
  return b;
}, getDom:function(b) {
  if (!b) {
    return this.view_;
  }
  b = JSON.parse(JSON.stringify(b));
  if (1 < b.length) {
    return this[b.shift()].getDom(b);
  }
}};
window.Entry = Entry;
Entry.ContextMenu = {};
(function(b) {
  b.visible = !1;
  b._hideEvent = null;
  b.createDom = function() {
    this.dom = Entry.Dom("ul", {id:"entry-contextmenu", parent:$("body")});
    this.dom.bind("mousedown touchstart", function(b) {
      b.stopPropagation();
    });
    Entry.Utils.disableContextmenu(this.dom);
  };
  b.show = function(b, d, e) {
    this._hideEvent = Entry.documentMousedown.attach(this, function() {
      this.hide();
    });
    this.dom || this.createDom();
    if (0 !== b.length) {
      var c = this;
      void 0 !== d && (this._className = d, this.dom.addClass(d));
      var g = this.dom;
      g.empty();
      for (var h = 0, k = b.length; h < k; h++) {
        var l = b[h], m = l.text, r = !1 !== l.enable, q = Entry.Dom("li", {parent:g});
        l.divider ? d = "divider" : (d = r ? "menuAble" : "menuDisable", Entry.Dom("span", {parent:q}).text(m), r && l.callback && function(b, d) {
          b.mousedown(function(b) {
            b.preventDefault();
            c.hide();
            d(b);
          });
        }(q, l.callback));
        q.addClass(d);
      }
      g.removeClass("entryRemove");
      this.visible = !0;
      this.position(e || Entry.mouseCoordinate);
    }
  };
  b.position = function(b) {
    var c = this.dom;
    c.css({left:0, top:0});
    var e = c.width(), f = c.height(), g = $(window), h = g.width(), g = g.height();
    b.x + e > h && (b.x -= e + 3);
    b.y + f > g && (b.y -= f);
    c.css({left:b.x, top:b.y});
  };
  b.hide = function() {
    this.visible = !1;
    this.dom.empty();
    this.dom.addClass("entryRemove");
    this._className && (this.dom.removeClass(this._className), delete this._className);
    this._hideEvent && (Entry.documentMousedown.detach(this._hideEvent), this._hideEvent = null);
  };
  b.onContextmenu = function(b, d) {
    b.on("touchstart mousemove mouseup contextmenu", function(b) {
      switch(b.type) {
        case "touchstart":
          b = Entry.Utils.convertMouseEvent(b);
          this.coordi = {x:b.clientX, y:b.clientY};
          this.longTouchEvent = setTimeout(function() {
            d(this.coordi);
            this.longTouchEvent = void 0;
          }.bind(this), 900);
          break;
        case "mousemove":
          if (!this.coordi) {
            break;
          }
          5 < Math.sqrt(Math.pow(b.pageX - this.coordi.x, 2) + Math.pow(b.pageY - this.coordi.y, 2)) && this.longTouchEvent && (clearTimeout(this.longTouchEvent), this.longTouchEvent = void 0);
          break;
        case "mouseup":
          this.longTouchEvent && (clearTimeout(this.longTouchEvent), this.longTouchEvent = null);
          break;
        case "contextmenu":
          clearTimeout(this.longTouchEvent), this.longTouchEvent = void 0, "contextmenu" === b.type && d(this.coordi);
      }
    });
  };
})(Entry.ContextMenu);
Entry.BlockDriver = function() {
};
(function(b) {
  b.convert = function() {
    var b = new Date, d;
    for (d in Entry.block) {
      "function" === typeof Entry.block[d] && this._convertBlock(d);
    }
    console.log((new Date).getTime() - b.getTime());
  };
  b._convertBlock = function(b) {
    function c(b) {
      var d = {type:b.getAttribute("type"), index:{}};
      b = $(b).children();
      if (!b) {
        return d;
      }
      for (var e = 0; e < b.length; e++) {
        var f = b[e], g = f.tagName, h = $(f).children()[0], k = f.getAttribute("name");
        "value" === g ? "block" == h.nodeName && (d.params || (d.params = []), d.params.push(c(h)), d.index[k] = d.params.length - 1) : "field" === g && (d.params || (d.params = []), d.params.push(f.textContent), d.index[k] = d.params.length - 1);
      }
      return d;
    }
    var e = Blockly.Blocks[b], f = EntryStatic.blockInfo[b];
    if (f) {
      var g = f.class;
      var h = f.isNotFor;
      if (f = f.xml) {
        f = $.parseXML(f);
        var k = c(f.childNodes[0]);
      }
    }
    k = (new Entry.BlockMockup(e, k, b)).toJSON();
    k.class = g;
    k.isNotFor = h;
    _.isEmpty(k.paramsKeyMap) && delete k.paramsKeyMap;
    _.isEmpty(k.statementsKeyMap) && delete k.statementsKeyMap;
    k.func = Entry.block[b];
    -1 < "NUMBER TRUE FALSE TEXT FUNCTION_PARAM_BOOLEAN FUNCTION_PARAM_STRING TRUE_UN".split(" ").indexOf(b.toUpperCase()) && (k.isPrimitive = !0);
    Entry.block[b] = k;
  };
})(Entry.BlockDriver.prototype);
Entry.BlockMockup = function(b, c, d) {
  this.templates = [];
  this.params = [];
  this.statements = [];
  this.color = "";
  this.output = this.isNext = this.isPrev = !1;
  this.fieldCount = 0;
  this.events = {};
  this.def = c || {};
  this.paramsKeyMap = {};
  this.statementsKeyMap = {};
  this.definition = {params:[], type:this.def.type};
  this.simulate(b);
  this.def = this.definition;
};
(function(b) {
  b.simulate = function(b) {
    b.sensorList && (this.sensorList = b.sensorList);
    b.portList && (this.portList = b.portList);
    b.init.call(this);
    b.whenAdd && (this.events.blockViewAdd || (this.events.blockViewAdd = []), this.events.blockViewAdd.push(b.whenAdd));
    b.whenRemove && (this.events.blockViewDestroy || (this.events.blockViewDestroy = []), this.events.blockViewDestroy.push(b.whenRemove));
  };
  b.toJSON = function() {
    function b(c) {
      if (c && (c = c.params)) {
        for (var d = 0; d < c.length; d++) {
          var e = c[d];
          e && (delete e.index, b(e));
        }
      }
    }
    var d = "";
    this.output ? d = "Boolean" === this.output ? "basic_boolean_field" : "basic_string_field" : !this.isPrev && this.isNext ? d = "basic_event" : 1 == this.statements.length ? d = "basic_loop" : 2 == this.statements.length ? d = "basic_double_loop" : this.isPrev && this.isNext ? d = "basic" : this.isPrev && !this.isNext && (d = "basic_without_next");
    b(this.def);
    var e = /dummy_/mi, f;
    for (f in this.paramsKeyMap) {
      e.test(f) && delete this.paramsKeyMap[f];
    }
    for (f in this.statementsKeyMap) {
      e.test(f) && delete this.statementsKeyMap[f];
    }
    return {color:this.color, skeleton:d, statements:this.statements, template:this.templates.filter(function(b) {
      return "string" === typeof b;
    }).join(" "), params:this.params, events:this.events, def:this.def, paramsKeyMap:this.paramsKeyMap, statementsKeyMap:this.statementsKeyMap};
  };
  b.appendDummyInput = function() {
    return this;
  };
  b.appendValueInput = function(b) {
    this.def && this.def.index && (void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(null));
    this.params.push({type:"Block", accept:"string"});
    this._addToParamsKeyMap(b);
    this.templates.push(this.getFieldCount());
    return this;
  };
  b.appendStatementInput = function(b) {
    this._addToStatementsKeyMap(b);
    this.statements.push({accept:"basic"});
  };
  b.setCheck = function(b) {
    var c = this.params;
    "Boolean" === b && (c[c.length - 1].accept = "boolean");
  };
  b.appendField = function(b, d) {
    if (!b) {
      return this;
    }
    "string" === typeof b && 0 < b.length ? d ? (b = {type:"Text", text:b, color:d}, this.params.push(b), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[d] ? this.definition.params.push(this.def.params[this.def.index[d]]) : this.definition.params.push(void 0)) : this.templates.push(b) : b.constructor == Blockly.FieldIcon ? ("start" === b.type ? this.params.push({type:"Indicator", img:b.src_, size:17, position:{x:0, y:-2}}) : 
    this.params.push({type:"Indicator", img:b.src_, size:12}), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.definition && this.definition.params.push(null)) : b.constructor == Blockly.FieldDropdown ? (this.params.push({type:"Dropdown", options:b.menuGenerator_, value:b.menuGenerator_[0][1], fontSize:11}), this._addToParamsKeyMap(d), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[d] ? this.definition.params.push(this.def.params[this.def.index[d]]) : 
    this.definition.params.push(void 0)) : b.constructor == Blockly.FieldDropdownDynamic ? (this.params.push({type:"DropdownDynamic", value:null, menuName:b.menuName_, fontSize:11}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[d] ? this.definition.params.push(this.def.params[this.def.index[d]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(d)) : b.constructor == Blockly.FieldTextInput ? (this.params.push({type:"TextInput", value:10}), 
    this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(d)) : b.constructor == Blockly.FieldAngle ? (this.params.push({type:"Angle"}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[d] ? this.definition.params.push(this.def.params[this.def.index[d]]) : this.definition.params.push(null), this._addToParamsKeyMap(d)) : b.constructor == Blockly.FieldKeydownInput ? (this.params.push({type:"Keyboard", value:81}), this.templates.push(this.getFieldCount()), 
    void 0 !== this.def.index[d] ? this.definition.params.push(this.def.params[this.def.index[d]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(d)) : b.constructor == Blockly.FieldColour ? (this.params.push({type:"Color"}), this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(d)) : console.log("else", b);
    return this;
  };
  b.setColour = function(b) {
    this.color = b;
  };
  b.setInputsInline = function() {
  };
  b.setOutput = function(b, d) {
    b && (this.output = d);
  };
  b.setPreviousStatement = function(b) {
    this.isPrev = b;
  };
  b.setNextStatement = function(b) {
    this.isNext = b;
  };
  b.setEditable = function(b) {
  };
  b.getFieldCount = function() {
    this.fieldCount++;
    return "%" + this.fieldCount;
  };
  b._addToParamsKeyMap = function(b) {
    b = b ? b : "dummy_" + Entry.Utils.generateId();
    var c = this.paramsKeyMap;
    c[b] = Object.keys(c).length;
  };
  b._addToStatementsKeyMap = function(b) {
    b = b ? b : "dummy_" + Entry.Utils.generateId();
    var c = this.statementsKeyMap;
    c[b] = Object.keys(c).length;
  };
})(Entry.BlockMockup.prototype);
Entry.Dom = function(b, c) {
  var d = /<(\w+)>/;
  var e = b instanceof HTMLElement ? $(b) : b instanceof jQuery ? b : d.test(b) ? $(b) : $("<" + b + "></" + b + ">");
  if (void 0 === c) {
    return e;
  }
  c.id && e.attr("id", c.id);
  c.class && e.addClass(c.class);
  c.classes && c.classes.map(function(b) {
    e.addClass(b);
  });
  c.src && e.attr("src", c.src);
  c.parent && c.parent.append(e);
  e.bindOnClick = function() {
    var b = function(b) {
      b.stopImmediatePropagation();
      b.handled || (b.handled = !0, c.call(this, b));
    };
    if (1 < arguments.length) {
      var c = arguments[1] instanceof Function ? arguments[1] : function() {
      };
      var d = "string" === typeof arguments[0] ? arguments[0] : "";
    } else {
      c = arguments[0] instanceof Function ? arguments[0] : function() {
      };
    }
    if (d) {
      $(this).on("click tab", d, b);
    } else {
      $(this).on("click tab", b);
    }
  };
  return e;
};
Entry.Curtain = {};
(function() {
  this._visible = !1;
  this._targetDom = this._doms = null;
  this._createDom = function() {
    var b = {parent:$("body"), class:"entryCurtainElem entryRemove"};
    this._doms = {top:Entry.Dom("div", b), right:Entry.Dom("div", b), bottom:Entry.Dom("div", b), left:Entry.Dom("div", b)};
    for (var c in this._doms) {
      b = this._doms[c], b.addClass(c), b.bind("mousedown", function(b) {
        b.stopPropagation();
      });
    }
  };
  this.show = function(b) {
    !this._doms && this._createDom();
    b instanceof Array && (b = Entry.getDom(b));
    this._targetDom = b = $(b);
    this.align();
    for (var c in this._doms) {
      this._doms[c].removeClass("entryRemove");
    }
    this._visible = !0;
  };
  this.align = function() {
    var b = this._targetDom;
    if (b) {
      var c = $(window), d = $("body")[0].getBoundingClientRect(), e = d.width, d = d.height, f = c.width(), c = c.height();
      f < Math.round(e) && (e = f);
      c < Math.round(d) && (d = c);
      c = this._doms;
      if (b.get(0)) {
        var g = b.get(0).getBoundingClientRect(), b = Math.round(g.top), f = Math.round(g.right), h = Math.round(g.bottom);
        c.top.css({height:b});
        c.left.css({top:b, right:e - f + g.width, bottom:Math.round(d - h)});
        d = c.left[0].getBoundingClientRect();
        d = c.top[0].getBoundingClientRect().height + d.height;
        c.bottom.css({top:d || h, right:e - f});
        c.right.css({top:b, left:c.bottom[0].getBoundingClientRect().width || f});
      }
    }
  };
  this.hide = function() {
    if (this._doms) {
      for (var b in this._doms) {
        this._doms[b].addClass("entryRemove");
      }
      this._visible = !1;
      this._targetDom = null;
    }
  };
  this.isVisible = function() {
    return this._visible;
  };
  this.setVisible = function(b) {
    this._visible = b;
  };
}).call(Entry.Curtain);
Entry.Utils = {};
Entry.overridePrototype = function() {
  Number.prototype.mod = function(b) {
    return (this % b + b) % b;
  };
  String.prototype.repeat || (String.prototype.repeat = function(b) {
    if (null == this) {
      throw new TypeError("can't convert " + this + " to object");
    }
    var c = "" + this;
    b = +b;
    b != b && (b = 0);
    if (0 > b) {
      throw new RangeError("repeat count must be non-negative");
    }
    if (Infinity == b) {
      throw new RangeError("repeat count must be less than infinity");
    }
    b = Math.floor(b);
    if (0 == c.length || 0 == b) {
      return "";
    }
    if (268435456 <= c.length * b) {
      throw new RangeError("repeat count must not overflow maximum string size");
    }
    for (var d = "";;) {
      1 == (b & 1) && (d += c);
      b >>>= 1;
      if (0 == b) {
        break;
      }
      c += c;
    }
    return d;
  });
};
Entry.Utils.isNumber = function(b) {
  if ("number" === typeof b) {
    return !0;
  }
  var c = /^-?\d+\.?\d*$/;
  return "string" === typeof b && c.test(b) ? !0 : !1;
};
Entry.Utils.generateId = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.Utils.intersectArray = function(b, c) {
  for (var d = [], e = 0; e < b.length; e++) {
    for (var f = 0; f < c.length; f++) {
      if (b[e] == c[f]) {
        d.push(b[e]);
        break;
      }
    }
  }
  return d;
};
Entry.Utils.isPointInMatrix = function(b, c, d) {
  d = void 0 === d ? 0 : d;
  var e = b.offsetX ? b.x + b.offsetX : b.x, f = b.offsetY ? b.y + b.offsety : b.y;
  return e - d <= c.x && e + b.width + d >= c.x && f - d <= c.y && f + b.height + d >= c.y;
};
Entry.Utils.colorDarken = function(b, c) {
  function d(b) {
    2 != b.length && (b = "0" + b);
    return b;
  }
  if (7 === b.length) {
    var e = parseInt(b.substr(1, 2), 16);
    var f = parseInt(b.substr(3, 2), 16);
    b = parseInt(b.substr(5, 2), 16);
  } else {
    e = parseInt(b.substr(1, 2), 16), f = parseInt(b.substr(2, 2), 16), b = parseInt(b.substr(3, 2), 16);
  }
  c = void 0 === c ? 0.7 : c;
  e = d(Math.floor(e * c).toString(16));
  f = d(Math.floor(f * c).toString(16));
  b = d(Math.floor(b * c).toString(16));
  return "#" + e + f + b;
};
Entry.Utils.colorLighten = function(b, c) {
  c = 0 === c ? 0 : c || 20;
  b = Entry.Utils.hexToHsl(b);
  b.l += c / 100;
  b.l = Math.min(1, Math.max(0, b.l));
  return Entry.Utils.hslToHex(b);
};
Entry.Utils._EmphasizeColorMap = {"#3BBD70":"#5BC982", "#498DEB":"#62A5F4", "#A751E3":"#C08FF7", "#EC4466":"#F46487", "#FF9E20":"#FFB05A", "#A4D01D":"#C4DD31", "#00979D":"#09BAB5", "#FFD974":"#FCDA90", "#E457DC":"#F279F2", "#CC7337":"#DD884E", "#AEB8FF":"#C0CBFF", "#FFCA36":"#F2C670"};
Entry.Utils.getEmphasizeColor = function(b) {
  var c = b.toUpperCase();
  return Entry.Utils._EmphasizeColorMap[c] || b;
};
Entry.Utils.bound01 = function(b, c) {
  var d = b;
  "string" == typeof d && -1 != d.indexOf(".") && 1 === parseFloat(d) && (b = "100%");
  d = "string" === typeof b && -1 != b.indexOf("%");
  b = Math.min(c, Math.max(0, parseFloat(b)));
  d && (b = parseInt(b * c, 10) / 100);
  return 0.000001 > Math.abs(b - c) ? 1 : b % c / parseFloat(c);
};
Entry.Utils.hexToHsl = function(b) {
  if (7 === b.length) {
    var c = parseInt(b.substr(1, 2), 16);
    var d = parseInt(b.substr(3, 2), 16);
    b = parseInt(b.substr(5, 2), 16);
  } else {
    c = parseInt(b.substr(1, 2), 16), d = parseInt(b.substr(2, 2), 16), b = parseInt(b.substr(3, 2), 16);
  }
  c = Entry.Utils.bound01(c, 255);
  d = Entry.Utils.bound01(d, 255);
  b = Entry.Utils.bound01(b, 255);
  var e = Math.max(c, d, b), f = Math.min(c, d, b), g = (e + f) / 2;
  if (e == f) {
    var h = f = 0;
  } else {
    var k = e - f, f = 0.5 < g ? k / (2 - e - f) : k / (e + f);
    switch(e) {
      case c:
        h = (d - b) / k + (d < b ? 6 : 0);
        break;
      case d:
        h = (b - c) / k + 2;
        break;
      case b:
        h = (c - d) / k + 4;
    }
    h /= 6;
  }
  return {h:360 * h, s:f, l:g};
};
Entry.Utils.hslToHex = function(b) {
  function c(b, c, d) {
    0 > d && (d += 1);
    1 < d && --d;
    return d < 1 / 6 ? b + 6 * (c - b) * d : .5 > d ? c : d < 2 / 3 ? b + (c - b) * (2 / 3 - d) * 6 : b;
  }
  function d(b) {
    return 1 == b.length ? "0" + b : "" + b;
  }
  var e = Entry.Utils.bound01(b.h, 360);
  var f = Entry.Utils.bound01(b.s, 1);
  b = Entry.Utils.bound01(b.l, 1);
  if (0 === f) {
    f = b = e = b;
  } else {
    var g = 0.5 > b ? b * (1 + f) : b + f - b * f, h = 2 * b - g;
    f = c(h, g, e + 1 / 3);
    b = c(h, g, e);
    e = c(h, g, e - 1 / 3);
  }
  b *= 255;
  e *= 255;
  return "#" + [d(Math.round(255 * f).toString(16)), d(Math.round(b).toString(16)), d(Math.round(e).toString(16))].join("");
};
Entry.Utils.bindGlobalEvent = function(b) {
  var c = $(document);
  void 0 === b && (b = "resize mousedown mousemove keydown keyup dispose".split(" "));
  -1 < b.indexOf("resize") && (Entry.windowReszied && ($(window).off("resize"), Entry.windowReszied.clear()), Entry.windowResized = new Entry.Event(window), $(window).on("resize", function(b) {
    Entry.windowResized.notify(b);
  }));
  -1 < b.indexOf("mousedown") && (Entry.documentMousedown && (c.off("mousedown"), Entry.documentMousedown.clear()), Entry.documentMousedown = new Entry.Event(window), c.on("mousedown", function(b) {
    Entry.documentMousedown.notify(b);
  }));
  -1 < b.indexOf("mousemove") && (Entry.documentMousemove && (c.off("touchmove mousemove"), Entry.documentMousemove.clear()), Entry.mouseCoordinate = {}, Entry.documentMousemove = new Entry.Event(window), c.on("touchmove mousemove", function(b) {
    b.originalEvent && b.originalEvent.touches && (b = b.originalEvent.touches[0]);
    Entry.documentMousemove.notify(b);
    Entry.mouseCoordinate.x = b.clientX;
    Entry.mouseCoordinate.y = b.clientY;
  }));
  -1 < b.indexOf("keydown") && (Entry.keyPressed && (c.off("keydown"), Entry.keyPressed.clear()), Entry.pressedKeys = [], Entry.keyPressed = new Entry.Event(window), c.on("keydown", function(b) {
    var c = b.keyCode;
    0 > Entry.pressedKeys.indexOf(c) && Entry.pressedKeys.push(c);
    Entry.keyPressed.notify(b);
  }));
  -1 < b.indexOf("keyup") && (Entry.keyUpped && (c.off("keyup"), Entry.keyUpped.clear()), Entry.keyUpped = new Entry.Event(window), c.on("keyup", function(b) {
    var c = Entry.pressedKeys.indexOf(b.keyCode);
    -1 < c && Entry.pressedKeys.splice(c, 1);
    Entry.keyUpped.notify(b);
  }));
  -1 < b.indexOf("dispose") && (Entry.disposeEvent && Entry.disposeEvent.clear(), Entry.disposeEvent = new Entry.Event(window), Entry.documentMousedown && Entry.documentMousedown.attach(this, function(b) {
    Entry.disposeEvent.notify(b);
  }));
};
Entry.Utils.makeActivityReporter = function() {
  Entry.activityReporter = new Entry.ActivityReporter;
  Entry.commander && Entry.commander.addReporter(Entry.activityReporter);
  return Entry.activityReporter;
};
Entry.Utils.initEntryEvent_ = function() {
  Entry.events_ || (Entry.events_ = []);
};
Entry.sampleColours = [];
Entry.assert = function(b, c) {
  if (!b) {
    throw Error(c || "Assert failed");
  }
};
Entry.parseTexttoXML = function(b) {
  if (window.ActiveXObject) {
    var c = new ActiveXObject("Microsoft.XMLDOM");
    c.async = "false";
    c.loadXML(b);
  } else {
    c = (new DOMParser).parseFromString(b, "text/xml");
  }
  return c;
};
Entry.createElement = function(b, c) {
  var d = b instanceof HTMLElement ? b : document.createElement(b);
  c && (d.id = c);
  d.hasClass = function(b) {
    return this.className.match(new RegExp("(\\s|^)" + b + "(\\s|$)"));
  };
  d.addClass = function(b) {
    for (var c = this.className, d = 0; d < arguments.length; d++) {
      b = arguments[d], this.hasClass(b) || (c += " " + b);
    }
    this.className = c;
  };
  d.removeClass = function(b) {
    for (var c = this.className, d = 0; d < arguments.length; d++) {
      b = arguments[d], this.hasClass(b) && (c = c.replace(new RegExp("(\\s|^)" + b + "(\\s|$)"), " "));
    }
    this.className = c;
  };
  d.bindOnClick = function(b) {
    $(this).on("click tab", function(c) {
      d.disabled || (c.stopImmediatePropagation(), b.call(this, c));
    });
  };
  d.unBindOnClick = function(b) {
    $(this).off("click tab");
  };
  return d;
};
Entry.makeAutolink = function(b) {
  return b ? b.replace(/(http|https|ftp|telnet|news|irc):\/\/([-/.a-zA-Z0-9_~#%$?&=:200-377()][^)\]}]+)/gi, "<a href='$1://$2' target='_blank'>$1://$2</a>").replace(/([xA1-xFEa-z0-9_-]+@[xA1-xFEa-z0-9-]+.[a-z0-9-]+)/gi, "<a href='mailto:$1'>$1</a>") : "";
};
Entry.generateHash = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.addEventListener = function(b, c) {
  this.events_ || (this.events_ = {});
  this.events_[b] || (this.events_[b] = []);
  c instanceof Function && this.events_[b].push(c);
  return !0;
};
Entry.dispatchEvent = function(b, c) {
  this.events_ || (this.events_ = {});
  var d = this.events_[b];
  if (d) {
    for (var e = 0, f = d.length; e < f; e++) {
      d[e].apply(window, Array.prototype.slice.call(arguments).splice(1));
    }
  }
};
Entry.removeEventListener = function(b, c) {
  if (this.events_[b]) {
    for (var d = 0, e = this.events_[b].length; d < e; d++) {
      if (this.events_[b][d] === c) {
        this.events_[b].splice(d, 1);
        break;
      }
    }
  }
};
Entry.removeAllEventListener = function(b) {
  this.events_ && this.events_[b] && delete this.events_[b];
};
Entry.addTwoNumber = function(b, c) {
  var d;
  if (!Entry.Utils.isNumber(b) || !Entry.Utils.isNumber(c)) {
    return b + c;
  }
  b += "";
  c += "";
  var e = b.indexOf("."), f = c.indexOf(".");
  var g = d = 0;
  0 < e && (d = b.length - e - 1);
  0 < f && (g = c.length - f - 1);
  return 0 < d || 0 < g ? d >= g ? (parseFloat(b) + parseFloat(c)).toFixed(d) : (parseFloat(b) + parseFloat(c)).toFixed(g) : parseInt(b) + parseInt(c);
};
Entry.hex2rgb = function(b) {
  return (b = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(b)) ? {r:parseInt(b[1], 16), g:parseInt(b[2], 16), b:parseInt(b[3], 16)} : null;
};
Entry.rgb2hex = function(b, c, d) {
  return "#" + (16777216 + (b << 16) + (c << 8) + d).toString(16).slice(1);
};
Entry.generateRgb = function() {
  return {r:Math.floor(256 * Math.random()), g:Math.floor(256 * Math.random()), b:Math.floor(256 * Math.random())};
};
Entry.adjustValueWithMaxMin = function(b, c, d) {
  return b > d ? d : b < c ? c : b;
};
Entry.isExist = function(b, c, d) {
  for (var e = 0; e < d.length; e++) {
    if (d[e][c] == b) {
      return d[e];
    }
  }
  return !1;
};
Entry.getColourCodes = function() {
  return "transparent #660000 #663300 #996633 #003300 #003333 #003399 #000066 #330066 #660066 #FFFFFF #990000 #993300 #CC9900 #006600 #336666 #0033FF #000099 #660099 #990066 #000000 #CC0000 #CC3300 #FFCC00 #009900 #006666 #0066FF #0000CC #663399 #CC0099 #333333 #FF0000 #FF3300 #FFFF00 #00CC00 #009999 #0099FF #0000FF #9900CC #FF0099 #666666 #CC3333 #FF6600 #FFFF33 #00FF00 #00CCCC #00CCFF #3366FF #9933FF #FF00FF #999999 #FF6666 #FF6633 #FFFF66 #66FF66 #66CCCC #00FFFF #3399FF #9966FF #FF66FF #BBBBBB #FF9999 #FF9966 #FFFF99 #99FF99 #66FFCC #99FFFF #66CCff #9999FF #FF99FF #CCCCCC #FFCCCC #FFCC99 #FFFFCC #CCFFCC #99FFCC #CCFFFF #99CCFF #CCCCFF #FFCCFF".split(" ");
};
Entry.removeElement = function(b) {
  b && b.parentNode && b.parentNode.removeChild(b);
};
Entry.getElementsByClassName = function(b) {
  for (var c = [], d = document.getElementsByTagName("*"), e = 0; e < d.length; e++) {
    -1 < (" " + d[e].className + " ").indexOf(" " + b + " ") && c.push(d[e]);
  }
  return c;
};
Entry.parseNumber = function(b) {
  return "string" == typeof b && Entry.Utils.isNumber(b) ? Number(b) : "number" == typeof b && Entry.Utils.isNumber(b) ? b : !1;
};
Entry.countStringLength = function(b) {
  var c, d = 0;
  for (c = 0; c < b.length; c++) {
    255 < b.charCodeAt(c) ? d += 2 : d++;
  }
  return d;
};
Entry.cutStringByLength = function(b, c) {
  var d, e = 0;
  for (d = 0; e < c && d < b.length; d++) {
    255 < b.charCodeAt(d) ? e += 2 : e++;
  }
  return b.substr(0, d);
};
Entry.isChild = function(b, c) {
  if (!c) {
    for (; c.parentNode;) {
      if ((c = c.parentNode) == b) {
        return !0;
      }
    }
  }
  return !1;
};
Entry.launchFullScreen = function(b) {
  b.requestFullscreen ? b.requestFullscreen() : b.mozRequestFulScreen ? b.mozRequestFulScreen() : b.webkitRequestFullscreen ? b.webkitRequestFullscreen() : b.msRequestFullScreen && b.msRequestFullScreen();
};
Entry.exitFullScreen = function() {
  document.exitFullScreen ? document.exitFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
};
Entry.isPhone = function() {
  return !1;
};
Entry.getKeyCodeMap = function() {
  return {65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 32:Lang.Blocks.START_press_some_key_space, 37:Lang.Blocks.START_press_some_key_left, 38:Lang.Blocks.START_press_some_key_up, 39:Lang.Blocks.START_press_some_key_right, 40:Lang.Blocks.START_press_some_key_down, 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 
  13:Lang.Blocks.START_press_some_key_enter};
};
Entry.checkCollisionRect = function(b, c) {
  return !(b.y + b.height < c.y || b.y > c.y + c.height || b.x + b.width < c.x || b.x > c.x + c.width);
};
Entry.bindAnimationCallback = function(b, c) {
  b.addEventListener("webkitAnimationEnd", c, !1);
  b.addEventListener("animationend", c, !1);
  b.addEventListener("oanimationend", c, !1);
};
Entry.cloneSimpleObject = function(b) {
  var c = {}, d;
  for (d in b) {
    c[d] = b[d];
  }
  return c;
};
Entry.nodeListToArray = function(b) {
  for (var c = Array(b.length), d = -1, e = b.length; ++d !== e; c[d] = b[d]) {
  }
  return c;
};
Entry.computeInputWidth = function(b) {
  var c = document.getElementById("entryInputForComputeWidth");
  c || (c = document.createElement("span"), c.setAttribute("id", "entryInputForComputeWidth"), c.className = "elem-element", document.body.appendChild(c));
  c.innerHTML = b.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return Number(c.offsetWidth + 10) + "px";
};
Entry.isArrowOrBackspace = function(b) {
  return -1 < [37, 38, 39, 40, 8].indexOf(b);
};
Entry.hexStringToBin = function(b) {
  for (var c = [], d = 0; d < b.length - 1; d += 2) {
    c.push(parseInt(b.substr(d, 2), 16));
  }
  return String.fromCharCode.apply(String, c);
};
Entry.findObjsByKey = function(b, c, d) {
  for (var e = [], f = 0; f < b.length; f++) {
    b[f][c] == d && e.push(b[f]);
  }
  return e;
};
Entry.factorials = [];
Entry.factorial = function(b) {
  return 0 === b || 1 == b ? 1 : 0 < Entry.factorials[b] ? Entry.factorials[b] : Entry.factorials[b] = Entry.factorial(b - 1) * b;
};
Entry.getListRealIndex = function(b, c) {
  if (!Entry.Utils.isNumber(b)) {
    switch(b) {
      case "FIRST":
        b = 1;
        break;
      case "LAST":
        b = c.array_.length;
        break;
      case "RANDOM":
        b = Math.floor(Math.random() * c.array_.length) + 1;
    }
  }
  return b;
};
Entry.toRadian = function(b) {
  return b * Math.PI / 180;
};
Entry.toDegrees = function(b) {
  return 180 * b / Math.PI;
};
Entry.getPicturesJSON = function(b) {
  for (var c = [], d = 0, e = b.length; d < e; d++) {
    var f = b[d], g = {};
    g._id = f._id;
    g.id = f.id;
    g.dimension = f.dimension;
    g.filename = f.filename;
    g.fileurl = f.fileurl;
    g.name = f.name;
    g.scale = f.scale;
    c.push(g);
  }
  return c;
};
Entry.getSoundsJSON = function(b) {
  for (var c = [], d = 0, e = b.length; d < e; d++) {
    var f = b[d], g = {};
    g._id = f._id;
    g.duration = f.duration;
    g.ext = f.ext;
    g.id = f.id;
    g.filename = f.filename;
    g.fileurl = f.fileurl;
    g.name = f.name;
    c.push(g);
  }
  return c;
};
Entry.cutDecimal = function(b) {
  return Math.round(100 * b) / 100;
};
Entry.getBrowserType = function() {
  if (Entry.userAgent) {
    return Entry.userAgent;
  }
  var b = navigator.userAgent, c = b.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(c[1])) {
    var d = /\brv[ :]+(\d+)/g.exec(b) || [];
    return "IE " + (d[1] || "");
  }
  if ("Chrome" === c[1] && (d = b.match(/\b(OPR|Edge)\/(\d+)/), null != d)) {
    return d.slice(1).join(" ").replace("OPR", "Opera");
  }
  c = c[2] ? [c[1], c[2]] : [navigator.appName, navigator.appVersion, "-?"];
  null != (d = b.match(/version\/(\d+)/i)) && c.splice(1, 1, d[1]);
  b = c.join(" ");
  return Entry.userAgent = b;
};
Entry.setBasicBrush = function(b) {
  var c = new createjs.Graphics;
  c.thickness = 1;
  c.rgb = Entry.hex2rgb("#ff0000");
  c.opacity = 100;
  c.setStrokeStyle(1);
  c.beginStroke("rgba(255,0,0,1)");
  var d = new createjs.Shape(c);
  Entry.stage.selectedObjectContainer.addChild(d);
  b.brush && (b.brush = null);
  b.brush = c;
  b.shape && (b.shape = null);
  b.shape = d;
};
Entry.setCloneBrush = function(b, c) {
  var d = new createjs.Graphics;
  d.thickness = c.thickness;
  d.rgb = c.rgb;
  d.opacity = c.opacity;
  d.setStrokeStyle(d.thickness);
  d.beginStroke("rgba(" + d.rgb.r + "," + d.rgb.g + "," + d.rgb.b + "," + d.opacity / 100 + ")");
  var e = new createjs.Shape(d);
  Entry.stage.selectedObjectContainer.addChild(e);
  d.stop = c.stop;
  b.brush && (b.brush = null);
  b.brush = d;
  b.shape && (b.shape = null);
  b.shape = e;
};
Entry.isFloat = function(b) {
  return /\d+\.{1}\d+$/.test(b);
};
Entry.getStringIndex = function(b) {
  if (!b) {
    return "";
  }
  for (var c = {string:b, index:1}, d = 0, e = [], f = b.length - 1; 0 < f; --f) {
    var g = b.charAt(f);
    if (Entry.Utils.isNumber(g)) {
      e.unshift(g), d = f;
    } else {
      break;
    }
  }
  0 < d && (c.string = b.substring(0, d), c.index = parseInt(e.join("")) + 1);
  return c;
};
Entry.getOrderedName = function(b, c, d) {
  if (!b) {
    return "untitled";
  }
  if (!c || 0 === c.length) {
    return b;
  }
  d || (d = "name");
  for (var e = 0, f = Entry.getStringIndex(b), g = 0, h = c.length; g < h; g++) {
    var k = Entry.getStringIndex(c[g][d]);
    f.string === k.string && k.index > e && (e = k.index);
  }
  return 0 < e ? f.string + e : b;
};
Entry.changeXmlHashId = function(b) {
  if (/function_field/.test(b.getAttribute("type"))) {
    for (var c = b.getElementsByTagName("mutation"), d = 0, e = c.length; d < e; d++) {
      c[d].setAttribute("hashid", Entry.generateHash());
    }
  }
  return b;
};
Entry.getMaxFloatPoint = function(b) {
  for (var c = 0, d = 0, e = b.length; d < e; d++) {
    var f = String(b[d]), g = f.indexOf(".");
    -1 !== g && (f = f.length - (g + 1), f > c && (c = f));
  }
  return Math.min(c, 20);
};
Entry.convertToRoundedDecimals = function(b, c) {
  return Entry.Utils.isNumber(b) && this.isFloat(b) ? Number(Math.round(b + "e" + c) + "e-" + c) : b;
};
Entry.attachEventListener = function(b, c, d) {
  setTimeout(function() {
    b.addEventListener(c, d);
  }, 0);
};
Entry.deAttachEventListener = function(b, c, d) {
  b.removeEventListener(c, d);
};
Entry.isEmpty = function(b) {
  if (!b) {
    return !0;
  }
  for (var c in b) {
    if (b.hasOwnProperty(c)) {
      return !1;
    }
  }
  return !0;
};
Entry.Utils.disableContextmenu = function(b) {
  if (b) {
    $(b).on("contextmenu", this.contextPreventFunction);
  }
};
Entry.Utils.contextPreventFunction = function(b) {
  b.stopPropagation();
  b.preventDefault();
  return !1;
};
Entry.Utils.enableContextmenu = function(b) {
  b && $(b).off("contextmenu", this.contextPreventFunction);
};
Entry.Utils.isRightButton = function(b) {
  return 2 == b.button || b.ctrlKey;
};
Entry.Utils.isTouchEvent = function(b) {
  return "mousedown" !== b.type.toLowerCase();
};
Entry.Utils.inherit = function(b, c) {
  function d() {
  }
  d.prototype = b.prototype;
  c.prototype = new d;
  return c;
};
Entry.bindAnimationCallbackOnce = function(b, c) {
  b.one("webkitAnimationEnd animationendo animationend", c);
};
Entry.Utils.isInInput = function(b) {
  return "textarea" == b.target.type || "text" == b.target.type;
};
Entry.Utils.isFunction = function(b) {
  return "function" === typeof b;
};
Entry.Utils.addFilters = function(b, c) {
  b = b.elem("defs");
  var d = b.elem("filter", {id:"entryTrashcanFilter_" + c});
  d.elem("feGaussianBlur", {"in":"SourceAlpha", stdDeviation:2, result:"blur"});
  d.elem("feOffset", {"in":"blur", dx:1, dy:1, result:"offsetBlur"});
  d = d.elem("feMerge");
  d.elem("feMergeNode", {"in":"offsetBlur"});
  d.elem("feMergeNode", {"in":"SourceGraphic"}, d);
  d = b.elem("filter", {id:"entryBlockShadowFilter_" + c, height:"200%"});
  d.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:1});
  d.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"0.7 0 0 0 0 0 0.7 0 0 0 0 0 0.7 0 0 0 0 0 1 0"});
  d.elem("feBlend", {in:"SourceGraphic", in1:"offOut", mode:"normal"});
  c = b.elem("filter", {id:"entryBlockHighlightFilter_" + c});
  c.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:0});
  c.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"1.3 0 0 0 0 0 1.3 0 0 0 0 0 1.3 0 0 0 0 0 1 0"});
};
Entry.Utils.addBlockPattern = function(b, c) {
  b = b.elem("pattern", {id:"blockHoverPattern_" + c, class:"blockHoverPattern", patternUnits:"userSpaceOnUse", patternTransform:"translate(12, 0)", x:0, y:0, width:125, height:33, style:"display: none"});
  c = Entry.mediaFilePath + "block_pattern_(order).png";
  for (var d = 1; 5 > d; d++) {
    b.elem("image", {class:"pattern" + d, href:c.replace("(order)", d), x:0, y:0, width:125, height:33});
  }
  return {pattern:b};
};
Entry.Utils.COLLISION = {NONE:0, UP:1, RIGHT:2, LEFT:3, DOWN:4};
Entry.Utils.createMouseEvent = function(b, c) {
  var d = document.createEvent("MouseEvent");
  d.initMouseEvent(b, !0, !0, window, 0, 0, 0, c.clientX, c.clientY, !1, !1, !1, !1, 0, null);
  return d;
};
Entry.Utils.xmlToJsonData = function(b) {
  b = $.parseXML(b);
  var c = [];
  b = b.childNodes[0].childNodes;
  for (var d in b) {
    var e = b[d];
    if (e.tagName) {
      var f = {category:e.getAttribute("id"), blocks:[]}, e = e.childNodes;
      for (d in e) {
        var g = e[d];
        g.tagName && (g = g.getAttribute("type")) && f.blocks.push(g);
      }
      c.push(f);
    }
  }
  return c;
};
Entry.Utils.stopProjectWithToast = function(b, c, d, e) {
  e = b.block;
  c = c || "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec \ubc1c\uc0dd";
  Entry.toast && !d && Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.check_runtime_error, !0);
  Entry.engine && Entry.engine.toggleStop();
  "workspace" === Entry.type && (b.block && "funcBlock" in b.block ? e = b.block.funcBlock : b.funcExecutor && (e = b.funcExecutor.scope.block, b = b.type.replace("func_", ""), Entry.Func.edit(Entry.variableContainer.functions_[b])), e && (Entry.container.selectObject(e.getCode().object.id, !0), (b = e.view) && b.getBoard().activateBlock(e)));
  throw Error(c);
};
Entry.Utils.AsyncError = function(b) {
  this.name = "AsyncError";
  this.message = b || "\ube44\ub3d9\uae30 \ud638\ucd9c \ub300\uae30";
};
Entry.Utils.AsyncError.prototype = Error();
Entry.Utils.AsyncError.prototype.constructor = Entry.Utils.AsyncError;
Entry.Utils.isChrome = function() {
  return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
};
Entry.Utils.waitForWebfonts = function(b, c) {
  var d = 0;
  if (b && b.length) {
    for (var e = 0, f = b.length; e < f; ++e) {
      (function(e) {
        function f() {
          g && g.offsetWidth != l && (++d, g.parentNode.removeChild(g), g = null);
          if (d >= b.length && (m && clearInterval(m), d == b.length)) {
            return c(), !0;
          }
        }
        var g = document.createElement("span");
        g.innerHTML = "giItT1WQy@!-/#";
        g.style.position = "absolute";
        g.style.left = "-10000px";
        g.style.top = "-10000px";
        g.style.fontSize = "300px";
        g.style.fontFamily = "sans-serif";
        g.style.fontVariant = "normal";
        g.style.fontStyle = "normal";
        g.style.fontWeight = "normal";
        g.style.letterSpacing = "0";
        document.body.appendChild(g);
        var l = g.offsetWidth;
        g.style.fontFamily = e;
        var m;
        f() || (m = setInterval(f, 50));
      })(b[e]);
    }
  } else {
    return c && c(), !0;
  }
};
window.requestAnimFrame = function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(b) {
    window.setTimeout(b, 1000 / 60);
  };
}();
Entry.isMobile = function() {
  if (Entry.device) {
    return "tablet" === Entry.device;
  }
  var b = window.platform;
  if (b && b.type && ("tablet" === b.type || "mobile" === b.type)) {
    return Entry.device = "tablet", !0;
  }
  Entry.device = "desktop";
  return !1;
};
Entry.Utils.convertMouseEvent = function(b) {
  return b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
};
Entry.Utils.convertIntToHex = function(b) {
  return b.toString(16).toUpperCase();
};
Entry.Utils.hasSpecialCharacter = function(b) {
  return /!|@|#|\$|%|\^|&|\*|\(|\)|\+|=|-|\[|\]|\\|\'|;|,|\.|\/|{|}|\||\"|:|<|>|\?/g.test(b);
};
Entry.Utils.debounce = function(b, c, d) {
  var e;
  return function() {
    var f = this, g = arguments, h = d && !e;
    clearTimeout(e);
    e = setTimeout(function() {
      e = null;
      d || b.apply(f, g);
    }, c);
    h && b.apply(f, g);
    return e;
  };
};
Entry.Utils.isNewVersion = function(b, c) {
  try {
    b = b.replace("v", "");
    c = c.replace("v", "");
    var d = b.split("."), e = c.split("."), f = d.length < e.length ? d.length : e.length;
    b = !1;
    c = !0;
    for (var g = 0; g < f; g++) {
      Number(d[g]) < Number(e[g]) ? (b = !0, c = !1) : Number(d[g]) > Number(e[g]) && (c = !1);
    }
    c && d.length < e.length && (b = !0);
    return b;
  } catch (h) {
    return !1;
  }
};
Entry.Utils.getBlockCategory = function() {
  var b = {}, c;
  return function(d) {
    if (d) {
      if (b[d]) {
        return b[d];
      }
      c || (c = EntryStatic.getAllBlocks());
      for (var e = 0; e < c.length; e++) {
        var f = c[e], g = f.category;
        if (-1 < f.blocks.indexOf(d)) {
          return b[d] = g;
        }
      }
    }
  };
}();
Entry.Utils.getUniqObjectsBlocks = function(b) {
  b = b || Entry.container.objects_;
  var c = [];
  b.forEach(function(b) {
    b = b.script;
    b instanceof Entry.Code || (b = new Entry.Code(b));
    b.getBlockList().forEach(function(b) {
      0 > c.indexOf(b.type) && c.push(b.type);
    });
  });
  return c;
};
Entry.Utils.getObjectsBlocks = function(b) {
  b = b || Entry.container.objects_;
  var c = [];
  b.forEach(function(b) {
    b = b.script;
    b instanceof Entry.Code || (b = new Entry.Code(b));
    b.getBlockList(!0).forEach(function(b) {
      c.push(b.type);
    });
  });
  return c;
};
Entry.Utils.makeCategoryDataByBlocks = function(b) {
  if (b) {
    for (var c = this, d = EntryStatic.getAllBlocks(), e = {}, f = 0; f < d.length; f++) {
      var g = d[f];
      g.blocks = [];
      e[g.category] = f;
    }
    b.forEach(function(b) {
      var f = c.getBlockCategory(b), f = e[f];
      void 0 !== f && d[f].blocks.push(b);
    });
    b = EntryStatic.getAllBlocks();
    for (f = 0; f < b.length; f++) {
      var g = b[f], h = g.blocks;
      if ("func" === g.category) {
        b.splice(f, 1);
      } else {
        var k = d[f].blocks, l = [];
        h.forEach(function(b) {
          -1 < k.indexOf(b) && l.push(b);
        });
        d[f].blocks = l;
      }
    }
    return d;
  }
};
Entry.Utils.blur = function() {
  var b = document.activeElement;
  b && b.blur && b.blur();
};
Entry.Utils.getWindow = function(b) {
  if (b) {
    for (var c = 0; c < window.frames.length; c++) {
      var d = window.frames[c];
      if (d.Entry && d.Entry.hashId === b) {
        return d;
      }
    }
  }
};
Entry.Utils.restrictAction = function(b, c, d) {
  var e = this;
  b = b || [];
  b = b.map(function(b) {
    return b[0];
  });
  var f = function(f) {
    f = f || window.event;
    var g = f.target || f.srcElement;
    if (!e.isRightButton(f)) {
      for (var h = 0; h < b.length; h++) {
        var m = b[h];
        if (m === g || $.contains(m, g)) {
          d ? g.focus && g.focus() : c(f);
          return;
        }
      }
    }
    f.preventDefault || (f.returnValue = !1, f.cancelBubble = !0);
    f.preventDefault();
    f.stopPropagation();
  };
  this._restrictHandler = f;
  var g = Entry.getDom();
  Entry.Utils.disableContextmenu(g);
  g.addEventListener ? (g.addEventListener("click", f, !0), g.addEventListener("mousedown", f, !0), g.addEventListener("mouseup", f, !0), g.addEventListener("touchstart", f, !0)) : (g.attachEvent("onclick", f), g.attachEvent("onmousedown", f), g.attachEvent("onmouseup", f), g.attachEvent("ontouchstart", f));
};
Entry.Utils.allowAction = function() {
  var b = Entry.getDom();
  Entry.Utils.enableContextmenu(b);
  this._restrictHandler && (b.addEventListener ? (b.removeEventListener("click", this._restrictHandler, !0), b.removeEventListener("mousedown", this._restrictHandler, !0), b.removeEventListener("mouseup", this._restrictHandler, !0), b.removeEventListener("touchstart", this._restrictHandler, !0)) : (b.detachEvent("onclick", this._restrictHandler), b.detachEvent("onmousedown", this._restrictHandler), b.detachEvent("onmouseup", this._restrictHandler), b.detachEvent("ontouchstart", this._restrictHandler)), 
  delete this._restrictHandler);
};
Entry.Utils.glideBlock = function(b, c, d, e) {
  var f = b.getBoundingClientRect(), g = Entry.Dom($('<svg id="globalSvg" width="10" height="10"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:$(document.body)});
  b = $(b.cloneNode(!0));
  b.attr({transform:"translate(8,0)"});
  g.append(b);
  g.css({top:f.top, left:f.left});
  g.velocity({top:d, left:c - 8}, {duration:1200, complete:function() {
    setTimeout(function() {
      g.remove();
      e();
    }, 500);
  }, easing:"ease-in-out"});
};
Entry.fuzzy = {};
(function(b) {
  var c = {};
  b.fuzzy = c;
  c.simpleFilter = function(b, e) {
    return e.filter(function(d) {
      return c.test(b, d);
    });
  };
  c.test = function(b, e) {
    return null !== c.match(b, e);
  };
  c.match = function(b, c, f) {
    f = f || {};
    var d = 0, e = [], k = c.length, l = 0, m = 0, r = f.pre || "", q = f.post || "", n = f.caseSensitive && c || c.toLowerCase();
    b = f.caseSensitive && b || b.toLowerCase();
    for (var t = 0; t < k; t++) {
      var u = c[t];
      if (n[t] === f.escapeLetter) {
        break;
      }
      n[t] === b[d] ? (u = r + u + q, d += 1, m += 1 + m) : m = 0;
      l += m;
      e[e.length] = u;
    }
    return d === b.length ? {rendered:e.join(""), score:l} : null;
  };
  c.filter = function(b, e, f) {
    f = f || {};
    return e.reduce(function(d, e, k, l) {
      l = e;
      f.extract && (l = f.extract(e));
      l = c.match(b, l, f);
      null != l && (d[d.length] = {string:l.rendered, score:l.score, index:k, original:e});
      return d;
    }, []).sort(function(b, c) {
      var d = c.score - b.score;
      return d ? d : b.index - c.index;
    });
  };
})(Entry.Utils);
Entry.Loader = {queueCount:0, totalCount:0, loaded:!1};
Entry.Loader.addQueue = function(b) {
  this.queueCount || Entry.dispatchEvent("loadStart");
  this.queueCount++;
  this.totalCount++;
};
Entry.Loader.removeQueue = function(b) {
  this.queueCount--;
  this.queueCount || (this.totalCount = 0, this.handleLoad());
};
Entry.Loader.getLoadedPercent = function() {
  return 0 === this.totalCount ? 1 : this.queueCount / this.totalCount;
};
Entry.Loader.isLoaded = function() {
  return !this.queueCount && !this.totalCount;
};
Entry.Loader.handleLoad = function() {
  this.loaded || (this.loaded = !0, Entry.dispatchEvent("loadComplete"));
};
Entry.Restrictor = function(b) {
  this._controller = b;
  this.startEvent = new Entry.Event(this);
  this.endEvent = new Entry.Event(this);
  this.currentTooltip = null;
};
(function(b) {
  b.restrict = function(b, d) {
    this._data = b;
    this.toolTipRender = d;
    this.end();
    d = b.content.concat().shift();
    d = Entry.Command[d];
    var c = d.dom;
    this.startEvent.notify();
    c instanceof Array && (c = this.processDomQuery(c));
    b.tooltip || (b.tooltip = {title:"\uc561\uc158", content:"\uc9c0\uc2dc \uc0ac\ud56d\uc744 \ub530\ub974\uc2dc\uc624"});
    if (d.restrict) {
      this.currentTooltip = d.restrict(b, c, this.restrictEnd.bind(this), this);
    } else {
      if (this.currentTooltip = new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {restrict:!0, dimmed:!0, callBack:this.restrictEnd.bind(this)}), window.setTimeout(this.align.bind(this)), b.skip) {
        return this.end();
      }
    }
  };
  b.end = function() {
    this.currentTooltip && (this.currentTooltip.dispose(), this.currentTooltip = null);
  };
  b.restrictEnd = function() {
    this.endEvent.notify();
  };
  b.align = function() {
    this.currentTooltip && this.currentTooltip.alignTooltips();
  };
  b.processDomQuery = function(b, d) {
    d = d || this._data.content;
    d = d.concat();
    d.shift();
    b instanceof Array && (b = b.map(function(b) {
      return "&" === b[0] ? d[Number(b.substr(1))][1] : b;
    }));
    return b;
  };
  b.renderTooltip = function() {
    this.currentTooltip && this.currentTooltip.render();
  };
  b.fadeOutTooltip = function() {
    this.currentTooltip && this.currentTooltip.fadeOut();
  };
  b.fadeInTooltip = function() {
    this.currentTooltip && this.currentTooltip.fadeIn();
  };
  b.isTooltipFaded = function() {
    return this.currentTooltip ? this.currentTooltip.isFaded() : !1;
  };
  b.requestNextData = function() {
    if (this._controller) {
      return this._controller.requestNextData();
    }
  };
})(Entry.Restrictor.prototype);
Entry.STATIC = {OBJECT:0, ENTITY:1, SPRITE:2, SOUND:3, VARIABLE:4, FUNCTION:5, SCENE:6, MESSAGE:7, BLOCK_MODEL:8, BLOCK_RENDER_MODEL:9, BOX_MODEL:10, THREAD_MODEL:11, DRAG_INSTANCE:12, BLOCK_STATIC:0, BLOCK_MOVE:1, BLOCK_FOLLOW:2, RETURN:0, CONTINUE:1, BREAK:2, PASS:3, COMMAND_TYPES:{addThread:101, destroyThread:102, destroyBlock:103, recoverBlock:104, insertBlock:105, separateBlock:106, moveBlock:107, cloneBlock:108, uncloneBlock:109, scrollBoard:110, setFieldValue:111, selectBlockMenu:112, destroyBlockBelow:113, 
destroyThreads:114, addThreads:115, recoverBlockBelow:116, addThreadFromBlockMenu:117, insertBlockFromBlockMenu:118, moveBlockFromBlockMenu:119, separateBlockForDestroy:120, moveBlockForDestroy:121, insertBlockFromBlockMenuFollowSeparate:122, insertBlockFollowSeparate:123, separateBlockByCommand:124, selectObject:201, objectEditButtonClick:202, objectAddPicture:203, objectRemovePicture:204, objectAddSound:205, objectRemoveSound:206, "do":301, undo:302, redo:303, editPicture:401, uneditPicture:402, 
processPicture:403, unprocessPicture:404, toggleRun:501, toggleStop:502, containerSelectObject:601, playgroundChangeViewMode:701, playgroundClickAddPicture:702, playgroundClickAddSound:703, playgroundClickAddPictureCancel:704, playgroundClickAddSoundCancel:705, variableContainerSelectFilter:801, variableContainerClickVariableAddButton:802, variableContainerAddVariable:803, variableContainerRemoveVariable:804, variableAddSetName:805}, RECORDABLE:{SUPPORT:1, SKIP:2, ABANDON:3}};
Entry.Tooltip = function(b, c) {
  this.init(b, c);
};
(function(b) {
  b.usedClasses = "up down left right edge_up edge_down edge_left edge_right";
  b.init = function(b, d) {
    this._rendered && this.dispose();
    this.data = b instanceof Array ? b : [b];
    this.opts = d || this.opts || {dimmed:!0, restirct:!1};
    this._rendered = !1;
    this._noDispose = !!this.opts.noDispose;
    this._faded = !1;
    this._tooltips = [];
    this._indicators = [];
    if (1 < b.length || d.indicator) {
      this.isIndicator = !0;
    }
    !1 !== d.render && this.render();
    this._resizeEventFunc = Entry.Utils.debounce(function() {
      this.alignTooltips();
    }.bind(this), 200);
    Entry.addEventListener("windowResized", this._resizeEventFunc);
  };
  b.render = function() {
    if (!this._rendered) {
      this.fadeIn();
      this._convertDoms();
      this.opts.dimmed && this.renderBG();
      var b = this.data[0].targetDom;
      b && "string" !== typeof b && b.length && (this.opts.restrict && this.opts.dimmed && Entry.Curtain.show(b.get(0)), this.renderTooltips(), this._rendered = !0, this.opts.restrict && this.restrictAction());
    }
  };
  b._convertDoms = function() {
    this.data.map(function(b) {
      var c = b.target;
      b.target instanceof Array && (c = Entry.getDom(b.target));
      c = $(c);
      c.length && (b.targetDom = c);
    });
  };
  b.renderBG = function() {
    this.opts.restrict ? this._bg = Entry.Dom("div", {classes:[], parent:$(document.body)}) : (this._bg = Entry.Dom("div", {classes:["entryDimmed", "entryTooltipBG"], parent:$(document.body)}), this._bg.bindOnClick(this.dispose.bind(this)));
  };
  b.renderTooltips = function() {
    this.data.map(this._renderTooltip.bind(this));
  };
  b.alignTooltips = function() {
    this._rendered && (this.data.map(this._alignTooltip.bind(this)), this.opts.dimmed && Entry.Curtain.align());
  };
  b._renderTooltip = function(b) {
    if (b.content) {
      var c = Entry.Dom("div", {classes:["entryTooltipWrapper"], parent:$(document.body)}), e = Entry.Dom("div", {classes:["entryTooltip", b.direction, b.style], parent:c});
      this.isIndicator && (b.indicator = this.renderIndicator());
      e.bind("mousedown", function(b) {
        b.stopPropagation();
      });
      e.html(b.content);
      this._tooltips.push(c);
      b.wrapper = c;
      b.dom = e;
      this._alignTooltip(b);
    }
  };
  b._alignTooltip = function(b) {
    var c = b.targetDom instanceof $ ? b.targetDom.get(0).getBoundingClientRect() : b.targetDom.getBoundingClientRect();
    var e = b.dom[0].getBoundingClientRect(), f = document.body.clientWidth, g = document.body.clientHeight;
    this.isIndicator && b.indicator.css({left:c.left + c.width / 2, top:c.top + c.height / 2});
    450 < e.width ? b.dom.addClass("shrink") : b.dom.removeClass("shrink");
    var h = b.direction;
    if (!h) {
      var k = c.left - e.width, l = f - c.left - c.width - e.width, h = "left";
      k < l && (k = l, h = "right");
      l = c.top - e.height;
      k < l && (k = l, h = "up");
      l = g - c.top - c.height - e.height;
      k < l && (h = "down");
    }
    b.dom.removeClass(this.usedClasses).addClass(h);
    var k = {top:c.top, left:c.left}, m;
    switch(h) {
      case "down":
        k.top += c.height;
      case "up":
        k.left += c.width / 2;
        k.left < e.width / 2 && (m = "edge_left");
        f - k.left < e.width / 2 && (m = "edge_right");
        break;
      case "right":
        k.left += c.width;
      case "left":
        k.top += c.height / 2, k.top < e.height / 2 && (m = "edge_up"), g - k.top < e.height / 2 && (m = "edge_down");
    }
    m && b.dom.addClass(m);
    b.wrapper.css(k);
  };
  b.renderIndicator = function(b, d) {
    b = Entry.Dom("div", {classes:["entryTooltipIndicator"], parent:$(document.body)});
    b.html("<div></div><div></div><div></div>");
    this._indicators.push(b);
    return b;
  };
  b.dispose = function(b) {
    this._bg && this._bg.remove();
    this.opts.restrict && (Entry.Utils.allowAction(), this.opts.dimmed && Entry.Curtain.hide());
    for (; this._tooltips.length;) {
      this._tooltips.pop().remove();
    }
    for (; this._indicators.length;) {
      this._indicators.pop().remove();
    }
    this.opts.callBack && this.opts.callBack.call(this, b);
    Entry.removeEventListener("windowResized", this._resizeEventFunc);
  };
  b.restrictAction = function() {
    var b = this.data.map(function(b) {
      return b.targetDom;
    });
    this._noDispose && this.opts.callBack && this.opts.callBack.call(this);
    Entry.Utils.restrictAction(b, this.dispose.bind(this), this._noDispose);
  };
  b.fadeOut = function() {
    $(document.body).addClass("hideTooltip");
    this._faded = !0;
  };
  b.fadeIn = function() {
    $(document.body).removeClass("hideTooltip");
    this._faded = !1;
  };
  b.isFaded = function() {
    return this._faded;
  };
})(Entry.Tooltip.prototype);
Entry.PropertyPanel = function() {
  this.modes = {};
  this.selected = null;
};
(function(b) {
  b.generateView = function(b, d) {
    this._view = Entry.Dom("div", {class:"propertyPanel", parent:$(b)});
    this._tabView = Entry.Dom("div", {class:"propertyTab", parent:this._view});
    this._contentView = Entry.Dom("div", {class:"propertyContent", parent:this._view});
    this._cover = Entry.Dom("div", {classes:["propertyPanelCover", "entryRemove"], parent:this._view});
    b = Entry.Dom("div", {class:"entryObjectSelectedImgWorkspace", parent:this._view});
    this.initializeSplitter(b);
  };
  b.addMode = function(b, d) {
    this.modes[b] && this.removeMode(b);
    var c = d.getView(), c = Entry.Dom(c, {parent:this._contentView}), f = Entry.Dom("<div>" + Lang.Menus[b] + "</div>", {classes:["propertyTabElement", "propertyTab" + b], parent:this._tabView}), g = this;
    f.bind("click", function() {
      g.select(b);
    });
    "console" == b && d.codeMirror.refresh();
    this.modes[b] && (this.modes[b].tabDom.remove(), this.modes[b].contentDom.remove(), "hw" == b && ($(this.modes).removeClass(".propertyTabhw"), $(".propertyTabhw").unbind("dblclick")));
    this.modes[b] = {obj:d, tabDom:f, contentDom:c};
    "hw" == b && $(".propertyTabhw").bind("dblclick", function() {
      Entry.dispatchEvent("hwModeChange");
    });
  };
  b.removeMode = function(b) {
    this.modes[b] && (this.modes[b].tabDom.remove(), this.modes[b].contentDom.remove(), "hw" == b && ($(this.modes).removeClass(".propertyTabhw"), $(".propertyTabhw").unbind("dblclick")));
    (b = Object.keys(this.modes)) && 0 < b.length && this.select(b[0]);
  };
  b.resize = function(b) {
    var c = this.selected;
    c && (this._view.css({width:b + "px", top:9 * b / 16 + 123 - 22 + "px"}), 430 <= b ? this._view.removeClass("collapsed") : this._view.addClass("collapsed"), Entry.dispatchEvent("windowResized"), b = this.modes[c].obj, "hw" == c ? this.modes.hw.obj.listPorts ? b.resizeList() : b.resize && b.resize() : b.resize && b.resize());
  };
  b.select = function(b) {
    for (var c in this.modes) {
      var e = this.modes[c];
      e.tabDom.removeClass("selected");
      e.contentDom.addClass("entryRemove");
      $(e.contentDom).detach();
      e.obj.visible = !1;
    }
    c = this.modes[b];
    $(this._contentView).append(c.contentDom);
    c.tabDom.addClass("selected");
    c.contentDom.removeClass("entryRemove");
    c.obj.resize && c.obj.resize();
    c.obj.visible = !0;
    this.selected = b;
  };
  b.initializeSplitter = function(b) {
    var c = this;
    b.bind("mousedown touchstart", function(b) {
      var d = Entry.container;
      c._cover.removeClass("entryRemove");
      c._cover._isVisible = !0;
      d.splitterEnable = !0;
      Entry.documentMousemove && (d.resizeEvent = Entry.documentMousemove.attach(this, function(b) {
        d.splitterEnable && Entry.resizeElement({canvasWidth:b.clientX || b.x});
      }));
      $(document).bind("mouseup.container:splitter touchend.container:splitter", e);
    });
    var e = function(b) {
      b = Entry.container;
      var d = b.resizeEvent;
      d && (b.splitterEnable = !1, Entry.documentMousemove.detach(d), delete b.resizeEvent);
      c._cover._isVisible && (c._cover._isVisible = !1, c._cover.addClass("entryRemove"));
      $(document).unbind(".container:splitter");
    };
  };
})(Entry.PropertyPanel.prototype);
Entry.Albert = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, leftEye:0, rightEye:0, note:0, bodyLed:0, frontLed:0, padWidth:0, padHeight:0}, setZero:function() {
  var b = Entry.Albert.PORT_MAP, c = Entry.hw.sendQueue, d;
  for (d in b) {
    c[d] = b[d];
  }
  Entry.hw.update();
  b = Entry.Albert;
  b.tempo = 60;
  b.removeAllTimeouts();
}, monitorTemplate:{imgPath:"hw/albert.png", width:387, height:503, listPorts:{temperature:{name:Lang.Blocks.ALBERT_sensor_temperature, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.ALBERT_sensor_acceleration_x, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.ALBERT_sensor_acceleration_y, type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.ALBERT_sensor_acceleration_z, type:"input", pos:{x:0, y:0}}, frontOid:{name:Lang.Blocks.ALBERT_sensor_front_oid, type:"input", 
pos:{x:0, y:0}}, backOid:{name:Lang.Blocks.ALBERT_sensor_back_oid, type:"input", pos:{x:0, y:0}}, positionX:{name:Lang.Blocks.ALBERT_sensor_position_x, type:"input", pos:{x:0, y:0}}, positionY:{name:Lang.Blocks.ALBERT_sensor_position_y, type:"input", pos:{x:0, y:0}}, orientation:{name:Lang.Blocks.ALBERT_sensor_orientation, type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, note:{name:Lang.Hw.note, type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.ALBERT_sensor_left_proximity, 
type:"input", pos:{x:178, y:401}}, rightProximity:{name:Lang.Blocks.ALBERT_sensor_right_proximity, type:"input", pos:{x:66, y:359}}, battery:{name:Lang.Blocks.ALBERT_sensor_battery, type:"input", pos:{x:88, y:368}}, light:{name:Lang.Blocks.ALBERT_sensor_light, type:"input", pos:{x:127, y:391}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:299, y:406}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:22, y:325}}, leftEye:{name:Lang.Hw.leftEye, type:"output", pos:{x:260, y:26}}, 
rightEye:{name:Lang.Hw.rightEye, type:"output", pos:{x:164, y:13}}, bodyLed:{name:Lang.Hw.body + " " + Lang.Hw.led_en, type:"output", pos:{x:367, y:308}}, frontLed:{name:Lang.Hw.front + " " + Lang.Hw.led_en, pos:{x:117, y:410}}}, mode:"both"}, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var c = this.timeouts;
  b = c.indexOf(b);
  0 <= b && c.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, c;
  for (c in b) {
    clearTimeout(b[c]);
  }
  this.timeouts = [];
}, controller:{PI:3.14159265, PI2:6.2831853, prevDirection:0, prevDirectionFine:0, directionFineCount:0, positionCount:0, finalPositionCount:0, GAIN_ANGLE:30, GAIN_ANGLE_FINE:30, GAIN_POSITION_FINE:30, STRAIGHT_SPEED:20, MAX_BASE_SPEED:20, GAIN_BASE_SPEED:1.0, GAIN_POSITION:35, POSITION_TOLERANCE_FINE:3, POSITION_TOLERANCE_FINE_LARGE:5, POSITION_TOLERANCE_ROUGH:5, POSITION_TOLERANCE_ROUGH_LARGE:10, ORIENTATION_TOLERANCE_FINE:0.08, ORIENTATION_TOLERANCE_ROUGH:0.09, ORIENTATION_TOLERANCE_ROUGH_LARGE:0.18, 
MINIMUM_WHEEL_SPEED:18, MINIMUM_WHEEL_SPEED_FINE:15, clear:function() {
  this.finalPositionCount = this.positionCount = this.directionFineCount = this.prevDirectionFine = this.prevDirection = 0;
}, controlAngleFine:function(b, c) {
  var d = Entry.hw.sendQueue;
  b = this.validateRadian(c - b);
  c = Math.abs(b);
  if (c < this.ORIENTATION_TOLERANCE_FINE) {
    return !1;
  }
  var e = 0 < b ? 1 : -1;
  if (0 > e * this.prevDirectionFine && 5 < ++this.directionFineCount) {
    return !1;
  }
  this.prevDirectionFine = e;
  0 < b ? (b = Math.log(1 + c) * this.GAIN_ANGLE_FINE, b < this.MINIMUM_WHEEL_SPEED && (b = this.MINIMUM_WHEEL_SPEED)) : (b = -Math.log(1 + c) * this.GAIN_ANGLE_FINE, b > -this.MINIMUM_WHEEL_SPEED && (b = -this.MINIMUM_WHEEL_SPEED));
  b = parseInt(b);
  d.leftWheel = -b;
  d.rightWheel = b;
  return !0;
}, controlAngle:function(b, c) {
  var d = Entry.hw.sendQueue;
  b = this.validateRadian(c - b);
  c = Math.abs(b);
  if (c < this.ORIENTATION_TOLERANCE_ROUGH) {
    return !1;
  }
  var e = 0 < b ? 1 : -1;
  if (c < this.ORIENTATION_TOLERANCE_ROUGH_LARGE && 0 > e * this.prevDirection) {
    return !1;
  }
  this.prevDirection = e;
  0 < b ? (b = Math.log(1 + c) * this.GAIN_ANGLE, b < this.MINIMUM_WHEEL_SPEED && (b = this.MINIMUM_WHEEL_SPEED)) : (b = -Math.log(1 + c) * this.GAIN_ANGLE, b > -this.MINIMUM_WHEEL_SPEED && (b = -this.MINIMUM_WHEEL_SPEED));
  b = parseInt(b);
  d.leftWheel = -b;
  d.rightWheel = b;
  return !0;
}, controlPositionFine:function(b, c, d, e, f) {
  var g = Entry.hw.sendQueue;
  d = this.validateRadian(Math.atan2(f - c, e - b) - d);
  var h = Math.abs(d);
  b = e - b;
  c = f - c;
  c = Math.sqrt(b * b + c * c);
  if (c < this.POSITION_TOLERANCE_FINE) {
    return !1;
  }
  if (c < this.POSITION_TOLERANCE_FINE_LARGE && 5 < ++this.finalPositionCount) {
    return this.finalPositionCount = 0, !1;
  }
  d = 0 < d ? Math.log(1 + h) * this.GAIN_POSITION_FINE : -Math.log(1 + h) * this.GAIN_POSITION_FINE;
  d = parseInt(d);
  g.leftWheel = this.MINIMUM_WHEEL_SPEED_FINE - d;
  g.rightWheel = this.MINIMUM_WHEEL_SPEED_FINE + d;
  return !0;
}, controlPosition:function(b, c, d, e, f) {
  var g = Entry.hw.sendQueue;
  d = this.validateRadian(Math.atan2(f - c, e - b) - d);
  var h = Math.abs(d);
  b = e - b;
  c = f - c;
  c = Math.sqrt(b * b + c * c);
  if (c < this.POSITION_TOLERANCE_ROUGH) {
    return !1;
  }
  if (c < this.POSITION_TOLERANCE_ROUGH_LARGE) {
    if (10 < ++this.positionCount) {
      return this.positionCount = 0, !1;
    }
  } else {
    this.positionCount = 0;
  }
  0.01 > h ? (g.leftWheel = this.STRAIGHT_SPEED, g.rightWheel = this.STRAIGHT_SPEED) : (c = (this.MINIMUM_WHEEL_SPEED + 0.5 / h) * this.GAIN_BASE_SPEED, c > this.MAX_BASE_SPEED && (c = this.MAX_BASE_SPEED), d = 0 < d ? Math.log(1 + h) * this.GAIN_POSITION : -Math.log(1 + h) * this.GAIN_POSITION, c = parseInt(c), d = parseInt(d), g.leftWheel = c - d, g.rightWheel = c + d);
  return !0;
}, validateRadian:function(b) {
  return b > this.PI ? b - this.PI2 : b < -this.PI ? b + this.PI2 : b;
}, toRadian:function(b) {
  return 3.14159265 * b / 180.0;
}}, name:"albert"};
Blockly.Blocks.albert_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.albert_hand_found = function(b, c) {
  b = Entry.hw.portData;
  return 40 < b.leftProximity || 40 < b.rightProximity;
};
Blockly.Blocks.albert_is_oid_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_is_oid_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_front_oid, "FRONT"], [Lang.Blocks.ALBERT_back_oid, "BACK"]]), "OID").appendField(Lang.Blocks.ALBERT_is_oid_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_is_oid_3);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.albert_is_oid_value = function(b, c) {
  b = Entry.hw.portData;
  var d = c.getField("OID", c);
  c = c.getNumberValue("VALUE");
  return "FRONT" == d ? b.frontOid == c : b.backOid == c;
};
Blockly.Blocks.albert_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_sensor_left_proximity, "leftProximity"], [Lang.Blocks.ALBERT_sensor_right_proximity, "rightProximity"], [Lang.Blocks.ALBERT_sensor_acceleration_x, "accelerationX"], [Lang.Blocks.ALBERT_sensor_acceleration_y, "accelerationY"], [Lang.Blocks.ALBERT_sensor_acceleration_z, "accelerationZ"], [Lang.Blocks.ALBERT_sensor_front_oid, "frontOid"], [Lang.Blocks.ALBERT_sensor_back_oid, "backOid"], [Lang.Blocks.ALBERT_sensor_position_x, 
  "positionX"], [Lang.Blocks.ALBERT_sensor_position_y, "positionY"], [Lang.Blocks.ALBERT_sensor_orientation, "orientation"], [Lang.Blocks.ALBERT_sensor_light, "light"], [Lang.Blocks.ALBERT_sensor_temperature, "temperature"], [Lang.Blocks.ALBERT_sensor_battery, "battery"], [Lang.Blocks.ALBERT_sensor_signal_strength, "signalStrength"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.albert_value = function(b, c) {
  b = Entry.hw.portData;
  c = c.getField("DEVICE");
  return b[c];
};
Blockly.Blocks.albert_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward_for_secs = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    b.leftWheel = 0;
    b.rightWheel = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.timeFlag = 1;
  b.leftWheel = 30;
  b.rightWheel = 30;
  b = 1000 * c.getNumberValue("VALUE");
  var d = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, b);
  Entry.Albert.timeouts.push(d);
  return c;
};
Blockly.Blocks.albert_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward_for_secs = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    b.leftWheel = 0;
    b.rightWheel = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.timeFlag = 1;
  b.leftWheel = -30;
  b.rightWheel = -30;
  b = 1000 * c.getNumberValue("VALUE");
  var d = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, b);
  Entry.Albert.timeouts.push(d);
  return c;
};
Blockly.Blocks.albert_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_turn_left, "LEFT"], [Lang.Blocks.ALBERT_turn_right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_for_secs = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    b.leftWheel = 0;
    b.rightWheel = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.timeFlag = 1;
  "LEFT" == c.getField("DIRECTION", c) ? (b.leftWheel = -30, b.rightWheel = 30) : (b.leftWheel = 30, b.rightWheel = -30);
  b = 1000 * c.getNumberValue("VALUE");
  var d = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, b);
  Entry.Albert.timeouts.push(d);
  return c;
};
Blockly.Blocks.albert_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_both_wheels_by = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getNumberValue("LEFT"), e = c.getNumberValue("RIGHT");
  b.leftWheel = void 0 != b.leftWheel ? b.leftWheel + d : d;
  b.rightWheel = void 0 != b.rightWheel ? b.rightWheel + e : e;
  return c.callReturn();
};
Blockly.Blocks.albert_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_both_wheels_to = function(b, c) {
  b = Entry.hw.sendQueue;
  b.leftWheel = c.getNumberValue("LEFT");
  b.rightWheel = c.getNumberValue("RIGHT");
  return c.callReturn();
};
Blockly.Blocks.albert_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_wheel, "LEFT"], [Lang.Blocks.ALBERT_right_wheel, "RIGHT"], [Lang.Blocks.ALBERT_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheel_by = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("DIRECTION"), e = c.getNumberValue("VALUE");
  "LEFT" == d ? b.leftWheel = void 0 != b.leftWheel ? b.leftWheel + e : e : ("RIGHT" != d && (b.leftWheel = void 0 != b.leftWheel ? b.leftWheel + e : e), b.rightWheel = void 0 != b.rightWheel ? b.rightWheel + e : e);
  return c.callReturn();
};
Blockly.Blocks.albert_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_wheel, "LEFT"], [Lang.Blocks.ALBERT_right_wheel, "RIGHT"], [Lang.Blocks.ALBERT_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheel_to = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("DIRECTION"), e = c.getNumberValue("VALUE");
  "LEFT" == d ? b.leftWheel = e : ("RIGHT" != d && (b.leftWheel = e), b.rightWheel = e);
  return c.callReturn();
};
Blockly.Blocks.albert_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_stop = function(b, c) {
  b = Entry.hw.sendQueue;
  b.leftWheel = 0;
  b.rightWheel = 0;
  return c.callReturn();
};
Blockly.Blocks.albert_set_pad_size_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_board_size_to_1);
  this.appendValueInput("WIDTH").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_board_size_to_2);
  this.appendValueInput("HEIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_board_size_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_pad_size_to = function(b, c) {
  b = Entry.hw.sendQueue;
  b.padWidth = c.getNumberValue("WIDTH");
  b.padHeight = c.getNumberValue("HEIGHT");
  return c.callReturn();
};
Blockly.Blocks.albert_move_to_x_y_on_board = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_to_x_y_1);
  this.appendValueInput("X").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_to_x_y_2);
  this.appendValueInput("Y").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_to_x_y_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_to_x_y_on_board = function(b, c) {
  var d = Entry.hw.sendQueue, e = Entry.hw.portData;
  b = Entry.Albert.controller;
  if (c.isStart) {
    if (c.isMoving) {
      0 <= e.positionX && (c.x = e.positionX);
      0 <= e.positionY && (c.y = e.positionY);
      c.theta = e.orientation;
      switch(c.boardState) {
        case 1:
          if (0 == c.initialized) {
            if (0 > c.x || 0 > c.y) {
              d.leftWheel = 20;
              d.rightWheel = -20;
              break;
            }
            c.initialized = !0;
          }
          d = b.toRadian(c.theta);
          0 == b.controlAngle(d, Math.atan2(c.targetY - c.y, c.targetX - c.x)) && (c.boardState = 2);
          break;
        case 2:
          0 == b.controlPosition(c.x, c.y, b.toRadian(c.theta), c.targetX, c.targetY) && (c.boardState = 3);
          break;
        case 3:
          0 == b.controlPositionFine(c.x, c.y, b.toRadian(c.theta), c.targetX, c.targetY) && (d.leftWheel = 0, d.rightWheel = 0, c.isMoving = !1);
      }
      return c;
    }
    delete c.isStart;
    delete c.isMoving;
    delete c.initialized;
    delete c.boardState;
    delete c.x;
    delete c.y;
    delete c.theta;
    delete c.targetX;
    delete c.targetY;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.isMoving = !0;
  c.initialized = !1;
  c.boardState = 1;
  c.x = -1;
  c.y = -1;
  c.theta = -200;
  c.targetX = c.getNumberValue("X");
  c.targetY = c.getNumberValue("Y");
  b.clear();
  d.leftWheel = 0;
  d.rightWheel = 0;
  return c;
};
Blockly.Blocks.albert_set_orientation_on_board = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_orientation_to_1);
  this.appendValueInput("ORIENTATION").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_orientation_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_orientation_on_board = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = Entry.hw.portData;
  var e = Entry.Albert.controller;
  if (c.isStart) {
    if (c.isMoving) {
      c.theta = d.orientation;
      switch(c.boardState) {
        case 1:
          var f = e.toRadian(c.theta);
          d = e.toRadian(c.targetTheta);
          0 == e.controlAngle(f, d) && (c.boardState = 2);
          break;
        case 2:
          f = e.toRadian(c.theta), d = e.toRadian(c.targetTheta), 0 == e.controlAngleFine(f, d) && (b.leftWheel = 0, b.rightWheel = 0, c.isMoving = !1);
      }
      return c;
    }
    delete c.isStart;
    delete c.isMoving;
    delete c.boardState;
    delete c.theta;
    delete c.targetTheta;
    Entry.engine.isContinue = !1;
    b.leftWheel = 0;
    b.rightWheel = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.isMoving = !0;
  c.boardState = 1;
  c.theta = -200;
  c.targetTheta = c.getNumberValue("ORIENTATION");
  e.clear();
  b.leftWheel = 0;
  b.rightWheel = 0;
  return c;
};
Blockly.Blocks.albert_set_eye_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_eye_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_eye, "LEFT"], [Lang.Blocks.ALBERT_right_eye, "RIGHT"], [Lang.Blocks.ALBERT_both_eyes, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_eye_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.ALBERT_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.ALBERT_color_magenta, 
  "5"], [Lang.Blocks.ALBERT_color_white, "7"]]), "COLOR").appendField(Lang.Blocks.ALBERT_set_eye_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_eye_to = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("DIRECTION", c), e = Number(c.getField("COLOR", c));
  "LEFT" == d ? b.leftEye = e : ("RIGHT" != d && (b.leftEye = e), b.rightEye = e);
  return c.callReturn();
};
Blockly.Blocks.albert_clear_eye = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_eye_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_eye, "LEFT"], [Lang.Blocks.ALBERT_right_eye, "RIGHT"], [Lang.Blocks.ALBERT_both_eyes, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_eye_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_eye = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("DIRECTION", c);
  "LEFT" == d ? b.leftEye = 0 : ("RIGHT" != d && (b.leftEye = 0), b.rightEye = 0);
  return c.callReturn();
};
Blockly.Blocks.albert_body_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_body_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_turn_on, "ON"], [Lang.Blocks.ALBERT_turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_turn_body_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_body_led = function(b, c) {
  b = Entry.hw.sendQueue;
  "ON" == c.getField("STATE", c) ? b.bodyLed = 1 : b.bodyLed = 0;
  return c.callReturn();
};
Blockly.Blocks.albert_front_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_front_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_turn_on, "ON"], [Lang.Blocks.ALBERT_turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_turn_front_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_front_led = function(b, c) {
  b = Entry.hw.sendQueue;
  "ON" == c.getField("STATE", c) ? b.frontLed = 1 : b.frontLed = 0;
  return c.callReturn();
};
Blockly.Blocks.albert_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_beep = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    b.buzzer = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.timeFlag = 1;
  b.buzzer = 440;
  b.note = 0;
  var d = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, 200);
  Entry.Albert.timeouts.push(d);
  return c;
};
Blockly.Blocks.albert_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_buzzer_by = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getNumberValue("VALUE");
  b.buzzer = void 0 != b.buzzer ? b.buzzer + d : d;
  b.note = 0;
  return c.callReturn();
};
Blockly.Blocks.albert_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_buzzer_to = function(b, c) {
  b = Entry.hw.sendQueue;
  b.buzzer = c.getNumberValue("VALUE");
  b.note = 0;
  return c.callReturn();
};
Blockly.Blocks.albert_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_buzzer = function(b, c) {
  b = Entry.hw.sendQueue;
  b.buzzer = 0;
  b.note = 0;
  return c.callReturn();
};
Blockly.Blocks.albert_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.ALBERT_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.ALBERT_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_play_note_for = function(b, c) {
  var d = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    d.note = 0;
    return c.callReturn();
  }
  b = c.getNumberField("NOTE", c);
  var e = c.getNumberField("OCTAVE", c), f = 6E4 * c.getNumberValue("VALUE", c) / Entry.Albert.tempo;
  c.isStart = !0;
  c.timeFlag = 1;
  d.buzzer = 0;
  d.note = b + 12 * (e - 1);
  if (100 < f) {
    var g = setTimeout(function() {
      d.note = 0;
      Entry.Albert.removeTimeout(g);
    }, f - 100);
    Entry.Albert.timeouts.push(g);
  }
  var h = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Albert.removeTimeout(h);
  }, f);
  Entry.Albert.timeouts.push(h);
  return c;
};
Blockly.Blocks.albert_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_rest_for = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    return c.callReturn();
  }
  c.isStart = !0;
  c.timeFlag = 1;
  var d = c.getNumberValue("VALUE"), d = 6E4 * d / Entry.Albert.tempo;
  b.buzzer = 0;
  b.note = 0;
  var e = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Albert.removeTimeout(e);
  }, d);
  Entry.Albert.timeouts.push(e);
  return c;
};
Blockly.Blocks.albert_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_tempo_by = function(b, c) {
  Entry.Albert.tempo += c.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return c.callReturn();
};
Blockly.Blocks.albert_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_tempo_to = function(b, c) {
  Entry.Albert.tempo = c.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return c.callReturn();
};
Entry.Altino = {PORT_MAP:{rightWheel:0, leftWheel:0, steering:0, ascii:0, led:0, led2:0, note:0, dot1:0, dot2:0, dot3:0, dot4:0, dot5:0, dot6:0, dot7:0, dot8:0}, setZero:function() {
  var b = Entry.Altino.PORT_MAP, c = Entry.hw.sendQueue, d;
  for (d in b) {
    c[d] = b[d];
  }
  Entry.hw.update();
  Entry.Altino.removeAllTimeouts();
}, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var c = this.timeouts;
  b = c.indexOf(b);
  0 <= b && c.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, c;
  for (c in b) {
    clearTimeout(b[c]);
  }
  this.timeouts = [];
}, name:"altino"};
Entry.Arduino = {name:"arduino", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var b = 0; 20 > b; b++) {
    Entry.hw.sendQueue[b] = 0, Entry.hw.sendQueue.readablePorts.push(b);
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/arduino.png", width:605, height:434, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + 
" 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + " 8 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " 9 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " 10 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + " 11 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a0:{name:Lang.Hw.port_en + " A0 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a1:{name:Lang.Hw.port_en + " A1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " A2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.ArduinoExt = {name:"ArduinoExt", setZero:function() {
  Entry.hw.sendQueue.SET ? Object.keys(Entry.hw.sendQueue.SET).forEach(function(b) {
    Entry.hw.sendQueue.SET[b].data = 0;
    Entry.hw.sendQueue.SET[b].time = (new Date).getTime();
  }) : Entry.hw.sendQueue = {GET:{}, SET:{}};
  Entry.hw.update();
}, sensorTypes:{ALIVE:0, DIGITAL:1, ANALOG:2, PWM:3, SERVO_PIN:4, TONE:5, PULSEIN:6, ULTRASONIC:7, TIMER:8}, toneTable:{0:0, C:1, CS:2, D:3, DS:4, E:5, F:6, FS:7, G:8, GS:9, A:10, AS:11, B:12}, toneMap:{1:[33, 65, 131, 262, 523, 1046, 2093, 4186], 2:[35, 69, 139, 277, 554, 1109, 2217, 4435], 3:[37, 73, 147, 294, 587, 1175, 2349, 4699], 4:[39, 78, 156, 311, 622, 1245, 2849, 4978], 5:[41, 82, 165, 330, 659, 1319, 2637, 5274], 6:[44, 87, 175, 349, 698, 1397, 2794, 5588], 7:[46, 92, 185, 370, 740, 1480, 
2960, 5920], 8:[49, 98, 196, 392, 784, 1568, 3136, 6272], 9:[52, 104, 208, 415, 831, 1661, 3322, 6645], 10:[55, 110, 220, 440, 880, 1760, 3520, 7040], 11:[58, 117, 233, 466, 932, 1865, 3729, 7459], 12:[62, 123, 247, 494, 988, 1976, 3951, 7902]}, highList:["high", "1", "on"], lowList:["low", "0", "off"], BlockState:{}};
Entry.SmartBoard = {name:"smartBoard", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var b = 0; 20 > b; b++) {
    if (9 != b || 10 != b || 11 != b) {
      Entry.hw.sendQueue[b] = 0, Entry.hw.sendQueue.readablePorts.push(b);
    }
  }
  Entry.hw.update();
}, monitorTemplate:{listPorts:{2:{name:Lang.Hw.port_en + " GS2 ", type:"output", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " GS1 ", type:"output", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " MT1 \ud68c\uc804 \ubc29\ud5a5 ", type:"output", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " MT1 PWM ", type:"output", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " MT2 PWM ", type:"output", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + " MT2 \ud68c\uc804 \ubc29\ud5a5 ", type:"output", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + 
" RELAY ", type:"output", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " SM3 \uac01\ub3c4 ", type:"output", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " SM2 \uac01\ub3c4 ", type:"output", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + "SM1 \uac01\ub3c4 ", type:"output", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " \ube68\uac04 " + Lang.Hw.button, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " \ub178\ub780 " + Lang.Hw.button, type:"input", pos:{x:0, y:0}}, 14:{name:Lang.Hw.port_en + " \ucd08\ub85d " + 
Lang.Hw.button, type:"input", pos:{x:0, y:0}}, 15:{name:Lang.Hw.port_en + " \ud30c\ub780 " + Lang.Hw.button, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " 1\ubc88 " + Lang.Hw.sensor, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " 2\ubc88 " + Lang.Hw.sensor, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " 3\ubc88 " + Lang.Hw.sensor, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " 4\ubc88 " + Lang.Hw.sensor, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.SensorBoard = {name:"sensorBoard", setZero:Entry.Arduino.setZero};
Entry.ardublock = {name:"ardublock", setZero:function() {
  Entry.hw.sendQueue.SET ? Object.keys(Entry.hw.sendQueue.SET).forEach(function(b) {
    Entry.hw.sendQueue.SET[b].data = 0;
    Entry.hw.sendQueue.SET[b].time = (new Date).getTime();
  }) : Entry.hw.sendQueue = {GET:{}, SET:{}};
  Entry.hw.update();
}, sensorTypes:{ALIVE:0, DIGITAL:1, ANALOG:2, PWM:3, SERVO_PIN:4, TONE:5, PULSEIN:6, ULTRASONIC:7, TIMER:8, MOTOR_LEFT:9, MOTOR_RIGHT:10}, toneTable:{0:0, C:1, CS:2, D:3, DS:4, E:5, F:6, FS:7, G:8, GS:9, A:10, AS:11, B:12}, toneMap:{1:[33, 65, 131, 262, 523, 1046, 2093, 4186], 2:[35, 69, 139, 277, 554, 1109, 2217, 4435], 3:[37, 73, 147, 294, 587, 1175, 2349, 4699], 4:[39, 78, 156, 311, 622, 1245, 2849, 4978], 5:[41, 82, 165, 330, 659, 1319, 2637, 5274], 6:[44, 87, 175, 349, 698, 1397, 2794, 5588], 
7:[46, 92, 185, 370, 740, 1480, 2960, 5920], 8:[49, 98, 196, 392, 784, 1568, 3136, 6272], 9:[52, 104, 208, 415, 831, 1661, 3322, 6645], 10:[55, 110, 220, 440, 880, 1760, 3520, 7040], 11:[58, 117, 233, 466, 932, 1865, 3729, 7459], 12:[62, 123, 247, 494, 988, 1976, 3951, 7902]}, directionTable:{Forward:0, Backward:1}, highList:["high", "1", "on"], lowList:["low", "0", "off"], BlockState:{}};
Entry.dplay = {name:"dplay", vel_value:255, Left_value:255, Right_value:255, setZero:Entry.Arduino.setZero, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var c = this.timeouts;
  b = c.indexOf(b);
  0 <= b && c.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, c;
  for (c in b) {
    clearTimeout(b[c]);
  }
  this.timeouts = [];
}, monitorTemplate:{imgPath:"hw/dplay.png", width:500, height:600, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + 
" 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + " 8 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " 9 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " 10 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + " 11 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a0:{name:Lang.Hw.port_en + " A0 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a1:{name:Lang.Hw.port_en + " A1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " A2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.nemoino = {name:"nemoino", setZero:Entry.Arduino.setZero};
Entry.joystick = {name:"joystick", setZero:Entry.Arduino.setZero};
Entry.CODEino = {name:"CODEino", getSensorKey:function() {
  return "xxxxxxxx".replace(/[xy]/g, function(b) {
    var c = 16 * Math.random() | 0;
    return ("x" == b ? c : c & 0 | 0).toString(16);
  }).toUpperCase();
}, getSensorTime:function(b) {
  return (new Date).getTime() + b;
}, monitorTemplate:Entry.Arduino.monitorTemplate, setZero:function() {
  Entry.hw.sendQueue.SET ? Object.keys(Entry.hw.sendQueue.SET).forEach(function(b) {
    Entry.hw.sendQueue.SET[b].data = 0;
    Entry.hw.sendQueue.TIME = Entry.CODEino.getSensorTime(Entry.hw.sendQueue.SET[b].type);
    Entry.hw.sendQueue.KEY = Entry.CODEino.getSensorKey();
  }) : Entry.hw.sendQueue = {SET:{0:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 1:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 2:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 3:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 4:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 5:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 6:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 7:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 8:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 
  9:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 10:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 11:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 12:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 13:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}}, TIME:Entry.CODEino.getSensorTime(Entry.CODEino.sensorTypes.DIGITAL), KEY:Entry.CODEino.getSensorKey()};
  Entry.hw.update();
}, sensorTypes:{ALIVE:0, DIGITAL:1, ANALOG:2, PWM:3, RGBLED_PIN:4, TONE:5, PULSEIN:6, ULTRASONIC:7, TIMER:8, ADDCOLOR:9}, BlockState:{}};
Blockly.Blocks.arduino_text = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput("Arduino"), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_text = function(b, c) {
  return c.getStringField("NAME");
};
Blockly.Blocks.arduino_send = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_send = function(b, c) {
  b = c.getValue("VALUE", c);
  var d = new XMLHttpRequest;
  d.open("POST", "http://localhost:23518/arduino/", !1);
  d.send(String(b));
  Entry.assert(200 == d.status, "arduino is not connected");
  return c.callReturn();
};
Blockly.Blocks.arduino_get_string = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_2);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_number = function(b, c) {
  b = c.getValue("VALUE", c);
  c = new XMLHttpRequest;
  c.open("POST", "http://localhost:23518/arduino/", !1);
  c.send(String(b));
  Entry.assert(200 == c.status, "arduino is not connected");
  return Number(c.responseText);
};
Blockly.Blocks.arduino_get_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_string = function(b, c) {
  b = c.getValue("VALUE", c);
  c = new XMLHttpRequest;
  c.open("POST", "http://localhost:23518/arduino/", !1);
  c.send(String(b));
  Entry.assert(200 == c.status, "arduino is not connected");
  return c.responseText;
};
Blockly.Blocks.arduino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_arduino_get_sensor_number_0, "A0"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_1, "A1"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_2, "A2"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_3, "A3"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_4, "A4"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_5, "A5"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_sensor_number = function(b, c) {
  return c.getStringField("PORT");
};
Blockly.Blocks.arduino_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_port_number = function(b, c) {
  return c.getStringField("PORT");
};
Blockly.Blocks.arduino_get_pwm_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_pwm_port_number = function(b, c) {
  return c.getStringField("PORT");
};
Blockly.Blocks.arduino_get_number_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.arduino_get_number_sensor_value = function(b, c) {
  b = c.getValue("VALUE", c);
  return Entry.hw.getAnalogPortValue(b[1]);
};
Blockly.Blocks.arduino_get_digital_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.arduino_get_digital_value = function(b, c) {
  b = c.getNumberValue("VALUE", c);
  return Entry.hw.getDigitalPortValue(b);
};
Blockly.Blocks.arduino_toggle_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_led = function(b, c) {
  b = c.getNumberValue("VALUE");
  var d = c.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(b, "on" == d ? 255 : 0);
  return c.callReturn();
};
Blockly.Blocks.arduino_toggle_pwm = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_1);
  this.appendValueInput("PORT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_3);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_pwm = function(b, c) {
  b = c.getNumberValue("PORT");
  var d = c.getNumberValue("VALUE"), d = Math.round(d), d = Math.max(d, 0), d = Math.min(d, 255);
  Entry.hw.setDigitalPortValue(b, d);
  return c.callReturn();
};
Blockly.Blocks.arduino_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_4);
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_6);
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_convert_scale = function(b, c) {
  var d = c.getNumberValue("VALUE1", c), e = c.getNumberValue("VALUE2", c), f = c.getNumberValue("VALUE3", c);
  b = c.getNumberValue("VALUE4", c);
  c = c.getNumberValue("VALUE5", c);
  if (e > f) {
    var g = e;
    e = f;
    f = g;
  }
  b > c && (g = b, b = c, c = g);
  d = (c - b) / (f - e) * (d - e);
  d += b;
  d = Math.min(c, d);
  d = Math.max(b, d);
  return Math.round(d);
};
Blockly.Blocks.sensorBoard_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\uc18c\ub9ac", "0"], ["\ube5b \uac10\uc9c0", "1"], ["\uc2ac\ub77c\uc774\ub354", "2"], ["\uc628\ub3c4", "3"]]), "PORT").appendField(" \uc13c\uc11c\uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.sensorBoard_get_named_sensor_value = function(b, c) {
  return Entry.hw.getAnalogPortValue(c.getField("PORT", c));
};
Blockly.Blocks.sensorBoard_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "8"], ["\ud30c\ub780", "9"], ["\ub178\ub780", "10"], ["\ucd08\ub85d", "11"]]), "PORT");
  this.appendDummyInput().appendField(" \ubc84\ud2bc\uc744 \ub20c\ub800\ub294\uac00?");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.sensorBoard_is_button_pressed = function(b, c) {
  return Entry.hw.getDigitalPortValue(c.getNumberField("PORT", c));
};
Blockly.Blocks.sensorBoard_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "2"], ["\ucd08\ub85d", "3"], ["\ud30c\ub780", "4"], ["\ud770\uc0c9", "5"]]), "PORT").appendField(" LED").appendField(new Blockly.FieldDropdown([["\ucf1c\uae30", "255"], ["\ub044\uae30", "0"]]), "OPERATOR").appendField(" ").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.sensorBoard_led = function(b, c) {
  Entry.hw.setDigitalPortValue(c.getField("PORT"), c.getNumberField("OPERATOR"));
  return c.callReturn();
};
Entry.block.arduino_download_connector = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ud504\ub85c\uadf8\ub7a8 \ub2e4\uc6b4\ub85c\ub4dc", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download connector");
}]}};
Entry.block.download_guide = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \uc548\ub0b4 \ub2e4\uc6b4\ub85c\ub4dc", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download guide");
}]}};
Entry.block.arduino_download_source = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5d4\ud2b8\ub9ac \uc544\ub450\uc774\ub178 \uc18c\uc2a4", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_connected = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ub428", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_reconnect = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ub2e4\uc2dc \uc5f0\uacb0\ud558\uae30", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Blockly.Blocks.CODEino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_get_sensor_number_0, "A0"], [Lang.Blocks.CODEino_get_sensor_number_1, "A1"], [Lang.Blocks.CODEino_get_sensor_number_2, "A2"], [Lang.Blocks.CODEino_get_sensor_number_3, "A3"], [Lang.Blocks.CODEino_get_sensor_number_4, "A4"], [Lang.Blocks.CODEino_get_sensor_number_5, "A5"], [Lang.Blocks.CODEino_get_sensor_number_6, "A6"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_sensor_number = function(b, c) {
  return c.getStringField("PORT");
};
Blockly.Blocks.CODEino_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_sensor_name_0, "0"], [Lang.Blocks.CODEino_sensor_name_1, "1"], [Lang.Blocks.CODEino_sensor_name_2, "2"], [Lang.Blocks.CODEino_sensor_name_3, "3"], [Lang.Blocks.CODEino_sensor_name_4, "4"], [Lang.Blocks.CODEino_sensor_name_5, "5"], [Lang.Blocks.CODEino_sensor_name_6, "6"]]), "PORT").appendField(Lang.Blocks.CODEino_string_1);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_named_sensor_value = function(b, c) {
  return Entry.hw.getAnalogPortValue(c.getField("PORT", c));
};
Blockly.Blocks.CODEino_get_sound_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_10).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_11, "GREAT"], [Lang.Blocks.CODEino_string_12, "SMALL"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_sound_status = function(b, c) {
  return "GREAT" == c.getField("STATUS", c) ? 600 < Entry.hw.getAnalogPortValue(0) ? 1 : 0 : 600 > Entry.hw.getAnalogPortValue(0) ? 1 : 0;
};
Blockly.Blocks.CODEino_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_13).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_14, "BRIGHT"], [Lang.Blocks.CODEino_string_15, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_light_status = function(b, c) {
  return "DARK" == c.getField("STATUS", c) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.CODEino_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_3, "4"], [Lang.Blocks.CODEino_string_4, "17"], [Lang.Blocks.CODEino_string_5, "18"], [Lang.Blocks.CODEino_string_6, "19"], [Lang.Blocks.CODEino_string_7, "20"]]), "PORT").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_is_button_pressed = function(b, c) {
  b = c.getNumberField("PORT", c);
  return 14 < b ? !Entry.hw.getAnalogPortValue(b - 14) : !Entry.hw.getDigitalPortValue(b);
};
Blockly.Blocks.CODEino_get_accelerometer_direction = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_16, "LEFT"], [Lang.Blocks.CODEino_string_17, "RIGHT"], [Lang.Blocks.CODEino_string_18, "FRONT"], [Lang.Blocks.CODEino_string_19, "REAR"], [Lang.Blocks.CODEino_string_20, "REVERSE"]]), "DIRECTION");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_accelerometer_direction = function(b, c) {
  b = c.getField("DIRECTION", c);
  c = 0;
  "LEFT" == b || "RIGHT" == b ? c = 3 : "FRONT" == b || "REAR" == b ? c = 4 : "REVERSE" == b && (c = 5);
  c = Entry.hw.getAnalogPortValue(c) - 265;
  c = Math.min(90, 180 / 137 * c + -90);
  c = Math.max(-90, c);
  c = Math.round(c);
  if ("LEFT" == b || "REAR" == b) {
    return -30 > c ? 1 : 0;
  }
  if ("RIGHT" == b || "FRONT" == b) {
    return 30 < c ? 1 : 0;
  }
  if ("REVERSE" == b) {
    return -50 > c ? 1 : 0;
  }
};
Blockly.Blocks.CODEino_get_accelerometer_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_accelerometer_X, "3"], [Lang.Blocks.CODEino_accelerometer_Y, "4"], [Lang.Blocks.CODEino_accelerometer_Z, "5"]]), "PORT").appendField(Lang.Blocks.CODEino_string_9);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_accelerometer_value = function(b, c) {
  var d = Entry.hw.getAnalogPortValue(c.getField("PORT", c)), e = 265, f = 402;
  b = -90;
  c = 90;
  if (e > f) {
    var g = e;
    e = f;
    f = g;
  }
  b > c && (g = b, b = c, c = g);
  g = (c - b) / (f - e) * (d - e);
  g += b;
  g = Math.min(c, g);
  g = Math.max(b, g);
  return Math.round(g);
};
Blockly.Blocks.dplay_select_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_select_led = function(b, c) {
  var d = c.getField("PORT");
  b = 7;
  "7" == d ? b = 7 : "8" == d ? b = 8 : "9" == d ? b = 9 : "10" == d && (b = 10);
  d = c.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(b, "on" == d ? 255 : 0);
  return c.callReturn();
};
Blockly.Blocks.dplay_get_switch_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ub514\uc9c0\ud138 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["2", "2"], ["4", "4"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_5, "ON"], [Lang.Blocks.dplay_string_6, "OFF"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_switch_status = function(b, c) {
  b = c.getField("PORT");
  var d = 2;
  "2" == b ? d = 2 : "4" == b && (d = 4);
  return "OFF" == c.getField("STATUS") ? 1 == Entry.hw.getDigitalPortValue(d) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(d) ? 1 : 0;
};
Blockly.Blocks.dplay_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_light).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_3, "BRIGHT"], [Lang.Blocks.dplay_string_4, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_light_status = function(b, c) {
  return "DARK" == c.getField("STATUS", c) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.dplay_get_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc88 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uac00\ubcc0\uc800\ud56d", "ADJU"], ["\ube5b\uc13c\uc11c", "LIGHT"], ["\uc628\ub3c4\uc13c\uc11c", "TEMP"], ["\uc870\uc774\uc2a4\ud2f1 X", "JOYS"], ["\uc870\uc774\uc2a4\ud2f1 Y", "JOYS"], ["\uc801\uc678\uc120", "INFR"]]), "OPERATOR");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_5);
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.dplay_get_value = function(b, c) {
  b = c.getValue("VALUE", c);
  return Entry.hw.getAnalogPortValue(b[1]);
};
Blockly.Blocks.dplay_get_tilt = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_tilt).appendField(new Blockly.FieldDropdown([["\uc67c\ucabd \uae30\uc6b8\uc784", "LEFT"], ["\uc624\ub978\ucabd \uae30\uc6b8\uc784", "LIGHT"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_tilt = function(b, c) {
  return "LIGHT" == c.getField("STATUS", c) ? 1 == Entry.hw.getDigitalPortValue(12) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(12) ? 1 : 0;
};
Blockly.Blocks.dplay_DCmotor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc67c\ucabd", "3"], ["\uc624\ub978\ucabd", "6"]]), "PORT");
  this.appendDummyInput().appendField(" DC\ubaa8\ud130 \uc0c1\ud0dc\ub97c");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc815\ubc29\ud5a5", "FRONT"], ["\uc5ed\ubc29\ud5a5", "REAR"], ["\uc815\uc9c0", "OFF"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_DCmotor = function(b, c) {
  b = c.getField("PORT");
  var d = 0;
  "3" == b ? d = 5 : "6" == b && (d = 11);
  var e = c.getField("OPERATOR"), f = 0, g = 0;
  "FRONT" == e ? (f = 255, g = 0) : "REAR" == e ? (f = 0, g = 255) : "OFF" == e && (g = f = 0);
  Entry.hw.setDigitalPortValue(b, f);
  Entry.hw.setDigitalPortValue(d, g);
  return c.callReturn();
};
Blockly.Blocks.dplay_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubd80\uc800\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\ub3c4", "1"], ["\ub808", "2"], ["\ubbf8", "3"]]), "PORT");
  this.appendDummyInput().appendField("\ub85c");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc15\uc790\ub85c \uc5f0\uc8fc\ud558\uae30");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_buzzer = function(b, c) {
  var d = c.getField("PORT");
  b = 2;
  "1" == d ? b = 2 : "2" == d ? b = 4 : "3" == d && (b = 7);
  d = c.getNumberValue("VALUE");
  d = Math.round(d);
  d = Math.max(d, 0);
  d = Math.min(d, 100);
  Entry.hw.setDigitalPortValue(b, d);
  return c.callReturn();
};
Blockly.Blocks.dplay_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4\ubaa8\ud130 \uac01\ub3c4\ub97c");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc774\ub3d9");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_servo = function(b, c) {
  b = c.getNumberValue("VALUE");
  b = Math.round(b);
  b = Math.max(b, 0);
  b = Math.min(b, 180);
  Entry.hw.setDigitalPortValue(9, b);
  return c.callReturn();
};
Entry.rokoboard = {name:"rokoboard", setZero:Entry.Arduino.setZero, monitorTemplate:Entry.Arduino.monitorTemplate};
Entry.Bitbrick = {SENSOR_MAP:{1:"light", 2:"IR", 3:"touch", 4:"potentiometer", 5:"MIC", 21:"UserSensor", 11:"UserInput", 20:"LED", 19:"SERVO", 18:"DC"}, PORT_MAP:{buzzer:2, 5:4, 6:6, 7:8, 8:10, LEDR:12, LEDG:14, LEDB:16}, sensorList:function() {
  for (var b = [], c = Entry.hw.portData, d = 1; 5 > d; d++) {
    var e = c[d];
    e && (e.value || 0 === e.value) && b.push([d + " - " + Lang.Blocks["BITBRICK_" + e.type], d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, touchList:function() {
  for (var b = [], c = Entry.hw.portData, d = 1; 5 > d; d++) {
    var e = c[d];
    e && "touch" === e.type && b.push([d.toString(), d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, servoList:function() {
  for (var b = [], c = Entry.hw.portData, d = 5; 9 > d; d++) {
    var e = c[d];
    e && "SERVO" === e.type && b.push(["ABCD"[d - 5], d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, dcList:function() {
  for (var b = [], c = Entry.hw.portData, d = 5; 9 > d; d++) {
    var e = c[d];
    e && "DC" === e.type && b.push(["ABCD"[d - 5], d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, setZero:function() {
  var b = Entry.hw.sendQueue, c;
  for (c in Entry.Bitbrick.PORT_MAP) {
    b[c] = 0;
  }
  Entry.hw.update();
}, name:"bitbrick", servoMaxValue:181, servoMinValue:1, dcMaxValue:100, dcMinValue:-100, monitorTemplate:{keys:["value"], imgPath:"hw/bitbrick.png", width:400, height:400, listPorts:{1:{name:Lang.Hw.port_en + " 1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, 
y:0}}, A:{name:Lang.Hw.port_en + " A " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, B:{name:Lang.Hw.port_en + " B " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, C:{name:Lang.Hw.port_en + " C " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, D:{name:Lang.Hw.port_en + " D " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Blockly.Blocks.bitbrick_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT").appendField(" \uac12");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_sensor_value = function(b, c) {
  b = c.getStringField("PORT");
  return Entry.hw.portData[b].value;
};
Blockly.Blocks.bitbrick_is_touch_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.BITBRICK_touch).appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.touchList), "PORT").appendField("\uc774(\uac00) \ub20c\ub838\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_is_touch_pressed = function(b, c) {
  return 0 === Entry.hw.portData[c.getStringField("PORT")].value;
};
Blockly.Blocks.bitbrick_turn_off_color_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_color_led = function(b, c) {
  Entry.hw.sendQueue.LEDR = 0;
  Entry.hw.sendQueue.LEDG = 0;
  Entry.hw.sendQueue.LEDB = 0;
  return c.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 R");
  this.appendValueInput("rValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("G");
  this.appendValueInput("gValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("B");
  this.appendValueInput("bValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_rgb = function(b, c) {
  b = c.getNumberValue("rValue");
  var d = c.getNumberValue("gValue"), e = c.getNumberValue("bValue"), f = Entry.adjustValueWithMaxMin, g = Entry.hw.sendQueue;
  g.LEDR = f(b, 0, 255);
  g.LEDG = f(d, 0, 255);
  g.LEDB = f(e, 0, 255);
  return c.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \uc0c9 ").appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_picker = function(b, c) {
  b = c.getStringField("VALUE");
  Entry.hw.sendQueue.LEDR = parseInt(b.substr(1, 2), 16);
  Entry.hw.sendQueue.LEDG = parseInt(b.substr(3, 2), 16);
  Entry.hw.sendQueue.LEDB = parseInt(b.substr(5, 2), 16);
  return c.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 \uc0c9");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_value = function(b, c) {
  b = c.getNumberValue("VALUE");
  b %= 200;
  if (67 > b) {
    var d = 200 - 3 * b;
    var e = 3 * b;
    var f = 0;
  } else {
    134 > b ? (b -= 67, d = 0, e = 200 - 3 * b, f = 3 * b) : 201 > b && (b -= 134, d = 3 * b, e = 0, f = 200 - 3 * b);
  }
  Entry.hw.sendQueue.LEDR = d;
  Entry.hw.sendQueue.LEDG = e;
  Entry.hw.sendQueue.LEDB = f;
  return c.callReturn();
};
Blockly.Blocks.bitbrick_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\uc800\uc74c ");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_buzzer = function(b, c) {
  if (c.isStart) {
    return Entry.hw.sendQueue.buzzer = 0, delete c.isStart, c.callReturn();
  }
  b = c.getNumberValue("VALUE");
  Entry.hw.sendQueue.buzzer = b;
  c.isStart = !0;
  return c;
};
Blockly.Blocks.bitbrick_turn_off_all_motors = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubaa8\ub4e0 \ubaa8\ud130 \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_all_motors = function(b, c) {
  var d = Entry.hw.sendQueue;
  b = Entry.Bitbrick;
  b.servoList().map(function(b) {
    d[b[1]] = 0;
  });
  b.dcList().map(function(b) {
    d[b[1]] = 128;
  });
  return c.callReturn();
};
Blockly.Blocks.bitbrick_dc_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" \uc18d\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_speed = function(b, c) {
  b = c.getNumberValue("VALUE");
  b = Math.min(b, Entry.Bitbrick.dcMaxValue);
  b = Math.max(b, Entry.Bitbrick.dcMinValue);
  Entry.hw.sendQueue[c.getStringField("PORT")] = b + 128;
  return c.callReturn();
};
Blockly.Blocks.bitbrick_dc_direction_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.BITBRICK_dc_direction_cw, "CW"], [Lang.Blocks.BITBRICK_dc_direction_ccw, "CCW"]]), "DIRECTION").appendField(" \ubc29\ud5a5").appendField(" \uc18d\ub825");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_direction_speed = function(b, c) {
  b = "CW" === c.getStringField("DIRECTION");
  var d = c.getNumberValue("VALUE"), d = Math.min(d, Entry.Bitbrick.dcMaxValue), d = Math.max(d, 0);
  Entry.hw.sendQueue[c.getStringField("PORT")] = b ? d + 128 : 128 - d;
  return c.callReturn();
};
Blockly.Blocks.bitbrick_servomotor_angle = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4 \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.servoList), "PORT").appendField(" \uac01\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_servomotor_angle = function(b, c) {
  b = c.getNumberValue("VALUE") + 1;
  b = Math.min(b, Entry.Bitbrick.servoMaxValue);
  b = Math.max(b, Entry.Bitbrick.servoMinValue);
  Entry.hw.sendQueue[c.getStringField("PORT")] = b;
  return c.callReturn();
};
Blockly.Blocks.bitbrick_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubcc0\ud658");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT");
  this.appendDummyInput().appendField("\uac12");
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\uc5d0\uc11c");
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_convert_scale = function(b, c) {
  b = c.getNumberField("PORT");
  var d = Entry.hw.portData[b].value, e = c.getNumberValue("VALUE2", c), f = c.getNumberValue("VALUE3", c);
  b = c.getNumberValue("VALUE4", c);
  c = c.getNumberValue("VALUE5", c);
  if (b > c) {
    var g = b;
    b = c;
    c = g;
  }
  d = (c - b) / (f - e) * (d - e);
  d += b;
  d = Math.min(c, d);
  d = Math.max(b, d);
  return Math.round(d);
};
Entry.byrobot_dronefighter_controller = {name:"byrobot_dronefighter_controller", setZero:function() {
  for (var b = 0; 1 > b; b++) {
    this.transferVibrator(0, 0, 0, 0), this.transferbuzzer(0, 0, 0), this.transferLightManual(17, 255, 0), this.transferCommand(17, 129, 0);
  }
}, monitorTemplate:{imgPath:"hw/byrobot_dronefighter_controller.png", width:500, height:500, listPorts:{joystick_left_x:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_x, type:"input", pos:{x:0, y:0}}, joystick_left_y:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_y, type:"input", pos:{x:0, y:0}}, joystick_left_direction:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_direction, type:"input", pos:{x:0, y:0}}, joystick_left_event:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_event, 
type:"input", pos:{x:0, y:0}}, joystick_left_command:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_command, type:"input", pos:{x:0, y:0}}, joystick_right_x:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_x, type:"input", pos:{x:0, y:0}}, joystick_right_y:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_y, type:"input", pos:{x:0, y:0}}, joystick_right_direction:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_direction, type:"input", 
pos:{x:0, y:0}}, joystick_right_event:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_event, type:"input", pos:{x:0, y:0}}, joystick_right_command:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_command, type:"input", pos:{x:0, y:0}}, button_button:{name:Lang.Blocks.byrobot_dronefighter_controller_button_button, type:"input", pos:{x:0, y:0}}, button_event:{name:Lang.Blocks.byrobot_dronefighter_controller_button_event, type:"input", pos:{x:0, y:0}}, entryhw_countTransferReserved:{name:Lang.Blocks.byrobot_dronefighter_entryhw_count_transfer_reserved, 
type:"output", pos:{x:0, y:0}}}, ports:{}, mode:"both"}, checkFinish:function(b, c) {
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return "Running";
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    return "Finish";
  }
  b.isStart = !0;
  b.timeFlag = 1;
  setTimeout(function() {
    b.timeFlag = 0;
  }, 60 / (Entry.FPS || 60) * c);
  return "Start";
}, transferLightManual:function(b, c, d) {
  b = Math.max(b, 0);
  b = Math.min(b, 255);
  c = Math.max(c, 0);
  c = Math.min(c, 255);
  d = Math.max(d, 0);
  d = Math.min(d, 255);
  Entry.hw.setDigitalPortValue("target", b);
  Entry.hw.setDigitalPortValue("light_manual_flags", c);
  Entry.hw.setDigitalPortValue("light_manual_brightness", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.light_manual_flags;
  delete Entry.hw.sendQueue.light_manual_brightness;
}, transferbuzzer:function(b, c, d) {
  Entry.hw.setDigitalPortValue("target", 17);
  Entry.hw.setDigitalPortValue("buzzer_mode", b);
  Entry.hw.setDigitalPortValue("buzzer_value", c);
  Entry.hw.setDigitalPortValue("buzzer_time", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.buzzer_mode;
  delete Entry.hw.sendQueue.buzzer_value;
  delete Entry.hw.sendQueue.buzzer_time;
}, transferVibrator:function(b, c, d, e) {
  c = Math.max(c, 1);
  c = Math.min(c, 60000);
  d = Math.max(d, 1);
  d = Math.min(d, 60000);
  Entry.hw.setDigitalPortValue("target", 17);
  Entry.hw.setDigitalPortValue("vibrator_mode", b);
  Entry.hw.setDigitalPortValue("vibrator_on", c);
  Entry.hw.setDigitalPortValue("vibrator_off", d);
  Entry.hw.setDigitalPortValue("vibrator_total", e);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.vibrator_mode;
  delete Entry.hw.sendQueue.vibrator_on;
  delete Entry.hw.sendQueue.vibrator_off;
  delete Entry.hw.sendQueue.vibrator_total;
}, transferCommand:function(b, c, d) {
  Entry.hw.setDigitalPortValue("target", b);
  Entry.hw.setDigitalPortValue("command_command", c);
  Entry.hw.setDigitalPortValue("command_option", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.command_command;
  delete Entry.hw.sendQueue.command_option;
}, transferUserInterface:function(b, c) {
  Entry.hw.setDigitalPortValue("target", 17);
  Entry.hw.setDigitalPortValue("userinterface_command", b);
  Entry.hw.setDigitalPortValue("userinterface_function", c);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.userinterface_command;
  delete Entry.hw.sendQueue.userinterface_function;
}, getData:function(b, c) {
  return Entry.hw.portData[c];
}, setLightManual:function(b, c, d, e) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferLightManual(c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerStop:function(b) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferbuzzer(0, 0, 0), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerMute:function(b, c, d, e) {
  c = Math.max(c, 0);
  c = Math.min(c, 60000);
  var f = 40;
  d && (f = c);
  switch(this.checkFinish(b, f)) {
    case "Start":
      return d = 2, e && (d = 1), this.transferbuzzer(d, 238, c), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerScale:function(b, c, d, e, f, g) {
  e = Math.max(e, 0);
  e = Math.min(e, 60000);
  var h = 40;
  f && (h = e);
  switch(this.checkFinish(b, h)) {
    case "Start":
      return f = 4, g && (f = 3), this.transferbuzzer(f, 12 * c + d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerHz:function(b, c, d, e, f) {
  d = Math.max(d, 0);
  d = Math.min(d, 60000);
  var g = 40;
  e && (g = d);
  switch(this.checkFinish(b, g)) {
    case "Start":
      return e = 6, f && (e = 5), c = Math.max(c, 1), c = Math.min(c, 63999), this.transferbuzzer(e, c, d), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setVibratorStop:function(b) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferVibrator(0, 0, 0, 0), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setVibrator:function(b, c, d, e, f, g) {
  e = Math.max(e, 0);
  e = Math.min(e, 60000);
  var h = 40;
  f && (h = e);
  switch(this.checkFinish(b, h)) {
    case "Start":
      return f = 2, g && (f = 1), this.transferVibrator(f, c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, sendCommand:function(b, c, d, e) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferCommand(c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setUserInterface:function(b, c, d) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferUserInterface(c, d), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}};
Entry.byrobot_dronefighter_drive = {name:"byrobot_dronefighter_drive", setZero:function() {
  for (var b = 0; 1 > b; b++) {
    this.transferCommand(16, 36, 0), this.transferVibrator(0, 0, 0, 0), this.transferbuzzer(0, 0, 0), this.transferLightManual(16, 255, 0), this.transferLightManual(17, 255, 0);
  }
}, monitorTemplate:{imgPath:"hw/byrobot_dronefighter_drive.png", width:500, height:500, listPorts:{state_modeVehicle:{name:Lang.Blocks.byrobot_dronefighter_drone_state_mode_vehicle, type:"input", pos:{x:0, y:0}}, state_modeDrive:{name:Lang.Blocks.byrobot_dronefighter_drone_state_mode_drive, type:"input", pos:{x:0, y:0}}, state_battery:{name:Lang.Blocks.byrobot_dronefighter_drone_state_battery, type:"input", pos:{x:0, y:0}}, attitude_roll:{name:Lang.Blocks.byrobot_dronefighter_drone_attitude_roll, 
type:"input", pos:{x:0, y:0}}, attitude_pitch:{name:Lang.Blocks.byrobot_dronefighter_drone_attitude_pitch, type:"input", pos:{x:0, y:0}}, attitude_yaw:{name:Lang.Blocks.byrobot_dronefighter_drone_attitude_yaw, type:"input", pos:{x:0, y:0}}, irmessage_irdata:{name:Lang.Blocks.byrobot_dronefighter_drone_irmessage, type:"input", pos:{x:0, y:0}}, joystick_left_x:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_x, type:"input", pos:{x:0, y:0}}, joystick_left_y:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_y, 
type:"input", pos:{x:0, y:0}}, joystick_left_direction:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_direction, type:"input", pos:{x:0, y:0}}, joystick_left_event:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_event, type:"input", pos:{x:0, y:0}}, joystick_left_command:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_command, type:"input", pos:{x:0, y:0}}, joystick_right_x:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_x, type:"input", 
pos:{x:0, y:0}}, joystick_right_y:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_y, type:"input", pos:{x:0, y:0}}, joystick_right_direction:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_direction, type:"input", pos:{x:0, y:0}}, joystick_right_event:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_event, type:"input", pos:{x:0, y:0}}, joystick_right_command:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_command, type:"input", pos:{x:0, 
y:0}}, button_button:{name:Lang.Blocks.byrobot_dronefighter_controller_button_button, type:"input", pos:{x:0, y:0}}, button_event:{name:Lang.Blocks.byrobot_dronefighter_controller_button_event, type:"input", pos:{x:0, y:0}}, entryhw_countTransferReserved:{name:Lang.Blocks.byrobot_dronefighter_entryhw_count_transfer_reserved, type:"output", pos:{x:0, y:0}}}, ports:{}, mode:"both"}, checkFinish:function(b, c) {
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return "Running";
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    return "Finish";
  }
  b.isStart = !0;
  b.timeFlag = 1;
  setTimeout(function() {
    b.timeFlag = 0;
  }, 60 / (Entry.FPS || 60) * c);
  return "Start";
}, transferLightManual:function(b, c, d) {
  b = Math.max(b, 0);
  b = Math.min(b, 255);
  c = Math.max(c, 0);
  c = Math.min(c, 255);
  d = Math.max(d, 0);
  d = Math.min(d, 255);
  Entry.hw.setDigitalPortValue("target", b);
  Entry.hw.setDigitalPortValue("light_manual_flags", c);
  Entry.hw.setDigitalPortValue("light_manual_brightness", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.light_manual_flags;
  delete Entry.hw.sendQueue.light_manual_brightness;
}, transferbuzzer:function(b, c, d) {
  Entry.hw.setDigitalPortValue("target", 17);
  Entry.hw.setDigitalPortValue("buzzer_mode", b);
  Entry.hw.setDigitalPortValue("buzzer_value", c);
  Entry.hw.setDigitalPortValue("buzzer_time", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.buzzer_mode;
  delete Entry.hw.sendQueue.buzzer_value;
  delete Entry.hw.sendQueue.buzzer_time;
}, transferVibrator:function(b, c, d, e) {
  c = Math.max(c, 1);
  c = Math.min(c, 60000);
  d = Math.max(d, 1);
  d = Math.min(d, 60000);
  Entry.hw.setDigitalPortValue("target", 17);
  Entry.hw.setDigitalPortValue("vibrator_mode", b);
  Entry.hw.setDigitalPortValue("vibrator_on", c);
  Entry.hw.setDigitalPortValue("vibrator_off", d);
  Entry.hw.setDigitalPortValue("vibrator_total", e);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.vibrator_mode;
  delete Entry.hw.sendQueue.vibrator_on;
  delete Entry.hw.sendQueue.vibrator_off;
  delete Entry.hw.sendQueue.vibrator_total;
}, transferIrMessage:function(b) {
  b = Math.max(b, 0);
  b = Math.min(b, 127);
  Entry.hw.setDigitalPortValue("target", 16);
  Entry.hw.setDigitalPortValue("irmessage_data", b);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.irmessage_data;
}, transferMotorSingle:function(b, c, d) {
  d = Math.max(d, 0);
  d = Math.min(d, 4096);
  Entry.hw.setDigitalPortValue("target", 16);
  Entry.hw.setDigitalPortValue("motorsingle_target", b);
  Entry.hw.setDigitalPortValue("motorsingle_direction", c);
  Entry.hw.setDigitalPortValue("motorsingle_value", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.motorsingle_target;
  delete Entry.hw.sendQueue.motorsingle_direction;
  delete Entry.hw.sendQueue.motorsingle_value;
}, transferCommand:function(b, c, d) {
  Entry.hw.setDigitalPortValue("target", b);
  Entry.hw.setDigitalPortValue("command_command", c);
  Entry.hw.setDigitalPortValue("command_option", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.command_command;
  delete Entry.hw.sendQueue.command_option;
}, transferControlDouble:function(b, c) {
  b = Math.max(b, -100);
  b = Math.min(b, 100);
  c = Math.max(c, 0);
  c = Math.min(c, 100);
  Entry.hw.setDigitalPortValue("target", 16);
  Entry.hw.setDigitalPortValue("control_wheel", b);
  Entry.hw.setDigitalPortValue("control_accel", c);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.control_wheel;
  delete Entry.hw.sendQueue.control_accel;
}, transferControlQuad:function(b, c, d, e) {
  b = Math.max(b, -100);
  b = Math.min(b, 100);
  c = Math.max(c, -100);
  c = Math.min(c, 100);
  d = Math.max(d, -100);
  d = Math.min(d, 100);
  e = Math.max(e, -100);
  e = Math.min(e, 100);
  Entry.hw.setDigitalPortValue("target", 16);
  Entry.hw.setDigitalPortValue("control_roll", b);
  Entry.hw.setDigitalPortValue("control_pitch", c);
  Entry.hw.setDigitalPortValue("control_yaw", d);
  Entry.hw.setDigitalPortValue("control_throttle", e);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.control_roll;
  delete Entry.hw.sendQueue.control_pitch;
  delete Entry.hw.sendQueue.control_yaw;
  delete Entry.hw.sendQueue.control_throttle;
}, getData:function(b, c) {
  return Entry.hw.portData[c];
}, setLightManual:function(b, c, d, e) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferLightManual(c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerStop:function(b) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferbuzzer(0, 0, 0), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerMute:function(b, c, d, e) {
  c = Math.max(c, 0);
  c = Math.min(c, 60000);
  var f = 40;
  d && (f = c);
  switch(this.checkFinish(b, f)) {
    case "Start":
      return d = 2, e && (d = 1), this.transferbuzzer(d, 238, c), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerScale:function(b, c, d, e, f, g) {
  e = Math.max(e, 0);
  e = Math.min(e, 60000);
  var h = 40;
  f && (h = e);
  switch(this.checkFinish(b, h)) {
    case "Start":
      return f = 4, g && (f = 3), this.transferbuzzer(f, 12 * c + d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerHz:function(b, c, d, e, f) {
  d = Math.max(d, 0);
  d = Math.min(d, 60000);
  var g = 40;
  e && (g = d);
  switch(this.checkFinish(b, g)) {
    case "Start":
      return e = 6, f && (e = 5), c = Math.max(c, 1), c = Math.min(c, 63999), this.transferbuzzer(e, c, d), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setVibratorStop:function(b) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferVibrator(0, 0, 0, 0), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setVibrator:function(b, c, d, e, f, g) {
  e = Math.max(e, 0);
  e = Math.min(e, 60000);
  var h = 40;
  f && (h = e);
  switch(this.checkFinish(b, h)) {
    case "Start":
      return f = 2, g && (f = 1), this.transferVibrator(f, c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, sendIrMessage:function(b, c) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferIrMessage(c), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, sendStop:function(b) {
  return this.sendCommand(b, 16, 36, 0);
}, sendCommand:function(b, c, d, e) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferCommand(c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setMotorSingle:function(b, c, d, e) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferMotorSingle(c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setModeVehicle:function(b, c) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferCommand(16, 16, c), this.transferControlDouble(0, 0), this.transferControlQuad(0, 0, 0, 0), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, sendControlDoubleSingle:function(b, c, d, e, f) {
  var g = 40;
  f && (g = e);
  switch(this.checkFinish(b, g)) {
    case "Start":
      switch(c) {
        case "control_wheel":
          d = Math.max(d, -100);
          d = Math.min(d, 100);
          break;
        case "control_accel":
          d = Math.max(d, 0), d = Math.min(d, 100);
      }Entry.hw.setDigitalPortValue("target", 16);
      Entry.hw.setDigitalPortValue(c, d);
      Entry.hw.update();
      delete Entry.hw.sendQueue.target;
      delete Entry.hw.sendQueue[c];
      return b;
    case "Running":
      return b;
    case "Finish":
      return f && (Entry.hw.setDigitalPortValue("target", 16), Entry.hw.setDigitalPortValue(c, 0), Entry.hw.update(), delete Entry.hw.sendQueue.target, delete Entry.hw.sendQueue[c]), b.callReturn();
    default:
      return b.callReturn();
  }
}, sendControlDouble:function(b, c, d, e, f) {
  var g = 40;
  f && (g = e);
  switch(this.checkFinish(b, g)) {
    case "Start":
      return this.transferControlDouble(c, d), b;
    case "Running":
      return b;
    case "Finish":
      return f && this.transferControlDouble(0, 0), b.callReturn();
    default:
      return b.callReturn();
  }
}};
Entry.byrobot_dronefighter_flight = {name:"byrobot_dronefighter_flight", setZero:function() {
  for (var b = 0; 1 > b; b++) {
    this.transferCommand(16, 36, 0), this.transferVibrator(0, 0, 0, 0), this.transferbuzzer(0, 0, 0), this.transferLightManual(16, 255, 0), this.transferLightManual(17, 255, 0);
  }
}, monitorTemplate:{imgPath:"hw/byrobot_dronefighter_flight.png", width:500, height:500, listPorts:{state_modeVehicle:{name:Lang.Blocks.byrobot_dronefighter_drone_state_mode_vehicle, type:"input", pos:{x:0, y:0}}, state_modeFlight:{name:Lang.Blocks.byrobot_dronefighter_drone_state_mode_flight, type:"input", pos:{x:0, y:0}}, state_coordinate:{name:Lang.Blocks.byrobot_dronefighter_drone_state_mode_coordinate, type:"input", pos:{x:0, y:0}}, state_battery:{name:Lang.Blocks.byrobot_dronefighter_drone_state_battery, 
type:"input", pos:{x:0, y:0}}, attitude_roll:{name:Lang.Blocks.byrobot_dronefighter_drone_attitude_roll, type:"input", pos:{x:0, y:0}}, attitude_pitch:{name:Lang.Blocks.byrobot_dronefighter_drone_attitude_pitch, type:"input", pos:{x:0, y:0}}, attitude_yaw:{name:Lang.Blocks.byrobot_dronefighter_drone_attitude_yaw, type:"input", pos:{x:0, y:0}}, irmessage_irdata:{name:Lang.Blocks.byrobot_dronefighter_drone_irmessage, type:"input", pos:{x:0, y:0}}, joystick_left_x:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_x, 
type:"input", pos:{x:0, y:0}}, joystick_left_y:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_y, type:"input", pos:{x:0, y:0}}, joystick_left_direction:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_direction, type:"input", pos:{x:0, y:0}}, joystick_left_event:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_event, type:"input", pos:{x:0, y:0}}, joystick_left_command:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_left_command, type:"input", 
pos:{x:0, y:0}}, joystick_right_x:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_x, type:"input", pos:{x:0, y:0}}, joystick_right_y:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_y, type:"input", pos:{x:0, y:0}}, joystick_right_direction:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_direction, type:"input", pos:{x:0, y:0}}, joystick_right_event:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_event, type:"input", pos:{x:0, y:0}}, 
joystick_right_command:{name:Lang.Blocks.byrobot_dronefighter_controller_joystick_right_command, type:"input", pos:{x:0, y:0}}, button_button:{name:Lang.Blocks.byrobot_dronefighter_controller_button_button, type:"input", pos:{x:0, y:0}}, button_event:{name:Lang.Blocks.byrobot_dronefighter_controller_button_event, type:"input", pos:{x:0, y:0}}, entryhw_countTransferReserved:{name:Lang.Blocks.byrobot_dronefighter_entryhw_count_transfer_reserved, type:"output", pos:{x:0, y:0}}}, ports:{}, mode:"both"}, 
checkFinish:function(b, c) {
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return "Running";
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    return "Finish";
  }
  b.isStart = !0;
  b.timeFlag = 1;
  setTimeout(function() {
    b.timeFlag = 0;
  }, 60 / (Entry.FPS || 60) * c);
  return "Start";
}, transferLightManual:function(b, c, d) {
  b = Math.max(b, 0);
  b = Math.min(b, 255);
  c = Math.max(c, 0);
  c = Math.min(c, 255);
  d = Math.max(d, 0);
  d = Math.min(d, 255);
  Entry.hw.setDigitalPortValue("target", b);
  Entry.hw.setDigitalPortValue("light_manual_flags", c);
  Entry.hw.setDigitalPortValue("light_manual_brightness", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.light_manual_flags;
  delete Entry.hw.sendQueue.light_manual_brightness;
}, transferbuzzer:function(b, c, d) {
  Entry.hw.setDigitalPortValue("target", 17);
  Entry.hw.setDigitalPortValue("buzzer_mode", b);
  Entry.hw.setDigitalPortValue("buzzer_value", c);
  Entry.hw.setDigitalPortValue("buzzer_time", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.buzzer_mode;
  delete Entry.hw.sendQueue.buzzer_value;
  delete Entry.hw.sendQueue.buzzer_time;
}, transferVibrator:function(b, c, d, e) {
  c = Math.max(c, 1);
  c = Math.min(c, 60000);
  d = Math.max(d, 1);
  d = Math.min(d, 60000);
  Entry.hw.setDigitalPortValue("target", 17);
  Entry.hw.setDigitalPortValue("vibrator_mode", b);
  Entry.hw.setDigitalPortValue("vibrator_on", c);
  Entry.hw.setDigitalPortValue("vibrator_off", d);
  Entry.hw.setDigitalPortValue("vibrator_total", e);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.vibrator_mode;
  delete Entry.hw.sendQueue.vibrator_on;
  delete Entry.hw.sendQueue.vibrator_off;
  delete Entry.hw.sendQueue.vibrator_total;
}, transferIrMessage:function(b) {
  b = Math.max(b, 0);
  b = Math.min(b, 127);
  Entry.hw.setDigitalPortValue("target", 16);
  Entry.hw.setDigitalPortValue("irmessage_data", b);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.irmessage_data;
}, transferMotorSingle:function(b, c, d) {
  d = Math.max(d, 0);
  d = Math.min(d, 4096);
  Entry.hw.setDigitalPortValue("target", 16);
  Entry.hw.setDigitalPortValue("motorsingle_target", b);
  Entry.hw.setDigitalPortValue("motorsingle_direction", c);
  Entry.hw.setDigitalPortValue("motorsingle_value", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.motorsingle_target;
  delete Entry.hw.sendQueue.motorsingle_direction;
  delete Entry.hw.sendQueue.motorsingle_value;
}, transferCommand:function(b, c, d) {
  Entry.hw.setDigitalPortValue("target", b);
  Entry.hw.setDigitalPortValue("command_command", c);
  Entry.hw.setDigitalPortValue("command_option", d);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.command_command;
  delete Entry.hw.sendQueue.command_option;
}, transferControlDouble:function(b, c) {
  b = Math.max(b, -100);
  b = Math.min(b, 100);
  c = Math.max(c, 0);
  c = Math.min(c, 100);
  Entry.hw.setDigitalPortValue("target", 16);
  Entry.hw.setDigitalPortValue("control_wheel", b);
  Entry.hw.setDigitalPortValue("control_accel", c);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.control_wheel;
  delete Entry.hw.sendQueue.control_accel;
}, transferControlQuad:function(b, c, d, e) {
  b = Math.max(b, -100);
  b = Math.min(b, 100);
  c = Math.max(c, -100);
  c = Math.min(c, 100);
  d = Math.max(d, -100);
  d = Math.min(d, 100);
  e = Math.max(e, -100);
  e = Math.min(e, 100);
  Entry.hw.setDigitalPortValue("target", 16);
  Entry.hw.setDigitalPortValue("control_roll", b);
  Entry.hw.setDigitalPortValue("control_pitch", c);
  Entry.hw.setDigitalPortValue("control_yaw", d);
  Entry.hw.setDigitalPortValue("control_throttle", e);
  Entry.hw.update();
  delete Entry.hw.sendQueue.target;
  delete Entry.hw.sendQueue.control_roll;
  delete Entry.hw.sendQueue.control_pitch;
  delete Entry.hw.sendQueue.control_yaw;
  delete Entry.hw.sendQueue.control_throttle;
}, getData:function(b, c) {
  return Entry.hw.portData[c];
}, setLightManual:function(b, c, d, e) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferLightManual(c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerStop:function(b) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferbuzzer(0, 0, 0), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerMute:function(b, c, d, e) {
  c = Math.max(c, 0);
  c = Math.min(c, 60000);
  var f = 40;
  d && (f = c);
  switch(this.checkFinish(b, f)) {
    case "Start":
      return d = 2, e && (d = 1), this.transferbuzzer(d, 238, c), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerScale:function(b, c, d, e, f, g) {
  e = Math.max(e, 0);
  e = Math.min(e, 60000);
  var h = 40;
  f && (h = e);
  switch(this.checkFinish(b, h)) {
    case "Start":
      return f = 4, g && (f = 3), this.transferbuzzer(f, 12 * c + d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setBuzzerHz:function(b, c, d, e, f) {
  d = Math.max(d, 0);
  d = Math.min(d, 60000);
  var g = 40;
  e && (g = d);
  switch(this.checkFinish(b, g)) {
    case "Start":
      return e = 6, f && (e = 5), c = Math.max(c, 1), c = Math.min(c, 63999), this.transferbuzzer(e, c, d), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setVibratorStop:function(b) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferVibrator(0, 0, 0, 0), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setVibrator:function(b, c, d, e, f, g) {
  e = Math.max(e, 0);
  e = Math.min(e, 60000);
  var h = 40;
  f && (h = e);
  switch(this.checkFinish(b, h)) {
    case "Start":
      return f = 2, g && (f = 1), this.transferVibrator(f, c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, sendIrMessage:function(b, c) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferIrMessage(c), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, sendStop:function(b) {
  return this.sendCommand(b, 16, 36, 0);
}, sendCommand:function(b, c, d, e) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferCommand(c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setMotorSingle:function(b, c, d, e) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferMotorSingle(c, d, e), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setModeVehicle:function(b, c) {
  switch(this.checkFinish(b, 40)) {
    case "Start":
      return this.transferCommand(16, 16, c), this.transferControlQuad(0, 0, 0, 0), this.transferControlDouble(0, 0), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, setEventFlight:function(b, c, d) {
  switch(this.checkFinish(b, d)) {
    case "Start":
      return this.transferCommand(16, 34, c), this.transferControlQuad(0, 0, 0, 0), b;
    case "Running":
      return b;
    case "Finish":
      return b.callReturn();
    default:
      return b.callReturn();
  }
}, sendControlQuadSingle:function(b, c, d, e, f) {
  var g = 40;
  f && (g = e);
  switch(this.checkFinish(b, g)) {
    case "Start":
      return d = Math.max(d, -100), d = Math.min(d, 100), Entry.hw.setDigitalPortValue("target", 16), Entry.hw.setDigitalPortValue(c, d), Entry.hw.update(), delete Entry.hw.sendQueue.target, delete Entry.hw.sendQueue[c], b;
    case "Running":
      return b;
    case "Finish":
      return f && (Entry.hw.setDigitalPortValue("target", 16), Entry.hw.setDigitalPortValue(c, 0), Entry.hw.update(), delete Entry.hw.sendQueue.target, delete Entry.hw.sendQueue[c]), b.callReturn();
    default:
      return b.callReturn();
  }
}, sendControlQuad:function(b, c, d, e, f, g, h) {
  var k = 40;
  h && (k = g);
  switch(this.checkFinish(b, k)) {
    case "Start":
      return this.transferControlQuad(c, d, e, f), b;
    case "Running":
      return b;
    case "Finish":
      return h && this.transferControlQuad(0, 0, 0, 0), b.callReturn();
    default:
      return b.callReturn();
  }
}};
Entry.Chocopi = {name:"chocopi", p:{}, ev:{}, blocks:[], setZero:function() {
}, getport:function(b, c) {
  if (!this.blocks) {
    return -1;
  }
  if (this.blocks[c].id == b) {
    return c;
  }
  for (var d in this.blocks) {
    if (this.blocks[d].id == b) {
      return d;
    }
  }
  return -1;
}, connected:!1, portlist:[[Lang.Blocks.chocopi_port + "1", 0], [Lang.Blocks.chocopi_port + "2", 1], [Lang.Blocks.chocopi_port + "3", 2], [Lang.Blocks.chocopi_port + "4", 3], [Lang.Blocks.chocopi_port + "5", 4], [Lang.Blocks.chocopi_port + "6", 5], [Lang.Blocks.chocopi_port + "7", 6], [Lang.Blocks.chocopi_port + "8", 7], ["BLE1", 8], ["BLE2", 9], ["BLE3", 10], ["BLE4", 11], ["BLE5", 12], ["BLE6", 13], ["BLE7", 14], ["BLE8", 15]], dataHandler:function(b) {
  this.connected || (this.connected = !0, Entry.hw.sendQueue.init = !0, Entry.hw.update(), delete Entry.hw.sendQueue.init, Entry.hw.sendQueue.data = {});
  if (b.d) {
    for (var c in b.d) {
      this.p[c] = b.d[c];
    }
  }
  if (b.ev) {
    for (c in b.ev) {
      this.ev[c] = b.ev[c], Entry.engine.fireEvent(this.blocks[c].name + "14");
    }
  }
  b.bl && (this.blocks = b.bl);
}};
Entry.Cobl = {name:"cobl", setZero:function() {
  for (var b = 0; 14 > b; b++) {
    Entry.hw.sendQueue[b] = 0;
  }
  Entry.hw.update();
}};
Blockly.Blocks.cobl_read_ultrason = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ucd08\uc74c\ud30c \uac70\ub9ac\uc7ac\uae30(0~400)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_ultrason = function(b, c) {
  return Entry.hw.getAnalogPortValue("ultrason");
};
Blockly.Blocks.cobl_read_potenmeter = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uac00\ubcc0\uc800\ud56d \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_potenmeter = function(b, c) {
  console.log("cobl_read_potenmeter");
  return Entry.hw.getAnalogPortValue("potenmeter");
};
Blockly.Blocks.cobl_read_irread1 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("IR1 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_irread1 = function(b, c) {
  return Entry.hw.getAnalogPortValue("potenmeter");
};
Blockly.Blocks.cobl_read_irread2 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("IR2 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_irread2 = function(b, c) {
  c.getValue("irread2", c);
  return Entry.hw.getAnalogPortValue("irread2");
};
Blockly.Blocks.cobl_read_joyx = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc870\uc774\uc2a4\ud2f1X\ucd95 \uc77d\uae30(1,0,-1)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_joyx = function(b, c) {
  return Entry.hw.getAnalogPortValue("joyx");
};
Blockly.Blocks.cobl_read_joyy = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc870\uc774\uc2a4\ud2f1Y\ucd95 \uc77d\uae30(1,0,-1)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_joyy = function(b, c) {
  return Entry.hw.getAnalogPortValue("joyy");
};
Blockly.Blocks.cobl_read_sens1 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc13c\uc11c1 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_sens1 = function(b, c) {
  return Entry.hw.getAnalogPortValue("sens1");
};
Blockly.Blocks.cobl_read_sens2 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc13c\uc11c2 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_sens2 = function(b, c) {
  return Entry.hw.getAnalogPortValue("sens2");
};
Blockly.Blocks.cobl_read_tilt = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uae30\uc6b8\uae30\uc13c\uc11c \uc77d\uae30(0~4)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_tilt = function(b, c) {
  return Entry.hw.getAnalogPortValue("tilt");
};
Blockly.Blocks.cobl_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.cobl_get_port_number = function(b, c) {
  return c.getStringField("PORT");
};
Blockly.Blocks.cobl_read_temps = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc628\ub3c4\uc13c\uc11c \uc77d\uae30@\ud3ec\ud2b8");
  this.appendValueInput("VALUE").setCheck("Number");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_temps = function(b, c) {
  b = c.getValue("VALUE", c);
  if (1 == b) {
    return Entry.hw.getAnalogPortValue("temps1");
  }
  if (2 == b) {
    return Entry.hw.getAnalogPortValue("temps2");
  }
};
Blockly.Blocks.cobl_read_light = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc1d\uae30\uc13c\uc11c \uc77d\uae30@\ud3ec\ud2b8");
  this.appendValueInput("VALUE").setCheck("Number");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_light = function(b, c) {
  b = c.getValue("VALUE", c);
  if (1 == b) {
    return Entry.hw.getAnalogPortValue("light1");
  }
  if (2 == b) {
    return Entry.hw.getAnalogPortValue("light2");
  }
};
Blockly.Blocks.cobl_read_btn = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\ud2bc\uc13c\uc11c \uc77d\uae30@\ud3ec\ud2b8");
  this.appendValueInput("VALUE").setCheck("Number");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.cobl_read_btn = function(b, c) {
  b = c.getValue("VALUE", c);
  if (1 == b) {
    return Entry.hw.getDigitalPortValue("btn1");
  }
  if (2 == b) {
    return Entry.hw.getDigitalPortValue("btn2");
  }
};
Blockly.Blocks.cobl_led_control = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Rainbow LED");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OFF", "OFF"], ["Red", "Red"], ["Orange", "Orange"], ["Yellow", "Yellow"], ["Green", "Green"], ["Blue", "Blue"], ["Dark Blue", "Dark Blue"], ["Purple", "Purple"], ["White", "White"]]), "OPERATOR");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_led_control = function(b, c) {
  b = c.getStringField("PORT");
  var d = c.getStringField("OPERATOR");
  Entry.hw.setDigitalPortValue("RainBowLED_IDX", b);
  Entry.hw.setDigitalPortValue("RainBowLED_COL", d);
  return c.callReturn();
};
Blockly.Blocks.cobl_text = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput("cobl"), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.cobl_text = function(b, c) {
  return c.getStringField("NAME");
};
Blockly.Blocks.cobl_servo_angle_control = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Servo");
  this.appendValueInput("PORT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("Angle-");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("(15~165)");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_servo_angle_control = function(b, c) {
  console.log("servo - test");
  b = c.getNumberValue("PORT");
  var d = c.getNumberValue("VALUE"), d = Math.round(d), d = Math.max(d, 15), d = Math.min(d, 165);
  1 == b && (console.log("servo 1  degree " + d), Entry.hw.setDigitalPortValue("Servo1", d));
  2 == b && (console.log("servo 2 degree " + d), Entry.hw.setDigitalPortValue("Servo2", d));
  return c.callReturn();
};
Blockly.Blocks.cobl_melody = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Melody");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["(Low)So", "L_So"], ["(Low)So#", "L_So#"], ["(Low)La", "L_La"], ["(Low)La#", "L_La#"], ["(Low)Ti", "L_Ti"], ["Do", "Do"], ["Do#", "Do#"], ["Re", "Re"], ["Re#", "Re#"], ["Mi", "Mi"], ["Fa", "Fa"], ["Fa#", "Fa#"], ["So", "So"], ["So#", "So#"], ["La", "La"], ["La#", "La#"], ["Ti", "Ti"], ["(High)Do", "H_Do"], ["(High)Do#", "H_Do#"], ["(High)Re", "H_Re"], ["(High)R2#", "H_Re#"], ["(High)Mi", "H_Mi"], ["(High)Fa", "H_Fa"]]), "MELODY");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_melody = function(b, c) {
  b = c.getStringField("MELODY");
  console.log("cobl_melody" + b);
  Entry.hw.setDigitalPortValue("Melody", b);
  return c.callReturn();
};
Blockly.Blocks.cobl_dcmotor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DcMotor");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "MOTOR");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1.Clockwise", "1"], ["2.Counter Clockwise", "2"], ["3.Stop", "3"]]), "DIRECTION");
  this.appendDummyInput().appendField(" Speed");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]), "SPEED");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_dcmotor = function(b, c) {
  b = c.getStringField("MOTOR");
  var d = c.getStringField("DIRECTION"), e = c.getStringField("SPEED");
  console.log("MOTOR" + b + "  Direction" + d + "  speed" + e);
  1 == b && (Entry.hw.setDigitalPortValue("DC1_DIR", d), Entry.hw.setDigitalPortValue("DC1_SPEED", e));
  2 == b && (Entry.hw.setDigitalPortValue("DC2_DIR", d), Entry.hw.setDigitalPortValue("DC2_SPEED", e));
  return c.callReturn();
};
Blockly.Blocks.cobl_extention_port = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Extention Port");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "PORT");
  this.appendDummyInput().appendField(" Level");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]), "LEVEL");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_extention_port = function(b, c) {
  b = c.getStringField("PORT");
  var d = c.getStringField("LEVEL");
  1 == b && Entry.hw.setDigitalPortValue("EXUSB1", d);
  2 == b && Entry.hw.setDigitalPortValue("EXUSB2", d);
  return c.callReturn();
};
Blockly.Blocks.cobl_external_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("External LED ");
  this.appendValueInput("LED").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(" (1~64)");
  this.appendDummyInput().appendField(" R ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "RED");
  this.appendDummyInput().appendField(" G ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "GREEN");
  this.appendDummyInput().appendField(" B ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "BLUE");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_external_led = function(b, c) {
  b = c.getNumberValue("LED");
  var d = c.getStringField("RED"), e = c.getStringField("GREEN"), f = c.getStringField("BLUE");
  Entry.hw.setDigitalPortValue("ELED_IDX", b);
  Entry.hw.setDigitalPortValue("ELED_R", d);
  Entry.hw.setDigitalPortValue("ELED_G", e);
  Entry.hw.setDigitalPortValue("ELED_B", f);
  return c.callReturn();
};
Blockly.Blocks.cobl_7_segment = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("7 Segment");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("(0~9999)");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_7_segment = function(b, c) {
  b = c.getNumberValue("VALUE");
  Entry.hw.setDigitalPortValue("7SEG", b);
  return c.callReturn();
};
Entry.coconut = {PORT_MAP:{leftFloorValue:0, rightFloorValue:0, BothFloorDetection:0, leftProximityValue:0, rightProximityValue:0, BothProximityDetection:0, obstacleDetection:0, light:0, temp:0, extA2:0, extA3:0}, setZero:function() {
  Entry.hw.sendQueue.msgValue = [255, 85, 2, 0, 4];
  Entry.hw.update();
}, lineTracerModeId:0, lineTracerStateId:-1, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var c = this.timeouts;
  b = c.indexOf(b);
  0 <= b && c.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, c;
  for (c in b) {
    clearTimeout(b[c]);
  }
  this.timeouts = [];
}, setLineTracerMode:function(b, c) {
  this.lineTracerModeId = this.lineTracerModeId + 1 & 255;
  b.lineTracerMode = c;
  b.lineTracerModeId = this.lineTracerModeId;
}, msgValue:0, insertQueue:function(b, c) {
  c.msgValue = b;
}, clearQueue:function(b) {
  b.msgValue = "";
}, move:function(b) {
  "string" == typeof b && (b = directions[b]);
  return runPackage(devices.Motor, 0, b, speed);
}, speed:60, directions:{Both:0, Left:1, Right:2, Forward:3, Backward:4}, devices:{LightSensor:14, Accelerometer:18, Temperature:21, Buzzer:3, IRdistance:5, Linetracer:7, IR:9, RGBled:25, Motor:26, LedMatrix:27, Digital:30, Analog:31, PWM:32, External:40, Speaker:41, ExtIR:42, ServoMotor:43, ExLed:44, ExtCds:45}, sharps:{"-":0, "#":1, b:2}, beats:{Half:500, Quater:250, Eighth:125, Sixteenth:63, "Thirty-second":32, Whole:1000, "Dotted half":750, "Dotted quarter":375, "Dotted eighth":188, "Dotted sixteenth":95, 
"Dotted thirty-second":48, Double:2000, Zero:0}, melodys:{"Twinkle Twinkle little star":1, "Three bears":2, "Mozart's Lullaby":3, "Do-Re-Mi":4, Butterfly:5}, colors:{Black:0, White:1, Red:2, Green:3, Blue:4, Yellow:5, Cyan:6, Magenta:7}, detectConds:{Yes:1, No:0}, sLetters:{a:0, b:1, c:2, d:3, e:4, f:5, g:6, h:7, i:8, j:9, k:10, l:11, m:12, n:13, o:14, p:15, q:16, r:17, s:18, t:19, u:20, v:21, w:22, x:23, y:24, z:25}, cLetters:{A:0, B:1, C:2, D:3, E:4, F:5, G:6, H:7, I:8, J:9, K:10, L:11, M:12, N:13, 
O:14, P:15, Q:16, R:17, S:18, T:19, U:20, V:21, W:22, X:23, Y:24, Z:25}, kLetters:{ga:0, na:1, da:2, la:3, ma:4, ba:5, sa:6, aa:7, ja:8, cha:9, ka:10, ta:11, pa:12, ha:13}, onOffs:{On:1, Off:0}, axiss:{"X-Axis":1, "Y-Axis":2, "Z-Axis":3}, pins:{D4:4, D10:10, D11:11, D12:12, A2:16, A3:17}, outputValues:{HIGH:1, LOW:0}, moveMotor:function(b) {
  "string" == typeof b && (b = this.directions[b]);
  return this.runPackage(this.devices.Motor, 0, b, this.speed);
}, moveMotorSpeed:function(b, c) {
  "string" == typeof b && (b = this.directions[b]);
  return this.runPackage(this.devices.Motor, 0, b, this.speed);
}, turnMotor:function(b) {
  "string" == typeof b && (b = this.directions[b]);
  return this.runPackage(this.devices.Motor, 0, b, this.speed);
}, stopMotor:function() {
  return this.runPackage(this.devices.Motor, 1);
}, moveTurnAngle:function(b, c) {
}, moveGoTime:function(b, c) {
  0 > c && (c = -c);
  "string" == typeof b && (b = this.directions[b]);
  return this.runPackage(this.devices.Motor, 3, b, this.speed, this.short2array(1000 * c));
}, turnMotorTime:function(b, c) {
  0 > c && (c = -c);
  "string" == typeof b && (b = this.directions[b]);
  return this.runPackage(this.devices.Motor, 3, b, this.speed, this.short2array(1000 * c));
}, moveMotorColor:function(b, c) {
  var d = this.devices.Motor;
  "string" == typeof b && (b = this.directions[b]);
  "string" == typeof c && (c = this.colors[c]);
  return this.runPackage(d, 5, b, this.speed, c);
}, moveMotorAngleColor:function(b, c, d) {
  var e = this.devices.Motor;
  "string" == typeof b && (b = this.directions[b]);
  "string" == typeof d && (d = this.colors[d]);
  "number" != typeof c && (c = 90);
  return this.runPackage(e, 6, b, this.short2array(0), this.short2array(c), this.short2array(0), d);
}, moveExtMotor:function(b, c) {
  "string" == typeof b && (b = this.directions[b]);
  return this.runPackage(this.devices.Motor, 7, b, c);
}, rgbOn:function(b, c) {
  "string" == typeof b && (b = this.directions[b]);
  "string" == typeof c && (c = this.colors[c]);
  return this.runPackage(this.devices.RGBled, 0, b, c);
}, rgbOff:function(b) {
  "string" == typeof b && (b = this.directions[b]);
  return this.runPackage(this.devices.RGBled, 1, b, 0);
}, rgbOffColor:function(b, c) {
  "string" == typeof b && (b = this.directions[b]);
  "string" == typeof c && (c = this.colors[c]);
  return this.runPackage(this.devices.RGBled, 1, b, c);
}, ledOnTime:function(b, c, d) {
  "string" == typeof b && (b = this.directions[b]);
  "string" == typeof c && (c = this.colors[c]);
  return this.runPackage(this.devices.RGBled, 3, b, c, this.short2array("number" != typeof d ? 0 : 0 > d ? 0 : 1000 * d));
}, beep:function() {
  return this.buzzerControl(0, 262, 50);
}, playBuzzerTime:function(b) {
  "number" != typeof b && (b = 0.5);
  0 > b && (b = 0.5);
  return this.buzzerControl(0, 262, 1000 * b);
}, playBuzzerFreq:function(b, c) {
  "number" != typeof c && (c = 0.5);
  0 > c && (c = 0.5);
  "number" != typeof b && (b = 300);
  0 > b && (b = 300);
  return this.buzzerControl(0, b, 1000 * c);
}, buzzerOff:function() {
  return this.buzzerControl(0, 0, 0);
}, playBuzzerNote:function(b, c, d) {
  b = this.getNote(b);
  "string" == typeof d && (d = this.beats[d]);
  return this.runPackage(devices.Buzzer, 2, b.charCodeAt(0), c, this.short2array(d));
}, playNote:function(b, c, d, e) {
  b = this.getNote(b);
  "string" == typeof e && (e = this.beats[e]);
  return this.runPackage(this.devices.Buzzer, 4, b.charCodeAt(0), c, d.charCodeAt(0), this.short2array(e));
}, getNote:function(b) {
  return b.split("_")[1];
}, restBeat:function(b) {
  "string" == typeof b && (b = b.split("_", 1), b = this.beats[b]);
  return this.buzzerControl(1, 0, b);
}, playBuzzerColor:function(b, c, d, e) {
  b = this.getNote(b);
  "string" == typeof d && (d = this.beats[d]);
  "string" == typeof e && (e = this.colors[e]);
  return this.runPackage(this.devices.Buzzer, 3, b.charCodeAt(0), c, this.short2array(d), e);
}, playNoteColor:function(b, c, d, e, f, g) {
  b = this.getNote(b);
  "string" == typeof e && (e = this.beats[e]);
  "string" == typeof f && (f = this.directions[f]);
  "string" == typeof g && (g = this.colors[g]);
  return this.runPackage(this.devices.Buzzer, 5, b.charCodeAt(0), c, d.charCodeAt(0), this.short2array(e), f, g);
}, playMelody:function(b) {
  "string" == typeof b && (b = this.melodys[b]);
  return this.runPackage(this.devices.Buzzer, 6, b);
}, buzzerControl:function(b, c, d) {
  var e = this.devices.Buzzer;
  "string" == typeof d && (d = this.beats[d]);
  return this.runPackage(e, b, this.short2array(c), this.short2array(d));
}, runBlink:function() {
  return this.runPackage(30, 13);
}, followLine:function() {
  return this.runPackage(this.devices.Linetracer, 3, this.speed);
}, followLineLevel:function(b, c) {
  "number" != typeof c && (c = 70);
  return this.runPackage(this.devices.Linetracer, 3, b, c);
}, setStandard:function(b, c) {
  "string" == typeof b && (b = this.directions[b]);
  return this.runPackage(this.devices.IRdistance, 0, b, c);
}, avoidMode:function() {
  return this.runPackage(this.devices.IRdistance, 3);
}, ledMatrixOn:function(b, c, d) {
  "string" == typeof b && (b = this.onOffs[b]);
  "string" == typeof c && "Both" == c && (c = 0);
  "string" == typeof d && "Both" == d && (d = 0);
  return this.runPackage(this.devices.LedMatrix, 0, c, d, b);
}, ledMatrixOff:function(b, c) {
  return this.runPackage(this.devices.LedMatrix, 0, b, c, 0);
}, ledMatrixClear:function() {
  return this.runPackage(this.devices.LedMatrix, 5);
}, ledMatrixOnAll:function() {
  return this.runPackage(this.devices.LedMatrix, 6);
}, showLedMatrix:function(b) {
  return this.runPackage(this.devices.LedMatrix, 1, b);
}, showLedMatrixSmall:function(b) {
  "string" == typeof b && (b = this.sLetters[b]);
  return this.runPackage(this.devices.LedMatrix, 2, b);
}, showLedMatrixLarge:function(b) {
  "string" == typeof b && (b = this.cLetters[b]);
  return this.runPackage(this.devices.LedMatrix, 3, b);
}, showLedMatrixKorean:function(b) {
  "string" == typeof b && (b = this.kLetters[b]);
  return this.runPackage(this.devices.LedMatrix, 4, b);
}, sendMessage:function(b) {
  return this.runPackage(this.devices.IR, this.string2array(b));
}, extLedOn:function(b, c) {
  "string" == typeof b && (b = this.pins[b]);
  return this.runPackage(this.devices.ExLed, b, this.short2array(1000 * c));
}, playSpeaker:function(b, c, d) {
  "string" == typeof b && (b = this.pins[b]);
  d *= 1000;
  return this.runPackage(this.devices.Speaker, b, this.short2array(c), this.short2array(d));
}, stopSpeaker:function(b) {
  "string" == typeof b && (b = this.pins[b]);
  return this.runPackage(this.devices.Speaker, b, this.short2array(0), this.short2array(0));
}, runExtServo:function(b, c) {
  "string" == typeof b && (b = this.pins[b]);
  return this.runPackage(this.devices.ServoMotor, b, c);
}, digitalWrite:function(b, c) {
  "string" == typeof c && (c = this.outputValues[c]);
  return this.runPackage(this.devices.Digital, b, c);
}, analogWrite:function(b, c) {
  "number" != typeof c ? c = 0 : 255 < c && (c = 255);
  return this.runPackage(this.devices.Analog, b, c);
}, readFloat:function(b, c) {
  return parseFloat([b[c], b[c + 1], b[c + 2], b[c + 3]]);
}, readShort:function(b, c) {
  return parseShort([b[postion], b[postion + 1]]);
}, readDouble:function(b, c) {
  return readFloat(b, c);
}, readString:function(b, c, d) {
  b = "";
  for (var e = 0; e < d; e++) {
    b += String.fromCharCode(_rxBuf[e + c]);
  }
  return b;
}, short2array:function(b) {
  for (var c = {}, d = 0; 2 > d; d++) {
    var e = b & 255;
    c[d] = e;
    b = (b - e) / 256;
  }
  return [c[0], c[1]];
}, runPackage:function() {
  for (var b = [255, 85, 0, 0, 2], c = 0; c < arguments.length; c++) {
    "[class Array]" == arguments[c].constructor ? b = b.concat(arguments[c]) : 2 == arguments[c].length ? b = b.concat(arguments[c]) : b.push(arguments[c]);
  }
  b[2] = b.length - 3;
  return b;
}, name:"coconut", monitorTemplate:{imgPath:"hw/coconut.png", width:256, height:256, listPorts:{temperature:{name:Lang.Blocks.coconut_sensor_temperature, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.coconut_sensor_acceleration_x, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.coconut_sensor_acceleration_y, type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.coconut_sensor_acceleration_z, type:"input", pos:{x:0, y:0}}}, ports:{leftProximityValue:{name:Lang.Blocks.coconut_sensor_left_proximity, 
type:"input", pos:{x:122, y:156}}, rightProximityValue:{name:Lang.Blocks.coconut_sensor_right_proximity, type:"input", pos:{x:10, y:108}}, leftFloorValue:{name:Lang.Blocks.coconut_sensor_left_floor, type:"input", pos:{x:100, y:234}}, rightFloorValue:{name:Lang.Blocks.coconut_sensor_right_floor, type:"input", pos:{x:13, y:180}}, light:{name:Lang.Blocks.coconut_sensor_light, type:"input", pos:{x:56, y:189}}}, mode:"both"}};
Entry.Codestar = {name:"codestar", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var b = 0; 20 > b; b++) {
    Entry.hw.sendQueue[b] = 0, Entry.hw.sendQueue.readablePorts.push(b);
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/codestar.png", width:333, height:409, listPorts:{13:{name:"\uc9c4\ub3d9\ubaa8\ud130", type:"output", pos:{x:0, y:0}}, 6:{name:"\uc9c4\ub3d9\uc13c\uc11c", type:"input", pos:{x:0, y:0}}}, ports:{7:{name:"\ube68\uac04\uc0c9", type:"output", pos:{x:238, y:108}}, 8:{name:"\ud30c\ub780\uc0c9", type:"output", pos:{x:265, y:126}}, 9:{name:"3\uc0c9 \ube68\uac04\uc0c9", type:"output", pos:{x:292, y:34}}, 10:{name:"3\uc0c9 \ub179\uc0c9", type:"output", pos:{x:292, y:34}}, 11:{name:"3\uc0c9 \ud30c\ub780\uc0c9", 
type:"output", pos:{x:292, y:34}}, 12:{name:"\ubc84\ud2bc", type:"input", pos:{x:248, y:142}}, a0:{name:"\uc67c\ucabd \ubcbd\uac10\uc9c0", type:"input", pos:{x:24, y:231}}, a2:{name:"\ub9c8\uc774\ud06c", type:"input", pos:{x:225, y:67}}, a3:{name:"\ubd80\uc800", type:"output", pos:{x:283, y:105}}, a4:{name:"\uc67c\ucabd \ub77c\uc778\uac10\uc9c0", type:"input", pos:{x:37, y:353}}, a5:{name:"\uc624\ub978\ucabd \ub77c\uc778\uac10\uc9c0", type:"input", pos:{x:50, y:368}}, a6:{name:"\uc870\ub3c4\uc13c\uc11c", 
type:"input", pos:{x:273, y:22}}, a7:{name:"\uc624\ub978\ucabd \ubcbd\uac10\uc9c0", type:"input", pos:{x:103, y:381}}, temperature:{name:"\uc628\ub3c4\uc13c\uc11c", type:"input", pos:{x:311, y:238}}, sonar:{name:"\ucd08\uc74c\ud30c", type:"input", pos:{x:7, y:277}}, leftwheel:{name:"\uc67c\ucabd \ubc14\ud034", type:"output", pos:{x:177, y:370}}, rightwheel:{name:"\uc624\ub978\ucabd \ubc14\ud034", type:"output", pos:{x:83, y:218}}}, mode:"both"}};
Entry.DaduBlock = {name:"dadublock", setZero:function() {
  Entry.hw.sendQueue.SET ? Object.keys(Entry.hw.sendQueue.SET).forEach(function(b) {
    Entry.hw.sendQueue.SET[b].data = 0;
    Entry.hw.sendQueue.SET[b].time = (new Date).getTime();
  }) : Entry.hw.sendQueue = {GET:{}, SET:{}};
  Entry.hw.update();
}, sensorTypes:{ALIVE:0, DIGITAL:1, ANALOG:2, PWM:3, SERVO_PIN:4, TONE:5, PULSEIN:6, ULTRASONIC:7, TIMER:8}, toneMap:{1:[33, 65, 131, 262, 523, 1046, 2093, 4186], 2:[35, 69, 139, 277, 554, 1109, 2217, 4435], 3:[37, 73, 147, 294, 587, 1175, 2349, 4699], 4:[39, 78, 156, 311, 622, 1245, 2849, 4978], 5:[41, 82, 165, 330, 659, 1319, 2637, 5274], 6:[44, 87, 175, 349, 698, 1397, 2794, 5588], 7:[46, 92, 185, 370, 740, 1480, 2960, 5920], 8:[49, 98, 196, 392, 784, 1568, 3136, 6272], 9:[52, 104, 208, 415, 831, 
1661, 3322, 6645], 10:[55, 110, 220, 440, 880, 1760, 3520, 7040], 11:[58, 117, 233, 466, 932, 1865, 3729, 7459], 12:[62, 123, 247, 494, 988, 1976, 3951, 7902]}, BlockState:{}};
Entry.DaduBlock_Car = {name:"dadublock_car", setZero:function() {
  Entry.hw.sendQueue.SET ? Object.keys(Entry.hw.sendQueue.SET).forEach(function(b) {
    Entry.hw.sendQueue.SET[b].data = 0;
    Entry.hw.sendQueue.SET[b].time = (new Date).getTime();
  }) : Entry.hw.sendQueue = {GET:{}, SET:{}};
  Entry.hw.update();
}, sensorTypes:{ALIVE:0, DIGITAL:1, ANALOG:2, PWM:3, SERVO_PIN:4, TONE:5, PULSEIN:6, ULTRASONIC:7, TIMER:8}, toneMap:{1:[33, 65, 131, 262, 523, 1046, 2093, 4186], 2:[35, 69, 139, 277, 554, 1109, 2217, 4435], 3:[37, 73, 147, 294, 587, 1175, 2349, 4699], 4:[39, 78, 156, 311, 622, 1245, 2849, 4978], 5:[41, 82, 165, 330, 659, 1319, 2637, 5274], 6:[44, 87, 175, 349, 698, 1397, 2794, 5588], 7:[46, 92, 185, 370, 740, 1480, 2960, 5920], 8:[49, 98, 196, 392, 784, 1568, 3136, 6272], 9:[52, 104, 208, 415, 831, 
1661, 3322, 6645], 10:[55, 110, 220, 440, 880, 1760, 3520, 7040], 11:[58, 117, 233, 466, 932, 1865, 3729, 7459], 12:[62, 123, 247, 494, 988, 1976, 3951, 7902]}, BlockState:{}};
Entry.EV3 = {PORT_MAP:{A:0, B:0, C:0, D:0, 1:void 0, 2:void 0, 3:void 0, 4:void 0}, motorMovementTypes:{Degrees:0, Power:1}, deviceTypes:{NxtTouch:1, NxtLight:2, NxtSound:3, NxtColor:4, NxtUltrasonic:5, NxtTemperature:6, LMotor:7, MMotor:8, Touch:16, Color:29, Ultrasonic:30, Gyroscope:32, Infrared:33, Initializing:125, Empty:126, WrongPort:127, Unknown:255}, colorSensorValue:" 000000 0000FF 00FF00 FFFF00 FF0000 FFFFFF A52A2A".split(" "), timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var c = this.timeouts;
  b = c.indexOf(b);
  0 <= b && c.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, c;
  for (c in b) {
    clearTimeout(b[c]);
  }
  this.timeouts = [];
}, setZero:function() {
  var b = this.PORT_MAP;
  Object.keys(b).forEach(function(c) {
    /[A-D]/i.test(c) ? Entry.hw.sendQueue[c] = {type:Entry.EV3.motorMovementTypes.Power, power:0} : Entry.hw.sendQueue[c] = b[c];
  });
  Entry.hw.update();
}, name:"EV3"};
Blockly.Blocks.ev3_get_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]), "PORT").appendField("\uc758 \uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.ev3_get_sensor_value = function(b, c) {
  c.getStringField("PORT", c);
  b = Entry.hw.getDigitalPortValue(c.getNumberField("PORT", c));
  var d;
  $.isPlainObject(b) && (d = b.siValue || 0);
  return d;
};
Blockly.Blocks.ev3_touch_sensor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]), "PORT").appendField("\uc758 \ud130\uce58\uc13c\uc11c\uac00 \uc791\ub3d9\ub418\uc5c8\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.ev3_touch_sensor = function(b, c) {
  c.getStringField("PORT", c);
  b = Entry.hw.getDigitalPortValue(c.getNumberField("PORT", c));
  c = !1;
  b.type == Entry.EV3.deviceTypes.Touch && 1 <= Number(b.siValue) && (c = !0);
  return c;
};
Blockly.Blocks.ev3_color_sensor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]), "PORT").appendField("\uc758 ").appendField(new Blockly.FieldDropdown([["RGB", "RGB"], ["R", "R"], ["G", "G"], ["B", "B"]]), "RGB").appendField("\uac12");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.ev3_color_sensor = function(b, c) {
  c.getStringField("PORT", c);
  b = c.getStringField("RGB", c);
  c = Entry.hw.getDigitalPortValue(c.getNumberField("PORT", c));
  var d = "";
  if (c.type == Entry.EV3.deviceTypes.Color) {
    if (0 == c.siValue) {
      d = "";
    } else {
      switch(b) {
        case "RGB":
          d = Entry.EV3.colorSensorValue[c.siValue];
          break;
        case "R":
          d = Entry.EV3.colorSensorValue[c.siValue].substring(0, 2);
          break;
        case "G":
          d = Entry.EV3.colorSensorValue[c.siValue].substring(2, 4);
          break;
        case "B":
          d = Entry.EV3.colorSensorValue[c.siValue].substring(4, 6);
      }
    }
  } else {
    d = "\uceec\ub7ec \uc13c\uc11c \uc544\ub2d8";
  }
  return d;
};
Blockly.Blocks.ev3_motor_power = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), "PORT").appendField("\uc758 \uac12\uc744");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\uc73c\ub85c \ucd9c\ub825");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.ev3_motor_power = function(b, c) {
  b = c.getStringField("PORT", c);
  var d = c.getValue("VALUE", c);
  Entry.hw.sendQueue[b] = {id:Math.floor(100000 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Power, power:d};
  return c.callReturn();
};
Blockly.Blocks.ev3_motor_power_on_time = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), "PORT").appendField("\uc758 \uac12\uc744");
  this.appendValueInput("TIME").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ucd08 \ub3d9\uc548");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\uc73c\ub85c \ucd9c\ub825");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.ev3_motor_power_on_time = function(b, c) {
  b = c.getStringField("PORT", c);
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    Entry.hw.sendQueue[b] = {id:Math.floor(100000 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Power, power:0};
    return c.callReturn();
  }
  var d = c.getValue("TIME", c), e = c.getValue("VALUE", c);
  c.isStart = !0;
  c.timeFlag = 1;
  Entry.hw.sendQueue[b] = {id:Math.floor(100000 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Power, power:e};
  var f = setTimeout(function() {
    c.timeFlag = 0;
    Entry.EV3.removeTimeout(f);
  }, 1000 * d);
  Entry.EV3.timeouts.push(f);
  return c;
};
Blockly.Blocks.ev3_motor_degrees = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), "PORT").appendField("\uc758 \uac12\uc744").appendField(new Blockly.FieldDropdown([["\uc2dc\uacc4\ubc29\ud5a5", "CW"], ["\ubc18\uc2dc\uacc4\ubc29\ud5a5", "CCW"]]), "DIRECTION").appendField("\uc73c\ub85c ");
  this.appendValueInput("DEGREE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ub3c4 \ub9cc\ud07c \ud68c\uc804");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.ev3_motor_degrees = function(b, c) {
  b = c.getStringField("PORT", c);
  var d = c.getValue("DEGREE", c);
  0 >= d ? d = 0 : 720 <= d && (d = 720);
  var e = c.getStringField("DIRECTION", c);
  Entry.hw.sendQueue[b] = {id:Math.floor(100000 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Degrees, degree:d, power:"CW" == e ? 50 : -50};
  return c.callReturn();
};
Entry.Hamster = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, outputA:0, outputB:0, leftLed:0, rightLed:0, note:0, lineTracerMode:0, lineTracerModeId:0, lineTracerSpeed:5, ioModeA:0, ioModeB:0}, setZero:function() {
  var b = Entry.Hamster.PORT_MAP, c = Entry.hw.sendQueue, d;
  for (d in b) {
    c[d] = b[d];
  }
  Entry.hw.update();
  b = Entry.Hamster;
  b.lineTracerModeId = 0;
  b.lineTracerStateId = -1;
  b.tempo = 60;
  b.removeAllTimeouts();
}, lineTracerModeId:0, lineTracerStateId:-1, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var c = this.timeouts;
  b = c.indexOf(b);
  0 <= b && c.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, c;
  for (c in b) {
    clearTimeout(b[c]);
  }
  this.timeouts = [];
}, setLineTracerMode:function(b, c) {
  this.lineTracerModeId = this.lineTracerModeId + 1 & 255;
  b.lineTracerMode = c;
  b.lineTracerModeId = this.lineTracerModeId;
}, name:"hamster", monitorTemplate:{imgPath:"hw/hamster.png", width:256, height:256, listPorts:{temperature:{name:Lang.Blocks.HAMSTER_sensor_temperature, type:"input", pos:{x:0, y:0}}, inputA:{name:Lang.Blocks.HAMSTER_sensor_input_a, type:"input", pos:{x:0, y:0}}, inputB:{name:Lang.Blocks.HAMSTER_sensor_input_b, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.HAMSTER_sensor_acceleration_x, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.HAMSTER_sensor_acceleration_y, 
type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.HAMSTER_sensor_acceleration_z, type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, note:{name:Lang.Hw.note, type:"output", pos:{x:0, y:0}}, outputA:{name:Lang.Hw.output + "A", type:"output", pos:{x:0, y:0}}, outputB:{name:Lang.Hw.output + "B", type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.HAMSTER_sensor_left_proximity, type:"input", pos:{x:122, y:156}}, rightProximity:{name:Lang.Blocks.HAMSTER_sensor_right_proximity, 
type:"input", pos:{x:10, y:108}}, leftFloor:{name:Lang.Blocks.HAMSTER_sensor_left_floor, type:"input", pos:{x:100, y:234}}, rightFloor:{name:Lang.Blocks.HAMSTER_sensor_right_floor, type:"input", pos:{x:13, y:180}}, light:{name:Lang.Blocks.HAMSTER_sensor_light, type:"input", pos:{x:56, y:189}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:209, y:115}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:98, y:30}}, leftLed:{name:Lang.Hw.left + " " + Lang.Hw.led_en, type:"output", 
pos:{x:87, y:210}}, rightLed:{name:Lang.Hw.right + " " + Lang.Hw.led_en, type:"output", pos:{x:24, y:168}}}, mode:"both"}};
Blockly.Blocks.hamster_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.hamster_hand_found = function(b, c) {
  b = Entry.hw.portData;
  return 50 < b.leftProximity || 50 < b.rightProximity;
};
Blockly.Blocks.hamster_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_sensor_left_proximity, "leftProximity"], [Lang.Blocks.HAMSTER_sensor_right_proximity, "rightProximity"], [Lang.Blocks.HAMSTER_sensor_left_floor, "leftFloor"], [Lang.Blocks.HAMSTER_sensor_right_floor, "rightFloor"], [Lang.Blocks.HAMSTER_sensor_acceleration_x, "accelerationX"], [Lang.Blocks.HAMSTER_sensor_acceleration_y, "accelerationY"], [Lang.Blocks.HAMSTER_sensor_acceleration_z, "accelerationZ"], 
  [Lang.Blocks.HAMSTER_sensor_light, "light"], [Lang.Blocks.HAMSTER_sensor_temperature, "temperature"], [Lang.Blocks.HAMSTER_sensor_signal_strength, "signalStrength"], [Lang.Blocks.HAMSTER_sensor_input_a, "inputA"], [Lang.Blocks.HAMSTER_sensor_input_b, "inputB"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.hamster_value = function(b, c) {
  b = Entry.hw.portData;
  c = c.getField("DEVICE");
  return b[c];
};
Blockly.Blocks.hamster_move_forward_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_once).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_once = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = Entry.hw.portData;
  if (c.isStart) {
    if (c.isMoving) {
      switch(c.boardState) {
        case 1:
          2 > c.count ? (50 > d.leftFloor && 50 > d.rightFloor ? c.count++ : c.count = 0, d = d.leftFloor - d.rightFloor, b.leftWheel = 45 + 0.25 * d, b.rightWheel = 45 - 0.25 * d) : (c.count = 0, c.boardState = 2);
          break;
        case 2:
          d = d.leftFloor - d.rightFloor;
          b.leftWheel = 45 + 0.25 * d;
          b.rightWheel = 45 - 0.25 * d;
          c.boardState = 3;
          var e = setTimeout(function() {
            c.boardState = 4;
            Entry.Hamster.removeTimeout(e);
          }, 250);
          Entry.Hamster.timeouts.push(e);
          break;
        case 3:
          d = d.leftFloor - d.rightFloor;
          b.leftWheel = 45 + 0.25 * d;
          b.rightWheel = 45 - 0.25 * d;
          break;
        case 4:
          b.leftWheel = 0, b.rightWheel = 0, c.boardState = 0, c.isMoving = !1;
      }
      return c;
    }
    delete c.isStart;
    delete c.isMoving;
    delete c.count;
    delete c.boardState;
    Entry.engine.isContinue = !1;
    b.leftWheel = 0;
    b.rightWheel = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.isMoving = !0;
  c.count = 0;
  c.boardState = 1;
  b.leftWheel = 45;
  b.rightWheel = 45;
  Entry.Hamster.setLineTracerMode(b, 0);
  return c;
};
Blockly.Blocks.hamster_turn_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_once_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_turn_once_left, "LEFT"], [Lang.Blocks.HAMSTER_turn_once_right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_once_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_once = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = Entry.hw.portData;
  if (c.isStart) {
    if (c.isMoving) {
      if (c.isLeft) {
        switch(c.boardState) {
          case 1:
            2 > c.count ? 50 < d.leftFloor && c.count++ : (c.count = 0, c.boardState = 2);
            break;
          case 2:
            20 > d.leftFloor && (c.boardState = 3);
            break;
          case 3:
            2 > c.count ? 20 > d.leftFloor && c.count++ : (c.count = 0, c.boardState = 4);
            break;
          case 4:
            50 < d.leftFloor && (c.boardState = 5);
            break;
          case 5:
            d = d.leftFloor - d.rightFloor, -15 < d ? (b.leftWheel = 0, b.rightWheel = 0, c.boardState = 0, c.isMoving = !1) : (b.leftWheel = 0.5 * d, b.rightWheel = 0.5 * -d);
        }
      } else {
        switch(c.boardState) {
          case 1:
            2 > c.count ? 50 < d.rightFloor && c.count++ : (c.count = 0, c.boardState = 2);
            break;
          case 2:
            20 > d.rightFloor && (c.boardState = 3);
            break;
          case 3:
            2 > c.count ? 20 > d.rightFloor && c.count++ : (c.count = 0, c.boardState = 4);
            break;
          case 4:
            50 < d.rightFloor && (c.boardState = 5);
            break;
          case 5:
            d = d.rightFloor - d.leftFloor, -15 < d ? (b.leftWheel = 0, b.rightWheel = 0, c.boardState = 0, c.isMoving = !1) : (b.leftWheel = 0.5 * -d, b.rightWheel = 0.5 * d);
        }
      }
      return c;
    }
    delete c.isStart;
    delete c.isMoving;
    delete c.count;
    delete c.boardState;
    delete c.isLeft;
    Entry.engine.isContinue = !1;
    b.leftWheel = 0;
    b.rightWheel = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.isMoving = !0;
  c.count = 0;
  c.boardState = 1;
  "LEFT" == c.getField("DIRECTION", c) ? (c.isLeft = !0, b.leftWheel = -45, b.rightWheel = 45) : (c.isLeft = !1, b.leftWheel = 45, b.rightWheel = -45);
  Entry.Hamster.setLineTracerMode(b, 0);
  return c;
};
Blockly.Blocks.hamster_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_for_secs = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    b.leftWheel = 0;
    b.rightWheel = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.timeFlag = 1;
  b.leftWheel = 30;
  b.rightWheel = 30;
  Entry.Hamster.setLineTracerMode(b, 0);
  b = 1000 * c.getNumberValue("VALUE");
  var d = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, b);
  Entry.Hamster.timeouts.push(d);
  return c;
};
Blockly.Blocks.hamster_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_backward_for_secs = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    b.leftWheel = 0;
    b.rightWheel = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.timeFlag = 1;
  b.leftWheel = -30;
  b.rightWheel = -30;
  Entry.Hamster.setLineTracerMode(b, 0);
  b = 1000 * c.getNumberValue("VALUE");
  var d = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, b);
  Entry.Hamster.timeouts.push(d);
  return c;
};
Blockly.Blocks.hamster_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_turn_left, "LEFT"], [Lang.Blocks.HAMSTER_turn_right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_for_secs = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    b.leftWheel = 0;
    b.rightWheel = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.timeFlag = 1;
  "LEFT" == c.getField("DIRECTION", c) ? (b.leftWheel = -30, b.rightWheel = 30) : (b.leftWheel = 30, b.rightWheel = -30);
  Entry.Hamster.setLineTracerMode(b, 0);
  b = 1000 * c.getNumberValue("VALUE");
  var d = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, b);
  Entry.Hamster.timeouts.push(d);
  return c;
};
Blockly.Blocks.hamster_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_both_wheels_by = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getNumberValue("LEFT"), e = c.getNumberValue("RIGHT");
  b.leftWheel = void 0 != b.leftWheel ? b.leftWheel + d : d;
  b.rightWheel = void 0 != b.rightWheel ? b.rightWheel + e : e;
  Entry.Hamster.setLineTracerMode(b, 0);
  return c.callReturn();
};
Blockly.Blocks.hamster_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_both_wheels_to = function(b, c) {
  b = Entry.hw.sendQueue;
  b.leftWheel = c.getNumberValue("LEFT");
  b.rightWheel = c.getNumberValue("RIGHT");
  Entry.Hamster.setLineTracerMode(b, 0);
  return c.callReturn();
};
Blockly.Blocks.hamster_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_wheel, "LEFT"], [Lang.Blocks.HAMSTER_right_wheel, "RIGHT"], [Lang.Blocks.HAMSTER_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_wheel_by = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("DIRECTION"), e = c.getNumberValue("VALUE");
  "LEFT" == d ? b.leftWheel = void 0 != b.leftWheel ? b.leftWheel + e : e : ("RIGHT" != d && (b.leftWheel = void 0 != b.leftWheel ? b.leftWheel + e : e), b.rightWheel = void 0 != b.rightWheel ? b.rightWheel + e : e);
  Entry.Hamster.setLineTracerMode(b, 0);
  return c.callReturn();
};
Blockly.Blocks.hamster_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_wheel, "LEFT"], [Lang.Blocks.HAMSTER_right_wheel, "RIGHT"], [Lang.Blocks.HAMSTER_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_wheel_to = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("DIRECTION"), e = c.getNumberValue("VALUE");
  "LEFT" == d ? b.leftWheel = e : ("RIGHT" != d && (b.leftWheel = e), b.rightWheel = e);
  Entry.Hamster.setLineTracerMode(b, 0);
  return c.callReturn();
};
Blockly.Blocks.hamster_follow_line_using = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_using_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.Blocks.HAMSTER_color_white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_using_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_floor_sensor, "LEFT"], [Lang.Blocks.HAMSTER_right_floor_sensor, "RIGHT"], [Lang.Blocks.HAMSTER_both_floor_sensors, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_using_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_using = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("COLOR"), e = c.getField("DIRECTION"), f = 1;
  "RIGHT" == e ? f = 2 : "BOTH" == e && (f = 3);
  "WHITE" == d && (f += 7);
  b.leftWheel = 0;
  b.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(b, f);
  return c.callReturn();
};
Blockly.Blocks.hamster_follow_line_until = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_until_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.Blocks.HAMSTER_color_white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_until_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_intersection, "LEFT"], [Lang.Blocks.HAMSTER_right_intersection, "RIGHT"], [Lang.Blocks.HAMSTER_front_intersection, "FRONT"], [Lang.Blocks.HAMSTER_rear_intersection, "REAR"]]), 
  "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_until_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_until = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = Entry.hw.portData, e = c.getField("COLOR"), f = c.getField("DIRECTION"), g = 4;
  "RIGHT" == f ? g = 5 : "FRONT" == f ? g = 6 : "REAR" == f && (g = 7);
  "WHITE" == e && (g += 7);
  if (c.isStart) {
    if (e = Entry.Hamster, d.lineTracerStateId != e.lineTracerStateId && (e.lineTracerStateId = d.lineTracerStateId, 64 == d.lineTracerState)) {
      return delete c.isStart, Entry.engine.isContinue = !1, e.setLineTracerMode(b, 0), c.callReturn();
    }
  } else {
    c.isStart = !0, b.leftWheel = 0, b.rightWheel = 0, Entry.Hamster.setLineTracerMode(b, g);
  }
  return c;
};
Blockly.Blocks.hamster_set_following_speed_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_following_speed_to_1).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "SPEED").appendField(Lang.Blocks.HAMSTER_set_following_speed_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_following_speed_to = function(b, c) {
  Entry.hw.sendQueue.lineTracerSpeed = Number(c.getField("SPEED", c));
  return c.callReturn();
};
Blockly.Blocks.hamster_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_stop = function(b, c) {
  b = Entry.hw.sendQueue;
  b.leftWheel = 0;
  b.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(b, 0);
  return c.callReturn();
};
Blockly.Blocks.hamster_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_led, "LEFT"], [Lang.Blocks.HAMSTER_right_led, "RIGHT"], [Lang.Blocks.HAMSTER_both_leds, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.HAMSTER_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.HAMSTER_color_magenta, 
  "5"], [Lang.Blocks.HAMSTER_color_white, "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_led_to = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("DIRECTION", c), e = Number(c.getField("COLOR", c));
  "LEFT" == d ? b.leftLed = e : ("RIGHT" != d && (b.leftLed = e), b.rightLed = e);
  return c.callReturn();
};
Blockly.Blocks.hamster_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_led, "LEFT"], [Lang.Blocks.HAMSTER_right_led, "RIGHT"], [Lang.Blocks.HAMSTER_both_leds, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_led = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("DIRECTION", c);
  "LEFT" == d ? b.leftLed = 0 : ("RIGHT" != d && (b.leftLed = 0), b.rightLed = 0);
  return c.callReturn();
};
Blockly.Blocks.hamster_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_beep = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    b.buzzer = 0;
    return c.callReturn();
  }
  c.isStart = !0;
  c.timeFlag = 1;
  b.buzzer = 440;
  b.note = 0;
  var d = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, 200);
  Entry.Hamster.timeouts.push(d);
  return c;
};
Blockly.Blocks.hamster_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_buzzer_by = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getNumberValue("VALUE");
  b.buzzer = void 0 != b.buzzer ? b.buzzer + d : d;
  b.note = 0;
  return c.callReturn();
};
Blockly.Blocks.hamster_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_buzzer_to = function(b, c) {
  b = Entry.hw.sendQueue;
  b.buzzer = c.getNumberValue("VALUE");
  b.note = 0;
  return c.callReturn();
};
Blockly.Blocks.hamster_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_buzzer = function(b, c) {
  b = Entry.hw.sendQueue;
  b.buzzer = 0;
  b.note = 0;
  return c.callReturn();
};
Blockly.Blocks.hamster_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.HAMSTER_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_play_note_for = function(b, c) {
  var d = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    d.note = 0;
    return c.callReturn();
  }
  b = c.getNumberField("NOTE", c);
  var e = c.getNumberField("OCTAVE", c), f = 6E4 * c.getNumberValue("VALUE", c) / Entry.Hamster.tempo;
  c.isStart = !0;
  c.timeFlag = 1;
  d.buzzer = 0;
  d.note = b + 12 * (e - 1);
  if (100 < f) {
    var g = setTimeout(function() {
      d.note = 0;
      Entry.Hamster.removeTimeout(g);
    }, f - 100);
    Entry.Hamster.timeouts.push(g);
  }
  var h = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Hamster.removeTimeout(h);
  }, f);
  Entry.Hamster.timeouts.push(h);
  return c;
};
Blockly.Blocks.hamster_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_rest_for = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.isStart;
    delete c.timeFlag;
    Entry.engine.isContinue = !1;
    return c.callReturn();
  }
  c.isStart = !0;
  c.timeFlag = 1;
  var d = c.getNumberValue("VALUE"), d = 6E4 * d / Entry.Hamster.tempo;
  b.buzzer = 0;
  b.note = 0;
  var e = setTimeout(function() {
    c.timeFlag = 0;
    Entry.Hamster.removeTimeout(e);
  }, d);
  Entry.Hamster.timeouts.push(e);
  return c;
};
Blockly.Blocks.hamster_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_tempo_by = function(b, c) {
  Entry.Hamster.tempo += c.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return c.callReturn();
};
Blockly.Blocks.hamster_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_tempo_to = function(b, c) {
  Entry.Hamster.tempo = c.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return c.callReturn();
};
Blockly.Blocks.hamster_set_port_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_port_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_a_b, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_port_to_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_analog_input, "0"], [Lang.Blocks.HAMSTER_digital_input, "1"], [Lang.Blocks.HAMSTER_servo_output, "8"], [Lang.Blocks.HAMSTER_pwm_output, "9"], [Lang.Blocks.HAMSTER_digital_output, 
  "10"]]), "MODE").appendField(Lang.Blocks.HAMSTER_set_port_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_port_to = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("PORT", c), e = Number(c.getField("MODE", c));
  "A" == d ? b.ioModeA = e : ("B" != d && (b.ioModeA = e), b.ioModeB = e);
  return c.callReturn();
};
Blockly.Blocks.hamster_change_output_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_a_b, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_change_output_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_output_by = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("PORT"), e = c.getNumberValue("VALUE");
  "A" == d ? b.outputA = void 0 != b.outputA ? b.outputA + e : e : ("B" != d && (b.outputA = void 0 != b.outputA ? b.outputA + e : e), b.outputB = void 0 != b.outputB ? b.outputB + e : e);
  return c.callReturn();
};
Blockly.Blocks.hamster_set_output_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_a_b, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_output_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_output_to = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getField("PORT"), e = c.getNumberValue("VALUE");
  "A" == d ? b.outputA = e : ("B" != d && (b.outputA = e), b.outputB = e);
  return c.callReturn();
};
Entry.MODI = {name:"modi", setZero:function() {
  Entry.hw.sendQueue.moduleValue = {led:[], motor:[], speaker:[], display:[]};
  Entry.hw.sendQueue.getProperty = {};
  Entry.hw.getModule = {id:0, property:0};
  Entry.hw.update();
}, initSend:function() {
  Entry.hw.sendQueue.moduleValue = {led:[], motor:[], speaker:[], display:[]};
  Entry.hw.sendQueue.getProperty = {};
  Entry.hw.getModule = {id:0, property:0};
  Entry.hw.update();
}, getModule:{id:0, property:0}, microphoneList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.mic) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.mic.length; d++) {
    b.mic[d] && c.push([d.toString(), d.toString()]);
  }
  return c;
}, environmentList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.environment) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.environment.length; d++) {
    b.environment[d] && c.push([d.toString(), d.toString()]);
  }
  return c;
}, dialList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.dial) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.dial.length; d++) {
    b.dial[d] && c.push([d.toString(), d.toString()]);
  }
  return c;
}, gyroscopeList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.gyro) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.gyro.length; d++) {
    b.gyro[d] && c.push([d.toString(), d.toString()]);
  }
  return c;
}, buttonList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.button) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.button.length; d++) {
    b.button[d] && c.push([d.toString(), d.toString()]);
  }
  return c;
}, infraredList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.ir) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.ir.length; d++) {
    b.ir[d] && c.push([d.toString(), d.toString()]);
  }
  return c;
}, ultrasonicList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.ultrasonic) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.ultrasonic.length; d++) {
    b.ultrasonic[d] && c.push([d.toString(), d.toString()]);
  }
  return c;
}, motorList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.motor) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.motor.length; d++) {
    b.motor[d] && c.push([d.toString(), d.toString()]);
  }
  return c;
}, ledList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.led) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.led.length; d++) {
    b.led[d] && c.push([d, d]);
  }
  return c;
}, speakerList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.speaker) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.speaker.length; d++) {
    b.speaker[d] && c.push([d.toString(), d.toString()]);
  }
  return c;
}, displayList:function() {
  var b = Entry.hw.portData.module || {};
  if (void 0 === b.display) {
    return [[Lang.Blocks.no_target, "null"]];
  }
  var c = [];
  for (var d = 0; d < b.display.length; d++) {
    b.display[d] && c.push([d.toString(), d.toString()]);
  }
  return c;
}};
Blockly.Blocks.modi_microphone_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ub9c8\uc774\ud06c").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.microphoneList), "name").appendField("\ubc88\uc758 \ubcfc\ub968");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Blockly.Blocks.modi_environment_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ud658\uacbd\uc13c\uc11c").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.environmentList), "name").appendField("\ubc88\uc758 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.modi_enviroment_temperature, "\uc628\ub3c4"], [Lang.Blocks.modi_enviroment_humidity, "\uc2b5\ub3c4"], [Lang.Blocks.modi_enviroment_illuminance, "\uc870\ub3c4"]]), "envValue");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Blockly.Blocks.moid_dial_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ub2e4\uc774\uc5bc").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.dialList), "name").appendField("\ubc88\uc758 \uac01\ub3c4");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Blockly.Blocks.modi_gyroscope_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc790\uc774\ub85c\uc13c\uc11c").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.gyroscopeList), "name").appendField("\ubc88\uc758 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["Roll", "Roll"], ["Pitch", "Pitch"], ["Yaw", "Yaw"], [Lang.Blocks.modi_gyroscope_xAcceleratior, "X\ucd95 \uac00\uc18d"], [Lang.Blocks.modi_gyroscope_yAcceleratior, "Y\ucd95 \uac00\uc18d"], [Lang.Blocks.modi_gyroscope_zAcceleratior, "Z\ucd95 \uac00\uc18d"]]), "gyroValue");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Blockly.Blocks.modi_button_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\ud2bc ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.buttonList), "name").appendField("\ubc88\uc758 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["Click", "Click"], ["Double Click", "Double Click"], ["Toggle", "Toggle"], ["Press", "Press"]]), "buttonValue");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Blockly.Blocks.modi_is_button_touch = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\ud2bc ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.buttonList), "name").appendField("\ubc88\uc758 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["Click", "Click"], ["Double Click", "Double Click"], ["Toggle", "Toggle"], ["Press", "Press"]]), "buttonValue").appendField("\ud588\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Blockly.Blocks.modi_button_true = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ub20c\ub9bc");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Blockly.Blocks.modi_button_false = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc548\ub20c\ub9bc");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Blockly.Blocks.modi_infrared_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc801\uc678\uc120").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.infraredList), "name").appendField("\ubc88 \uc13c\uc11c\uc758 \uac70\ub9ac(%)");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Blockly.Blocks.modi_ultrasonic_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ucd08\uc74c\ud30c").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.ultrasonicList), "name").appendField("\ubc88 \uc13c\uc11c\uc758 \uac70\ub9ac(%)");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Blockly.Blocks.modi_set_motor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubaa8\ud130 ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.motorList), "name").appendField("\ubc88 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.modi_motor_angle, "\uac01\ub3c4"], [Lang.Blocks.modi_motor_speed, "\uc18d\ub3c4"], [Lang.Blocks.modi_motor_torque, "\ud68c\uc804"]]), "motorValue").appendField("\uc758 \uc0c1\ub2e8\uac12\uc740 ");
  this.appendValueInput("uValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ud558\ub2e8\uac12\uc740 ");
  this.appendValueInput("bValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(" (\uc73c)\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.modi_change_motor_upper_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubaa8\ud130 ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.motorList), "name").appendField("\ubc88 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.modi_motor_angle, "\uac01\ub3c4"], [Lang.Blocks.modi_motor_speed, "\uc18d\ub3c4"], [Lang.Blocks.modi_motor_torque, "\ud68c\uc804"]]), "motorValue").appendField("\uc758 \uc0c1\ub2e8\uac12\uc744 ");
  this.appendValueInput("uValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub9cc\ud07c \ubc14\uafb8\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.modi_change_motor_bottom_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubaa8\ud130 ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.motorList), "name").appendField("\ubc88 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.modi_motor_angle, "\uac01\ub3c4"], [Lang.Blocks.modi_motor_speed, "\uc18d\ub3c4"], [Lang.Blocks.modi_motor_torque, "\ud68c\uc804"]]), "motorValue").appendField("\uc758 \ud558\ub2e8\uac12\uc744 ");
  this.appendValueInput("bValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub9cc\ud07c \ubc14\uafb8\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.modi_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("LED ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.ledList), "name").appendField("\ubc88\uc758 \uc0c9 \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.modi_set_led_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("LED ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.ledList), "name").appendField("\ubc88 R");
  this.appendValueInput("rValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("G");
  this.appendValueInput("gValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("B");
  this.appendValueInput("bValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("(\uc73c)\ub85c \ucf1c\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.modi_set_led_color = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("LED ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.ledList), "name").appendField("\ubc88 \uc0c9").appendField(new Blockly.FieldColour("#ff0000"), "color").appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.modi_set_basic_speaker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc2a4\ud53c\ucee4 ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.speakerList), "name").appendField("\ubc88\uc744").appendField(new Blockly.FieldDropdown([[Lang.Blocks.modi_speaker_F_DO_4, "\ub3c44"], [Lang.Blocks.modi_speaker_F_RE_4, "\ub8084"], [Lang.Blocks.modi_speaker_F_MI_4, "\ubbf84"], [Lang.Blocks.modi_speaker_F_PA_4, "\ud30c4"], [Lang.Blocks.modi_speaker_F_SOL_4, "\uc1944"], [Lang.Blocks.modi_speaker_F_RA_4, "\ub77c4"], [Lang.Blocks.modi_speaker_F_SO_4, 
  "\uc2dc4"], [Lang.Blocks.modi_speaker_F_DO_S_4, "\ub3c4#4"], [Lang.Blocks.modi_speaker_F_RE_S_4, "\ub808#4"], [Lang.Blocks.modi_speaker_F_PA_S_4, "\ud30c#4"], [Lang.Blocks.modi_speaker_F_SOL_S_4, "\uc194#4"], [Lang.Blocks.modi_speaker_F_RA_S_4, "\ub77c#4"], [Lang.Blocks.modi_speaker_F_DO_5, "\ub3c45"], [Lang.Blocks.modi_speaker_F_RE_5, "\ub8085"], [Lang.Blocks.modi_speaker_F_MI_5, "\ubbf85"], [Lang.Blocks.modi_speaker_F_PA_5, "\ud30c5"], [Lang.Blocks.modi_speaker_F_SOL_5, "\uc1945"], [Lang.Blocks.modi_speaker_F_RA_5, 
  "\ub77c5"], [Lang.Blocks.modi_speaker_F_SO_5, "\uc2dc5"], [Lang.Blocks.modi_speaker_F_DO_S_5, "\ub3c4#5"], [Lang.Blocks.modi_speaker_F_RE_S_5, "\ub77c#5"], [Lang.Blocks.modi_speaker_F_PA_S_5, "\ud30c#5"], [Lang.Blocks.modi_speaker_F_SOL_S_5, "\uc194#5"], [Lang.Blocks.modi_speaker_F_RA_S_5, "\ub77c#5"], [Lang.Blocks.modi_speaker_F_DO_6, "\ub3c46"], [Lang.Blocks.modi_speaker_F_RE_6, "\ub8086"], [Lang.Blocks.modi_speaker_F_MI_6, "\ubbf86"], [Lang.Blocks.modi_speaker_F_PA_6, "\ud30c6"], [Lang.Blocks.modi_speaker_F_SOL_6, 
  "\uc1946"], [Lang.Blocks.modi_speaker_F_RA_6, "\ub77c6"], [Lang.Blocks.modi_speaker_F_SO_6, "\uc2dc6"], [Lang.Blocks.modi_speaker_F_DO_S_6, "\ub3c4#6"], [Lang.Blocks.modi_speaker_F_RE_S_6, "\ub808#6"], [Lang.Blocks.modi_speaker_F_PA_S_6, "\ud30c#6"], [Lang.Blocks.modi_speaker_F_SOL_S_6, "\uc194#6"], [Lang.Blocks.modi_speaker_F_RA_S_6, "\ub77c#6"], [Lang.Blocks.modi_speaker_F_DO_7, "\ub3c47"], [Lang.Blocks.modi_speaker_F_RE_7, "\ub8087"], [Lang.Blocks.modi_speaker_F_MI_7, "\ubbf87"], [Lang.Blocks.modi_speaker_F_PA_7, 
  "\ud30c7"], [Lang.Blocks.modi_speaker_F_SOL_7, "\uc1947"], [Lang.Blocks.modi_speaker_F_RA_7, "\ub77c7"], [Lang.Blocks.modi_speaker_F_SO_7, "\uc2dc7"], [Lang.Blocks.modi_speaker_F_DO_S_7, "\ub3c4#7"], [Lang.Blocks.modi_speaker_F_RE_S_7, "\ub808#7"], [Lang.Blocks.modi_speaker_F_PA_S_7, "\ud30c#7"], [Lang.Blocks.modi_speaker_F_SOL_S_7, "\uc194#7"], [Lang.Blocks.modi_speaker_F_RA_S_7, "\ub77c#7"]]), "speakerValue");
  this.appendDummyInput().appendField("\uc74c\uc73c\ub85c \ud06c\uae30\ub294");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("(\uc73c)\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.modi_set_custom_speaker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc2a4\ud53c\ucee4 ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.speakerList), "name").appendField("\ubc88\uc758 \uc9c4\ub3d9\uc218\ub294");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ud06c\uae30\ub294 ");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("(\uc73c)\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.modi_change_speaker_frequence = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc2a4\ud53c\ucee4 ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.speakerList), "name").appendField("\ubc88\uc758 \uc9c4\ub3d9\uc218\ub97c");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub9cc\ud07c \ubc14\uafb8\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.modi_change_speaker_volume = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc2a4\ud53c\ucee4 ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.speakerList), "name").appendField("\ubc88\uc758 \ud06c\uae30\ub97c");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub9cc\ud07c \ubc14\uafb8\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.modi_print_display_by_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ub514\uc2a4\ud50c\ub808\uc774 ").appendField(new Blockly.FieldDropdownDynamic(Entry.MODI.displayList), "name").appendField("\ubc88\uc758 \ud654\uba74\uc5d0");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ubcf4\uc774\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.Neobot = {name:"neobot", LOCAL_MAP:["IN1", "IN2", "IN3", "IR", "BAT"], REMOTE_MAP:"OUT1 OUT2 OUT3 DCR DCL SND FND OPT".split(" "), setZero:function() {
  for (var b in Entry.Neobot.REMOTE_MAP) {
    Entry.hw.sendQueue[Entry.Neobot.REMOTE_MAP[b]] = 0;
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/neobot.png", width:700, height:700, listPorts:{IR:{name:"\ub9ac\ubaa8\ucee8", type:"input", pos:{x:0, y:0}}, BAT:{name:"\ubca0\ud130\ub9ac", type:"input", pos:{x:0, y:0}}, SND:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, FND:{name:"FND", type:"output", pos:{x:0, y:0}}}, ports:{IN1:{name:"IN1", type:"input", pos:{x:270, y:200}}, IN2:{name:"IN2", type:"input", pos:{x:325, y:200}}, IN3:{name:"IN3", type:"input", pos:{x:325, y:500}}, DCL:{name:"L-Motor", type:"output", 
pos:{x:270, y:500}}, DCR:{name:"R-Motor", type:"output", pos:{x:435, y:500}}, OUT1:{name:"OUT1", type:"output", pos:{x:380, y:200}}, OUT2:{name:"OUT2", type:"output", pos:{x:435, y:200}}, OUT3:{name:"OUT3", type:"output", pos:{x:380, y:500}}}, mode:"both"}};
Blockly.Blocks.neobot_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1\ubc88 \ud3ec\ud2b8", "IN1"], ["2\ubc88 \ud3ec\ud2b8", "IN2"], ["3\ubc88 \ud3ec\ud2b8", "IN3"], ["\ub9ac\ubaa8\ucee8", "IR"], ["\ubc30\ud130\ub9ac", "BAT"]]), "PORT").appendField(" \uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.neobot_sensor_value = function(b, c) {
  b = c.getStringField("PORT");
  return Entry.hw.portData[b];
};
Blockly.Blocks.neobot_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_left_motor = function(b, c) {
  b = c.getNumberField("SPEED");
  var d = c.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCL = b + d;
  return c.callReturn();
};
Blockly.Blocks.neobot_stop_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_left_motor = function(b, c) {
  Entry.hw.sendQueue.DCL = 0;
  return c.callReturn();
};
Blockly.Blocks.neobot_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_right_motor = function(b, c) {
  b = c.getNumberField("SPEED");
  var d = c.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCR = b + d;
  return c.callReturn();
};
Blockly.Blocks.neobot_stop_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_right_motor = function(b, c) {
  Entry.hw.sendQueue.DCR = 0;
  return c.callReturn();
};
Blockly.Blocks.neobot_all_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc591\ucabd \ubaa8\ud130\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField(" \uc758 \uc18d\ub3c4\ub85c ").appendField(new Blockly.FieldDropdown([["\uc804\uc9c4", "1"], ["\ud6c4\uc9c4", "2"], ["\uc81c\uc790\ub9ac \uc88c\ud68c\uc804", "3"], ["\uc81c\uc790\ub9ac \uc6b0\ud68c\uc804", "4"], 
  ["\uc88c\ud68c\uc804", "5"], ["\uc6b0\ud68c\uc804", "6"]]), "DIRECTION").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_all_motor = function(b, c) {
  c.getNumberField("TYPE");
  b = c.getNumberField("SPEED");
  switch(c.getNumberField("DIRECTION")) {
    case 1:
      Entry.hw.sendQueue.DCL = 16 + b;
      Entry.hw.sendQueue.DCR = 16 + b;
      break;
    case 2:
      Entry.hw.sendQueue.DCL = 32 + b;
      Entry.hw.sendQueue.DCR = 32 + b;
      break;
    case 3:
      Entry.hw.sendQueue.DCL = 32 + b;
      Entry.hw.sendQueue.DCR = 16 + b;
      break;
    case 4:
      Entry.hw.sendQueue.DCL = 16 + b;
      Entry.hw.sendQueue.DCR = 32 + b;
      break;
    case 5:
      Entry.hw.sendQueue.DCL = 0;
      Entry.hw.sendQueue.DCR = 16 + b;
      break;
    case 6:
      Entry.hw.sendQueue.DCL = 16 + b, Entry.hw.sendQueue.DCR = 0;
  }
  return c.callReturn();
};
Blockly.Blocks.neobot_set_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ud3ec\ud2b8\uc758 \uc11c\ubcf4\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["0\ub3c4", "0"], ["10\ub3c4", "10"], ["20\ub3c4", "20"], ["30\ub3c4", "30"], ["40\ub3c4", "40"], ["50\ub3c4", "50"], ["60\ub3c4", "60"], ["70\ub3c4", "70"], ["80\ub3c4", "80"], ["90\ub3c4", "90"], ["100\ub3c4", "100"], ["110\ub3c4", "110"], ["120\ub3c4", "120"], ["130\ub3c4", 
  "130"], ["140\ub3c4", "140"], ["150\ub3c4", "150"], ["160\ub3c4", "160"], ["170\ub3c4", "170"], ["180\ub3c4", "180"]]), "DEGREE").appendField(" \uc774\ub3d9").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_servo = function(b, c) {
  b = c.getNumberField("PORT");
  var d = c.getNumberField("DEGREE");
  Entry.hw.sendQueue["OUT" + b] = d;
  3 === b && (b = 4);
  Entry.hw.sendQueue.OPT |= b;
  return c.callReturn();
};
Blockly.Blocks.neobot_set_output = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ubc88 \ud3ec\ud2b8\uc758 \uac12\uc744");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ub9cc\ud07c \ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_output = function(b, c) {
  b = c.getStringField("PORT", c);
  var d = c.getNumberValue("VALUE", c), e = b;
  0 > d ? d = 0 : 255 < d && (d = 255);
  3 === e && (e = 4);
  Entry.hw.sendQueue["OUT" + b] = d;
  Entry.hw.sendQueue.OPT &= ~e;
  return c.callReturn();
};
Blockly.Blocks.neobot_set_fnd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("FND\uc5d0");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_fnd = function(b, c) {
  b = c.getNumberValue("VALUE", c);
  255 < b ? b = 255 : 0 > b && (b = 0);
  Entry.hw.sendQueue.FND = b;
  return c.callReturn();
};
Blockly.Blocks.neobot_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uba5c\ub85c\ub514").appendField(new Blockly.FieldDropdown([["\ubb34\uc74c", "0"], [Lang.General.note_c, "1"], [Lang.General.note_c + "#", "2"], [Lang.General.note_d, "3"], [Lang.General.note_d + "#", "4"], [Lang.General.note_e, "5"], [Lang.General.note_f, "6"], [Lang.General.note_f + "#", "7"], [Lang.General.note_g, "8"], [Lang.General.note_g + "#", "9"], [Lang.General.note_a, "10"], [Lang.General.note_a + "#", "11"], [Lang.General.note_b, "12"]]), "NOTE").appendField("\uc744(\ub97c)").appendField(new Blockly.FieldDropdown([["1", 
  "0"], ["2", "1"], ["3", "2"], ["4", "3"], ["5", "4"], ["6", "5"]]), "OCTAVE").appendField("\uc625\ud0c0\ube0c\ub85c").appendField(new Blockly.FieldDropdown([["2\ubd84\uc74c\ud45c", "2"], ["4\ubd84\uc74c\ud45c", "4"], ["8\ubd84\uc74c\ud45c", "8"], ["16\ubd84\uc74c\ud45c", "16"]]), "DURATION");
  this.appendDummyInput().appendField("\uae38\uc774\ub9cc\ud07c \uc18c\ub9ac\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_play_note_for = function(b, c) {
  b = Entry.hw.sendQueue;
  if (c.isStart) {
    if (1 == c.timeFlag) {
      return c;
    }
    delete c.timeFlag;
    delete c.isStart;
    Entry.hw.sendQueue.SND = 0;
    Entry.engine.isContinue = !1;
    return c.callReturn();
  }
  var d = c.getNumberField("NOTE", c), e = c.getNumberField("OCTAVE", c), f = c.getNumberField("DURATION", c), d = d + 12 * e;
  c.isStart = !0;
  c.timeFlag = 1;
  65 < d && (d = 65);
  b.SND = d;
  setTimeout(function() {
    c.timeFlag = 0;
  }, 1 / f * 2000);
  return c;
};
Entry.Roborobo_Roduino = {name:"roborobo_roduino", INSTRUCTION:{DIGITAL_READ:1, DIGITAL_SET_MODE:2, DIGITAL_WRITE:3, ANALOG_WRITE:4, ANALOG_READ:5, MOTOR:6, COLOR:7}, setZero:function() {
  Entry.hw.sendQueue.colorPin = 0;
  Entry.hw.sendQueue.analogEnable = [0, 0, 0, 0, 0, 0];
  for (var b = 0; 14 > b; b++) {
    Entry.hw.sendQueue[b] = 0;
  }
  this.ColorPin = [0, 0, 0];
  Entry.hw.update();
}, ColorPin:[0, 0, 0]};
Entry.Roborobo_SchoolKit = {name:"roborobo_schoolkit", pinMode:{INPUT:0, OUTPUT:1, ANALOG:2, PWM:3, SERVO:4}, inputPort:{ir:7, sound:8, contact:9, cds:10}, setZero:function() {
  Entry.hw.sendQueue.initHW_Flag = !0;
  Entry.hw.update();
  Entry.hw.sendQueue.digitalPinMode = [];
  Entry.hw.sendQueue.servo = [!1, !1, !1, !1, !1];
  for (var b = 0; 14 > b; b++) {
    Entry.hw.sendQueue[b] = 0, Entry.hw.sendQueue.digitalPinMode[b] = 0;
  }
  Entry.hw.update();
  Entry.hw.sendQueue.initHW_Flag = !1;
  Entry.hw.update();
}};
Blockly.Blocks.roduino_on_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_on);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_on_block = function(b, c) {
  return "1";
};
Blockly.Blocks.roduino_off_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_off);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_off_block = function(b, c) {
  return "0";
};
Blockly.Blocks.roduino_get_analog_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_get_analog_number = function(b, c) {
  return c.getStringField("PORT");
};
Blockly.Blocks.roduino_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_get_port_number = function(b, c) {
  return c.getStringField("PORT");
};
Blockly.Blocks.roduino_get_analog_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_analog_value_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_analog_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.roduino_get_analog_value = function(b, c) {
  b = parseInt(c.getValue("VALUE", c));
  Entry.hw.sendQueue[0] = Entry.Roborobo_Roduino.INSTRUCTION.ANALOG_READ;
  Entry.hw.sendQueue.analogEnable[b] = 1;
  Entry.hw.update();
  return Entry.hw.getAnalogPortValue(b);
};
Blockly.Blocks.roduino_get_digital_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.roduino_get_digital_value = function(b, c) {
  b = c.getNumberValue("VALUE");
  Entry.hw.sendQueue[0] = Entry.Roborobo_Roduino.INSTRUCTION.DIGITAL_READ;
  Entry.hw.sendQueue[1] = b;
  return Entry.hw.getDigitalPortValue(b - 2);
};
Blockly.Blocks.roduino_get_color = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_color + " ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_color_red, "red"], [Lang.Blocks.roborobo_color_green, "green"], [Lang.Blocks.roborobo_color_blue, "blue"], [Lang.Blocks.roborobo_color_yellow, "yellow"]]), "VALUE").appendField(Lang.Blocks.roborobo_color_detected);
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.roduino_get_color = function(b, c) {
  b = 0;
  c = c.getField("VALUE", c);
  var d = [Entry.hw.portData[Entry.Roborobo_Roduino.ColorPin[0] - 2], Entry.hw.portData[Entry.Roborobo_Roduino.ColorPin[1] - 2], Entry.hw.portData[Entry.Roborobo_Roduino.ColorPin[2] - 2]];
  switch(c) {
    case "red":
      1 == d[0] && 0 == d[1] && 0 == d[2] && (b = 1);
      break;
    case "green":
      0 == d[0] && 1 == d[1] && 0 == d[2] && (b = 1);
      break;
    case "blue":
      0 == d[0] && 0 == d[1] && 1 == d[2] && (b = 1);
      break;
    case "yellow":
      1 == d[0] && 1 == d[1] && 1 == d[2] && (b = 1);
  }
  return b;
};
Blockly.Blocks.roduino_set_digital = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_on, "on"], [Lang.Blocks.roborobo_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.roduino_set_digital = function(b, c) {
  b = c.getNumberValue("VALUE");
  var d = "on" == c.getField("OPERATOR") ? 1 : 0;
  Entry.hw.sendQueue[0] = Entry.Roborobo_Roduino.INSTRUCTION.DIGITAL_WRITE;
  Entry.hw.sendQueue[1] = b;
  Entry.hw.update();
  Entry.hw.setDigitalPortValue(b, d);
  return c.callReturn();
};
Blockly.Blocks.roduino_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor1, "motor1"], [Lang.Blocks.roborobo_motor2, "motor2"]]), "MODE");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor_CW, "cw"], [Lang.Blocks.roborobo_motor_CCW, "ccw"], [Lang.Blocks.roborobo_motor_stop, "stop"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.roduino_motor = function(b, c) {
  pin2 = 0;
  value2 = 0;
  b = c.getField("MODE");
  var d = c.getField("OPERATOR");
  "motor1" == b ? (b = 9, pin2 = 10) : (b = 11, pin2 = 12);
  "cw" == d ? (d = 1, value2 = 0) : "ccw" == d ? (d = 0, value2 = 1) : value2 = d = 0;
  Entry.hw.setDigitalPortValue(b, d);
  Entry.hw.setDigitalPortValue(pin2, value2);
  return c.callReturn();
};
Blockly.Blocks.roduino_set_color_pin = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_color + "R : ");
  this.appendValueInput("RED").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(" G : ");
  this.appendValueInput("GREEN").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(" B : ");
  this.appendValueInput("BLUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.roduino_set_color_pin = function(b, c) {
  b = c.getNumberValue("RED", c);
  var d = c.getNumberValue("GREEN", c), e = c.getNumberValue("BLUE", c);
  Entry.Roborobo_Roduino.ColorPin = [b, d, e];
  Entry.hw.sendQueue[0] = Entry.Roborobo_Roduino.INSTRUCTION.COLOR;
  Entry.hw.sendQueue.colorPin = b;
  Entry.hw.update();
  return c.callReturn();
};
Blockly.Blocks.schoolkit_on_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_on);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_on_block = function(b, c) {
  return "1";
};
Blockly.Blocks.schoolkit_off_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_off);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_off_block = function(b, c) {
  return "0";
};
Blockly.Blocks.schoolkit_get_out_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "2"], ["OUT2", "3"], ["OUT3", "4"], ["OUT4", "5"], ["OUT5", "6"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_get_out_port_number = function(b, c) {
  return c.getNumberField("PORT");
};
Blockly.Blocks.schoolkit_set_output = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_on, "on"], [Lang.Blocks.roborobo_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.schoolkit_set_output = function(b, c) {
  b = c.getNumberValue("VALUE");
  var d = c.getField("OPERATOR");
  Entry.hw.sendQueue.digitalPinMode[b] = Entry.Roborobo_SchoolKit.pinMode.OUTPUT;
  Entry.hw.sendQueue[b] = "on" == d ? 1 : 0;
  return c.callReturn();
};
Blockly.Blocks.schoolkit_get_in_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["IN1", "7"], ["IN2", "8"], ["IN3", "9"], ["IN4", "10"], ["IN5", "11"], ["IN6", "12"], ["IN7", "13"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_get_in_port_number = function(b, c) {
  return c.getNumberField("PORT");
};
Blockly.Blocks.schoolkit_get_input_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.schoolkit_get_input_value = function(b, c) {
  b = c.getNumberValue("VALUE");
  Entry.hw.sendQueue.digitalPinMode[b] = Entry.Roborobo_SchoolKit.pinMode.INPUT;
  Entry.hw.update();
  return Entry.hw.portData[b - 7];
};
Blockly.Blocks.schoolkit_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor1, "motor1"], [Lang.Blocks.roborobo_motor2, "motor2"]]), "MODE");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor_CW, "cw"], [Lang.Blocks.roborobo_motor_CCW, "ccw"], [Lang.Blocks.roborobo_motor_stop, "stop"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.schoolkit_motor = function(b, c) {
  var d = c.getField("MODE");
  b = c.getField("OPERATOR");
  var e = c.getNumberValue("VALUE"), d = "motor1" == d ? 7 : 8;
  255 < e ? e = 255 : 0 > e && (e = 0);
  Entry.hw.sendQueue.digitalPinMode[d] = Entry.Roborobo_SchoolKit.pinMode.PWM;
  Entry.hw.sendQueue.digitalPinMode[d - 7] = Entry.Roborobo_SchoolKit.pinMode.PWM;
  "cw" == b ? (Entry.hw.sendQueue[d] = e, Entry.hw.sendQueue[d - 7] = 0) : "ccw" == b ? (Entry.hw.sendQueue[d] = 0, Entry.hw.sendQueue[d - 7] = e) : "stop" == b && (Entry.hw.sendQueue[d] = 0, Entry.hw.sendQueue[d - 7] = 0);
  return c.callReturn();
};
Blockly.Blocks.schoolkit_set_servo_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_1);
  this.appendValueInput("PIN").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_2);
  this.appendDummyInput().appendField(" : ");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_degree);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.schoolkit_set_servo_value = function(b, c) {
  b = c.getNumberValue("PIN");
  var d = c.getNumberValue("VALUE");
  Entry.hw.sendQueue.digitalPinMode[b] = Entry.Roborobo_SchoolKit.pinMode.PWM;
  0 > d ? d = 0 : 180 < d && (d = 180);
  Entry.hw.sendQueue.servo[b - 2] = !0;
  Entry.hw.sendQueue[b] = d;
  return c.callReturn();
};
Entry.Robotis_carCont = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED:[67, 1], CM_SPRING_RIGHT:[69, 1, 69, 2], CM_SPRING_LEFT:[70, 1, 69, 2], CM_SWITCH:[71, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_IR_LEFT:[91, 2, 91, 4], CM_IR_RIGHT:[93, 2, 91, 4], CM_CALIBRATION_LEFT:[95, 2], CM_CALIBRATION_RIGHT:[97, 2], AUX_MOTOR_SPEED_LEFT:[152, 2], AUX_MOTOR_SPEED_RIGHT:[154, 2]}, setZero:function() {
  Entry.hw.sendQueue.setZero = [1];
  this.update();
  this.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  this.update();
  this.setRobotisData([[Entry.Robotis_carCont.INSTRUCTION.WRITE, 152, 2, 0], [Entry.Robotis_carCont.INSTRUCTION.WRITE, 154, 2, 0]]);
  this.update();
}, name:"robotis_carCont", delay:40, postCallReturn:function(b, c, d) {
  if (0 >= d) {
    return this.setRobotisData(c), this.update(), b.callReturn();
  }
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return this.setRobotisData(null), this.update(), b;
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    this.update();
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  this.setRobotisData(c);
  this.update();
  setTimeout(function() {
    b.timeFlag = 0;
  }, d);
  return b;
}, wait:function(b, c) {
  Entry.hw.socket.send(JSON.stringify(b));
  for (var d = b = (new Date).getTime(); d < b + c;) {
    d = (new Date).getTime();
  }
}, update:function() {
  Entry.hw.update();
  var b = Entry.hw.sendQueue.ROBOTIS_DATA;
  b && b.forEach(function(b) {
    b.send = !0;
  });
  this.setRobotisData(null);
}, filterSendData:function() {
  var b = Entry.hw.sendQueue.ROBOTIS_DATA;
  return b ? b.filter(function(b) {
    return !0 !== b.send;
  }) : null;
}, setRobotisData:function(b) {
  var c = this.filterSendData();
  Entry.hw.sendQueue.ROBOTIS_DATA = null == b ? c : c ? c.concat(b) : b;
}};
Entry.Robotis_openCM70 = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED_R:[79, 1], CM_LED_G:[80, 1], CM_LED_B:[81, 1], CM_BUZZER_INDEX:[84, 1], CM_BUZZER_TIME:[85, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_USER_BUTTON:[26, 1], CM_MOTION:[66, 1], AUX_SERVO_POSITION:[152, 2], AUX_IR:[168, 2], AUX_TOUCH:[202, 1], AUX_TEMPERATURE:[234, 1], AUX_ULTRASONIC:[242, 1], AUX_MAGNETIC:[250, 1], AUX_MOTION_DETECTION:[258, 1], AUX_COLOR:[266, 1], AUX_CUSTOM:[216, 2], AUX_BRIGHTNESS:[288, 
2], AUX_HYDRO_THEMO_HUMIDITY:[274, 1], AUX_HYDRO_THEMO_TEMPER:[282, 1], AUX_SERVO_MODE:[126, 1], AUX_SERVO_SPEED:[136, 2], AUX_MOTOR_SPEED:[136, 2], AUX_LED_MODULE:[210, 1]}, setZero:function() {
  Entry.hw.sendQueue.setZero = [1];
  Entry.Robotis_carCont.update();
  Entry.Robotis_carCont.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  Entry.Robotis_carCont.update();
  Entry.Robotis_carCont.setRobotisData([[Entry.Robotis_openCM70.INSTRUCTION.WRITE, 136, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 138, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 140, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 142, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 144, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 146, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 79, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 80, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 
  81, 1, 0]]);
  Entry.Robotis_carCont.update();
}, name:"robotis_openCM70", delay:15};
Blockly.Blocks.robotis_openCM70_cm_custom_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["BYTE", "BYTE"], ["WORD", "WORD"], ["DWORD", "DWORD"]]), "SIZE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_openCM70_cm_custom_value = function(b, c) {
  b = Entry.Robotis_openCM70.INSTRUCTION.READ;
  var d = 0, e = c.getStringField("SIZE");
  "BYTE" == e ? d = 1 : "WORD" == e ? d = 2 : "DWORD" == e && (d = 4);
  c = c.getNumberValue("VALUE");
  Entry.Robotis_carCont.setRobotisData([[b, c, d, 0, d]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[c];
};
Blockly.Blocks.robotis_openCM70_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, sensorList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"]);
  b.push([Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"]);
  b.push([Lang.Blocks.robotis_cm_user_button, "CM_USER_BUTTON"]);
  return b;
}};
Entry.block.robotis_openCM70_sensor_value = function(b, c) {
  b = Entry.Robotis_openCM70.INSTRUCTION.READ;
  var d = 0, e = 0, f = 0, g = 0;
  c = c.getStringField("SENSOR");
  "CM_SOUND_DETECTED" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : "CM_SOUND_DETECTING" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], 
  e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_USER_BUTTON" == c && (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1]);
  f += 0 * g;
  Entry.Robotis_carCont.setRobotisData([[b, d, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_aux_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.portList()), "PORT");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, portList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_common_port_3, "PORT_3"]);
  b.push([Lang.Blocks.robotis_common_port_4, "PORT_4"]);
  b.push([Lang.Blocks.robotis_common_port_5, "PORT_5"]);
  b.push([Lang.Blocks.robotis_common_port_6, "PORT_6"]);
  return b;
}, sensorList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_aux_servo_position, "AUX_SERVO_POSITION"]);
  b.push([Lang.Blocks.robotis_aux_ir, "AUX_IR"]);
  b.push([Lang.Blocks.robotis_aux_touch, "AUX_TOUCH"]);
  b.push([Lang.Blocks.robotis_aux_brightness, "AUX_BRIGHTNESS"]);
  b.push([Lang.Blocks.robotis_aux_hydro_themo_humidity, "AUX_HYDRO_THEMO_HUMIDITY"]);
  b.push([Lang.Blocks.robotis_aux_hydro_themo_temper, "AUX_HYDRO_THEMO_TEMPER"]);
  b.push([Lang.Blocks.robotis_aux_temperature, "AUX_TEMPERATURE"]);
  b.push([Lang.Blocks.robotis_aux_ultrasonic, "AUX_ULTRASONIC"]);
  b.push([Lang.Blocks.robotis_aux_magnetic, "AUX_MAGNETIC"]);
  b.push([Lang.Blocks.robotis_aux_motion_detection, "AUX_MOTION_DETECTION"]);
  b.push([Lang.Blocks.robotis_aux_color, "AUX_COLOR"]);
  b.push([Lang.Blocks.robotis_aux_custom, "AUX_CUSTOM"]);
  return b;
}};
Entry.block.robotis_openCM70_aux_sensor_value = function(b, c) {
  b = Entry.Robotis_openCM70.INSTRUCTION.READ;
  var d = 0, e = 0, f = 0, g = 0, h = c.getStringField("PORT");
  c = c.getStringField("SENSOR");
  var k = 0;
  "PORT_3" == h ? k = 2 : "PORT_4" == h ? k = 3 : "PORT_5" == h ? k = 4 : "PORT_6" == h && (k = 5);
  "AUX_SERVO_POSITION" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1]) : "AUX_IR" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1]) : 
  "AUX_TOUCH" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1]) : "AUX_TEMPERATURE" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1]) : 
  "AUX_BRIGHTNESS" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1]) : "AUX_HYDRO_THEMO_HUMIDITY" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], 
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1]) : "AUX_HYDRO_THEMO_TEMPER" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1]) : "AUX_ULTRASONIC" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1]) : "AUX_MAGNETIC" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1]) : "AUX_MOTION_DETECTION" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1]) : "AUX_COLOR" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1]) : "AUX_CUSTOM" == c && (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1]);
  f += k * g;
  0 != k && (e = 6 * g);
  Entry.Robotis_carCont.setRobotisData([[b, d, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_index = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_index);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.note_a + "(0)", "0"], [Lang.General.note_a + "#(1)", "1"], [Lang.General.note_b + "(2)", "2"], [Lang.General.note_c + "(3)", "3"], [Lang.General.note_c + "#(4)", "4"], [Lang.General.note_d + "(5)", "5"], [Lang.General.note_d + "#(6)", "6"], [Lang.General.note_e + "(7)", "7"], [Lang.General.note_f + "(8)", "8"], [Lang.General.note_f + "#(9)", "9"], [Lang.General.note_g + "(10)", "10"], [Lang.General.note_g + "#(11)", "11"], 
  [Lang.General.note_a + "(12)", "12"], [Lang.General.note_a + "#(13)", "13"], [Lang.General.note_b + "(14)", "14"], [Lang.General.note_c + "(15)", "15"], [Lang.General.note_c + "#(16)", "16"], [Lang.General.note_d + "(17)", "17"], [Lang.General.note_d + "#(18)", "18"], [Lang.General.note_e + "(19)", "19"], [Lang.General.note_f + "(20)", "20"], [Lang.General.note_f + "#(21)", "21"], [Lang.General.note_g + "(22)", "22"], [Lang.General.note_g + "#(23)", "23"], [Lang.General.note_a + "(24)", "24"], 
  [Lang.General.note_a + "#(25)", "25"], [Lang.General.note_b + "(26)", "26"], [Lang.General.note_c + "(27)", "27"], [Lang.General.note_c + "#(28)", "28"], [Lang.General.note_d + "(29)", "29"], [Lang.General.note_d + "#(30)", "30"], [Lang.General.note_e + "(31)", "31"], [Lang.General.note_f + "(32)", "32"], [Lang.General.note_f + "#(33)", "33"], [Lang.General.note_g + "(34)", "34"], [Lang.General.note_g + "#(35)", "35"], [Lang.General.note_a + "(36)", "36"], [Lang.General.note_a + "#(37)", "37"], 
  [Lang.General.note_b + "(38)", "38"], [Lang.General.note_c + "(39)", "39"], [Lang.General.note_c + "#(40)", "40"], [Lang.General.note_d + "(41)", "41"], [Lang.General.note_d + "#(42)", "42"], [Lang.General.note_e + "(43)", "43"], [Lang.General.note_f + "(44)", "44"], [Lang.General.note_f + "#(45)", "45"], [Lang.General.note_g + "(46)", "46"], [Lang.General.note_g + "#(47)", "47"], [Lang.General.note_a + "(48)", "48"], [Lang.General.note_a + "#(49)", "49"], [Lang.General.note_b + "(50)", "50"], 
  [Lang.General.note_c + "(51)", "51"]]), "CM_BUZZER_INDEX").appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("CM_BUZZER_TIME").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3).appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_index = function(b, c) {
  b = c.getField("CM_BUZZER_INDEX", c);
  var d = c.getNumberValue("CM_BUZZER_TIME", c), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0];
  var g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1];
  var h = parseInt(10 * d);
  50 < h && (h = 50);
  return Entry.Robotis_carCont.postCallReturn(c, [[e, f, g, h], [e, Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1], b]], 1000 * d);
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_melody = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_melody);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"], ["20", "20"], ["21", "21"], ["22", "22"], ["23", "23"], ["24", "24"]]), "CM_BUZZER_MELODY");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_melody = function(b, c) {
  b = c.getField("CM_BUZZER_MELODY", c);
  var d = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0];
  return Entry.Robotis_carCont.postCallReturn(c, [[d, e, Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], 255], [d, Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1], b]], 1000);
};
Blockly.Blocks.robotis_openCM70_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_sound_detected_clear = function(b, c) {
  return Entry.Robotis_carCont.postCallReturn(c, [[Entry.Robotis_openCM70.INSTRUCTION.WRITE, Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1], 0]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_red_color, "CM_LED_R"], [Lang.Blocks.robotis_common_green_color, "CM_LED_G"], [Lang.Blocks.robotis_common_blue_color, "CM_LED_B"]]), "CM_LED").appendField("LED").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_led = function(b, c) {
  b = c.getField("CM_LED", c);
  var d = c.getField("VALUE", c), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0;
  "CM_LED_R" == b ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[1]) : "CM_LED_G" == b ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[1]) : "CM_LED_B" == b && (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[1]);
  return Entry.Robotis_carCont.postCallReturn(c, [[e, f, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_motion = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_motion);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_motion).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_motion = function(b, c) {
  b = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[0];
  var e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[1];
  var f = c.getNumberValue("VALUE", c);
  return Entry.Robotis_carCont.postCallReturn(c, [[b, d, e, f]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_1, "1"], [Lang.Blocks.robotis_common_port_2, "2"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_motor_speed = function(b, c) {
  b = c.getField("PORT", c);
  var d = c.getField("DIRECTION_ANGLE", c), e = c.getNumberValue("VALUE"), f = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[0];
  var h = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[1];
  "CW" == d ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(c, [[f, g + (b - 1) * h, h, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_mode = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_mode_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_wheel_mode, "0"], [Lang.Blocks.robotis_common_joint_mode, "1"]]), "MODE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_mode = function(b, c) {
  b = c.getField("PORT", c);
  var d = c.getField("MODE", c), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[0];
  var g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[1];
  return Entry.Robotis_carCont.postCallReturn(c, [[e, f + (b - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_speed = function(b, c) {
  b = c.getField("PORT", c);
  var d = c.getField("DIRECTION_ANGLE", c), e = c.getNumberValue("VALUE"), f = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[0];
  var h = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[1];
  "CW" == d ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(c, [[f, g + (b - 1) * h, h, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_position = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_position_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_position = function(b, c) {
  b = c.getField("PORT", c);
  var d = c.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0];
  var g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1];
  1023 < d ? d = 1023 : 0 > d && (d = 0);
  return Entry.Robotis_carCont.postCallReturn(c, [[e, f + (b - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_led_module = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_led_module_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_off, "0"], [Lang.Blocks.robotis_cm_led_right + Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_cm_led_left + 
  Lang.Blocks.robotis_common_on, "2"], [Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_on, "3"]]), "LED_MODULE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_led_module = function(b, c) {
  b = c.getField("PORT", c);
  var d = c.getField("LED_MODULE", c), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[0];
  var g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[1];
  return Entry.Robotis_carCont.postCallReturn(c, [[e, f + (b - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_custom_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_custom = function(b, c) {
  b = c.getField("PORT", c);
  var d = c.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0];
  var g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1];
  return Entry.Robotis_carCont.postCallReturn(c, [[e, f + (b - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("ADDRESS").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_case_01);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_custom = function(b, c) {
  b = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var d = c.getNumberValue("ADDRESS");
  var e = c.getNumberValue("VALUE");
  return Entry.Robotis_carCont.postCallReturn(c, [[b, d, 65535 < e ? 4 : 255 < e ? 2 : 1, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_carCont_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_spring_left, "CM_SPRING_LEFT"], [Lang.Blocks.robotis_cm_spring_right, "CM_SPRING_RIGHT"], [Lang.Blocks.robotis_cm_switch, "CM_SWITCH"], [Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"], [Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"], [Lang.Blocks.robotis_cm_ir_left, "CM_IR_LEFT"], [Lang.Blocks.robotis_cm_ir_right, "CM_IR_RIGHT"], [Lang.Blocks.robotis_cm_calibration_left, 
  "CM_CALIBRATION_LEFT"], [Lang.Blocks.robotis_cm_calibration_right, "CM_CALIBRATION_RIGHT"]]), "SENSOR").appendField(" ").appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_carCont_sensor_value = function(b, c) {
  b = Entry.Robotis_carCont.INSTRUCTION.READ;
  var d = 0, e = 0, f = 0, g = 0;
  c = c.getStringField("SENSOR");
  "CM_SPRING_LEFT" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[3]) : "CM_SPRING_RIGHT" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[3]) : 
  "CM_SWITCH" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1]) : "CM_SOUND_DETECTED" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : 
  "CM_SOUND_DETECTING" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_IR_LEFT" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[3]) : 
  "CM_IR_RIGHT" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[3]) : "CM_CALIBRATION_LEFT" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : 
  "CM_CALIBRATION_RIGHT" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]) : "CM_BUTTON_STATUS" == c && (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], 
  e = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1]);
  Entry.Robotis_carCont.setRobotisData([[b, d, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_carCont_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_led_4).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_LEFT").appendField(", ").appendField(Lang.Blocks.robotis_cm_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_RIGHT").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_led = function(b, c) {
  b = c.getField("VALUE_LEFT", c);
  var d = c.getField("VALUE_RIGHT", c), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f = 0;
  var g = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[0];
  var h = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[1];
  1 == b && 1 == d ? f = 9 : 1 == b && 0 == d && (f = 8);
  0 == b && 1 == d && (f = 1);
  return Entry.Robotis_carCont.postCallReturn(c, [[e, g, h, f]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_sound_detected_clear = function(b, c) {
  return Entry.Robotis_carCont.postCallReturn(c, [[Entry.Robotis_carCont.INSTRUCTION.WRITE, Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1], 0]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_aux_motor_speed = function(b, c) {
  var d = c.getField("DIRECTION", c);
  b = c.getField("DIRECTION_ANGLE", c);
  var e = c.getNumberValue("VALUE"), f = Entry.Robotis_carCont.INSTRUCTION.WRITE;
  if ("LEFT" == d) {
    d = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[0];
    var g = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[1];
  } else {
    d = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[1];
  }
  "CW" == b ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(c, [[f, d, g, e]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_calibration = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_calibration_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_calibration = function(b, c) {
  var d = c.getField("DIRECTION", c);
  b = c.getNumberValue("VALUE");
  var e = Entry.Robotis_carCont.INSTRUCTION.WRITE;
  if ("LEFT" == d) {
    d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0];
    var f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1];
  } else {
    d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1];
  }
  return Entry.Robotis_carCont.postCallReturn(c, [[e, d, f, b]], Entry.Robotis_carCont.delay);
};
Entry.robotori = {PORT_MAP:{A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, D2:0, D3:0, D10:0, D11:0, D12:0, D13:0, AOUT5:0, AOUT6:0, AOUT9:0, SERVO:90, rightMotor:0, leftMotor:0}, setZero:function() {
  var b = Entry.robotori.PORT_MAP, c = Entry.hw.sendQueue, d;
  for (d in b) {
    c[d] = b[d];
  }
  Entry.hw.update();
}, name:"robotori", monitorTemplate:{imgPath:"hw/robotori.png", width:395, height:372, listPorts:{A0:{name:"A0", type:"input", pos:{x:0, y:0}}, A1:{name:"A1", type:"input", pos:{x:0, y:0}}, A2:{name:"A2", type:"input", pos:{x:0, y:0}}, A3:{name:"A3", type:"input", pos:{x:0, y:0}}, A4:{name:"A4", type:"input", pos:{x:0, y:0}}, A5:{name:"A5", type:"input", pos:{x:0, y:0}}, D2:{name:"D2", type:"input", pos:{x:0, y:0}}, D3:{name:"D3", type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Blockly.Blocks.robotori_digitalInput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotori_D2_Input, "D2"], [Lang.Blocks.robotori_D3_Input, "D3"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.robotori_digitalInput = function(b, c) {
  b = Entry.hw.portData;
  c = c.getField("DEVICE");
  return b[c];
};
Blockly.Blocks.robotori_digitalOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Digital Out").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotori_D10_Output, "D10"], [Lang.Blocks.robotori_D11_Output, "D11"], [Lang.Blocks.robotori_D12_Output, "D12"], [Lang.Blocks.robotori_D13_Output, "D13"]]), "DEVICE").appendField("pin").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotori_On, "ON"], [Lang.Blocks.robotori_Off, "OFF"]]), "VALUE");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotori_digitalOutput = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getStringField("DEVICE", c), e = c.getStringField("VALUE", c);
  b.D10 = "D10" == d && "ON" == e ? 1 : 0;
  b.D11 = "D11" == d && "ON" == e ? 1 : 0;
  b.D12 = "D12" == d && "ON" == e ? 1 : 0;
  b.D13 = "D13" == d && "ON" == e ? 1 : 0;
  return c.callReturn();
};
Blockly.Blocks.robotori_analogInput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotori_A0_Input, "A0"], [Lang.Blocks.robotori_A1_Input, "A1"], [Lang.Blocks.robotori_A2_Input, "A2"], [Lang.Blocks.robotori_A3_Input, "A3"], [Lang.Blocks.robotori_A4_Input, "A4"], [Lang.Blocks.robotori_A5_Input, "A5"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.robotori_analogInput = function(b, c) {
  b = Entry.hw.portData;
  c = c.getField("DEVICE");
  return b[c];
};
Blockly.Blocks.robotori_analogOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotori_analog).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotori_analog5, "AOUT5"], [Lang.Blocks.robotori_analog6, "AOUT6"], [Lang.Blocks.robotori_analog9, "AOUT9"]]), "DEVICE").appendField(Lang.Blocks.robotori_pin_OutputValue);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotori_analogOutput = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getStringField("DEVICE", c), e = c.getNumberValue("VALUE", c);
  "AOUT5" == d && (b.AOUT5 = e);
  "AOUT6" == d && (b.AOUT6 = e);
  "AOUT9" == d && (b.AOUT9 = e);
  return c.callReturn();
};
Blockly.Blocks.robotori_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotori_Servo);
  this.appendValueInput("SERVO").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotori_servo = function(b, c) {
  Entry.hw.sendQueue.SERVO = c.getNumberValue("SERVO");
  return c.callReturn();
};
Blockly.Blocks.robotori_dc_direction = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotori_DC).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotori_DC_rightmotor, "RIGHT_MOTOR"], [Lang.Blocks.robotori_DC_leftmotor, "LEFT_MOTOR"]]), "DEVICE").appendField(Lang.Blocks.robotori_DC_select).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotori_DC_STOP, "STOP"], [Lang.Blocks.robotori_DC_CW, "CW"], [Lang.Blocks.robotori_DC_CCW, "CCW"]]), "VALUE");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotori_dc_direction = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getStringField("DEVICE", c), e = c.getStringField("VALUE", c);
  "RIGHT_MOTOR" == d && ("STOP" == e ? b.RIGHT_MOTOR = 255 : "CW" == e ? b.RIGHT_MOTOR = 0 : "CCW" == e && (b.RIGHT_MOTOR = 180));
  "LEFT_MOTOR" == d && ("STOP" == e ? b.LEFT_MOTOR = 255 : "CW" == e ? b.LEFT_MOTOR = 0 : "CCW" == e && (b.LEFT_MOTOR = 180));
  return c.callReturn();
};
Entry.Event = function(b) {
  this._sender = b;
  this._listeners = [];
};
(function(b) {
  b.attach = function(b, d) {
    var c = this;
    b = {obj:b, fn:d, destroy:function() {
      c.detach(this);
    }};
    this._listeners.push(b);
    return b;
  };
  b.detach = function(b) {
    var c = this._listeners;
    b = c.indexOf(b);
    if (-1 < b) {
      return c.splice(b, 1);
    }
  };
  b.clear = function() {
    for (var b = this._listeners; b.length;) {
      b.pop();
    }
  };
  b.notify = function() {
    var b = arguments;
    this._listeners.slice().forEach(function(c) {
      c.fn.apply(c.obj, b);
    });
  };
})(Entry.Event.prototype);
Entry.Xbot = {PORT_MAP:{rightWheel:0, leftWheel:0, head:90, armR:90, armL:90, analogD5:127, analogD6:127, D4:0, D7:0, D12:0, D13:0, ledR:0, ledG:0, ledB:0, lcdNum:0, lcdTxt:"                ", note:262, duration:0}, setZero:function() {
  var b = Entry.Xbot.PORT_MAP, c = Entry.hw.sendQueue, d;
  for (d in b) {
    c[d] = b[d];
  }
  Entry.hw.update();
  Entry.Xbot.removeAllTimeouts();
}, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var c = this.timeouts;
  b = c.indexOf(b);
  0 <= b && c.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, c;
  for (c in b) {
    clearTimeout(b[c]);
  }
  this.timeouts = [];
}, name:"xbot_epor_edge"};
Blockly.Blocks.xbot_digitalInput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_D2_digitalInput, "D2"], [Lang.Blocks.XBOT_D3_digitalInput, "D3"], [Lang.Blocks.XBOT_D11_digitalInput, "D11"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.xbot_digitalInput = function(b, c) {
  b = Entry.hw.portData;
  c = c.getField("DEVICE");
  return b[c];
};
Blockly.Blocks.xbot_analogValue = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_CDS, "light"], [Lang.Blocks.XBOT_MIC, "mic"], [Lang.Blocks.XBOT_analog0, "adc0"], [Lang.Blocks.XBOT_analog1, "adc1"], [Lang.Blocks.XBOT_analog2, "adc2"], [Lang.Blocks.XBOT_analog3, "adc3"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.xbot_analogValue = function(b, c) {
  b = Entry.hw.portData;
  c = c.getField("DEVICE");
  return b[c];
};
Blockly.Blocks.xbot_digitalOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_digital).appendField(new Blockly.FieldDropdown([["LED", "D13"], ["D4", "D4"], ["D7", "D7"], ["D12 ", "D12"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_OutputValue).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_High, "HIGH"], [Lang.Blocks.XBOT_Low, "LOW"]]), "VALUE");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_digitalOutput = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getStringField("DEVICE", c), e = c.getStringField("VALUE", c);
  b.D13 = "D13" == d && "HIGH" == e ? 1 : 0;
  b.D4 = "D4" == d && "HIGH" == e ? 1 : 0;
  b.D7 = "D7" == d && "HIGH" == e ? 1 : 0;
  b.D12 = "D12" == d && "HIGH" == e ? 1 : 0;
  return c.callReturn();
};
Blockly.Blocks.xbot_analogOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_analog).appendField(new Blockly.FieldDropdown([["D5", "analogD5"], ["D6", "analogD6"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_Output_Value);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_analogOutput = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getStringField("DEVICE", c), e = c.getNumberValue("VALUE", c);
  "analogD5" == d ? b.analogD5 = e : "analogD6" == d && (b.analogD6 = e);
  return c.callReturn();
};
Blockly.Blocks.xbot_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_Servo).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_Head, "head"], [Lang.Blocks.XBOT_ArmR, "right"], [Lang.Blocks.XBOT_ArmL, "left"]]), "DEVICE").appendField(Lang.Blocks.XBOT_angle);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_servo = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getStringField("DEVICE", c), e = c.getNumberValue("VALUE", c);
  "head" == d ? b.head = e : "right" == d ? b.armR = e : "left" == d && (b.armL = e);
  return c.callReturn();
};
Blockly.Blocks.xbot_oneWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_DC).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_rightWheel, "rightWheel"], [Lang.Blocks.XBOT_leftWheel, "leftWheel"], [Lang.Blocks.XBOT_bothWheel, "bothWheel"]]), "DEVICE").appendField(Lang.Blocks.XBOT_speed);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_oneWheel = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getStringField("DEVICE", c), e = c.getNumberValue("VALUE", c);
  "rightWheel" == d ? b.rightWheel = e : "leftWheel" == d ? b.leftWheel = e : b.rightWheel = b.leftWheel = e;
  return c.callReturn();
};
Blockly.Blocks.xbot_twoWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_rightSpeed);
  this.appendValueInput("rightWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_leftSpeed);
  this.appendValueInput("leftWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_twoWheel = function(b, c) {
  b = Entry.hw.sendQueue;
  b.rightWheel = c.getNumberValue("rightWheel");
  b.leftWheel = c.getNumberValue("leftWheel");
  return c.callReturn();
};
Blockly.Blocks.xbot_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_R);
  this.appendValueInput("ledR").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_G);
  this.appendValueInput("ledG").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_B);
  this.appendValueInput("ledB").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb = function(b, c) {
  b = Entry.hw.sendQueue;
  b.ledR = c.getNumberValue("ledR");
  b.ledG = c.getNumberValue("ledG");
  b.ledB = c.getNumberValue("ledB");
  return c.callReturn();
};
Blockly.Blocks.xbot_rgb_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_color).appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField(Lang.Blocks.XBOT_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb_picker = function(b, c) {
  b = c.getStringField("VALUE");
  var d = Entry.hw.sendQueue;
  d.ledR = parseInt(0.3 * parseInt(b.substr(1, 2), 16));
  d.ledG = parseInt(0.3 * parseInt(b.substr(3, 2), 16));
  d.ledB = parseInt(0.3 * parseInt(b.substr(5, 2), 16));
  return c.callReturn();
};
Blockly.Blocks.xbot_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_c, "C"], [Lang.Blocks.XBOT_d, "D"], [Lang.Blocks.XBOT_e, "E"], [Lang.Blocks.XBOT_f, "F"], [Lang.Blocks.XBOT_g, "G"], [Lang.Blocks.XBOT_a, "A"], [Lang.Blocks.XBOT_b, "B"]]), "NOTE").appendField(" ").appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_melody_ms).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_buzzer = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getStringField("NOTE", c), e = c.getStringField("OCTAVE", c), f = c.getNumberValue("VALUE", c), d = d + e;
  b.note = "C2" == d ? 65 : "D2" == d ? 73 : "E2" == d ? 82 : "F2" == d ? 87 : "G2" == d ? 98 : "A2" == d ? 110 : "B2" == d ? 123 : "C3" == d ? 131 : "D3" == d ? 147 : "E3" == d ? 165 : "F3" == d ? 175 : "G3" == d ? 196 : "A3" == d ? 220 : "B3" == d ? 247 : "C4" == d ? 262 : "D4" == d ? 294 : "E4" == d ? 330 : "F4" == d ? 349 : "G4" == d ? 392 : "A4" == d ? 440 : "B4" == d ? 494 : "C5" == d ? 523 : "D5" == d ? 587 : "E5" == d ? 659 : "F5" == d ? 698 : "G5" == d ? 784 : "A5" == d ? 880 : "B5" == d ? 
  988 : "C6" == d ? 1047 : "D6" == d ? 1175 : "E6" == d ? 1319 : "F6" == d ? 1397 : "G6" == d ? 1568 : "A6" == d ? 1760 : "B6" == d ? 1976 : "C7" == d ? 2093 : "D7" == d ? 2349 : "E7" == d ? 2637 : "F7" == d ? 2794 : "G7" == d ? 3136 : "A7" == d ? 3520 : "B7" == d ? 3951 : 262;
  b.duration = 40 * f;
  return c.callReturn();
};
Blockly.Blocks.xbot_lcd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("LCD").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"]]), "LINE").appendField(Lang.Blocks.XBOT_Line).appendField(", ").appendField(Lang.Blocks.XBOT_outputValue);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_lcd = function(b, c) {
  b = Entry.hw.sendQueue;
  var d = c.getNumberField("LINE", c), e = c.getStringValue("VALUE", c);
  0 == d ? (b.lcdNum = 0, b.lcdTxt = e) : 1 == d && (b.lcdNum = 1, b.lcdTxt = e);
  return c.callReturn();
};
Entry.Collection = function(b) {
  this.length = 0;
  this._hashMap = {};
  this._observers = [];
  this.set(b);
};
(function(b, c) {
  b.set = function(b) {
    for (; this.length;) {
      c.pop.call(this);
    }
    var d = this._hashMap;
    for (f in d) {
      delete d[f];
    }
    if (void 0 !== b) {
      var f = 0;
      for (var g = b.length; f < g; f++) {
        var h = b[f];
        d[h.id] = h;
        c.push.call(this, h);
      }
    }
  };
  b.push = function(b) {
    this._hashMap[b.id] = b;
    c.push.call(this, b);
  };
  b.unshift = function() {
    for (var b = Array.prototype.slice.call(arguments, 0), e = this._hashMap, f = b.length - 1; 0 <= f; f--) {
      var g = b[f];
      c.unshift.call(this, g);
      e[g.id] = g;
    }
  };
  b.insert = function(b, e) {
    c.splice.call(this, e, 0, b);
    this._hashMap[b.id] = b;
  };
  b.has = function(b) {
    return !!this._hashMap[b];
  };
  b.get = function(b) {
    return this._hashMap[b];
  };
  b.at = function(b) {
    return this[b];
  };
  b.getAll = function() {
    for (var b = this.length, c = [], f = 0; f < b; f++) {
      c.push(this[f]);
    }
    return c;
  };
  b.indexOf = function(b) {
    return c.indexOf.call(this, b);
  };
  b.find = function(b) {
    for (var c = [], d, g = 0, h = this.length; g < h; g++) {
      d = !0;
      var k = this[g], l;
      for (l in b) {
        if (b[l] != k[l]) {
          d = !1;
          break;
        }
      }
      d && c.push(k);
    }
    return c;
  };
  b.pop = function() {
    var b = c.pop.call(this);
    delete this._hashMap[b.id];
    return b;
  };
  b.shift = function() {
    var b = c.shift.call(this);
    delete this._hashMap[b.id];
    return b;
  };
  b.slice = function(b, e) {
    b = c.slice.call(this, b, e);
    e = this._hashMap;
    for (var d in b) {
      delete e[b[d].id];
    }
    return b;
  };
  b.remove = function(b) {
    var c = this.indexOf(b);
    -1 < c && (delete this._hashMap[b.id], this.splice(c, 1));
  };
  b.splice = function(b, e) {
    var d = c.slice.call(arguments, 2), g = this._hashMap;
    e = void 0 === e ? this.length - b : e;
    for (var h = c.splice.call(this, b, e), k = 0, l = h.length; k < l; k++) {
      delete g[h[k].id];
    }
    k = 0;
    for (l = d.length; k < l; k++) {
      g = d[k], c.splice.call(this, b++, 0, g), this._hashMap[g.id] = g;
    }
    return h;
  };
  b.clear = function() {
    for (; this.length;) {
      c.pop.call(this);
    }
    this._hashMap = {};
  };
  b.map = function(b, c) {
    for (var d = [], e = 0, h = this.length; e < h; e++) {
      d.push(b(this[e], c));
    }
    return d;
  };
  b.moveFromTo = function(b, e) {
    var d = this.length - 1;
    0 > b || 0 > e || b > d || e > d || c.splice.call(this, e, 0, c.splice.call(this, b, 1)[0]);
  };
  b.sort = function() {
  };
  b.fromJSON = function() {
  };
  b.toJSON = function() {
    for (var b = [], c = 0, f = this.length; c < f; c++) {
      b.push(this[c].toJSON());
    }
    return b;
  };
  b.observe = function() {
  };
  b.unobserve = function() {
  };
  b.notify = function() {
  };
  b.destroy = function() {
  };
})(Entry.Collection.prototype, Array.prototype);
Entry.Model = function(b, c) {
  var d = Entry.Model;
  d.generateSchema(b);
  d.generateSetter(b);
  d.generateObserve(b);
  (void 0 === c || c) && Object.seal(b);
  return b;
};
(function(b) {
  b.generateSchema = function(b) {
    var c = b.schema;
    if (void 0 !== c) {
      c = JSON.parse(JSON.stringify(c));
      b.data = {};
      for (var e in c) {
        (function(d) {
          b.data[d] = c[d];
          Object.defineProperty(b, d, {get:function() {
            return b.data[d];
          }});
        })(e);
      }
      b._toJSON = this._toJSON;
    }
  };
  b.generateSetter = function(b) {
    b.set = this.set;
  };
  b.set = function(b, d) {
    var c = {}, f;
    for (f in this.data) {
      void 0 !== b[f] && (b[f] === this.data[f] ? delete b[f] : (c[f] = this.data[f], this.data[f] = b[f] instanceof Array ? b[f].concat() : b[f]));
    }
    d || this.notify(Object.keys(b), c);
  };
  b.generateObserve = function(b) {
    b.observers = [];
    b.observe = this.observe;
    b.unobserve = this.unobserve;
    b.notify = this.notify;
  };
  b.observe = function(b, d, e, f) {
    e = new Entry.Observer(this.observers, b, d, e);
    if (!1 !== f) {
      b[d]([]);
    }
    return e;
  };
  b.unobserve = function(b) {
    b.destroy();
  };
  b.notify = function(b, d) {
    "string" === typeof b && (b = [b]);
    var c = this;
    c.observers.map(function(e) {
      var f = b;
      void 0 !== e.attrs && (f = Entry.Utils.intersectArray(e.attrs, b));
      if (f.length) {
        e.object[e.funcName](f.map(function(b) {
          return {name:b, object:c, oldValue:d[b]};
        }));
      }
    });
  };
  b._toJSON = function() {
    var b = {}, d;
    for (d in this.data) {
      b[d] = this.data[d];
    }
    return b;
  };
})(Entry.Model);
Entry.Observer = function(b, c, d, e) {
  this.parent = b;
  this.object = c;
  this.funcName = d;
  this.attrs = e;
  b.push(this);
};
(function(b) {
  b.destroy = function() {
    var b = this.parent, d = b.indexOf(this);
    -1 < d && b.splice(d, 1);
    return this;
  };
})(Entry.Observer.prototype);
Entry.Command = {};
(function(b) {
  b[Entry.STATIC.COMMAND_TYPES.do] = {recordable:Entry.STATIC.RECORDABLE.SKIP, log:function(b) {
    return [];
  }, skipUndoStack:!0};
  b[Entry.STATIC.COMMAND_TYPES.undo] = {recordable:Entry.STATIC.RECORDABLE.SKIP, log:function(b) {
    return [];
  }, skipUndoStack:!0};
  b[Entry.STATIC.COMMAND_TYPES.redo] = {recordable:Entry.STATIC.RECORDABLE.SKIP, log:function(b) {
    return [];
  }, skipUndoStack:!0};
})(Entry.Command);
Entry.Commander = function(b) {
  if ("workspace" == b || "phone" == b) {
    Entry.stateManager = new Entry.StateManager;
  }
  Entry.do = this.do.bind(this);
  Entry.undo = this.undo.bind(this);
  this.editor = {};
  this.reporters = [];
  this._tempStorage = null;
  Entry.Command.editor = this.editor;
  this.doEvent = new Entry.Event(this);
  this.logEvent = new Entry.Event(this);
  this.doCommandAll = Entry.doCommandAll;
};
(function(b) {
  b.do = function(b) {
    "string" === typeof b && (b = Entry.STATIC.COMMAND_TYPES[b]);
    var c = Array.prototype.slice.call(arguments);
    c.shift();
    this.report(Entry.STATIC.COMMAND_TYPES.do);
    this.report(b, c);
    var e = Entry.Command[b], f, g = !0 === e.skipUndoStack || !this.doCommandAll && 500 < b;
    Entry.stateManager && !g && (f = Entry.stateManager.addCommand.apply(Entry.stateManager, [b, this, this.do, e.undo].concat(e.state.apply(this, c))));
    e = Entry.Command[b].do.apply(this, c);
    this.doEvent.notify(b, c);
    var h = f ? f.id : null;
    return {value:e, isPass:function(b, c) {
      this.isPassById(h, b, c);
    }.bind(this)};
  };
  b.undo = function() {
    var b = Array.prototype.slice.call(arguments), d = b.shift(), e = Entry.Command[d];
    this.report(Entry.STATIC.COMMAND_TYPES.undo);
    var f = Entry.Command[d], g;
    Entry.stateManager && !0 !== f.skipUndoStack && (g = Entry.stateManager.addCommand.apply(Entry.stateManager, [d, this, this.do, e.undo].concat(e.state.apply(this, b))));
    return {value:Entry.Command[d].do.apply(this, b), isPass:function(b) {
      this.isPassById(g.id, b);
    }.bind(this)};
  };
  b.redo = function() {
    var b = Array.prototype.slice.call(arguments), d = b.shift(), e = Entry.Command[d];
    this.report(Entry.STATIC.COMMAND_TYPES.redo);
    var f = Entry.Command[d];
    Entry.stateManager && !0 !== f.skipUndoStack && Entry.stateManager.addCommand.apply(Entry.stateManager, [d, this, this.undo, d].concat(e.state.apply(null, b)));
    e.undo.apply(this, b);
  };
  b.setCurrentEditor = function(b, d) {
    this.editor[b] = d;
  };
  b.isPass = function(b) {
    if (Entry.stateManager) {
      b = void 0 === b ? !0 : b;
      var c = Entry.stateManager.getLastCommand();
      c && (c.isPass = b);
    }
  };
  b.isPassById = function(b, d, e) {
    b && Entry.stateManager && (d = void 0 === d ? !0 : d, b = Entry.stateManager.getLastCommandById(b)) && (b.isPass = d, e && (b.skipCount = !!e));
  };
  b.addReporter = function(b) {
    b.logEventListener = this.logEvent.attach(b, b.add);
  };
  b.removeReporter = function(b) {
    b.logEventListener && this.logEvent.detatch(b.logEventListener);
    delete b.logEventListener;
  };
  b.report = function(b, d) {
    d = b && Entry.Command[b] && Entry.Command[b].log ? Entry.Command[b].log.apply(this, d) : d;
    d.unshift(b);
    this.logEvent.notify(d);
  };
  b.applyOption = function() {
    this.doCommandAll = Entry.doCommandAll;
  };
})(Entry.Commander.prototype);
(function(b) {
  b[Entry.STATIC.COMMAND_TYPES.containerSelectObject] = {do:function(b) {
    Entry.container.selectObject(b);
  }, state:function(b) {
    return [Entry.playground.object.id, b];
  }, log:function(b) {
    return [["objectId", b], ["objectIndex", Entry.container.getObjectIndex(b)]];
  }, undo:"containerSelectObject", recordable:Entry.STATIC.RECORDABLE.SUPPORT, dom:["container", "objectIndex", "&1"]};
})(Entry.Command);
(function(b) {
  function c(c, d, e) {
    b[c] = Entry.cloneSimpleObject(b[d]);
    e && e instanceof Array && e.forEach(function(d) {
      b[c][d[0]] = d[1];
    });
    return b[c];
  }
  var d = Entry.STATIC.COMMAND_TYPES;
  b[d.addThread] = {do:function(b, c) {
    return this.editor.board.code.createThread(b, c);
  }, state:function(b, c) {
    if (void 0 === c || null === c) {
      c = this.editor.board.code.getThreadCount();
    }
    return [c];
  }, log:function(b, c) {
    b instanceof Entry.Thread && (b = b.toJSON());
    return [["blocks", b], ["index", c]];
  }, undo:"destroyThread", recordable:Entry.STATIC.RECORDABLE.SUPPORT, validate:!1, dom:["playground", "blockMenu", "&0"]};
  var e = Entry.cloneSimpleObject(b[d.addThread]);
  e.showMe = function(b) {
    if (!b.isTooltipFaded()) {
      b.fadeOutTooltip();
      var c = Entry.getDom(b.processDomQuery(this.dom)), e = b.requestNextData().content, e = Entry.getDom(b.processDomQuery(e[0] === d.moveBlockFromBlockMenu ? ["playground", "board", "coord", "&1", "&2"] : ["playground", "board", "&1", "magnet", "next", 0], e)).getBoundingClientRect();
      Entry.Utils.glideBlock(c, e.left, e.top, function() {
        b.fadeInTooltip();
      });
    }
  };
  e.followCmd = !0;
  e.restrict = function(b, c, d, e) {
    e = e.requestNextData().content;
    e[0] === Entry.STATIC.COMMAND_TYPES.insertBlockFromBlockMenu && Entry.Command.editor.board.scrollToPointer(e[2][1]);
    return new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {dimmed:!0, restrict:!0, callBack:d});
  };
  b[d.addThreadFromBlockMenu] = e;
  b[d.destroyThread] = {do:function(b) {
    b instanceof Entry.Thread || (b = this.editor.board.code.getThread(b));
    b.getFirstBlock().destroy(!0, !0);
  }, state:function(b) {
    b instanceof Entry.Thread || (b = this.editor.board.code.getThread(b));
    var c = this.editor.board.code.getThreadIndex(b);
    return [b.toJSON(), c];
  }, log:function(b) {
    b instanceof Entry.Thread && (b = this.editor.board.code.getThreadIndex(b));
    return [["index", b]];
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, restrict:function(b, c, d) {
    d();
  }, validate:!1, undo:"addThread"};
  b[d.destroyBlock] = {do:function(b) {
    b = this.editor.board.findBlock(b);
    b.destroy(!0);
  }, state:function(b) {
    var c = !1;
    b = this.editor.board.findBlock(b);
    var d = b.targetPointer(), e = b.toJSON();
    3 === d.length && (1 === b.thread.getCount() ? c = !0 : d.push(-1));
    "output" === b.getBlockType() && (e.params[1] = void 0);
    return [e, d, c];
  }, log:function(b) {
    b = this.editor.board.findBlock(b);
    return [["block", b.pointer ? b.pointer() : b]];
  }, undo:"recoverBlock"};
  b[d.recoverBlock] = {do:function(b, c, d) {
    if (d) {
      return this.editor.board.code.createThread([b], c[2]);
    }
    b = this.editor.board.code.createThread([b]).getFirstBlock();
    this.editor.board.insert(b, c);
  }, state:function(b) {
    "string" !== typeof b && (b = b.id);
    return [b];
  }, log:function(b, c) {
    b = this.editor.board.findBlock(b.id);
    return [["block", b], ["pointer", c]];
  }, undo:"destroyBlock"};
  b[d.insertBlock] = {do:function(b, c, d) {
    b = this.editor.board.findBlock(b);
    this.editor.board.insert(b, c, d);
  }, state:function(b, c, d) {
    b = this.editor.board.findBlock(b);
    c = [b, b.targetPointer()];
    "string" !== typeof b && "basic" === b.getBlockType() ? c.push(b.thread.getCount(b)) : "string" !== typeof b && "output" === b.getBlockType() && c.push(d || b.getOutputBlockCount() + 1);
    return c;
  }, log:function(b, c, d) {
    b = this.editor.board.findBlock(b);
    c instanceof Array || (c = c.pointer());
    b = [["block", b ? b.pointer() : ""], ["targetPointer", c]];
    d && b.push(["count", d ? d : null]);
    return b;
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, undo:"insertBlock", restrict:function(b, c, d, e) {
    var f = Entry.Command.editor.board, g = f.code.getByPointer(b.content[1][1]), h;
    f.scrollToPointer(b.content[1][1]);
    e.toolTipRender && (e.toolTipRender.titleIndex = 0, e.toolTipRender.contentIndex = 0);
    var k = b.tooltip.isDefault, n = !1, t = new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {dimmed:!0, restrict:!0, callBack:function(c) {
      !n && c && (n = !0, d(), c = f.scrollToPointer(b.content[2][1]), g && (h = g.view), h && (h = h.getSvgRoot().blockView) && c && h.moveBy(-c[0], -c[1]), e.toolTipRender.titleIndex = 1, e.toolTipRender && (k ? (c = Entry.Command.editor.board.code.getTargetByPointer(b.content[2][1])) && c.isParamBlockType() ? e.toolTipRender.contentIndex = 2 : e.toolTipRender.contentIndex = 1 : e.toolTipRender.contentIndex = 1), c = e.processDomQuery(["playground", "board", "&1", "magnet"]), t.init([{title:b.tooltip.title, 
      content:b.tooltip.content, target:c}], {indicator:!0, callBack:function() {
      }}));
    }});
    return t;
  }, showMe:function(b) {
    if (!b.isTooltipFaded()) {
      b.fadeOutTooltip();
      var c = Entry.getDom(b.processDomQuery(this.dom)), d = Entry.getDom(b.processDomQuery(["playground", "board", "&1", "magnet", "next", 0])).getBoundingClientRect();
      Entry.Utils.glideBlock(c, d.left, d.top, function() {
        b.fadeInTooltip();
      });
    }
  }, dom:["playground", "board", "&0"]};
  e = Entry.cloneSimpleObject(b[d.insertBlock]);
  e.followCmd = !0;
  b[d.insertBlockFollowSeparate] = e;
  e = Entry.cloneSimpleObject(b[d.insertBlock]);
  e.restrict = function(b, c, d, e) {
    if (e.toolTipRender && e.toolTipRender) {
      var f = Entry.Command.editor.board.code.getByPointer(b.content[2][1]);
      !f || f.isParamBlockType() ? e.toolTipRender.contentIndex = 1 : e.toolTipRender.contentIndex = 0;
    }
    d();
    return new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {indicator:!0, callBack:function() {
    }});
  };
  e.dom = ["playground", "board", "&1", "magnet"];
  b[d.insertBlockFromBlockMenu] = e;
  e = Entry.cloneSimpleObject(b[d.insertBlockFromBlockMenu]);
  e.followCmd = !0;
  b[d.insertBlockFromBlockMenuFollowSeparate] = e;
  b[d.separateBlock] = {do:function(b, c, d) {
    b = this.editor.board.findBlock(b);
    "number" === typeof d && (b.view._moveTo(c, d), c = void 0);
    c = void 0 === c ? Entry.DRAG_MODE_DRAG : c;
    b.view && b.view._toGlobalCoordinate(c);
    b.doSeparate();
  }, state:function(b) {
    b = this.editor.board.findBlock(b);
    var c = [b], d = b.targetPointer();
    c.push(d);
    "basic" === b.getBlockType() && c.push(b.thread.getCount(b));
    return c;
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, log:function(b) {
    b = this.editor.board.findBlock(b);
    var c = b.pointer();
    b.view && (b = b.view);
    return [["block", c], ["x", b.x], ["y", b.y]];
  }, restrict:function(b, c, d, e) {
    Entry.Command.editor.board.scrollToPointer(b.content[1][1]);
    var f = !1;
    e.toolTipRender && (e.toolTipRender.titleIndex = 0, e.toolTipRender.contentIndex = 0);
    var g = new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {dimmed:!0, restrict:!0, callBack:function(c) {
      !f && c && (e.toolTipRender && (e.toolTipRender.titleIndex = 1, e.toolTipRender.contentIndex = 1), d(), f = !0, g.init([{title:b.tooltip.title, content:b.tooltip.content, target:e.processDomQuery(["playground", "board", "coord", "&1", "&2"])}], {indicator:!0, callBack:function() {
        d();
      }}));
    }});
    return g;
  }, undo:"insertBlock", dom:["playground", "board", "&0"]};
  e = Entry.cloneSimpleObject(b[d.separateBlock]);
  e.restrict = function(b, c, d, e) {
    Entry.Command.editor.board.scrollToPointer(b.content[1][1]);
    var f = !1;
    e.toolTipRender && (e.toolTipRender.titleIndex = 0, e.toolTipRender.contentIndex = 0);
    var g = new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {dimmed:!0, restrict:!0, callBack:function(c) {
      !f && c && (d(), e.toolTipRender && (e.toolTipRender.titleIndex = 1, e.toolTipRender.contentIndex = 1), f = !0, g.init([{title:b.tooltip.title, content:b.tooltip.content, target:["playground", "board", "trashcan"]}], {indicator:!0, callBack:function() {
        d();
      }}));
    }});
    return g;
  };
  e.showMe = function(b) {
    if (!b.isTooltipFaded()) {
      b.fadeOutTooltip();
      var c = Entry.getDom(b.processDomQuery(this.dom)), d = Entry.getDom(["playground", "board", "trashcan"]).getBoundingClientRect();
      Entry.Utils.glideBlock(c, d.left, d.top, function() {
        b.fadeInTooltip();
      });
    }
  };
  e.followCmd = !0;
  b[d.separateBlockForDestroy] = e;
  b[d.moveBlock] = {do:function(b, c, d) {
    void 0 !== c ? (b = this.editor.board.findBlock(b), b.moveTo(c, d)) : b._updatePos();
  }, state:function(b) {
    b = this.editor.board.findBlock(b);
    return [b, b.x, b.y];
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, restrict:function(b, c, d, e) {
    var f = !1, g = new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {dimmed:!0, restrict:!0, callBack:function(c) {
      !f && c && (f = !0, d(), g.init([{title:b.tooltip.title, content:b.tooltip.content, target:e.processDomQuery(["playground", "board", "coord", "&1", "&2"])}], {indicator:!0, callBack:function() {
      }}));
    }});
    return g;
  }, validate:!1, log:function(b, c, d) {
    b = this.editor.board.findBlock(b);
    return [["block", b.pointer()], ["x", b.view.x], ["y", b.view.y]];
  }, undo:"moveBlock", dom:["playground", "board", "&0"]};
  e = Entry.cloneSimpleObject(b[d.moveBlock]);
  e.followCmd = !0;
  e.restrict = function(b, c, d, e) {
    Entry.Command.editor.board.scrollToPointer(b.content[1][1]);
    var f = !1;
    e.toolTipRender && (e.toolTipRender.titleIndex = 0, e.toolTipRender.contentIndex = 0);
    var g = new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {dimmed:!0, restrict:!0, callBack:function(c) {
      !f && c && (f = !0, d(), e.toolTipRender && (e.toolTipRender.titleIndex = 1, e.toolTipRender.contentIndex = 1), g.init([{title:b.tooltip.title, content:b.tooltip.content, target:["playground", "board", "trashcan"]}], {indicator:!0, callBack:function() {
        d();
      }}));
    }});
    return g;
  };
  b[d.moveBlockForDestroy] = e;
  e = Entry.cloneSimpleObject(b[d.moveBlock]);
  e.restrict = function(b, c, d) {
    d();
    return new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {indicator:!0, callBack:function() {
    }});
  };
  e.dom = ["playground", "board", "coord", "&1", "&2"];
  b[d.moveBlockFromBlockMenu] = e;
  c(d.cloneBlock, d.addThread, [["undo", "uncloneBlock"], ["dom", void 0]]);
  c(d.uncloneBlock, d.destroyThread, [["undo", "cloneBlock"]]);
  b[d.scrollBoard] = {do:function(b, c, d) {
    d || this.editor.board.scroller._scroll(b, c);
    delete this.editor.board.scroller._diffs;
  }, state:function(b, c) {
    return [-b, -c];
  }, log:function(b, c) {
    return [["dx", b], ["dy", c]];
  }, recordable:Entry.STATIC.RECORDABLE.SKIP, undo:"scrollBoard"};
  b[d.setFieldValue] = {do:function(b, c, d) {
    b = d ? d.getByPointer(b) : this.editor.board.findBlock(b);
    b.setValue(c, !0);
    Entry.disposeEvent.notify(!0);
    b._blockView.disableMouseEvent = !1;
  }, state:function(b, c, d) {
    c = d ? d.getByPointer(b) : this.editor.board.findBlock(b);
    return [b, c._startValue || c.getValue()];
  }, log:function(b, c) {
    return [["pointer", b], ["value", c]];
  }, restrict:function(b, c, d, e) {
    var f = !1, g = b.tooltip.isDefault;
    Entry.Command.editor.board.scrollToPointer(b.content[1][1]);
    var h = Entry.Command.editor.board.findBlock(b.content[1][1]), k = h._blockView;
    k.disableMouseEvent = !0;
    var n = h.getFieldRawType();
    if (e.toolTipRender) {
      if (g) {
        switch(n) {
          case "textInput":
            e.toolTipRender.contentIndex = 0;
            break;
          case "dropdown":
          case "dropdownDynamic":
            e.toolTipRender.contentIndex = 1;
            break;
          case "keyboard":
            e.toolTipRender.contentIndex = 2;
        }
      } else {
        e.toolTipRender.contentIndex = 0;
      }
    }
    var t = b.content[2][1];
    h instanceof Entry.FieldTextInput && h.fixNextValue(t);
    var u = new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, direction:"left", target:c}], {dimmed:!0, restrict:!0, callBack:function(c) {
      if (!f && c) {
        f = !0;
        d();
        d();
        e.toolTipRender.replaceContent(/&value&/gi, h.getTextValueByValue(t));
        if (e.toolTipRender) {
          if (g) {
            switch(n) {
              case "textInput":
                e.toolTipRender.contentIndex = 3;
                break;
              case "dropdown":
              case "dropdownDynamic":
                e.toolTipRender.contentIndex = 4;
                break;
              case "keyboard":
                e.toolTipRender.contentIndex = 5;
            }
          } else {
            e.toolTipRender.titleIndex = 1, e.toolTipRender.contentIndex = 1;
          }
        }
        u.init([{title:b.tooltip.title, content:b.tooltip.content, target:e.processDomQuery(["playground", "board", "&0", "option"])}], {dimmed:!0, restrict:!0, callBack:function() {
          k.disableMouseEvent = !1;
        }});
      }
    }});
    return u;
  }, disableMouseUpDispose:!0, recordable:Entry.STATIC.RECORDABLE.SUPPORT, dom:["playground", "board", "&0"], undo:"setFieldValue"};
  b[d.selectBlockMenu] = {do:function(b, c, d) {
    var e = Entry.getMainWS().blockMenu;
    e.selectMenu(b, c, d);
    e.align();
  }, state:function(b, c, d) {
    return [Entry.getMainWS().blockMenu.lastSelector, c, d];
  }, log:function(b, c, d) {
    return [["selector", b]];
  }, skipUndoStack:!0, recordable:Entry.STATIC.RECORDABLE.SUPPORT, dom:["playground", "blockMenu", "category", "&0"], undo:"selectBlockMenu"};
  b[d.destroyThreads] = {do:function() {
    this.editor.board.code.getThreads().filter(function(b) {
      return b.getFirstBlock().isDeletable();
    }).forEach(function(b) {
      b.destroy();
    });
  }, state:function() {
    return [this.editor.board.code.getThreads().filter(function(b) {
      return b.getFirstBlock().isDeletable();
    }).map(function(b) {
      return b.toJSON();
    })];
  }, log:function() {
    return [];
  }, undo:"addThreads"};
  b[d.addThreads] = {do:function(b) {
    var c = this.editor.board.code;
    b.forEach(function(b) {
      c.createThread(b);
    });
  }, state:function() {
    return [];
  }, log:function() {
    return [];
  }, undo:"destroyThreads"};
  b[d.destroyBlockBelow] = {do:function(b) {
    b = this.editor.board.findBlock(b);
    b.doDestroyBelow(!0);
  }, state:function(b) {
    b = this.editor.board.findBlock(b);
    var c = b.thread;
    return [c instanceof Entry.Thread ? c.toJSON(!1, b) : [b.toJSON()], b.targetPointer()];
  }, log:function(b) {
    return [];
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, undo:"recoverBlockBelow"};
  b[d.recoverBlockBelow] = {do:function(b, c) {
    var d = this.editor.board;
    b = d.code.createThread(b);
    d.insert(b.getFirstBlock(), c);
  }, state:function(b, c) {
    return [b[0]];
  }, log:function(b, c) {
    return [];
  }, undo:"destroyBlockBelow"};
  c(d.separateBlockByCommand, d.separateBlock);
})(Entry.Command);
(function(b) {
  var c = Entry.STATIC.COMMAND_TYPES;
  b[c.toggleRun] = {do:function(b) {
    Entry.engine.toggleRun();
  }, state:function() {
    return [];
  }, log:function(b) {
    return [["callerName", b]];
  }, restrict:function(b, c, f, g) {
    f = Entry.engine;
    f.isState("stop") || f.toggleStop();
    return new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {dimmed:!0, restrict:!0, callBack:function(b) {
    }});
  }, validate:!1, recordable:Entry.STATIC.RECORDABLE.SUPPORT, undo:"toggleStop", dom:["engine", "&0"]};
  b[c.toggleStop] = {do:function(b) {
    Entry.engine.toggleStop();
  }, state:function() {
    return [];
  }, log:function(b) {
    return [["callerName", b]];
  }, restrict:function(b, c, f, g) {
    g = Entry.engine;
    Entry.engine.popup && Entry.engine.closeFullScreen();
    g.isState("run") || g.toggleRun(!1);
    return new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {dimmed:!0, restrict:!0, callBack:function(b) {
      f();
    }});
  }, validate:!1, recordable:Entry.STATIC.RECORDABLE.SUPPORT, undo:"toggleRun", dom:["engine", "&0"]};
})(Entry.Command);
(function(b) {
  var c = Entry.STATIC.COMMAND_TYPES;
  b[c.selectObject] = {do:function(b) {
    return Entry.container.selectObject(b);
  }, state:function(b) {
    if ((b = Entry.playground) && b.object) {
      return [b.object.id];
    }
  }, log:function(b) {
    return [b];
  }, undo:"selectObject"};
  b[c.objectEditButtonClick] = {do:function(b) {
    Entry.container.getObject(b).toggleEditObject();
  }, state:function(b) {
    return [];
  }, log:function(b) {
    return [["objectId", b], ["objectIndex", Entry.container.getObjectIndex(b)]];
  }, skipUndoStack:!0, recordable:Entry.STATIC.RECORDABLE.SUPPORT, dom:["container", "objectIndex", "&1", "editButton"], undo:"selectObject"};
  b[c.objectAddPicture] = {do:function(d, e) {
    var f = b[c.objectAddPicture].hashId;
    f && (e.id = f, delete b[c.objectAddPicture].hashId);
    Entry.container.getObject(d).addPicture(e);
    Entry.playground.injectPicture();
    Entry.playground.selectPicture(e);
    Entry.dispatchEvent("dismissModal");
  }, state:function(b, c) {
    return [b, c];
  }, log:function(b, c) {
    var d = {};
    d._id = c._id;
    d.id = c.id;
    d.dimension = c.dimension;
    d.filename = c.filename;
    d.fileurl = c.fileurl;
    d.name = c.name;
    d.scale = c.scale;
    return [["objectId", b], ["picture", d]];
  }, dom:[".btn_confirm_modal"], restrict:function(b, c, f) {
    this.hashId = b.content[2][1].id;
    c = new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:".btn_confirm_modal"}], {restrict:!0, dimmed:!0, render:!1, callBack:f});
    f = Entry.getMainWS().widgetUpdateEvent;
    b.skip || Entry.dispatchEvent("openPictureManager", b.content[2][1]._id, f.notify.bind(f));
    return c;
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, validate:!1, undo:"objectRemovePicture"};
  b[c.objectRemovePicture] = {do:function(b, c) {
    Entry.container.getObject(b).removePicture(c.id);
  }, state:function(b, c) {
    return [b, c];
  }, log:function(b, c) {
    return [["objectId", b], ["pictureId", c._id]];
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, validate:!1, undo:"objectAddPicture"};
  b[c.objectAddSound] = {do:function(d, e) {
    var f = b[c.objectAddSound].hashId;
    f && (e.id = f, delete b[c.objectAddSound].hashId);
    Entry.container.getObject(d).addSound(e);
    Entry.dispatchEvent("dismissModal");
  }, state:function(b, c) {
    return [b, c];
  }, log:function(b, c) {
    var d = {};
    d._id = c._id;
    d.duration = c.duration;
    d.ext = c.ext;
    d.id = c.id;
    d.filename = c.filename;
    d.fileurl = c.fileurl;
    d.name = c.name;
    return [["objectId", b], ["sound", d]];
  }, dom:[".btn_confirm_modal"], restrict:function(b, c, f) {
    this.hashId = b.content[2][1].id;
    c = new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:".btn_confirm_modal"}], {callBack:f, dimmed:!0, restrict:!0, render:!1});
    f = Entry.getMainWS().widgetUpdateEvent;
    b.skip || Entry.dispatchEvent("openSoundManager", b.content[2][1]._id, f.notify.bind(f));
    return c;
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, validate:!1, undo:"objectRemoveSound"};
  b[c.objectRemoveSound] = {do:function(b, c) {
    return Entry.container.getObject(b).removeSound(c.id);
  }, state:function(b, c) {
    return [b, c];
  }, log:function(b, c) {
    return [["objectId", b], ["soundId", c._id]];
  }, dom:[".btn_confirm_modal"], recordable:Entry.STATIC.RECORDABLE.SUPPORT, validate:!1, undo:"objectAddSound"};
})(Entry.Command);
(function(b) {
  var c = Entry.STATIC.COMMAND_TYPES;
  b[c.editPicture] = {do:function(b, c) {
    Entry.playground.painter.lc.canRedo() && Entry.playground.painter.lc.redo();
  }, state:function(b) {
  }, log:function(b) {
    return [b];
  }, recordable:Entry.STATIC.RECORDABLE.SKIP, undo:"uneditPicture"};
  b[c.uneditPicture] = {type:Entry.STATIC.COMMAND_TYPES.uneditPicture, do:function(b, c) {
    Entry.playground.painter.lc.undo();
  }, state:function(b) {
  }, log:function(b) {
    return [b];
  }, recordable:Entry.STATIC.RECORDABLE.SKIP, undo:"editPicture"};
  b[c.processPicture] = {do:function(b, c) {
    Entry.playground.painter.lc.canRedo() && Entry.playground.painter.lc.redo();
  }, state:function(b) {
  }, log:function(b) {
    return [b];
  }, recordable:Entry.STATIC.RECORDABLE.SKIP, undo:"unprocessPicture", isPass:!0};
  b[c.unprocessPicture] = {do:function(b, c) {
    Entry.playground.painter.lc.undo();
  }, state:function(b) {
  }, log:function(b) {
    return [b];
  }, recordable:Entry.STATIC.RECORDABLE.SKIP, undo:"processPicture", isPass:!0};
})(Entry.Command);
(function(b) {
  var c = Entry.STATIC.COMMAND_TYPES;
  b[c.playgroundChangeViewMode] = {do:function(b, c) {
    Entry.playground.changeViewMode(b);
  }, state:function(b, c) {
    return [c, b];
  }, log:function(b, c) {
    return [["newType", b], ["oldType", c || "code"]];
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, undo:"playgroundChangeViewMode", dom:["playground", "tabViewElements", "&0"]};
  b[c.playgroundClickAddPicture] = {do:function() {
    Entry.dispatchEvent("openPictureManager");
  }, state:function() {
    return [];
  }, log:function() {
    return [];
  }, validate:!1, recordable:Entry.STATIC.RECORDABLE.SUPPORT, restrict:function(b, c, f, g) {
    Entry.dispatchEvent("dismissModal");
    return new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {restrict:!0, dimmed:!0, callBack:f});
  }, undo:"playgroundClickAddPictureCancel", dom:["playground", "pictureAddButton"]};
  b[c.playgroundClickAddPictureCancel] = {do:function() {
    Entry.dispatchEvent("dismissModal");
  }, state:function() {
    return [];
  }, log:function() {
    return [];
  }, validate:!1, recordable:Entry.STATIC.RECORDABLE.SUPPORT, undo:"", dom:["playground", "pictureAddButton"]};
  b[c.playgroundClickAddSound] = {do:function() {
    Entry.dispatchEvent("openSoundManager");
  }, state:function() {
    return [];
  }, log:function() {
    return [];
  }, validate:!1, recordable:Entry.STATIC.RECORDABLE.SUPPORT, restrict:function(b, c, f, g) {
    Entry.dispatchEvent("dismissModal");
    return new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {restrict:!0, dimmed:!0, callBack:f});
  }, undo:"playgroundClickAddSoundCancel", dom:["playground", "soundAddButton"]};
  b[c.playgroundClickAddSoundCancel] = {do:function() {
    Entry.dispatchEvent("dismissModal");
  }, state:function() {
    return [];
  }, log:function() {
    return [];
  }, validate:!1, recordable:Entry.STATIC.RECORDABLE.SUPPORT, undo:"", dom:["playground", "soundAddButton"]};
})(Entry.Command);
(function(b) {
  var c = Entry.STATIC.COMMAND_TYPES;
  b[c.variableContainerSelectFilter] = {do:function(b, c) {
    Entry.variableContainer.selectFilter(b);
  }, state:function(b, c) {
    return [c, b];
  }, log:function(b, c) {
    return [["newType", b], ["oldType", c || "all"]];
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, undo:"variableContainerSelectFilter", dom:["variableContainer", "filter", "&0"]};
  b[c.variableContainerClickVariableAddButton] = {do:function() {
    Entry.variableContainer.clickVariableAddButton();
  }, state:function() {
    return [];
  }, log:function() {
    return [];
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, undo:"variableContainerClickVariableAddButton", dom:["variableContainer", "variableAddButton"]};
  b[c.variableContainerAddVariable] = {do:function(d) {
    var e = b[c.variableContainerAddVariable], f = e.hashId;
    f && (d.id_ = f, delete e.hashId);
    Entry.variableContainer.addVariable(d);
  }, state:function(d) {
    d instanceof Entry.Variable && (d = d.toJSON());
    var e = b[c.variableContainerAddVariable].hashId;
    e && (d.id = e);
    return [d];
  }, log:function(b) {
    b instanceof Entry.Variable && (b = b.toJSON());
    return [["variable", b]];
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, validate:!1, undo:"variableContainerRemoveVariable", restrict:function(b, c, f) {
    Entry.variableContainer.clickVariableAddButton(!0, !0);
    $(".entryVariableAddSpaceInputWorkspace").val(b.content[1][1].name);
    this.hashId = b.content[1][1].id;
    b = new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {restrict:!0, dimmed:!0, callBack:f});
    f();
    return b;
  }, dom:["variableContainer", "variableAddConfirmButton"]};
  b[c.variableAddSetName] = {do:function(d) {
    var e = b[c.variableAddSetName], f = $(".entryVariableAddSpaceInputWorkspace");
    f[0].blurred = !0;
    f.blur();
    d = e._nextValue || d;
    f.val(d);
    delete e._nextValue;
  }, state:function(b) {
    return [""];
  }, log:function(d) {
    return [["value", b[c.variableAddSetName]._nextValue || d]];
  }, restrict:function(b, c, f) {
    Entry.variableContainer.clickVariableAddButton(!0);
    this._nextValue = b.content[1][1];
    $(".entryVariableAddSpaceInputWorkspace")[0].enterKeyDisabled = !0;
    return new Entry.Tooltip([{title:b.tooltip.title, content:b.tooltip.content, target:c}], {restrict:!0, noDispose:!0, dimmed:!0, callBack:f});
  }, validate:!1, recordable:Entry.STATIC.RECORDABLE.SUPPORT, undo:"variableAddSetName", dom:["variableContainer", "variableAddInput"]};
  b[c.variableContainerRemoveVariable] = {do:function(b) {
    Entry.variableContainer.removeVariable(b);
  }, state:function(b) {
    b instanceof Entry.Variable && (b = b.toJSON());
    return [b];
  }, log:function(b) {
    b instanceof Entry.Variable && (b = b.toJSON());
    return [["variable", b]];
  }, recordable:Entry.STATIC.RECORDABLE.SUPPORT, validate:!1, undo:"variableContainerAddVariable", dom:["variableContainer", "variableAddConfirmButton"]};
})(Entry.Command);
Entry.db = {data:{}, typeMap:{}};
(function(b) {
  b.add = function(b) {
    this.data[b.id] = b;
    var c = b.type;
    void 0 === this.typeMap[c] && (this.typeMap[c] = {});
    this.typeMap[c][b.id] = b;
  };
  b.has = function(b) {
    return this.data.hasOwnProperty(b);
  };
  b.remove = function(b) {
    this.has(b) && (delete this.typeMap[this.data[b].type][b], delete this.data[b]);
  };
  b.get = function(b) {
    return this.data[b];
  };
  b.find = function() {
  };
  b.clear = function() {
    this.data = {};
    this.typeMap = {};
  };
})(Entry.db);
Entry.Container = function() {
  this.objects_ = [];
  this.cachedPicture = {};
  this.inputValue = {};
  this.currentObjects_ = this.copiedObject = null;
  this._extensionObjects = [];
  Entry.addEventListener("workspaceChangeMode", function() {
    var b = Entry.getMainWS();
    b && b.getMode() === Entry.Workspace.MODE_VIMBOARD && this.objects_.forEach(function(b) {
      b.script && b.script.destroyView();
    });
  }.bind(this));
  Entry.addEventListener("run", this.disableSort.bind(this));
  Entry.addEventListener("stop", this.enableSort.bind(this));
};
Entry.Container.prototype.generateView = function(b, c) {
  var d = this;
  this._view = b;
  this._view.addClass("entryContainer");
  this._view.addClass("entryContainerWorkspace");
  this._view.setAttribute("id", "entryContainerWorkspaceId");
  b = Entry.createElement("div");
  b.addClass("entryAddObjectWorkspace");
  b.innerHTML = Lang.Workspace.add_object;
  b.bindOnClick(function(b) {
    Entry.dispatchEvent("openSpriteManager");
  });
  b = Entry.createElement("div");
  c = "entryContainerListWorkspaceWrapper";
  Entry.isForLecture && (c += " lecture");
  b.addClass(c);
  Entry.Utils.disableContextmenu(b);
  $(b).bind("mousedown touchstart", function(b) {
    function c(b) {
      r && 5 < Math.sqrt(Math.pow(b.pageX - r.x, 2) + Math.pow(b.pageY - r.y, 2)) && h && (clearTimeout(h), h = null);
    }
    function e(b) {
      b.stopPropagation();
      k.unbind(".container");
      h && (clearTimeout(h), h = null);
    }
    var h = null, k = $(document), l = b.type, m = !1;
    if (Entry.Utils.isRightButton(b)) {
      d._rightClick(b), m = !0;
    } else {
      var r = {x:b.clientX, y:b.clientY};
      "touchstart" !== l || m || (b.stopPropagation(), b = Entry.Utils.convertMouseEvent(b), h = setTimeout(function() {
        h && (h = null, d._rightClick(b));
      }, 1000), k.bind("mousemove.container touchmove.container", c), k.bind("mouseup.container touchend.container", e));
    }
  });
  this._view.appendChild(b);
  c = Entry.createElement("ul");
  b.appendChild(c);
  this._extensionListView = Entry.Dom(c, {class:"entryContainerExtensions"});
  c = Entry.createElement("ul");
  c.addClass("entryContainerListWorkspace");
  b.appendChild(c);
  this.listView_ = c;
  this.enableSort();
};
Entry.Container.prototype.enableSort = function() {
  $(this.listView_).sortable({start:function(b, c) {
    c.item.data("start_pos", c.item.index());
  }, stop:function(b, c) {
    Entry.container.moveElement(c.item.data("start_pos"), c.item.index());
  }, axis:"y", cancel:"input.selectedEditingObject"});
};
Entry.Container.prototype.disableSort = function() {
  $(this.listView_).sortable("destroy");
};
Entry.Container.prototype.updateListView = function() {
  if (this.listView_) {
    for (var b = this.listView_; b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    var c = document.createDocumentFragment("div"), d = this.getCurrentObjects().slice();
    d.filter(function(b) {
      return void 0 !== b.index;
    }).length === d.length && (d = d.sort(function(b, c) {
      return b.index - c.index;
    }));
    d.forEach(function(b) {
      !b.view_ && b.generateView();
      c.appendChild(b.view_);
    });
    b.appendChild(c);
    Entry.stage.sortZorder();
    return !0;
  }
};
Entry.Container.prototype.setObjects = function(b) {
  for (var c in b) {
    var d = new Entry.EntryObject(b[c]);
    this.objects_.push(d);
  }
  this.updateObjectsOrder();
  !this.updateListView() && Entry.stage.sortZorder();
  Entry.variableContainer.updateViews();
  b = Entry.type;
  ("workspace" == b || "phone" == b) && (b = this.getCurrentObjects()[0]) && this.selectObject(b.id);
};
Entry.Container.prototype.getPictureElement = function(b, c) {
  if (b = this.getObject(c).getPicture(b)) {
    return b.view;
  }
  throw Error("No picture found");
};
Entry.Container.prototype.setPicture = function(b) {
  var c = this.getObject(b.objectId), d;
  for (d in c.pictures) {
    if (b.id === c.pictures[d].id) {
      var e = {};
      e.dimension = b.dimension;
      e.id = b.id;
      e.filename = b.filename;
      e.fileurl = b.fileurl;
      e.name = b.name;
      e.view = c.pictures[d].view;
      c.pictures[d] = e;
      return;
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.selectPicture = function(b, c) {
  c = this.getObject(c);
  if (b = c.getPicture(b)) {
    return c.selectedPicture = b, c.entity.setImage(b), c.updateThumbnailView(), c.id;
  }
  throw Error("No picture found");
};
Entry.Container.prototype.addObject = function(b, c) {
  var d = new Entry.EntryObject(b);
  d.name = Entry.getOrderedName(d.name, this.objects_);
  Entry.stateManager && Entry.stateManager.addCommand("add object", this, this.removeObject, d);
  d.scene || (d.scene = Entry.scene.selectedScene);
  "number" == typeof c ? b.sprite.category && "background" == b.sprite.category.main ? (d.setLock(!0), this.objects_.push(d)) : this.objects_.splice(c, 0, d) : b.sprite.category && "background" == b.sprite.category.main ? this.objects_.push(d) : this.objects_.unshift(d);
  d.generateView();
  this.setCurrentObjects();
  this.updateObjectsOrder();
  this.updateListView();
  this.selectObject(d.id);
  Entry.variableContainer.updateViews();
  return new Entry.State(this, this.removeObject, d);
};
Entry.Container.prototype.addExtension = function(b) {
  this._extensionObjects.push(b);
  this._extensionListView && this._extensionListView.append(b.renderView());
  return b;
};
Entry.Container.prototype.removeExtension = function(b) {
  if (b) {
    var c = this._extensionObjects, d = c.indexOf(b);
    -1 < d && c.splice(d, 1);
    b.destroy && b.destroy();
  }
};
Entry.Container.prototype.addCloneObject = function(b, c) {
  b = b.toJSON();
  var d = Entry.generateHash();
  Entry.variableContainer.addCloneLocalVariables({objectId:b.id, newObjectId:d, json:b});
  b.id = d;
  b.scene = c || Entry.scene.selectedScene;
  this.addObject(b);
};
Entry.Container.prototype.removeObject = function(b) {
  var c = this.objects_.indexOf(b), d = b.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove object", this, this.addObject, d, c);
  d = new Entry.State(this.addObject, d, c);
  b.destroy();
  this.objects_.splice(c, 1);
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  c = this.getCurrentObjects();
  c.length ? this.selectObject(c[0].id) : (this.selectObject(), Entry.playground.flushPlayground());
  Entry.toast.success(Lang.Workspace.remove_object, b.name + " " + Lang.Workspace.remove_object_msg);
  Entry.variableContainer.removeLocalVariables(b.id);
  Entry.playground.reloadPlayground();
  return d;
};
Entry.Container.prototype.selectObject = function(b, c) {
  b = this.getObject(b);
  var d = Entry.getMainWS();
  c && b && Entry.scene.selectScene(b.scene);
  this.mapObjectOnScene(function(b) {
    !b.view_ && b.generateView && b.generateView();
    b.view_ && b.view_.removeClass("selectedObject");
    b.isSelected_ = !1;
  });
  if (b) {
    if (b.view_ && b.view_.addClass("selectedObject"), b.isSelected_ = !0, d && d.vimBoard && Entry.isTextMode) {
      c = d.vimBoard._currentObject;
      var e = d.vimBoard._parser;
      if (e && e._onError) {
        if (c && b.id != c.id) {
          if (Entry.scene.isSceneCloning) {
            Entry.container.selectObject(c.id);
          } else {
            try {
              d._syncTextCode();
            } catch (f) {
            }
            e && !e._onError ? Entry.container.selectObject(b.id, !0) : Entry.container.selectObject(c.id, !0);
          }
          return;
        }
      } else {
        if (c && b.id != c.id) {
          if (Entry.scene.isSceneCloning) {
            Entry.container.selectObject(c.id);
            return;
          }
          try {
            d._syncTextCode();
          } catch (f) {
          }
          if (e && e._onError) {
            Entry.container.selectObject(c.id, !0);
            return;
          }
        }
      }
    }
  } else {
    d && d.vimBoard && d.vimBoard.clearText();
  }
  Entry.playground && Entry.playground.injectObject(b);
  "minimize" != Entry.type && Entry.engine.isState("stop") && Entry.stage.selectObject(b);
};
Entry.Container.prototype.getAllObjects = function() {
  return this.objects_;
};
Entry.Container.prototype.getObject = function(b) {
  !b && Entry.playground && Entry.playground.object && (b = Entry.playground.object.id);
  for (var c = this.objects_.length, d = 0; d < c; d++) {
    var e = this.objects_[d];
    if (e.id == b) {
      return e;
    }
  }
};
Entry.Container.prototype.getEntity = function(b) {
  if (b = this.getObject(b)) {
    return b.entity;
  }
  Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.object_not_found, !0);
};
Entry.Container.prototype.getVariable = function(b) {
  for (var c = 0; c < this.variables_.length; c++) {
    var d = this.variables_[c];
    if (d.getId() == b || d.getName() == b) {
      return d;
    }
  }
};
Entry.Container.prototype.moveElement = function(b, c, d) {
  var e = this.getCurrentObjects();
  b = this.getAllObjects().indexOf(e[b]);
  c = this.getAllObjects().indexOf(e[c]);
  !d && Entry.stateManager && Entry.stateManager.addCommand("reorder object", Entry.container, Entry.container.moveElement, c, b, !0);
  this.objects_.splice(c, 0, this.objects_.splice(b, 1)[0]);
  this.setCurrentObjects();
  Entry.container.updateListView();
  Entry.requestUpdate = !0;
  return new Entry.State(Entry.container, Entry.container.moveElement, c, b, !0);
};
Entry.Container.prototype.moveElementByBlock = function(b, c) {
  b = this.getCurrentObjects().splice(b, 1)[0];
  this.getCurrentObjects().splice(c, 0, b);
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getDropdownList = function(b, c) {
  var d = [];
  switch(b) {
    case "sprites":
      var e = this.getCurrentObjects(), f = e.length;
      for (b = 0; b < f; b++) {
        c = e[b], d.push([c.name, c.id]);
      }
      break;
    case "spritesWithMouse":
      e = this.getCurrentObjects();
      f = e.length;
      for (b = 0; b < f; b++) {
        c = e[b], d.push([c.name, c.id]);
      }
      d.push([Lang.Blocks.mouse_pointer, "mouse"]);
      break;
    case "spritesWithSelf":
      e = this.getCurrentObjects();
      f = e.length;
      for (b = 0; b < f; b++) {
        c = e[b], d.push([c.name, c.id]);
      }
      d.push([Lang.Blocks.self, "self"]);
      break;
    case "collision":
      d.push([Lang.Blocks.mouse_pointer, "mouse"]);
      e = this.getCurrentObjects();
      f = e.length;
      for (b = 0; b < f; b++) {
        c = e[b], d.push([c.name, c.id]);
      }
      d.push([Lang.Blocks.wall, "wall"]);
      d.push([Lang.Blocks.wall_up, "wall_up"]);
      d.push([Lang.Blocks.wall_down, "wall_down"]);
      d.push([Lang.Blocks.wall_right, "wall_right"]);
      d.push([Lang.Blocks.wall_left, "wall_left"]);
      break;
    case "pictures":
      c = Entry.playground.object || c;
      if (!c) {
        break;
      }
      c = c.pictures || [];
      for (b = 0; b < c.length; b++) {
        e = c[b], d.push([e.name, e.id]);
      }
      break;
    case "messages":
      c = Entry.variableContainer.messages_;
      for (b = 0; b < c.length; b++) {
        e = c[b], d.push([e.name, e.id]);
      }
      break;
    case "variables":
      c = Entry.variableContainer.variables_;
      for (b = 0; b < c.length; b++) {
        e = c[b], e.object_ && Entry.playground.object && e.object_ != Entry.playground.object.id || d.push([e.getName(), e.getId()]);
      }
      d && 0 !== d.length || d.push([Lang.Blocks.VARIABLE_variable, "null"]);
      break;
    case "lists":
      c = Entry.playground.object || c;
      e = Entry.variableContainer.lists_;
      for (b = 0; b < e.length; b++) {
        f = e[b], f.object_ && c && f.object_ != c.id || d.push([f.getName(), f.getId()]);
      }
      d && 0 !== d.length || d.push([Lang.Blocks.VARIABLE_list, "null"]);
      break;
    case "scenes":
      c = Entry.scene.scenes_;
      for (b = 0; b < c.length; b++) {
        e = c[b], d.push([e.name, e.id]);
      }
      break;
    case "sounds":
      c = Entry.playground.object || c;
      if (!c) {
        break;
      }
      c = c.sounds || [];
      for (b = 0; b < c.length; b++) {
        e = c[b], d.push([e.name, e.id]);
      }
      break;
    case "clone":
      d.push([Lang.Blocks.oneself, "self"]);
      this.getCurrentObjects().forEach(function(b) {
        d.push([b.name, b.id]);
      });
      break;
    case "objectSequence":
      for (f = this.getCurrentObjects().length, b = 0; b < f; b++) {
        d.push([(b + 1).toString(), b.toString()]);
      }
  }
  d.length || (d = [[Lang.Blocks.no_target, "null"]]);
  return d;
};
Entry.Container.prototype.clearRunningState = function() {
  this.mapObject(function(b) {
    b.clearExecutor();
  });
};
Entry.Container.prototype.clearRunningStateOnScene = function() {
  this.mapObjectOnScene(function(b) {
    b.clearExecutor();
  });
};
Entry.Container.prototype.mapObject = function(b, c) {
  for (var d, e = this.objects_.length, f = [], g = 0; g < this._extensionObjects.length; g++) {
    d = this._extensionObjects[g], f.push(b(d, c));
  }
  for (g = 0; g < e; g++) {
    d = this.objects_[g], f.push(b(d, c));
  }
  return f;
};
Entry.Container.prototype.mapObjectOnScene = function(b, c) {
  for (var d, e = this.getCurrentObjects(), f = e.length, g = [], h = 0; h < this._extensionObjects.length; h++) {
    d = this._extensionObjects[h], g.push(b(d, c));
  }
  for (h = 0; h < f; h++) {
    d = e[h], g.push(b(d, c));
  }
  return g;
};
Entry.Container.prototype.mapEntity = function(b, c) {
  for (var d = this.objects_.length, e = [], f = 0; f < d; f++) {
    e.push(b(this.objects_[f].entity, c));
  }
  return e;
};
Entry.Container.prototype.mapEntityOnScene = function(b, c) {
  for (var d = this.getCurrentObjects(), e = d.length, f = [], g = 0; g < e; g++) {
    f.push(b(d[g].entity, c));
  }
  return f;
};
Entry.Container.prototype.mapEntityIncludeClone = function(b, c) {
  for (var d = this.objects_, e = d.length, f = [], g = 0; g < e; g++) {
    var h = d[g], k = h.clonedEntities.length;
    f.push(b(h.entity, c));
    for (var l = 0; l < k; l++) {
      var m = h.clonedEntities[l];
      m && !m.isStamp && f.push(b(m, c));
    }
  }
  return f;
};
Entry.Container.prototype.mapEntityIncludeCloneOnScene = function(b, c) {
  for (var d, e = this.getCurrentObjects(), f = e.length, g = [], h = 0; h < this._extensionObjects.length; h++) {
    d = this._extensionObjects[h], g.push(b(d.entity, c));
  }
  for (h = 0; h < f; h++) {
    d = e[h];
    var k = d.clonedEntities.length;
    g.push(b(d.entity, c));
    for (var l = 0; l < k; l++) {
      var m = d.clonedEntities[l];
      m && !m.isStamp && g.push(b(m, c));
    }
  }
  return g;
};
Entry.Container.prototype.getCachedPicture = function(b) {
  Entry.assert("string" == typeof b, "pictureId must be string");
  return this.cachedPicture[b];
};
Entry.Container.prototype.cachePicture = function(b, c) {
  this.cachedPicture[b] = c;
};
Entry.Container.prototype.toJSON = function() {
  for (var b = [], c = this.objects_.length, d = 0; d < c; d++) {
    b.push(this.objects_[d].toJSON());
  }
  return b;
};
Entry.Container.prototype.takeSequenceSnapshot = function() {
  for (var b = this.objects_.length, c = this.objects_, d = 0; d < b; d++) {
    c[d].index = d;
  }
};
Entry.Container.prototype.loadSequenceSnapshot = function() {
  for (var b = this.objects_.length, c = Array(b), d = 0; d < b; d++) {
    var e = this.objects_[d];
    c[void 0 !== e.index ? e.index : d] = e;
    delete e.index;
  }
  this.objects_ = c;
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getInputValue = function() {
  return this.inputValue.getValue();
};
Entry.Container.prototype.setInputValue = function(b) {
  this.inputValue.complete || (b ? this.inputValue.setValue(b) : this.inputValue.setValue(0), Entry.stage.hideInputField(), Entry.dispatchEvent("answerSubmitted"), Entry.console && Entry.console.stopInput(b), this.inputValue.complete = !0);
};
Entry.Container.prototype.resetSceneDuringRun = function() {
  this.mapEntityOnScene(function(b) {
    b.loadSnapshot();
    b.object.filters = [];
    b.resetFilter();
    b.dialog && b.dialog.remove();
    b.shape && b.removeBrush();
  });
  this.clearRunningStateOnScene();
};
Entry.Container.prototype.setCopiedObject = function(b) {
  this.copiedObject = b;
};
Entry.Container.prototype.updateObjectsOrder = function() {
  for (var b = Entry.scene.getScenes(), c = [], d = 0; d < b.length; d++) {
    for (var e = this.getSceneObjects(b[d]), f = 0; f < e.length; f++) {
      c.push(e[f]);
    }
  }
  this.objects_ = c;
};
Entry.Container.prototype.getSceneObjects = function(b) {
  b = b || Entry.scene.selectedScene;
  for (var c = [], d = this.getAllObjects(), e = 0; e < d.length; e++) {
    b.id == d[e].scene.id && c.push(d[e]);
  }
  return c;
};
Entry.Container.prototype.setCurrentObjects = function() {
  this.currentObjects_ = this.getSceneObjects();
};
Entry.Container.prototype.getCurrentObjects = function() {
  var b = this.currentObjects_;
  b && 0 !== b.length || this.setCurrentObjects();
  return this.currentObjects_ || [];
};
Entry.Container.prototype.getProjectWithJSON = function(b) {
  b.objects = Entry.container.toJSON();
  b.variables = Entry.variableContainer.getVariableJSON();
  b.messages = Entry.variableContainer.getMessageJSON();
  b.scenes = Entry.scene.toJSON();
  return b;
};
Entry.Container.prototype.blurAllInputs = function() {
  this.getSceneObjects().map(function(b) {
    b = b.view_.getElementsByTagName("input");
    for (var c = 0, d = b.length; c < d; c++) {
      b[c].blur();
    }
  });
};
Entry.Container.prototype.showProjectAnswer = function() {
  var b = this.inputValue;
  b && b.setVisible(!0);
};
Entry.Container.prototype.hideProjectAnswer = function(b, c) {
  var d = this.inputValue;
  if (d && d.isVisible() && !Entry.engine.isState("run")) {
    for (var e = Entry.container.getAllObjects(), f = ["ask_and_wait", "get_canvas_input_value", "set_visible_answer"], g = 0, h = e.length; g < h; g++) {
      for (var k = e[g].script, l = 0; l < f.length; l++) {
        var m = k.getBlockList(!1, f[l]);
        if (c) {
          var r = m.indexOf(b);
          -1 < r && m.splice(r, 1);
        }
        if (0 < m.length) {
          return;
        }
      }
    }
    d.setVisible(!1);
  }
};
Entry.Container.prototype.getView = function() {
  return this._view;
};
Entry.Container.prototype.resize = function() {
};
Entry.Container.prototype._rightClick = function(b) {
  b.stopPropagation && b.stopPropagation();
  var c = [{text:Lang.Blocks.Paste_blocks, enable:!Entry.engine.isState("run") && !!Entry.container.copiedObject, callback:function() {
    Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
  }}];
  Entry.ContextMenu.show(c, "workspace-contextmenu", {x:b.clientX, y:b.clientY});
};
Entry.Container.prototype.removeFuncBlocks = function(b) {
  this.objects_.forEach(function(c) {
    c.script.removeBlocksByType(b);
  });
};
Entry.Container.prototype.clear = function() {
  this.objects_.map(function(b) {
    b.destroy();
  });
  this.objects_ = [];
  this._extensionObjects.map(function(b) {
    b.destroy();
  });
  this._extensionObjects = [];
  Entry.playground.flushPlayground();
};
Entry.Container.prototype.selectNeighborObject = function(b) {
  var c = this.getCurrentObjects();
  if (c && 0 !== c.length) {
    var d = c.indexOf(Entry.playground.object), e = c.length;
    switch(b) {
      case "prev":
        0 > --d && (d = c.length - 1);
        break;
      case "next":
        d = ++d % e;
    }
    (b = c[d]) && Entry.container.selectObject(b.id);
  }
};
Entry.Container.prototype.getObjectIndex = function(b) {
  return this.objects_.indexOf(this.getObject(b));
};
Entry.Container.prototype.getDom = function(b) {
  if (1 <= b.length) {
    switch(b.shift()) {
      case "objectIndex":
        return this.objects_[b.shift()].getDom(b);
    }
  }
};
Entry.SVG = function(b, c) {
  b = c ? c : document.getElementById(b);
  return Entry.SVG.createElement(b);
};
Entry.SVG.NS = "http://www.w3.org/2000/svg";
Entry.SVG.NS_XLINK = "http://www.w3.org/1999/xlink";
Entry.SVG.createElement = function(b, c) {
  var d = "string" === typeof b ? document.createElementNS(Entry.SVG.NS, b) : b;
  if (c) {
    c.href && (d.setAttributeNS(Entry.SVG.NS_XLINK, "href", c.href), delete c.href);
    for (var e in c) {
      d.setAttribute(e, c[e]);
    }
  }
  d.elem = Entry.SVG.createElement;
  d.attr = Entry.SVG.attr;
  d.addClass = Entry.SVG.addClass;
  d.removeClass = Entry.SVG.removeClass;
  d.hasClass = Entry.SVG.hasClass;
  d.remove = Entry.SVG.remove;
  d.removeAttr = Entry.SVG.removeAttr;
  "text" === b && d.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
  this instanceof SVGElement && this.appendChild(d);
  return d;
};
Entry.SVG.attr = function(b, c) {
  if ("string" === typeof b) {
    var d = {};
    d[b] = c;
    b = d;
  }
  if (b) {
    b.href && (this.setAttributeNS(Entry.SVG.NS_XLINK, "href", b.href), delete b.href);
    for (var e in b) {
      this.setAttribute(e, b[e]);
    }
  }
  return this;
};
Entry.SVG.addClass = function(b) {
  for (var c = this.getAttribute("class"), d = 0; d < arguments.length; d++) {
    b = arguments[d], this.hasClass(b) || (c += " " + b);
  }
  this.setAttribute("class", c);
  return this;
};
Entry.SVG.removeClass = function(b) {
  for (var c = this.getAttribute("class"), d = 0; d < arguments.length; d++) {
    b = arguments[d], this.hasClass(b) && (c = c.replace(new RegExp("(\\s|^)" + b + "(\\s|$)"), " "));
  }
  this.setAttribute("class", c);
  return this;
};
Entry.SVG.hasClass = function(b) {
  var c = this.getAttribute("class");
  return c ? c.match(new RegExp("(\\s|^)" + b + "(\\s|$)")) : !1;
};
Entry.SVG.remove = function() {
  this.parentNode && this.parentNode.removeChild(this);
};
Entry.SVG.removeAttr = function(b) {
  this.removeAttribute(b);
};
Entry.Dialog = function(b, c, d, e) {
  b.dialog && b.dialog.remove();
  b.dialog = this;
  this.parent = b;
  this.padding = 10;
  this.border = 2;
  "number" == typeof c && (c = String(c));
  Entry.console && Entry.console.print(c, d);
  this.message_ = c = c.match(/.{1,15}/g).join("\n");
  this.mode_ = d;
  "speak" !== d && "ask" !== d || this.generateSpeak();
  e || Entry.stage.loadDialog(this);
};
Entry.Dialog.prototype.generateSpeak = function() {
  this.object = new createjs.Container;
  var b = new createjs.Text;
  b.font = "15px NanumGothic";
  b.textBaseline = "top";
  b.textAlign = "left";
  b.text = this.message_;
  var c = b.getTransformedBounds(), d = c.height, c = 10 <= c.width ? c.width : 17, e = new createjs.Shape;
  e.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").rr(-this.padding, -this.padding, c + 2 * this.padding, d + 2 * this.padding, this.padding);
  this.object.addChild(e);
  this.object.regX = c / 2;
  this.object.regY = d / 2;
  this.width = c;
  this.height = d;
  this.notch = this.createSpeakNotch("ne");
  this.update();
  this.object.addChild(this.notch);
  this.object.addChild(b);
  Entry.requestUpdate = !0;
};
Entry.Dialog.prototype.update = function() {
  var b = this.parent.object.getTransformedBounds();
  if (!b && "textBox" === this.parent.type) {
    if (this._isNoContentTried) {
      delete this._isNoContentTried;
      return;
    }
    this.parent.setText(" ");
    b = this.parent.object.getTransformedBounds();
    this._isNoContentTried = !0;
  }
  var c = "";
  -135 < b.y - this.height - 20 - this.border ? (this.object.y = b.y - this.height / 2 - 20 - this.padding, c += "n") : (this.object.y = b.y + b.height + this.height / 2 + 20 + this.padding, c += "s");
  240 > b.x + b.width + this.width ? (this.object.x = b.x + b.width + this.width / 2, c += "e") : (this.object.x = b.x - this.width / 2, c += "w");
  this.notch.type != c && (this.object.removeChild(this.notch), this.notch = this.createSpeakNotch(c), this.object.addChild(this.notch));
  this._isNoContentTried && this.parent.setText("");
  Entry.requestUpdate = !0;
};
Entry.Dialog.prototype.createSpeakNotch = function(b) {
  var c = new createjs.Shape;
  c.type = b;
  "ne" == b ? c.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, this.height + this.padding - 1.5).lt(-10, this.height + this.padding + 20).lt(20, this.height + this.padding - 1.5) : "nw" == b ? c.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, this.height + this.padding - 1.5).lt(this.width + 10, this.height + this.padding + 20).lt(this.width - 20, this.height + this.padding - 1.5) : "se" == b ? c.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, -this.padding + 1.5).lt(-10, 
  -this.padding - 20).lt(20, -this.padding + 1.5) : "sw" == b && c.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, -this.padding + 1.5).lt(this.width + 10, -this.padding - 20).lt(this.width - 20, -this.padding + 1.5);
  return c;
};
Entry.Dialog.prototype.remove = function() {
  Entry.stage.unloadDialog(this);
  this.parent.dialog = null;
  Entry.requestUpdate = !0;
};
Entry.DoneProject = function(b) {
  this.generateView(b);
};
var p = Entry.DoneProject.prototype;
p.init = function(b) {
  this.projectId = b;
};
p.generateView = function(b) {
  var c = Entry.createElement("div");
  c.addClass("entryContainerDoneWorkspace");
  this.doneContainer = c;
  var d = Entry.createElement("iframe");
  d.setAttribute("id", "doneProjectframe");
  d.setAttribute("frameborder", 0);
  d.setAttribute("src", "/api/iframe/project/" + b);
  this.doneProjectFrame = d;
  this.doneContainer.appendChild(d);
  c.addClass("entryRemove");
};
p.getView = function() {
  return this.doneContainer;
};
p.resize = function() {
  document.getElementById("entryContainerWorkspaceId");
  var b = document.getElementById("doneProjectframe"), c = this.doneContainer.offsetWidth;
  b.width = c + "px";
  b.height = 9 * c / 16 + "px";
};
Entry.Engine = function() {
  function b(b) {
    var c = b.keyCode || b.which, e = Entry.stage.inputField;
    32 == c && e && e.hasFocus() || -1 < [37, 38, 39, 40, 32].indexOf(c) && b.preventDefault();
  }
  this.state = "stop";
  this.popup = null;
  this.isUpdating = !0;
  this.speeds = [1, 15, 30, 45, 60];
  this._mouseMoved = !1;
  this.attachKeyboardCapture();
  Entry.addEventListener("canvasClick", function(b) {
    Entry.engine.fireEvent("mouse_clicked");
  });
  Entry.addEventListener("canvasClickCanceled", function(b) {
    Entry.engine.fireEvent("mouse_click_cancled");
  });
  Entry.addEventListener("entityClick", function(b) {
    Entry.engine.fireEventOnEntity("when_object_click", b);
  });
  Entry.addEventListener("entityClickCanceled", function(b) {
    Entry.engine.fireEventOnEntity("when_object_click_canceled", b);
  });
  "phone" != Entry.type && (Entry.addEventListener("stageMouseMove", function(b) {
    this._mouseMoved = !0;
  }.bind(this)), Entry.addEventListener("stageMouseOut", function(b) {
    Entry.engine.hideMouseView();
  }));
  Entry.addEventListener("run", function() {
    $(window).bind("keydown", b);
  });
  Entry.addEventListener("stop", function() {
    $(window).unbind("keydown", b);
  });
  setInterval(function() {
    this._mouseMoved && (this.updateMouseView(), this._mouseMoved = !1);
  }.bind(this), 100);
  Entry.message = new Entry.Event(window);
};
(function(b) {
  b.generateView = function(b, d) {
    if (d && "workspace" != d) {
      "minimize" == d ? (this.view_ = b, this.view_.addClass("entryEngine"), this.view_.addClass("entryEngineMinimize"), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonMinimize"), this.maximizeButton.addClass("entryMaximizeButtonMinimize"), this.view_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(b) {
        Entry.engine.toggleFullScreen();
      }), this.coordinateButton = Entry.createElement("button"), this.coordinateButton.addClass("entryEngineButtonMinimize"), this.coordinateButton.addClass("entryCoordinateButtonMinimize"), this.view_.appendChild(this.coordinateButton), this.coordinateButton.bindOnClick(function(b) {
        this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
        Entry.stage.toggleCoordinator();
      }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonMinimize"), this.stopButton.addClass("entryStopButtonMinimize"), this.stopButton.addClass("entryRemove"), this.stopButton.innerHTML = Lang.Workspace.stop, this.view_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(b) {
        this.blur();
        Entry.engine.toggleStop();
      }), this.pauseButton = Entry.createElement("button"), this.pauseButton.innerHTML = Lang.Workspace.pause, this.pauseButton.addClass("entryEngineButtonMinimize"), this.pauseButton.addClass("entryPauseButtonMinimize"), this.pauseButton.addClass("entryRemove"), this.view_.appendChild(this.pauseButton), this.pauseButton.bindOnClick(function(b) {
        this.blur();
        Entry.engine.togglePause();
      }), this.mouseView = Entry.createElement("div"), this.mouseView.addClass("entryMouseViewMinimize"), this.mouseView.addClass("entryRemove"), this.view_.appendChild(this.mouseView), Entry.addEventListener("loadComplete", function() {
        this.runButton = Entry.Dom("div", {class:"entryRunButtonBigMinimize", parent:$("#entryCanvasWrapper")});
        this.runButton.bindOnClick(function(b) {
          Entry.engine.toggleRun();
        });
      }.bind(this))) : "phone" == d && (this.view_ = b, this.view_.addClass("entryEngine", "entryEnginePhone"), this.headerView_ = Entry.createElement("div", "entryEngineHeader"), this.headerView_.addClass("entryEngineHeaderPhone"), this.view_.appendChild(this.headerView_), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonPhone", "entryMaximizeButtonPhone"), this.headerView_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(b) {
        Entry.engine.footerView_.addClass("entryRemove");
        Entry.engine.headerView_.addClass("entryRemove");
        Entry.launchFullScreen(Entry.engine.view_);
      }), document.addEventListener("fullscreenchange", function(b) {
        Entry.engine.exitFullScreen();
      }), document.addEventListener("webkitfullscreenchange", function(b) {
        Entry.engine.exitFullScreen();
      }), document.addEventListener("mozfullscreenchange", function(b) {
        Entry.engine.exitFullScreen();
      }), this.footerView_ = Entry.createElement("div", "entryEngineFooter"), this.footerView_.addClass("entryEngineFooterPhone"), this.view_.appendChild(this.footerView_), this.runButton = Entry.createElement("button"), this.runButton.addClass("entryEngineButtonPhone", "entryRunButtonPhone"), Entry.objectAddable && this.runButton.addClass("small"), this.runButton.innerHTML = Lang.Workspace.run, this.footerView_.appendChild(this.runButton), this.runButton.bindOnClick(function(b) {
        Entry.engine.toggleRun();
      }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonPhone", "entryStopButtonPhone", "entryRemove"), Entry.objectAddable && this.stopButton.addClass("small"), this.stopButton.innerHTML = Lang.Workspace.stop, this.footerView_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(b) {
        Entry.engine.toggleStop();
      }));
    } else {
      this.view_ = b;
      this.view_.addClass("entryEngine_w");
      this.view_.addClass("entryEngineWorkspace_w");
      var c = Entry.createElement("button");
      this.speedButton = c;
      this.speedButton.addClass("entrySpeedButtonWorkspace", "entryEngineTopWorkspace", "entryEngineButtonWorkspace_w");
      this.view_.appendChild(this.speedButton);
      this.speedButton.bindOnClick(function(b) {
        Entry.engine.toggleSpeedPanel();
        c.blur();
      });
      this.maximizeButton = Entry.createElement("button");
      this.maximizeButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryMaximizeButtonWorkspace_w");
      this.view_.appendChild(this.maximizeButton);
      this.maximizeButton.bindOnClick(function(b) {
        Entry.engine.toggleFullScreen();
        this.blur();
      });
      var f = Entry.createElement("button");
      this.coordinateButton = f;
      this.coordinateButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryCoordinateButtonWorkspace_w");
      this.view_.appendChild(this.coordinateButton);
      this.coordinateButton.bindOnClick(function(b) {
        this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
        f.blur();
        this.blur();
        Entry.stage.toggleCoordinator();
      });
      this.addButton = Entry.createElement("button");
      this.addButton.addClass("entryEngineButtonWorkspace_w");
      this.addButton.addClass("entryAddButtonWorkspace_w");
      this.addButton.innerHTML = Lang.Workspace.add_object;
      this.addButton.bindOnClick(function(b) {
        Entry.dispatchEvent("openSpriteManager");
        this.blur();
      });
      Entry.objectAddable || this.addButton.addClass("entryRemove");
      this.view_.appendChild(this.addButton);
      this.runButton = Entry.createElement("button");
      this.runButton.addClass("entryEngineButtonWorkspace_w");
      this.runButton.addClass("entryRunButtonWorkspace_w");
      this.runButton.innerHTML = Lang.Workspace.run;
      this.view_.appendChild(this.runButton);
      this.runButton.bindOnClick(function(b) {
        Entry.do("toggleRun", "runButton");
      });
      this.runButton2 = Entry.createElement("button");
      this.runButton2.addClass("entryEngineButtonWorkspace_w");
      this.runButton2.addClass("entryRunButtonWorkspace_w2");
      this.view_.appendChild(this.runButton2);
      this.runButton2.bindOnClick(function(b) {
        Entry.engine.toggleRun();
      });
      this.stopButton = Entry.createElement("button");
      this.stopButton.addClass("entryEngineButtonWorkspace_w");
      this.stopButton.addClass("entryStopButtonWorkspace_w");
      this.stopButton.addClass("entryRemove");
      this.stopButton.innerHTML = Lang.Workspace.stop;
      this.view_.appendChild(this.stopButton);
      this.stopButton.bindOnClick(function(b) {
        Entry.do("toggleStop", "stopButton");
      });
      this.stopButton2 = Entry.createElement("button");
      this.stopButton2.addClass("entryEngineButtonWorkspace_w");
      this.stopButton2.addClass("entryStopButtonWorkspace_w2");
      this.stopButton2.addClass("entryRemove");
      this.stopButton2.innerHTML = Lang.Workspace.stop;
      this.view_.appendChild(this.stopButton2);
      this.stopButton2.bindOnClick(function(b) {
        this.blur();
        Entry.engine.toggleStop();
      });
      this.pauseButton = Entry.createElement("button");
      this.pauseButton.addClass("entryEngineButtonWorkspace_w");
      this.pauseButton.addClass("entryPauseButtonWorkspace_w");
      this.pauseButton.addClass("entryRemove");
      this.view_.appendChild(this.pauseButton);
      this.pauseButton.bindOnClick(function(b) {
        this.blur();
        Entry.engine.togglePause();
      });
      this.mouseView = Entry.createElement("div");
      this.mouseView.addClass("entryMouseViewWorkspace_w");
      this.mouseView.addClass("entryRemove");
      this.view_.appendChild(this.mouseView);
    }
  };
  b.toggleSpeedPanel = function() {
    if (this.speedPanelOn) {
      this.speedPanelOn = !1, $(Entry.stage.canvas.canvas).animate({top:"24px"}), this.coordinateButton.removeClass("entryRemove"), this.maximizeButton.removeClass("entryRemove"), this.mouseView.removeClass("entryRemoveElement"), $(this.speedLabel_).remove(), delete this.speedLabel_, $(this.speedProgress_).fadeOut(null, function(b) {
        $(this).remove();
        delete this.speedProgress_;
      }), $(this.speedHandle_).remove(), delete this.speedHandle_;
    } else {
      this.speedPanelOn = !0;
      $(Entry.stage.canvas.canvas).animate({top:"41px"});
      this.coordinateButton.addClass("entryRemove");
      this.maximizeButton.addClass("entryRemove");
      this.mouseView.addClass("entryRemoveElement");
      this.speedLabel_ = Entry.createElement("div", "entrySpeedLabelWorkspace");
      this.speedLabel_.innerHTML = Lang.Workspace.speed;
      this.view_.insertBefore(this.speedLabel_, this.maximizeButton);
      this.speedProgress_ = Entry.createElement("table", "entrySpeedProgressWorkspace");
      for (var b = Entry.createElement("tr"), d = this.speeds, e = 0; 5 > e; e++) {
        (function(c) {
          var e = Entry.createElement("td", "progressCell" + c);
          e.bindOnClick(function() {
            Entry.engine.setSpeedMeter(d[c]);
          });
          b.appendChild(e);
        })(e);
      }
      this.view_.insertBefore(this.speedProgress_, this.maximizeButton);
      this.speedProgress_.appendChild(b);
      this.speedHandle_ = Entry.createElement("div", "entrySpeedHandleWorkspace");
      var f = (Entry.interfaceState.canvasWidth - 84) / 5;
      $(this.speedHandle_).bind("mousedown.speedPanel touchstart.speedPanel", function(b) {
        function c(b) {
          b.stopPropagation();
          b = Entry.Utils.convertMouseEvent(b);
          b = Math.floor((b.clientX - 80) / (5 * f) * 5);
          0 > b || 4 < b || Entry.engine.setSpeedMeter(Entry.engine.speeds[b]);
        }
        function d(b) {
          $(document).unbind(".speedPanel");
        }
        b.stopPropagation && b.stopPropagation();
        b.preventDefault && b.preventDefault();
        if (0 === b.button || b.originalEvent && b.originalEvent.touches) {
          Entry.Utils.convertMouseEvent(b), b = $(document), b.bind("mousemove.speedPanel touchmove.speedPanel", c), b.bind("mouseup.speedPanel touchend.speedPanel", d);
        }
      });
      this.view_.insertBefore(this.speedHandle_, this.maximizeButton);
      this.setSpeedMeter(Entry.FPS);
    }
  };
  b.setSpeedMeter = function(b) {
    var c = this.speeds.indexOf(b);
    0 > c || (c = Math.min(4, c), c = Math.max(0, c), this.speedPanelOn && (this.speedHandle_.style.left = (Entry.interfaceState.canvasWidth - 80) / 10 * (2 * c + 1) + 80 - 9 + "px"), Entry.FPS != b && (clearInterval(this.ticker), this.ticker = setInterval(this.update, Math.floor(1000 / b)), Entry.FPS = b));
  };
  b.start = function(b) {
    createjs.Ticker.setFPS(Entry.FPS);
    this.ticker || (this.ticker = setInterval(this.update, Math.floor(1000 / Entry.FPS)));
  };
  b.stop = function() {
    createjs.Ticker.reset();
    clearInterval(this.ticker);
    this.ticker = null;
  };
  b.update = function() {
    Entry.engine.isState("run") && (Entry.engine.computeObjects(), Entry.hw.update());
  };
  b.computeObjects = function() {
    Entry.container.mapObjectOnScene(this.computeFunction);
  };
  b.computeFunction = function(b) {
    b.script.tick();
  };
  Entry.Engine.computeThread = function(b, d) {
    Entry.engine.isContinue = !0;
    for (b = !1; d && Entry.engine.isContinue && !b;) {
      Entry.engine.isContinue = !d.isRepeat;
      var c = d.run();
      b = c && c === d;
      d = c;
    }
    return d;
  };
  b.isState = function(b) {
    return -1 < this.state.indexOf(b);
  };
  b.run = function() {
    this.isState("run") ? this.toggleStop() : (this.isState("stop") || this.isState("pause")) && this.toggleRun();
  };
  b.toggleRun = function(b) {
    var c = Entry.variableContainer, e = Entry.container;
    if ("pause" === this.state) {
      this.togglePause();
    } else {
      Entry.Utils.blur();
      if (Entry.playground && Entry.playground.mainWorkspace) {
        var f = Entry.playground.mainWorkspace;
        f.mode == Entry.Workspace.MODE_VIMBOARD && f._syncTextCode();
      }
      Entry.addActivity("run");
      "stop" == this.state && (e.mapEntity(function(b) {
        b.takeSnapshot();
      }), c.mapVariable(function(b) {
        b.takeSnapshot();
      }), c.mapList(function(b) {
        b.takeSnapshot();
      }), this.projectTimer.takeSnapshot(), e.inputValue.takeSnapshot(), e.takeSequenceSnapshot(), Entry.scene.takeStartSceneSnapshot(), this.state = "run", this.fireEvent("start"), this.achieveEnabled = !1 !== b);
      this.state = "run";
      "mobile" == Entry.type && this.view_.addClass("entryEngineBlueWorkspace");
      this.runButton && (this.pauseButton.innerHTML = Lang.Workspace.pause, this.runButton.addClass("run"), this.runButton.addClass("entryRemove"), this.stopButton.removeClass("entryRemove"), this.pauseButton && this.pauseButton.removeClass("entryRemove"), this.runButton2 && this.runButton2.addClass("entryRemove"), this.stopButton2 && this.stopButton2.removeClass("entryRemove"));
      this.isUpdating || (this.update(), this.isUpdating = !0);
      Entry.stage.selectObject();
      Entry.dispatchEvent("run");
    }
  };
  b.toggleStop = function() {
    var b = Entry.container, d = Entry.variableContainer;
    Entry.Utils.blur();
    Entry.addActivity("stop");
    b.mapEntity(function(b) {
      b.loadSnapshot();
      b.object.filters = [];
      b.resetFilter();
      b.dialog && b.dialog.remove();
      b.brush && b.removeBrush();
    });
    d.mapVariable(function(b) {
      b.loadSnapshot();
    });
    d.mapList(function(b) {
      b.loadSnapshot();
    });
    this.stopProjectTimer();
    b.clearRunningState();
    b.loadSequenceSnapshot();
    this.projectTimer.loadSnapshot();
    Entry.container.inputValue.loadSnapshot();
    Entry.scene.loadStartSceneSnapshot();
    Entry.Func.clearThreads();
    createjs.Sound.setVolume(1);
    createjs.Sound.stop();
    this.view_.removeClass("entryEngineBlueWorkspace");
    this.runButton && (this.runButton.removeClass("entryRemove"), this.stopButton.addClass("entryRemove"), this.pauseButton && this.pauseButton.addClass("entryRemove"), this.runButton2 && this.runButton2.removeClass("entryRemove"), this.stopButton2 && this.stopButton2.addClass("entryRemove"));
    this.state = "stop";
    Entry.dispatchEvent("stop");
    Entry.stage.hideInputField();
    (function(b) {
      b && b.getMode() === Entry.Workspace.MODE_VIMBOARD && b.codeToText();
    })(Entry.getMainWS());
  };
  b.togglePause = function() {
    var b = Entry.engine.projectTimer;
    "pause" == this.state ? (b.pausedTime += (new Date).getTime() - b.pauseStart, b.isPaused ? b.pauseStart = (new Date).getTime() : delete b.pauseStart, this.state = "run", this.runButton && (this.pauseButton.innerHTML = Lang.Workspace.pause, this.runButton.addClass("entryRemove"), this.runButton2 && this.runButton2.addClass("entryRemove"))) : (this.state = "pause", b.isPaused && (b.pausedTime += (new Date).getTime() - b.pauseStart), b.pauseStart = (new Date).getTime(), this.runButton && (this.pauseButton.innerHTML = 
    Lang.Workspace.restart, this.runButton.removeClass("entryRemove"), this.stopButton.removeClass("entryRemove"), this.runButton2 && this.runButton2.removeClass("entryRemove")));
  };
  b.fireEvent = function(b) {
    "run" === this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEvent, b);
  };
  b.raiseEvent = function(b, d) {
    b.parent.script.raiseEvent(d, b);
  };
  b.fireEventOnEntity = function(b, d) {
    "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEventOnEntity, [d, b]);
  };
  b.raiseEventOnEntity = function(b, d) {
    b === d[0] && b.parent.script.raiseEvent(d[1], b);
  };
  b.captureKeyEvent = function(b, d) {
    var c = b.keyCode, f = Entry.type;
    if (!Entry.Utils.isInInput(b) || d) {
      b.ctrlKey && "workspace" == f ? 83 == c ? (b.preventDefault(), Entry.dispatchEvent("saveWorkspace")) : 82 == c ? (b.preventDefault(), Entry.engine.run()) : 90 == c && (b.preventDefault(), Entry.dispatchEvent(b.shiftKey ? "redo" : "undo")) : Entry.engine.isState("run") && Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["keyPress", c]), Entry.engine.isState("stop") && "workspace" === f && 37 <= c && 40 >= c && Entry.stage.moveSprite(b);
    }
  };
  b.raiseKeyEvent = function(b, d) {
    return b.parent.script.raiseEvent(d[0], b, String(d[1]));
  };
  b.updateMouseView = function() {
    var b = Entry.stage.mouseCoordinate;
    this.mouseView.textContent = "X : " + b.x + ", Y : " + b.y;
    this.mouseView.removeClass("entryRemove");
  };
  b.hideMouseView = function() {
    this.mouseView.addClass("entryRemove");
  };
  b.toggleFullScreen = function(b) {
    this.popup ? (this.popup.remove(), this.popup = null) : (this.popup = new Entry.Popup(b), "workspace" != Entry.type && (b = $(document), $(this.popup.body_).css("top", b.scrollTop()), $("body").css("overflow", "hidden"), popup.window_.appendChild(Entry.stage.canvas.canvas), popup.window_.appendChild(Entry.engine.runButton[0])), popup.window_.appendChild(Entry.engine.view_), "workspace" === Entry.type && Entry.targetChecker && popup.window_.appendChild(Entry.targetChecker.getStatusView()[0]));
    Entry.windowResized.notify();
  };
  b.closeFullScreen = function() {
    this.popup && (this.popup.remove(), this.popup = null);
    Entry.windowResized.notify();
  };
  b.exitFullScreen = function() {
    document.webkitIsFullScreen || document.mozIsFullScreen || document.isFullScreen || (Entry.engine.footerView_.removeClass("entryRemove"), Entry.engine.headerView_.removeClass("entryRemove"));
    Entry.windowResized.notify();
  };
  b.showProjectTimer = function() {
    Entry.engine.projectTimer && this.projectTimer.setVisible(!0);
  };
  b.hideProjectTimer = function(b, d) {
    var c = this.projectTimer;
    if (c && c.isVisible() && !this.isState("run")) {
      for (var f = Entry.container.getAllObjects(), g = ["get_project_timer_value", "reset_project_timer", "set_visible_project_timer", "choose_project_timer_action"], h = 0, k = f.length; h < k; h++) {
        for (var l = f[h].script, m = 0; m < g.length; m++) {
          var r = l.getBlockList(!1, g[m]);
          if (d) {
            var q = r.indexOf(b);
            -1 < q && r.splice(q, 1);
          }
          if (0 < r.length) {
            return;
          }
        }
      }
      c.setVisible(!1);
    }
  };
  b.clearTimer = function() {
    clearInterval(this.ticker);
    clearInterval(this.projectTimer.tick);
  };
  b.startProjectTimer = function() {
    var b = this.projectTimer;
    b && (b.start = (new Date).getTime(), b.isInit = !0, b.isPaused = !1, b.pausedTime = 0, b.tick = setInterval(function(b) {
      Entry.engine.updateProjectTimer();
    }, 1000 / 60));
  };
  b.stopProjectTimer = function() {
    var b = this.projectTimer;
    b && (this.updateProjectTimer(0), b.isPaused = !1, b.isInit = !1, b.pausedTime = 0, clearInterval(b.tick));
  };
  b.resetTimer = function() {
    var b = this.projectTimer;
    if (b.isInit) {
      var d = b.isPaused;
      delete b.pauseStart;
      this.updateProjectTimer(0);
      b.pausedTime = 0;
      if (b.isPaused = d) {
        clearInterval(b.tick), b.isInit = !1, delete b.start;
      }
    }
  };
  b.updateProjectTimer = function(b) {
    var c = Entry.engine, e = c.projectTimer;
    if (e) {
      var f = (new Date).getTime();
      "undefined" == typeof b ? e.isPaused || c.isState("pause") || e.setValue((f - (e.start || f) - e.pausedTime) / 1000) : (e.setValue(b), e.pausedTime = 0, e.start = f);
    }
  };
  b.raiseMessage = function(b) {
    Entry.message.notify(Entry.variableContainer.getMessage(b));
    return Entry.container.mapEntityIncludeCloneOnScene(this.raiseKeyEvent, ["when_message_cast", b]);
  };
  b.getDom = function(b) {
    if (1 <= b.length) {
      switch(b.shift()) {
        case "runButton":
          return this.runButton;
        case "stopButton":
          return this.stopButton;
      }
    }
  };
  b.attachKeyboardCapture = function() {
    Entry.keyPressed && (this._keyboardEvent && this.detachKeyboardCapture(), this._keyboardEvent = Entry.keyPressed.attach(this, this.captureKeyEvent));
  };
  b.detachKeyboardCapture = function() {
    Entry.keyPressed && this._keyboardEvent && (Entry.keyPressed.detach(this._keyboardEvent), delete this._keyboardEvent);
  };
  b.applyOption = function() {
    Entry.objectAddable ? (this.runButton.addClass("small"), this.stopButton.addClass("small"), this.addButton.removeClass("entryRemove")) : (this.runButton.removeClass("small"), this.stopButton.removeClass("small"), this.addButton.addClass("entryRemove"));
  };
})(Entry.Engine.prototype);
Entry.EntityObject = function(b) {
  this.parent = b;
  this.type = b.objectType;
  this.flip = !1;
  this.collision = Entry.Utils.COLLISION.NONE;
  this.id = Entry.generateHash();
  "sprite" == this.type ? (this.object = new createjs.Bitmap, this.effect = {}, this.setInitialEffectValue()) : "textBox" == this.type && (this.object = new createjs.Container, this.textObject = new createjs.Text, this.textObject.font = "20px Nanum Gothic", this.textObject.textBaseline = "middle", this.textObject.textAlign = "center", this.bgObject = new createjs.Shape, this.bgObject.graphics.setStrokeStyle(1).beginStroke("#f00").drawRect(0, 0, 100, 100), this.object.addChild(this.bgObject), this.object.addChild(this.textObject), 
  this.fontType = "Nanum Gothic", this.fontSize = 20, this.strike = this.underLine = this.fontItalic = this.fontBold = !1);
  this.object.entity = this;
  this.object.cursor = "pointer";
  this.object.on("mousedown", function(b) {
    var c = this.entity.parent.id;
    Entry.dispatchEvent("entityClick", this.entity);
    Entry.stage.isObjectClick = !0;
    "minimize" != Entry.type && Entry.stage.isEntitySelectable() && (this.offset = {x:-this.parent.x + this.entity.getX() - (0.75 * b.stageX - 240), y:-this.parent.y - this.entity.getY() - (0.75 * b.stageY - 135)}, this.cursor = "move", this.entity.initCommand(), Entry.container.selectObject(c));
  });
  this.object.on("pressup", function(b) {
    Entry.dispatchEvent("entityClickCanceled", this.entity);
    this.cursor = "pointer";
    this.entity.checkCommand();
  });
  this.object.on("pressmove", function(b) {
    "minimize" != Entry.type && Entry.stage.isEntitySelectable() && !this.entity.parent.getLock() && (this.entity.doCommand(), this.entity.setX(0.75 * b.stageX - 240 + this.offset.x), this.entity.setY(-(0.75 * b.stageY - 135) - this.offset.y), Entry.stage.updateObject());
  });
};
Entry.EntityObject.prototype.injectModel = function(b, c) {
  "sprite" == this.type ? this.setImage(b) : "textBox" == this.type && (b = this.parent, c.text = c.text || b.text || b.name, this.setFont(c.font), this.setBGColour(c.bgColor), this.setColour(c.colour), this.setUnderLine(c.underLine), this.setStrike(c.strike), this.setText(c.text));
  c && this.syncModel_(c);
};
Entry.EntityObject.prototype.syncModel_ = function(b) {
  this.setX(b.x);
  this.setY(b.y);
  this.setRegX(b.regX);
  this.setRegY(b.regY);
  this.setScaleX(b.scaleX);
  this.setScaleY(b.scaleY);
  this.setRotation(b.rotation);
  this.setDirection(b.direction, !0);
  this.setLineBreak(b.lineBreak);
  this.setWidth(b.width);
  this.setHeight(b.height);
  this.setText(b.text);
  this.setTextAlign(b.textAlign);
  this.setFontSize(b.fontSize || this.getFontSize());
  this.setVisible(b.visible);
};
Entry.EntityObject.prototype.initCommand = function() {
  Entry.engine.isState("stop") && (this.isCommandValid = !1, Entry.stateManager && Entry.stateManager.addCommand("edit entity", this, this.restoreEntity, this.toJSON()));
};
Entry.EntityObject.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.EntityObject.prototype.checkCommand = function() {
  Entry.engine.isState("stop") && !this.isCommandValid && Entry.dispatchEvent("cancelLastCommand");
};
Entry.EntityObject.prototype.restoreEntity = function(b) {
  var c = this.toJSON();
  this.syncModel_(b);
  Entry.dispatchEvent("updateObject");
  Entry.stateManager && Entry.stateManager.addCommand("restore object", this, this.restoreEntity, c);
};
Entry.EntityObject.prototype.setX = function(b) {
  "number" == typeof b && (this.x = b, this.object.x = this.x, this.isClone || this.parent.updateCoordinateView(), this.updateDialog(), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.getX = function() {
  return this.x;
};
Entry.EntityObject.prototype.setY = function(b) {
  "number" == typeof b && (this.y = b, this.object.y = -this.y, this.isClone || this.parent.updateCoordinateView(), this.updateDialog(), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.getY = function() {
  return this.y;
};
Entry.EntityObject.prototype.getDirection = function() {
  return this.direction;
};
Entry.EntityObject.prototype.setDirection = function(b, c) {
  b || (b = 0);
  "vertical" != this.parent.getRotateMethod() || c || (0 <= this.direction && 180 > this.direction) == (0 <= b && 180 > b) || (this.setScaleX(-this.getScaleX()), Entry.stage.updateObject(), this.flip = !this.flip);
  this.direction = b.mod(360);
  this.object.direction = this.direction;
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.setRotation = function(b) {
  "free" != this.parent.getRotateMethod() && (b = 0);
  this.rotation = b.mod(360);
  this.object.rotation = this.rotation;
  this.updateDialog();
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRotation = function() {
  return this.rotation;
};
Entry.EntityObject.prototype.setRegX = function(b) {
  "textBox" == this.type && (b = 0);
  this.regX = b;
  this.object.regX = this.regX;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRegX = function() {
  return this.regX;
};
Entry.EntityObject.prototype.setRegY = function(b) {
  "textBox" == this.type && (b = 0);
  this.regY = b;
  this.object.regY = this.regY;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRegY = function() {
  return this.regY;
};
Entry.EntityObject.prototype.setScaleX = function(b) {
  this.scaleX = b;
  this.object.scaleX = this.scaleX;
  this.parent.updateCoordinateView();
  this.updateDialog();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getScaleX = function() {
  return this.scaleX;
};
Entry.EntityObject.prototype.setScaleY = function(b) {
  this.scaleY = b;
  this.object.scaleY = this.scaleY;
  this.parent.updateCoordinateView();
  this.updateDialog();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getScaleY = function() {
  return this.scaleY;
};
Entry.EntityObject.prototype.setSize = function(b) {
  1 > b && (b = 1);
  b /= this.getSize();
  this.setScaleX(this.getScaleX() * b);
  this.setScaleY(this.getScaleY() * b);
  this.isClone || this.parent.updateCoordinateView();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getSize = function() {
  return (this.getWidth() * Math.abs(this.getScaleX()) + this.getHeight() * Math.abs(this.getScaleY())) / 2;
};
Entry.EntityObject.prototype.setWidth = function(b) {
  this.width = b;
  this.object.width = this.width;
  this.textObject && this.getLineBreak() && (this.textObject.lineWidth = this.width);
  this.updateDialog();
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getWidth = function() {
  return this.width;
};
Entry.EntityObject.prototype.setHeight = function(b) {
  this.height = b;
  this.textObject && (this.object.height = this.height, this.alignTextBox());
  this.updateDialog();
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getHeight = function() {
  return this.height;
};
Entry.EntityObject.prototype.setColour = function(b) {
  b || (b = "#000000");
  this.colour = b;
  this.textObject && (this.textObject.color = this.colour);
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getColour = function() {
  return this.colour;
};
Entry.EntityObject.prototype.setBGColour = function(b) {
  b || (b = "transparent");
  this.bgColor = b;
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getBGColour = function() {
  return this.bgColor;
};
Entry.EntityObject.prototype.setUnderLine = function(b) {
  void 0 === b && (b = !1);
  this.underLine = b;
  this.textObject.underLine = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getUnderLine = function() {
  return this.underLine;
};
Entry.EntityObject.prototype.setStrike = function(b) {
  void 0 === b && (b = !1);
  this.strike = b;
  this.textObject.strike = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getStrike = function() {
  return this.strike;
};
Entry.EntityObject.prototype.getFont = function() {
  var b = [];
  this.fontBold && b.push("bold");
  this.fontItalic && b.push("italic");
  b.push(this.getFontSize() + "px");
  b.push(this.fontType);
  return b.join(" ");
};
Entry.EntityObject.prototype.setFont = function(b) {
  if ("textBox" == this.parent.objectType && this.font !== b) {
    b || (b = "20px Nanum Gothic");
    var c = b.split(" "), d;
    if (d = -1 < c.indexOf("bold")) {
      c.splice(d - 1, 1), this.setFontBold(!0);
    }
    if (d = -1 < c.indexOf("italic")) {
      c.splice(d - 1, 1), this.setFontItalic(!0);
    }
    d = parseInt(c.shift());
    this.setFontSize(d);
    this.setFontType(c.join(" "));
    this.font = this.getFont();
    this.textObject.font = b;
    Entry.stage.update();
    this.setWidth(this.textObject.getMeasuredWidth());
    this.updateBG();
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.setLineHeight = function() {
  switch(this.getFontType()) {
    case "Nanum Gothic Coding":
      this.textObject.lineHeight = this.fontSize;
      break;
    default:
      this.textObject.lineHeight = 0;
  }
};
Entry.EntityObject.prototype.syncFont = function() {
  this.textObject.font = this.getFont();
  this.setLineHeight();
  Entry.stage.update();
  if (this.getLineBreak()) {
    if ("Nanum Gothic Coding" == this.fontType) {
      var b = this.textObject.getMeasuredLineHeight();
      this.textObject.y = b / 2 - this.getHeight() / 2 + 10;
    }
  } else {
    this.setWidth(this.textObject.getMeasuredWidth());
  }
  Entry.stage.updateObject();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getFontType = function() {
  return this.fontType;
};
Entry.EntityObject.prototype.setFontType = function(b) {
  "textBox" == this.parent.objectType && (this.fontType = b ? b : "Nanum Gothic", this.syncFont());
};
Entry.EntityObject.prototype.getFontSize = function(b) {
  return this.fontSize;
};
Entry.EntityObject.prototype.setFontSize = function(b) {
  "textBox" == this.parent.objectType && this.fontSize != b && (this.fontSize = b ? b : 20, this.syncFont(), this.alignTextBox());
};
Entry.EntityObject.prototype.setFontBold = function(b) {
  this.fontBold = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.toggleFontBold = function() {
  this.fontBold = !this.fontBold;
  this.syncFont();
  return this.fontBold;
};
Entry.EntityObject.prototype.setFontItalic = function(b) {
  this.fontItalic = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.toggleFontItalic = function() {
  this.fontItalic = !this.fontItalic;
  this.syncFont();
  return this.fontItalic;
};
Entry.EntityObject.prototype.setFontName = function(b) {
  for (var c = this.font.split(" "), d = [], e = 0, f = c.length; e < f; e++) {
    ("bold" === c[e] || "italic" === c[e] || -1 < c[e].indexOf("px")) && d.push(c[e]);
  }
  this.setFont(d.join(" ") + " " + b);
};
Entry.EntityObject.prototype.getFontName = function() {
  if ("textBox" == this.type) {
    if (!this.font) {
      return "";
    }
    for (var b = this.font.split(" "), c = [], d = 0, e = b.length; d < e; d++) {
      "bold" !== b[d] && "italic" !== b[d] && -1 === b[d].indexOf("px") && c.push(b[d]);
    }
    return c.join(" ").trim();
  }
};
Entry.EntityObject.prototype.setText = function(b) {
  "textBox" == this.parent.objectType && (void 0 === b && (b = ""), this.text = b, this.textObject.text = this.text, this.lineBreak || (this.setWidth(this.textObject.getMeasuredWidth()), this.parent.updateCoordinateView()), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getText = function() {
  return this.text;
};
Entry.EntityObject.prototype.setTextAlign = function(b) {
  "textBox" == this.parent.objectType && (void 0 === b && (b = Entry.TEXT_ALIGN_CENTER), this.textAlign = b, this.textObject.textAlign = Entry.TEXT_ALIGNS[this.textAlign], this.alignTextBox(), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getTextAlign = function() {
  return this.textAlign;
};
Entry.EntityObject.prototype.setLineBreak = function(b) {
  if ("textBox" == this.parent.objectType) {
    void 0 === b && (b = !1);
    var c = this.lineBreak;
    this.lineBreak = b;
    c && !this.lineBreak ? (this.textObject.lineWidth = null, this.setHeight(this.textObject.getMeasuredLineHeight()), this.setText(this.getText().replace(/\n/g, ""))) : !c && this.lineBreak && (this.setFontSize(this.getFontSize() * this.getScaleX()), this.setHeight(3 * this.textObject.getMeasuredLineHeight()), this.setWidth(this.getWidth() * this.getScaleX()), this.setScaleX(1), this.setScaleY(1), this.textObject.lineWidth = this.getWidth(), this.alignTextBox(), "Nanum Gothic Coding" == this.fontType && 
    (b = this.textObject.getMeasuredLineHeight(), this.textObject.y = b / 2 - this.getHeight() / 2 + 10));
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.getLineBreak = function() {
  return this.lineBreak;
};
Entry.EntityObject.prototype.setVisible = function(b) {
  void 0 === b && (b = !0);
  this.visible = b;
  this.object.visible = this.visible;
  this.dialog && this.syncDialogVisible();
  Entry.requestUpdate = !0;
  return this.visible;
};
Entry.EntityObject.prototype.getVisible = function() {
  return this.visible;
};
Entry.EntityObject.prototype.setImage = function(b) {
  var c = this;
  delete b._id;
  Entry.assert("sprite" == this.type, "Set image is only for sprite object");
  b.id || (b.id = Entry.generateHash());
  this.picture = b;
  var d = this.picture.dimension, e = this.getRegX() - this.getWidth() / 2, f = this.getRegY() - this.getHeight() / 2;
  this.setWidth(d.width);
  this.setHeight(d.height);
  d.scaleX || (d.scaleX = this.getScaleX(), d.scaleY = this.getScaleY());
  this.setScaleX(this.scaleX);
  this.setScaleY(this.scaleY);
  this.setRegX(this.width / 2 + e);
  this.setRegY(this.height / 2 + f);
  var g = b.id + this.id, h = Entry.container.getCachedPicture(g);
  h ? (Entry.image = h, this.object.image = h, this.object.cache(0, 0, this.getWidth(), this.getHeight())) : (h = new Image, b.fileurl ? h.src = b.fileurl : (b = b.filename, h.src = Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/image/" + b + ".png"), this.object.image = h, this.object.cache(0, 0, this.getWidth(), this.getHeight()), h.onload = function(b) {
    Entry.container.cachePicture(g, h);
    Entry.image = h;
    c.object.image = h;
    c.object.cache(0, 0, c.getWidth(), c.getHeight());
    Entry.requestUpdate = !0;
  });
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.applyFilter = function(b, c) {
  var d = this.effect, e = this.object, f = function(b, c) {
    var d = [], e;
    for (e in b) {
      b[e] !== c[e] && d.push(e);
    }
    return d;
  }(d, this.getInitialEffectValue());
  if (b || 0 !== f.length) {
    Array.isArray(c) && (f = f.concat(c)), function(b, c) {
      var d = [], e = Entry.adjustValueWithMaxMin;
      if (-1 < f.indexOf("brightness")) {
        b.brightness = b.brightness;
        var g = new createjs.ColorMatrix;
        g.adjustColor(e(b.brightness, -100, 100), 0, 0, 0);
        g = new createjs.ColorMatrixFilter(g);
        d.push(g);
      }
      -1 < f.indexOf("hue") && (b.hue = b.hue.mod(360), g = new createjs.ColorMatrix, g.adjustColor(0, 0, 0, b.hue), g = new createjs.ColorMatrixFilter(g), d.push(g));
      if (-1 < f.indexOf("hsv")) {
        g = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];
        var h = 10.8 * b.hsv * Math.PI / 180, q = Math.cos(h), h = Math.sin(h), n = Math.abs(b.hsv / 100);
        1 < n && (n -= Math.floor(n));
        0 < n && 0.33 >= n ? g = [1, 0, 0, 0, 0, 0, q, h, 0, 0, 0, -1 * h, q, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : 0.66 >= n ? g = [q, 0, h, 0, 0, 0, 1, 0, 0, 0, h, 0, q, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : 0.99 >= n && (g = [q, h, 0, 0, 0, -1 * h, q, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
        g = (new createjs.ColorMatrix).concat(g);
        g = new createjs.ColorMatrixFilter(g);
        d.push(g);
      }
      -1 < f.indexOf("alpha") && (c.alpha = b.alpha = e(b.alpha, 0, 1));
      c.filters = d;
    }(d, e), e.cache(0, 0, this.getWidth(), this.getHeight()), Entry.requestUpdate = !0;
  }
};
Entry.EntityObject.prototype.resetFilter = function() {
  "sprite" == this.parent.objectType && (this.object.filters = [], this.setInitialEffectValue(), this.object.alpha = this.effect.alpha, this.object.cache(0, 0, this.getWidth(), this.getHeight()), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.updateDialog = function() {
  this.dialog && this.dialog.update();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
  this.collision = Entry.Utils.COLLISION.NONE;
};
Entry.EntityObject.prototype.loadSnapshot = function() {
  this.snapshot_ && this.syncModel_(this.snapshot_);
  "sprite" == this.parent.objectType && this.setImage(this.parent.getPicture());
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.removeClone = function() {
  if (this.isClone) {
    this.dialog && this.dialog.remove();
    this.brush && this.removeBrush();
    Entry.stage.unloadEntity(this);
    var b = this.parent.clonedEntities.indexOf(this);
    this.parent.clonedEntities.splice(b, 1);
    Entry.Utils.isFunction(this.clearExecutor) && this.clearExecutor();
  }
};
Entry.EntityObject.prototype.clearExecutor = function() {
  this.parent.script.clearExecutorsByEntity(this);
};
Entry.EntityObject.prototype.toJSON = function() {
  var b = {};
  b.x = Entry.cutDecimal(this.getX());
  b.y = Entry.cutDecimal(this.getY());
  b.regX = Entry.cutDecimal(this.getRegX());
  b.regY = Entry.cutDecimal(this.getRegY());
  b.scaleX = this.getScaleX();
  b.scaleY = this.getScaleY();
  b.rotation = Entry.cutDecimal(this.getRotation());
  b.direction = Entry.cutDecimal(this.getDirection());
  b.width = Entry.cutDecimal(this.getWidth());
  b.height = Entry.cutDecimal(this.getHeight());
  b.font = this.getFont();
  b.visible = this.getVisible();
  "textBox" == this.parent.objectType && (b.colour = this.getColour(), b.text = this.getText(), b.textAlign = this.getTextAlign(), b.lineBreak = this.getLineBreak(), b.bgColor = this.getBGColour(), b.underLine = this.getUnderLine(), b.strike = this.getStrike(), b.fontSize = this.getFontSize());
  return b;
};
Entry.EntityObject.prototype.setInitialEffectValue = function() {
  this.effect = this.getInitialEffectValue();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getInitialEffectValue = function() {
  return {blur:0, hue:0, hsv:0, brightness:0, contrast:0, saturation:0, alpha:1};
};
Entry.EntityObject.prototype.removeBrush = function() {
  Entry.stage.selectedObjectContainer.removeChild(this.shape);
  this.shape = this.brush = null;
};
Entry.EntityObject.prototype.eraseBrush = function() {
  var b = this.brush;
  if (b) {
    var c = b._stroke.style, d = b._strokeStyle.width;
    b.clear().setStrokeStyle(d).beginStroke(c);
    b.moveTo(this.getX(), -1 * this.getY());
    Entry.requestUpdate = !0;
  }
};
Entry.EntityObject.prototype.updateBG = function() {
  if (this.bgObject) {
    this.bgObject.graphics.clear();
    var b = this.getWidth(), c = this.getHeight();
    this.bgObject.graphics.setStrokeStyle(1).beginStroke().beginFill(this.getBGColour()).drawRect(-b / 2, -c / 2, b, c);
    if (this.getLineBreak()) {
      this.bgObject.x = 0;
    } else {
      switch(this.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          this.bgObject.x = b / 2;
          break;
        case Entry.TEXT_ALIGN_CENTER:
          this.bgObject.x = 0;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          this.bgObject.x = -b / 2;
      }
    }
  }
};
Entry.EntityObject.prototype.alignTextBox = function() {
  if ("textBox" == this.type) {
    var b = this.textObject;
    if (this.lineBreak) {
      var c = b.getMeasuredLineHeight();
      b.y = c / 2 - this.getHeight() / 2;
      "Nanum Gothic Coding" == this.fontType && (b.y = c / 2 - this.getHeight() / 2 + 10);
      switch(this.textAlign) {
        case Entry.TEXT_ALIGN_CENTER:
          b.x = 0;
          break;
        case Entry.TEXT_ALIGN_LEFT:
          b.x = -this.getWidth() / 2;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          b.x = this.getWidth() / 2;
      }
      b.maxHeight = this.getHeight();
    } else {
      b.x = 0, b.y = 0;
    }
  }
};
Entry.EntityObject.prototype.syncDialogVisible = function() {
  this.dialog && (this.dialog.object.visible = this.visible);
};
Entry.Extension = function() {
};
(function(b) {
  b.renderView = function() {
  };
  b.toggleInformation = function() {
  };
})(Entry.Extension.prototype);
Entry.TargetChecker = function(b, c, d) {
  this.isForEdit = c;
  this.goals = [];
  this.publicGoals = [];
  this.unachievedGoals = [];
  this.remainPublicGoal = 0;
  this.lastMessage = "";
  this.isForEdit && (this.watchingBlocks = [], Entry.playground.mainWorkspace.blockMenu.unbanClass("checker"), Entry.addEventListener("run", this.reRegisterAll.bind(this)));
  this.type = d || "mission";
  this.isSuccess = this.isFail = !1;
  this.entity = this;
  this.parent = this;
  Entry.achieveEvent = new Entry.Event;
  Entry.addEventListener("stop", this.reset.bind(this));
  Entry.registerAchievement = this.registerAchievement.bind(this);
  this.script = new Entry.Code(b ? b : [], this);
  Entry.targetChecker = this;
};
Entry.Utils.inherit(Entry.Extension, Entry.TargetChecker);
(function(b) {
  b.renderView = function() {
    this._view = Entry.Dom("li", {class:"targetChecker"});
    this._view.bindOnClick(function(b) {
      Entry.playground.injectObject(this);
    }.bind(this));
    this.updateView();
    this.isForEdit || this._view.addClass("entryRemove");
    return this._view;
  };
  b.generateStatusView = function(b) {
    this._statusView = Entry.Dom("div", {class:"entryTargetStatus"});
    var c = Entry.Dom("div", {class:"innerWrapper", parent:this._statusView});
    this._statusViewIndicator = Entry.Dom("div", {class:"statusIndicator", parent:c});
    c = Entry.Dom("div", {class:"statusMessage", parent:c});
    this._statusViewContent = Entry.Dom("p", {parent:c});
    b && ($(Entry.view_).addClass("iframeWithTargetStatus"), Entry.view_.appendChild(this._statusView[0]));
    this.updateView();
    this.showDefaultMessage();
  };
  b.updateView = function() {
    this._view && (this.renderViewMessage(), this.isSuccess ? this._view.addClass("success") : this._view.removeClass("success"), this.isFail ? this._view.addClass("fail") : this._view.removeClass("fail"));
    this._statusView && this.renderIndicatorMessage();
  };
  b.getStatusView = function() {
    this._statusView || this.generateStatusView();
    return this._statusView;
  };
  b.showStatusMessage = function(b) {
    this.lastMessage = b;
    this.lastIndicatorMessage = null;
    this.renderIndicatorMessage();
    this._statusViewContent && !this.isFail && this._statusViewContent.text(b);
    this.renderViewMessage();
  };
  b.achieveCheck = function(b, d) {
    !this.isFail && Entry.engine.achieveEnabled && (b ? this.achieveGoal(d) : this.fail(d));
  };
  b.achieveGoal = function(b) {
    this.isSuccess || this.isFail || 0 > this.unachievedGoals.indexOf(b) || (this.unachievedGoals.splice(this.unachievedGoals.indexOf(b), 1), -1 < this.publicGoals.indexOf(b) && this.remainPublicGoal--, 0 === this.remainPublicGoal && (this.isSuccess = !0, this.showSuccessMessage(), Entry.achieveEvent.notify("success", b)), this.updateView());
  };
  b.fail = function(b) {
    this.isSuccess || this.isFail || (this.showStatusMessage(b), this.isFail = !0, Entry.achieveEvent.notify("fail", b), this.updateView());
  };
  b.reset = function() {
    this.unachievedGoals = this.goals.concat();
    this.remainPublicGoal = this.publicGoals.length;
    this.isSuccess = this.isFail = !1;
    this.updateView();
    this.showDefaultMessage();
  };
  b.showDefaultMessage = function() {
    switch(this.type) {
      case "mission":
        this.showStatusMessage("\uc791\ud488\uc744 \uc2e4\ud589 \ud574\ubd05\uc2dc\ub2e4.");
        break;
      case "mission_intro":
        this.showStatusMessage("\uc791\ud488\uc744 \uc2e4\ud589\ud558\uba70 \ubbf8\uc158\uc744 \ud30c\uc545\ud574 \ubd05\uc2dc\ub2e4.");
        this.renderIndicatorMessage("\ubbf8\uc158");
        break;
      case "guide_intro":
        this.showStatusMessage("\uc791\ud488\uc744 \uc2e4\ud589\ud558\uba70 \ubb34\uc5c7\uc744 \ub9cc\ub4e4\uc9c0 \uc54c\uc544 \ubd05\uc2dc\ub2e4."), this.renderIndicatorMessage("\uc548\ub0b4");
    }
  };
  b.showSuccessMessage = function() {
    switch(this.type) {
      case "mission_intro":
        this.showStatusMessage("\uc774\uc81c \uc791\ud488\uc744 \ub9cc\ub4e4\uba70 \ubbf8\uc158\uc744 \ud574\uacb0\ud574 \ubd05\uc2dc\ub2e4.");
        this.renderIndicatorMessage("\ubbf8\uc158");
        break;
      case "guide_intro":
        this.showStatusMessage("\uc774\uc81c \ud559\uc2b5\uc744 \uc2dc\uc791\ud574 \ubd05\uc2dc\ub2e4."), this.renderIndicatorMessage("\uc548\ub0b4");
    }
  };
  b.checkGoal = function(b) {
    return -1 < this.goals.indexOf(b) && 0 > this.unachievedGoals.indexOf(b);
  };
  b.registerAchievement = function(b) {
    this.isForEdit && this.watchingBlocks.push(b);
    b.params[1] && 0 > this.goals.indexOf(b.params[0] + "") && (this.goals.push(b.params[0] + ""), b.params[2] && this.publicGoals.push(b.params[0] + ""), this.remainPublicGoal = this.publicGoals.length);
    this.reset();
  };
  b.reRegisterAll = function() {
    var b = this.script.getBlockList(!1, "check_lecture_goal");
    this.watchingBlocks = b;
    this.goals = _.uniq(b.filter(function(b) {
      return 1 === b.params[1];
    }).map(function(b) {
      return b.params[0] + "";
    }));
    this.publicGoals = _.uniq(b.filter(function(b) {
      return 1 === b.params[1] && 1 === b.params[2];
    }).map(function(b) {
      return b.params[0] + "";
    }));
    this.remainPublicGoal = this.publicGoals.length;
  };
  b.clearExecutor = function() {
    this.script.clearExecutors();
  };
  b.destroy = function() {
    this.reset();
    Entry.achieveEvent.clear();
    this.script.destroy();
    $(this._view).remove();
  };
  b.renderViewMessage = function() {
    var b = this.goals.length, d = this.publicGoals.length;
    this._view && this._view.html("\ubaa9\ud45c : " + (b - this.unachievedGoals.length) + " / " + b + " , \uacf5\uc2dd \ubaa9\ud45c : " + (d - this.remainPublicGoal) + " / " + d + "<br>" + this.lastMessage);
  };
  b.renderIndicatorMessage = function(b) {
    this._statusViewIndicator && (b && (this.lastIndicatorMessage = b), b = this.publicGoals.length, this._statusViewIndicator.text(this.lastIndicatorMessage || Math.min(b - this.remainPublicGoal + 1, b) + "/" + b));
  };
})(Entry.TargetChecker.prototype);
Entry.Func = function(b) {
  this.id = b ? b.id : Entry.generateHash();
  if (b && b.content && 4 < b.content.length) {
    var c = b.content;
  }
  this.content = c ? new Entry.Code(c) : new Entry.Code([[{type:"function_create", copyable:!1, deletable:!1, x:40, y:40}]]);
  this._backupContent = this.blockMenuBlock = this.block = null;
  this.hashMap = {};
  this.paramMap = {};
  Entry.generateFunctionSchema(this.id);
  if (b && b.content) {
    b = this.content._blockMap;
    for (var d in b) {
      Entry.Func.registerParamBlock(b[d].type);
    }
    Entry.Func.generateWsBlock(this);
  }
  Entry.Func.registerFunction(this);
  Entry.Func.updateMenu();
};
Entry.Func.threads = {};
Entry.Func.registerFunction = function(b) {
  if (Entry.playground) {
    var c = Entry.playground.mainWorkspace;
    c && (this._targetFuncBlock = c.getBlockMenu().code.createThread([{type:"func_" + b.id, category:"func", x:-9999}]), b.blockMenuBlock = this._targetFuncBlock);
  }
};
Entry.Func.executeFunction = function(b) {
  var c = this.threads[b];
  if (c = Entry.Engine.computeThread(c.entity, c)) {
    return this.threads[b] = c, !0;
  }
  delete this.threads[b];
  return !1;
};
Entry.Func.clearThreads = function() {
  this.threads = {};
};
Entry.Func.prototype.init = function(b) {
  this.id = b.id;
  this.content = Blockly.Xml.textToDom(b.content);
  this.block = Blockly.Xml.textToDom("<xml>" + b.block + "</xml>").childNodes[0];
};
Entry.Func.prototype.destroy = function() {
  this.blockMenuBlock && this.blockMenuBlock.destroy();
};
Entry.Func.edit = function(b) {
  this.unbindFuncChangeEvent();
  this.unbindWorkspaceStateChangeEvent();
  this.cancelEdit();
  Entry.Func.isEdit = !0;
  this.targetFunc = b;
  this.initEditView(b.content);
  this.bindFuncChangeEvent();
  this.updateMenu();
  setTimeout(function() {
    var c = Entry.block["func_" + b.id];
    c && c.paramsBackupEvent && c.paramsBackupEvent.notify();
    this._backupContent = b.content.stringify();
  }.bind(this), 0);
};
Entry.Func.initEditView = function(b) {
  this.menuCode || this.setupMenuCode();
  var c = Entry.getMainWS();
  c.setMode(Entry.Workspace.MODE_OVERLAYBOARD);
  c.changeOverlayBoardCode(b);
  this._workspaceStateEvent = c.changeEvent.attach(this, function(b) {
    this.endEdit(b || "cancelEdit");
    c.getMode() === Entry.Workspace.MODE_VIMBOARD && c.blockMenu.banClass("functionInit");
  });
  b.board.alignThreads();
};
Entry.Func.endEdit = function(b) {
  this.unbindFuncChangeEvent();
  this.unbindWorkspaceStateChangeEvent();
  var c = this.targetFunc.id;
  this.targetFunc && this.targetFunc.content && this.targetFunc.content.destroyView();
  switch(b) {
    case "save":
      this.save();
      break;
    case "cancelEdit":
      this.cancelEdit();
  }
  this._backupContent = null;
  delete this.targetFunc;
  (b = Entry.block["func_" + c]) && b.destroyParamsBackupEvent && b.destroyParamsBackupEvent.notify();
  this.updateMenu();
  Entry.Func.isEdit = !1;
};
Entry.Func.save = function() {
  this.targetFunc.generateBlock(!0);
  Entry.variableContainer.saveFunction(this.targetFunc);
  var b = Entry.getMainWS();
  b && b.overlayModefrom == Entry.Workspace.MODE_VIMBOARD && (b = {}, b.boardType = Entry.Workspace.MODE_VIMBOARD, b.textType = Entry.Vim.TEXT_TYPE_PY, b.runType = Entry.Vim.WORKSPACE_MODE, Entry.getMainWS().setMode(b), Entry.variableContainer.functionAddButton_.addClass("disable"));
};
Entry.Func.syncFuncName = function(b) {
  var c = 0;
  b = b.split(" ");
  var d = "";
  var e = Blockly.mainWorkspace.getAllBlocks();
  for (var f = 0; f < e.length; f++) {
    var g = e[f];
    if ("function_general" === g.type) {
      var h = g.inputList;
      for (var k = 0; k < h.length; k++) {
        g = h[k], 0 < g.fieldRow.length && g.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != g.fieldRow[0].text_ && (d += g.fieldRow[0].text_, d += " ");
      }
      d = d.trim();
      if (d === this.srcFName && this.srcFName.split(" ").length == b.length) {
        for (d = 0; d < h.length; d++) {
          if (g = h[d], 0 < g.fieldRow.length && g.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != g.fieldRow[0].text_) {
            if (void 0 === b[c]) {
              h.splice(d, 1);
              break;
            } else {
              g.fieldRow[0].text_ = b[c];
            }
            c++;
          }
        }
      }
      d = "";
      c = 0;
    }
  }
  c = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, c);
};
Entry.Func.cancelEdit = function() {
  if (this.targetFunc) {
    this.targetFunc.block ? this._backupContent && (this.targetFunc.content.load(this._backupContent), Entry.generateFunctionSchema(this.targetFunc.id), Entry.Func.generateWsBlock(this.targetFunc, !0)) : (this._targetFuncBlock.destroy(), delete Entry.variableContainer.functions_[this.targetFunc.id], delete Entry.variableContainer.selected);
    Entry.variableContainer.updateList();
    var b = Entry.getMainWS();
    b && b.overlayModefrom == Entry.Workspace.MODE_VIMBOARD && (b = {}, b.boardType = Entry.Workspace.MODE_VIMBOARD, b.textType = Entry.Vim.TEXT_TYPE_PY, b.runType = Entry.Vim.WORKSPACE_MODE, Entry.getMainWS().setMode(b), Entry.variableContainer.functionAddButton_.addClass("disable"));
  }
};
Entry.Func.getMenuXml = function() {
  var b = [];
  this.targetFunc || (b = b.concat(this.createBtn));
  if (this.targetFunc) {
    var c = this.FIELD_BLOCK, c = c.replace("#1", Entry.generateHash()), c = c.replace("#2", Entry.generateHash()), c = Blockly.Xml.textToDom(c).childNodes, b = b.concat(Entry.nodeListToArray(c));
  }
  for (var d in Entry.variableContainer.functions_) {
    c = Entry.variableContainer.functions_[d], c === this.targetFunc ? (c = Entry.Func.generateBlock(this.targetFunc, Blockly.Xml.workspaceToDom(Entry.Func.workspace), c.id).block, b.push(c)) : b.push(c.block);
  }
  return b;
};
Entry.Func.syncFunc = function() {
  var b = Entry.Func;
  if (b.targetFunc) {
    var c = b.workspace.topBlocks_[0].toString(), d = b.workspace.topBlocks_.length;
    (b.fieldText != c || b.workspaceLength != d) && 1 > Blockly.Block.dragMode_ && (b.updateMenu(), b.fieldText = c, b.workspaceLength = d);
  }
};
Entry.Func.setupMenuCode = function() {
  var b = Entry.playground.mainWorkspace;
  if (b) {
    var b = b.getBlockMenu(), c = b.code;
    this._fieldLabel = c.createThread([{type:"function_field_label", category:"func", x:-9999}]).getFirstBlock();
    this._fieldString = c.createThread([{type:"function_field_string", category:"func", x:-9999, copyable:!1, params:[{type:this.requestParamBlock("string")}]}]).getFirstBlock();
    this._fieldBoolean = c.createThread([{type:"function_field_boolean", copyable:!1, category:"func", x:-9999, params:[{type:this.requestParamBlock("boolean")}]}]).getFirstBlock();
    this.menuCode = c;
    b.align();
  }
};
Entry.Func.refreshMenuCode = function() {
  Entry.playground.mainWorkspace && (this.menuCode || this.setupMenuCode(), this._fieldString.params[0].changeType(this.requestParamBlock("string")), this._fieldBoolean.params[0].changeType(this.requestParamBlock("boolean")));
};
Entry.Func.requestParamBlock = function(b) {
  switch(b) {
    case "string":
      var c = Entry.block.function_param_string;
      break;
    case "boolean":
      c = Entry.block.function_param_boolean;
      break;
    default:
      return null;
  }
  var d = b + "Param_" + Entry.generateHash();
  Entry.block[d] = Entry.Func.createParamBlock(d, c, b);
  return d;
};
Entry.Func.registerParamBlock = function(b) {
  if (b) {
    if (-1 < b.indexOf("stringParam")) {
      var c = Entry.block.function_param_string;
    } else {
      -1 < b.indexOf("booleanParam") && (c = Entry.block.function_param_boolean);
    }
    c && Entry.Func.createParamBlock(b, c, b);
  }
};
Entry.Func.createParamBlock = function(b, c, d) {
  d = /string/gi.test(d) ? "function_param_string" : "function_param_boolean";
  var e = function() {
  };
  e.prototype = c;
  e = new e;
  e.changeEvent = new Entry.Event;
  e.template = Lang.template[d];
  return Entry.block[b] = e;
};
Entry.Func.updateMenu = function() {
  var b = Entry.getMainWS();
  if (b) {
    var c = b.getBlockMenu();
    this.targetFunc ? (!this.menuCode && this.setupMenuCode(), c.banClass("functionInit", !0), c.unbanClass("functionEdit", !0)) : (!b.isVimMode() && c.unbanClass("functionInit", !0), c.banClass("functionEdit", !0));
    "func" === c.lastSelector && c.align();
  }
};
Entry.Func.prototype.edit = function() {
  Entry.Func.isEdit || (Entry.Func.isEdit = !0, Entry.Func.svg ? this.parentView.appendChild(this.svg) : Entry.Func.initEditView());
};
Entry.Func.generateBlock = function(b) {
  b = Entry.block["func_" + b.id];
  var c = {template:b.template, params:b.params}, d = /(%\d)/mi, e = b.template.split(d), f = "", g = 0, h = 0, k;
  for (k in e) {
    var l = e[k];
    d.test(l) ? (l = Number(l.split("%")[1]) - 1, l = b.params[l], "Indicator" !== l.type && ("boolean" === l.accept ? (f += Lang.template.function_param_boolean + (g ? g : ""), g++) : (f += Lang.template.function_param_string + (h ? h : ""), h++))) : f += l;
  }
  return {block:c, description:f};
};
Entry.Func.prototype.generateBlock = function(b) {
  b = Entry.Func.generateBlock(this);
  this.block = b.block;
  this.description = b.description;
};
Entry.Func.generateWsBlock = function(b, c) {
  this.unbindFuncChangeEvent();
  b = b ? b : this.targetFunc;
  var d = b.content.getEventMap("funcDef")[0];
  if (d) {
    for (var e = d.params[0], f = 0, g = 0, h = [], k = "", d = b.hashMap, l = b.paramMap, m = []; e;) {
      var r = e.params[0];
      switch(e.type) {
        case "function_field_label":
          k = k + " " + r;
          break;
        case "function_field_boolean":
          Entry.Mutator.mutate(r.type, {template:Lang.Blocks.FUNCTION_logical_variable + " " + (f + 1)});
          d[r.type] = !1;
          l[r.type] = f + g;
          f++;
          h.push({type:"Block", accept:"boolean"});
          k += " %" + (f + g);
          m.push(e.id);
          break;
        case "function_field_string":
          Entry.Mutator.mutate(r.type, {template:Lang.Blocks.FUNCTION_character_variable + " " + (g + 1)}), d[r.type] = !1, l[r.type] = f + g, g++, k += " %" + (f + g), h.push({type:"Block", accept:"string"}), m.push(e.id);
      }
      e = e.getOutputBlock();
    }
    f++;
    k += " %" + (f + g);
    h.push({type:"Indicator", img:"block_icon/function_03.png", size:12});
    e = "func_" + b.id;
    f = Entry.block[e].params.slice();
    f.pop();
    g = h.slice();
    g.pop();
    f = f.length;
    l = g.length;
    g = {};
    if (l > f) {
      if (f = b.outputBlockIds) {
        for (g = 0; f[g] === m[g];) {
          g++;
        }
        for (l = 0; f[f.length - l - 1] === m[m.length - l - 1];) {
          l++;
        }
        l = m.length - l - 1;
        g = {type:"insert", startPos:g, endPos:l};
      }
    } else {
      g = l < f ? {type:"cut", pos:l} : {type:"noChange"};
    }
    g.isRestore = c;
    b.outputBlockIds = m;
    Entry.Mutator.mutate(e, {params:h, template:k}, g);
    for (var q in d) {
      d[q] ? (c = -1 < q.indexOf("string") ? Lang.Blocks.FUNCTION_character_variable : Lang.Blocks.FUNCTION_logical_variable, Entry.Mutator.mutate(q, {template:c})) : d[q] = !0;
    }
    this.bindFuncChangeEvent(b);
  }
};
Entry.Func.bindFuncChangeEvent = function(b) {
  b = b ? b : this.targetFunc;
  !this._funcChangeEvent && b.content.getEventMap("funcDef")[0].view && (this._funcChangeEvent = b.content.getEventMap("funcDef")[0].view._contents[1].changeEvent.attach(this, this.generateWsBlock));
};
Entry.Func.unbindFuncChangeEvent = function() {
  this._funcChangeEvent && (this._funcChangeEvent.destroy(), delete this._funcChangeEvent);
};
Entry.Func.unbindWorkspaceStateChangeEvent = function() {
  this._workspaceStateEvent && (this._workspaceStateEvent.destroy(), delete this._workspaceStateEvent);
};
Entry.Helper = function() {
  this.visible = !1;
  Entry.addEventListener("workspaceChangeMode", function() {
    this._blockView && this.renderBlock(this._blockView.type);
  }.bind(this));
  this.resize = Entry.Utils.debounce(this.resize, 300);
};
p = Entry.Helper.prototype;
p.generateView = function(b, c) {
  if (!this.parentView_) {
    this.parentView_ = b;
    this.blockHelpData = EntryStatic.blockInfo;
    this.view = c = Entry.createElement("div", "entryBlockHelperWorkspace");
    Entry.isForLecture && c.addClass("lecture");
    this.parentView_.appendChild(c);
    this._contentView = b = Entry.createElement("div", "entryBlockHelperContentWorkspace");
    var d = Entry.createElement("div");
    d.addClass("entryBlockHelperTitle textModeElem");
    d.innerHTML = "\uba85\ub839\uc5b4";
    b.appendChild(d);
    b.addClass("entryBlockHelperIntro");
    Entry.isForLecture && b.addClass("lecture");
    c.appendChild(b);
    this.blockHelperContent_ = b;
    this.blockHelperView_ = c;
    c = Entry.createElement("div", "entryBlockHelperBlockWorkspace");
    this.blockHelperContent_.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("entryBlockHelperTitle textModeElem");
    d.innerHTML = "\uc124\uba85";
    b.appendChild(d);
    d = Entry.createElement("div", "entryBlockHelperDescriptionWorkspace");
    d.addClass("entryBlockHelperContent selectAble");
    this.blockHelperContent_.appendChild(d);
    d.innerHTML = Lang.Helper.Block_click_msg;
    this.blockHelperDescription_ = d;
    d = Entry.createElement("div");
    d.addClass("entryBlockHelperTitle textModeElem");
    d.innerHTML = "\uc694\uc18c";
    b.appendChild(d);
    this._elementsTitle = d;
    this._elementsContainer = Entry.createElement("div", "entryBlockHelperElementsContainer");
    this._elementsContainer.addClass("entryBlockHelperContent textModeElem selectAble");
    b.appendChild(this._elementsContainer);
    "undefined" !== typeof CodeMirror && (d = Entry.createElement("div"), d.addClass("entryBlockHelperTitle textModeElem"), d.innerHTML = "\uc608\uc2dc \ucf54\ub4dc", b.appendChild(d), d = Entry.createElement("div", "entryBlockHelperCodeMirrorContainer"), d.addClass("textModeElem"), b.appendChild(d), this.codeMirror = CodeMirror(d, {lineNumbers:!0, value:"", mode:{name:"python"}, indentUnit:4, theme:"default", viewportMargin:10, styleActiveLine:!1, readOnly:!0}), this._doc = this.codeMirror.getDoc(), 
    this._codeMirror = this.codeMirror, d = Entry.createElement("div"), d.addClass("entryBlockHelperTitle textModeElem"), d.innerHTML = "\uc608\uc2dc \uc124\uba85", b.appendChild(d), this._codeMirrorDesc = Entry.createElement("div"), this._codeMirrorDesc.addClass("entryBlockHelperContent textModeElem selectAble"), b.appendChild(this._codeMirrorDesc));
    this._renderView = new Entry.RenderView($(c), "LEFT_MOST");
    this.code = new Entry.Code([]);
    this.code.isFor = "blockHelper";
    this._renderView.changeCode(this.code);
    this.first = !0;
  }
};
p.bindWorkspace = function(b) {
  b && (this._blockViewObserver && this._blockViewObserver.destroy(), this.workspace = b, this._renderView && (this._renderView.workspace = b), this._blockViewObserver = b.observe(this, "_updateSelectedBlock", ["selectedBlockView"]));
};
p._updateSelectedBlock = function() {
  var b = this.workspace.selectedBlockView;
  if (b && this.visible && b != this._blockView) {
    var c = b.block.type;
    this._blockView = b;
    this.renderBlock(c);
  }
};
p.renderBlock = function(b) {
  var c = Lang.Helper[b];
  if (b && this.visible && c && !Entry.block[b].isPrimitive) {
    this.first && (this.blockHelperContent_.removeClass("entryBlockHelperIntro"), this.first = !1);
    this.code.clear();
    var d = Entry.block[b].def || {type:b};
    if (this.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD) {
      this._contentView.addClass("textMode");
      this.blockHelperDescription_.innerHTML = Lang.PythonHelper[b + "_desc"];
      c = Lang.PythonHelper[b + "_elements"];
      this._elementsContainer.innerHTML = "";
      if (c) {
        for (this._elementsTitle.removeClass("entryRemove"), c = c.split("%next"); c.length;) {
          var e = c.shift().split("-- "), f = Entry.createElement("div");
          f.addClass("entryBlockHelperElementsContainer");
          var g = Entry.createElement("div");
          g.innerHTML = e[0];
          g.addClass("elementLeft");
          var h = Entry.createElement("div");
          h.addClass("elementRight");
          h.innerHTML = e[1];
          f.appendChild(g);
          f.appendChild(h);
          this._elementsContainer.appendChild(f);
        }
      } else {
        this._elementsTitle.addClass("entryRemove");
      }
      this._codeMirrorDesc.innerHTML = Lang.PythonHelper[b + "_exampleDesc"];
      this._codeMirror.setValue(Lang.PythonHelper[b + "_exampleCode"]);
      this.codeMirror.refresh();
      d = Entry.block[b].pyHelpDef || d;
    } else {
      this._contentView.removeClass("textMode"), this.blockHelperDescription_.innerHTML = c;
    }
    this.code.createThread([d]);
    this.code.board.align();
    this.code.board.resize();
    this._renderView.align();
    this._renderView.setDomSize();
  }
};
p.getView = function() {
  return this.view;
};
p.resize = function() {
  this.codeMirror && this.codeMirror.refresh();
};
Entry.HWMontior = {};
Entry.HWMonitor = function(b) {
  this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  this._hwModule = b;
  var c = this;
  Entry.addEventListener("windowResized", function() {
    var b = c._hwModule.monitorTemplate.mode;
    "both" == b && (c.resize(), c.resizeList());
    "list" == b ? c.resizeList() : c.resize();
  });
  Entry.addEventListener("hwModeChange", function() {
    c.changeMode();
  });
  this.changeOffset = 0;
  this.scale = 0.5;
  this._listPortViews = {};
};
(function(b) {
  b.initView = function() {
    this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  };
  b.generateView = function() {
    this.snap = Entry.SVG("hwMonitor");
    this._svgGroup = this.snap.elem("g");
    this._portMap = {n:[], e:[], s:[], w:[]};
    var b = this._hwModule.monitorTemplate, d = {href:Entry.mediaFilePath + b.imgPath, x:-b.width / 2, y:-b.height / 2, width:b.width, height:b.height};
    this._portViews = {};
    this.hwView = this._svgGroup.elem("image");
    this.hwView = this.hwView.attr(d);
    this._template = b;
    b = b.ports;
    this.pathGroup = null;
    this.pathGroup = this._svgGroup.elem("g");
    var d = [], e;
    for (e in b) {
      var f = this.generatePortView(b[e], "_svgGroup");
      this._portViews[e] = f;
      d.push(f);
    }
    d.sort(function(b, c) {
      return b.box.x - c.box.x;
    });
    var g = this._portMap;
    d.map(function(b) {
      (1 > (Math.atan2(-b.box.y, b.box.x) / Math.PI + 2) % 2 ? g.n : g.s).push(b);
    });
    this.resize();
  };
  b.toggleMode = function(b) {
    var c = this._hwModule.monitorTemplate;
    "list" == b ? (c.TempPort = null, this._hwModule.monitorTemplate.ports && (this._hwModule.monitorTemplate.TempPort = this._hwModule.monitorTemplate.ports, this._hwModule.monitorTemplate.listPorts = this.addPortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._svgGroup && $(this._svgGroup).remove(), $(this._pathGroup).remove(), this._hwModule.monitorTemplate.mode = "list", this.generateListView()) : (this._hwModule.monitorTemplate.TempPort && 
    (this._hwModule.monitorTemplate.ports = this._hwModule.monitorTemplate.TempPort, this._hwModule.monitorTemplate.listPorts = this.removePortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._hwModule.monitorTemplate.mode = "both", this.generateListView(), this.generateView());
  };
  b.setHwmonitor = function(b) {
    this._hwmodule = b;
  };
  b.changeMode = function(b) {
    "both" == this._hwModule.monitorTemplate.mode ? this.toggleMode("list") : "list" == this._hwModule.monitorTemplate.mode && this.toggleMode("both");
  };
  b.addPortEle = function(b, d) {
    if ("object" != typeof d) {
      return b;
    }
    for (var c in d) {
      b[c] = d[c];
    }
    return b;
  };
  b.removePortEle = function(b, d) {
    if ("object" != typeof d) {
      return b;
    }
    for (var c in d) {
      delete b[c];
    }
    return b;
  };
  b.generateListView = function() {
    this._portMapList = {n:[]};
    this._svglistGroup = null;
    this.listsnap = Entry.SVG("hwMonitor");
    this._svglistGroup = this.listsnap.elem("g");
    var b = this._hwModule.monitorTemplate;
    this._template = b;
    b = b.listPorts;
    this.pathGroup = this._svglistGroup.elem("g");
    var d = [], e;
    for (e in b) {
      var f = this.generatePortView(b[e], "_svglistGroup");
      this._listPortViews[e] = f;
      d.push(f);
    }
    var g = this._portMapList;
    d.map(function(b) {
      g.n.push(b);
    });
    this.resizeList();
  };
  b.generatePortView = function(b, d) {
    d = this[d].elem("g");
    d.addClass("hwComponent");
    var c = this.pathGroup.elem("path").attr({d:"m0,0", fill:"none", stroke:"input" === b.type ? "#00979d" : "#A751E3", "stroke-width":3});
    var f = d.elem("rect").attr({x:0, y:0, width:150, height:22, rx:4, ry:4, fill:"#fff", stroke:"#a0a1a1"}), g = d.elem("text").attr({x:4, y:12, fill:"#000", "class":"hwComponentName", "alignment-baseline":"central"});
    g.textContent = b.name;
    g = g.getComputedTextLength();
    d.elem("rect").attr({x:g + 8, y:2, width:30, height:18, rx:9, ry:9, fill:"input" === b.type ? "#00979d" : "#A751E3"});
    var h = d.elem("text").attr({x:g + 13, y:12, fill:"#fff", "class":"hwComponentValue", "alignment-baseline":"central"});
    h.textContent = 0;
    g += 40;
    f.attr({width:g});
    return {group:d, value:h, type:b.type, path:c, box:{x:b.pos.x - this._template.width / 2, y:b.pos.y - this._template.height / 2, width:g}, width:g};
  };
  b.getView = function() {
    return this.svgDom;
  };
  b.update = function() {
    var b = Entry.hw.portData, d = Entry.hw.sendQueue, e = this._hwModule.monitorTemplate.mode, f = this._hwModule.monitorTemplate.keys || [], g = [];
    if ("list" == e) {
      g = this._listPortViews;
    } else {
      if ("both" == e) {
        if (g = this._listPortViews, this._portViews) {
          for (var h in this._portViews) {
            g[h] = this._portViews[h];
          }
        }
      } else {
        g = this._portViews;
      }
    }
    if (d) {
      for (h in d) {
        0 != d[h] && g[h] && (g[h].type = "output");
      }
    }
    for (var k in g) {
      if (e = g[k], "input" == e.type) {
        var l = b[k];
        0 < f.length && $.each(f, function(b, c) {
          if ($.isPlainObject(l)) {
            l = l[c] || 0;
          } else {
            return !1;
          }
        });
        e.value.textContent = l ? l : 0;
        e.group.getElementsByTagName("rect")[1].attr({fill:"#00979D"});
      } else {
        l = d[k], 0 < f.length && $.each(f, function(b, c) {
          if ($.isPlainObject(l)) {
            l = l[c] || 0;
          } else {
            return !1;
          }
        }), e.value.textContent = l ? l : 0, e.group.getElementsByTagName("rect")[1].attr({fill:"#A751E3"});
      }
    }
  };
  b.resize = function() {
    var b;
    this.hwView && this.hwView.attr({transform:"scale(" + this.scale + ")"});
    this.svgDom && (b = this.svgDom.get(0).getBoundingClientRect());
    this._svgGroup.attr({transform:"translate(" + b.width / 2 + "," + b.height / 1.8 + ")"});
    this._rect = b;
    0 >= this._template.height || 0 >= b.height || (this.scale = b.height / this._template.height * this._template.height / 1000, this.align());
  };
  b.resizeList = function() {
    var b = this.svgDom.get(0).getBoundingClientRect();
    this._svglistGroup.attr({transform:"translate(" + b.width / 2 + "," + b.height / 2 + ")"});
    this._rect = b;
    this.alignList();
  };
  b.align = function() {
    var b = this._portMap.s.concat();
    this._alignNS(b, this.scale / 3 * this._template.height + 5, 27);
    b = this._portMap.n.concat();
    this._alignNS(b, -this._template.height * this.scale / 3 - 32, -27);
    b = this._portMap.e.concat();
    this._alignEW(b, -this._template.width * this.scale / 3 - 5, -27);
    b = this._portMap.w.concat();
    this._alignEW(b, this._template.width * this.scale / 3 - 32, -27);
  };
  b.alignList = function() {
    var b = this._hwModule.monitorTemplate.listPorts;
    for (var d = b.length, e = 0; e < b.length; e++) {
      b[e].group.attr({transform:"translate(" + this._template.width * (e / d - 0.5) + "," + (-this._template.width / 2 - 30) + ")"});
    }
    b = this._portMapList.n.concat();
    this._alignNSList(b, -this._template.width * this.scale / 2 - 32, -27);
  };
  b._alignEW = function(b, d, e) {
    var c = b.length, g = this._rect.height - 50;
    tP = -g / 2;
    bP = g / 2;
    height = this._rect.height;
    listVLine = wholeHeight = 0;
    mode = this._hwModule.monitorTemplate;
    for (g = 0; g < c; g++) {
      wholeHeight += b[g].height + 5;
    }
    wholeHeight < bP - tP && (bP = wholeHeight / 2 + 3, tP = -wholeHeight / 2 - 3);
    for (; 1 < c;) {
      var h = b.shift();
      g = b.pop();
      var k = tP;
      var l = bP;
      var m = e;
      wholeWidth <= bP - tP ? (tP += h.width + 5, bP -= g.width + 5, m = 0) : 0 === b.length ? (tP = (tP + bP) / 2 - 3, bP = tP + 6) : (tP = Math.max(tP, -width / 2 + h.width) + 15, bP = Math.min(bP, width / 2 - g.width) - 15);
      wholeWidth -= h.width + g.width + 10;
      d += m;
    }
    b.length && b[0].group.attr({transform:"translate(" + d + ",60)"});
    h && rPort && (this._movePort(h, d, tP, k), this._movePort(rPort, d, bP, l));
  };
  b._alignNS = function(b, d, e) {
    for (var c = -this._rect.width / 2, g = this._rect.width / 2, h = this._rect.width, k = 0, l = 0; l < b.length; l++) {
      k += b[l].width + 5;
    }
    k < g - c && (g = k / 2 + 3, c = -k / 2 - 3);
    for (; 1 < b.length;) {
      var l = b.shift(), m = b.pop(), r = c, q = g, n = e;
      k <= g - c ? (c += l.width + 5, g -= m.width + 5, n = 0) : 0 === b.length ? (c = (c + g) / 2 - 3, g = c + 6) : (c = Math.max(c, -h / 2 + l.width) + 15, g = Math.min(g, h / 2 - m.width) - 15);
      this._movePort(l, c, d, r);
      this._movePort(m, g, d, q);
      k -= l.width + m.width + 10;
      d += n;
    }
    b.length && this._movePort(b[0], (g + c - b[0].width) / 2, d, 100);
  };
  b._alignNSList = function(b, d) {
    d = this._rect.width;
    initX = -this._rect.width / 2 + 10;
    initY = -this._rect.height / 2 + 10;
    for (var c = listLine = wholeWidth = 0; c < b.length; c++) {
      wholeWidth += b[c].width;
    }
    for (var f = 0, g = 0, h = initX, k, l, m = 0, c = 0; c < b.length; c++) {
      l = b[c], c != b.length - 1 && (m = b[c + 1]), g += l.width, lP = initX, k = initY + 30 * f, l.group.attr({transform:"translate(" + lP + "," + k + ")"}), initX += l.width + 10, g > d - (l.width + m.width / 2.2) && (f += 1, initX = h, g = 0);
    }
  };
  b._movePort = function(b, d, e, f) {
    var c = d, h = b.box.x * this.scale, k = b.box.y * this.scale;
    d > f ? (c = d - b.width, d = d > h && h > f ? "M" + h + "," + e + "L" + h + "," + k : "M" + (d + f) / 2 + "," + e + "l0," + (k > e ? 28 : -3) + "H" + h + "L" + h + "," + k) : d = d < h && h < f ? "m" + h + "," + e + "L" + h + "," + k : "m" + (f + d) / 2 + "," + e + "l0," + (k > e ? 28 : -3) + "H" + h + "L" + h + "," + k;
    b.group.attr({transform:"translate(" + c + "," + e + ")"});
    b.path.attr({d:d});
  };
})(Entry.HWMonitor.prototype);
Entry.HW = function() {
  this.sessionRoomId = localStorage.getItem("entryhwRoomId");
  this.sessionRoomId || (this.sessionRoomId = this.createRandomRoomId(), localStorage.setItem("entryhwRoomId", this.sessionRoomId));
  this.connectTrial = 0;
  this.isFirstConnect = !0;
  this.requireVerion = "v1.6.1";
  this.downloadPath = "http://download.play-entry.org/apps/Entry_HW_1.6.9_Setup.exe";
  this.downloadPathOsx = "http://download.play-entry.org/apps/Entry_HW-1.6.9.dmg";
  this.hwPopupCreate();
  this.initSocket();
  this.connected = !1;
  this.portData = {};
  this.sendQueue = {};
  this.outputQueue = {};
  this.settingQueue = {};
  this.socketType = this.hwModule = this.selectedDevice = null;
  Entry.addEventListener("stop", this.setZero);
  this.hwInfo = {"1.1":Entry.Arduino, "1.2":Entry.SensorBoard, "1.3":Entry.CODEino, "1.4":Entry.joystick, "1.5":Entry.dplay, "1.6":Entry.nemoino, "1.7":Entry.Xbot, "1.8":Entry.ardublock, "1.9":Entry.ArduinoExt, "1.A":Entry.Cobl, "2.4":Entry.Hamster, "2.5":Entry.Albert, "3.1":Entry.Bitbrick, "4.2":Entry.Arduino, "5.1":Entry.Neobot, "7.1":Entry.Robotis_carCont, "7.2":Entry.Robotis_openCM70, "8.1":Entry.Arduino, "A.1":Entry.SmartBoard, "B.1":Entry.Codestar, "C.1":Entry.DaduBlock, "C.2":Entry.DaduBlock_Car, 
  "D.1":Entry.robotori, "F.1":Entry.byrobot_dronefighter_controller, "F.2":Entry.byrobot_dronefighter_drive, "F.3":Entry.byrobot_dronefighter_flight, "10.1":Entry.Roborobo_Roduino, "10.2":Entry.Roborobo_SchoolKit, "12.1":Entry.EV3, "13.1":Entry.rokoboard, "14.1":Entry.Chocopi, "15.1":Entry.coconut, "16.1":Entry.MODI, "18.1":Entry.Altino};
};
Entry.HW.TRIAL_LIMIT = 2;
p = Entry.HW.prototype;
p.createRandomRoomId = function() {
  return "xxxxxxxxyx".replace(/[xy]/g, function(b) {
    var c = 16 * Math.random() | 0;
    return ("x" == b ? c : c & 3 | 8).toString(16);
  });
};
p.connectWebSocket = function(b, c) {
  var d = this, e = io(b, c);
  e.io.reconnectionAttempts(Entry.HW.TRIAL_LIMIT);
  e.io.reconnectionDelayMax(1000);
  e.io.timeout(1000);
  e.on("connect", function() {
    d.socketType = "WebSocket";
    d.initHardware(e);
  });
  e.on("mode", function(b) {
    0 === e.mode && 1 === b && d.disconnectHardware();
    d.socketMode = b;
    e.mode = b;
  });
  e.on("message", function(b) {
    if (b.data && "string" === typeof b.data) {
      switch(b.data) {
        case "disconnectHardware":
          d.disconnectHardware();
          break;
        default:
          var c = JSON.parse(b.data);
          d.checkDevice(c, b.version);
          d.updatePortData(c);
      }
    }
  });
  e.on("disconnect", function() {
    d.initSocket();
  });
  return e;
};
p.initSocket = function() {
  try {
    this.connected = !1;
    this.tlsSocketIo && this.tlsSocketIo.removeAllListeners();
    this.socketIo && this.socketIo.removeAllListeners();
    this.isOpenHardware || this.checkOldClient();
    if (-1 < location.protocol.indexOf("https")) {
      this.tlsSocketIo = this.connectWebSocket("https://hardware.play-entry.org:23518", {query:{client:!0, roomId:this.sessionRoomId}});
    } else {
      try {
        this.socketIo = this.connectWebSocket("http://127.0.0.1:23518", {query:{client:!0, roomId:this.sessionRoomId}});
      } catch (b) {
      }
      try {
        this.tlsSocketIo = this.connectWebSocket("https://hardware.play-entry.org:23518", {query:{client:!0, roomId:this.sessionRoomId}});
      } catch (b) {
      }
    }
    Entry.dispatchEvent("hwChanged");
  } catch (b) {
  }
};
p.checkOldClient = function() {
  try {
    var b = this, c = new WebSocket("wss://hardware.play-entry.org:23518");
    c.onopen = function() {
      b.popupHelper.show("newVersion", !0);
      c.close();
    };
  } catch (d) {
  }
};
p.retryConnect = function() {
  this.isOpenHardware = !1;
  Entry.HW.TRIAL_LIMIT = 5;
  this.initSocket();
};
p.openHardwareProgram = function() {
  var b = this;
  this.isOpenHardware = !0;
  Entry.HW.TRIAL_LIMIT = 5;
  this.executeHardware();
  this.socket && this.socket.connected || setTimeout(function() {
    b.initSocket();
  }, 1000);
};
p.initHardware = function(b) {
  this.socket = b;
  this.connectTrial = 0;
  this.connected = !0;
  Entry.dispatchEvent("hwChanged");
  Entry.playground && Entry.playground.object && Entry.playground.setMenu(Entry.playground.object.objectType);
};
p.disconnectHardware = function() {
  Entry.propertyPanel && Entry.propertyPanel.removeMode("hw");
  this.hwModule = this.selectedDevice = void 0;
  Entry.dispatchEvent("hwChanged");
};
p.disconnectedSocket = function() {
  this.tlsSocketIo.close();
  this.socketIo && this.socketIo.close();
  Entry.propertyPanel && Entry.propertyPanel.removeMode("hw");
  this.socket = void 0;
  this.connectTrial = 0;
  this.connected = !1;
  this.hwModule = this.selectedDevice = void 0;
  Entry.dispatchEvent("hwChanged");
  Entry.toast.alert("\ud558\ub4dc\uc6e8\uc5b4 \ud504\ub85c\uadf8\ub7a8 \uc5f0\uacb0 \uc885\ub8cc", "\ud558\ub4dc\uc6e8\uc5b4 \ud504\ub85c\uadf8\ub7a8\uacfc\uc758 \uc5f0\uacb0\uc774 \uc885\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.", !1);
};
p.setDigitalPortValue = function(b, c) {
  this.sendQueue[b] = c;
  this.removePortReadable(b);
};
p.getAnalogPortValue = function(b) {
  return this.connected ? this.portData["a" + b] : 0;
};
p.getDigitalPortValue = function(b) {
  if (!this.connected) {
    return 0;
  }
  this.setPortReadable(b);
  return void 0 !== this.portData[b] ? this.portData[b] : 0;
};
p.setPortReadable = function(b) {
  this.sendQueue.readablePorts || (this.sendQueue.readablePorts = []);
  var c = !1, d;
  for (d in this.sendQueue.readablePorts) {
    if (this.sendQueue.readablePorts[d] == b) {
      c = !0;
      break;
    }
  }
  c || this.sendQueue.readablePorts.push(b);
};
p.removePortReadable = function(b) {
  if (this.sendQueue.readablePorts || Array.isArray(this.sendQueue.readablePorts)) {
    var c;
    for (c in this.sendQueue.readablePorts) {
      if (this.sendQueue.readablePorts[c] == b) {
        var d = Number(c);
        break;
      }
    }
    this.sendQueue.readablePorts = void 0 != d ? this.sendQueue.readablePorts.slice(0, d).concat(this.sendQueue.readablePorts.slice(d + 1, this.sendQueue.readablePorts.length)) : [];
  }
};
p.update = function() {
  this.socket && (this.socket.disconnected || this.socket.emit("message", {data:JSON.stringify(this.sendQueue), mode:this.socket.mode, type:"utf8"}));
};
p.updatePortData = function(b) {
  this.portData = b;
  this.hwMonitor && Entry.propertyPanel && "hw" == Entry.propertyPanel.selected && this.hwMonitor.update();
};
p.closeConnection = function() {
  this.socket && this.socket.close();
};
p.downloadConnector = function() {
  window.open("MacIntel" === navigator.platform ? this.downloadPathOsx : this.downloadPath, "_blank").focus();
};
p.downloadGuide = function() {
  window.open("http://download.play-entry.org/data/hardware_manual.zip", "download");
};
p.downloadSource = function() {
  window.open("http://play-entry.com/down/board.ino", "_blank").focus();
};
p.setZero = function() {
  Entry.hw.hwModule && Entry.hw.hwModule.setZero();
};
p.checkDevice = function(b, c) {
  if (void 0 !== b.company) {
    var d = [Entry.Utils.convertIntToHex(b.company), ".", Entry.Utils.convertIntToHex(b.model)].join("");
    d == this.selectedDevice ? this.hwModule && this.hwModule.dataHandler && this.hwModule.dataHandler(b) : (Entry.Utils.isNewVersion(c, this.requireVerion) && this.popupHelper.show("newVersion", !0), this.selectedDevice = d, this.hwModule = this.hwInfo[d], Entry.dispatchEvent("hwChanged"), Entry.propertyPanel && this.hwModule.monitorTemplate ? (b = Lang.Msgs.hw_connection_success_desc, this.hwMonitor ? (this.hwMonitor._hwModule = this.hwModule, this.hwMonitor.initView()) : this.hwMonitor = new Entry.HWMonitor(this.hwModule), 
    Entry.propertyPanel.addMode("hw", this.hwMonitor), c = this.hwModule.monitorTemplate, "both" == c.mode ? (c.mode = "list", this.hwMonitor.generateListView(), c.mode = "general", this.hwMonitor.generateView(), c.mode = "both") : "list" == c.mode ? this.hwMonitor.generateListView() : this.hwMonitor.generateView()) : b = Lang.Msgs.hw_connection_success_desc2, Entry.toast.success(Lang.Msgs.hw_connection_success, b));
  }
};
p.banHW = function() {
  var b = this.hwInfo, c;
  for (c in b) {
    Entry.playground.mainWorkspace.blockMenu.banClass(b[c].name, !0);
  }
};
p.executeHardware = function() {
  function b(b) {
    navigator.msLaunchUri(b, function() {
    }, function() {
      e.popupHelper.show("hwDownload", !0);
    });
  }
  function c(b) {
    var c = document.createElement("iframe");
    c.src = "about:blank";
    c.style = "display:none";
    document.getElementsByTagName("body")[0].appendChild(c);
    var d = null, d = setTimeout(function() {
      var f = !1;
      try {
        c.contentWindow.location.href = b, f = !0;
      } catch (r) {
        "NS_ERROR_UNKNOWN_PROTOCOL" == r.name && (f = !1);
      }
      f || e.popupHelper.show("hwDownload", !0);
      document.getElementsByTagName("body")[0].removeChild(c);
      clearTimeout(d);
    }, 500);
  }
  function d(b) {
    var c = !1;
    window.focus();
    $(window).one("blur", function() {
      c = !0;
    });
    Entry.dispatchEvent("workspaceUnbindUnload", !0);
    location.assign(encodeURI(b));
    setTimeout(function() {
      Entry.dispatchEvent("workspaceBindUnload", !0);
    }, 100);
    setTimeout(function() {
      0 == c && e.popupHelper.show("hwDownload", !0);
      window.onblur = null;
    }, 3000);
  }
  var e = this, f = {_bNotInstalled:!1, init:function(b, c) {
    this._w = window.open("/views/hwLoading.html", "entry_hw_launcher", "width=220, height=225,  top=" + window.screenTop + ", left=" + window.screenLeft);
    var d = null, d = setTimeout(function() {
      f.runViewer(b, c);
      clearInterval(d);
    }, 1000);
  }, runViewer:function(b, c) {
    this._w.document.write("<iframe src='" + b + "' onload='opener.Entry.hw.ieLauncher.set()' style='display:none;width:0;height:0'></iframe>");
    var d = 0, e = null, e = setInterval(function() {
      try {
        this._w.location.href;
      } catch (n) {
        this._bNotInstalled = !0;
      }
      if (10 < d) {
        clearInterval(e);
        var b = 0, f = null, f = setInterval(function() {
          b++;
          this._w.closed || 2 < b ? clearInterval(f) : this._w.close();
          this._bNotInstalled = !1;
          d = 0;
        }.bind(this), 5000);
        c(!this._bNotInstalled);
      }
      d++;
    }.bind(this), 100);
  }, set:function() {
    this._bNotInstalled = !0;
  }};
  e.ieLauncher = f;
  var g = "entryhw://-roomId:" + this.sessionRoomId;
  0 < navigator.userAgent.indexOf("MSIE") || 0 < navigator.userAgent.indexOf("Trident") ? void 0 != navigator.msLaunchUri ? b(g) : 9 > (0 < document.documentMode ? document.documentMode : navigator.userAgent.match(/(?:MSIE) ([0-9.]+)/)[1]) ? alert(Lang.msgs.not_support_browser) : f.init(g, function(b) {
    0 == b && e.popupHelper.show("hwDownload", !0);
  }) : 0 < navigator.userAgent.indexOf("Firefox") ? c(g) : 0 < navigator.userAgent.indexOf("Chrome") || 0 < navigator.userAgent.indexOf("Safari") ? d(g) : alert(Lang.msgs.not_support_browser);
};
p.hwPopupCreate = function() {
  var b = this;
  this.popupHelper || (this.popupHelper = window.popupHelper ? window.popupHelper : new Entry.popupHelper(!0));
  this.popupHelper.addPopup("newVersion", {type:"confirm", title:Lang.Msgs.new_version_title, setPopupLayout:function(c) {
    var d = Entry.Dom("div", {class:"contentArea"}), e = Entry.Dom("div", {class:"textArea", parent:d}), f = Entry.Dom("div", {class:"text1", parent:e}), g = Entry.Dom("div", {class:"text2", parent:e}), h = Entry.Dom("div", {class:"text3", parent:e}), e = Entry.Dom("div", {class:"text4", parent:e}), k = Entry.Dom("div", {classes:["popupCancelBtn", "popupDefaultBtn"], parent:d}), l = Entry.Dom("div", {classes:["popupOkBtn", "popupDefaultBtn"], parent:d});
    f.text(Lang.Msgs.new_version_text1);
    g.html(Lang.Msgs.new_version_text2);
    h.text(Lang.Msgs.new_version_text3);
    e.text(Lang.Msgs.new_version_text4);
    k.text(Lang.Buttons.cancel);
    l.html(Lang.Msgs.new_version_download);
    d.bindOnClick(".popupDefaultBtn", function(c) {
      $(this).hasClass("popupOkBtn") && b.downloadConnector();
      b.popupHelper.hide("newVersion");
    });
    c.append(d);
  }});
  this.popupHelper.addPopup("hwDownload", {type:"confirm", title:Lang.Msgs.not_install_title, setPopupLayout:function(c) {
    var d = Entry.Dom("div", {class:"contentArea"}), e = Entry.Dom("div", {class:"textArea", parent:d}), f = Entry.Dom("div", {class:"text1", parent:e}), g = Entry.Dom("div", {class:"text2", parent:e}), h = Entry.Dom("div", {class:"text3", parent:e}), e = Entry.Dom("div", {class:"text4", parent:e}), k = Entry.Dom("div", {classes:["popupCancelBtn", "popupDefaultBtn"], parent:d}), l = Entry.Dom("div", {classes:["popupOkBtn", "popupDefaultBtn"], parent:d});
    f.text(Lang.Msgs.hw_download_text1);
    g.html(Lang.Msgs.hw_download_text2);
    h.text(Lang.Msgs.hw_download_text3);
    e.text(Lang.Msgs.hw_download_text4);
    k.text(Lang.Buttons.cancel);
    l.html(Lang.Msgs.hw_download_btn);
    d.bindOnClick(".popupDefaultBtn", function(c) {
      $(this).hasClass("popupOkBtn") && b.downloadConnector();
      b.popupHelper.hide("hwDownload");
    });
    c.append(d);
  }});
};
Entry.init = function(b, c) {
  Entry.assert("object" === typeof c, "Init option is not object");
  this.events_ = {};
  this.interfaceState = {menuWidth:264};
  Entry.Utils.bindGlobalEvent("resize mousedown mousemove keydown keyup dispose".split(" "));
  this.options = c;
  this.parseOptions(c);
  this.mediaFilePath = (c.libDir ? c.libDir : "/lib") + "/entryjs/images/";
  this.defaultPath = c.defaultDir || "";
  this.blockInjectPath = c.blockInjectDir || "";
  "workspace" == this.type && this.isPhone() && (this.type = "phone");
  this.initialize_();
  this.view_ = b;
  $(this.view_).addClass("entry");
  "minimize" === this.type && $(this.view_).addClass(this.type);
  "tablet" === this.device && $(this.view_).addClass("tablet");
  Entry.initFonts(c.fonts);
  this.createDom(b, this.type);
  this.loadInterfaceState();
  this.overridePrototype();
  this.maxCloneLimit = 360;
  this.cloudSavable = !0;
  this.startTime = (new Date).getTime();
  document.onkeydown = function(b) {
    Entry.dispatchEvent("keyPressed", b);
  };
  document.onkeyup = function(b) {
    Entry.dispatchEvent("keyUpped", b);
  };
  window.onresize = function(b) {
    Entry.dispatchEvent("windowResized", b);
  };
  window.onbeforeunload = this.beforeUnload;
  Entry.addEventListener("saveWorkspace", function(b) {
    Entry.addActivity("save");
  });
  Entry.addEventListener("showBlockHelper", function(b) {
    Entry.propertyPanel.select("helper");
  });
  "IE" != Entry.getBrowserType().substr(0, 2) || window.flashaudio ? createjs.Sound.registerPlugins([createjs.WebAudioPlugin]) : (createjs.FlashAudioPlugin.swfPath = this.mediaFilePath + "media/", createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]), window.flashaudio = !0);
  Entry.soundQueue = new createjs.LoadQueue;
  Entry.soundQueue.installPlugin(createjs.Sound);
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/click.mp3", Entry.mediaFilePath + "sounds/click.wav", Entry.mediaFilePath + "sounds/click.ogg"], "entryMagneting");
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/delete.mp3", Entry.mediaFilePath + "sounds/delete.ogg", Entry.mediaFilePath + "sounds/delete.wav"], "entryDelete");
  createjs.Sound.stop();
};
Entry.changeContainer = function(b) {
  b.appendChild(this.view_);
};
Entry.loadAudio_ = function(b, c) {
  if (window.Audio && b.length) {
    for (; 0 < b.length;) {
      b = b[0];
      b.match(/\/([^.]+)./);
      Entry.soundQueue.loadFile({id:c, src:b, type:createjs.LoadQueue.SOUND});
      break;
    }
  }
};
Entry.initialize_ = function() {
  this.stage = new Entry.Stage;
  Entry.engine && Entry.engine.projectTimer && Entry.engine.clearTimer();
  this.engine = new Entry.Engine;
  "minimize" !== this.type && (this.propertyPanel = new Entry.PropertyPanel);
  this.container = new Entry.Container;
  this.helper = new Entry.Helper;
  this.youtube = new Entry.Youtube;
  this.variableContainer = new Entry.VariableContainer;
  this.commander = new Entry.Commander(this.type, this.doNotSkipAny);
  this.scene = new Entry.Scene;
  this.playground = new Entry.Playground;
  this.toast = new Entry.Toast;
  this.hw && this.hw.closeConnection();
  this.hw = new Entry.HW;
  if (Entry.enableActivityLogging) {
    this.reporter = new Entry.Reporter(!1);
  } else {
    if ("workspace" == this.type || "phone" == this.type) {
      this.reporter = new Entry.Reporter(!0);
    }
  }
};
Entry.createDom = function(b, c) {
  if (c && "workspace" != c) {
    "minimize" == c ? (d = Entry.createElement("canvas"), d.className = "entryCanvasWorkspace minimize", d.id = "entryCanvas", d.width = 640, d.height = 360, e = Entry.createElement("div", "entryCanvasWrapper"), e.appendChild(d), b.appendChild(e), this.canvas_ = d, this.stage.initStage(this.canvas_), e = Entry.createElement("div"), b.appendChild(e), this.engineView = e, this.engine.generateView(this.engineView, c)) : "phone" == c && (this.stateManagerView = d = Entry.createElement("div"), this.stateManager.generateView(this.stateManagerView, 
    c), e = Entry.createElement("div"), b.appendChild(e), this.engineView = e, this.engine.generateView(this.engineView, c), d = Entry.createElement("canvas"), d.addClass("entryCanvasPhone"), d.id = "entryCanvas", d.width = 640, d.height = 360, e.insertBefore(d, this.engine.footerView_), this.canvas_ = d, this.stage.initStage(this.canvas_), d = Entry.createElement("div"), b.appendChild(d), this.containerView = d, this.container.generateView(this.containerView, c), d = Entry.createElement("div"), 
    b.appendChild(d), this.playgroundView = d, this.playground.generateView(this.playgroundView, c));
  } else {
    Entry.documentMousedown.attach(this, this.cancelObjectEdit);
    var d = Entry.createElement("div");
    b.appendChild(d);
    this.sceneView = d;
    this.scene.generateView(this.sceneView, c);
    d = Entry.createElement("div");
    this.sceneView.appendChild(d);
    this.stateManagerView = d;
    this.stateManager.generateView(this.stateManagerView, c);
    var e = Entry.createElement("div");
    b.appendChild(e);
    this.engineView = e;
    this.engine.generateView(this.engineView, c);
    d = Entry.createElement("canvas");
    d.addClass("entryCanvasWorkspace");
    d.id = "entryCanvas";
    d.width = 640;
    d.height = 360;
    e.insertBefore(d, this.engine.addButton);
    d.addEventListener("mousewheel", function(b) {
      var c = Entry.variableContainer.getListById(Entry.stage.mouseCoordinate);
      b = 0 < b.wheelDelta ? !0 : !1;
      for (var d = 0; d < c.length; d++) {
        var e = c[d];
        e.scrollButton_.y = b ? 46 <= e.scrollButton_.y ? e.scrollButton_.y - 23 : 23 : e.scrollButton_.y + 23;
        e.updateView();
      }
    });
    this.canvas_ = d;
    this.stage.initStage(this.canvas_);
    d = Entry.createElement("div");
    this.propertyPanel.generateView(b, c);
    this.containerView = d;
    this.container.generateView(this.containerView, c);
    this.propertyPanel.addMode("object", this.container);
    this.helper.generateView(this.containerView, c);
    this.propertyPanel.addMode("helper", this.helper);
    d = Entry.createElement("div");
    b.appendChild(d);
    this.playgroundView = d;
    this.playground.generateView(this.playgroundView, c);
    this.propertyPanel.select("object");
    this.helper.bindWorkspace(this.playground.mainWorkspace);
  }
};
Entry.start = function(b) {
  "invisible" !== Entry.type && (this.FPS || (this.FPS = 60), Entry.assert("number" == typeof this.FPS, "FPS must be number"), Entry.engine.start(this.FPS));
};
Entry.stop = function() {
  "invisible" !== Entry.type && (this.FPS = null, Entry.engine.stop());
};
Entry.parseOptions = function(b) {
  this.type = b.type || this.type;
  this.hashId = b.hashId || this.hasId;
  b.device && (this.device = b.device);
  this.projectSaveable = b.projectsaveable;
  void 0 === this.projectSaveable && (this.projectSaveable = !0);
  this.objectAddable = b.objectaddable;
  void 0 === this.objectAddable && (this.objectAddable = !0);
  this.objectEditable = b.objectEditable;
  void 0 === this.objectEditable && (this.objectEditable = !0);
  this.objectEditable || (this.objectAddable = !1);
  this.objectDeletable = b.objectdeletable;
  void 0 === this.objectDeletable && (this.objectDeletable = !0);
  this.soundEditable = b.soundeditable;
  void 0 === this.soundEditable && (this.soundEditable = !0);
  this.pictureEditable = b.pictureeditable;
  void 0 === this.pictureEditable && (this.pictureEditable = !0);
  this.sceneEditable = b.sceneEditable;
  void 0 === this.sceneEditable && (this.sceneEditable = !0);
  this.functionEnable = b.functionEnable;
  void 0 === this.functionEnable && (this.functionEnable = !0);
  this.messageEnable = b.messageEnable;
  void 0 === this.messageEnable && (this.messageEnable = !0);
  this.variableEnable = b.variableEnable;
  void 0 === this.variableEnable && (this.variableEnable = !0);
  this.listEnable = b.listEnable;
  void 0 === this.listEnable && (this.listEnable = !0);
  this.doCommandAll = b.doCommandAll;
  void 0 === this.doCommandAll && (this.doCommandAll = !1);
  this.hasVariableManager = b.hasvariablemanager;
  this.variableEnable || this.messageEnable || this.listEnable || this.functionEnable ? void 0 === this.hasVariableManager && (this.hasVariableManager = !0) : this.hasVariableManager = !1;
  if (this.readOnly = b.readOnly || !1) {
    this.soundEditable = a.sceneEditable = this.objectAddable = !1;
  }
  b.isForLecture && (this.isForLecture = b.isForLecture);
  b.textCodingEnable && (this.textCodingEnable = b.textCodingEnable);
};
Entry.initFonts = function(b) {
  this.fonts = b;
  b || (this.fonts = []);
};
Entry.reloadOption = function(b) {
  this.options = b;
  this.parseOptions(b);
  this.playground.applyTabOption();
  this.variableContainer.applyOption();
  this.engine.applyOption();
  this.commander.applyOption();
};
Entry.Activity = function(b, c) {
  this.name = b;
  this.timestamp = new Date;
  b = [];
  if (void 0 !== c) {
    for (var d = 0, e = c.length; d < e; d++) {
      var f = c[d];
      b.push({key:f[0], value:f[1]});
    }
  }
  this.data = b;
};
Entry.ActivityReporter = function() {
  this._activities = [];
};
(function(b) {
  b.add = function(b) {
    if (b && 0 !== b.length) {
      if (!(b instanceof Entry.Activity)) {
        var c = b.shift();
        b = new Entry.Activity(c, b);
      }
      this._activities.push(b);
    }
  };
  b.clear = function() {
    this._activities = [];
  };
  b.get = function() {
    return this._activities;
  };
  b.report = function() {
  };
})(Entry.ActivityReporter.prototype);
Entry.Recorder = function() {
  this._recordData = [];
  Entry.commander.addReporter(this);
};
(function(b) {
  b.add = function(b) {
    var c = b[0];
    if (c) {
      switch(Entry.Command[c].recordable) {
        case Entry.STATIC.RECORDABLE.SUPPORT:
          this._recordData.push(b);
          Entry.toast.warning("Record", Lang.Command[c + ""]);
          break;
        case Entry.STATIC.RECORDABLE.ABANDON:
          Entry.toast.alert("\uc9c0\uc6d0\ud558\uc9c0 \uc54a\uc74c");
      }
    }
  };
  b.getData = function() {
    return this._recordData;
  };
})(Entry.Recorder.prototype);
Entry.State = function(b, c, d, e) {
  this.caller = c;
  this.func = d;
  3 < arguments.length && (this.params = Array.prototype.slice.call(arguments).slice(3));
  this.message = b;
  this.time = Entry.getUpTime();
  this.isPass = Entry.Command[b] ? Entry.Command[b].isPass : !1;
  this.id = Entry.generateHash();
};
Entry.State.prototype.generateMessage = function() {
};
Entry.StateManager = function() {
  this.undoStack_ = [];
  this.redoStack_ = [];
  this.isIgnore = this._isRedoing = this.isRestore = !1;
  Entry.addEventListener("cancelLastCommand", function(b) {
    Entry.stateManager.cancelLastCommand();
  });
  Entry.addEventListener("saveWorkspace", function(b) {
    Entry.stateManager.addStamp();
  });
  Entry.addEventListener("undo", function(b) {
    Entry.stateManager.undo();
  });
  Entry.addEventListener("redo", function(b) {
    Entry.stateManager.redo();
  });
};
Entry.StateManager.prototype.generateView = function(b, c) {
};
Entry.StateManager.prototype.addCommand = function(b, c, d, e) {
  if (!this.isIgnoring()) {
    var f = new Entry.State;
    Entry.State.prototype.constructor.apply(f, Array.prototype.slice.call(arguments));
    this.isRestoring() ? this.redoStack_.push(f) : (this.undoStack_.push(f), this._isRedoing || (this.redoStack_ = []));
    Entry.reporter && Entry.reporter.report(f);
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
    return f;
  }
};
Entry.StateManager.prototype.cancelLastCommand = function() {
  this.canUndo() && (this.undoStack_.pop(), Entry.creationChangedEvent && Entry.creationChangedEvent.notify());
};
Entry.StateManager.prototype.getLastCommand = function() {
  return this.undoStack_[this.undoStack_.length - 1];
};
Entry.StateManager.prototype.getLastCommandById = function(b) {
  for (var c = this.undoStack_, d = c.length - 1; 0 <= d; d--) {
    var e = c[d];
    if (e.id === b) {
      return e;
    }
  }
};
Entry.StateManager.prototype.getLastRedoCommand = function() {
  return this.redoStack_[this.redoStack_.length - 1];
};
Entry.StateManager.prototype.removeAllPictureCommand = function() {
  this.undoStack_ = this.undoStack_.filter(function(b) {
    return !(400 <= b.message && 500 > b.message);
  });
  this.redoStack_ = this.redoStack_.filter(function(b) {
    return !(400 <= b.message && 500 > b.message);
  });
};
Entry.StateManager.prototype.undo = function(b) {
  if (this.canUndo() && !this.isRestoring()) {
    this.addActivity("undo");
    this.startRestore();
    for (var c = !0; this.undoStack_.length;) {
      var d = this.undoStack_.pop();
      d.func.apply(d.caller, d.params);
      var e = this.getLastRedoCommand();
      c ? (e.isPass = !1, c = !c) : e.isPass = !0;
      b && b--;
      if (!b && !0 !== d.isPass) {
        break;
      }
    }
    this.endRestore();
    Entry.disposeEvent && Entry.disposeEvent.notify();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.redo = function() {
  if (this.canRedo() && !this.isRestoring()) {
    this._isRedoing = !0;
    this.addActivity("undo");
    this.addActivity("redo");
    for (var b = !0; this.redoStack_.length;) {
      var c = this.redoStack_.pop(), d = c.func.apply(c.caller, c.params);
      b ? (d.isPass(!1), b = !b) : d.isPass(!0);
      if (!0 !== c.isPass) {
        break;
      }
    }
    this._isRedoing = !1;
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.updateView = function() {
};
Entry.StateManager.prototype.startRestore = function() {
  this.isRestore = !0;
};
Entry.StateManager.prototype.endRestore = function() {
  this.isRestore = !1;
};
Entry.StateManager.prototype.isRestoring = function() {
  return this.isRestore;
};
Entry.StateManager.prototype.startIgnore = function() {
  this.isIgnore = !0;
};
Entry.StateManager.prototype.endIgnore = function() {
  this.isIgnore = !1;
};
Entry.StateManager.prototype.isIgnoring = function() {
  return this.isIgnore;
};
Entry.StateManager.prototype.canUndo = function() {
  return 0 < this.undoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.canRedo = function() {
  return 0 < this.redoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.addStamp = function() {
  this.stamp = Entry.generateHash();
  this.undoStack_.length && (this.undoStack_[this.undoStack_.length - 1].stamp = this.stamp);
};
Entry.StateManager.prototype.isSaved = function() {
  return 0 === this.undoStack_.length || this.undoStack_[this.undoStack_.length - 1].stamp == this.stamp && "string" == typeof this.stamp;
};
Entry.StateManager.prototype.addActivity = function(b) {
  Entry.reporter && Entry.reporter.report(new Entry.State(b));
};
Entry.StateManager.prototype.getUndoStack = function() {
  return this.undoStack_.slice(0);
};
Entry.StateManager.prototype.changeLastCommandType = function(b) {
  var c = this.getLastCommand();
  c && (c.message = b);
  return c;
};
Entry.StateManager.prototype.clear = function() {
  for (; this.undoStack_.length;) {
    this.undoStack_.pop();
  }
  for (; this.redoStack_.length;) {
    this.redoStack_.pop();
  }
};
Entry.BlockModel = function() {
  Entry.Model(this);
};
Entry.BlockModel.prototype.schema = {id:null, x:0, y:0, type:null, params:{}, statements:{}, prev:null, next:null, view:null};
Entry.BlockRenderModel = function() {
  Entry.Model(this);
};
Entry.BlockRenderModel.prototype.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, width:0, height:0, magneting:!1};
Entry.BoxModel = function() {
  Entry.Model(this);
};
Entry.BoxModel.prototype.schema = {id:0, type:Entry.STATIC.BOX_MODEL, x:0, y:0, width:0, height:0};
Entry.DragInstance = function(b) {
  Entry.Model(this);
  this.set(b);
};
Entry.DragInstance.prototype.schema = {type:Entry.STATIC.DRAG_INSTANCE, startX:0, startY:0, offsetX:0, offsetY:0, absX:0, absY:0, prev:null, height:0, mode:0, isNew:!1};
Entry.ThreadModel = function() {
  Entry.Model(this);
};
Entry.ThreadModel.prototype.schema = {id:0, type:Entry.STATIC.THREAD_MODEL, x:0, y:0, width:0, minWidth:0, height:0};
Entry.EntryObject = function(b) {
  var c = this;
  if (b) {
    this.id = b.id;
    this.name = b.name || b.sprite.name;
    this.text = b.text || this.name;
    this.objectType = b.objectType;
    this.objectType || (this.objectType = "sprite");
    this.script = new Entry.Code(b.script ? b.script : [], this);
    this.pictures = JSON.parse(JSON.stringify(b.sprite.pictures || []));
    this.sounds = JSON.parse(JSON.stringify(b.sprite.sounds || []));
    for (var d = 0; d < this.sounds.length; d++) {
      this.sounds[d].id || (this.sounds[d].id = Entry.generateHash()), Entry.initSound(this.sounds[d]);
    }
    this.lock = b.lock ? b.lock : !1;
    this.isEditing = !1;
    "sprite" == this.objectType && (this.selectedPicture = b.selectedPictureId ? this.getPicture(b.selectedPictureId) : this.pictures[0]);
    this.scene = Entry.scene.getSceneById(b.scene) || Entry.scene.selectedScene;
    this.setRotateMethod(b.rotateMethod);
    this.entity = new Entry.EntityObject(this);
    this.entity.injectModel(this.selectedPicture ? this.selectedPicture : null, b.entity ? b.entity : this.initEntity(b));
    this.clonedEntities = [];
    Entry.stage.loadObject(this);
    for (d in this.pictures) {
      (function(b) {
        b.objectId = this.id;
        b.id || (b.id = Entry.generateHash());
        var d = new Image;
        if (b.fileurl) {
          d.src = b.fileurl;
        } else {
          if (b.fileurl) {
            d.src = b.fileurl;
          } else {
            var e = b.filename;
            d.src = Entry.defaultPath + "/uploads/" + e.substring(0, 2) + "/" + e.substring(2, 4) + "/image/" + e + ".png";
          }
        }
        Entry.Loader.addQueue();
        d.onload = function(d) {
          Entry.container.cachePicture(b.id + c.entity.id, this);
          Entry.Loader.removeQueue();
        };
        d.onerror = function(b) {
          Entry.Loader.removeQueue();
        };
      })(this.pictures[d]), Entry.requestUpdate = !0;
    }
  }
  this._isContextMenuEnabled = !0;
};
(function(b) {
  b.generateView = function() {
    if ("workspace" == Entry.type) {
      var b = Entry.createElement("li", this.id);
      document.createDocumentFragment("div").appendChild(b);
      b.addClass("entryContainerListElementWorkspace");
      b.object = this;
      Entry.Utils.disableContextmenu(b);
      var d = this;
      longPressTimer = null;
      $(b).bind("mousedown touchstart", function(b) {
        function c(b) {
          b.stopPropagation();
          k && 5 < Math.sqrt(Math.pow(b.pageX - k.x, 2) + Math.pow(b.pageY - k.y, 2)) && longPressTimer && (clearTimeout(longPressTimer), longPressTimer = null);
        }
        function e(b) {
          b.stopPropagation();
          f.unbind(".object");
          longPressTimer && (clearTimeout(longPressTimer), longPressTimer = null);
        }
        Entry.container.getObject(this.id) && Entry.do("containerSelectObject", this.id);
        var f = $(document), g = b.type, h = !1;
        if (Entry.Utils.isRightButton(b)) {
          b.stopPropagation(), Entry.documentMousedown.notify(b), h = !0, d._rightClick(b);
        } else {
          var k = {x:b.clientX, y:b.clientY};
          "touchstart" !== g || h || (b.stopPropagation(), Entry.documentMousedown.notify(b), longPressTimer = setTimeout(function() {
            longPressTimer && (longPressTimer = null, d._rightClick(b));
          }, 1000), f.bind("mousemove.object touchmove.object", c), f.bind("mouseup.object touchend.object", e));
        }
      });
      this.view_ = b;
      var e = this;
      var f = Entry.createElement("ul");
      f.addClass("objectInfoView");
      Entry.objectEditable || f.addClass("entryHide");
      var g = Entry.createElement("li");
      g.addClass("objectInfo_visible");
      this.entity.getVisible() || g.addClass("objectInfo_unvisible");
      g.bindOnClick(function(b) {
        Entry.engine.isState("run") || (b = e.entity, b.setVisible(!b.getVisible()) ? this.removeClass("objectInfo_unvisible") : this.addClass("objectInfo_unvisible"));
      });
      b = Entry.createElement("li");
      b.addClass("objectInfo_unlock");
      this.getLock() && b.addClass("objectInfo_lock");
      b.bindOnClick(function(b) {
        Entry.engine.isState("run") || (b = e, b.setLock(!b.getLock()) ? this.addClass("objectInfo_lock") : this.removeClass("objectInfo_lock"), b.updateInputViews(b.getLock()));
      });
      f.appendChild(g);
      f.appendChild(b);
      this.view_.appendChild(f);
      b = Entry.createElement("div");
      b.addClass("entryObjectThumbnailWorkspace");
      this.view_.appendChild(b);
      this.thumbnailView_ = b;
      b = Entry.createElement("div");
      b.addClass("entryObjectWrapperWorkspace");
      this.view_.appendChild(b);
      g = Entry.createElement("input");
      g.bindOnClick(function(b) {
        b.preventDefault();
        this.readOnly || (this.focus(), this.select());
      });
      g.addClass("entryObjectNameWorkspace");
      b.appendChild(g);
      this.nameView_ = g;
      this.nameView_.entryObject = this;
      g.setAttribute("readonly", !0);
      var h = this;
      this.nameView_.onblur = function(b) {
        this.entryObject.name = this.value;
        Entry.playground.reloadPlayground();
      };
      this.nameView_.onkeypress = function(b) {
        13 == b.keyCode && h.editObjectValues(!1);
      };
      this.nameView_.value = this.name;
      g = Entry.createElement("div");
      g.addClass("entryObjectEditWorkspace");
      g.object = this;
      this.editView_ = g;
      this.view_.appendChild(g);
      $(g).mousedown(function(b) {
        b.stopPropagation();
        Entry.documentMousedown.notify(b);
        Entry.do("objectEditButtonClick", d.id);
      });
      g.blur = function(b) {
        d.editObjectComplete();
      };
      Entry.objectEditable && Entry.objectDeletable && (g = Entry.createElement("div"), g.addClass("entryObjectDeleteWorkspace"), g.object = this, this.deleteView_ = g, this.view_.appendChild(g), g.bindOnClick(function(b) {
        Entry.engine.isState("run") || Entry.container.removeObject(this.object);
      }));
      g = Entry.createElement("div");
      g.addClass("entryObjectInformationWorkspace");
      g.object = this;
      this.isInformationToggle = !1;
      b.appendChild(g);
      this.informationView_ = g;
      b = Entry.createElement("div");
      b.addClass("entryObjectRotationWrapperWorkspace");
      b.object = this;
      this.view_.appendChild(b);
      var k = Entry.createElement("span");
      k.addClass("entryObjectCoordinateWorkspace");
      b.appendChild(k);
      f = Entry.createElement("span");
      f.addClass("entryObjectCoordinateSpanWorkspace");
      f.innerHTML = "X:";
      var l = Entry.createElement("input");
      l.addClass("entryObjectCoordinateInputWorkspace");
      l.setAttribute("readonly", !0);
      l.bindOnClick(function(b) {
        b.stopPropagation();
        this.select();
      });
      g = Entry.createElement("span");
      g.addClass("entryObjectCoordinateSpanWorkspace");
      g.innerHTML = "Y:";
      var m = Entry.createElement("input");
      m.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right");
      m.bindOnClick(function(b) {
        b.stopPropagation();
        this.select();
      });
      m.setAttribute("readonly", !0);
      var r = Entry.createElement("span");
      r.addClass("entryObjectCoordinateSizeWorkspace");
      r.innerHTML = Lang.Workspace.Size + " : ";
      var q = Entry.createElement("input");
      q.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size");
      q.bindOnClick(function(b) {
        b.stopPropagation();
        this.select();
      });
      q.setAttribute("readonly", !0);
      k.appendChild(f);
      k.appendChild(l);
      k.appendChild(g);
      k.appendChild(m);
      k.appendChild(r);
      k.appendChild(q);
      k.xInput_ = l;
      k.yInput_ = m;
      k.sizeInput_ = q;
      this.coordinateView_ = k;
      e = this;
      l.onkeypress = function(b) {
        13 == b.keyCode && e.editObjectValues(!1);
      };
      l.onblur = function(b) {
        Entry.Utils.isNumber(l.value) && e.entity.setX(Number(l.value));
        e.updateCoordinateView();
        Entry.stage.updateObject();
      };
      m.onkeypress = function(b) {
        13 == b.keyCode && e.editObjectValues(!1);
      };
      m.onblur = function(b) {
        Entry.Utils.isNumber(m.value) && e.entity.setY(Number(m.value));
        e.updateCoordinateView();
        Entry.stage.updateObject();
      };
      q.onkeypress = function(b) {
        13 == b.keyCode && e.editObjectValues(!1);
      };
      q.onblur = function(b) {
        Entry.Utils.isNumber(q.value) && e.entity.setSize(Number(q.value));
        e.updateCoordinateView();
        Entry.stage.updateObject();
      };
      k = Entry.createElement("div");
      k.addClass("entryObjectRotateLabelWrapperWorkspace");
      this.view_.appendChild(k);
      this.rotateLabelWrapperView_ = k;
      f = Entry.createElement("span");
      f.addClass("entryObjectRotateSpanWorkspace");
      f.innerHTML = Lang.Workspace.rotation + " : ";
      var n = Entry.createElement("input");
      n.addClass("entryObjectRotateInputWorkspace");
      n.setAttribute("readonly", !0);
      n.bindOnClick(function(b) {
        b.stopPropagation();
        this.select();
      });
      this.rotateSpan_ = f;
      this.rotateInput_ = n;
      g = Entry.createElement("span");
      g.addClass("entryObjectDirectionSpanWorkspace");
      g.innerHTML = Lang.Workspace.direction + " : ";
      var t = Entry.createElement("input");
      t.addClass("entryObjectDirectionInputWorkspace");
      t.setAttribute("readonly", !0);
      t.bindOnClick(function(b) {
        b.stopPropagation();
        this.select();
      });
      this.directionInput_ = t;
      k.appendChild(f);
      k.appendChild(n);
      k.appendChild(g);
      k.appendChild(t);
      k.rotateInput_ = n;
      k.directionInput_ = t;
      e = this;
      n.onkeypress = function(b) {
        13 == b.keyCode && e.editObjectValues(!1);
      };
      n.onblur = function(b) {
        b = n.value;
        -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da")));
        Entry.Utils.isNumber(b) && e.entity.setRotation(Number(b));
        e.updateRotationView();
        Entry.stage.updateObject();
      };
      t.onkeypress = function(b) {
        13 == b.keyCode && e.editObjectValues(!1);
      };
      t.onblur = function(b) {
        b = t.value;
        -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da")));
        Entry.Utils.isNumber(b) && e.entity.setDirection(Number(b));
        e.updateRotationView();
        Entry.stage.updateObject();
      };
      g = Entry.createElement("div");
      g.addClass("rotationMethodWrapper");
      b.appendChild(g);
      this.rotationMethodWrapper_ = g;
      b = Entry.createElement("span");
      b.addClass("entryObjectRotateMethodLabelWorkspace");
      g.appendChild(b);
      b.innerHTML = Lang.Workspace.rotate_method + " : ";
      b = Entry.createElement("div");
      b.addClass("entryObjectRotateModeWorkspace entryObjectRotateModeAWorkspace");
      b.object = this;
      this.rotateModeAView_ = b;
      g.appendChild(b);
      b.bindOnClick(function(b) {
        Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("free"), this.object.setRotateMethod("free"));
      });
      b = Entry.createElement("div");
      b.addClass("entryObjectRotateModeWorkspace entryObjectRotateModeBWorkspace");
      b.object = this;
      this.rotateModeBView_ = b;
      g.appendChild(b);
      b.bindOnClick(function(b) {
        Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("vertical"), this.object.setRotateMethod("vertical"));
      });
      b = Entry.createElement("div");
      b.addClass("entryObjectRotateModeWorkspace entryObjectRotateModeCWorkspace");
      b.object = this;
      this.rotateModeCView_ = b;
      g.appendChild(b);
      b.bindOnClick(function(b) {
        Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("none"), this.object.setRotateMethod("none"));
      });
      this.updateThumbnailView();
      this.updateCoordinateView();
      this.updateRotateMethodView();
      this.updateInputViews();
      this.updateCoordinateView(!0);
      this.updateRotationView(!0);
      return this.view_;
    }
    if ("phone" == Entry.type) {
      return b = Entry.createElement("li", this.id), b.addClass("entryContainerListElementWorkspace"), b.object = this, b.bindOnClick(function(b) {
        Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
      }), $ && (d = this, context.attach("#" + this.id, [{text:Lang.Workspace.context_rename, href:"/", action:function(b) {
        b.preventDefault();
      }}, {text:Lang.Workspace.context_duplicate, href:"/", action:function(b) {
        b.preventDefault();
        Entry.container.addCloneObject(d);
      }}, {text:Lang.Workspace.context_remove, href:"/", action:function(b) {
        b.preventDefault();
        Entry.container.removeObject(d);
      }}])), this.view_ = b, f = Entry.createElement("ul"), f.addClass("objectInfoView"), g = Entry.createElement("li"), g.addClass("objectInfo_visible"), b = Entry.createElement("li"), b.addClass("objectInfo_lock"), f.appendChild(g), f.appendChild(b), this.view_.appendChild(f), b = Entry.createElement("div"), b.addClass("entryObjectThumbnailWorkspace"), this.view_.appendChild(b), this.thumbnailView_ = b, b = Entry.createElement("div"), b.addClass("entryObjectWrapperWorkspace"), this.view_.appendChild(b), 
      g = Entry.createElement("input"), g.addClass("entryObjectNameWorkspace"), b.appendChild(g), this.nameView_ = g, this.nameView_.entryObject = this, this.nameView_.onblur = function() {
        this.entryObject.name = this.value;
        Entry.playground.reloadPlayground();
      }, this.nameView_.onkeypress = function(b) {
        13 == b.keyCode && e.editObjectValues(!1);
      }, this.nameView_.value = this.name, Entry.objectEditable && Entry.objectDeletable && (g = Entry.createElement("div"), g.addClass("entryObjectDeletePhone"), g.object = this, this.deleteView_ = g, this.view_.appendChild(g), g.bindOnClick(function(b) {
        Entry.engine.isState("run") || Entry.container.removeObject(this.object);
      })), g = Entry.createElement("button"), g.addClass("entryObjectEditPhone"), g.object = this, g.bindOnClick(function(b) {
        if (b = Entry.container.getObject(this.id)) {
          Entry.container.selectObject(b.id), Entry.playground.injectObject(b);
        }
      }), this.view_.appendChild(g), g = Entry.createElement("div"), g.addClass("entryObjectInformationWorkspace"), g.object = this, this.isInformationToggle = !1, b.appendChild(g), this.informationView_ = g, k = Entry.createElement("div"), k.addClass("entryObjectRotateLabelWrapperWorkspace"), this.view_.appendChild(k), this.rotateLabelWrapperView_ = k, f = Entry.createElement("span"), f.addClass("entryObjectRotateSpanWorkspace"), f.innerHTML = Lang.Workspace.rotation + " : ", n = Entry.createElement("input"), 
      n.addClass("entryObjectRotateInputWorkspace"), this.rotateSpan_ = f, this.rotateInput_ = n, g = Entry.createElement("span"), g.addClass("entryObjectDirectionSpanWorkspace"), g.innerHTML = Lang.Workspace.direction + " : ", t = Entry.createElement("input"), t.addClass("entryObjectDirectionInputWorkspace"), this.directionInput_ = t, k.appendChild(f), k.appendChild(n), k.appendChild(g), k.appendChild(t), k.rotateInput_ = n, k.directionInput_ = t, e = this, n.onkeypress = function(b) {
        13 == b.keyCode && (b = n.value, -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da"))), Entry.Utils.isNumber(b) && e.entity.setRotation(Number(b)), e.updateRotationView(), n.blur());
      }, n.onblur = function(b) {
        e.entity.setRotation(e.entity.getRotation());
        Entry.stage.updateObject();
      }, t.onkeypress = function(b) {
        13 == b.keyCode && (b = t.value, -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da"))), Entry.Utils.isNumber(b) && e.entity.setDirection(Number(b)), e.updateRotationView(), t.blur());
      }, t.onblur = function(b) {
        e.entity.setDirection(e.entity.getDirection());
        Entry.stage.updateObject();
      }, b = Entry.createElement("div"), b.addClass("entryObjectRotationWrapperWorkspace"), b.object = this, this.view_.appendChild(b), k = Entry.createElement("span"), k.addClass("entryObjectCoordinateWorkspace"), b.appendChild(k), f = Entry.createElement("span"), f.addClass("entryObjectCoordinateSpanWorkspace"), f.innerHTML = "X:", l = Entry.createElement("input"), l.addClass("entryObjectCoordinateInputWorkspace"), g = Entry.createElement("span"), g.addClass("entryObjectCoordinateSpanWorkspace"), 
      g.innerHTML = "Y:", m = Entry.createElement("input"), m.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right"), r = Entry.createElement("span"), r.addClass("entryObjectCoordinateSpanWorkspace"), r.innerHTML = Lang.Workspace.Size, q = Entry.createElement("input"), q.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size"), k.appendChild(f), k.appendChild(l), k.appendChild(g), k.appendChild(m), k.appendChild(r), k.appendChild(q), 
      k.xInput_ = l, k.yInput_ = m, k.sizeInput_ = q, this.coordinateView_ = k, e = this, l.onkeypress = function(b) {
        13 == b.keyCode && (Entry.Utils.isNumber(l.value) && e.entity.setX(Number(l.value)), e.updateCoordinateView(), e.blur());
      }, l.onblur = function(b) {
        e.entity.setX(e.entity.getX());
        Entry.stage.updateObject();
      }, m.onkeypress = function(b) {
        13 == b.keyCode && (Entry.Utils.isNumber(m.value) && e.entity.setY(Number(m.value)), e.updateCoordinateView(), e.blur());
      }, m.onblur = function(b) {
        e.entity.setY(e.entity.getY());
        Entry.stage.updateObject();
      }, g = Entry.createElement("div"), g.addClass("rotationMethodWrapper"), b.appendChild(g), this.rotationMethodWrapper_ = g, b = Entry.createElement("span"), b.addClass("entryObjectRotateMethodLabelWorkspace"), g.appendChild(b), b.innerHTML = Lang.Workspace.rotate_method + " : ", b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeAWorkspace"), b.object = this, this.rotateModeAView_ = b, g.appendChild(b), b.bindOnClick(function(b) {
        Entry.engine.isState("run") || this.object.setRotateMethod("free");
      }), b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeBWorkspace"), b.object = this, this.rotateModeBView_ = b, g.appendChild(b), b.bindOnClick(function(b) {
        Entry.engine.isState("run") || this.object.setRotateMethod("vertical");
      }), b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeCWorkspace"), b.object = this, this.rotateModeCView_ = b, g.appendChild(b), b.bindOnClick(function(b) {
        Entry.engine.isState("run") || this.object.setRotateMethod("none");
      }), this.updateThumbnailView(), this.updateCoordinateView(), this.updateRotateMethodView(), this.updateInputViews(), this.view_;
    }
  };
  b.setName = function(b) {
    Entry.assert("string" == typeof b, "object name must be string");
    this.name = b;
    this.nameView_.value = b;
  };
  b.setText = function(b) {
    Entry.assert("string" == typeof b, "object text must be string");
    this.text = b;
  };
  b.setScript = function(b) {
    this.script = b;
  };
  b.getScriptText = function() {
    return JSON.stringify(this.script.toJSON());
  };
  b.initEntity = function(b) {
    var c = {};
    c.x = c.y = 0;
    c.rotation = 0;
    c.direction = 90;
    if ("sprite" == this.objectType) {
      var e = b.sprite.pictures[0].dimension;
      c.regX = e.width / 2;
      c.regY = e.height / 2;
      c.scaleX = c.scaleY = "background" == b.sprite.category.main || "new" == b.sprite.category.main ? Math.max(270 / e.height, 480 / e.width) : "new" == b.sprite.category.main ? 1 : 200 / (e.width + e.height);
      c.width = e.width;
      c.height = e.height;
    } else {
      if ("textBox" == this.objectType) {
        if (c.regX = 25, c.regY = 12, c.scaleX = c.scaleY = 1.5, c.width = 50, c.height = 24, c.text = b.text, b.options) {
          if (b = b.options, e = "", b.bold && (e += "bold "), b.italic && (e += "italic "), c.underline = b.underline, c.strike = b.strike, c.font = e + "20px " + b.font.family, c.colour = b.colour, c.bgColor = b.background, c.lineBreak = b.lineBreak) {
            c.width = 256, c.height = 0.5625 * c.width, c.regX = c.width / 2, c.regY = c.height / 2;
          }
        } else {
          c.underline = !1, c.strike = !1, c.font = "20px Nanum Gothic", c.colour = "#000000", c.bgColor = "#ffffff";
        }
      }
    }
    return c;
  };
  b.updateThumbnailView = function() {
    if ("sprite" == this.objectType) {
      if (this.entity.picture.fileurl) {
        this.thumbnailView_.style.backgroundImage = 'url("' + this.entity.picture.fileurl + '")';
      } else {
        var b = this.entity.picture.filename;
        this.thumbnailView_.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/thumb/" + b + '.png")';
      }
    } else {
      "textBox" == this.objectType && (this.thumbnailView_.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/text_icon.png") + ")");
    }
  };
  b.updateCoordinateView = function(b) {
    if ((this.isSelected() || b) && this.coordinateView_ && this.coordinateView_.xInput_ && this.coordinateView_.yInput_) {
      b = this.coordinateView_.xInput_.value;
      var c = this.coordinateView_.yInput_.value, e = this.coordinateView_.sizeInput_.value, f = this.entity.getX().toFixed(1), g = this.entity.getY().toFixed(1), h = this.entity.getSize().toFixed(1);
      b != f && (this.coordinateView_.xInput_.value = f);
      c != g && (this.coordinateView_.yInput_.value = g);
      e != h && (this.coordinateView_.sizeInput_.value = h);
    }
  };
  b.updateRotationView = function(b) {
    if (this.isSelected() && this.view_ || b) {
      b = "", "free" == this.getRotateMethod() ? (this.rotateSpan_.removeClass("entryRemove"), this.rotateInput_.removeClass("entryRemove"), b += this.entity.getRotation().toFixed(1), this.rotateInput_.value = b + "\u02da") : (this.rotateSpan_.addClass("entryRemove"), this.rotateInput_.addClass("entryRemove")), b = "" + this.entity.getDirection().toFixed(1), this.directionInput_.value = b + "\u02da";
    }
  };
  b.select = function(b) {
    console.log(this);
  };
  b.addPicture = function(b, d) {
    b.objectId = this.id;
    d || 0 === d ? this.pictures.splice(d, 0, b) : this.pictures.push(b);
    Entry.playground.injectPicture(this);
  };
  b.removePicture = function(b) {
    if (2 > this.pictures.length) {
      return !1;
    }
    b = this.getPicture(b);
    var c = this.pictures.indexOf(b);
    this.pictures.splice(c, 1);
    b === this.selectedPicture && Entry.playground.selectPicture(this.pictures[0]);
    Entry.playground.injectPicture(this);
    Entry.playground.reloadPlayground();
    return !0;
  };
  b.getPicture = function(b) {
    if (!b) {
      return this.selectedPicture;
    }
    b = b.trim();
    for (var c = this.pictures, e = c.length, f = 0; f < e; f++) {
      if (c[f].id == b) {
        return c[f];
      }
    }
    for (f = 0; f < e; f++) {
      if (c[f].name == b) {
        return c[f];
      }
    }
    b = Entry.parseNumber(b);
    if ((!1 !== b || "boolean" != typeof b) && e >= b && 0 < b) {
      return c[b - 1];
    }
    throw Error("No picture found");
  };
  b.setPicture = function(b) {
    for (var c in this.pictures) {
      if (b.id === this.pictures[c].id) {
        this.pictures[c] = b;
        return;
      }
    }
    throw Error("No picture found");
  };
  b.getPrevPicture = function(b) {
    for (var c = this.pictures, e = c.length, f = 0; f < e; f++) {
      if (c[f].id == b) {
        return c[0 == f ? e - 1 : f - 1];
      }
    }
  };
  b.getNextPicture = function(b) {
    for (var c = this.pictures, e = c.length, f = 0; f < e; f++) {
      if (c[f].id == b) {
        return c[f == e - 1 ? 0 : f + 1];
      }
    }
  };
  b.selectPicture = function(b) {
    var c = this.getPicture(b);
    if (c) {
      this.selectedPicture = c, this.entity.setImage(c), this.updateThumbnailView();
    } else {
      throw Error("No picture with pictureId : " + b);
    }
  };
  b.addSound = function(b, d) {
    b.id || (b.id = Entry.generateHash());
    Entry.initSound(b, d);
    d || 0 === d ? this.sounds.splice(d, 0, b) : this.sounds.push(b);
    Entry.playground.injectSound(this);
  };
  b.removeSound = function(b) {
    b = this.getSound(b);
    b = this.sounds.indexOf(b);
    this.sounds.splice(b, 1);
    Entry.playground.reloadPlayground();
    Entry.playground.injectSound(this);
  };
  b.getRotateMethod = function() {
    this.rotateMethod || (this.rotateMethod = "free");
    return this.rotateMethod;
  };
  b.setRotateMethod = function(b) {
    b || (b = "free");
    this.rotateMethod = b;
    this.updateRotateMethodView();
    Entry.stage.selectedObject && Entry.stage.selectedObject.entity && (Entry.stage.updateObject(), Entry.stage.updateHandle());
  };
  b.initRotateValue = function(b) {
    this.rotateMethod != b && (b = this.entity, b.rotation = 0.0, b.direction = 90.0, b.flip = !1);
  };
  b.updateRotateMethodView = function() {
    var b = this.rotateMethod;
    this.rotateModeAView_ && (this.rotateModeAView_.removeClass("selected"), this.rotateModeBView_.removeClass("selected"), this.rotateModeCView_.removeClass("selected"), "free" == b ? this.rotateModeAView_.addClass("selected") : "vertical" == b ? this.rotateModeBView_.addClass("selected") : this.rotateModeCView_.addClass("selected"), this.updateRotationView());
  };
  b.toggleInformation = function(b) {
    this.setRotateMethod(this.getRotateMethod());
    void 0 === b && (b = this.isInformationToggle = !this.isInformationToggle);
    b ? this.view_.addClass("informationToggle") : this.view_.removeClass("informationToggle");
  };
  b.addCloneEntity = function(b, d, e) {
    this.clonedEntities.length > Entry.maxCloneLimit || (b = new Entry.EntityObject(this), d ? (b.injectModel(d.picture ? d.picture : null, d.toJSON()), b.snapshot_ = d.snapshot_, d.effect && (b.effect = Entry.cloneSimpleObject(d.effect), b.applyFilter()), d.brush && Entry.setCloneBrush(b, d.brush)) : (b.injectModel(this.entity.picture ? this.entity.picture : null, this.entity.toJSON(b)), b.snapshot_ = this.entity.snapshot_, this.entity.effect && (b.effect = Entry.cloneSimpleObject(this.entity.effect), 
    b.applyFilter()), this.entity.brush && Entry.setCloneBrush(b, this.entity.brush)), Entry.engine.raiseEventOnEntity(b, [b, "when_clone_start"]), b.isClone = !0, b.isStarted = !0, this.addCloneVariables(this, b, d ? d.variables : null, d ? d.lists : null), this.clonedEntities.push(b), Entry.stage.loadEntity(b));
  };
  b.initializeSplitter = function(b) {
    b.onmousedown = function(b) {
      Entry.container.disableSort();
      Entry.container.splitterEnable = !0;
    };
    document.addEventListener("mousemove", function(b) {
      Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:b.x || b.clientX});
    });
    document.addEventListener("mouseup", function(b) {
      Entry.container.splitterEnable = !1;
      Entry.container.enableSort();
    });
  };
  b.isSelected = function() {
    return this.isSelected_;
  };
  b.toJSON = function() {
    var b = {};
    b.id = this.id;
    b.name = this.name;
    "textBox" == this.objectType && (b.text = this.text);
    b.script = this.getScriptText();
    "sprite" == this.objectType && (b.selectedPictureId = this.selectedPicture.id);
    b.objectType = this.objectType;
    b.rotateMethod = this.getRotateMethod();
    b.scene = this.scene.id;
    b.sprite = {pictures:Entry.getPicturesJSON(this.pictures), sounds:Entry.getSoundsJSON(this.sounds)};
    b.lock = this.lock;
    b.entity = this.entity.toJSON();
    return b;
  };
  b.destroy = function() {
    Entry.stage.unloadEntity(this.entity);
    this.view_ && Entry.removeElement(this.view_);
  };
  b.getSound = function(b) {
    b = b.trim();
    for (var c = this.sounds, e = c.length, f = 0; f < e; f++) {
      if (c[f].id == b) {
        return c[f];
      }
    }
    for (f = 0; f < e; f++) {
      if (c[f].name == b) {
        return c[f];
      }
    }
    b = Entry.parseNumber(b);
    if ((!1 !== b || "boolean" != typeof b) && e >= b && 0 < b) {
      return c[b - 1];
    }
    throw Error("No Sound");
  };
  b.addCloneVariables = function(b, d, e, f) {
    d.variables = [];
    d.lists = [];
    e || (e = Entry.findObjsByKey(Entry.variableContainer.variables_, "object_", b.id));
    f || (f = Entry.findObjsByKey(Entry.variableContainer.lists_, "object_", b.id));
    for (b = 0; b < e.length; b++) {
      d.variables.push(e[b].clone());
    }
    for (b = 0; b < f.length; b++) {
      d.lists.push(f[b].clone());
    }
  };
  b.getLock = function() {
    return this.lock;
  };
  b.setLock = function(b) {
    this.lock = b;
    Entry.stage.updateObject();
    return b;
  };
  b.updateInputViews = function(b) {
    b = b || this.getLock();
    var c = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
    if (b && 1 != c[0].getAttribute("readonly")) {
      for (b = 0; b < c.length; b++) {
        c[b].removeClass("selectedEditingObject"), c[b].setAttribute("readonly", !1), this.isEditing = !1;
      }
    }
  };
  b.editObjectValues = function(b) {
    var c = this.getLock() ? [this.nameView_] : [this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
    if (b) {
      var e = this.nameView_;
      $(c).removeClass("selectedNotEditingObject");
      $(e).removeClass("selectedNotEditingObject");
      window.setTimeout(function() {
        $(e).removeAttr("readonly");
        e.addClass("selectedEditingObject");
      });
      for (b = 0; b < c.length; b++) {
        $(c[b]).removeAttr("readonly"), c[b].addClass("selectedEditingObject");
      }
      this.isEditing = !0;
    } else {
      for (b = 0; b < c.length; b++) {
        c[b].blur(!0);
      }
      this.nameView_.blur(!0);
      this.blurAllInput();
      this.isEditing = !1;
    }
  };
  b.blurAllInput = function() {
    document.getElementsByClassName("");
    $(".selectedEditingObject").removeClass("selectedEditingObject");
    var b = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
    for (var d = 0; d < b.length; d++) {
      var e = b[d];
      e.addClass("selectedNotEditingObject");
      e.setAttribute("readonly", !0);
    }
  };
  b.addStampEntity = function(b) {
    b = new Entry.StampEntity(this, b);
    Entry.stage.loadEntity(b);
    this.clonedEntities.push(b);
    Entry.stage.sortZorder();
  };
  b.getClonedEntities = function() {
    var b = [];
    this.clonedEntities.map(function(c) {
      c.isStamp || b.push(c);
    });
    return b;
  };
  b.getStampEntities = function() {
    var b = [];
    this.clonedEntities.map(function(c) {
      c.isStamp && b.push(c);
    });
    return b;
  };
  b.clearExecutor = function() {
    this.script.clearExecutors();
    for (var b = this.clonedEntities.length; 0 < b; b--) {
      this.clonedEntities[b - 1].removeClone();
    }
    this.clonedEntities = [];
  };
  b._rightClick = function(b) {
    if (this.isContextMenuEnabled()) {
      var c = this, e = [{text:Lang.Workspace.context_rename, callback:function(b) {
        b.stopPropagation();
        c.setLock(!1);
        c.editObjectValues(!0);
        c.nameView_.select();
      }}, {text:Lang.Workspace.context_duplicate, enable:!Entry.engine.isState("run"), callback:function() {
        Entry.container.addCloneObject(c);
      }}, {text:Lang.Workspace.context_remove, callback:function() {
        Entry.dispatchEvent("removeObject", c);
        Entry.container.removeObject(c);
      }}, {text:Lang.Workspace.copy_file, callback:function() {
        Entry.container.setCopiedObject(c);
      }}, {text:Lang.Blocks.Paste_blocks, enable:!Entry.engine.isState("run") && !!Entry.container.copiedObject, callback:function() {
        Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
      }}];
      b = Entry.Utils.convertMouseEvent(b);
      Entry.ContextMenu.show(e, "workspace-contextmenu", {x:b.clientX, y:b.clientY});
    }
  };
  b.enableContextMenu = function() {
    this._isContextMenuEnabled = !0;
  };
  b.disableContextMenu = function() {
    this._isContextMenuEnabled = !1;
  };
  b.isContextMenuEnabled = function() {
    return this._isContextMenuEnabled && Entry.objectEditable;
  };
  b.toggleEditObject = function() {
    var b = this.isEditing;
    Entry.engine.isState("run") || !1 !== b || (this.editObjectValues(!b), Entry.playground.object !== this && Entry.container.selectObject(this.id), this.nameView_.select());
  };
  b.toggleEditObject = function() {
    var b = this.isEditing;
    Entry.engine.isState("run") || !1 !== b || (this.editObjectValues(!b), Entry.playground.object !== this && Entry.container.selectObject(this.id), this.nameView_.select());
  };
  b.getDom = function(b) {
    if (!b || 0 === b.length) {
      return this.view_;
    }
    if (1 <= b.length) {
      switch(b.shift()) {
        case "editButton":
          return this.editView_;
      }
    }
  };
})(Entry.EntryObject.prototype);
Entry.BlockParser = function(b) {
  this.syntax = b;
  this._iterVariableCount = 0;
  this._iterVariableChunk = ["i", "j", "k"];
};
(function(b) {
  b.Code = function(b) {
    if (b instanceof Entry.Thread) {
      return this.Thread(b);
    }
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    var c = "";
    b = b.getThreads();
    for (var e = 0; e < b.length; e++) {
      c += this.Thread(b[e]);
    }
    return c;
  };
  b.Thread = function(b) {
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    var c = "";
    b = b.getBlocks();
    for (var e = 0; e < b.length; e++) {
      c += this.Block(b[e]);
    }
    return c;
  };
  b.Block = function(b) {
    var c = b._schema.syntax;
    return c ? this[c[0]](b) : "";
  };
  b.Program = function(b) {
    return "";
  };
  b.Scope = function(b) {
    b = b._schema.syntax.concat();
    return b.splice(1, b.length - 1).join(".") + "();\n";
  };
  b.BasicFunction = function(b) {
    b = this.Thread(b.statements[0]);
    return "function promise() {\n" + this.indent(b) + "}\n";
  };
  b.BasicIteration = function(b) {
    var c = b.params[0], e = this.publishIterateVariable();
    b = this.Thread(b.statements[0]);
    this.unpublishIterateVariable();
    return "for (var " + e + " = 0; " + e + " < " + c + "; " + e + "++){\n" + this.indent(b) + "}\n";
  };
  b.BasicIf = function(b) {
    var c = this.Thread(b.statements[0]);
    return "if (" + b._schema.syntax.concat()[1] + ") {\n" + this.indent(c) + "}\n";
  };
  b.BasicWhile = function(b) {
    var c = this.Thread(b.statements[0]);
    return "while (" + b._schema.syntax.concat()[1] + ") {\n" + this.indent(c) + "}\n";
  };
  b.indent = function(b) {
    var c = "    ";
    b = b.split("\n");
    b.pop();
    return c += b.join("\n    ") + "\n";
  };
  b.publishIterateVariable = function() {
    var b = "", d = this._iterVariableCount;
    do {
      b = this._iterVariableChunk[d % 3] + b, d = parseInt(d / 3) - 1, 0 === d && (b = this._iterVariableChunk[0] + b);
    } while (0 < d);
    this._iterVariableCount++;
    return b;
  };
  b.unpublishIterateVariable = function() {
    this._iterVariableCount && this._iterVariableCount--;
  };
})(Entry.BlockParser.prototype);
Entry.Painter2 = function(b) {
  this.view = b;
  this.baseUrl = Entry.painterBaseUrl || "/lib/literallycanvas/lib/img";
  this.file = {id:Entry.generateHash(), name:"\uc0c8\uadf8\ub9bc", modified:!1, mode:"new"};
  Entry.addEventListener("pictureImport", function(b) {
    this.addPicture(b);
  }.bind(this));
  this.clipboard = null;
};
(function(b) {
  b.initialize = function() {
    if (!this.lc) {
      var b = this.baseUrl, d = new Image;
      d.src = b + "/transparent-pattern.png";
      this.lc = LC.init(this.view, {imageURLPrefix:b, zoomMax:3.0, zoomMin:0.5, toolbarPosition:"bottom", imageSize:{width:960, height:540}, backgroundShapes:[LC.createShape("Rectangle", {x:0, y:0, width:960, height:540, strokeWidth:0, strokeColor:"transparent"})]});
      d.onload = function() {
        this.lc.repaintLayer("background");
      }.bind(this);
      b = function(b) {
        b && (b.shape && !b.opts && b.shape.isPass || b.opts && b.opts.isPass) ? Entry.do("processPicture", b, this.lc) : Entry.do("editPicture", b, this.lc);
        this.file.modified = !0;
      }.bind(this);
      this.lc.on("clear", b);
      this.lc.on("remove", b);
      this.lc.on("shapeEdit", b);
      this.lc.on("shapeSave", b);
      this.lc.on("toolChange", function(b) {
        this.updateEditMenu();
      }.bind(this));
      this.lc.on("lc-pointerdrag", this.stagemousemove.bind(this));
      this.lc.on("lc-pointermove", this.stagemousemove.bind(this));
      this.initTopBar();
      this.updateEditMenu();
      Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardPressControl);
      Entry.keyUpped && Entry.keyUpped.attach(this, this._keyboardUpControl);
    }
  };
  b.show = function() {
    this.lc || this.initialize();
    this.isShow = !0;
  };
  b.hide = function() {
    this.isShow = !1;
  };
  b.changePicture = function(b) {
    this.file && this.file.id === b.id || (this.file.modified && confirm("\uc218\uc815\ub41c \ub0b4\uc6a9\uc744 \uc800\uc7a5\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?") && this.file_save(!0), this.file.modified = !1, this.lc.clear(!1), this.file.id = b.id || Entry.generateHash(), this.file.name = b.name, this.file.mode = "edit", this.file.objectId = b.objectId, this.addPicture(b, !0), this.lc.undoStack = [], Entry.stateManager.removeAllPictureCommand());
  };
  b.addPicture = function(b, d) {
    var c = new Image;
    c.src = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/image/" + b.filename + ".png";
    b = b.dimension;
    var f = LC.createShape("Image", {x:480, y:270, width:b.width, height:b.height, image:c});
    this.lc.saveShape(f, !d);
    c.onload = function() {
      this.lc.setTool(this.lc.tools.SelectShape);
      this.lc.tool.setShape(this.lc, f);
    }.bind(this);
  };
  b.copy = function() {
    if ("SelectShape" === this.lc.tool.name && this.lc.tool.selectedShape) {
      var b = this.lc.tool.selectedShape;
      this.clipboard = {className:b.className, data:b.toJSON()};
      this.updateEditMenu();
    }
  };
  b.cut = function() {
    "SelectShape" === this.lc.tool.name && this.lc.tool.selectedShape && (this.copy(), this.lc.removeShape(this.lc.tool.selectedShape), this.lc.tool.setShape(this.lc, null));
  };
  b.paste = function() {
    if (this.clipboard) {
      var b = this.lc.addShape(this.clipboard);
      this.lc.setTool(this.lc.tools.SelectShape);
      this.lc.tool.setShape(this.lc, b);
    }
  };
  b.updateEditMenu = function() {
    var b = "SelectShape" === this.lc.tool.name ? "block" : "none";
    this._cutButton.style.display = b;
    this._copyButton.style.display = b;
    this._pasteButton.style.display = this.clipboard ? "block" : "none";
  };
  b.file_save = function() {
    this.lc.trigger("dispose");
    var b = this.lc.getImage().toDataURL();
    this.file_ = JSON.parse(JSON.stringify(this.file));
    Entry.dispatchEvent("saveCanvasImage", {file:this.file_, image:b});
    this.file.modified = !1;
  };
  b.newPicture = function() {
    var b = {dimension:{height:1, width:1}, fileurl:Entry.mediaFilePath + "_1x1.png", name:Lang.Workspace.new_picture};
    b.id = Entry.generateHash();
    this.file && this.file.objectId && (b.objectId = this.file.objectId);
    Entry.playground.addPicture(b, !0);
  };
  b._keyboardPressControl = function(b) {
    if (this.isShow && !Entry.Utils.isInInput(b)) {
      var c = b.keyCode || b.which, e = b.ctrlKey;
      8 == c || 46 == c ? (this.cut(), b.preventDefault()) : e && (67 == c ? this.copy() : 88 == c && this.cut());
      e && 86 == c && this.paste();
      this.lc.trigger("keyDown", b);
    }
  };
  b._keyboardUpControl = function(b) {
    this.lc.trigger("keyUp", b);
  };
  b.initTopBar = function() {
    var b = this, d = Entry.createElement(document.getElementById("canvas-top-menu"));
    d.addClass("entryPlaygroundPainterTop");
    d.addClass("entryPainterTop");
    var e = Entry.createElement("nav", "entryPainterTopMenu");
    e.addClass("entryPlaygroundPainterTopMenu");
    d.appendChild(e);
    var f = Entry.createElement("ul");
    e.appendChild(f);
    var g = Entry.createElement("li");
    e.appendChild(g);
    e = Entry.createElement("a", "entryPainterTopMenuFileNew");
    e.bindOnClick(function() {
      b.newPicture();
    });
    e.addClass("entryPlaygroundPainterTopMenuFileNew");
    e.innerHTML = Lang.Workspace.new_picture;
    g.appendChild(e);
    e = Entry.createElement("li", "entryPainterTopMenuFile");
    e.addClass("entryPlaygroundPainterTopMenuFile");
    e.innerHTML = Lang.Workspace.painter_file;
    f.appendChild(e);
    g = Entry.createElement("ul");
    e.appendChild(g);
    e = Entry.createElement("li");
    g.appendChild(e);
    var h = Entry.createElement("a", "entryPainterTopMenuFileSave");
    h.bindOnClick(function() {
      b.file_save(!1);
    });
    h.addClass("entryPainterTopMenuFileSave");
    h.innerHTML = Lang.Workspace.painter_file_save;
    e.appendChild(h);
    e = Entry.createElement("li");
    g.appendChild(e);
    g = Entry.createElement("a", "entryPainterTopMenuFileSaveAs");
    g.bindOnClick(function() {
      b.file.mode = "new";
      b.file_save(!1);
    });
    g.addClass("entryPlaygroundPainterTopMenuFileSaveAs");
    g.innerHTML = Lang.Workspace.painter_file_saveas;
    e.appendChild(g);
    g = Entry.createElement("li", "entryPainterTopMenuEdit");
    g.addClass("entryPlaygroundPainterTopMenuEdit");
    g.innerHTML = Lang.Workspace.painter_edit;
    f.appendChild(g);
    f = Entry.createElement("ul");
    g.appendChild(f);
    g = Entry.createElement("li");
    f.appendChild(g);
    e = Entry.createElement("a", "entryPainterTopMenuEditImportLink");
    e.bindOnClick(function() {
      Entry.dispatchEvent("openPictureImport");
    });
    e.addClass("entryPainterTopMenuEditImport");
    e.innerHTML = Lang.Workspace.get_file;
    g.appendChild(e);
    g = Entry.createElement("li");
    f.appendChild(g);
    e = Entry.createElement("a", "entryPainterTopMenuEditCopy");
    e.bindOnClick(function() {
      b.copy();
    });
    e.addClass("entryPlaygroundPainterTopMenuEditCopy");
    e.innerHTML = Lang.Workspace.copy_file;
    g.appendChild(e);
    this._copyButton = g;
    g = Entry.createElement("li");
    f.appendChild(g);
    e = Entry.createElement("a", "entryPainterTopMenuEditCut");
    e.bindOnClick(function() {
      b.cut();
    });
    e.addClass("entryPlaygroundPainterTopMenuEditCut");
    e.innerHTML = Lang.Workspace.cut_picture;
    g.appendChild(e);
    this._cutButton = g;
    g = Entry.createElement("li");
    f.appendChild(g);
    e = Entry.createElement("a", "entryPainterTopMenuEditPaste");
    e.bindOnClick(function() {
      b.paste();
    });
    e.addClass("entryPlaygroundPainterTopMenuEditPaste");
    e.innerHTML = Lang.Workspace.paste_picture;
    g.appendChild(e);
    this._pasteButton = g;
    g = Entry.createElement("li");
    f.appendChild(g);
    f = Entry.createElement("a", "entryPainterTopMenuEditEraseAll");
    f.addClass("entryPlaygroundPainterTopMenuEditEraseAll");
    f.innerHTML = Lang.Workspace.remove_all;
    f.bindOnClick(function() {
      b.lc.clear();
    });
    g.appendChild(f);
    this.painterTopStageXY = f = Entry.createElement("div", "entryPainterTopStageXY");
    f.addClass("entryPlaygroundPainterTopStageXY");
    d.appendChild(f);
    Entry.addEventListener("pictureSelected", this.changePicture.bind(this));
  };
  b.stagemousemove = function(b) {
    this.painterTopStageXY.textContent = "x:" + b.x.toFixed(1) + ", y:" + b.y.toFixed(1);
  };
})(Entry.Painter2.prototype);

