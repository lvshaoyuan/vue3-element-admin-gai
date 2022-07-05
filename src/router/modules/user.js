/*
 * @Author: oldlv 15237336850@163.com
 * @Date: 2022-07-03 14:52:31
 * @LastEditors: oldlv 15237336850@163.com
 * @LastEditTime: 2022-07-05 00:32:08
 * @FilePath: /vue3-element-admin-gai/src/router/modules/user.js
 * @Description:
 *
 * Copyright (c) 2022 by oldlv 15237336850@163.com, All Rights Reserved.
 */

const UserList = () => import('@/views/user/index.vue')
const Layout = () => import('@/layout/index.vue')

export default [
  {
    path: '/user',
    component: Layout,
    name: 'user',
    meta: {
      title: '用户管理',
    },
    icon: 'User',
    children: [
      {
        path: '',
        name: 'userList',
        component: UserList,
        meta: {
          title: '用户列表',
        },
      },
    ],
  },
]
