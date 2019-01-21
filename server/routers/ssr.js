const Router = require('koa-router'),
      path = require('path'),
      ejs = require('ejs'),
      fs = require('fs'),
      send = require('koa-send'),
      { createBundleRenderer } = require('vue-server-renderer')

// 1、 获取打包后的client 信息 可以帮助在html 中插入 css html js 等
const clientManifest = require('../../dist/vue-ssr-client-manifest.json')

// 2、 获取服务端渲染模板
const template = fs.readFileSync(
  path.join(__dirname, '../index.template.ejs'),
  'utf-8'
)

// 3、 获取打包后的server 信息
const renderer = createBundleRenderer(
  path.join(__dirname, '../../dist/vue-ssr-server-bundle.json'),
  {
    inject: false,
    clientManifest
  }
)

// 4、将renderer获取的json文件里的 html css  js 编译到ejs模板中
const handleSSR = async (ctx) => {
  //处理静态资源
  const url = ctx.path
  if (/\w+.[js|css|jpg|jpeg|png|gif|map]/.test(url)) {
    return await send(ctx, url, {root: path.join(__dirname,'../../dist')})
  }

  ctx.headers['Content-Type'] = 'text/html'
  const context = { url: ctx.path }
  try {
    const appString = await renderer.renderToString(context)

    // 从context meta 取出title
    const { title } = context.meta.inject()

    const html = ejs.render(template, {
      appString,
      style: context.renderStyles(),
      scripts: context.renderScripts(),
      title: title.text()
    })
    ctx.body = html
  } catch (err) {
    console.log('render error', err)
    throw err
  }
}

const router = new Router()

router.get('*', handleSSR)

module.exports = router
