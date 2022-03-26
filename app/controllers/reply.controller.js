"use strict";

const { Reply, Thread } = require("../models");
const { ErrorStatus } = require("../utilities");

class ReplyController {
  /**
   * GET /api/replies/:board?[thread_id]
   *
   * Get a thread and its replies.
   *
   * Response:
   *   200 - success
   */
  static async index(req, res, next) {
    try {
      const { board } = req.params;
      const { thread_id } = req.query;

      const thread = await Thread.findById(thread_id)
        .select("_id text created_on bumped_on replies")
        .populate({
          path: "replies",
          select: "_id text created_on",
        });

      res.json(thread);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/replies/:board
   *
   * Create a new reply.
   *
   * Response:
   *   302 - success and redirect to specified thread
   */
  static async create(req, res, next) {
    try {
      const { board } = req.params;
      const { thread_id, text, delete_password } = req.body;

      await Reply.create({ text, delete_password, thread: thread_id });

      res.redirect(`/b/${board}/${thread_id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/replies/:board
   *
   * Report a reply.
   *
   * Response:
   *   200 - "reported"
   *   404 - "resource not found"
   */
  static async put(req, res, next) {
    try {
      const { board } = req.params;
      const { thread_id, reply_id } = req.body;

      await Reply.reportReply(reply_id);

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
   * DELETE /api/replies/:board
   *
   * Delete a reply.
   *
   * Response:
   *   200 - "success"
   *   403 - "incorrect password"
   *   404 - "resource not found"
   */
  static async delete(req, res, next) {
    try {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;

      await Reply.deleteReply(reply_id, delete_password);

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

module.exports = ReplyController;
