"use strict";

const { model, Schema, SchemaTypes } = require("mongoose");
const { models, timestamps } = require("../config").mongooseConfig;

const replySchema = new Schema(
  {
    thread_id: {
      type: SchemaTypes.ObjectId,
      ref: models.Thread,
      required: [true, "Thread id is required"],
    },
    text: {
      type: SchemaTypes.String,
      required: [true, "Reply text is required"],
    },
    reported: {
      type: SchemaTypes.Boolean,
      default: false,
    },
  },
  { timestamps }
);

const Reply = model(models.Reply, replySchema);

module.exports = {
  replySchema,
  Reply,
};
