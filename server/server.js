const Koa = require('koa'),
      send = require('koa-send'),
      path = require('path'),
      app = new Koa()

const isDev = process.env.NODE_ENV !== 'production'

app.use(async (ctx, next) => {
  try {
    console.log(`request with path ${ctx.path}`)
    await next()
  } catch (err) {
    console.log(err)
    ctx.status = 500
    if (isDev) {
      ctx.body = err.message
    } else {
      ctx.bosy = '服务器繁忙, 请稍后...'
    }
  }
})


//处理 favicon 请求
app.use(async (ctx, next) => {
  if (ctx.path === '/favicon.ico') {
    await send(ctx, '/public/favicon.ico', { root: path.join(__dirname, '../') })
  } else {
    await next()
  }
})




let router
if (isDev) {
  router = require('./routers/dev-ssr')
} else {
  router = require('./routers/ssr')
}

app.use(router.routes()).use(router.allowedMethods())

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is listening on localhost:${PORT}`);
});

