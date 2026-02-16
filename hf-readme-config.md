---
title: StoryWeaver AI
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: static
app_build_command: npm run build
app_file: index.html
---

# StoryWeaver AI - 智能需求拆解平台

基于React + TypeScript + Vite构建的智能需求拆解平台，支持多种LLM模型进行需求分析和优化。

## 功能特点

- **智能文档解析**：支持 .docx, .pdf, .md, .txt 格式
- **LLM优化**：集成12种大语言模型，包括国内大模型
- **可视化**：用户故事地图、质量分析图表
- **导出功能**：CSV、Markdown导出
- **配置灵活**：支持模型选择、API Key配置

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **UI组件**：Radix UI + Tailwind CSS
- **状态管理**：React Context + useState
- **文档解析**：Mammoth (DOCX) + PDF.js (PDF) + marked (MD)

## 模型支持

### 国内大模型
- 火山 Coding Plan
- Minimax Coding Plan  
- GLM Coding Plan
- Kimi
- DeepSeek
- 豆包

### 国外模型
- OpenAI (GPT-4o, GPT-4o Mini)
- Claude 3 (Haiku, Sonnet, Opus)
- Google Gemini (1.5 Flash, 1.5 Pro)

## 部署

本项目部署在Hugging Face Spaces上，使用Static HTML SDK。

## 项目链接

- **GitHub**：https://github.com/libiao88/Storyweaver
- **Hugging Face**：https://huggingface.co/spaces/cobbrocks/Storyweaver

## 许可证

MIT License
