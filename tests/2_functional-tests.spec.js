const chaiHttp = require("chai-http");
const chai = require("chai");

const assert = chai.assert;

const server = require("../server");
const { Board, Thread, Reply } = require("../app/models");

chai.use(chaiHttp);

async function setupBoard(threadsCount, repliesCount) {
  // refresh collections
  await Board.deleteMany({});
  await Thread.deleteMany({});
  await Reply.deleteMany({});

  // create board
  const newBoard = await Board.create(Board.mock({ name: "test-board" }));
  for (let j = 0; j < threadsCount; j++) {
    const thread = await Thread.create(
      Thread.mock({ board: newBoard._id, delete_password: "test" })
    );
    for (let k = 0; k < repliesCount; k++) {
      await Reply.create(
        Reply.mock({ thread: thread._id, delete_password: "test" })
      );
    }
  }

  // return the new board
  return await Board.findById(newBoard._id).populate({
    path: "threads",
    populate: {
      path: "replies",
    },
  });
}

suite("Functional Tests", function () {
  this.timeout(5000);
  
  const threadsCount = 11;
  const repliesCount = 4;
  let board, apiThreadsUrl, apiRepliesUrl;

  // run before this suite
  // create a board with
  // 11 threads and
  // 4 replies for each thread
  before(function () {
    this.timeout(10000); // suite setup timeout
    console.time("suite setup time");
    return setupBoard(threadsCount, repliesCount).then((_board) => {
      board = _board;
      apiThreadsUrl = `/api/threads/${board.name}`;
      apiRepliesUrl = `/api/replies/${board.name}`;
      console.timeEnd("suite setup time");
    });
  });

  test("Creating a new thread: POST request to /api/threads/:board", function (done) {
    const newThread = {
      text: "test thread",
      delete_password: "test",
    };

    chai
      .request(server)
      .post(apiThreadsUrl)
      .send({
        text: newThread.text,
        delete_password: newThread.delete_password,
      })
      .end(function (err, res) {
        if (err) return done(err);
        // assert redirected to /b/{board}
        assert.equal(res.status, 200);
        assert.equal(res.redirects.length, 1);
        assert.equal(res.redirects[0].includes(`/b/${board.name}`), true);

        // assert thread was created
        Thread.findOne({ text: newThread.text }).then(function (thread) {
          assert.isNotNull(thread);
          done();
        });
      });
  });

  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/:board", function (done) {
    chai
      .request(server)
      .get(apiThreadsUrl)
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.isAtMost(res.body.length, 10);
        assert.isString(res.body[0]._id);
        assert.isString(res.body[0].text);
        assert.isString(res.body[0].created_on);
        assert.isString(res.body[0].bumped_on);
        assert.isNumber(res.body[0].replycount);
        assert.isAtMost(res.body[0].replies.length, 3);
        done();
      });
  });

  test("Deleting a thread with the incorrect password: DELETE request to /api/threads/:board with an invalid delete_password", function (done) {
    chai
      .request(server)
      .delete(apiThreadsUrl)
      .send({ thread_id: board.threads[0]._id, delete_password: "wrong" })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
        done();
      });
  });

  test("Deleting a thread with the correct password: DELETE request to /api/threads/:board with a valid delete_password", function (done) {
    chai
      .request(server)
      .delete(apiThreadsUrl)
      .send({ thread_id: board.threads[0]._id, delete_password: "test" })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
        done();
      });
  });

  test("Reporting a thread: PUT request to /api/threads/:board", function (done) {
    chai
      .request(server)
      .put(apiThreadsUrl)
      .send({ thread_id: board.threads[1]._id })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });

  test("Creating a new reply: POST request to /api/replies/:board", function (done) {
    const newReply = {
      thread_id: board.threads[1]._id,
      text: "testCreateReply",
      delete_password: "test",
    };

    chai
      .request(server)
      .post(apiRepliesUrl)
      .send(newReply)
      .end(function (err, res) {
        if (err) return done(err);
        // assert redirected to /b/{board}/{thread_id}
        assert.equal(res.status, 200);
        assert.equal(res.redirects.length, 1);
        assert.equal(
          res.redirects[0].includes(`/b/${board.name}/${newReply.thread_id}`),
          true
        );
        // assert reply was created
        Reply.findOne({ text: newReply.text }).then(function (reply) {
          assert.isNotNull(reply);
          done();
        });
      });
  });

  test("Viewing a single thread with all replies: GET request to /api/replies/:board", function (done) {
    chai
      .request(server)
      .get(apiRepliesUrl+`?thread_id=${board.threads[2]._id}`)
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        // assert the replies count is equal to the mocked replies count
        assert.equal(res.body.replies.length, repliesCount);
        done();
      });
  });

  test("Deleting a reply with the incorrect password: DELETE request to /api/replies/:board with an invalid delete_password", function (done) {
    const replyToDelete = {
      reply_id: board.threads[1].replies[0]._id,
      delete_password: "wrong",
    };

    chai
      .request(server)
      .delete(apiRepliesUrl)
      .send(replyToDelete)
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
        done();
      });
  });

  test("Deleting a reply with the correct password: DELETE request to /api/replies/:board with a valid delete_password", function (done) {
    const replyToDelete = {
      reply_id: board.threads[1].replies[0]._id,
      delete_password: "test",
    };

    chai
      .request(server)
      .delete(apiRepliesUrl)
      .send(replyToDelete)
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
        done();
      });
  });

  test("Reporting a reply: PUT request to /api/replies/:board", function (done) {
    chai
      .request(server)
      .put(apiRepliesUrl)
      .send({ reply_id: board.threads[1].replies[1]._id })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });
});
