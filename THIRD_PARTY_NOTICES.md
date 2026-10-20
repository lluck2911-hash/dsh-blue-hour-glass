# 来源与分发说明

## 主题与背景

按维护者将当前本地界面套装开源的要求，整理其原有 `@local/liquid-glass` 主题样式及本项目新增的交互代码。主题代码采用 MIT。

背景 `assets/beach-bg.jpg` 从原主题内嵌数据逐字节提取。维护者已于 **2026-10-20** 在本聊天中明确确认“可以随开源主题一起发布”，本项目据此将原图片纳入 0.1.1。此说明记录随主题分发的授权，不额外推定独立图片的其他使用权利。

原图 SHA-256：`8f526856730caaa25e3e03349fba3ab87651527584800315d3be786c6f446c27`。

`assets/blue-hour-coast.svg` 是本项目编写的备用 SVG，采用 MIT，不是本版默认背景。

## 重建预览

`preview/harness-components.css` 摘录已安装的 DeepSeek Harness 0.2.0-rc.2 组件样式与主样式表，仅供预览使用；主题运行时不依赖该副本。宿主项目以 MIT 许可提供，来源：https://github.com/deepseek-ai/deepseek-harness 。其许可全文见 `preview/HARNESS-LICENSE`。

重建页使用原图、相同的主题 CSS 变量与已确认的提亮样式、右栏 blur(20px) saturate(1.0) 与输入框 blur(24px) saturate(1.7)。布局、品牌示意图标与展示文字为重建，不承诺逐像素一致，不是桌面应用截图。

## 独立插件

鲸鱼娘桌宠来源：https://github.com/Sutera-Diffusus/dsh-whale-musume 。本包不捆绑其角色资源，也不捆绑音乐、模型插件或会话数据。本项目非 DeepSeek 官方作品。
