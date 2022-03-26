"use strict";

const { Board, Thread } = require("../models");
const { ErrorStatus } = require("../utilities");

class ThreadController {
  /**
   * GET /api/threads/:board
   *
   * Get 10 most recent threads and 3 most recent replies in the specified board.
   *
   * Response:
   *   200 - success
   */
  static async index(req, res, next) {
    try {
      const board = await Board.findByNameOrCreate(req.params.board);
      await board.populate({
        path: "threads",
        select: "-board -reported -delete_password -__v",
        // sort by latest updated and limit 10
        options: { sort: { bumped_on: -1 }, limit: 10 },
        populate: {
          path: "replies",
          select: "-board -reported -delete_password -__v",
          // sort by latest updated and limit 3
          options: { sort: { bumped_on: -1 }, limit: 3 },
        },
      });
      // add replycount to each thread
      res.json(
        board.threads.map((thread) => ({
          ...thread._doc,
          replycount: thread.replies.length,
        }))
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/threads/:board
   *
   * Create a new thread.
   *
   * Response:
   *   302 - success and redirect to specified board
   */
  static async create(req, res, next) {
    try {
      const { board } = req.params;
      const { text, delete_password } = req.body;

      const board_id = (await Board.findByNameOrCreate(board))._id;

      await Thread.create({
        text,
        delete_password,
        board: board_id,
      });

      res.redirect(`/b/${board}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/threads/:board
   *
   * Report a thread.
   *
   * Response:
   *   200 - "reported"
   *   404 - "resource not found"
   */
  static async put(req, res, next) {
    try {
      const { board } = req.params;
      const { thread_id, report_id } = req.body;

      await Thread.reportThread(thread_id || report_id);

      res.send("reported");
    } catch (error) {
      switch (error.message) {
        case "resource not found":
          next(new ErrorStatus("resource not found", 404));
          break;
        default:
          next(error);
          break;
      }
    }
  }

  /**
   * DELETE /api/threads/:board
   *
   * Delete a thread.
   *
   * Response:
   *   200 - "success"
   *   403 - "incorrect password"
   *   404 - "resource not found"
   */
  static async delete(req, res, next) {
    try {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;

      await Thread.deleteThread(thread_id, delete_password);

      res.send("success");
    } catch (error) {
      switch (error.message) {
        case "incorrect password":
          next(new ErrorStatus("incorrect password", 403));
          break;
        case "resource not found":
          next(new ErrorStatus("resource not found", 404));
          break;
        default:
          next(error);
          break;
      }
    }
  }
}

module.exports = ThreadController;
