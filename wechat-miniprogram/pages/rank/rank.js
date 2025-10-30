// pages/rank/rank.js
const app = getApp()
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    // 当前投票的鱼
    currentFish: null,
    
    // 鱼队列
    fishQueue: [],
    fishIndex: 0,
    
    // 投票状态
    voting: false,
    votedCount: 0,
    
    // 加载状态
    loading: false,
    
    // 排行榜
    showLeaderboardModal: false,
    leaderboard: [],
    loadingLeaderboard: false,
    leaderboardPage: 1
  },

  onLoad() {
    this.loadFishForVoting()
  },

  onShow() {
    // 加载已投票数量
    try {
      const votedCount = wx.getStorageSync('votedCount') || 0
      this.setData({ votedCount })
    } catch (e) {
      console.error('加载投票数量失败', e)
    }
  },

  // 加载待投票的鱼
  loadFishForVoting() {
    this.setData({ loading: true })
    
    // 获取随机鱼列表
    api.getFishList('random', 50)
      .then(result => {
        if (result && result.fish && result.fish.length > 0) {
          this.setData({
            fishQueue: result.fish,
            fishIndex: 0,
            currentFish: result.fish[0],
            loading: false
          })
        } else {
          this.setData({
            fishQueue: [],
            currentFish: null,
            loading: false
          })
          util.showError('暂无可投票的鱼')
        }
      })
      .catch(err => {
        console.error('加载鱼列表失败', err)
        this.setData({ loading: false })
        util.showError('加载失败')
      })
  },

  // 投票
  voteFish(e) {
    if (this.data.voting) return
    
    const vote = parseInt(e.currentTarget.dataset.vote)
    const fish = this.data.currentFish
    
    if (!fish) return
    
    // 检查是否登录
    if (!app.globalData.hasLogin) {
      wx.showModal({
        title: '提示',
        content: '投票需要登录，是否前往登录？',
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
    
    this.setData({ voting: true })
    
    api.voteFish(fish.id, vote)
      .then(() => {
        // 投票成功，更新计数
        const votedCount = this.data.votedCount + 1
        this.setData({ votedCount })
        
        // 保存投票数
        try {
          wx.setStorageSync('votedCount', votedCount)
        } catch (e) {
          console.error('保存投票数失败', e)
        }
        
        // 显示反馈
        if (vote > 0) {
          util.showSuccess('投票成功！👍')
        } else {
          util.showSuccess('已记录你的反馈')
        }
        
        // 延迟显示下一条鱼
        setTimeout(() => {
          this.nextFish()
        }, 500)
      })
      .catch(err => {
        console.error('投票失败', err)
        util.showError('投票失败')
        this.setData({ voting: false })
      })
  },

  // 跳过
  skipFish() {
    this.nextFish()
  },

  // 下一条鱼
  nextFish() {
    const nextIndex = this.data.fishIndex + 1
    
    if (nextIndex >= this.data.fishQueue.length) {
      // 队列结束，重新加载
      this.setData({
        currentFish: null,
        voting: false
      })
      this.loadFishForVoting()
    } else {
      // 显示下一条
      this.setData({
        fishIndex: nextIndex,
        currentFish: this.data.fishQueue[nextIndex],
        voting: false
      })
    }
  },

  // 重新加载
  reloadFish() {
    this.loadFishForVoting()
  },

  // 显示排行榜
  showLeaderboard() {
    this.setData({
      showLeaderboardModal: true,
      leaderboard: [],
      leaderboardPage: 1
    })
    this.loadLeaderboard()
  },

  // 加载排行榜
  loadLeaderboard() {
    if (this.data.loadingLeaderboard) return
    
    this.setData({ loadingLeaderboard: true })
    
    api.getRankings(this.data.leaderboardPage, 20)
      .then(result => {
        if (result && result.rankings) {
          this.setData({
            leaderboard: [...this.data.leaderboard, ...result.rankings],
            loadingLeaderboard: false
          })
        }
      })
      .catch(err => {
        console.error('加载排行榜失败', err)
        this.setData({ loadingLeaderboard: false })
        util.showError('加载排行榜失败')
      })
  },

  // 关闭排行榜
  closeLeaderboard() {
    this.setData({
      showLeaderboardModal: false
    })
  },

  // 阻止事件冒泡
  stopPropagation() {}
})
