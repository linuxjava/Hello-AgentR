## 1. 基础配置与 API 客户端

- [x] 1.1 检查 `frontend-admin` 现有模块（当前无 auth/api 复用点）；新增 `VITE_API_BASE_URL`（或等价）环境变量与类型声明
- [x] 1.2 实现统一 `apiClient`（JSON、Authorization 注入、解析统一响应；遇 `A000001` 触发清会话回调）
- [x] 1.3 实现 `authApi.login` / `authApi.me`，类型对齐 `docs/backend/api.md`
- [x] 1.4 **验证**：对 mock 或本地后端调用 login/me，确认请求路径与 header 正确

## 2. 会话存储与门禁

- [x] 2.1 实现 session store（zustand）：token、profile、hydrate、clear；token 读写 localStorage
- [x] 2.2 实现记住用户名独立 storage 键（成功登录且勾选时写入；未勾选则清除）
- [x] 2.3 实现 `RequireAuth`（或 loader）：hydrate + `me` 成功才渲染子树，失败跳转 `/login`
- [x] 2.4 实现已登录访问 `/login` 的重定向至 `/`
- [x] 2.5 **验证**：无 token / 假 token / 真 token 三种情况下路由跳转符合 spec

## 3. 登录页 UI（P-01）

- [x] 3.1 新增 `LoginPage`：布局与文案对齐 Pencil / IXD（品牌区、用户名、密码、记住用户名、提交）
- [x] 3.2 接入 react-hook-form + zod：非空与前端约定校验；提交 loading、防重复提交
- [x] 3.3 实现 H-02 页内错误条：展示后端 `message`；失败不写 token
- [x] 3.4 登录成功：写 token/profile、处理记住用户名、导航 `/`
- [x] 3.5 **验证**：组件测试覆盖成功、失败错误条、记住用户名预填（可用 mock API）

## 4. 路由接线与收尾

- [x] 4.1 更新 `App.tsx`：注册 `/login`、保护 `/`（及通配，避免绕过门禁）
- [x] 4.2 确认 `HomePage` 作为本阶段落地占位仍可渲染（不实现完整壳层）
- [x] 4.3 **验证（手工）**：Bootstrap `admin` / `admin@123456` 完成「打开登录 → 成功进首页 → 刷新仍在 → 清 token 回登录」；跑 `npm test` / lint 通过
