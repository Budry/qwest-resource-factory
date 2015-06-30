
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

    ResourceFactory.prototype.allowedMethods = ["post", "put", "get", "delete"];

    ResourceFactory.prototype.create = function(url, api) {
      var action, before, methods, options;
      methods = {};
      before = null;
      if (api.before != null) {
        before = api.before;
        delete api.before;
      }
      for (action in api) {
        options = api[action];
        if (before != null) {
          options.before = before;
        }
        methods[action] = this._createQwest(url, options);
      }
      return methods;
    };

    ResourceFactory.prototype._parseUrl = function(url, params) {
      var defaultUri, i, len, match, matches, paramName, uri, urlMatches, value;
      if (params == null) {
        params = {};
      }
      urlMatches = url.match(/^http(s)?:\/\/[^\/]+(.*)$/);
      if (urlMatches.length < 3) {
        throw "Invalid URL";
      }
      uri = defaultUri = urlMatches[2];
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
      url = url.replace(defaultUri, uri);
      return url;
    };

    ResourceFactory.prototype._createQwest = function(url, options) {
      var callback, qwestConfiguration;
      if (options.method == null) {
        throw "Missing method options";
      }
      options.method = options.method.toLowerCase();
      if (this.allowedMethods.indexOf(options.method) === -1) {
        throw "Invalid method '" + method + "'";
      }
      qwestConfiguration = {
        dataType: "json"
      };
      return callback = (function(_this) {
        return function(params, success, error) {
          var qwestInstance;
          if (params == null) {
            params = {};
          }
          if (success == null) {
            success = null;
          }
          if (error == null) {
            error = null;
          }
          params = merge(options.params, params);
          qwestInstance = qwest[options.method](_this._parseUrl(url, params), params, qwestConfiguration);
          if (options.before != null) {
            qwestInstance.before(options.before());
          }
          return qwestInstance.then(function(response) {
            if (success != null) {
              return success(response);
            }
          })['catch'](function(e, response) {
            if (error != null) {
              return error(e, response);
            }
          });
        };
      })(this);
    };

    return ResourceFactory;

  })();

  module.exports = new ResourceFactory();

}).call(this);
