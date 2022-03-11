"use strict";

const { ReplyService } = require("../services");

class ReplyController {
  constructor() {
    this.replyService = new ReplyService();
  }
}

module.exports = ReplyController;
