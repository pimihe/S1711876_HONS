const express    = require('express');
const path       = require('path');
const cors       = require('cors');
const mongoose   = require('mongoose');
const config     = require('./config/config');
const bodyParser = require('body-parser');

// connect To Database
mongoose.connect(config.database.url, config.database.options);
mongoose.connection.on('connected', () => {
  console.log('Connected to database '+config.database.url);
});
mongoose.connection.on('error', (err) => {
  console.log('Database error: '+err);
});

const app = express();

const user             = require('./routes/user');
const file             = require('./routes/file');
const notification     = require('./routes/notification');
const processingFile   = require('./routes/processingFile');
const processingServer = require('./routes/processingServer');
const storageServer    = require('./routes/storageServer');

// Port Number
const port = 80;

// CORS Middleware
app.use(cors());

// Body Parser Middleware
app.use(bodyParser.json());

//handle bodyparser error
app.use((err, req, res, next) => {
  // you can error out to stderr still, or not; your choice
  console.error('invalid json error'); 
  // body-parser will set this to 400 if the json has error
  if(err.status === 400){
    return res.status(err.status).send('Invalid JSON');
  }
  return next(err); // if it's not a 400, let the default error handling do it. 
});

app.use('/user', user);
app.use('/file', file);
app.use('/notification', notification);
app.use('/processing-file', processingFile);
app.use('/processing-server', processingServer);
app.use('/storage-server', storageServer);

// Index Route
app.get('/', (req, res) => {
  res.send('Invalid Endpoint');
});

// Start Server
app.listen(port, () => {
  console.log('Server started on port '+ port + ' at time : ' + Date.now());
});

app.listen(3000);