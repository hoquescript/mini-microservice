const express = require("express");
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const app = express();

const commentsByPostId = {};

app.use(bodyParser.json());
app.use(cors());

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");

  const id = req.params.id;
  const { content } = req.body;

  const comments = commentsByPostId[id] || [];
  comments.push({ id: commentId, content, status: "pending" });

  commentsByPostId[id] = comments;

  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      postId: id,
      id: commentId,
      content,
      status: "pending"
    },
  });
  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  console.log("Event recieved" + req.body.type);
  const { type, data } = req.body;

  if(type === 'CommentModerated'){
    const comment = commentsByPostId[data.postId].find(comment => comment.id === data.id);
    comment.status = data.status;

    axios.post('http://localhost:4005/events', {
      type: "CommentUpdated",
      data: {
        postId: data.postId,
        id: data.id,
        content: data.content,
        status: data.status
      },
    })
  }
});

app.listen(4001, () => {
  console.log("Listening on 4001");
});
