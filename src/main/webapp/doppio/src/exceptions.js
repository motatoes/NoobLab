// Generated by CoffeeScript 1.3.3
(function() {
  var debug, error, root, trace, types, vtrace, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('../vendor/_.js');

  _ref = require('./logging'), trace = _ref.trace, vtrace = _ref.vtrace, error = _ref.error, debug = _ref.debug;

  types = require('./types');

  "use strict";


  root = typeof exports !== "undefined" && exports !== null ? exports : (_ref1 = window.exceptions) != null ? _ref1 : window.exceptions = {};

  root.HaltException = (function() {

    function HaltException(exit_code) {
      this.exit_code = exit_code;
    }

    HaltException.prototype.toplevel_catch_handler = function() {
      if (this.exit_code !== 0) {
        return error("\nExited with code " + this.exit_code);
      }
    };

    return HaltException;

  })();

  root.ReturnException = 'RETURNEXCEPTION';

  root.YieldException = (function() {

    function YieldException(condition) {
      this.condition = condition;
    }

    return YieldException;

  })();

  root.YieldIOException = (function(_super) {

    __extends(YieldIOException, _super);

    function YieldIOException() {
      return YieldIOException.__super__.constructor.apply(this, arguments);
    }

    return YieldIOException;

  })(root.YieldException);

  root.JavaException = (function() {

    function JavaException(exception) {
      this.exception = exception;
    }

    JavaException.prototype.method_catch_handler = function(rs, method, top_of_stack) {
      var cf, etype, exception_handlers, handler, _ref2, _ref3;
      cf = rs.curr_frame();
      if (!top_of_stack && method.has_bytecode) {
        cf.pc -= 3;
        while (!(cf.pc <= 0 || ((_ref2 = method.code.opcodes[cf.pc]) != null ? _ref2.name.match(/^invoke/) : void 0))) {
          --cf.pc;
        }
      }
      exception_handlers = (_ref3 = method.code) != null ? _ref3.exception_handlers : void 0;
      etype = this.exception.type;
      handler = _.find(exception_handlers, function(eh) {
        var _ref4;
        return (eh.start_pc <= (_ref4 = cf.pc) && _ref4 < eh.end_pc) && (eh.catch_type === "<any>" || types.is_castable(rs, etype, types.c2t(eh.catch_type)));
      });
      if (handler != null) {
        debug("caught " + (this.exception.type.toClassString()) + " in " + (method.full_signature()) + " as subclass of " + handler.catch_type);
        cf.stack = [];
        rs.push(this.exception);
        cf.pc = handler.handler_pc;
        return true;
      }
      debug("exception not caught, terminating " + (method.full_signature()));
      return false;
    };

    JavaException.prototype.toplevel_catch_handler = function(rs) {
      var msg;
      debug("\nUncaught " + (this.exception.type.toClassString()));
      msg = this.exception.get_field(rs, 'java/lang/Throwable/detailMessage');
      if (msg != null) {
        debug("\t" + (msg.jvm2js_str()));
        // PNMOD
        parent.javaruntimeerror = true;
      }
      rs.show_state();
      rs.push2(rs.curr_thread, this.exception);
      return rs.method_lookup({
        "class": 'java/lang/Thread',
        sig: 'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      }).setup_stack(rs);
    };

    return JavaException;

  })();

  root.java_throw = function(rs, cls, msg) {
    var method_spec, my_sf, v;
    method_spec = {
      "class": cls,
      sig: '<init>(Ljava/lang/String;)V'
    };
    v = rs.init_object(cls);
    rs.push_array([v, v, rs.init_string(msg)]);
    my_sf = rs.curr_frame();
    rs.method_lookup(method_spec).setup_stack(rs);
    my_sf.runner = function() {
      if (my_sf.method.has_bytecode) {
        my_sf.runner = (function() {
          return my_sf.method.run_bytecode(rs);
        });
      } else {
        my_sf.runner = null;
      }
      throw new root.JavaException(rs.pop());
    };
    throw root.ReturnException;
  };

}).call(this);
