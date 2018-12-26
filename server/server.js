var express = require('express');
var bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

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

app.get('/todos', (req, res) => {
  Todo.find()
    .then(
      todos => res.send({ todos }),
      err => res.status(400).send(err));
});

app.get('/todo/:id', (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({message: 'invalid objectID'});
  }

  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send({message: 'No todo found'});
      }
      res.send({ todo })
    }, err => res.status(400).send())
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

module.exports = { app };