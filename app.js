const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const app = express();

mongoose.Promise = global.Promise;
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect('mongodb://localhost/muber');
}

app.use(bodyParser.json());  // middleware
routes(app);

/* @err defined if previous mdw threw an err
 * @req incoming request
 * @res outgoing response
 * @next pass control flow to next mdw chain
 */
app.use((err, req, res, next) => {
  res.status(422).send({ error: err.message });
});

module.exports = app;
