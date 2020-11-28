var define = (function () {
  function EventHub() {
    this.eventList = new Map();
  }

  EventHub.prototype._getCallbackList = function (name) {
    return this.eventList.has(name) ? this.eventList.get(name) : [];
  };

  EventHub.prototype.emit = function (name) {
    this._getCallbackList(name).forEach((cb) => cb.call(null));
  };

  EventHub.prototype.off = function (name, callback) {
    const eventList = this._getCallbackList(name);
    const newEventList = eventList.filter((value) => value !== callback);
    if (newEventList.length === 0) {
      this.eventList.delete(name);
    } else {
      this.eventList.set(name, newEventList);
    }
  };

  EventHub.prototype.once = function (name, callback) {
    const self = this;

    function wrap(value) {
      callback.call(null, value);
      self.off(name, wrap);
    }

    const eventList = this._getCallbackList(name);
    eventList.push(wrap);
    this.eventList.set(name, eventList);
  };

  const moduleCache = new Map();
  const moduleIsLoading = new Map();
  const eventHub = new EventHub();

  function load(id) {
    moduleIsLoading.set(id, true);
    const script = document.createElement("script");
    script.src = id;
    script.onload = () => moduleIsLoading.set(id, false);
    document.body.appendChild(script);
  }

  function require(id) {
    return moduleCache.get(id).exports;
  }

  return function define(factory) {
    if (typeof factory !== "function") {
      throw new TypeError("Requires a function as a parameter!");
    }
    const currentScript = document.currentScript;
    const module = Object.create(null);
    module.meta = {
      id: currentScript.src || "main",
    };
    const exports = (module.exports = {});
    const factoryString = factory.toString();
    const deps = factoryString.match(/require\(.*\)/g);
    const eventName = module.meta.id;

    function onModuleIsLoaded() {
      factory.call(null, require, exports, module);
      moduleCache.set(eventName, module);
      eventHub.emit(eventName);
    }

    if (Array.isArray(deps) && deps.length > 0) {
      let doneNums = 0;

      function loadDepsCallback() {
        if (++doneNums === deps.length) onModuleIsLoaded();
      }

      for (let dep of deps) {
        const depId = dep.match(/(?<=").+?(?=")/g)[0];
        eventHub.once(depId, loadDepsCallback);
        if (!moduleIsLoading.has(depId) || !moduleIsLoading.get(depId)) {
          load(depId);
        }
      }
    } else {
      onModuleIsLoaded();
    }
  };
})();
