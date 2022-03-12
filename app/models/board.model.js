"use strict";

const { model, Schema, SchemaTypes } = require("mongoose");
const { models, timestamps } = require("../config").mongooseConfig;

const boardSchema = new Schema(
  {
    name: {
      type: SchemaTypes.String,
      required: [true, "Board name is required"],
      index: true,
    },
    threads: [
      {
        type: SchemaTypes.ObjectId,
        ref: models.Thread,
      },
    ],
  },
  { timestamps }
);

/**
 * Mock a board document.
 *
 * @param {Object} board - A board object with the following properties:
 * - name: {String} - The name of the board.
 * - threads: {Array<SchemaTypes.ObjectId>} - The _id fields of the thread
 *   documents.
 * - reported: {Boolean} - The reported status of the board.
 * @return {Object} A board object.
 */
boardSchema.statics.mock = function ({ name, threads } = {}) {
  return {
    name: name || "Board Mock",
    threads: threads || [],
  };
};

/**
 * Find by name and populate the referenced fields of the board document.
 *
 * @param {String} boardName - Board document name field.
 * @return {Promise<Board>} A promise that resolves to a Board document.
 */
boardSchema.statics.findByNameAndPopulate = async function (boardName) {
  // TODO: refactor to automatically specify the path to populate
  return await Board.findOne({ name: boardName }).populate({
    path: "threads",
    populate: { path: "replies" },
  });
};

/**
 * Find by name or create a new board document.
 *
 * @param {String} boardName - Board document name field.
 * @return {Promise<Board>} A promise that resolves to a Board document.
 */
boardSchema.statics.findByNameOrCreate = async function (boardName) {
  const board = await Board.findOne({ name: boardName });
  if (board) return board;

  return await Board.create({ name: boardName });
};

const Board = model(models.Board, boardSchema);

module.exports = {
  boardSchema,
  Board,
};
