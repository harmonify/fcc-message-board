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

const Reply = model(models.Reply, replySchema);

module.exports = {
  replySchema,
  Reply,
};
