# Vite 架构概览

Vite 是一个基于 ESM 的前端构建工具，提供极速的开发服务器和优化的生产构建。

## 整体架构

Vite 的架构主要分为两大部分：

- **开发服务器**：基于原生 ESM 的即时文件服务，无需打包
- **构建系统**：基于 Rollup 的优化生产构建

## 核心模块

- **开发服务器**：基于 Connect 的中间件系统
- **插件系统**：兼容 Rollup 插件 API 的可扩展架构
- **依赖预构建**：使用 esbuild 对 node_modules 进行预处理
- **HMR 系统**：高效的模块热替换实现

## 关键特性

- 基于 ESM 的开发服务，无需打包
- 基于 esbuild 的依赖预构建，速度远超传统工具
- 兼容 Rollup 插件生态
- 内置 TypeScript、JSX、CSS 等支持

> 本文档将随着源码分析的深入而更新。
