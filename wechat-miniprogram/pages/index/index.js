// pages/index/index.js
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    // 颜色选项
    colors: ['#000000', '#ff0000', '#00cc00', '#0000ff', '#ffff00', '#ff8800', '#ffffff'],
    currentColor: '#000000',
    lineWidth: 6,
    isEraser: false,
    
    // 画布状态
    canvasWidth: 0,
    canvasHeight: 0,
    
    // 鱼验证
    fishProbability: null,
    isFish: true,
    
    // UI状态
    showWelcome: false,
    welcomeText: '',
    isSubmitting: false,
    
    // 撤销栈
    undoStack: [],
    maxUndoSteps: 20
  },

  canvasContext: null,
  isDrawing: false,
  lastPoint: null,

  onLoad() {
    // 初始化画布
    this.initCanvas()
    
    // 显示欢迎消息
    this.showWelcomeMessage()
    
    // 检查今天是否已画过鱼
    this.checkTodayFish()
  },

  /**
   * 初始化画布
   */
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
        
        // 创建画布上下文
        this.canvasContext = wx.createCanvasContext('drawCanvas')
        this.canvasContext.setStrokeStyle(this.data.currentColor)
        this.canvasContext.setLineWidth(this.data.lineWidth)
        this.canvasContext.setLineCap('round')
        this.canvasContext.setLineJoin('round')
      }
    })
  },

  /**
   * 显示欢迎消息
   */
  showWelcomeMessage() {
    const artistName = app.globalData.artistName
    const hasLogin = app.globalData.hasLogin
    
    if (artistName && artistName !== 'Anonymous' && !hasLogin) {
      this.setData({
        showWelcome: true,
        welcomeText: `欢迎回来，${artistName}！创建账号可以建立自定义鱼缸并与朋友分享。`
      })
    } else if (hasLogin && app.globalData.userInfo) {
      const displayName = app.globalData.userInfo.displayName || '艺术家'
      this.setData({
        showWelcome: true,
        welcomeText: `欢迎回来，${displayName}！🎨`
      })
    }
  },

  /**
   * 检查今天是否已画过鱼
   */
  checkTodayFish() {
    try {
      const lastFishDate = wx.getStorageSync('lastFishDate')
      const today = new Date().toDateString()
      
      if (lastFishDate === today) {
        wx.showModal({
          title: '提示',
          content: '你今天已经画过一条鱼了！',
          confirmText: '去看鱼缸',
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
      console.error('检查今日鱼失败', e)
    }
  },

  /**
   * 触摸开始
   */
  onTouchStart(e) {
    if (!this.canvasContext) return
    
    const touch = e.touches[0]
    this.isDrawing = true
    this.lastPoint = {
      x: touch.x,
      y: touch.y
    }
    
    // 保存当前状态到撤销栈
    this.saveToUndoStack()
    
    this.canvasContext.beginPath()
    this.canvasContext.moveTo(touch.x, touch.y)
  },

  /**
   * 触摸移动
   */
  onTouchMove(e) {
    if (!this.canvasContext || !this.isDrawing) return
    
    const touch = e.touches[0]
    
    if (this.data.isEraser) {
      // 橡皮擦模式
      this.canvasContext.clearRect(
        touch.x - this.data.lineWidth / 2,
        touch.y - this.data.lineWidth / 2,
        this.data.lineWidth,
        this.data.lineWidth
      )
    } else {
      // 绘画模式
      this.canvasContext.lineTo(touch.x, touch.y)
      this.canvasContext.stroke()
    }
    
    this.lastPoint = {
      x: touch.x,
      y: touch.y
    }
    
    this.canvasContext.draw(true)
  },

  /**
   * 触摸结束
   */
  onTouchEnd() {
    this.isDrawing = false
    this.lastPoint = null
    
    // 检查是否是鱼（这里需要集成AI模型，暂时简化处理）
    // this.checkIfFish()
  },

  /**
   * 选择颜色
   */
  selectColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({
      currentColor: color,
      isEraser: false
    })
    
    if (this.canvasContext) {
      this.canvasContext.setStrokeStyle(color)
    }
  },

  /**
   * 切换橡皮擦
   */
  toggleEraser() {
    this.setData({
      isEraser: !this.data.isEraser
    })
  },

  /**
   * 改变线宽
   */
  onLineWidthChange(e) {
    const lineWidth = e.detail.value
    this.setData({
      lineWidth: lineWidth
    })
    
    if (this.canvasContext) {
      this.canvasContext.setLineWidth(lineWidth)
    }
  },

  /**
   * 清空画布
   */
  clearCanvas() {
    util.showConfirm('确定要清空画布吗？').then((confirmed) => {
      if (confirmed && this.canvasContext) {
        this.saveToUndoStack()
        this.canvasContext.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.canvasContext.draw()
        this.setData({
          fishProbability: null,
          isFish: true
        })
      }
    })
  },

  /**
   * 撤销
   */
  undoCanvas() {
    // 简化的撤销功能
    util.showError('撤销功能开发中')
  },

  /**
   * 翻转画布
   */
  flipCanvas() {
    if (!this.canvasContext) return
    
    this.saveToUndoStack()
    
    // 微信小程序的Canvas翻转需要特殊处理
    wx.canvasToTempFilePath({
      canvasId: 'drawCanvas',
      success: (res) => {
        const tempPath = res.tempFilePath
        
        // 清空画布
        this.canvasContext.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        
        // 翻转并重绘
        this.canvasContext.save()
        this.canvasContext.scale(-1, 1)
        this.canvasContext.drawImage(tempPath, -this.data.canvasWidth, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.canvasContext.restore()
        this.canvasContext.draw()
        
        util.showSuccess('翻转成功')
      },
      fail: () => {
        util.showError('翻转失败')
      }
    })
  },

  /**
   * 保存到撤销栈
   */
  saveToUndoStack() {
    // 简化处理，实际需要保存画布状态
    // 微信小程序Canvas不能直接获取ImageData，需要转换
  },

  /**
   * 提交鱼
   */
  submitFish() {
    // 获取保存的艺术家名称
    const savedArtist = app.globalData.artistName || 'Anonymous'
    
    // 显示输入框让用户签名
    wx.showModal({
      title: this.data.isFish ? '太棒了！' : '鱼概率较低',
      content: this.data.isFish ? '给你的作品签名：' : '这可能不太像鱼，但你可以提交审核',
      editable: true,
      placeholderText: savedArtist,
      success: (res) => {
        if (res.confirm) {
          const artist = res.content || savedArtist
          app.setArtistName(artist)
          this.uploadFish(artist, !this.data.isFish)
        }
      }
    })
  },

  /**
   * 上传鱼
   */
  uploadFish(artist, needsModeration) {
    this.setData({ isSubmitting: true })
    
    // 将画布转换为临时文件
    wx.canvasToTempFilePath({
      canvasId: 'drawCanvas',
      success: (res) => {
        const tempFilePath = res.tempFilePath
        
        // 上传到服务器
        api.uploadFish(tempFilePath, artist, needsModeration)
          .then((result) => {
            this.setData({ isSubmitting: false })
            
            if (result && result.data && result.data.Image) {
              // 保存用户ID
              if (result.data.userId) {
                app.setUserId(result.data.userId)
              }
              
              // 保存今天的日期
              const today = new Date().toDateString()
              wx.setStorageSync('lastFishDate', today)
              
              // 显示成功消息
              if (needsModeration) {
                wx.showModal({
                  title: '已提交审核',
                  content: '你的鱼已提交，通过审核后会出现在鱼缸中',
                  showCancel: false,
                  success: () => {
                    wx.switchTab({
                      url: '/pages/tank/tank'
                    })
                  }
                })
              } else {
                util.showSuccess('提交成功！')
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/tank/tank'
                  })
                }, 1500)
              }
            } else {
              util.showError('上传失败，请重试')
            }
          })
          .catch((err) => {
            this.setData({ isSubmitting: false })
            console.error('上传失败', err)
            util.showError('上传失败：' + err.message)
          })
      },
      fail: () => {
        this.setData({ isSubmitting: false })
        util.showError('生成图片失败')
      }
    })
  },

  /**
   * 检查是否是鱼（AI模型集成）
   * 注意：ONNX模型在小程序中需要特殊处理或使用云函数
   */
  checkIfFish() {
    // TODO: 集成AI模型验证
    // 由于微信小程序对ONNX支持有限，建议：
    // 1. 使用云函数调用Python后端进行AI验证
    // 2. 或使用腾讯云的AI服务
    // 3. 或将模型转换为TensorFlow Lite并使用插件
    
    // 暂时使用模拟数据
    const mockProbability = Math.random() * 100
    const isFish = mockProbability >= 60
    
    this.setData({
      fishProbability: mockProbability.toFixed(1),
      isFish: isFish
    })
  }
})
