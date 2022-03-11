"use strict";

module.exports = function (err, req, res, next) {
  if (process.env.NODE_ENV !== "production") {
    err.statusCode === 500
      ? console.error(err)
      : console.error(`Bad request: ${err.name}("${err.message}")`);
  }
  if (err.statusCode && err.statusCode !== 500) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
};
