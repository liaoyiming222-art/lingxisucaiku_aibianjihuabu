# 造物集作品集素材 · 灵犀

产品 ID：`lingxi-ai-editor`。仓库： https://github.com/liaoyiming222-art/lingxisucaiku_aibianjihuabu 。真实界面代码版本：`e324a46481e588b41da9954698fc9c3f53f39c9c`。

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| icon.svg | 256×256 viewBox | 可缩放产品图标 |
| icon-512.png | 512×512 | 位图图标 |
| hero.webp | 1920×1200 | 首页展台 |
| card.webp | 1200×900 | 作品卡片 |
| mobile.webp | 900×1200 | 窄屏作品介绍，非移动产品界面 |
| detail-01.webp | 1920×1200 | 材质参考库交互特写 |

## 设计与来源

沿用实际代码中的深色工作台与薄荷绿 `#12d6a5`。图标原样沿用远端正式 public/icon.svg 品牌母版（薄荷绿选区与暖白灵感卡）。业务图标未改动。

截图由本地实际运行的 Next.js 产品取得，使用仓库内置儿童收纳柜场景及虚构修改描述；没有上传个人数据。示例图来源为项目 `public/images/kids-shelf.png`，原作者与授权信息仓库未提供，本次沿用项目既有演示素材，交付不新增版权授权声明。材质纹理预览是产品内置示意，不是生成结果。

所有图片、源截图与 HTML 内嵌资源均随仓库保存，不使用远端热链。主图、卡片、纵向图分别排版。UI 只做裁切和缩放，不修改其内容；文字、图标、背景及边界说明属于宣传排版。

## 功能边界

这是桌面端交互原型。局部重绘 G2 快速版有 RunningHub 接口代码，但本次没有调用付费接口，也未验证生成质量。材质替换等路径存在延时提示的演示逻辑；智能选区为预设坐标命中，不是模型分割。生成历史保持空状态，不伪造结果。材质库分类和悬停预览可实际交互，纹理是示意。图库搜索、账户、充值及独立工作台中的部分控件为原型占位，宣传图不宣称其已接通。窄屏素材服务作品集展示，不表示产品已适配手机。

## 复现

在仓库根运行。排版依赖 Node.js、Playwright 1.58+、Sharp 0.34+，默认使用已安装的 Microsoft Edge，中文排版字体为 Microsoft YaHei（其他字体会影响字形）。这些是素材工具，不写入产品依赖。

1. 按项目方式启动产品，本次使用 `next dev --webpack --hostname 127.0.0.1 --port 3123`。
2. 使 `playwright` 与 `sharp` 可通过 Node 模块查找加载，或设置 `PORTFOLIO_NODE_MODULES` 指向其父目录。
3. `node docs/portfolio-assets/source/capture.cjs`，可通过 `PORTFOLIO_APP_URL` 指定服务地址。脚本拦截所有 RunningHub API，自动拍摄并裁切真实界面，不点击生成。
4. `node docs/portfolio-assets/source/render.cjs` 生成图标、四张 WebP 与独立 HTML 排版源。可用 `PORTFOLIO_BROWSER` 更改浏览器通道。
5. `node docs/portfolio-assets/source/qa.cjs` 生成展示尺寸检查图。
6. `node docs/portfolio-assets/source/manifest.cjs` 更新尺寸和 SHA-256。

无需重拍时可直接使用已保存的源截图重新排版。HTML 内嵌资源，render.cjs 为权威可编辑源；截图与排版源不依赖制作机器的绝对路径。

## 检查记录

已检查 1920×1200 主图和详情图、960×600 桌面预览、400×300 卡片、360×480 窄屏预览以及 32/40px 图标。标题无末尾句号，排版无文字溢出；界面为真实裁切，细小 UI 文案仅提供上下文，主要用途文字独立排版。检查拼图：`source/qa-sheet.png`。

本次仅增加素材与文档。源代码版本与素材版本分别记录，最终素材提交 SHA 以 Git 提交为准，避免 manifest 自引用哈希。
