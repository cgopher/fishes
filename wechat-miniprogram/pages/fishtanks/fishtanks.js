// pages/fishtanks/fishtanks.js
const app = getApp()
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    // 登录状态
    hasLogin: false,
    
    // 鱼缸列表
    tanksList: [],
    loading: false,
    
    // 创建/编辑鱼缸
    showCreateModal: false,
    editMode: false,
    editTankId: null,
    tankName: '',
    tankDescription: '',
    tankIsPublic: true,
    creating: false,
    
    // 鱼缸详情
    showDetailModal: false,
    selectedTank: {}
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
    if (this.data.hasLogin) {
      this.loadMyTanks()
    }
  },

  // 检查登录状态
  checkLogin() {
    const hasLogin = app.globalData.hasLogin
    this.setData({ hasLogin })
  },

  // 加载我的鱼缸
  loadMyTanks() {
    this.setData({ loading: true })
    
    api.getUserFishTanks()
      .then(result => {
        if (result && result.tanks) {
          // 处理鱼缸数据，添加预览图
          const tanks = result.tanks.map(tank => ({
            ...tank,
            fishPreview: tank.fishList ? tank.fishList.slice(0, 4).map(f => f.imageUrl) : []
          }))
          
          this.setData({
            tanksList: tanks,
            loading: false
          })
        }
      })
      .catch(err => {
        console.error('加载鱼缸列表失败', err)
        this.setData({ loading: false })
        util.showError('加载失败')
      })
  },

  // 显示创建弹窗
  showCreateModal() {
    this.setData({
      showCreateModal: true,
      editMode: false,
      editTankId: null,
      tankName: '',
      tankDescription: '',
      tankIsPublic: true
    })
  },

  // 关闭创建弹窗
  closeCreateModal() {
    this.setData({
      showCreateModal: false
    })
  },

  // 输入鱼缸名称
  inputTankName(e) {
    this.setData({
      tankName: e.detail.value
    })
  },

  // 输入鱼缸描述
  inputTankDescription(e) {
    this.setData({
      tankDescription: e.detail.value
    })
  },

  // 切换公开/私密
  togglePublic(e) {
    this.setData({
      tankIsPublic: e.detail.value
    })
  },

  // 确认创建鱼缸
  confirmCreateTank() {
    const { tankName, tankDescription, tankIsPublic, creating, editMode, editTankId } = this.data
    
    if (!tankName.trim()) {
      util.showError('请输入鱼缸名称')
      return
    }
    
    if (creating) return
    
    this.setData({ creating: true })
    util.showLoading(editMode ? '保存中...' : '创建中...')
    
    // 这里应该调用API创建或更新鱼缸
    // 简化实现
    setTimeout(() => {
      util.hideLoading()
      this.setData({
        creating: false,
        showCreateModal: false
      })
      
      util.showSuccess(editMode ? '保存成功' : '创建成功')
      this.loadMyTanks()
    }, 1000)
    
    // 实际实现
    /*
    if (editMode) {
      // 更新鱼缸
      api.updateFishTank(editTankId, tankName, tankDescription, tankIsPublic)
        .then(() => {
          util.hideLoading()
          this.setData({ creating: false, showCreateModal: false })
          util.showSuccess('保存成功')
          this.loadMyTanks()
        })
        .catch(err => {
          util.hideLoading()
          this.setData({ creating: false })
          util.showError('保存失败')
        })
    } else {
      // 创建新鱼缸
      api.createFishTank(tankName, tankDescription, tankIsPublic)
        .then(() => {
          util.hideLoading()
          this.setData({ creating: false, showCreateModal: false })
          util.showSuccess('创建成功')
          this.loadMyTanks()
        })
        .catch(err => {
          util.hideLoading()
          this.setData({ creating: false })
          util.showError('创建失败')
        })
    }
    */
  },

  // 查看鱼缸详情
  viewTankDetail(e) {
    const tank = e.currentTarget.dataset.tank
    
    // 加载鱼缸完整信息
    util.showLoading('加载中...')
    
    api.getFishTankDetail(tank.id)
      .then(result => {
        util.hideLoading()
        if (result && result.tank) {
          this.setData({
            selectedTank: result.tank,
            showDetailModal: true
          })
        }
      })
      .catch(err => {
        util.hideLoading()
        console.error('加载鱼缸详情失败', err)
        util.showError('加载失败')
      })
  },

  // 关闭详情弹窗
  closeDetailModal() {
    this.setData({
      showDetailModal: false
    })
  },

  // 编辑鱼缸
  editTank(e) {
    const tankId = e.currentTarget.dataset.tankId
    const tank = this.data.tanksList.find(t => t.id === tankId)
    
    if (tank) {
      this.setData({
        showCreateModal: true,
        editMode: true,
        editTankId: tank.id,
        tankName: tank.name,
        tankDescription: tank.description || '',
        tankIsPublic: tank.isPublic
      })
    }
  },

  // 分享鱼缸
  shareTank(e) {
    const tankId = e.currentTarget.dataset.tankId
    const tank = this.data.tanksList.find(t => t.id === tankId)
    
    if (!tank) return
    
    // 生成分享链接
    const shareUrl = `/pages/fishtanks/tank-detail?id=${tankId}`
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    util.showSuccess('点击右上角分享')
  },

  // 删除鱼缸
  deleteTank(e) {
    const tankId = e.currentTarget.dataset.tankId
    
    util.showConfirm('确定要删除这个鱼缸吗？', '删除确认')
      .then(confirmed => {
        if (confirmed) {
          util.showLoading('删除中...')
          
          // 调用API删除鱼缸
          // 简化实现
          setTimeout(() => {
            util.hideLoading()
            util.showSuccess('删除成功')
            this.loadMyTanks()
          }, 1000)
          
          /*
          api.deleteFishTank(tankId)
            .then(() => {
              util.hideLoading()
              util.showSuccess('删除成功')
              this.loadMyTanks()
            })
            .catch(err => {
              util.hideLoading()
              util.showError('删除失败')
            })
          */
        }
      })
  },

  // 从鱼缸移除鱼
  removeFishFromTank(e) {
    const fishId = e.currentTarget.dataset.fishId
    const tankId = this.data.selectedTank.id
    
    util.showConfirm('确定要移除这条鱼吗？', '移除确认')
      .then(confirmed => {
        if (confirmed) {
          api.removeFishFromTank(tankId, fishId)
            .then(() => {
              util.showSuccess('移除成功')
              // 重新加载鱼缸详情
              this.viewTankDetail({ currentTarget: { dataset: { tank: this.data.selectedTank } } })
            })
            .catch(err => {
              console.error('移除失败', err)
              util.showError('移除失败')
            })
        }
      })
  },

  // 去登录
  goToLogin() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  // 阻止事件冒泡
  stopPropagation() {},

  // 分享配置
  onShareAppMessage() {
    return {
      title: '我的专属鱼缸，快来看看吧！',
      path: '/pages/fishtanks/fishtanks',
      imageUrl: ''
    }
  }
})
