(function () {
  class EventHub {
    eventList = new Map();

    emit(name, value) {
      if (!this.eventList.has(name)) {
        return;
      }
      this.eventList.get(name).forEach((v) => v(value));
    }

    on(name, callback) {
      let callbackList = [];
      if (this.eventList.has(name)) {
        callbackList = this.eventList.get(name);
      }
      callbackList.push(callback);
      this.eventList.set(name, callbackList);
    }

    off(name, callback) {
      if (!this.eventList.has(name)) {
        return;
      }
      const list = this.eventList.get(name);
      const nextValue = list.filter((v) => v !== callback);
      if (nextValue.length === 0) {
        this.eventList.delete(name);
      } else {
        this.eventList.set(name, nextValue);
      }
    }

    once(name, callback) {
      const callbackWrap = (value) => {
        callback(value);
        this.off(name, callbackWrap);
      };
      this.on(name, callbackWrap);
    }
  }

  let pathList = [];
  let moduleCaches = new Map();
  let moduleIsLoading = new Map();
  const eventHub = new EventHub();

  function require(deps, callback) {
    loadModule(deps, function (modules) {
      callback(...modules);
    });
  }

  function define(deps, callback) {
    const parentName = document.currentScript.dataset.name;
    if (typeof deps === "undefined") {
      throw new TypeError("Need a function or dependency list");
    }
    if (Array.isArray(deps) && typeof callback === "function") {
      return loadModule(deps, onLoadCallback);
    }
    if (typeof callback === "undefined" && typeof deps === "function") {
      callback = deps;
      deps = undefined;
      onLoadCallback();
    }

    function onLoadCallback(module) {
      if (Array.isArray(module) && module.length > 0) {
        moduleCaches.set(parentName, callback(...module));
      } else {
        moduleCaches.set(parentName, callback());
      }
      eventHub.emit(parentName);
    }
  }

  function load(name, path) {
    moduleIsLoading.set(name, true);
    const script = document.createElement("script");
    script.dataset.name = name;
    script.src = path;
    script.onload = () => moduleIsLoading.set(name, false);
    document.body.appendChild(script);
  }

  function loadModule(deps, callback) {
    const modules = [];
    let doneNums = 0;
    deps.forEach(forDepsLoadCallback);
    onLoadDoneCallback();
    function forDepsLoadCallback(moduleName, index) {
      const cacheModule = getCacheModule(moduleName);
      if (cacheModule !== false) {
        modules[index] = cacheModule;
        doneNums++;
        return;
      }
      eventHub.once(moduleName, () => {
        modules[index] = moduleCaches.get(moduleName);
        doneNums++;
        onLoadDoneCallback();
      });
      const modulePath = getModuleFullPath(moduleName);
      if (!modulePath) {
        throw new Error(`load module error ${moduleName}`);
      }
      if (!moduleIsLoading.has(moduleName)) {
        load(moduleName, modulePath);
      }
    }

    function onLoadDoneCallback() {
      if (doneNums >= deps.length) {
        callback(modules);
      }
    }
  }

  function getCacheModule(name) {
    if (moduleCaches.has(name)) {
      return moduleCaches.get(name);
    }
    return false;
  }

  function getModuleFullPath(name) {
    return pathList[name];
  }

  require.config = function (config) {
    if (!config || typeof config.paths !== "object" || config.paths === null) {
      throw new TypeError("need to be a paths object!");
    }
    const baseUrl = config.baseUrl || "";
    for (const [key, value] of Object.entries(config.paths)) {
      if (typeof value !== "string") {
        throw new TypeError("need to be a module string path!");
      }
      pathList[key] = baseUrl + value;
    }
  };

  function loadMainFile() {
    if (document.currentScript) {
      const mainModulePath = document.currentScript.dataset.main;
      load(getFileName(mainModulePath), mainModulePath);

      function getFileName(s) {
        s = s.split("/");
        return s[s.length - 1].match(/(\w+)/g)[0];
      }
    }
  }

  window.require = require;
  window.define = define;
  loadMainFile();
})();
