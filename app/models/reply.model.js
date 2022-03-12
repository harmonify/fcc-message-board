"use strict";

const { model, Schema, SchemaTypes } = require("mongoose");
const bcrypt = require("bcrypt");

const { models, timestamps } = require("../../config").mongooseConfig;
const { Thread } = require("./thread.model");

const replySchema = new Schema(
  {
    text: {
      type: SchemaTypes.String,
      required: [true, "Reply text is required"],
    },
    reported: {
      type: SchemaTypes.Boolean,
      default: false,
    },
    delete_password: {
      type: SchemaTypes.String,
      required: [true, "Reply delete password is required"],
    },
    // parent reference
    thread: {
      type: SchemaTypes.ObjectId,
      ref: models.Thread,
      required: [true, "Thread id is required"],
    },
  },
  { timestamps }
);

replySchema.pre("save", async function (next) {
  // add reply id to thread's replies array when a reply is created
  await Thread.findByIdAndUpdate(
    this.thread_id,
    { $push: { replies: this._id } },
    { new: true }
  );

  // hash delete password
  this.delete_password = await bcrypt.hash(this.delete_password, 10);

  next();
});

/**
 * Mock a reply document.
 *
 * @param {Object} reply - A reply object with the following properties:
 * - thread_id: {SchemaTypes.ObjectId} - The _id field of the thread document
 *   that the reply belongs to.
 * - text: {String} - The text of the reply.
 * - reported: {Boolean} - The reported status of the reply.
 * @return {Object} A reply object.
 */
replySchema.statics.mock = function ({ thread_id, text, reported } = {}) {
  return {
    thread_id: thread_id || "5e9c9c9c9c9c9c9c9c9c9c9c",
    text: text || "Reply Mock",
    reported: reported || Math.random() > 0.5,
  };
};

/**
 * Set the reported status of the reply to true.
 *
 * @param {SchemaTypes.ObjectId} replyId - Reply document _id field.
 * @return {Promise<Reply>} A promise that resolves to a Reply document.
 */
replySchema.statics.reportReply = async function (replyId) {
  const reply = await this.findById(replyId);
  reply.reported = true;
  return await reply.save();
};

/**
 * Populate the referenced fields of the reply document.
 * 
 * @return {Promise<Reply>} A promise that resolves to a Reply document.
 */
replySchema.methods.populateFields = async function () {
  await this.populate("thread");
}

const Reply = model(models.Reply, replySchema);

module.exports = {
  replySchema,
  Reply,
};
