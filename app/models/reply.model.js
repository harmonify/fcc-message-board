"use strict";

const { model, Schema, SchemaTypes } = require("mongoose");
const bcrypt = require("bcrypt");

const { models, timestamps } = require("../../config").mongooseConfig;

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
  await model(models.Thread).findByIdAndUpdate(
    this.thread,
    { $push: { replies: this._id } },
    { new: true }
  );

  // hash delete password
  this.delete_password = await bcrypt.hash(this.delete_password, 10);

  next();
});

replySchema.pre("remove", async function (doc) {
  // remove reply id from thread's replies array when a reply is removed
  await model(models.Thread).findByIdAndUpdate(
    doc.thread,
    { $pull: { replies: doc._id } },
    { new: true }
  );
});

/**
 * Mock a reply document.
 *
 * @param {Object} reply - A reply object with the following properties:
 * - thread: {SchemaTypes.ObjectId} - The _id field of the thread document
 *   that the reply belongs to.
 * - text: {String} - The text of the reply.
 * - reported: {Boolean} - The reported status of the reply.
 * @return {Object} A reply object.
 */
replySchema.statics.mock = function ({
  thread,
  text,
  reported,
  delete_password,
} = {}) {
  return {
    thread: thread || "5e9c9c9c9c9c9c9c9c9c9c9c",
    text: text || "Reply Mock",
    reported: reported || Math.random() > 0.5,
    delete_password: delete_password || "password",
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
  if (!reply) {
    throw new Error("resource not found");
  }
  reply.reported = true;
  return await reply.save();
};

/**
 * Delete a reply document with valid delete_password.
 *
 * @param {SchemaTypes.ObjectId} replyId - Reply document _id field.
 * @param {String} deletePassword - The delete password of the reply.
 * @return {Promise<Reply>} A promise that resolves to a Reply document.
 */
replySchema.statics.deleteReply = async function (replyId, deletePassword) {
  if (!replyId || !deletePassword) {
    throw new Error("all fields are required");
  }
  
  const reply = await Reply.findById(replyId);
  if (!reply) {
    throw new Error("resource not found");
  }

  const match = await bcrypt.compare(deletePassword, reply.delete_password);
  if (!match) {
    throw new Error("incorrect password");
  }

  // we perform "soft delete" by setting the reply's text to "[deleted]"
  reply.text = "[deleted]";
  return await reply.save();
};

/**
 * Populate the referenced fields of the reply document.
 *
 * @return {Promise<Reply>} A promise that resolves to a Reply document.
 */
replySchema.methods.populateFields = async function () {
  await this.populate("thread");
};

const Reply = model(models.Reply, replySchema);

module.exports = {
  replySchema,
  Reply,
};
