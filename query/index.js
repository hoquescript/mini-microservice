const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors())

const posts = {

}

app.get('/posts', (req, res) => {
  console.log(posts)
  res.send(posts)
})

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  if(type === 'PostCreated') {
    const {id, title} = data;

    posts[id] = { id, title, comments: []}
  }

  if(type === 'CommentCreated') {
    const { postId, id, content, status } = data;

    posts[postId].comments.push({
      id, content, status
    })
  }

  if(type === 'CommentUpdated'){
    const { postId, id, content, status } = data;

    const comment = posts[postId].comments.find(comment => comment.id === id);

    comment.status = status;
    comment.content = content;
  }
  res.send({})
})

app.listen(4002, () => {
  console.log('Listening at 4002')
})