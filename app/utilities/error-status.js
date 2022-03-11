"use strict";

class ErrorStatus extends Error {
  constructor(message = "", statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

module.exports = ErrorStatus;
