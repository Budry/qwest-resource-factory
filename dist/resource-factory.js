
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
    Resource = function() {};
    for (action in api) {
      options = api[action];
      method = options.method.toLowerCase();
      if (allowedMethods.indexOf(method) === -1) {
        throw "Invalid method";
      }
      defaultParams = options.params;
      Resource.prototype[action] = function(params) {
        var i, len, match, matches, paramName, value;
        if (params == null) {
          params = null;
        }
        params = merge(defaultParams, params);
        matches = url.match(/:([^:]+):/g);
        for (i = 0, len = matches.length; i < len; i++) {
          match = matches[i];
          paramName = match.substr(1, match.length - 2);
          if (params[paramName] != null) {
            value = params[paramName];
            console.log(value);
            url = url.replace(match, value);
            delete params[paramName];
          }
        }
        return qwest[method](url, params, {
          dataType: "json"
        });
      };
    }
    return new Resource();
  };

  module.exports = ResourceFactory;

}).call(this);
