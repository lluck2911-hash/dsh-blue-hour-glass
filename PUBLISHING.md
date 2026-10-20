# 发布与上架

GitHub 仓库：https://github.com/lluck2911-hash/dsh-blue-hour-glass 。当前版本为 0.1.3，已确认提亮版。尚未发布 npm 或提交社区市场审核。

2026-10-20 更新：维护者已明确确认网页默认的提亮版。提亮样式现位于 src/lighting.css，已纳入安装包；重建预览加载同一份 client.js，图集保留浅雾蓝底。最终视觉已确认，主题源码及发布附件上传到上述公开仓库。

## 发布前的账号与素材资料

1. 维护者的 GitHub 账号或组织及可写的公开仓库。需要有效登录；不要把 token 写进项目或发进聊天。
2. 原背景授权已由维护者于 2026-10-20 确认，当前包已包含原图。维护者已于 2026-10-20 确认提亮版预览；右栏采用 20px 模糊、1.0 饱和度，保留原海岸图并减轻暗角、抬高暗部亮度。目标账号为 lluck2911-hash。

## GitHub

建议仓库名 `dsh-blue-hour-glass`。上传本目录的源码，排除 `dist/`、本机备份、凭据和会话目录。添加 topics：`deepseek-harness`、`dsh-plugin`、`dsh-plugin-theme`、`theme`、`skin`、`glassmorphism`。

在 `package.json` 添加真实的 `repository`、`homepage`、`bugs` 和维护者信息，不能使用示例账号假装已发布。

```sh
node scripts/build.mjs
node --test tests/package.test.mjs
python scripts/pack.py
```

创建 `v0.1.3` 标签并推送后，`.github/workflows/release.yml` 会重新构建、校验并创建 GitHub Release，附带 `.tgz`、源码 ZIP 和 `SHA256SUMS`。GitHub Release 允许别人直接下载安装；不需要先发布 npm。

## 社区皮肤集市

已核实的独立社区渠道：

- 目录站：https://dsh.a2hmarket.ai/
- 市场插件：https://github.com/keman-ai/dsh-skin-market

市场维护者 README 说明目录来自该站，主题通过 GitHub 或 Release tarball 安装。它不是 DeepSeek 官方审核或官方商店。本次尚未核实作者投稿界面的具体字段，因此没有编造自动上架 API，也没有宣称添加 metadata 或 topics 后就一定会被收录。

先完成公开仓库与 Release，再使用目录站的作者入口或向市场维护者提交仓库和 Release 地址。可复制 [docs/MARKET_SUBMISSION.md](docs/MARKET_SUBMISSION.md) 的介绍。

社区资料依据，核对日期 2026-10-20：

- https://github.com/keman-ai/dsh-skin-market/blob/main/README.zh-CN.md
- https://github.com/keman-ai/dsh-skin-pack/blob/main/README.md

## npm（可选）

完成作者身份和仓库信息后，可用维护者自己的 npm 账号发布。项目没有 postinstall / prepare，也不会在安装过程中执行构建代码。不要以本机 `@local/liquid-glass` 的 private 名称发布。
