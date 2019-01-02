var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp' 
mongoose.connect(mongoURL);

module.exports = { mongoose };