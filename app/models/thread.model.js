"use strict";

const { model, Schema, SchemaTypes } = require("mongoose");
const bcrypt = require("bcrypt");

const { models, timestamps } = require("../../config").mongooseConfig;
const { Board } = require("./board.model");

const threadSchema = new Schema(
  {
    text: {
      type: SchemaTypes.String,
      required: [true, "Thread text is required"],
    },
    reported: {
      type: SchemaTypes.Boolean,
      default: false,
    },
    delete_password: {
      type: SchemaTypes.String,
      required: [true, "Thread delete password is required"],
    },
    // parent reference
    board: {
      type: SchemaTypes.ObjectId,
      ref: models.Board,
      required: [true, "Board id is required"],
    },
    // child references
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

threadSchema.pre("save", async function (next) {
  // add thread id to board's threads array when a thread is created
  await Board.findByIdAndUpdate(
    this.board_id,
    { $push: { threads: this._id } },
    { new: true }
  );

  // hash delete password
  this.delete_password = await bcrypt.hash(this.delete_password, 10);

  next();
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

/**
 * Populate the referenced fields of the thread document.
 *
 * @return {Promise<Thread>} A promise that resolves to a Thread document.
 */
threadSchema.methods.populateFields = async function () {
  return await this.populate(["board", "replies"]);
};

const Thread = model(models.Thread, threadSchema);

module.exports = {
  threadSchema,
  Thread,
};
