const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const uuid = require('uuid').v4

const {SERVER_PORT} = require('./config.js');
const routes = require('./routes');

const app = express();

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 디버깅 용도.
app.use(morgan('common'));

app.use('/', routes);
// 사전 정의하지 않은 모든 endpoint를 여기서 처리
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 통합 오류 관리자
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});


app.listen(SERVER_PORT, () => {
  console.log(`Server is running on ${SERVER_PORT} port`);
});
