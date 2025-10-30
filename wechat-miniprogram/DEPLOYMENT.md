# 部署指南

本文档提供微信小程序的详细部署步骤。

## 📋 前提条件

1. **微信小程序账号**
   - 访问 [微信公众平台](https://mp.weixin.qq.com/)
   - 注册小程序账号
   - 获取 AppID

2. **微信开发者工具**
   - 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
   - 使用微信扫码登录

3. **后端服务**
   - 部署原项目的后端服务（fish-be）
   - 确保后端API可访问
   - 配置HTTPS（小程序要求）

## 🚀 部署步骤

### 1. 配置项目

#### 1.1 修改 AppID
编辑 `project.config.json`：
```json
{
  "appid": "wxYOUR_APPID_HERE"
}
```

#### 1.2 配置后端地址
编辑 `app.js`：
```javascript
globalData: {
  backendUrl: 'https://your-api-domain.com'
}
```

#### 1.3 准备图标资源
在 `images/` 目录下添加以下图标（81px × 81px）：
- `draw.png` / `draw-active.png`
- `tank.png` / `tank-active.png`
- `rank.png` / `rank-active.png`
- `mytank.png` / `mytank-active.png`
- `profile.png` / `profile-active.png`

### 2. 配置服务器域名

在微信公众平台后台配置合法域名：

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" → "开发管理" → "开发设置"
3. 找到"服务器域名"，配置：
   - **request合法域名**：`https://your-api-domain.com`
   - **uploadFile合法域名**：`https://your-api-domain.com`
   - **downloadFile合法域名**：`https://your-cdn-domain.com`（如果有）

**注意**：
- 域名必须是HTTPS
- 域名必须备案
- 每月最多修改5次

### 3. 本地开发调试

1. **打开项目**
   - 启动微信开发者工具
   - 导入 `wechat-miniprogram` 目录
   - 输入你的 AppID

2. **开启调试模式**
   - 点击右上角"详情"
   - 勾选"不校验合法域名"（仅开发时）
   - 勾选"不校验TLS版本"（仅开发时）

3. **测试功能**
   - 测试画鱼功能
   - 测试图片上传
   - 测试API请求
   - 测试用户登录

### 4. 上传代码

1. **编译项目**
   - 点击工具栏"编译"
   - 检查编译错误
   - 确认无报错

2. **上传代码**
   - 点击工具栏"上传"
   - 填写版本号（如：1.0.0）
   - 填写项目备注
   - 点击"上传"

### 5. 提交审核

1. **登录管理后台**
   - 访问 [微信公众平台](https://mp.weixin.qq.com/)
   - 进入"管理" → "版本管理"

2. **提交审核**
   - 找到刚上传的版本
   - 点击"提交审核"
   - 填写审核信息：
     - 功能页面：列出所有主要页面
     - 测试账号：提供测试用微信号
     - 配置信息：服务类目等

3. **等待审核**
   - 审核通常需要1-7个工作日
   - 可在后台查看审核进度
   - 审核未通过会收到通知

### 6. 发布上线

1. **审核通过后**
   - 进入"版本管理"
   - 点击"发布"按钮
   - 确认发布

2. **版本回退**
   - 如需回退，点击"回退"
   - 选择要回退的版本

## 🔧 进阶配置

### 配置小程序信息

1. **基本信息**
   - 小程序名称
   - 小程序头像
   - 小程序介绍
   - 服务类目

2. **功能设置**
   - 用户隐私保护指引
   - 权限申请说明

### 配置体验版

1. **添加体验成员**
   - 进入"管理" → "成员管理"
   - 添加体验者微信号
   - 体验者扫码即可体验

2. **生成体验版二维码**
   - 开发者工具中点击"预览"
   - 扫码在手机上体验

### 配置分包加载（可选）

如果小程序体积较大，可以配置分包：

```json
{
  "pages": [...],
  "subpackages": [
    {
      "root": "subpages/",
      "pages": [...]
    }
  ]
}
```

## 📊 监控与优化

### 1. 性能监控
- 在管理后台查看"运维中心"
- 关注启动耗时、内存使用
- 优化慢查询接口

### 2. 用户反馈
- 查看"客服消息"
- 处理用户反馈
- 及时修复bug

### 3. 数据分析
- 查看"数据分析"
- 分析用户行为
- 优化用户体验

## ⚠️ 常见问题

### 1. 域名校验失败
- **问题**：request:fail url not in domain list
- **解决**：在后台配置合法域名

### 2. 上传图片失败
- **问题**：uploadFile fail
- **解决**：
  - 检查后端接口是否正常
  - 检查域名配置
  - 检查图片大小限制

### 3. Canvas 不显示
- **问题**：Canvas绘制后不显示
- **解决**：
  - 检查 canvas-id 是否正确
  - 调用 ctx.draw() 方法
  - 检查Canvas尺寸设置

### 4. 用户登录失败
- **问题**：wx.login 或 getUserProfile 失败
- **解决**：
  - 检查AppID配置
  - 检查后端登录接口
  - 查看控制台错误信息

### 5. 审核被拒
- **常见原因**：
  - 功能与类目不符
  - 缺少必要资质
  - 用户隐私保护不到位
- **解决**：根据审核反馈修改

## 📞 技术支持

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信开放社区](https://developers.weixin.qq.com/community/develop/mixflow)
- [常见问题FAQ](https://developers.weixin.qq.com/community/develop/mixflow)

## 🔄 更新流程

1. **开发新功能**
   - 在本地开发
   - 充分测试

2. **更新版本**
   - 修改版本号
   - 上传新代码
   - 提交审核

3. **灰度发布**（可选）
   - 选择部分用户先体验
   - 确认无问题后全量发布

---

**祝部署顺利！🎉**
