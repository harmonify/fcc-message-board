"use strict";

/**
 * Mongoose model names configuration.
 */
const models = {
  Board: "Board",
  Thread: "Thread",
  Reply: "Reply",
};

/**
 * Mongoose model timestamps configuration.
 */
const timestamps = {
  createdAt: "created_on",
  updatedAt: "bumped_on",
};

module.exports = {
  models,
  timestamps,
};
