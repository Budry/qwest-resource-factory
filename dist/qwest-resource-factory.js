
/*
 * This file is part of the KappaJs resource factory package.
 * (c) Ondřej Záruba <zarubaondra@gmail.com>
 *
 * For the full copyright and license information, please view
 * the license.md file that was distributed with this source code.
 */

(function() {
  var ResourceFactory, merge, qwest;

  qwest = require("qwest");

  merge = require("merge");

  ResourceFactory = (function() {
    function ResourceFactory() {}

    ResourceFactory.prototype.onError = function(onError) {
      this.onError = onError;
    };

    ResourceFactory.prototype.onSuccess = function(onSuccess) {
      this.onSuccess = onSuccess;
    };

    ResourceFactory.prototype.create = function(url, api) {
      var Resource, _url, action, allowedMethods, before, defaultParams, method, options;
      allowedMethods = ["post", "get", "put", "delete"];
      Resource = function() {};
      for (action in api) {
        options = api[action];
        _url = url;
        if (options.method == null) {
          throw "Missing method for '" + action + "'";
        }
        method = options.method.toLowerCase();
        if (allowedMethods.indexOf(method) === -1) {
          throw "Invalid method";
        }
        before = null;
        if (api.before != null) {
          before = api.before;
        }
        defaultParams = options.params;
        Resource.prototype[action] = (function(_this) {
          return function(params, success, error) {
            var defaultUri, i, len, match, matches, paramName, request, self, uri, value;
            if (params == null) {
              params = null;
            }
            if (success == null) {
              success = null;
            }
            if (error == null) {
              error = null;
            }
            params = merge(defaultParams, params);
            uri = defaultUri = _url.match(/^http(s)?:\/\/[^\/]+(.*)$/)[2];
            matches = uri.match(/:([^:]+):/g) || [];
            for (i = 0, len = matches.length; i < len; i++) {
              match = matches[i];
              paramName = match.substr(1, match.length - 2);
              if (params[paramName] != null) {
                value = params[paramName];
                uri = uri.replace(match, value);
                delete params[paramName];
              } else {
                uri = uri.replace(match, "");
              }
            }
            uri = uri.replace(/\/{2,}/g, "/");
            _url = _url.replace(defaultUri, uri);
            options = {
              dataType: "json"
            };
            request = qwest[method](_url, params, options);
            if (before != null) {
              qwest.before(before());
            }
            self = _this;
            return request.then(function(response) {
              if (self.onSuccess != null) {
                self.onSuccess(response);
              }
              if (success != null) {
                return success(response);
              }
            })['catch'](function(e, response) {
              if (self.onError != null) {
                self.onError(e, response);
              }
              if (error != null) {
                return error(e, response);
              }
            });
          };
        })(this);
      }
      return new Resource();
    };

    return ResourceFactory;

  })();

  module.exports = new ResourceFactory();

}).call(this);
