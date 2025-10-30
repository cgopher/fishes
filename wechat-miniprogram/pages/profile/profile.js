// pages/profile/profile.js
const app = getApp()
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    // 用户信息
    userInfo: {},
    artistName: 'Anonymous',
    userId: '',
    hasLogin: false,
    
    // 统计数据
    stats: {
      fishCount: 0,
      totalVotes: 0,
      tankCount: 0
    },
    
    // 我的鱼
    showMyFish: false,
    myFishList: [],
    
    // 编辑资料
    showEditModal: false,
    editArtistName: ''
  },

  onLoad() {
    this.loadUserData()
  },

  onShow() {
    this.loadUserData()
    if (this.data.hasLogin) {
      this.loadUserStats()
      this.loadMyFish()
    }
  },

  // 加载用户数据
  loadUserData() {
    const userInfo = app.globalData.userInfo
    const artistName = app.globalData.artistName
    const userId = app.globalData.userId
    const hasLogin = app.globalData.hasLogin
    
    this.setData({
      userInfo: userInfo || {},
      artistName: artistName || 'Anonymous',
      userId: userId || '',
      hasLogin: hasLogin
    })
  },

  // 微信登录
  login() {
    util.showLoading('登录中...')
    
    // 获取微信用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功', res.userInfo)
        
        // 保存用户信息到全局
        app.setUserInfo(res.userInfo)
        app.setArtistName(res.userInfo.nickName)
        
        // 模拟登录成功（实际应该调用后端API）
        // 这里简化处理，直接设置登录状态
        const mockToken = 'mock_token_' + Date.now()
        app.setUserToken(mockToken)
        
        util.hideLoading()
        util.showSuccess('登录成功')
        
        // 刷新页面数据
        this.loadUserData()
        this.loadUserStats()
      },
      fail: (err) => {
        util.hideLoading()
        console.error('获取用户信息失败', err)
        util.showError('登录取消')
      }
    })
  },

  // 加载用户统计
  loadUserStats() {
    if (!this.data.userId) return
    
    api.getUserInfo(this.data.userId)
      .then(result => {
        if (result && result.stats) {
          this.setData({
            stats: result.stats
          })
        }
      })
      .catch(err => {
        console.error('加载用户统计失败', err)
      })
  },

  // 加载我的鱼
  loadMyFish() {
    if (!this.data.userId) return
    
    api.getUserFish(this.data.userId)
      .then(result => {
        if (result && result.fish) {
          const fishList = result.fish.map(fish => ({
            ...fish,
            createTime: util.formatRelativeTime(fish.timestamp || Date.now())
          }))
          
          this.setData({
            myFishList: fishList
          })
        }
      })
      .catch(err => {
        console.error('加载我的鱼失败', err)
      })
  },

  // 查看我的鱼
  viewMyFish() {
    if (!this.data.hasLogin) {
      util.showError('请先登录')
      return
    }
    
    this.setData({
      showMyFish: !this.data.showMyFish
    })
    
    if (this.data.showMyFish && this.data.myFishList.length === 0) {
      this.loadMyFish()
    }
  },

  // 查看鱼详情
  viewFishDetail(e) {
    const fish = e.currentTarget.dataset.fish
    // 这里可以跳转到详情页或显示弹窗
    wx.showModal({
      title: '鱼详情',
      content: `创建时间: ${fish.createTime}\n获赞数: ${fish.votes || 0}`,
      showCancel: false
    })
  },

  // 去我的鱼缸
  goToMyTanks() {
    wx.switchTab({
      url: '/pages/fishtanks/fishtanks'
    })
  },

  // 编辑资料
  editProfile() {
    this.setData({
      showEditModal: true,
      editArtistName: this.data.artistName
    })
  },

  // 输入编辑名称
  inputEditName(e) {
    this.setData({
      editArtistName: e.detail.value
    })
  },

  // 保存资料
  saveProfile() {
    const newName = this.data.editArtistName.trim()
    
    if (!newName) {
      util.showError('名称不能为空')
      return
    }
    
    // 保存到全局和本地
    app.setArtistName(newName)
    
    this.setData({
      artistName: newName,
      showEditModal: false
    })
    
    util.showSuccess('保存成功')
  },

  // 关闭编辑弹窗
  closeEditModal() {
    this.setData({
      showEditModal: false
    })
  },

  // 显示设置
  showSettings() {
    wx.showModal({
      title: '设置',
      content: '设置功能开发中...',
      showCancel: false
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          this.setData({
            hasLogin: false,
            userInfo: {},
            stats: {
              fishCount: 0,
              totalVotes: 0,
              tankCount: 0
            },
            myFishList: []
          })
          util.showSuccess('已退出登录')
        }
      }
    })
  },

  // 阻止事件冒泡
  stopPropagation() {}
})
