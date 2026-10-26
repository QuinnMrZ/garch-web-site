# GARCH 网站（亘荣 · Grown Architects + Partners）

四页静态网站，无外部依赖，可直接整体上传到任意服务器 / 静态托管。

## 页面

| 文件 | 说明 |
| --- | --- |
| `index.html` | 首页（原 homepage.html 已更名，导航均已指向 index.html） |
| `projects.html` | 项目作品：按 `images/` 下子目录生成 5 个相册瀑布流（星级酒店/高端商业/精品住宅/城市设计/投标方案），点击图片弹出大图，可左右翻页浏览整个相册 |
| `generative-design.html` | 生成式设计：自动展示 `AIGC/` 目录下的全部图片 |
| `office.html` | 团队与联系：使用 `people/` 与 `people-crops/` 中图片，团队成员文字取自图片卡片原文；含邮箱/电话/地址 |

## 数据与维护

- `site-data.js`：由 `gen-site-data.js` 自动生成（请勿手改）。
  当 `images/`、`AIGC/`、`people/` 目录中增删图片后，在本目录运行 `node gen-site-data.js` 重新生成即可。
- `shared-components.js`：全站共用脚本，提供：
  - 搜索（右上角放大镜）：可搜文章 / 相册 / 页面 / 图片，点击结果跳转或打开大图；
  - 灯箱大图：点击弹出，← → 键或按钮翻页，滚轮缩放，双击放大/还原；
  - 联系弹窗（右上角电话图标）：邮箱 qingzhang55155@gmail.com、电话 +86 18801860726、地址 中国上海市崇明区三星镇北星公路1999号，可复制邮箱、留言（调用邮件客户端发送）。

## 相册直达链接

`projects.html?album=<目录名>`，例如 `projects.html?album=hotels` 会打开"星级酒店"相册大图。

## 在线地址

- 正式域名：https://gro-architect.com （Cloudflare DNS → GitHub Pages）
- GitHub Pages：https://quinnmrz.github.io/garch-web-site/

## 📖 日常维护指南（速查）

### ① 增删 / 更换项目图片（最常用）

1. 把图片放进对应相册文件夹（`images/` 下）：
   | 文件夹 | 相册 |
   | --- | --- |
   | `images/hotels` | 星级酒店 |
   | `images/commercial` | 高端商业 |
   | `images/residential` | 精品住宅 |
   | `images/urbanism` | 城市设计 |
   | `images/biddings` | 投标方案 |
   | `AIGC/` | 生成式设计页 |
   | `people/`、`people-crops/` | 团队照片 |
2. 在本目录运行：`node gen-site-data.js`（重新生成相册数据）
3. 提交推送：`git add -A && git commit -m "更新图片" && git push`
4. 1~2 分钟后 https://gro-architect.com 自动更新

### ② 新增一个相册

1. 在 `images/` 下新建文件夹（如 `landscapes`），放入图片
2. 打开 `gen-site-data.js`，在 `LABELS = {...}` 里加一行：`landscapes: '园林景观',`
3. `node gen-site-data.js` → 提交推送

### ③ 修改文字 / 团队介绍 / 联系方式

直接编辑对应的 `.html` 文件（推荐用记事本或 VS Code），保存后提交推送即可。

### ④ 图片建议

- 格式：**webp** 优先（更小更快），png/jpg 也可
- 尺寸：长边 1600~2000 像素足够网页用，单张尽量控制在 500KB 内（可用 ACDSee 批量压缩）
- 命名：`图片 N.webp` 保持数字排序即可按顺序展示

### ⚠️ 注意

- `site-data.js` 是自动生成的，**不要手改**，改图片后重新生成就行
- 根目录的 `CNAME` 文件**不要删除**（它把域名绑定在 gro-architect.com）
- 改完可先双击 `index.html` 本地预览，再推送
