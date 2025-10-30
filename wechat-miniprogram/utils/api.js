// utils/api.js - API请求封装
const app = getApp()

/**
 * 发起HTTP请求
 */
function request(url, method = 'GET', data = {}, auth = false) {
  return new Promise((resolve, reject) => {
    const header = {
      'content-type': 'application/json'
    }

    // 如果需要认证，添加token
    if (auth && app.globalData.userToken) {
      header['Authorization'] = `Bearer ${app.globalData.userToken}`
    }

    wx.request({
      url: `${app.globalData.backendUrl}${url}`,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 上传鱼的图片
 */
function uploadFish(tempFilePath, artist, needsModeration = false) {
  return new Promise((resolve, reject) => {
    const userId = app.globalData.userId || ''
    const header = {}

    // 如果有token，添加认证
    if (app.globalData.userToken) {
      header['Authorization'] = `Bearer ${app.globalData.userToken}`
    }

    wx.uploadFile({
      url: `${app.globalData.backendUrl}/uploadfish`,
      filePath: tempFilePath,
      name: 'image',
      formData: {
        artist: artist,
        needsModeration: needsModeration.toString(),
        userId: userId
      },
      header: header,
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          resolve(data)
        } catch (e) {
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 获取鱼缸中的鱼
 */
function getFishList(sortBy = 'recent', limit = 50) {
  return request(`/fish?sortBy=${sortBy}&limit=${limit}`, 'GET')
}

/**
 * 获取排名列表
 */
function getRankings(page = 1, pageSize = 20) {
  return request(`/rankings?page=${page}&pageSize=${pageSize}`, 'GET')
}

/**
 * 投票给某条鱼
 */
function voteFish(fishId, vote) {
  return request('/vote', 'POST', { fishId, vote }, true)
}

/**
 * 获取用户信息
 */
function getUserInfo(userId) {
  return request(`/user/${userId}`, 'GET')
}

/**
 * 获取用户的鱼
 */
function getUserFish(userId) {
  return request(`/user/${userId}/fish`, 'GET')
}

/**
 * 创建自定义鱼缸
 */
function createFishTank(name, description, isPublic = true) {
  return request('/fishtank', 'POST', { name, description, isPublic }, true)
}

/**
 * 获取用户的鱼缸列表
 */
function getUserFishTanks() {
  return request('/fishtanks', 'GET', {}, true)
}

/**
 * 添加鱼到鱼缸
 */
function addFishToTank(tankId, fishId) {
  return request(`/fishtank/${tankId}/fish`, 'POST', { fishId }, true)
}

/**
 * 从鱼缸移除鱼
 */
function removeFishFromTank(tankId, fishId) {
  return request(`/fishtank/${tankId}/fish/${fishId}`, 'DELETE', {}, true)
}

/**
 * 获取鱼缸详情
 */
function getFishTankDetail(tankId) {
  return request(`/fishtank/${tankId}`, 'GET')
}

module.exports = {
  request,
  uploadFish,
  getFishList,
  getRankings,
  voteFish,
  getUserInfo,
  getUserFish,
  createFishTank,
  getUserFishTanks,
  addFishToTank,
  removeFishFromTank,
  getFishTankDetail
}
