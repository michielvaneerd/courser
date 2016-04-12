(function(win) {

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
  var Dropbox = win.Dropbox = function(appKey, options) {
    options = options || {};
    if (!appKey || !options.onAccessToken) {
      throw new Error("Pass appKey and onAccessToken callback");
    }
    this.appKey = appKey;
    this.accessToken = options.accessToken;
    this.onAccessToken = options.onAccessToken;
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
    var headers = options.headers || {};
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
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
            reject({
              response : xhr.responseText,
              status : xhr.status
            });
          }
        } catch (ex) {
          console.log(ex);
          reject(ex);
        } finally {
          xhr = null;
        }
      };
      xhr.onerror = function(error) {
        console.log(error);
        reject(error);
      };
      xhr.open(options.method || "POST", url);
      // It is tempting to use responseType "json", but then errors won't
      // be visible, as they are plain text response body.
      //xhr.responseType = (typeof options.responseType !== "undefined")
      //  ? options.responseType : "json";
      if (dropbox.accessToken) {
        xhr.setRequestHeader("Authorization",
          "Bearer " + dropbox.accessToken);
      }
      Object.keys(headers).forEach(function(h) {
        xhr.setRequestHeader(h, headers[h]);
      });
      if (!("Content-Type" in headers)) {
        xhr.setRequestHeader("Content-Type", "application/json");
      }
      xhr.send(options.body || null);
    });
  };

  /**
   * Goes to the Dropbox authorization page. After authorization the user
   * will be redirected back with the access_token attached to the URL.
   * @return void
   */
  Dropbox.prototype.authorize = function() {
    win.location.assign(get_url("www", "/oauth2/authorize", {
      "client_id" : this.appKey,
      "response_type" : "token",
      // No hashes are allowed, so we cannot blindly use win.location.href
      "redirect_uri" : win.location.origin + win.location.pathname,
      "state" : "123"
    }, "dropbox.com", 1));
  };

  /**
   * Handles the redirect after authorization. Should always be called on
   * page load so the access_token can be saved for use.
   * @return {boolean|string} Set to a string in case of an error;
   * set to true in case the access_token was saved and redirection started;
   * set to false in case nothing happened;
   */
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

  /**
   * @returns {Promise} Resolves with JSON response
   */
  Dropbox.prototype.getCurrentAccount = function() {
    return request(this, get_url("api", "/users/get_current_account"), {
      headers : {
        // Prevent default application/json
        "Content-Type" : ""
      }
    });
  };
  
  /**
   * @returns {Promise} Resolves with JSON response
   */
  Dropbox.prototype.getAccount = function(accountId) {
    return request(this, get_url("api", "/users/get_account"), {
      body : JSON.stringify({account_id : accountId})
    });
  };
  
  /**
   * @returns {Promise} Resolves with JSON response
   */
  Dropbox.prototype.upload = function(path, content) {
    return request(this, get_url("content", "/files/upload"), {
      //body : encodeURIComponent(content),
      body : content,
      headers : {
        "Content-Type" : "application/octet-stream",
        "Dropbox-API-Arg" : JSON.stringify({
          path : path,
          mode : "overwrite"
        })
      }
    });
  };
  
  /**
   * @returns {Promise} Resolves with JSON response
   */
  Dropbox.prototype.listFolder = function(path) {
    return request(this, get_url("api", "/files/list_folder"), {
      body : JSON.stringify({"path" : path})
    });
  };
  
  Dropbox.prototype.listFolderContinue = function(cursor) {
    return request(this, get_url("api", "/files/list_folder/continue"), {
      body : JSON.stringify({"cursor" : cursor})
    });
  };
  
  Dropbox.prototype.download = function(path) {
    return request(this, get_url("content", "/files/download"), {
      responseType : "text",
      headers : {
        "Content-Type" : "",
        "Dropbox-API-Arg" : JSON.stringify({
          "path" : path
        })
      }
    });
  };
  
  Dropbox.prototype.delete = function(path) {
    return request(this, get_url("api", "/files/delete"), {
      body : JSON.stringify({"path" : path})
    });
  };
  
  Dropbox.prototype.createSharedLink = function(path) {
    return request(this, get_url("api", "/sharing/create_shared_link_with_settings"), {
      body : JSON.stringify({"path" : path})
    });
  };
  
  Dropbox.prototype.getSharedLinkFile = function(url) {
    return request(this, get_url("content", "/sharing/get_shared_link_file"), {
      responseType : "text",
      headers : {
        "Content-Type" : "",
        "Dropbox-API-Arg" : JSON.stringify({
          "url" : url
        })
      }
    });
  };

}(window));
