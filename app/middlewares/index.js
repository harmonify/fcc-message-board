"use strict";

const errorHandler = require("./error-handler");
const loggerDev = require("./logger-dev");
const notFoundHandler = require("./not-found-handler");

module.exports = {
  errorHandler,
  loggerDev,
  notFoundHandler,
};
