## 1. 探查与依赖

- [x] 1.1 确认 `fw-base` / Sa-Token / 统一异常 / MyBatis-Plus 可复用点（禁止重复造轮子）
- [x] 1.2 确认项目是否已有 DB migration 方案；若无，选定本变更最小迁移方式（SQL 脚本或等价）
- [x] 1.3 在 `app` 模块按需补充密码哈希依赖（如 Spring Security Crypto），避免引入无关 starter

### Phase 1 验证

- [x] 1.4 记录复用清单与迁移方案结论（可写在 design Open Questions 关闭说明或 PR 描述）

## 2. 数据模型与持久化

- [x] 2.1 新增 `t_admin_user` 表迁移（字段：id、username、password_hash、role、bootstrap、审计字段；username 唯一索引）
- [x] 2.2 新增 `AdminUser` DO / Mapper（包路径 `com.xgc.agent.rag.admin`），明确物理删除实现路径
- [x] 2.3 新增角色枚举（`ADMIN` / `STAFF`）与基础仓储查询（按 username、bootstrap、role 计数等）

### Phase 2 验证

- [x] 2.4 启动或测试上下文可加载 Mapper；表结构与索引符合 design

## 3. Bootstrap 初始化

- [x] 3.1 实现密码哈希与校验工具（BCrypt）
- [x] 3.2 实现 `BootstrapAdminInitializer`（无 bootstrap 则插入；已存在跳过；`admin` 冲突则启动失败）
- [x] 3.3 补充启动场景测试或可重复的手工验证步骤说明

### Phase 3 验证

- [x] 3.4 空库启动后存在 Bootstrap Admin；二次启动不改密；冲突场景按 spec 失败

## 4. 认证与会话（admin-auth）

- [x] 4.1 配置 Sa-Token 管理端 loginType（如 `admin`）及与现有 `Authorization` 头约定对齐
- [x] 4.2 实现登录 / 登出 / `me` API（统一失败文案；响应不含密码）
- [x] 4.3 实现修改自己密码 API（校验旧密码与规则；成功后踢掉该账号全部 token）
- [x] 4.4 为登录失败、未登录、改密成功/失败编写测试

### Phase 4 验证

- [x] 4.5 对照 `admin-auth` spec 场景手工或自动化验收通过

## 5. 账号治理（admin-user-management）

- [x] 5.1 实现分页列表 API（默认 pageSize=20；上限 100 拒绝；username 模糊；role 精确；创建时间倒序）
- [x] 5.2 实现创建 AdminUser API（仅 Admin；用户名/密码规则；指定角色）
- [x] 5.3 实现重置他人密码 API（仅 Admin；含 Bootstrap；成功后踢全部 token）
- [x] 5.4 实现变更角色 API（仅 Admin；末 Admin 保护）
- [x] 5.5 实现物理删除 API（仅 Admin；Bootstrap / 自己 / 末账号 / 末 Admin 保护；成功后踢全部 token）
- [x] 5.6 统一 Staff 越权拒绝路径，覆盖能力矩阵写操作

### Phase 5 验证

- [x] 5.7 对照 `admin-user-management` spec 与 PRD 主闭环验收：创建 Staff → 列表可见 → 重置/改角色/删除（非保护对象）

## 6. 收尾

- [x] 6.1 核对 API 路径与 `design.md` 端点表一致；错误码纳入既有异常体系
- [x] 6.2 更新必要后端文档索引或环境说明（初始账号提醒改密；不把密钥写入可公开位置之外的多余副本）
- [x] 6.3 全量相关测试通过；准备进入 `/opsx:apply` 各 Phase 的逐段 review

### Phase 6 验证

- [x] 6.4 `openspec` 变更目标能力均可演示；无范围外功能混入
