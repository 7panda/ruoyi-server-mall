import request from '@/utils/request'

// 基础路径
const BASE_URL = '/banner/pdBanner'

/**
 * 查询轮播图管理列表
 * 对应后端：@GetMapping("/list")
 */
export function listPdBanner(query) {
  return request({
    url: `${BASE_URL}/list`,
    method: 'get',
    params: query
  })
}

/**
 * 查询轮播图管理详细
 * 对应后端：@GetMapping("/{id}")
 */
export function getPdBanner(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

/**
 * 新增轮播图管理 (推荐方式：先调用 uploadPic 上传图片，拿到 url 后调用此方法)
 * 对应后端：@PostMapping (接收 JSON)
 *
 * 如果需要在单个请求中同时提交文件和表单数据，请使用 addPdBannerWithFile
 */
export function addPdBanner(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data: data
  })
}

/**
 * 新增轮播图管理 (带文件上传方式)
 * 对应后端：@PostMapping("/addWithPic")
 * 注意：此方法需要使用 FormData 提交
 * @param {Object} params 包含 file, name, linkUrl, sort, publishStatus 等字段
 */
export function addPdBannerWithFile(params) {
  const formData = new FormData()
  // 必须添加文件
  formData.append('file', params.file)
  // 添加其他表单字段
  formData.append('name', params.name)
  if (params.linkUrl) formData.append('linkUrl', params.linkUrl)
  formData.append('sort', params.sort || 0)
  formData.append('publishStatus', params.publishStatus !== undefined ? params.publishStatus : 1)

  return request({
    url: `${BASE_URL}/addWithPic`,
    method: 'post',
    data: formData,
    headers: {
      // 告诉 axios 不要设置 Content-Type，让浏览器自动设置为 multipart/form-data; boundary=...
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 修改轮播图管理 (推荐方式：先调用 uploadPic 上传图片，拿到 url 后调用此方法)
 * 对应后端：@PutMapping (接收 JSON)
 */
export function updatePdBanner(data) {
  return request({
    url: BASE_URL,
    method: 'put',
    data: data
  })
}

/**
 * 修改轮播图管理 (带文件上传方式)
 * 对应后端：@PutMapping("/updateWithPic")
 * 注意：file 是可选的，如果不传 file，则保留原图
 */
export function updatePdBannerWithFile(params) {
  const formData = new FormData()
  // 文件是可选的 (@RequestParam(value = "file", required = false))
  if (params.file) {
    formData.append('file', params.file)
  }
  // 其他必填字段
  formData.append('id', params.id)
  formData.append('name', params.name)
  if (params.linkUrl) formData.append('linkUrl', params.linkUrl)
  formData.append('sort', params.sort || 0)
  formData.append('publishStatus', params.publishStatus !== undefined ? params.publishStatus : 1)

  return request({
    url: `${BASE_URL}/updateWithPic`,
    method: 'put',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 独立上传图片到 OSS
 * 对应后端：@PostMapping("/uploadPic")
 * 常用于：富文本编辑器、头像裁剪组件等，先上传得 URL，再存业务数据
 * @returns {Promise} 返回 { url: '...', fileName: '...' }
 */
export function uploadPic(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: `${BASE_URL}/uploadPic`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除轮播图管理
 * 对应后端：@DeleteMapping("/{ids}")
 * 支持批量删除，id 可以是数字或数组 [1, 2, 3]
 */
export function delPdBanner(id) {
  // 如果是数组，转为逗号分隔字符串 "1,2,3"，后端 @PathVariable Long[] ids 会自动解析
  const ids = Array.isArray(id) ? id.join(',') : id
  return request({
    url: `${BASE_URL}/${ids}`,
    method: 'delete'
  })
}

/**
 * 导出轮播图管理
 * 对应后端：@PostMapping("/export") (注意：后端代码中该接口被注释且定义为 Post)
 * 如果后端取消注释，请注意以下几点：
 * 1. 方法改为 post
 * 2. 需要设置 responseType: 'blob'
 * 3. 如果后端改为 Get，则改回 get 并去掉 data
 */
export function exportPdBanner(query) {
  return request({
    url: `${BASE_URL}/export`,
    method: 'post', // 后端代码定义的是 @PostMapping
    params: query,  // 查询参数通常放在 URL 参数中，即使 POST 也可以带 params
    responseType: 'blob', // 关键：告诉 axios 返回二进制流
    // 注意：如果后端导出接口没有取消注释，调用此方法会报 404 或权限错误
  })
}
