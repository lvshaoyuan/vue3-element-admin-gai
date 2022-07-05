import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import store from '@/store'
import router from '@/router'
import qs from 'qs'

let pending = [] //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let removePending = config => {
  for (let p in pending) {
    if (pending[p].u === config.url + '&' + config.method) {
      //当当前请求在数组中存在时执行函数体
      pending[p].f(config.url + '取消') //执行取消操作
      pending.splice(p, 1) //把这条记录从数组中移除
    }
  }
}

// 上传函数 及方法 感谢操老板，不然我自己得写死o(╥﹏╥)o
function isNumber(val) {
  var regPos = /^\d+(\.\d+)?$/ //非负浮点数
  var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/ //负浮点数
  if (regPos.test(val) || regNeg.test(val)) {
    return true
  } else {
    return false
  }
}

function renderFormData(formData, params, preference) {
  if (preference == undefined) preference = ''
  Object.keys(params).map((key, index) => {
    if (Object.prototype.toString.call(params[key]) === '[object Object]') {
      if (isNumber(key)) {
        renderFormData(formData, params[key], preference + '[' + key + ']')
      } else {
        let preference_key = ''
        if (preference == '') {
          preference_key = preference + key
        } else {
          preference_key = preference + '.' + key
        }
        renderFormData(formData, params[key], preference_key)
      }
    } else if (Array.isArray(params[key])) {
      let preference_key = ''
      if (preference == '') {
        preference_key = preference + key
      } else {
        preference_key = preference + '.' + key
      }
      if (isNumber(key)) {
        renderFormData(formData, params[key], preference + '[' + key + ']')
      } else {
        renderFormData(formData, params[key], preference_key)
      }
    } else {
      if (isNumber(key)) {
        formData.append(preference + '[' + key + ']', params[key])
        // console.log(
        //   preference + "[" + key + "]",
        //   formData.getAll(preference + "[" + key + "]")
        // );
      } else {
        let preference_key = ''
        if (preference == '') {
          preference_key = preference + key
        } else {
          preference_key = preference + '.' + key
        }
        formData.append(preference_key, params[key])
        // console.log(preference + key, formData.getAll(preference + key));
      }
    }
  })
}

const config = {
  method: 'get',
  // 基础url前缀
  baseURL: '/',
  // 请求头信息
  headers: {
    'Content-Type': 'application/jsoncharset=UTF-8',
  },
  // 参数
  data: {},
  // 设置超时时间
  timeout: 60000 * 10,
  // 携带凭证
  withCredentials: false,
  // 返回数据类型
  responseType: 'json',
  // 是否需要把headers返回
  nedResHeaders: false,
}

const gotoLogin = (error = undefined) => {
  // 校验是否有 refresh_token
  const { authorization } = store.state.app
  if (!authorization || !authorization.refresh_token) {
    if (router.currentRoute.value.name === 'login') {
      return Promise.reject(error)
    }
    const redirect = encodeURIComponent(window.location.href)
    router.push(`/login?redirect=${redirect}`)
    // 清除token
    store.dispatch('app/clearToken')
    if (!error) {
      setTimeout(() => {
        ElMessage.closeAll()
        try {
          ElMessage.error(error.response.data.msg)
        } catch (err) {
          ElMessage.error(error.message)
        }
      })
    }
    // 代码不要往后执行了
    return Promise.reject(error)
  }
}

function $axios(options) {
  return new Promise((resolve, reject) => {
    const service = axios.create(config)

    // 拦截请求
    service.interceptors.request.use(
      config => {
        const { authorization } = store.state.app
        if (authorization) {
          config.headers.Authorization = `Bearer ${authorization.token}`
        }

        // 全局拦截请求在路由配置里触发取消上一页面的请求
        if (!options.ignoreReq) {
          removePending(config) //在一个ajax发送前执行一下取消操作
          config.cancelToken = new axios.CancelToken(cancel => {
            window.__asxiosPromiseArr.push({
              cancel,
            })
            // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
            pending.push({
              u: config.url + '&' + config.method,
              f: cancel,
            })
          })
        }

        return config
      },
      error => {
        // console.log(error)
        return Promise.reject(error)
      }
    )

    // 拦截响应
    service.interceptors.response.use(
      // 响应成功进入第1个函数，该函数的参数是响应对象
      response => {
        if (!options.ignoreReq) {
          removePending(response.config) //在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
        }
        const data = response.data

        if (options.nedResHeaders) {
          return {
            data,
            headers: response.headers,
          }
        } else {
          return data
        }
      },
      // 响应失败进入第2个函数，该函数的参数是错误对象
      async error => {
        const { authorization } = store.state.app
        // 如果响应码是 401 ，则请求获取新的 token
        // 响应拦截器中的 error 就是那个响应的错误对象
        if (error.response && error.response.status === 401) {
          gotoLogin(error)
          // 如果有refresh_token，则请求获取新的 token
          try {
            const res = await axios({
              method: 'PUT',
              url: '/api/authorizations',
              timeout: 10000,
              headers: {
                Authorization: `Bearer ${authorization.refresh_token}`,
              },
            })
            // 如果获取成功，则把新的 token 更新到容器中
            // console.log('刷新 token  成功', res)
            store.commit('app/setToken', {
              token: res.data.data.token, // 最新获取的可用 token
              refresh_token: authorization.refresh_token, // 还是原来的 refresh_token
            })
            // 把之前失败的用户请求继续发出去
            // config 是一个对象，其中包含本次失败请求相关的那些配置信息，例如 url、method 都有
            // return 把 request 的请求结果继续返回给发请求的具体位置
            return service(error.config)
          } catch (err) {
            // 如果获取失败，直接跳转 登录页
            // console.log('请求刷新 token 失败', err)
            const redirect = encodeURIComponent(window.location.href)
            router.push(`/login?redirect=${redirect}`)
            // 清除token
            store.dispatch('app/clearToken')
            return Promise.reject(error)
          }
        }

        // console.dir(error) // 可在此进行错误上报
        ElMessage.closeAll()
        try {
          ElMessage.error(error.response.data.msg)
        } catch (err) {
          ElMessage.error(error.message)
        }

        return Promise.reject(error)
      }
    )

    // 请求处理
    service(options)
      .then(res => {
        resolve(res)
        return false
      })
      .catch(error => {
        reject(error)
      })
  })
}

