require.config({
  baseUrl: "./",
  paths: {
    a: "a.js",
    b: "b.js",
    c: "c.js",
  },
});

require(["a"], function (a) {
  console.log("Call Main module");
  a.show();
});
