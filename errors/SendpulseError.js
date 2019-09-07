const isObject = require('lodash/isObject');

class SendpulseError extends Error {
  constructor(message) {
    if (isObject(message)) {
      message = `${message.error || message.error_code}: ${message.message}`
    }

    super(message);
  }
}

module.exports = SendpulseError;
