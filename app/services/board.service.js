"use strict";

const { Board } = require("../models");

class BoardService {
  async findBoard(boardName) {
    return await Board.findOne({ name: boardName });
  }

  async findAndPopulateBoard(boardName) {
    // TODO: refactor to automatically specify the path to populate
    return await Board.findOne({ name: boardName }).populate({
      path: "threads",
      populate: { path: "replies" },
    });
  }

  async findOrCreateBoard(boardName) {
    const board = await Board.findOne({ name: boardName });
    if (board) return board;

    return await Board.create({ name: boardName });
  }
}

module.exports = BoardService;
