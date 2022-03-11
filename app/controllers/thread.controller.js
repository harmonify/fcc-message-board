"use strict";

const { ThreadService } = require("../services");

class ThreadController {
  constructor() {
    this.threadService = new ThreadService();
  }
}

module.exports = ThreadController;
