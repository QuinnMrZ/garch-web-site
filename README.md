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
