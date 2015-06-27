###
# This file is part of the KappaJs resource factory package.
# (c) Ondřej Záruba <zarubaondra@gmail.com>
#
# For the full copyright and license information, please view
# the license.md file that was distributed with this source code.
###

qwest = require "qwest"
merge = require "merge"

ResourceFactory = (url, api) ->

  allowedMethods = ["post", "get", "put", "delete"]

  Resource = () ->
  for action, options of api

    method = options.method.toLowerCase()
    if allowedMethods.indexOf(method) is -1
      throw "Invalid method"

    defaultParams = options.params

    Resource.prototype[action] = (params = null) ->

      params = merge defaultParams, params

      matches = url.match /:([^:]+):/g

      for match in matches
        paramName = match.substr(1, match.length - 2)
        if params[paramName]?
          value = params[paramName]
          console.log value
          url = url.replace match, value
          delete params[paramName]

      return qwest[method] url, params,
        dataType: "json"
  return new Resource()

module.exports = ResourceFactory