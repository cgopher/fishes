// app.js
App({
  globalData: {
    userInfo: null,
    userId: null,
    artistName: 'Anonymous',
    userToken: null,
    // 后端API地址 - 请根据实际部署修改
    backendUrl: 'https://your-backend-url.com',
    // 是否已登录
    hasLogin: false
  },

  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log('微信登录成功', res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    // 初始化用户数据
    this.initUserData()
  },

  // 初始化用户数据
  initUserData() {
    try {
      const userId = wx.getStorageSync('userId')
      const artistName = wx.getStorageSync('artistName')
      const userToken = wx.getStorageSync('userToken')
      const userData = wx.getStorageSync('userData')

      if (userId) {
        this.globalData.userId = userId
      }
      if (artistName) {
        this.globalData.artistName = artistName
      }
      if (userToken) {
        this.globalData.userToken = userToken
        this.globalData.hasLogin = true
      }
      if (userData) {
        this.globalData.userInfo = JSON.parse(userData)
      }
    } catch (e) {
      console.error('初始化用户数据失败', e)
    }
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    try {
      wx.setStorageSync('userData', JSON.stringify(userInfo))
    } catch (e) {
      console.error('保存用户信息失败', e)
    }
  },

  // 设置用户ID
  setUserId(userId) {
    this.globalData.userId = userId
    try {
      wx.setStorageSync('userId', userId)
    } catch (e) {
      console.error('保存用户ID失败', e)
    }
  },

  // 设置艺术家名称
  setArtistName(name) {
    this.globalData.artistName = name
    try {
      wx.setStorageSync('artistName', name)
    } catch (e) {
      console.error('保存艺术家名称失败', e)
    }
  },

  // 设置登录token
  setUserToken(token) {
    this.globalData.userToken = token
    this.globalData.hasLogin = true
    try {
      wx.setStorageSync('userToken', token)
    } catch (e) {
      console.error('保存用户token失败', e)
    }
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null
    this.globalData.userToken = null
    this.globalData.hasLogin = false
    try {
      wx.removeStorageSync('userToken')
      wx.removeStorageSync('userData')
    } catch (e) {
      console.error('退出登录失败', e)
    }
  }
})
