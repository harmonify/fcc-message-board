"use strict";

module.exports = function (req, res, next) {
  console.log(`\n${req.method} ${req.path} - ${req.ip}\n`);
  next();
};
