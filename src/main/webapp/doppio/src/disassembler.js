// Generated by CoffeeScript 1.3.3
(function() {
  var pad_left, root, types, util, _;

  root = typeof exports !== "undefined" && exports !== null ? exports : this.disassembler = {};

  _ = require('../vendor/_.js');

  util = require('./util');

  types = require('./types');

  "use strict";


  pad_left = function(value, padding) {
    var zeroes;
    zeroes = new Array(padding).join('0');
    return (zeroes + value).slice(-padding);
  };

  root.disassemble = function(class_file) {
    var access, access_string, annotations, astr, attr, b, cls, code, const_attr, deprecated, eh, entry, exc_attr, f, fixed_width, flags, format, format_decimal, i, icls, ifaces, inner_classes, item, m, p, pool, pp_type, print_excs, ret_type, rv, sig, source_file, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    access_string = function(access_flags) {
      var flag, ordered_flags, privacy;
      ordered_flags = ['public', 'protected', 'private', 'static', 'final'];
      if (!access_flags["interface"]) {
        ordered_flags.push('abstract');
      }
      return privacy = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = ordered_flags.length; _i < _len; _i++) {
          flag = ordered_flags[_i];
          _results.push(access_flags[flag] ? "" + flag + " " : void 0);
        }
        return _results;
      })()).join('');
    };
    source_file = _.find(class_file.attrs, function(attr) {
      return attr.name === 'SourceFile';
    });
    deprecated = _.find(class_file.attrs, function(attr) {
      return attr.name === 'Deprecated';
    });
    annotations = _.find(class_file.attrs, function(attr) {
      return attr.name === 'RuntimeVisibleAnnotations';
    });
    ifaces = (function() {
      var _i, _len, _ref, _results;
      _ref = class_file.interfaces;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(class_file.constant_pool.get(i).deref());
      }
      return _results;
    })();
    ifaces = ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ifaces.length; _i < _len; _i++) {
        i = ifaces[_i];
        _results.push(util.is_string(i) ? util.ext_classname(i) : i.toExternalString());
      }
      return _results;
    })()).join(',');
    rv = "Compiled from \"" + ((_ref = source_file != null ? source_file.filename : void 0) != null ? _ref : 'unknown') + "\"\n";
    rv += access_string(class_file.access_flags);
    if (class_file.access_flags["interface"]) {
      rv += "interface " + (class_file.this_class.toExternalString()) + " extends " + ifaces + "\n";
    } else {
      rv += "class " + (class_file.this_class.toExternalString()) + " extends " + ((_ref1 = class_file.super_class) != null ? _ref1.toExternalString() : void 0);
      rv += ifaces && !class_file.access_flags["interface"] ? " implements " + ifaces + "\n" : '\n';
    }
    if (source_file) {
      rv += "  SourceFile: \"" + source_file.filename + "\"\n";
    }
    if (deprecated) {
      rv += "  Deprecated: length = 0x\n";
    }
    if (annotations) {
      rv += "  RuntimeVisibleAnnotations: length = 0x" + (annotations.raw_bytes.length.toString(16)) + "\n";
      rv += "   " + (((function() {
        var _i, _len, _ref2, _results;
        _ref2 = annotations.raw_bytes;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          b = _ref2[_i];
          _results.push(pad_left(b.toString(16), 2));
        }
        return _results;
      })()).join(' ')) + "\n";
    }
    inner_classes = (function() {
      var _i, _len, _ref2, _results;
      _ref2 = class_file.attrs;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        attr = _ref2[_i];
        if (attr.name === 'InnerClasses') {
          _results.push(attr);
        }
      }
      return _results;
    })();
    for (_i = 0, _len = inner_classes.length; _i < _len; _i++) {
      icls = inner_classes[_i];
      rv += "  InnerClass:\n";
      _ref2 = icls.classes;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        cls = _ref2[_j];
        flags = util.parse_flags(cls.inner_access_flags);
        access = ((function() {
          var _k, _len2, _ref3, _results;
          _ref3 = ['public', 'protected', 'private', 'abstract'];
          _results = [];
          for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
            f = _ref3[_k];
            _results.push(flags[f] ? f + ' ' : void 0);
          }
          return _results;
        })()).join('');
        if (cls.outer_info_index <= 0) {
          rv += "   " + access + "#" + cls.inner_info_index + ";\n";
        } else {
          rv += "   " + access + "#" + cls.inner_name_index + "= #" + cls.inner_info_index + " of #" + cls.outer_info_index + ";\n";
        }
      }
    }
    rv += "  minor version: " + class_file.minor_version + "\n";
    rv += "  major version: " + class_file.major_version + "\n";
    rv += "  Constant pool:\n";
    format_decimal = function(val, type_char) {
      var m, str, valStr, _ref3;
      valStr = val.toString();
      if (type_char === 'f') {
        if (val === util.FLOAT_POS_INFINITY) {
          valStr = "Infinity";
        } else if (val === util.FLOAT_NEG_INFINITY) {
          valStr = "-Infinity";
        } else if (util.is_float_NaN(val)) {
          valStr = "NaN";
        }
      }
      if (valStr.match(/-?(Infinity|NaN)/)) {
        str = valStr;
      } else {
        m = valStr.match(/(-?\d+)(\.\d+)?(?:e\+?(-?\d+))?/);
        str = m[1] + (m[2] ? m[2] : '.0');
        if (type_char === 'f' && ((_ref3 = m[2]) != null ? _ref3.length : void 0) > 8) {
          str = parseFloat(str).toFixed(7);
        }
        str = str.replace(/0+$/, '').replace(/\.$/, '.0');
        if (m[3] != null) {
          str += "E" + m[3];
        }
      }
      return str + type_char;
    };
    format = function(entry) {
      var val;
      val = entry.value;
      switch (entry.type) {
        case 'Method':
        case 'InterfaceMethod':
        case 'Field':
          return "#" + val.class_ref.value + ".#" + val.sig.value;
        case 'NameAndType':
          return "#" + val.meth_ref.value + ":#" + val.type_ref.value;
        case 'float':
          return format_decimal(val, 'f');
        case 'double':
          return format_decimal(val, 'd');
        case 'long':
          return val + "l";
        default:
          return util.escape_whitespace((entry.deref != null ? "#" : "") + val);
      }
    };
    pool = class_file.constant_pool;
    pool.each(function(idx, entry) {
      rv += "const #" + idx + " = " + entry.type + "\t" + (format(entry)) + ";";
      return rv += "" + (util.format_extra_info(entry)) + "\n";
    });
    rv += "\n";
    pp_type = function(field_type) {
      if (field_type instanceof types.ArrayType) {
        return pp_type(field_type.component_type) + '[]';
      } else {
        return field_type.toExternalString();
      }
    };
    print_excs = function(exc_attr) {
      var e, excs;
      excs = exc_attr.exceptions;
      return "   throws " + ((function() {
        var _k, _len2, _results;
        _results = [];
        for (_k = 0, _len2 = excs.length; _k < _len2; _k++) {
          e = excs[_k];
          _results.push(util.ext_classname(e));
        }
        return _results;
      })()).join(', ');
    };
    rv += "{\n";
    _ref3 = class_file.fields;
    for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
      f = _ref3[_k];
      astr = access_string(f.access_flags);
      if (astr !== '') {
        rv += "" + astr + " ";
      }
      rv += "" + (pp_type(f.type)) + " " + f.name + ";\n";
      const_attr = _.find(f.attrs, function(attr) {
        return attr.name === 'ConstantValue';
      });
      if (const_attr != null) {
        entry = pool.get(const_attr.ref);
        rv += "  Constant value: " + entry.type + " " + ((typeof entry.deref === "function" ? entry.deref() : void 0) || entry.value) + "\n";
      }
      rv += "\n\n";
    }
    _ref4 = class_file.methods;
    for (sig in _ref4) {
      m = _ref4[sig];
      rv += access_string(m.access_flags);
      if (m.access_flags.synchronized) {
        rv += 'synchronized ';
      }
      rv += m.name === '<init>' ? class_file.this_class.toExternalString() : m.name === '<clinit>' ? "{}" : (ret_type = m.return_type != null ? pp_type(m.return_type) : "", ret_type + " " + m.name);
      if (m.name !== '<clinit>') {
        rv += "(" + (((function() {
          var _l, _len3, _ref5, _results;
          _ref5 = m.param_types;
          _results = [];
          for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
            p = _ref5[_l];
            _results.push(pp_type(p));
          }
          return _results;
        })()).join(', ')) + ")";
      }
      if (exc_attr = _.find(m.attrs, function(a) {
        return a.name === 'Exceptions';
      })) {
        rv += print_excs(exc_attr);
      }
      rv += ";\n";
      if (!(m.access_flags["native"] || m.access_flags.abstract)) {
        rv += "  Code:\n";
        code = m.code;
        rv += "   Stack=" + code.max_stack + ", Locals=" + code.max_locals + ", Args_size=" + m.num_args + "\n";
        code.parse_code();
        code.each_opcode(function(idx, oc) {
          rv += "   " + idx + ":\t" + oc.name;
          rv += oc.annotate(idx, pool);
          return rv += "\n";
        });
        if (code.exception_handlers.length > 0) {
          fixed_width = function(num, width) {
            var num_str;
            num_str = num.toString();
            return ((function() {
              var _l, _ref5, _results;
              _results = [];
              for (_l = 0, _ref5 = width - num_str.length; 0 <= _ref5 ? _l < _ref5 : _l > _ref5; 0 <= _ref5 ? _l++ : _l--) {
                _results.push(" ");
              }
              return _results;
            })()).join('') + num_str;
          };
          rv += "  Exception table:\n";
          rv += "   from   to  target type\n";
          _ref5 = code.exception_handlers;
          for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
            eh = _ref5[_l];
            rv += ((function() {
              var _len4, _m, _ref6, _results;
              _ref6 = ['start_pc', 'end_pc', 'handler_pc'];
              _results = [];
              for (_m = 0, _len4 = _ref6.length; _m < _len4; _m++) {
                item = _ref6[_m];
                _results.push(fixed_width(eh[item], 6));
              }
              return _results;
            })()).join('');
            rv += "   " + (eh.catch_type[0] === '<' ? 'any' : "Class " + eh.catch_type + "\n") + "\n";
          }
          rv += "\n";
        }
        _ref6 = code.attrs;
        for (_m = 0, _len4 = _ref6.length; _m < _len4; _m++) {
          attr = _ref6[_m];
          rv += (typeof attr.disassemblyOutput === "function" ? attr.disassemblyOutput() : void 0) || '';
        }
        if (exc_attr) {
          rv += "  Exceptions:\n" + (print_excs(exc_attr)) + "\n";
        }
      }
      rv += "\n";
    }
    rv += "}\n";
    return rv;
  };

}).call(this);
