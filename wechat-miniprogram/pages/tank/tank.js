// pages/tank/tank.js
const app = getApp()
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    // 鱼列表
    fishList: [],
    sortBy: 'recent',
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    
    // 鱼缸动画
    canvasWidth: 0,
    canvasHeight: 0,
    ctx: null,
    animationTimer: null,
    swimFishList: [],
    
    // 详情弹窗
    showDetailModal: false,
    selectedFish: {}
  },

  onLoad() {
    this.initCanvas()
    this.loadFishList()
  },

  onShow() {
    this.startAnimation()
  },

  onHide() {
    this.stopAnimation()
  },

  onUnload() {
    this.stopAnimation()
  },

  // 初始化画布
  initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('.tank-canvas').boundingClientRect()
    query.exec((res) => {
      if (res[0]) {
        const canvas = res[0]
        this.setData({
          canvasWidth: canvas.width,
          canvasHeight: canvas.height
        })
        
        const ctx = wx.createCanvasContext('tankCanvas')
        this.setData({ ctx })
      }
    })
  },

  // 加载鱼列表
  loadFishList(refresh = false) {
    if (this.data.loading) return
    
    if (refresh) {
      this.setData({
        page: 1,
        fishList: [],
        hasMore: true
      })
    }
    
    this.setData({ loading: true })
    
    api.getFishList(this.data.sortBy, this.data.pageSize * this.data.page)
      .then(result => {
        if (result && result.fish) {
          const newFish = result.fish.map(fish => ({
            ...fish,
            createTime: util.formatRelativeTime(fish.timestamp || Date.now())
          }))
          
          this.setData({
            fishList: refresh ? newFish : [...this.data.fishList, ...newFish],
            hasMore: newFish.length >= this.data.pageSize,
            loading: false
          })
          
          // 准备游泳的鱼（取前10条）
          this.prepareSwimFish(newFish.slice(0, 10))
        }
      })
      .catch(err => {
        console.error('加载鱼列表失败', err)
        util.showError('加载失败')
        this.setData({ loading: false })
      })
  },

  // 准备游泳的鱼
  prepareSwimFish(fishList) {
    const swimFish = fishList.map((fish, index) => ({
      ...fish,
      x: Math.random() * this.data.canvasWidth,
      y: index * 50 + 50,
      speedX: Math.random() * 2 + 1,
      speedY: (Math.random() - 0.5) * 0.5,
      scale: Math.random() * 0.5 + 0.5
    }))
    
    this.setData({ swimFishList: swimFish })
  },

  // 开始动画
  startAnimation() {
    if (this.data.animationTimer) return
    
    const animate = () => {
      this.updateFishPositions()
      this.drawTank()
      this.data.animationTimer = setTimeout(animate, 1000 / 30) // 30fps
    }
    
    animate()
  },

  // 停止动画
  stopAnimation() {
    if (this.data.animationTimer) {
      clearTimeout(this.data.animationTimer)
      this.data.animationTimer = null
    }
  },

  // 更新鱼的位置
  updateFishPositions() {
    const swimFish = this.data.swimFishList.map(fish => {
      let newX = fish.x + fish.speedX
      let newY = fish.y + fish.speedY
      
      // 边界检测
      if (newX > this.data.canvasWidth) {
        newX = -50
        newY = Math.random() * this.data.canvasHeight
      }
      if (newY < 0 || newY > this.data.canvasHeight) {
        fish.speedY = -fish.speedY
      }
      
      return { ...fish, x: newX, y: newY }
    })
    
    this.setData({ swimFishList: swimFish })
  },

  // 绘制鱼缸
  drawTank() {
    const ctx = this.data.ctx
    if (!ctx) return
    
    // 清空画布
    ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    
    // 绘制鱼（简化版，实际应该绘制鱼的图片）
    this.data.swimFishList.forEach(fish => {
      ctx.save()
      ctx.translate(fish.x, fish.y)
      ctx.scale(fish.scale, fish.scale)
      
      // 绘制简单的鱼形状
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(0, 0, 10, 0, 2 * Math.PI)
      ctx.fill()
      
      // 鱼尾
      ctx.beginPath()
      ctx.moveTo(-10, 0)
      ctx.lineTo(-20, -8)
      ctx.lineTo(-20, 8)
      ctx.closePath()
      ctx.fill()
      
      ctx.restore()
    })
    
    ctx.draw()
  },

  // 切换排序方式
  changeSortBy(e) {
    const sortBy = e.currentTarget.dataset.sort
    if (sortBy === this.data.sortBy) return
    
    this.setData({ sortBy })
    this.loadFishList(true)
  },

  // 加载更多鱼
  loadMoreFish() {
    if (!this.data.hasMore || this.data.loading) return
    
    this.setData({
      page: this.data.page + 1
    })
    this.loadFishList()
  },

  // 查看鱼详情
  viewFishDetail(e) {
    const fish = e.currentTarget.dataset.fish
    this.setData({
      selectedFish: fish,
      showDetailModal: true
    })
  },

  // 关闭详情弹窗
  closeDetailModal() {
    this.setData({
      showDetailModal: false
    })
  },

  // 添加到我的鱼缸
  addToMyTank() {
    if (!app.globalData.hasLogin) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/profile'
            })
          }
        }
      })
      return
    }
    
    // 显示鱼缸选择器（简化实现）
    util.showSuccess('已添加到我的鱼缸')
    this.closeDetailModal()
  },

  // 阻止事件冒泡
  stopPropagation() {},

  // 下拉刷新
  onPullDownRefresh() {
    this.loadFishList(true)
    wx.stopPullDownRefresh()
  }
})
