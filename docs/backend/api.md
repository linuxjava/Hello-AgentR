# Backend API 文档

> 基于当前代码生成。Base URL：`http://localhost:9898/hello-agent`  
> 统一响应：`R<T>`（`code` / `message` / `data` / `requestId`）  
> 成功：`code = "0"`

## 约定

| 项            | 说明                                       |
| ------------ | ---------------------------------------- |
| Context Path | `/hello-agent`（见 `application.yaml`）     |
| 鉴权头          | `Authorization: <token>`（Sa-Token，`loginType=admin`） |
| 匿名接口         | 仅 `POST /admin/auth/login`               |
| 登录门禁         | 其余 `/admin/**` 由拦截器统一校验；未登录返回宏观码 `A000001`，文案「未登录或登录已过期」 |
| 角色           | `ADMIN` / `STAFF`（JSON 枚举名）              |
| 密码规则         | 长度 8–64，须同时包含字母与数字                       |
| 用户名规则        | 长度 4–32，仅 `[a-zA-Z0-9_]`，创建后不可改          |
| 多端登录         | 允许并发；各端 token 独立；改密/重置/删除后作废该账号全部 token  |

### 能力矩阵

| 能力                   | Admin | Staff |
| -------------------- | ----- | ----- |
| 登录 / 登出 / me / 改自己密码 | ✓     | ✓     |
| 分页列表                 | ✓     | ✓     |
| 创建 / 重置密码 / 改角色 / 删除 | ✓     | ✗     |

### 公共类型

**AdminUserView**

| 字段        | 类型                 | 说明                 |
| --------- | ------------------ | ------------------ |
| id        | string             | 雪花 ID              |
| username  | string             | 用户名                |
| role      | string             | `ADMIN` / `STAFF`  |
| bootstrap | boolean            | 是否 Bootstrap Admin |
| createdAt | string (date-time) | 创建时间               |

响应**永不**包含密码或哈希。

---

## 1. 管理端认证 `/admin/auth`

### 1.1 登录

`POST /admin/auth/login` — 匿名

**Request**

```json
{
  "username": "admin",
  "password": "admin@123456"
}
```

| 字段       | 必填   | 说明         |
| -------- | ---- | ---------- |
| username | 是    | 精确匹配，大小写敏感 |
| password | 是    | 明文密码       |

**Response `data`**

```json
{
  "token": "xxxx",
  "profile": {
    "id": "2085...",
    "username": "admin",
    "role": "ADMIN",
    "bootstrap": true,
    "createdAt": "2026-08-07T12:00:00.000+00:00"
  }
}
```

**错误**：用户名或密码错误 → `A001001`「用户名或密码错误」（不区分用户名是否存在）

**示例**

```bash
curl -s -X POST 'http://localhost:9898/hello-agent/admin/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin@123456"}'
```

---

### 1.2 登出

`POST /admin/auth/logout` — 需登录

作废**当前** token，不影响同账号其他端会话。

**Response**：`data` 为空

```bash
curl -s -X POST 'http://localhost:9898/hello-agent/admin/auth/logout' \
  -H "Authorization: $TOKEN"
```

---

### 1.3 当前账号

`GET /admin/auth/me` — 需登录

**Response `data`**：`AdminUserView`

```bash
curl -s 'http://localhost:9898/hello-agent/admin/auth/me' \
  -H "Authorization: $TOKEN"
```

---

### 1.4 修改自己的密码

`PUT /admin/auth/password` — 需登录

**Request**

```json
{
  "oldPassword": "admin@123456",
  "newPassword": "NewPass1234"
}
```

| 字段          | 必填   | 说明                |
| ----------- | ---- | ----------------- |
| oldPassword | 是    | 当前密码              |
| newPassword | 是    | 须符合密码规则，且不得与旧密码相同 |

成功后作废该账号**全部** token。

| 错误码     | 文案          |
| ------- | ----------- |
| A001008 | 旧密码错误       |
| A001006 | 密码不符合规则     |
| A001007 | 新密码不能与旧密码相同 |

```bash
curl -s -X PUT 'http://localhost:9898/hello-agent/admin/auth/password' \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"oldPassword":"admin@123456","newPassword":"NewPass1234"}'
```

---

## 2. 账号治理 `/admin/users`

### 2.1 分页列表

`GET /admin/users` — Admin / Staff

| Query    | 必填   | 默认   | 说明                      |
| -------- | ---- | ---- | ----------------------- |
| page     | 否    | 1    | 页码，&lt;1 时按 1           |
| pageSize | 否    | 20   | 每页条数；&lt;1 或 &gt;100 拒绝 |
| username | 否    | —    | 用户名模糊筛选                 |
| role     | 否    | —    | `ADMIN` / `STAFF` 精确筛选  |

排序：创建时间倒序。

**Response `data`**

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 3,
  "records": [ /* AdminUserView */ ]
}
```

| 错误码     | 文案      |
| ------- | ------- |
| A001010 | 分页参数不合法 |

```bash
curl -s 'http://localhost:9898/hello-agent/admin/users?page=1&pageSize=20' \
  -H "Authorization: $TOKEN"
