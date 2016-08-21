"use strict";

require('babel-register')({
  plugins: ['transform-async-to-generator']
});

const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  try {
    await next(); // next is now a function
  } catch (err) {
    ctx.body = { message: err.message };
    ctx.status = err.status || 500;
  }
});

app.use(async ctx => {
  ctx.body = 'hello';
});

app.listen(3000);




