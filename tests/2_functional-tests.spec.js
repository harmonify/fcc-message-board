const chaiHttp = require("chai-http");
const chai = require("chai");

const assert = chai.assert;

const server = require("../server");
const { Board } = require("../models");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  const boards = [];

  // run before this suite
  before(async function () {
    await Board.deleteMany({});
    // TODO:
    // create 10 boards with 5 - 10 threads each
    // and for each thread, create 10 - 15 replies
    // with Board.mock({maxThreadsCount, maxRepliesCount, threadLabels, replyLabels})
    for (let i = 0; i < 10; i++) {
      const board = await Board.create(Board.mock());
      boards.push(board);
    }
  });

  const getThreadUrl = (boardName) => `/api/threads/${boardName}`;
  const getRepliesUrl = (boardName) => `/api/replies/${boardName}`;

  test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .post(getThreadUrl("test"))
      .send({})
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.fail("NotImplemented");
        done();
      });
  });

  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .get(getThreadUrl("test"))
      .send({})
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.fail("NotImplemented");
        done();
      });
  });

  test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", function (done) {
    chai
      .request(server)
      .delete(getThreadUrl("test"))
      .send({})
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.fail("NotImplemented");
        done();
      });
  });

  test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", function (done) {
    chai
      .request(server)
      .delete(getThreadUrl("test"))
      .send({})
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.fail("NotImplemented");
        done();
      });
  });

  test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .put(getThreadUrl("test"))
      .send({})
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.fail("NotImplemented");
        done();
      });
  });

  test("Creating a new reply: POST request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .post(getRepliesUrl("test"))
      .send({})
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.fail("NotImplemented");
        done();
      });
  });

  test("Viewing a single thread with all replies: GET request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .get(getRepliesUrl("test"))
      .send({})
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.fail("NotImplemented");
        done();
      });
  });

  test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", function (done) {
    chai
      .request(server)
      .delete(getRepliesUrl("test"))
      .send({})
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.fail("NotImplemented");
        done();
      });
  });

  test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", function (done) {
    chai
      .request(server)
      .delete(getRepliesUrl("test"))
      .send({})
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.fail("NotImplemented");
        done();
      });
  });

  test("Reporting a reply: PUT request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .put(getRepliesUrl("test"))
      .send({})
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.fail("NotImplemented");
        done();
      });
  });
});
