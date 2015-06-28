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

    for action, options of api

      ## Check request method
      if not options.method?
        throw "Missing method for '#{action}'"
      method = options.method.toLowerCase()
      if allowedMethods.indexOf(method) is -1
        throw "Invalid method"

      ## Set before event
      before = null
      if api.before?
        before = api.before

      defaultParams = options.params

      Resource.prototype[action] = (params = null, success = null, error = null) =>

        params = merge defaultParams, params
        uri = defaultUri = url.match(/^http(s)?:\/\/[^\/]+(.*)$/)[2]
        matches = uri.match(/:([^:]+):/g) || []

        for match in matches
          paramName = match.substr(1, match.length - 2)
          if params[paramName]?
            value = params[paramName]
            uri = uri.replace match, value
            delete params[paramName]
          else
            uri = uri.replace match, ""

        uri = uri.replace /\/{2,}/g, "/"
        url = url.replace defaultUri, uri

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