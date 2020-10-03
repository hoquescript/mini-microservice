const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();

const commentsByPostId = {};

app.use(bodyParser.json());
app.use(cors())

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments', async(req, res) => {
  const commentId = randomBytes(4).toString('hex');

  const id = req.params.id;
  const { content } = req.body;

  const comments = commentsByPostId[id] || []
  comments.push({ id: commentId, content })

  commentsByPostId[id] = comments;

  await axios.post('http://localhost:4005/events',{
    type: 'CommentCreated',
    data: {
      postId: id,
      id: commentId, 
      content
    }
  })
  res.status(201).send(comments)
})

app.post("/events", async ( req, res ) => {
  console.log('Event recieved' + req.body.type)
})

app.listen(4001, () => {
  console.log('Listening on 4001')
})