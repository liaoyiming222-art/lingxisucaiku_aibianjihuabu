# detail-v2-20261104-lingxi：场景阻塞核验

状态：受阻。产品 ID：lingxi。7 张正式成品尚未制作，当前目录仅为核验资料，禁止作为详情页成品接入。

实际源：用户指定的 C:/ai应用/灵感库调研/ai-prototype。原工作区 main、3eb1c51ecaea8adc64c04555a4c34e6b4d20f624，无本地修改，保持原状。由实际源克隆隔离副本，锁定任务要求的拍摄基线 e324a46481e588b41da9954698fc9c3f53f39c9c。没有使用旧聊天目录作为代码来源。

## 具体缺口

任务要求新单椅输入贯穿图片详情、编辑画布、椅面手动涂抹和参数。锁定版本 app/page.tsx 将 sourceImage 固定为 /images/kids-shelf.png，详情组件也固定该图。现有 file 输入仅为可选替换参考或材质参考，不是编辑原图入口。独立 /editor 上传按钮也无替换原图处理，画布固定厨房图。

已运行锁定代码，实际从详情进入局部重绘，截图确认画布仍为儿童收纳柜，唯一文件输入为 inpaint-reference-image。不能把上传参考图声称为换入单椅原图。没有替换静态素材、拦截图片响应换图、改 DOM、改 CSS 或改业务。没有调用任何模型/RunningHub，也未上传参考图。

## 核验资料

- evidence/fixed-detail.png：1440×1000，实际默认图片详情
- evidence/fixed-editor.png：1440×1000，从同一详情打开局部重绘，未编辑、未生成
- evidence/runtime.json：实际图片及 file 输入清单，无 RunningHub 请求
- evidence/probe.cjs：隔离浏览器核验脚本

截图仅为阻塞证据，不满足本轮 7 张成品、单椅场景及目标展示宽度检查。没有产生假遮罩、假效果或替代旧场景成品。源中的正式图标/旧首页图均不修改。

## 复现

使用任务代码基线安装现有依赖后运行 Next.js 开发服务（本次 next dev --webpack --hostname 127.0.0.1 --port 3147）。在仓库根运行 node docs/portfolio-assets/detail-v2/evidence/probe.cjs。需要 playwright 与 Microsoft Edge，可通过 PORTFOLIO_NODE_MODULES 设置模块目录。运行使用全新 headless browser context，拦截所有 RunningHub API。

## 待总控裁决

允许使用原生内置儿童收纳柜场景替代单椅，或另行明确允许仅在隔离拍摄中替换演示输入资产并标注受控输入。当前授权明确要求真实单椅流程且不改产品，本轮不擅自采用这些替代。收到场景修订前不能交付所列 7 张图。后续继续相同分支，不扩展产品功能开发。
