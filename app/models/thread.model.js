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
    reported: {
      type: SchemaTypes.Boolean,
      default: false,
    },
  },
  { timestamps }
);

threadSchema.virtual("replycount").get(function () {
  return this.replies.length;
});

/**
 * Mock a thread document.
 *
 * @param {Object} thread - A thread object with the following properties:
 * - board_id: {SchemaTypes.ObjectId} - The _id field of the board document
 *  that the thread belongs to.
 * - text: {String} - The text of the thread.
 * - replies: {Array<SchemaTypes.ObjectId>} - The _id fields of the reply
 * - reported: {Boolean} - The reported status of the thread.
 * @return {Object} A thread object.
 */
threadSchema.statics.mock = function ({
  board_id,
  text,
  replies,
  reported,
} = {}) {
  return {
    board_id: board_id || "5e9c9c9c9c9c9c9c9c9c9c9c",
    text: text || "Thread Mock",
    replies: replies || [],
    reported: reported || Math.random() > 0.5,
  };
};

/**
 * Find by id and populate the referenced fields of the thread document.
 *
 * @param {SchemaTypes.ObjectId} threadId - Thread document _id field.
 * @return {Promise<Thread>} A promise that resolves to a Thread document.
 */
threadSchema.statics.findByIdAndPopulate = async function (threadId) {
  return await this.findById(threadId).populate({
    path: "replies",
  });
};

/**
 * Set the reported status of the thread to true.
 *
 * @param {SchemaTypes.ObjectId} threadId - Thread document _id field.
 * @return {Promise<Thread>} A promise that resolves to a Thread document.
 */
threadSchema.statics.reportThread = async function (threadId) {
  const thread = await this.findById(threadId);
  thread.reported = true;
  return await thread.save();
};

const Thread = model(models.Thread, threadSchema);

module.exports = {
  threadSchema,
  Thread,
};
