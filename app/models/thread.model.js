"use strict";

const { model, Schema, SchemaTypes } = require("mongoose");
const bcrypt = require("bcrypt");

const { models, timestamps } = require("../../config").mongooseConfig;

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
  await model(models.Board).findByIdAndUpdate(
    this.board,
    { $push: { threads: this._id } },
    { new: true }
  );
  // await Board.findByIdAndUpdate(
  //   this.board,
  //   { $push: { threads: this._id } },
  //   { new: true }
  // );

  // hash delete password
  this.delete_password = await bcrypt.hash(this.delete_password, 10);

  next();
});

threadSchema.pre("remove", async function (next) {
  // remove thread id from board's threads array when a thread is removed
  await model(models.Board).findByIdAndUpdate(
    this.board,
    { $pull: { threads: this._id } },
    { new: true }
  );
  // await Board.findByIdAndUpdate(
  //   this.board,
  //   { $pull: { threads: this._id } },
  //   { new: true }
  // );

  // remove replies from thread's replies array when a thread is removed
  await model(models.Reply).deleteMany({ thread: this._id });
  // await Reply.deleteMany({ thread: this._id });

  next();
});

/**
 * Mock a thread document.
 *
 * @param {Object} thread - A thread object with the following properties:
 * - board: {SchemaTypes.ObjectId} - The _id field of the board document
 *  that the thread belongs to.
 * - text: {String} - The text of the thread.
 * - replies: {Array<SchemaTypes.ObjectId>} - The _id fields of the reply
 * - reported: {Boolean} - The reported status of the thread.
 * @return {Object} A thread object.
 */
threadSchema.statics.mock = function ({
  board,
  text,
  replies,
  reported,
  delete_password
} = {}) {
  return {
    board: board || "",
    text: text || "Thread Mock",
    replies: replies || [],
    reported: reported || Math.random() > 0.5,
    delete_password: delete_password || "password",
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
  if (!thread) {
    throw new Error("resource not found");
  }
  thread.reported = true;
  return await thread.save();
};

/**
 * Delete a thread with valid delete_password.
 *
 * @param {SchemaTypes.ObjectId} threadId - Thread document _id field.
 * @param {String} deletePassword - The delete password of the thread.
 * @return {Promise<Thread>} A promise that resolves to a Thread document.
 */
threadSchema.statics.deleteThread = async function (threadId, deletePassword) {
  const thread = await this.findById(threadId);
  if (!thread) {
    throw new Error("resource not found");
  }

  const isMatch = await bcrypt.compare(deletePassword, thread.delete_password);
  if (!isMatch) {
    throw new Error("incorrect password");
  }

  // delete the referenced replies
  await model(models.Reply).deleteMany({ thread: threadId });
  // await Reply.deleteMany({ thread: thread._id });

  return await thread.remove();
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