/*
$http({
	method: 'GET',
	url: url,
	params: params
}, r => {}, err => {})
*/

function $http(options, success, failure) {
  let loading
  if (!!options.loading && options.loading) {
    loading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })
  }

  let headers = options.headers ? options.headers : config.headers
  if (!options.params) {
    options.params = {}
  }

  // options.params.fuckie = new Date().getTime()

  return $axios({
    method: options.method ? options.method : 'GET',
    url: options.url,
    headers: headers,
    responseType: options.hasOwnProperty('responseType')
      ? options.responseType
      : config.responseType,
    params: options.method
      ? options.method === 'GET' ||
        options.method === 'get' ||
        options.method === 'DELETE' ||
        options.method === 'delete'
        ? options.params
        : null
      : options.params,
    data: (function() {
      if (
        options.method === 'POST' ||
        options.method === 'post' ||
        options.method === 'PUT' ||
        options.method === 'put'
      ) {
        if (
          !!options.headers &&
          options.headers['Content-Type'] == 'multipart/form-data'
        ) {
          let formData = new FormData()
          renderFormData(formData, options.data)
          return formData
        } else if (
          !!options.headers &&
          options.headers['Content-Type'] == 'text/plain'
        ) {
          return qs.stringify(options.data)
        } else {
          return options.data
        }
      } else {
        return options.data
      }
    })(),
    baseURL: options.baseURL ? options.baseURL : config.baseURL,
    withCredentials: options.withCredentials
      ? options.withCredentials
      : config.withCredentials,
    timeout: options.timeout ? options.timeout : config.timeout,
    ignoreReq: options.ignoreReq ? options.ignoreReq : null,
    nedResHeaders: options.hasOwnProperty('nedResHeaders')
      ? options.nedResHeaders
      : config.nedResHeaders,
  })
    .then(res => {
      if (!!options.loading && options.loading) loading.close()
      if (res.code == 200 && res.errorFlag == 0) {
        if (!!options.showSucMes && options.showSucMes) {
          ElMessage({
            showClose: true,
            message: res.message,
            type: 'success',
            duration: 5 * 1000,
          })
        }
        success && success(res)
        return new Promise((resolve, reject) => {
          resolve(res)
        })
      } else {
        if (
          !!res.status &&
          (res.status == '0001' || res.status == '0002' || res.status == '0003')
        ) {
          console.error(res)
          gotoLogin()
        }

        if (!!res || !!res.access_token) {
          success && success(res)
          return new Promise((resolve, reject) => {
            resolve(res)
          })
        } else {
          if (!options.hideError) {
            let messageFn = () => {
              if (!options.hideError) {
                ElMessage({
                  showClose: true,
                  message: res.message,
                  type: 'error',
                  duration: 5 * 1000,
                })
              }
            }

            if (res.code == 401 || res.code == 408 || res.code == 409) {
              if (document.getElementsByClassName('el-message').length === 0) {
                messageFn()
              }
              gotoLogin()
            } else {
              messageFn()
            }
          }
          failure && failure(res)
          return new Promise((resolve, reject) => {
            resolve(res)
          })
        }
      }
    })
    .catch(err => {
      if (axios.isCancel(err)) {
        console.log('Rquest canceled: ' + err.message)
        if (!!options.loading && options.loading) loading.close()
      } else {
        console.log('****************')
        console.error(err)
        console.log('****************')
        if (!options.hideError) {
          ElMessage({
            showClose: true,
            message: err.message,
            type: 'error',
            duration: 5 * 1000,
          })
        }
        if (!!options.loading && options.loading) loading.close()
        failure && failure(err)
      }
      return new Promise((resolve, reject) => {
        reject(err)
      })
    })
}

export default $http
