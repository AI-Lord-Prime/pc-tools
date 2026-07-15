# 查机工具箱

基于 **Tauri** 的 Windows 系统工具集，用于查看硬件信息、监控温度/使用率，以及系统清理、启动项、驱动、网络、跑分等常用能力。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18、TypeScript、Vite、Tailwind CSS、shadcn/ui |
| 桌面 | Tauri 1.x（Rust） |
| 打包 | NSIS 安装包 |

## 功能概览

- 系统概览、CPU / GPU / 内存 / 硬盘 / 主板信息
- 温度、使用率、风扇监控
- 系统清理、启动项管理、驱动扫描、网络工具
- 性能测试、应用设置

## 环境要求

- Node.js ≥ 18
- Rust ≥ 1.70（[rustup](https://www.rust-lang.org/tools/install)）
- Windows：Visual Studio Build Tools（勾选 C++ 桌面开发）

更细的初始化步骤见 [`初始化指南.md`](./初始化指南.md)（其中部分旧命令可能已过时，请以本文为准）。

## 快速开始

```bash
npm install
npm run dev
```

- `npm run dev`：启动 Vite + Tauri 桌面窗口  
- `npm run vite`：仅前端（不启桌面端）

开发服务地址：`http://127.0.0.1:9666`

## 构建打包

```bash
npm run build
npm run tauri build
```

安装包输出目录：`src-tauri/target/release/bundle/nsis/`

若打包时反复从 GitHub 下载 `nsis-3.zip`，可先预拉本地缓存：

```bash
npm run prefetch:nsis
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发（前端 + Tauri） |
| `npm run vite` | 仅 Vite 前端 |
| `npm run build` | 构建前端 |
| `npm run tauri build` | 打包桌面安装包 |
| `npm run prefetch:nsis` | 预下载 NSIS 工具链到本机缓存 |
| `npm run preview` | 预览前端生产构建 |

## 仓库

- Gitee：`https://gitee.com/meta_codes/pc-tools.git`
- GitHub：`https://github.com/AI-Lord-Prime/pc-tools.git`

## 许可证

暂未指定许可证。
