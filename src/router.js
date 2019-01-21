import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default function createRouter () {
  return new Router({
    mode: 'history', // 一定要是history模式
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/about',
        name: 'about',
        component: resolve => require(['@/views/About'], resolve)
      }
    ]
  })
}
