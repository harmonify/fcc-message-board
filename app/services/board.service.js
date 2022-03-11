"use strict";

const { Board } = require("../models");

class BoardService {
  async getBoard(boardName) {
    return await Board.findOne({ name: boardName });
  }

  async getBoardAndPopulate(boardName) {
    // TODO: refactor to automatically specify the path to populate
    return await Board.findOne({ name: boardName }).populate({
      path: "threads",
      populate: { path: "replies" },
    });
  }
}

module.exports = BoardService;
