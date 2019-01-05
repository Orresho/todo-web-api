const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { Todo } = require('../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: "first test todo"
  },
  {
    _id: new ObjectID(),
    text: "second test todo",
    completed: true,
    completedAt: 333
  },
];

// Empty the todos before starting any of the test suites
beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';
    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      })
  });

  it('Should not create todo with invalid data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2)
          done();
        }).catch(e => done(e))
      })
  });
});

describe('GET /todos', () => {
  it('Should get all the todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done)
  });
});

describe('GET /todo/:id', () => {
  it('Should return todo doc', (done) => {
    request(app)
      .get(`/todo/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  });

  it('Should return an invalid ObjectID', (done) => {
    request(app)
      .get(`/todo/abc12`)
      .expect(404)
      .expect(res => {
        expect(res.body.message).toBe('invalid objectID')
      })
      .end(done)
  });

  it('Should return valid object that doesnt exist', (done) => {
    let hexId = new ObjectID().toHexString()
    request(app)
      .get(`/todo/${hexId}`)
      .expect(404)
      .expect(res => {
        expect(res.body.message).toBe('No todo found')
      })
      .end(done)
  });
});

describe('DELETE /todo/:id', () => {
  it('Should delete a single todo', (done) => {
    let hexId = todos[0]._id.toHexString();
    request(app)
      .delete(`/todo/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(hexId)
          .then(todo => {
            expect(todo).toNotExist();
            done();
          })
          .catch(err => done(err));
      });
  });

  it('Should return an invalid ObjectID', (done) => {
    request(app)
      .delete(`/todo/abc123`)
      .expect(404)
      .expect(res => {
        expect(res.body.error).toBe('Invalid id')
      })
      .end(done)
  });

  it('Should return a valid object that doesnt exist', (done) => {
    let hexId = new ObjectID().toHexString()
    request(app)
      .delete(`/todo/${hexId}`)
      .expect(404)
      .expect(res => {
        expect(res.body.error).toBe('Not found')
      })
      .end(done)
  });
});

describe('PATCH /todo/:id', () => {
  it('Should update a todo', done => {
    let hexId = todos[0]._id.toHexString();
    let text = 'This should be a new text';
    request(app)
      .patch(`/todo/${hexId}`)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done)
  });

  it('Should clear completedAt when todo is not complete', (done) => {
    let hexId = todos[1]._id.toHexString();
    let text = 'This should be a new text!!!';
    request(app)
      .patch(`/todo/${hexId}`)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done)
  });
});