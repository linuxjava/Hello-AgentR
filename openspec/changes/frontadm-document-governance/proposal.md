## Why

后端 V0.4 Document API 已就绪，管理端仍停在知识库容器列表（V0.2/V0.3），运营无法进入某库上传文件、改策略、启停或删文档；列表也无法用真实 `documentCount` 驱动「有文档不能删库」。需按 V0.4 Pencil 稿交付文档治理闭环，避免按 IXD 臆造线框或偏离稿面结构。

## What Changes

- **知识库列表增量（P-04）**：展示真实 `documentCount`；名称前图标、**点击名称**进入文档列表（无行内「进入」）；`documentCount > 0` 时 Admin 删库外观不灰显，点删除 Toast「库下仍有文档，不能删除」不打开确认；Staff 删库仍无权限 Toast
- **独立文档列表（P-05）**：非知识库详情页；文件名模糊 + 分页；列与态以 Pencil 为准（文件名副行类型·大小、状态软色徽章、分块数「—」、启用开关、改策略/删除）
- **上传（O-08 系）**：拖拽或点击单文件；结构化策略表单 + UI 预填；校验/提交中/业务失败态；无同名常驻说明、无约 50MB 文案、字段旁无单位
- **改策略（O-09）**：回填已存值；切种类整份替换字段；无 JSON 文本框；可改文件名主名、后缀锁定
- **删文档（O-10）**：轻确认；Admin/Staff 均可，不灰显
- **反馈**：文档列表成功 Toast（G-01a）；知识库不存在错误态（V-04 / `A002001`）

## Out of Scope（不做）

- 开始分块、解析、切片数、索引状态、Chunk 实体 UI
- 源文件预览 / 下载；URL 上传；多文件一次提交
- JSON 文本框编辑策略；同名覆盖既有文件
- 知识库详情页（上半改库、下半文档）
- 按 status / strategy / enabled 筛选文档
- 账号治理行为变更；后端 API / ObjectStorage 配置变更
- **以 IXD「线框图」或臆造布局为准**（视觉 SSOT = `docs/frontend-admin/版本迭代/V0.4/ui.pen`；IXD 仅作帧 ID、手势与 AC 追溯；本稿 IXD 本身无 ASCII 线框）

## Capabilities

### New Capabilities

- `frontend-admin-document-governance`：文档列表（含空/筛选空/库不存在）、上传/改策略/删文档模态与错误态、行内启用开关、文档列表 Toast；知识库列表文档数与点名称入口、有文档删库 Toast

### Modified Capabilities

- （无已归档 `openspec/specs/` 能力。知识库列表增量在本变更中修改既有 `KnowledgeBasesPage` / 表组件，不另开 delta；行为以本 change 的新 spec 为准。）

## Impact

- **代码**：`frontend-admin` 新增文档列表路由与页、上传/改策略/删文档模态；扩展知识库列表列与入口；扩展 `knowledge` API 客户端
- **API 消费**：`GET .../knowledge-bases`（含 `documentCount`）；`GET/POST .../documents`；`PUT .../chunk-strategy`；`PUT .../enabled`；`DELETE .../documents/{id}`；删库仍 `DELETE .../knowledge-bases/{id}`
- **视觉依据**：`docs/frontend-admin/版本迭代/V0.4/ui.pen`（冲突时 **Pencil 优先于 IXD 叙述**）
- **行为依据**：`docs/frontend-admin/版本迭代/V0.4/prd.md`、`ixd.md`（帧 ID / AC）；词汇表 `docs/frontend-admin/CONTEXT.md`
- **依赖**：既有壳层与知识库列表（`frontadm-knowledge-base` / v3）；后端 `backend-knowledge-document-upload`
- **变更标识**：目录名 `frontadm-document-governance`（CLI 全小写）；归属 Web 管理端，对应约定前缀 `frontAdm-`

## 回滚方案

- **代码回滚**：还原本变更提交；移除文档列表路由与相关 API 调用；知识库列表退回无文档数 / 无点名称进文档页
- **本地数据**：无前端迁移；会话仍为 localStorage token
- **风险**：回滚后无法在管理端治理 Document；不影响后端 Document API 与既有知识库容器 CRUD
