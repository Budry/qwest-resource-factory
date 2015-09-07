/**
 * This file is part of the Qwest resource factory package.
 * (c) Ondřej Záruba <zarubaondra@gmail.com>
 *
 * For the full copyright and license information, please view
 * the license.md file that was distributed with this source code.
**/

import Promise from 'bluebird'
import qwest from 'qwest'
import objectAssign from 'object-assign'

class ResourceFactory {

  constructor() {
    this.before = []
    this.after = []
  }

  /**
   * Add a new before request event
   * @param {Function} callback Before callback
   */
  addBeforeEvent(callback) {
    this.before.push(callback)
  }

  /**
   * Remove specific before event
   * @param  {Function} callback Before callback
   */
  removeBeforeEvent(callback) {
    let index = this.before.indexOf(callback)
    if (index !== -1) {
      this.before.splice(index, 1)
    }
  }

  /**
   * Adda new after request event
   * @param {Function} callback After callback
   */
  addAfterEvent(callback) {
    this.after.push(callback)
  }

  /**
   * Remove specific after event
   * @param  {Function} callback After callback
   */
  removeAfterEvent(callback) {
    let index = this.after.indexOf(callback)
    if (index !== -1) {
      this.after.splice(index, 1)
    }
  }

  /**
   * Create object of api methods
   * @param  {string} url Target URL
   * @param  {object} api Api configuration
   * @return {object}     Object of api methods
   */
  create(url, api) {
    let methods = {}

    let before = null
    if (api.hasOwnProperty('before')) {
      before = api.before
      delete api.before
    }

    let after = null
    if (api.hasOwnProperty('after')) {
      after = api.after
      delete api.after
    }

    for(let method in api) {
      let options = api[method]
      if (before !== null) {
        options.before = before
      }
      if (after !== null) {
        options.after = after
      }
      methods[method] = this._createQwest(url, options)
    }

    return methods
  }

  /**
   * Private method for parse parameters into URL
   * @param  {string} url    Target URL
   * @param  {object} params List of params
   * @return {string}        Output URL
   */
  _parseUrl(url, params = null) {
    if (params == null) {
      params = {}
    }
    let urlMatches = url.match(/^http(s)?:\/\/[^\/]+(.*)$/);
    if (urlMatches.length < 3) {
      throw "Invalid URL";
    }
    let uri, defaultUri
    uri = defaultUri = urlMatches[2];
    let matches = uri.match(/:([^:]+):/g) || [];
    for (let i = 0, len = matches.length; i < len; i++) {
      let match = matches[i];
      let paramName = match.substr(1, match.length - 2);
      if (params[paramName] != null) {
        let value = params[paramName];
        uri = uri.replace(match, value);
        delete params[paramName];
      } else {
        uri = uri.replace(match, "");
      }
    }
    uri = uri.replace(/\/{2,}/g, "/");
    url = url.replace(defaultUri, uri);

    return url;
  }

  /**
   * Private method for create instance of qwest
   * @param  {string} url     Target URL
   * @param  {object} options List of params
   * @return {object}         qwest instance
   */
  _createQwest(url, options) {

    const qwestConfiguration = {
      dataType: 'json'
    }

    const before = (xhr) => {
      this.before.forEach((callback) => {
        callback(xhr)
      })
      if (options.hasOwnProperty('before') && typeof(options.before) === 'function') {
        options.before(xhr)
      }
    }

    const after = (xhr, response) => {
      this.after.forEach((callback) => {
        callback(xhr, response)
      })
      if (options.hasOwnProperty('after') && typeof(options.after) === 'function') {
        options.after(xhr)
      }
    }

    const callback = (params = {}) => {
      return new Promise((resolve, reject) => {
        const params = objectAssign({}, options.params, params)
        const qwestInstance = qwest.map(options.method, this._parseUrl(url, params), params, qwestConfiguration, before)
        .then((xhr, response) => {
          after(xhr, response)
          resolve(response, xhr)
        }).catch((xhr, response, e) => {
          reject(err, response, xhr)
        })
      })
    }

    return callback
  }

}

export default new ResourceFactory()