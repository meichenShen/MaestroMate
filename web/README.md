# MaestroMate ·《水族馆》互动 Demo

以一个固定录音连接音乐小剧场、预设导赏问答和两道音乐侦探题。默认进入小剧场，三个入口可自由切换。问答为预设内容，无模型调用、账户或长期数据保存；刷新页面后本次答题和选择重置。

## 开发

需要 Node.js 22.18+（建议 24）。

```sh
cd web
npm ci --cache .tmp/npm-cache
npm run dev
npm test
npm run build
npm run preview -- --port 4173
```

浏览器验证：先运行开发服务器，再执行 `npm run test:browser`。默认使用 `/usr/bin/chromium`，可通过 `CHROMIUM_PATH` 指定浏览器，通过 `QA_BASE_URL` 指定测试地址。截图和日志写入忽略的 `.tmp/qa/`。

## 修改地图

| 想修改什么 | 从哪里开始 |
| --- | --- |
| 品牌和项目链接 | `src/components/BrandHeader.tsx` |
| 顶部作品介绍 | `src/components/WorkIntro.tsx` |
| 三个入口的名称与说明 | `src/content/aquarium.ts` 中的 `activities` |
| 桌面三栏宽度、区块间距 | `src/styles/tokens.css` 中的 `--layout-*` |
| 横向／纵向排列与手机断点 | `src/styles/layout.css` |
| 颜色、字体、圆角 | `src/styles/tokens.css` |
| 单个功能的样式或逻辑 | `src/features/theater/`、`conversation/`、`detective/` |
| 作品资料、问答、片段时间和题目 | `src/content/aquarium.ts` |
| 统一播放控制和片段停止逻辑 | `src/audio/AudioProvider.tsx` |
| 底部播放器界面 | `src/components/Player.tsx` |

桌面是“入口／活动／说明”三栏；1050px 以下说明落在活动下方；720px 以下导航移到上方，主区纵向排列；380px 以下说明卡片变为单列。区块高度由内容决定。播放器固定底部，页面末端预留空间。

`App.tsx` 负责当前入口、动态开关、问答选择和本次答题进度。一个 `AudioProvider` 包围所有活动，只有它创建 `<audio>`；模块通过 `useAudio()` 读取播放位置或请求跳转。切换入口不会重置录音。添加活动时不要另建播放器。

## 内容与录音

录音固定为 Neil 与 Nancy O’Doan（钢琴）、Seattle Youth Symphony、Vilem Sokol（指挥）的《水族馆》，时长约 148 秒。来源和署名见 [音频说明](public/audio/ATTRIBUTION.md)。替换录音时必须同时复核所有场景边界和题目片段，不能直接套用时间。

四个场景是本站的艺术想象与聆听窗口，不是关于作品正式曲式或作曲家意图的断言。两道题是原型练习，尚未开展用户或学习效果验证。

## 保存、发布和清理

- GitHub 的 MaestroMate 仓库保存源码、必要音频和说明；使用 `feat/aquarium-demo` 分支保存本次改动。
- `.openai/hosting.json` 保存 Sites 项目标识；不要重新创建站点或覆盖标识。
- 网站为静态 React 应用，`npm run build` 生成 `dist/`。本环境缺少 Sites 内置脚手架和工作流脚本，因此使用 Vite 构建与原生 Sites 发布接口。
- 发布源码只包含 `web/` 子树，研究材料留在 GitHub 项目中。发布前构建、检查，再将对应子树提交推送到 Sites 的源代码仓库；发布包包含 `dist/` 与 `.openai/hosting.json`，须与推送提交一致。
- `node_modules/`、`dist/`、`.tmp/`、测试报告及密钥均不提交。需要重装时使用 `npm ci`；需要重新构建时使用 `npm run build`。
- 临时文件集中在 `web/.tmp/`。检查是否仍需使用后可删除其中对应文件；不要对仓库执行全局清理，也不要删除 `.git/`、研究资料、最终音频或其他项目的缓存。

首次发布后，网址与验证记录保存在 `VERIFICATION.md`。
