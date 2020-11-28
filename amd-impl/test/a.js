define(["b", "c"], function (b) {
  console.log("load A module");
  return {
    show() {
      console.log('my name is "A"');
      b.show();
    },
  };
});