```

---

### 2.2 创建账号

`POST /admin/users` — 仅 Admin

**Request**

```json
{
  "username": "ops_staff_01",
  "password": "Staff1234",
  "role": "STAFF"
}
```

| 字段       | 必填   | 说明                |
| -------- | ---- | ----------------- |
| username | 是    | 符合用户名规则，全局唯一      |
| password | 是    | 符合密码规则            |
| role     | 是    | `ADMIN` 或 `STAFF` |

**Response `data`**：新建的 `AdminUserView`（`bootstrap=false`）

| 错误码     | 文案       |
| ------- | -------- |
| A001002 | 无权限      |
| A001004 | 用户名不符合规则 |
| A001005 | 用户名已存在   |
| A001006 | 密码不符合规则  |
| A001011 | 角色不合法    |

```bash
curl -s -X POST 'http://localhost:9898/hello-agent/admin/users' \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"username":"ops_staff_01","password":"Staff1234","role":"STAFF"}'
```

---

### 2.3 重置他人密码

`PUT /admin/users/{id}/password` — 仅 Admin（含 Bootstrap）

**Request**

```json
{
  "newPassword": "Reset1234"
}
```

成功后作废目标账号全部 token。

| 错误码     | 文案      |
| ------- | ------- |
| A001002 | 无权限     |
| A001003 | 账号不存在   |
| A001006 | 密码不符合规则 |

```bash
curl -s -X PUT "http://localhost:9898/hello-agent/admin/users/$USER_ID/password" \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"newPassword":"Reset1234"}'
```

---

### 2.4 变更角色

`PUT /admin/users/{id}/role` — 仅 Admin

**Request**

```json
{
  "role": "STAFF"
}
```

末 Admin 保护：将唯一 `ADMIN` 降为 `STAFF` 会被拒绝。

| 错误码     | 文案        |
| ------- | --------- |
| A001002 | 无权限       |
| A001003 | 账号不存在     |
| A001009 | 操作被保护规则拒绝 |
| A001011 | 角色不合法     |

```bash
curl -s -X PUT "http://localhost:9898/hello-agent/admin/users/$USER_ID/role" \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"role":"STAFF"}'
```

---

### 2.5 物理删除

`DELETE /admin/users/{id}` — 仅 Admin

成功后作废目标账号全部 token。

**拒绝条件（A001009）**

- 目标为 Bootstrap Admin（`bootstrap=true`）
- 删除自己
- 删除后将导致零 AdminUser
- 删除后将导致零 `ADMIN` 角色

| 错误码     | 文案        |
| ------- | --------- |
| A001002 | 无权限       |
| A001003 | 账号不存在     |
| A001009 | 操作被保护规则拒绝 |

```bash
curl -s -X DELETE "http://localhost:9898/hello-agent/admin/users/$USER_ID" \
  -H "Authorization: $TOKEN"
```

---

## 3. 错误码

### 3.1 一级宏观码（`BaseErrorCode`）

| 码       | 说明                            |
| ------- | ----------------------------- |
| S000001 | 系统执行出错                        |
| T000001 | 第三方服务出错                       |
| C000001 | Web 用户端错误                     |
| A000001 | Web 管理端错误（框架层：未登录、参数校验等按路径归入） |
| M000001 | 移动端错误                         |

### 3.2 管理端业务码（`AdminErrorCode`）

| 码       | 文案          |
| ------- | ----------- |
| A001001 | 用户名或密码错误    |
| A001002 | 无权限         |
| A001003 | 账号不存在       |
| A001004 | 用户名不符合规则    |
| A001005 | 用户名已存在      |
| A001006 | 密码不符合规则     |
| A001007 | 新密码不能与旧密码相同 |
| A001008 | 旧密码错误       |
| A001009 | 操作被保护规则拒绝   |
| A001010 | 分页参数不合法     |
| A001011 | 角色不合法       |

失败响应示例：

```json
{
  "code": "A001001",
  "message": "用户名或密码错误",
  "data": null
}
```

---

## 4. 端点一览

| 方法     | 路径                           | 鉴权          | 说明         |
| ------ | ---------------------------- | ----------- | ---------- |
| POST   | `/admin/auth/login`          | 匿名          | 登录         |
| POST   | `/admin/auth/logout`         | 已登录         | 登出当前 token |
| GET    | `/admin/auth/me`             | 已登录         | 当前资料       |
| PUT    | `/admin/auth/password`       | 已登录         | 改自己密码      |
| GET    | `/admin/users`               | Admin/Staff | 分页列表       |
| POST   | `/admin/users`               | Admin       | 创建         |
| PUT    | `/admin/users/{id}/password` | Admin       | 重置密码       |
| PUT    | `/admin/users/{id}/role`     | Admin       | 变更角色       |
| DELETE | `/admin/users/{id}`          | Admin       | 物理删除       |


