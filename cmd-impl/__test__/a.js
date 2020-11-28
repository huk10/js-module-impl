define(function (require, exports, module) {
  console.log("a start load b");
  const b = require("file:///Users/hukun/Desktop/interview-impl/cmd-impl/__test__/b.js");
  module.exports.show = function (v) {
    b.show(v);
  };
});
