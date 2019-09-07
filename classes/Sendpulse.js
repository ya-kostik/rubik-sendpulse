const querystring = require('querystring');
const { Kubik } = require('rubik-main');
const fetch = require('node-fetch');
const mustache = require('mustache');
const isObject = require('lodash/isObject');


const methods = require('./Sendpulse/methods');
const SendpulseError = require('../errors/SendpulseError');

const DEFAULT_HOST = 'https://api.sendpulse.com/';

const SECOND = 1000;

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

  generateMethods() {
    Object.entries(methods).forEach(([namespace, methods]) => {
      const space = {};
      methods.forEach(([method, path, name]) => {
        space[name] = (params) => {
          return this.request(method, path, params);
        }
      });
      Object.freeze(space);
      this[namespace] = space;
    });
  }

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

  getUrl(path, params, method) {
    if (!isObject(params)) params = {};
    const qs = method === 'GET' ? querystring.stringify(params) : '';
    return `${this.host}${mustache.render(path, params)}${qs ? `?${qs}` : ''}`;
  }

  async getHeaders() {
    await this.requestToken();

    return {
      'Content-Type': 'application/json',
      'Authorization': `${this.tokenType} ${this.token}`
    }
  }

  getBody(params, method) {
    if (method === 'GET') return;
    return isObject(params) ? JSON.stringify(params) : params;
  }

  async request(method, path, params) {
    const headers = await this.getHeaders();

    const request = await fetch(this.getUrl(path, params, method), {
      method,
      body: this.getBody(params, method),
      headers
    });

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
