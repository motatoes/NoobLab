// Generated by CoffeeScript 1.3.3
(function() {
  var external2internal, is_subclass, is_subinterface, k, root, util, v, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : (_ref = window.types) != null ? _ref : window.types = {};

  util = require('./util');

  "use strict";


  root.internal2external = {
    B: 'byte',
    C: 'char',
    D: 'double',
    F: 'float',
    I: 'int',
    J: 'long',
    S: 'short',
    V: 'void',
    Z: 'boolean'
  };

  external2internal = {};

  _ref1 = root.internal2external;
  for (k in _ref1) {
    v = _ref1[k];
    external2internal[v] = k;
  }

  root.carr2type = function(carr) {
    var c;
    c = carr.shift();
    if (c == null) {
      return null;
    }
    if (c in root.internal2external) {
      return new root.PrimitiveType(root.internal2external[c]);
    } else if (c === 'L') {
      return new root.ClassType(((function() {
        var _results;
        _results = [];
        while ((c = carr.shift()) !== ';') {
          _results.push(c);
        }
        return _results;
      })()).join(''));
    } else if (c === '[') {
      return new root.ArrayType(root.carr2type(carr));
    } else {
      carr.unshift(c);
      throw new Error("Unrecognized type string: " + (carr.join('')));
    }
  };

  root.str2type = function(type_str) {
    var c;
    c = type_str[0];
    if (c in root.internal2external) {
      return new root.PrimitiveType(root.internal2external[c]);
    } else if (c === 'L') {
      return new root.ClassType(type_str.slice(1, -1));
    } else if (c === '[') {
      return new root.ArrayType(root.str2type(type_str.slice(1)));
    } else {
      throw new Error("Unrecognized type string: " + type_str);
    }
  };

  root.c2t = function(type_str) {
    if (!(typeof UNSAFE !== "undefined" && UNSAFE !== null) && type_str instanceof root.Type) {
      throw "" + type_str + " is already a Type";
    }
    if (type_str[0] === '[') {
      return root.str2type(type_str);
    } else {
      return new root.ClassType(type_str);
    }
  };

  root.Type = (function() {

    function Type() {}

    Type.prototype.toString = function() {
      return this.valueOf();
    };

    return Type;

  })();

  root.PrimitiveType = (function(_super) {
    var type_cache;

    __extends(PrimitiveType, _super);

    type_cache = {};

    function PrimitiveType(name) {
      if (type_cache.hasOwnProperty(name)) {
        return type_cache[name];
      }
      this.name = name;
      type_cache[name] = this;
    }

    PrimitiveType.prototype.valueOf = function() {
      return external2internal[this.name];
    };

    PrimitiveType.prototype.toExternalString = function() {
      return this.name;
    };

    return PrimitiveType;

  })(root.Type);

  root.ArrayType = (function(_super) {

    __extends(ArrayType, _super);

    function ArrayType(component_type) {
      this.component_type = component_type;
    }

    ArrayType.prototype.valueOf = function() {
      return "[" + this.component_type;
    };

    ArrayType.prototype.toClassString = function() {
      return this.valueOf();
    };

    ArrayType.prototype.toExternalString = function() {
      return util.ext_classname(this.valueOf());
    };

    return ArrayType;

  })(root.Type);

  root.ClassType = (function(_super) {

    __extends(ClassType, _super);

    function ClassType(class_name) {
      this.class_name = class_name;
    }

    ClassType.prototype.valueOf = function() {
      return "L" + this.class_name + ";";
    };

    ClassType.prototype.toClassString = function() {
      return this.class_name;
    };

    ClassType.prototype.toExternalString = function() {
      return util.ext_classname(this.class_name);
    };

    return ClassType;

  })(root.Type);

  is_subclass = function(rs, class1, class2) {
    if (class1['this_class'] === class2['this_class']) {
      return true;
    }
    if (!class1['super_class']) {
      return false;
    }
    return is_subclass(rs, rs.class_lookup(class1.super_class), class2);
  };

  is_subinterface = function(rs, iface1, iface2) {
    var i, super_iface, _i, _len, _ref2;
    if (iface1['this_class'] === iface2['this_class']) {
      return true;
    }
    _ref2 = iface1.interfaces;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      i = _ref2[_i];
      super_iface = rs.class_lookup(root.c2t(iface1.constant_pool.get(i).deref()));
      if (is_subinterface(rs, super_iface, iface2)) {
        return true;
      }
    }
    if (!iface1['super_class']) {
      return false;
    }
    return is_subinterface(rs, rs.class_lookup(iface1.super_class), iface2);
  };

  root.check_cast = function(rs, obj, classname) {
    return root.is_castable(rs, obj.type, root.c2t(classname));
  };

  root.is_castable = function(rs, type1, type2) {
    var c1, c2, _ref2;
    if ((type1 instanceof root.PrimitiveType) || (type2 instanceof root.PrimitiveType)) {
      return type1 === type2;
    }
    if (type1 instanceof root.ArrayType) {
      if (type2 instanceof root.ArrayType) {
        return root.is_castable(rs, type1.component_type, type2.component_type);
      }
      c2 = rs.class_lookup(type2);
      if (!c2.access_flags["interface"]) {
        return type2.class_name === 'java/lang/Object';
      }
      return (_ref2 = type2.class_name) === 'java/lang/Cloneable' || _ref2 === 'java/io/Serializable';
    }
    if (type2 instanceof root.ArrayType) {
      return false;
    }
    c1 = rs.class_lookup(type1);
    c2 = rs.class_lookup(type2);
    if (!c1.access_flags["interface"]) {
      if (!c2.access_flags["interface"]) {
        return is_subclass(rs, c1, c2);
      }
      return is_subinterface(rs, c1, c2);
    }
    if (!c2.access_flags["interface"]) {
      return type2.class_name === 'java/lang/Object';
    }
    return is_subinterface(rs, c1, c2);
  };

}).call(this);
