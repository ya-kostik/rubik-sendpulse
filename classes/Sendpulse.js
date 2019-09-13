const querystring = require('querystring');
const { Kubik } = require('rubik-main');
const fetch = require('node-fetch');
const mustache = require('mustache');
const isObject = require('lodash/isObject');
const { serialize } = require('serialize-like-php');


const methods = require('./Sendpulse/methods');
const SendpulseError = require('../errors/SendpulseError');

const DEFAULT_HOST = 'https://api.sendpulse.com/';

const SECOND = 1000;

/**
 * The Sendpulse kubik for the Rubik
 * @class
 * @prop {String} id account id
 * @prop {String} secret acount secret
 * @prop {String} host the senpulse's API host
 * @prop {String} token Bearer token
 * @prop {Date}   tokenExpiresAt Date object of token expiration
 */
class Sendpulse extends Kubik {
  constructor(id, secret, host) {
    super(...arguments);
    this.id = id || null;
    this.secret = secret || null;
    this.host = host || null;

    this.token = null;
    this.tokenExpiresAt = null;

    this.generateMethods();
  }

  /**
   * Generate API methods
   */
  generateMethods() {
    Object.entries(methods).forEach(([namespace, methods]) => {
      const space = {};
      methods.forEach(([method, path, name, toSerialize]) => {
        space[name] = (params) => {
          return this.request(method, path, params, toSerialize);
        }
      });
      Object.freeze(space);
      this[namespace] = space;
    });
  }

  /**
   * Request OAuth2 token
   * @return {Promise}
   */
  async requestToken() {
    if (this.token && this.tokenExpiresAt) {
      if (Date.now() < this.tokenExpiresAt) return this.token;
    }

    if (!this.id) throw new TypeError('id is not defined');
    if (!this.secret) throw new TypeError('secret is not defined');

    const url = this.getUrl('oauth/access_token');

    const body = JSON.stringify({
      grant_type: 'client_credentials',
      client_id: this.id,
      client_secret: this.secret
    });

    const request = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });

    const response = await request.json();

    if (response.error || response.error_code) {
      throw new SendpulseError(response);
    }

    if (!response.access_token) {
      throw new SendpulseError('Invalid auth response');
    }

    // Дата истечения токена приходит в секундах, переводим в милисекунды,
    // и вычитаем одну секунду, чтобы гарантированно запрашивать новый до истечения
    this.tokenExpiresAt = Date.now() + response.expires_in * SECOND - SECOND;
    this.token = response.access_token;
    this.tokenType = response.token_type;

    return this.token;
  }

  /**
   * Get request url
   * @param  {String} path   API path
   * @param  {Object} params to call
   * @param  {String} method HTTP method
   * @return {String}
   */
  getUrl(path, params, method) {
    if (!isObject(params)) params = {};
    const qs = method === 'GET' ? querystring.stringify(params) : '';
    return `${this.host}${mustache.render(path, params)}${qs ? `?${qs}` : ''}`;
  }

  /**
   * Get request headers
   * @return {Promise<Object>}
   */
  async getHeaders() {
    await this.requestToken();

    return {
      'Content-Type': 'application/json',
      'Authorization': `${this.tokenType} ${this.token}`
    }
  }

  /**
   * Get request body
   * @param  {Object|String} params
   * @param  {String} method
   * @return {String|undefined} undefined if request method is GET
   */
  getBody(params, method) {
    if (method === 'GET') return;
    return isObject(params) ? JSON.stringify(params) : params;
  }

  /**
   * Serialize params fields
   * @param  {Object} params
   * @param  {Array}  toSerialize fields to serialize
   * @return {Mixed}
   */
  serialize(params, toSerialize) {
    if (!params) return params;
    if (!toSerialize) return params;
    if (!(Array.isArray(toSerialize) && toSerialize.length)) return params;
    params = Object.assign({}, params);
    for (const name of toSerialize) {
      if (!params[name]) continue;
      params[name] = serialize(params[name]);
    }

    return params;
  }

  /**
   * Prepare request entities
   * @param  {String}  method  HTTP method
   * @param  {String}  path    API path
   * @param  {Object} [params] request params
   * @param  {Array}  [toSerialize] fields from params to PHP serialize
   * @return {Promise<Object>} { url, body, headers }
   */
  async prepareToRequest(method, path, params, toSerialize) {
    params = this.serialize(params, toSerialize);
    const url = this.getUrl(path, params, method);
    const body = this.getBody(params, method);
    const headers = await this.getHeaders();
    return { url, body, headers };
  }

  /**
   * Request to API
   * @param  {String}  method  HTTP method
   * @param  {String}  path    API path
   * @param  {Object} [params] request params
   * @param  {Array}  [toSerialize=[]] fields from params to PHP serialize
   * @return {Promise}
   */
  async request(method, path, params, toSerialize) {
    const { url, headers, body } = await this.prepareToRequest(method, path, params, toSerialize);

    const request = await fetch(url, { method, body, headers });

    const response = await request.json();

    if (response.error || response.error_code) {
      throw new SendpulseError(response);
    }

    return response;
  }

  async up({ config }) {
    this.config = config;

    const options = config.get(this.name);

    this.id = this.id || options.id;
    this.secret = this.secret || options.secret;
    this.host = this.host || options.host || DEFAULT_HOST;
  }
}


Sendpulse.prototype.name = 'sendpulse';
Sendpulse.prototype.dependencies = Object.freeze(['config']);
module.exports = Sendpulse;
