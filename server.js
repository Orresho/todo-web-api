const express = require('express');

let app = express();

app.get('/', (req, res) => {
  res.send("hello express");
});

app.get('/about', (req, res) => {
  res.send("About page");
});


app.listen(3000);