(function(win) {

  var Emitter = function() {
    this.listeners = {};
  };
  Emitter.prototype.on = function(type, callback) {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  };
  Emitter.prototype.off = function(type, callback) {
    var index = this.listeners[type].indexOf(callback);
    if (index !== -1) {
      this.listeners[type].splice(index, 1);
    }
  };
  Emitter.prototype.notify = function(type, arg) {
    if (type in this.listeners) {
      this.listeners[type].forEach(function(callback) {
        callback(type, arg);
      });
    }
  };

  

  // Private static variables
  var apiProtocol = "https";
  var apiDomain = "dropboxapi.com";
  var apiVersion = "2";
  var apiSubdomain = "api";

  // Constructor
  var Dropbox = win.Dropbox = function(appKey, accessToken) {
    this.appKey = appKey;
    this.accessToken = accessToken;
    this.emitter = new Emitter();
  };
  
  // Private static methods 
  function get_url(subdomain, endpoint, parameters, domain, version) {
    var url = apiProtocol
      + "://"
      + (subdomain || apiSubdomain)
      + "."
      + (domain || apiDomain)
      + "/"
      + (version || apiVersion);
    if (endpoint) {
      url += endpoint;
    }
    if (parameters) {
      var pars = Object.keys(parameters).map(function(par) {
        return par + "=" + encodeURIComponent(parameters[par])
      });
      url += "?" + pars.join("&");
    }
    return url;
  }

  var request = function(dropbox, url, options) {
    options = options || {};
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        try {
          var response = xhr.response;
          if (xhr.status == 200) {
            //var h = xhr.getResponseHeader("dropbox-api-result");
            //console.log("Header: " + h);
            resolve(response);
          } else {
            reject({
              response : response,
              status : xhr.status
            });
          }
        } catch (ex) {
          reject(ex);
        } finally {
          xhr = null;
        }
      };
      xhr.onerror = function(error) {
        reject(error);
      };
      xhr.open(options.method || "GET", url);
      xhr.responseType = (typeof options.responseType !== "undefined")
        ? options.responseType : "json";
      if (dropbox.accessToken) {
        xhr.setRequestHeader("Authorization",
          "Bearer " + dropbox.accessToken);
      }
      if (options.headers) {
        Object.keys(options.headers).forEach(function(h) {
          xhr.setRequestHeader(h, options.headers[h]);
        });
      }
      xhr.send(options.body || null);
    });
  };

  // Public instance methods
  Dropbox.prototype.authorize = function() {
    win.location.assign(get_url("www", "/oauth2/authorize", {
      "client_id" : this.appKey,
      "response_type" : "token",
      "redirect_uri" : win.location.href,
      "state" : "123"
    }, "dropbox.com", 1));
  };

  Dropbox.prototype.handleAuthorizationRedirect = function() {
    if (win.location.hash) {
      var parts = win.location.hash.substr(1).split("&");
      var o = {};
      parts.forEach(function(part) {
        var pair = part.split("=");
        o[pair[0]] = pair[1];
      });
      if (o.access_token && o.state == "123") {
        this.emitter.notify("accesstoken", {
          access_token : o.access_token
        });
        win.location.assign(win.location.origin + win.location.pathname);
        return true;
      } else {
        return o.error;
      }
    }
    return false;
  };

  Dropbox.prototype.getCurrentAccount = function() {
    return request(this, get_url("api", "/users/get_current_account"), {
      method : "POST"
    });
  };
  
  Dropbox.prototype.getAccount = function(accountId) {
    return request(this, get_url("api", "/users/get_account"), {
      method : "POST",
      body : JSON.stringify({account_id : accountId}),
      headers : {
        "Content-Type" : "application/json"
      }
    });
  };
  
  Dropbox.prototype.upload = function(path, content) {
    return request(this, get_url("content", "/files/upload"), {
      method : "POST",
      body : encodeURIComponent(content),
      headers : {
        "Content-Type" : "application/octet-stream",
        "Dropbox-API-Arg" : JSON.stringify({
          "path" : path,
          mode : "overwrite"
        })
      }
    });
  };
  
  Dropbox.prototype.listFolder = function(path) {
    return request(this, get_url("api", "/files/list_folder"), {
      method : "POST",
      body : JSON.stringify({"path" : path}),
      headers : {
        "Content-Type" : "application/json"
      }
    });
  };
  
  Dropbox.prototype.listFolderContinue = function(cursor) {
    return request(this, get_url("api", "/files/list_folder/continue"), {
      method : "POST",
      body : JSON.stringify({"cursor" : cursor}),
      headers : {
        "Content-Type" : "application/json"
      }
    });
  };
  
  Dropbox.prototype.download = function(path) {
    return request(this, get_url("content", "/files/download"), {
      method : "POST",
      responseType : "text",
      headers : {
        "Dropbox-API-Arg" : JSON.stringify({
          "path" : path
        })
      }
    });
  };
  
  Dropbox.prototype.delete = function(path) {
    return request(this, get_url("api", "/files/delete"), {
      method : "POST",
      body : JSON.stringify({"path" : path}),
      headers : {
        "Content-Type" : "application/json"
      }
    });
  };

}(window));
