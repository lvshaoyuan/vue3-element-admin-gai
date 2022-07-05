/*
 * @Author: oldlv 15237336850@163.com
 * @Date: 2022-07-03 18:25:35
 * @LastEditors: oldlv 15237336850@163.com
 * @LastEditTime: 2022-07-03 22:41:15
 * @FilePath: /vue3-element-admin-gai/src/router/index.js
 * @Description:
 *
 * Copyright (c) 2022 by oldlv 15237336850@163.com, All Rights Reserved.
 */

import { createRouter, createWebHashHistory } from 'vue-router'

import redirect from './modules/redirect'
import error from './modules/error'
import login from './modules/login'
import lock from './modules/lock'
import home from './modules/home'
import test from './modules/test'
import user from './modules/user'
/* 菜单栏的路由 */
// 固定菜单
export const fixedRoutes = [...home, ...user]
// 动态菜单
export const asyncRoutes = [...test]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    ...redirect, // 统一的重定向配置
    ...login,
    ...lock,
    ...fixedRoutes,
    ...error,
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { left: 0, top: 0 }
    }
  },
})

export default router
