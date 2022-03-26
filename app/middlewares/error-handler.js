"use strict";

module.exports = function (err, req, res, next) {
  if (process.env.NODE_ENV !== "production") {
    err.statusCode === 500
      ? console.error(err)
      : console.error(`Bad request: ${err.name}("${err.message}")`);
  }
  if (err.statusCode && err.statusCode !== 500) {
    // freeCodeCamp's tests expect 200 status code
    res.send(err.message);
    
    // res.status(err.statusCode).send(err.message);
    return;
  }
  res.status(500).send("Internal server error");
};
