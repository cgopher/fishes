// pages/index/index.js
const app = getApp()
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    // 画布相关
    canvasWidth: 0,
    canvasHeight: 0,
    ctx: null,
    
    // 绘图状态
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    
    // 画笔设置
    colors: ['#000000', '#ff0000', '#00cc00', '#0000ff', '#ffff00', '#ff8800', '#ffffff'],
    currentColor: '#000000',
    lineWidth: 6,
    isEraser: false,
    
    // 撤销功能
    undoStack: [],
    maxUndoSteps: 30,
    
    // 鱼的识别
    showProbability: false,
    fishProbability: 0,
    probabilityColor: '#c0392b',
    canvasBgClass: '',
    isFish: false,
    
    // 提交相关
    showModal: false,
    modalTitle: '',
    modalMessage: '',
    modalTitleColor: '#333',
    artistName: 'Anonymous',
    submitting: false,
    
    // 欢迎消息
    showWelcome: false,
    welcomeText: ''
  },

  onLoad() {
    // 初始化画布
    this.initCanvas()
    
    // 加载用户信息
    this.loadUserInfo()
    
    // 检查是否今天已经画过鱼
    this.checkTodayDrawing()
  },

  // 初始化画布
  initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('.draw-canvas').boundingClientRect()
    query.exec((res) => {
      if (res[0]) {
        const canvas = res[0]
        this.setData({
          canvasWidth: canvas.width,
          canvasHeight: canvas.height
        })
        
        const ctx = wx.createCanvasContext('drawCanvas')
        ctx.setStrokeStyle(this.data.currentColor)
        ctx.setLineWidth(this.data.lineWidth)
        ctx.setLineCap('round')
        ctx.setLineJoin('round')
        this.setData({ ctx })
      }
    })
  },

  // 加载用户信息
  loadUserInfo() {
    const artistName = app.globalData.artistName
    if (artistName && artistName !== 'Anonymous') {
      this.setData({ 
        artistName,
        showWelcome: true,
        welcomeText: `欢迎回来，${artistName}！`
      })
    }
  },

  // 检查今天是否已画过鱼
  checkTodayDrawing() {
    try {
      const lastFishDate = wx.getStorageSync('lastFishDate')
      const today = new Date().toDateString()
      
      if (lastFishDate === today) {
        wx.showModal({
          title: '提示',
          content: '你今天已经画过鱼了！',
          confirmText: '去鱼缸看看',
          cancelText: '再画一条',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({
                url: '/pages/tank/tank'
              })
            }
          }
        })
      }
    } catch (e) {
      console.error('检查绘画记录失败', e)
    }
  },

  // 触摸开始
  touchStart(e) {
    const touch = e.touches[0]
    const x = touch.x
    const y = touch.y
    
    // 保存当前状态用于撤销
    this.saveCanvasState()
    
    this.setData({
      isDrawing: true,
      lastX: x,
      lastY: y
    })
    
    const ctx = this.data.ctx
    ctx.setStrokeStyle(this.data.isEraser ? '#ffffff' : this.data.currentColor)
    ctx.setLineWidth(this.data.lineWidth)
    ctx.beginPath()
    ctx.moveTo(x, y)
  },

  // 触摸移动
  touchMove(e) {
    if (!this.data.isDrawing) return
    
    const touch = e.touches[0]
    const x = touch.x
    const y = touch.y
    
    const ctx = this.data.ctx
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.draw(true)
    
    this.setData({
      lastX: x,
      lastY: y
    })
  },

  // 触摸结束
  touchEnd() {
    this.setData({
      isDrawing: false
    })
    
    // 检查是否是鱼（简化版，实际需要AI模型）
    this.checkIfFish()
  },

  // 触摸取消
  touchCancel() {
    this.setData({
      isDrawing: false
    })
  },

  // 选择颜色
  selectColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({
      currentColor: color,
      isEraser: false
    })
  },

  // 切换橡皮擦
  toggleEraser() {
    this.setData({
      isEraser: !this.data.isEraser
    })
  },

  // 改变画笔粗细
  changeLineWidth(e) {
    this.setData({
      lineWidth: e.detail.value
    })
  },

  // 清空画布
  clearCanvas() {
    wx.showModal({
      title: '确认',
      content: '确定要清空画布吗？',
      success: (res) => {
        if (res.confirm) {
          const ctx = this.data.ctx
          ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
          ctx.draw()
          
          this.setData({
            undoStack: [],
            showProbability: false,
            canvasBgClass: '',
            isFish: false
          })
        }
      }
    })
  },

  // 撤销
  undoCanvas() {
    const stack = this.data.undoStack
    if (stack.length > 0) {
      const lastState = stack.pop()
      this.setData({ undoStack: stack })
      
      // 恢复上一个状态（简化实现）
      // 实际需要保存和恢复imageData
      const ctx = this.data.ctx
      ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
      ctx.draw()
    } else {
      util.showError('没有可撤销的操作')
    }
  },

  // 翻转画布
  flipCanvas() {
    wx.canvasToTempFilePath({
      canvasId: 'drawCanvas',
      success: (res) => {
        const ctx = this.data.ctx
        ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        ctx.save()
        ctx.translate(this.data.canvasWidth, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(res.tempFilePath, 0, 0, this.data.canvasWidth, this.data.canvasHeight)
        ctx.restore()
        ctx.draw()
      }
    })
  },

  // 保存画布状态
  saveCanvasState() {
    // 简化实现，实际应该保存imageData
    const stack = this.data.undoStack
    if (stack.length >= this.data.maxUndoSteps) {
      stack.shift()
    }
    stack.push(Date.now())
    this.setData({ undoStack: stack })
  },

  // 检查是否是鱼（简化版）
  checkIfFish() {
    // 这里应该调用AI模型进行识别
    // 由于小程序环境限制，简化处理
    // 实际应该使用小程序的AI能力或调用后端API
    
    // 模拟识别结果
    const probability = Math.random() * 100
    const isFish = probability >= 60
    
    this.setData({
      showProbability: true,
      fishProbability: probability.toFixed(1),
      probabilityColor: isFish ? '#218838' : '#c0392b',
      canvasBgClass: isFish ? 'valid-fish' : 'invalid-fish',
      isFish: isFish
    })
  },

  // 提交鱼
  submitFish() {
    // 显示提交对话框
    const isFish = this.data.isFish
    
    this.setData({
      showModal: true,
      modalTitle: isFish ? '很棒的鱼！' : '鱼的评分较低',
      modalMessage: isFish ? '签名你的作品' : '这看起来不太像鱼，但你仍然可以提交审核',
      modalTitleColor: isFish ? '#27ae60' : '#ff6b35'
    })
  },

  // 确认提交
  confirmSubmit() {
    if (this.data.submitting) return
    
    const artistName = this.data.artistName.trim() || 'Anonymous'
    
    // 保存艺术家名称
    app.setArtistName(artistName)
    
    this.setData({ submitting: true })
    util.showLoading('上传中...')
    
    // 将画布转为临时文件
    wx.canvasToTempFilePath({
      canvasId: 'drawCanvas',
      success: (res) => {
        // 上传鱼的图片
        api.uploadFish(res.tempFilePath, artistName, !this.data.isFish)
          .then(result => {
            util.hideLoading()
            
            if (result && result.data) {
              // 保存userId
              if (result.data.userId) {
                app.setUserId(result.data.userId)
              }
              
              // 保存今天的日期
              const today = new Date().toDateString()
              wx.setStorageSync('lastFishDate', today)
              
              // 显示成功消息
              if (this.data.isFish) {
                util.showSuccess('提交成功！')
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/tank/tank'
                  })
                }, 1500)
              } else {
                wx.showModal({
                  title: '提交成功',
                  content: '你的鱼已提交审核，通过后将出现在鱼缸中',
                  confirmText: '查看鱼缸',
                  success: (res) => {
                    if (res.confirm) {
                      wx.switchTab({
                        url: '/pages/tank/tank'
                      })
                    }
                  }
                })
              }
            } else {
              util.showError('上传失败，请重试')
            }
          })
          .catch(err => {
            util.hideLoading()
            console.error('上传失败', err)
            util.showError('上传失败: ' + err.message)
          })
          .finally(() => {
            this.setData({ 
              submitting: false,
              showModal: false
            })
          })
      },
      fail: (err) => {
        util.hideLoading()
        this.setData({ submitting: false })
        console.error('生成图片失败', err)
        util.showError('生成图片失败')
      }
    })
  },

  // 输入艺术家名称
  inputArtistName(e) {
    this.setData({
      artistName: e.detail.value
    })
  },

  // 关闭模态框
  closeModal() {
    this.setData({
      showModal: false
    })
  },

  // 阻止事件冒泡
  stopPropagation() {},

  // 去鱼缸
  goToTank() {
    wx.switchTab({
      url: '/pages/tank/tank'
    })
  }
})
