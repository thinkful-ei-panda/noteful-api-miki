require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
// const xss = require('xss)
const { NODE_ENV, API_TOKEN } = require('./config')

const foldersRouter = require('./folders-router');
const notesRouter = require('./notes-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

const validateBearerToken = (req, res, next) => {
    const bearerToken = req.get('Authorization');
    const apiToken = API_TOKEN;

    if(!bearerToken || bearerToken.split(' ')[1] !== apiToken) {
        return res.status(401).send('Unauthorized user');
    }

    next();
};

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://noteful-app-silk.vercel.app'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
app.use(validateBearerToken);
app.use('/api/folders', foldersRouter);
app.use('/api/notes', notesRouter);

app.use(function errorHandler(error, req, res, next) { /* eslint-disable-line no-unused-var */
    let response;
    if (NODE_ENV === 'production') {
        console.error(error)
        response = { error: { message: 'Internal server error' } };
    } else {
        console.error(error)
        response = { message: error.message, error }
    };
    res.status(500).json(response);
});

module.exports = app;