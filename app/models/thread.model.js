"use strict";

const { model, Schema, SchemaTypes } = require("mongoose");
const { models, timestamps } = require("../config").mongooseConfig;

const threadSchema = new Schema(
  {
    board_id: {
      type: SchemaTypes.ObjectId,
      ref: models.Board,
      required: [true, "Board id is required"],
    },
    text: {
      type: SchemaTypes.String,
      required: [true, "Thread text is required"],
    },
    replies: [
      {
        type: SchemaTypes.ObjectId,
        ref: models.Reply,
      },
    ],
  },
  { timestamps }
);

threadSchema.virtual("replycount").get(function () {
  return this.replies.length;
});

const Thread = model(models.Thread, threadSchema);

module.exports = {
  threadSchema,
  Thread,
};
