"use strict";

const { Reply } = require("../models");

class ReplyService {
  async createReply(reply) {
    return await Reply.create(reply);
  }

  async reportReply(replyId) {
    const reply = await Reply.findById(replyId);
    reply.reported = true;
    return await reply.save();
  }

  async deleteReply(replyId) {
    const reply = await Reply.findById(replyId);
    return await reply.remove();
  }
}

module.exports = ReplyService;
