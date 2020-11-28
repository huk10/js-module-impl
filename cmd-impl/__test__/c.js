define(function (require, exports, module) {
  console.log("call c");
  module.exports = {
    show(v) {
      console.log("who ? call c : %s", v);
    },
  };
});
