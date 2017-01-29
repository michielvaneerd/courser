(function(win) {

  // https://www.dropbox.com/developers/documentation/http/documentation

  /**
   * Some remarks:
   * 
   * Normally calls have JSON in request body and JSON in response body.
   *
   * Content download calls have JSON in Dropbox-API-Arg request header and
   * the content in the response body and the JSON result in the
   * dropbox-api-result response header.
   *
   * Content upload calls have JSON in Dropbox-API-Arg request header and
   * the content in the request body and the JSON result in the response body.
   *
   * Paths always starts with "/", only the root itself can be questionned
   * with "" (empty string).
   */

  // Private static variables
  var apiProtocol = "https";
  var apiDomain = "dropboxapi.com";
  var apiVersion = "2";
  var apiSubdomain = "api";

  // Constructor
  var Dropbox = win.Dropbox = function(appKey, onAccessToken, options) {
    options = options || {};
    if (!appKey || !onAccessToken) {
      throw new Error("Pass appKey and onAccessToken callback");
    }
    this.appKey = appKey;
    this.accessToken = options.accessToken;
    this.onAccessToken = onAccessToken;
  };
  
  // Private static methods
  Dropbox.prototype.get_url = function(endpoint, options) {
    options = options || {};
    options.parameters = options.parameters || {};
    //subdomain, endpoint, parameters, domain, version
    var url = apiProtocol
      + "://"
      + (options.subdomain || apiSubdomain)
      + "."
      + (options.domain || apiDomain)
      + "/"
      + (options.version || apiVersion);
    if (endpoint) {
      url += endpoint;
    }

    if (!options.noAccessToken) {
      options.parameters.reject_cors_preflight = "true";
      if (this.accessToken) {
        options.parameters.authorization = "Bearer " + this.accessToken;
      }
    }

    var pars = Object.keys(options.parameters).map(function(par) {
      return par + "=" + encodeURIComponent(options.parameters[par])
    });
    
    url += "?" + pars.join("&");
    
    return url;
  }

  /**
   * @return: {Promise}
   * The Promise can resolves with multiple argument types:
   * - just the response of the request
   * - object with {content : object|string, apiResult : object}
   * The Promise can reject with:
   * - object with {error : string, tag : string, status : number} in case of
   *   Dropbox API error
   * - object|string in case of connection error
   */
  Dropbox.prototype.request = function(url, options) {
    options = options || {};
    var headers = options.headers || {};
    var me = this;
    return new Promise(function(resolve, reject) {
      var xhr = me.xhr = new XMLHttpRequest();
      xhr.onload = function() {
        try {
          if (xhr.status == 200) {
            var response = xhr.responseText;
            if (options.responseType != "text") {
              response = JSON.parse(xhr.responseText);
            }
            var apiResult = xhr.getResponseHeader("dropbox-api-result");
            if (apiResult) {
              resolve({
                content : decodeURIComponent(response),
                apiResult : JSON.parse(apiResult)
              });
            } else {
              resolve(response);
            }
          } else {
            var errorText = xhr.responseText;
            var errorTag = "";
            try {
              errorText = JSON.parse(errorText);
              if ("error" in errorText && ".tag" in errorText.error) {
                errorTag = errorText.error[".tag"];
              }
              errorText = errorText.error_summary || errorText.error && errorText.error[".tag"] || errorText;
            } catch (ex) {
              console.log(ex);
            }
            reject({
              error : errorText,
              tag : errorTag,
              status : xhr.status
            });
          }
        } catch (ex) {
          reject(ex);
        } finally {
          xhr = null;
          delete me.xhr;
        }
      };
      xhr.onerror = function(error) {
        reject(error);
      };
      xhr.onabort = function(error) {
        reject(error.type);
      };
      xhr.ontimeout = function(error) {
        reject(error.type);
      };
      xhr.open(options.method || "POST", url);
      xhr.timeout = 10000; // 10 seconds
      Object.keys(headers).forEach(function(h) {
        xhr.setRequestHeader(h, headers[h]);
      });
      var body = null;
      if (!("Content-Type" in headers) && !options.suppressContentType) {
        xhr.setRequestHeader("Content-Type", "text/plain; charset=dropbox-cors-hack");
        if (options.body) {
          // Need to explicitly encode to utf-8 binary blob,
          // otherwise the browser overwrites the content type...
          // http://stackoverflow.com/questions/33902289/using-dropbox-v2-api-from-browser
          // Polyfill: https://github.com/inexorabletash/text-encoding (for IE, Safari)
          body = new TextEncoder("utf-8").encode(options.body);
        } else {
          body = new TextEncoder("utf-8").encode(null);
        }
      } else {
        if (options.body) {
          body = options.body;
        }
      }
      
      xhr.send(body);
    });
  };

  // https://www.dropbox.com/developers/documentation/http/documentation#authorization
  // Right now we only support implicit flow (used by client side)
  Dropbox.prototype.authorize = function() {
    win.location.assign(this.get_url("/oauth2/authorize", {
      subdomain : "www",
      parameters : {
        "client_id" : this.appKey,
        "response_type" : "token", // "token" indicates implicit flow
        // No hashes are allowed, so we cannot use win.location.href
        "redirect_uri" : win.location.origin + win.location.pathname,
        "state" : "123"
      },
      noAccessToken : true,
      domain : "dropbox.com",
      version : 1
    }));
  };

  /**
   * @return: {bool} True when we received an access token from Dropbox and we
   * now redirect again to a clean URL. False when nothing happened, so we can
   * look if we have an access token and start communicating with the Dropbox API.
   */
  // https://www.dropbox.com/developers/documentation/http/documentation#authorization
  Dropbox.prototype.handleAuthorizationRedirect = function() {
    if (win.location.hash) {
      var parts = win.location.hash.substr(1).split("&");
      var o = {};
      parts.forEach(function(part) {
        var pair = part.split("=");
        o[pair[0]] = pair[1];
      });
      if (o.error) {
        throw new Error(o.error);
      }
      if (o.access_token && o.state == "123") {
        this.onAccessToken(o.access_token);
        win.location.assign(win.location.origin + win.location.pathname);
        return true;
      }
    }
    return false;
  };

  Dropbox.prototype.getCurrentAccount = function() {
    return this.request(this.get_url("/users/get_current_account"));
  };
  
  Dropbox.prototype.getAccount = function(accountId) {
    return this.request(this.get_url("/users/get_account"), {
      body : JSON.stringify({account_id : accountId})
    });
  };
  
  Dropbox.prototype.upload = function(path, content) {
    return this.request(this.get_url("/files/upload", {
      subdomain : "content",
      parameters : {
        arg :  JSON.stringify({
          path : path,
          mode : "overwrite"
        })
      }
    }), {
      body : content,
      headers : {
        
      }
    });
  };
  
  // https://www.dropbox.com/developers/documentation/http/documentation#files-list_folder
  Dropbox.prototype.listFolder = function(path) {
    return this.request(this.get_url("/files/list_folder"), {
      body : JSON.stringify({"path" : path})
    });
  };
  
  // https://www.dropbox.com/developers/documentation/http/documentation#files-list_folder-continue
  Dropbox.prototype.listFolderContinue = function(cursor) {
    return this.request(this.get_url("/files/list_folder/continue"), {
      body : JSON.stringify({"cursor" : cursor})
    });
  };
  
  Dropbox.prototype.download = function(path) {
    return this.request(this.get_url("/files/download", {
      subdomain : "content",
      parameters : {
        arg : JSON.stringify({
          "path" : path
        })
      }
    }), {
      responseType : "text",
      suppressContentType: true
    });
  };
  
  Dropbox.prototype.delete = function(path) {
    return this.request(this.get_url("/files/delete"), {
      body : JSON.stringify({"path" : path})
    });
  };
  
  Dropbox.prototype.listSharedLinks = function(path) {
    return this.request(this.get_url("/sharing/list_shared_links"), {
      body : JSON.stringify({
        "path" : path,
        "direct_only" : true
      })
    });
  }
  
  Dropbox.prototype.createSharedLink = function(path) {
    return this.request(this.get_url("/sharing/create_shared_link_with_settings"), {
      body : JSON.stringify({"path" : path})
    });
  };
  
  Dropbox.prototype.getSharedLinkFile = function(url) {
    return this.request(this.get_url("/sharing/get_shared_link_file", {
      subdomain : "content",
      parameters : {
        arg : JSON.stringify({
          "url" : url
        })
      }
    }), {
      responseType : "text",
      suppressContentType: true
    });
  };

}(window));
