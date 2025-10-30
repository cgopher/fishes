# 画条鱼 - 微信小程序版

这是 DrawAFish.com 的微信小程序版本，一个有趣的画鱼互动社区应用。用户可以在画布上创作鱼的图画，并在社区鱼缸中展示，为其他人的作品投票，创建自己的专属鱼缸。

## 📱 功能特性

### 🎨 画鱼功能
- **Canvas画布绘图**：支持触摸绘画，多种颜色选择
- **绘图工具**：画笔、橡皮擦、撤销、清空、翻转等功能
- **画笔设置**：可调节画笔粗细（1-20）
- **AI识别**（简化版）：实时识别绘画是否为鱼
- **作品签名**：提交时可以签名自己的作品

### 🏊 社区鱼缸
- **鱼的展示**：网格和动画两种展示方式
- **筛选功能**：最新、最热、随机三种排序方式
- **鱼缸动画**：Canvas实现鱼在鱼缸中游动的效果
- **详情查看**：查看每条鱼的详细信息和艺术家

### 🗳️ 投票排名
- **卡片式投票**：左右滑动或点击按钮进行投票
- **排行榜**：查看最受欢迎的鱼作品
- **投票统计**：记录用户的投票数量

### 👤 个人中心
- **微信登录**：使用微信账号登录
- **个人资料**：管理用户名和头像
- **我的作品**：查看自己创作的所有鱼
- **统计数据**：鱼数量、获赞数、鱼缸数

### 🏺 自定义鱼缸
- **创建鱼缸**：自定义鱼缸名称和描述
- **公开/私密**：选择鱼缸的可见性
- **收藏管理**：将喜欢的鱼添加到自己的鱼缸
- **鱼缸分享**：分享鱼缸给好友

## 🗂️ 项目结构

```
wechat-miniprogram/
├── pages/                  # 页面目录
│   ├── index/             # 画鱼页面（首页）
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   ├── index.js
│   │   └── index.json
│   ├── tank/              # 鱼缸页面
│   │   ├── tank.wxml
│   │   ├── tank.wxss
│   │   ├── tank.js
│   │   └── tank.json
│   ├── rank/              # 排名投票页面
│   │   ├── rank.wxml
│   │   ├── rank.wxss
│   │   ├── rank.js
│   │   └── rank.json
│   ├── fishtanks/         # 我的鱼缸页面
│   │   ├── fishtanks.wxml
│   │   ├── fishtanks.wxss
│   │   ├── fishtanks.js
│   │   └── fishtanks.json
│   └── profile/           # 个人中心页面
│       ├── profile.wxml
│       ├── profile.wxss
│       ├── profile.js
│       └── profile.json
├── utils/                 # 工具模块
│   ├── api.js            # API请求封装
│   └── util.js           # 通用工具函数
├── images/               # 图片资源（需要添加）
│   ├── draw.png          # 画鱼图标
│   ├── draw-active.png
│   ├── tank.png          # 鱼缸图标
│   ├── tank-active.png
│   ├── rank.png          # 排名图标
│   ├── rank-active.png
│   ├── mytank.png        # 我的鱼缸图标
│   ├── mytank-active.png
│   ├── profile.png       # 个人中心图标
│   └── profile-active.png
├── app.js                # 小程序入口文件
├── app.json              # 小程序全局配置
├── app.wxss              # 全局样式
├── project.config.json   # 项目配置文件
└── README.md             # 项目说明文档
```

## 🚀 快速开始

### 1. 环境准备
- 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册微信小程序账号

### 2. 导入项目
1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `wechat-miniprogram` 目录
4. 填入你的小程序 AppID

### 3. 配置后端
修改 `app.js` 中的 `backendUrl`：
```javascript
globalData: {
  backendUrl: 'https://your-backend-url.com', // 修改为你的后端地址
}
```

### 4. 添加图标
在 `images/` 目录下添加所需的图标文件（tabBar图标）。
推荐尺寸：81px × 81px，支持 png、jpg、jpeg 格式。

### 5. 运行项目
点击"编译"按钮即可在开发者工具中预览。

## 🔧 配置说明

### app.json 主要配置

```json
{
  "pages": [...],          // 页面路径列表
  "window": {...},         // 全局窗口配置
  "tabBar": {...},         // 底部导航栏配置
  "permission": {...}      // 权限配置
}
```

### API 配置

在 `utils/api.js` 中配置后端接口：
- `uploadFish` - 上传鱼图片
- `getFishList` - 获取鱼列表
- `getRankings` - 获取排名
- `voteFish` - 投票
- `createFishTank` - 创建鱼缸
- 等等...

## 📝 开发说明

### Canvas 绘图
使用微信小程序的 Canvas API 实现绘图功能：
```javascript
const ctx = wx.createCanvasContext('drawCanvas')
ctx.setStrokeStyle('#000000')
ctx.setLineWidth(6)
ctx.beginPath()
ctx.moveTo(x, y)
ctx.lineTo(x2, y2)
ctx.stroke()
ctx.draw()
```

### 数据存储
使用微信小程序的本地存储：
```javascript
// 保存
wx.setStorageSync('key', 'value')

// 读取
wx.getStorageSync('key')
```

### 网络请求
封装在 `utils/api.js` 中：
```javascript
api.uploadFish(tempFilePath, artistName)
  .then(result => {
    // 处理成功
  })
  .catch(err => {
    // 处理错误
  })
```

## 🎨 UI 设计

### 配色方案
- 主色调：`#4A90E2`（蓝色）
- 渐变色：多种渐变效果
- 背景色：`#F5F5F5`（浅灰）

### 组件样式
- 圆角：`8rpx - 24rpx`
- 阴影：`box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1)`
- 按钮：多种样式（primary, secondary, success, danger）

## ⚠️ 注意事项

1. **AI识别功能**：当前为简化实现，实际项目中需要：
   - 使用小程序AI能力
   - 或调用后端API进行识别
   - 或使用第三方AI服务

2. **后端接口**：需要配合原项目的后端服务使用
   - 确保后端支持小程序环境
   - 配置正确的域名白名单

3. **图标资源**：需要自行准备 tabBar 图标
   - 普通状态和选中状态各一套
   - 建议使用 81px × 81px 的图片

4. **用户认证**：
   - 当前使用微信登录
   - 需要后端支持微信 openid 验证

5. **Canvas限制**：
   - 小程序 Canvas 性能有限
   - 复杂动画建议优化

## 🔗 相关链接

- [原Web版项目](https://drawafish.com)
- [后端项目](https://github.com/aldenhallak/fish-be)
- [AI模型训练](https://github.com/aldenhallak/fish-trainer)
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

## 📄 开源协议

本项目与原项目保持一致的开源协议。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请通过以下方式联系：
- GitHub Issues
- 项目作者邮箱

---

**Enjoy Drawing Fish! 🐟🎨**
