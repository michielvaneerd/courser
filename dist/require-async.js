(function(globalContext) {
  
  var cache = {};
  
  globalContext.requireAsync = function(url) {
    
    switch (Object.prototype.toString.call(url)) {
      case "[object Object]":
        var keys = Object.keys(url);
        return Promise.all(keys.map(function(key) {
          return globalContext.requireAsync(url[key]);
        })).then(function(exports) {
          var namedExports = {};
          exports.forEach(function(exp, index) {
            namedExports[keys[index]] = exp;
          });
          return Promise.resolve(namedExports);
        });
      case "[object Array]":
        return Promise.all(url.map(function(urlString) {
          return globalContext.requireAsync(urlString);
        }));
    }
    
    return new Promise(function(resolve, reject) {
      
      if (url in cache) {
        resolve(cache[url].exports);
        return;
      }
      
      var req = new XMLHttpRequest();
      req.onload = function() {
        if (this.status == 200) {
          var module = {exports : {}};
          var modulePromise = eval(this.responseText);
          modulePromise.then(function(module) {
            cache[url] = module;
            resolve(module.exports);
          });
        } else {
          reject(new Error(this.statusText));
        }
      };
      req.onerror = function(e) {
        reject(new Error("Unknown error"));
      };
      req.open("GET", url);
      req.send();
      
    });
    
  };

}(window));