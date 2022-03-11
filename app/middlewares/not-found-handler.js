"use strict";

module.exports = function (req, res, next) {
  res.status(404).type("text").send("Not Found");
};
