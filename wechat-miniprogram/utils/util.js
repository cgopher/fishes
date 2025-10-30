// utils/util.js - 通用工具函数

/**
 * 格式化时间
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 相对时间显示
 */
const formatRelativeTime = timestamp => {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * 显示加载提示
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title: title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示成功提示
 */
const showSuccess = (title = '操作成功') => {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: 2000
  })
}

/**
 * 显示错误提示
 */
const showError = (title = '操作失败') => {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 显示确认对话框
 */
const showConfirm = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        if (res.confirm) {
          resolve(true)
        } else {
          resolve(false)
        }
      }
    })
  })
}

/**
 * 防抖函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
const throttle = (fn, delay = 300) => {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * HTML转义
 */
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * 裁剪Canvas内容
 */
const cropCanvasToContent = (canvas, ctx) => {
  return new Promise((resolve) => {
    wx.canvasGetImageData({
      canvasId: canvas,
      x: 0,
      y: 0,
      width: ctx.width,
      height: ctx.height,
      success: (res) => {
        const imgData = res.data
        const w = ctx.width
        const h = ctx.height
        let minX = w, minY = h, maxX = 0, maxY = 0
        let found = false

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4
            const r = imgData[i]
            const g = imgData[i + 1]
            const b = imgData[i + 2]
            const a = imgData[i + 3]
            
            // 非透明且非白色
            if (a > 16 && !(r > 240 && g > 240 && b > 240)) {
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y
              found = true
            }
          }
        }

        if (!found) {
          resolve(null)
          return
        }

        resolve({
          x: minX,
          y: minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1
        })
      }
    })
  })
}

/**
 * 检查是否是今天
 */
const isToday = (timestamp) => {
  const date = new Date(timestamp)
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

module.exports = {
  formatTime,
  formatRelativeTime,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  debounce,
  throttle,
  escapeHtml,
  cropCanvasToContent,
  isToday
}
