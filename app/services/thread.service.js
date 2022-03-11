"use strict";

const { Thread } = require("../models");

class ThreadService {
  async getThread(threadId) {
    return await Thread.findById(threadId);
  }

  async getThreadAndPopulate(threadId) {
    return await Thread.findById(threadId).populate({
      path: "replies",
    });
  }

  async reportThread(threadId) {
    const thread = await Thread.findById(threadId);
    thread.reported = true;
    return await thread.save();
  }

  async deleteThread(threadId) {
    const thread = await Thread.findById(threadId);
    return await thread.remove();
  }
}

module.exports = ThreadService;
