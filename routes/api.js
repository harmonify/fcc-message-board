"use strict";

const { ThreadController, ReplyController } = require("../app/controllers");

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .get(ThreadController.index)
    .post(ThreadController.create)
    .put(ThreadController.put)
    .delete(ThreadController.delete);

  app
    .route("/api/replies/:board")
    .get(ReplyController.index)
    .post(ReplyController.create)
    .put(ReplyController.put)
    .delete(ReplyController.delete);
};
