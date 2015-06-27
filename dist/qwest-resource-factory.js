
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

  ResourceFactory = function(url, api) {
    var Resource, action, allowedMethods, defaultParams, method, options;
    allowedMethods = ["post", "get", "put", "delete"];
    options = {
      dataType: "json"
    };
    Resource = function() {};
    for (action in api) {
      options = api[action];
      method = options.method.toLowerCase();
      if (allowedMethods.indexOf(method) === -1) {
        throw "Invalid method";
      }
      defaultParams = options.params;
      Resource.prototype[action] = function(params, success, error) {
        var i, len, match, matches, paramName, value;
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
        matches = url.match(/:([^:]+):/g) || [];
        for (i = 0, len = matches.length; i < len; i++) {
          match = matches[i];
          paramName = match.substr(1, match.length - 2);
          if (params[paramName] != null) {
            value = params[paramName];
            url = url.replace(match, value);
            delete params[paramName];
          } else {
            url.replace(match(null));
          }
        }
        return qwest[method](url, params, options).then(function(response) {
          if (success != null) {
            return success(response);
          }
        })['catch'](function(e, response) {
          if (error != null) {
            return error(e, response);
          }
        });
      };
    }
    return new Resource();
  };

  module.exports = ResourceFactory;

}).call(this);
