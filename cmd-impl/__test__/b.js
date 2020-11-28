define(function (require, exports, module) {
  console.log("b start load c");
  const c = require("file:///Users/hukun/Desktop/interview-impl/cmd-impl/__test__/c.js");
  exports.show = function (v) {
    c.show(v);
  };
});
