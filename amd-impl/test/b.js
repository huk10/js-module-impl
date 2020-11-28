define(["c"], function (c) {
  console.log("load B module");
  return {
    show() {
      console.log('my name is "B"');
      c.show();
    },
  };
});
