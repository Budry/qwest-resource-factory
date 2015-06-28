###
# This file is part of the KappaJs resource factory package.
# (c) Ondřej Záruba <zarubaondra@gmail.com>
#
# For the full copyright and license information, please view
# the license.md file that was distributed with this source code.
###

qwest = require "qwest"
merge = require "merge"

class ResourceFactory

  onError: (@onError) ->

  onSuccess: (@onSuccess) ->

  create: (url, api) ->

    allowedMethods = ["post", "get", "put", "delete"]
    Resource = () ->

    before = null
    if api.before?
      before = api.before
      delete api.before

    for action, options of api

      method = options.method.toLowerCase()
      if allowedMethods.indexOf(method) is -1
        throw "Invalid method"

      defaultParams = options.params

      Resource.prototype[action] = (params = null, success = null, error = null) =>

        params = merge defaultParams, params
        matches = url.match(/:([^:]+):/g) || []

        for match in matches
          paramName = match.substr(1, match.length - 2)
          if params[paramName]?
            value = params[paramName]
            url = url.replace match, value
            delete params[paramName]
          else
            url.replace match, null

        options =
          dataType: "json"

        request = qwest[method](url, params, options)

        if before?
          qwest.before before()

        self = @

        return request.then((response) ->
          self.onSuccess(response) if self.onSuccess?
          success(response) if success?
        )['catch']((e, response) ->
          self.onError(e, response) if self.onError?
          error(e, response) if error?
        )

    return new Resource()

module.exports = new ResourceFactory()