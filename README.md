# vue-cli3 集成 ssr
## 操作
```
npm install
```
## 开发环境
```
npm run dev 即可
```
## 正式环境
将vue.config.js里的下面代码注释后执行npm build:os  npm start即可
```javascript
  publicPath: 'http://localhost:8080',  // 开发环境 映射 css js请求地址
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' }  // 开发环境 实现热更新 跨域问题
  },
```

## 注意
package.json中
windows系统需将
```bash
"build:os": "npm run build:server && mv dist/vue-ssr-server-bundle.json bundle && npm run build:client && mv bundle dist/vue-ssr-server-bundle.json"
```
修改成
```bash
"build:os": "npm run build:server && move dist\\vue-ssr-server-bundle.json bundle && npm run build:client && move bundle dist\\vue-ssr-server-bundle.json"
```
