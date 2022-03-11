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
    replycount: {
      type: SchemaTypes.Number,
      default: 0,
    },
  },
  { timestamps }
);

// automatically update replycount when a reply is added
threadSchema.pre("save", function (next) {
  this.replycount = this.replies.length;
  next();
});

const Thread = model(models.Thread, threadSchema);

module.exports = {
  threadSchema,
  Thread,
};
