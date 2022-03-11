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

const Board = model(models.Board, boardSchema);

module.exports = {
  boardSchema,
  Board,
};
