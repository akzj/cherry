# Cherry 前端开发流程与规范指导

本项目推荐采用“先设计 UI + mock 功能开发，再对接真实后端”的高效开发流程。请团队成员遵循以下规范，以提升协作效率和代码质量。

---

## 1. UI 设计优先
- 使用 Figma、Sketch 或直接用 React/TypeScript + 组件库（如 Ant Design、MUI）快速搭建界面原型。
- UI 组件、页面结构、交互流程优先明确，便于产品、设计、开发团队同步理解。
- UI 代码应模块化、可复用，样式建议采用 CSS-in-JS 或 CSS Modules。

## 2. mock 数据驱动开发
- 所有业务功能优先用 mock service（如 LocalDbAdapter、本地 JSON、Mock Service Worker、Zustand mock store 等）模拟后端接口和数据流。
- mock 层应严格模拟真实接口的数据结构和返回格式，便于后续无缝切换。
- mock 代码应与真实 service 解耦，便于切换和测试。
- mock 数据建议存储于 localStorage、sessionStorage 或内存，方便调试和重置。

## 3. mock 功能自测通过后再对接真实后端
- mock 逻辑和真实后端接口保持一致（接口、数据结构、状态流转等）。
- 对接时只需替换数据源（如将 mock service 替换为 Tauri invoke/Rust API 调用）。
- 支持 mock/real service 切换（如通过环境变量、配置项、全局开关等）。
- 对接后需回归测试所有功能，确保无缝切换。

## 4. 接口与类型约定
- 前后端接口、数据结构、状态流转等应有明确的 TypeScript interface/type 约束。
- mock/real service 的接口签名、参数、返回值必须保持一致。
- 推荐接口文档与代码同步维护（如 API_DOCUMENTATION.md、OpenAPI/Swagger 等）。

## 5. 团队协作建议
- UI、mock、真实后端开发可并行推进，互不阻塞。
- 重要接口、类型、mock 逻辑建议评审后再开发，减少返工。
- mock 代码可长期保留，用于离线模式、自动化测试、演示等场景。
- 代码提交前请自测，确保 mock/real 环境均可正常运行。

## 6. 目录结构建议
- `src/components/`：UI 组件
- `src/services/`：业务 service（mock/real）
- `src/store/`：全局状态管理
- `src/types/`：类型定义
- `src/pages/`：页面入口

## 7. 其他最佳实践
- 组件、service、store、类型等均应有单元测试或 mock 测试。
- UI/交互/业务流程建议先在 mock 环境下打磨完善。
- 保持代码风格统一，遵循团队 lint/prettier 规范。

---

**本规范为 Cherry 项目前端开发的基础流程和协作约定。请所有成员遵守，如有优化建议请及时讨论修订。** 