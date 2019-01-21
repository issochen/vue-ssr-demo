const Router = require('koa-router'),
      axios = require('axios'),
      path = require('path'),
      fs = require('fs'),
      ejs = require('ejs'),
      MemoryFS = require('memory-fs'),
      webpack = require('webpack'),
      { createBundleRenderer } = require('vue-server-renderer')
      

// 1、获取webpack配置文件
const webpackConfig = require('@vue/cli-service/webpack.config')

// 2、配置webpack
const serverCompiler = webpack(webpackConfig)
const mfs = new MemoryFS()    // 类似于fs模块  区别：mfs是从内存中进行读写操作 比较快
serverCompiler.outputFileSystem = mfs

// 3、监听文件修改，实时编译获取最新的 vue-ssr-server-bundle.json
let bundle
serverCompiler.watch({}, (err, stats) => {
  if (err) throw err  //  监听webpack打包错误
  stats = stats.toJson()
  stats.errors.forEach(err => console.log(err))
  stats.warnings.forEach(warn => console.warn(warn))   // 监听文件eslint等错误

  const bundlePath = path.join(
    webpackConfig.output.path,
    'vue-ssr-server-bundle.json'   // vue.config.js里new VueSSRServerPlugin() 默认生成的文件名
  )
  bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
  console.log('new bundle generated')
})

const handleSSR = async (ctx) => {
  if (!bundle) {
    ctx.body = 'weback正在打包,请稍后...'
    return
  }

//4、获取最新的 vue-ssr-client-manifest.json
  const clientManifestResp = await axios.get(
    'http://127.0.0.1:8080/vue-ssr-client-manifest.json'   //new VueSSRClientPlugin()默认生成的文件名
  )
  const clientManifest = clientManifestResp.data

//5、获取模板文件
  const template = fs.readFileSync(
    path.join(__dirname, '../index.template.ejs'),
    'utf-8'    //一定要加编码格式  否则为buffer数据
  )

  const renderer = createBundleRenderer(bundle, {
      inject: false,  //防止自动注入
      clientManifest
    })
  
//6、实时将renderer获取的json文件里的 html css  js 编译到ejs模板中
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
