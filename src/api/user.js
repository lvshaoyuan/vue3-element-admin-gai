/*
 * @Author: oldlv 15237336850@163.com
 * @Date: 2022-07-03 15:05:42
 * @LastEditors: oldlv 15237336850@163.com
 * @LastEditTime: 2022-07-03 15:05:46
 * @FilePath: /vue3-element-admin/src/api/user.js
 * @Description:
 *
 * Copyright (c) 2022 by oldlv 15237336850@163.com, All Rights Reserved.
 */
import request from '@/utils/request'

// 获取用户列表
export const getUserList = params => {
  return request({
    url: '/api/users',
    method: 'get',
    params,
  })
}

// 删除某个用户
export const DeleteUser = userId => {
  return request({
    url: `/api/user/${userId}`,
    method: 'delete',
  })
}
