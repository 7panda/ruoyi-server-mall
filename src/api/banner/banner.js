import request from '@/utils/request'

// 查询轮播图管理列表
export function listPdBanner(query) {
  return request({
    url: '/banner/pdBanner/list',
    method: 'get',
    params: query
  })
}

// 查询轮播图管理详细
export function getPdBanner(id) {
  return request({
    url: '/banner/pdBanner/' + id,
    method: 'get'
  })
}

// 新增轮播图管理
export function addPdBanner(data) {
  return request({
    url: '/banner/pdBanner',
    method: 'post',
    data: data
  })
}

// 修改轮播图管理
export function updatePdBanner(data) {
  return request({
    url: '/banner/pdBanner',
    method: 'put',
    data: data
  })
}

// 删除轮播图管理
export function delPdBanner(id) {
  return request({
    url: '/banner/pdBanner/' + id,
    method: 'delete'
  })
}

// 导出轮播图管理
export function exportPdBanner(query) {
  return request({
    url: '/banner/pdBanner/export',
    method: 'get',
    params: query
  })
}
