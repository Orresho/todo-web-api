var express = require('express');
var bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const PORT = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save()
    .then(doc => {
      res.send(doc)
    }, err => {
      res.status(400).send(err)
    })
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

module.exports = { app };