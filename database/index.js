"use strict";

const mongoose = require("mongoose");

module.exports = function (uri) {
  const connection = mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  connection.close = () => connection.then((client) => client.close());
  return connection;
};
