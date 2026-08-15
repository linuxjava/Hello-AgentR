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
| 知识库 Name      | 去首尾空白后 1–64；中文与常见标点；全局唯一；可改     |
| 知识库 Namespace | 2–32，仅 `[a-z0-9]`；人填；创建后不可改           |
| 登录门禁         | 其余 `/admin/**` 由拦截器统一校验；未登录返回宏观码 `A000001`，文案「未登录或登录已过期」；Web 用户端框架层一级码为 `U000001` |
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
| 知识库列表 / 详情 / 创建 / 改 Name·描述 / 配置目录 | ✓     | ✓     |
| 删除 KnowledgeBase | ✓     | ✗     |
| Document 上传 / 列表 / 详情 / 改策略 / 启用禁用 / 删除 | ✓     | ✓     |

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

**KnowledgeBaseView**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 雪花 ID |
| name | string | 显示名 |
| description | string | 可空 |
| namespace | string | 创建后不可改 |
| embeddingModel | string | 目录中的模型 `id`；创建时绑定默认模型 |
| documentCount | number | 库下 Document 条数（含已禁用）；不含切片数 / 索引状态 |
| createdBy | string | 创建者 AdminUser id |
| createdAt | string (date-time) | 创建时间 |
| updatedAt | string (date-time) | 更新时间 |

不含 objectKey。

**DocumentView**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 雪花 ID |
| knowledgeBaseId | string | 所属知识库 |
| originalFilename | string | 原始文件名；同库允许重复；改策略时可改主名、后缀锁定 |
| mediaType | string | 服务端 Tika 规范化后的 MIME（别名已归一），不以客户端 Content-Type 为准 |
| documentFormat | string | 业务格式族：`TXT` / `MARKDOWN` / `PDF` / `DOC` / `DOCX` / `PPT` / `PPTX` / `XLS` / `XLSX` / `PNG` / `JPEG` / `SVG`；展示与后续分支用此字段，勿再解析 `mediaType` |
| byteSize | number | 字节数 |
| status | string | 本阶段固定 `UPLOADED` |
| enabled | boolean | 运营开关；与 `status` 无关 |
| chunkStrategy | string | `OVERLAPPING` / `STRUCTURE_AWARE` |
| chunkStrategyParams | object | 键随种类变化；单位为 Unicode 字符 |
| sourceType | string | 本阶段固定 `LOCAL_FILE` |
| createdBy | string | 上传者 AdminUser id |
| createdAt | string (date-time) | 创建时间 |
| updatedAt | string (date-time) | 改策略 / 启用禁用会刷新 |

响应**永不**包含 `objectKey` 或存储密钥。

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

## 3. 知识库 `/admin/knowledge-bases` 与配置目录

词汇见 [`context/knowledge/CONTEXT.md`](context/knowledge/CONTEXT.md)。Document 上传与元数据治理已落地；**不**执行切块、不提供下载。EmbeddingModel 目录由 YAML 配置驱动。

### 3.1 EmbeddingModel 目录

`GET /admin/embedding-models` — 需登录

**Response `data`**：对象数组，按 `priority ASC, id ASC` 排序。创建只接受目录中的 `id`。

```json
[
  {
    "id": "bge-m3",
    "model": "bge-m3",
    "dimension": 1024,
    "providerId": "alibailian",
    "priority": 10,
    "isDefault": true
  },
  {
    "id": "sf-bge-large-zh",
    "model": "BAAI/bge-large-zh-v1.5",
    "dimension": 1024,
    "providerId": "siliconflow",
    "priority": 20,
    "isDefault": false
  }
]
```

```bash
curl -s 'http://localhost:9898/hello-agent/admin/embedding-models' \
  -H "Authorization: $TOKEN"
```

### 3.2 分页列表

`GET /admin/knowledge-bases` — 需登录

| Query | 必填 | 默认 | 说明 |
| --- | --- | --- | --- |
| page | 否 | 1 | 页码，&lt;1 时按 1 |
| pageSize | 否 | 20 | 每页条数；&lt;1 或 &gt;100 → `A001010` |
| name | 否 | — | Name 模糊；**无** Namespace 筛选 |

**Response `data`**：`{ page, pageSize, total, records }`，元素为 **KnowledgeBaseView**。`documentCount` 含已禁用 Document。

```bash
curl -s 'http://localhost:9898/hello-agent/admin/knowledge-bases?page=1&pageSize=20' \
  -H "Authorization: $TOKEN"
```

### 3.3 创建

`POST /admin/knowledge-bases` — 需登录（Admin / Staff）

```json
{
  "name": "员工手册",
  "description": "可选",
  "namespace": "hrfaq"
}
```

创建时不接收 `embeddingModel`；后端会自动绑定目录中 `isDefault=true` 的默认模型。空库 `documentCount` 为 0。

**Response `data`**：新建的 **KnowledgeBaseView**

| 错误码 | 文案 |
| --- | --- |
| A002002 | 名称不符合规则 |
| A002003 | 名称已存在 |
| A002004 | Namespace 不符合规则 |
| A002005 | 命名空间已存在 |
| A002006 | 描述不符合规则 |
| A002007 | 向量模型不合法 |

```bash
curl -s -X POST 'http://localhost:9898/hello-agent/admin/knowledge-bases' \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"员工手册","description":"可选","namespace":"hrfaq"}'
```

### 3.4 详情

`GET /admin/knowledge-bases/{id}` — 需登录

**Response `data`**：**KnowledgeBaseView**。不存在 → `A002001`。

```bash
curl -s "http://localhost:9898/hello-agent/admin/knowledge-bases/$KB_ID" \
  -H "Authorization: $TOKEN"
```

### 3.5 修改 Name / Description

`PUT /admin/knowledge-bases/{id}` — 需登录

```json
{
  "name": "已修订手册",
  "description": ""
}
```

`description` 为空或省略表示清空。Namespace / EmbeddingModel **不会**被此接口修改。

**Response `data`**：更新后的 **KnowledgeBaseView**

| 错误码 | 文案 |
| --- | --- |
| A002001 | 知识库不存在 |
| A002002 / A002003 | 名称不合规或冲突 |
| A002006 | 描述不符合规则 |

```bash
curl -s -X PUT "http://localhost:9898/hello-agent/admin/knowledge-bases/$KB_ID" \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"已修订手册","description":""}'
```

### 3.6 删除

`DELETE /admin/knowledge-bases/{id}` — **仅 Admin**

物理删除；库下有 Document（含已禁用）时拒绝（`A002008`）；成功后原 Namespace 可再建。Staff → `A001002`。

**Response**：`data` 为空

```bash
curl -s -X DELETE "http://localhost:9898/hello-agent/admin/knowledge-bases/$KB_ID" \
  -H "Authorization: $TOKEN"
```

### 3.7 上传 Document

`POST /admin/knowledge-bases/{kbId}/documents` — 需登录（Admin / Staff）

`multipart/form-data`。一次只处理一份本地文件；不提供 URL 拉取、不提供下载、不执行切块。同库相同 `originalFilename` 允许重复，每次都是新 Document。

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| file | 是 | 单文件；0 字节 → `A002010` |
| chunkStrategy | 是 | `OVERLAPPING` 或 `STRUCTURE_AWARE` |
| chunkStrategyParams | 是 | **JSON 字符串**（与文件同表单提交）；键必须与种类完全匹配 |

**`OVERLAPPING` 参数**：仅 `chunkSize`、`overlap`；`chunkSize > 0`；`0 ≤ overlap < chunkSize`。

**`STRUCTURE_AWARE` 参数**：仅 `defaultChunkSize`、`maxChunkSize`、`minChunkSize`、`overlap`；前三者 `> 0`；`minChunkSize ≤ defaultChunkSize ≤ maxChunkSize`；`0 ≤ overlap < minChunkSize`。不按媒体类型禁止某一策略。

单位均为 Unicode 字符，无额外绝对值上限。标题层级不是 JSON 字段。

校验顺序：空文件 → 大小（部署配置：单文件 50MB、整次请求 100MB）→ Tika 探测白名单 → 写入 ObjectStorage → 创建记录。仅两者都成功才返回成功；库写入失败会尝试回滚对象。

成功后：`status=UPLOADED`，`sourceType=LOCAL_FILE`，`enabled=true`；该库 `documentCount` 加 1。

**MIME 以 Tika 探测为准**（须带 OriginalFilename，否则 Markdown 可能退化成 `text/plain`）。别名归一后须属于：

`text/plain`、`text/markdown`（含 `text/x-markdown` / `text/x-web-markdown`）、`application/pdf`（含 `application/x-pdf` / `application/acrobat`）、`application/msword`、`application/vnd.openxmlformats-officedocument.wordprocessingml.document`、`application/vnd.ms-powerpoint`、`application/vnd.openxmlformats-officedocument.presentationml.presentation`、`application/vnd.ms-excel`、`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`、`image/png`、`image/jpeg`（含 `image/jpg` / `image/pjpeg`）、`image/svg+xml`。

成功时同时写入规范 `mediaType` 与 `documentFormat`。

**Response `data`**：**DocumentView**

| 错误码 | 文案 |
| --- | --- |
| A002001 | 知识库不存在 |
| A002010 | 文件为空 |
| A002011 | 文件类型不支持 |
| A002012 | 文件大小超过限制 |
| A002013 | 分块策略不合法 |
| A002014 | 分块策略参数不合法 |
| A002015 | 对象存储不可用 |

```bash
curl -s -X POST "http://localhost:9898/hello-agent/admin/knowledge-bases/$KB_ID/documents" \
  -H "Authorization: $TOKEN" \
  -F 'file=@./handbook.pdf' \
  -F 'chunkStrategy=OVERLAPPING' \
  -F 'chunkStrategyParams={"chunkSize":512,"overlap":64}'
```

### 3.8 分页列表 Document

`GET /admin/knowledge-bases/{kbId}/documents` — 需登录

| Query | 必填 | 默认 | 说明 |
| --- | --- | --- | --- |
| page | 否 | 1 | 页码，&lt;1 时按 1 |
| pageSize | 否 | 20 | 每页条数；&lt;1 或 &gt;100 → `A001010` |
| originalFilename | 否 | — | 原始文件名模糊 |
| status | 否 | — | `DocumentStatus` 精确匹配：`UPLOADED` / `CHUNKING` / `CHUNKED` / `FAILED`；非法枚举由框架拒绝 |
| enabled | 否 | — | `true` / `false` 精确匹配；缺省不过滤 |

条件为 **AND**。不做 strategy 筛选。按 **更新时间倒序**。缺省不过滤启用时，已禁用记录仍返回。知识库不存在 → `A002001`。

**Response `data`**

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 2,
  "records": [ ]
}
```

`records` 元素为 **DocumentView**。

```bash
curl -s "http://localhost:9898/hello-agent/admin/knowledge-bases/$KB_ID/documents?page=1&pageSize=20" \
  -H "Authorization: $TOKEN"
```

### 3.9 Document 详情

`GET /admin/knowledge-bases/{kbId}/documents/{docId}` — 需登录

**Response `data`**：**DocumentView**。不存在或不属于该库 → `A002009`。知识库不存在 → `A002001`。

```bash
curl -s "http://localhost:9898/hello-agent/admin/knowledge-bases/$KB_ID/documents/$DOC_ID" \
  -H "Authorization: $TOKEN"
```

### 3.10 修改 ChunkStrategy

`PUT /admin/knowledge-bases/{kbId}/documents/{docId}/chunk-strategy` — 需登录

本阶段 `status` 固定 `UPLOADED`，该接口始终可调用。改种类时整份替换 `chunkStrategyParams`（此处为 JSON **对象**，不是字符串）。可选 `originalFilename`：缺省不改名；若提交则只允许改主名，后缀必须与已存值一致（大小写不敏感）。成功后刷新 `updatedAt`。**不**改 objectKey、不重写对象。

```json
{
  "chunkStrategy": "STRUCTURE_AWARE",
  "chunkStrategyParams": {
    "defaultChunkSize": 512,
    "maxChunkSize": 1024,
    "minChunkSize": 256,
    "overlap": 32
  },
  "originalFilename": "手册.pdf"
}
```

**Response `data`**：更新后的 **DocumentView**

| 错误码 | 文案 |
| --- | --- |
| A002001 | 知识库不存在 |
| A002009 | 文档不存在 |
| A002013 | 分块策略不合法 |
| A002014 | 分块策略参数不合法 |
| A002016 | 文件名不符合规则 |
| A002017 | 不能修改文件名后缀 |

```bash
curl -s -X PUT "http://localhost:9898/hello-agent/admin/knowledge-bases/$KB_ID/documents/$DOC_ID/chunk-strategy" \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"chunkStrategy":"STRUCTURE_AWARE","chunkStrategyParams":{"defaultChunkSize":512,"maxChunkSize":1024,"minChunkSize":256,"overlap":32}}'
```

### 3.11 启用 / 禁用 Document

`PUT /admin/knowledge-bases/{kbId}/documents/{docId}/enabled` — 需登录

与 `status` 无关；不删业务记录、不删对象。禁用后仍可列表/详情，且仍计入 `documentCount`。成功后刷新 `updatedAt`。缺 `enabled` 由框架参数校验拒绝（宏观码 `A000001`）。

```json
{
  "enabled": false
}
```

**Response `data`**：更新后的 **DocumentView**

| 错误码 | 文案 |
| --- | --- |
| A002001 | 知识库不存在 |
| A002009 | 文档不存在 |

```bash
curl -s -X PUT "http://localhost:9898/hello-agent/admin/knowledge-bases/$KB_ID/documents/$DOC_ID/enabled" \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"enabled":false}'
```

### 3.12 删除 Document

`DELETE /admin/knowledge-bases/{kbId}/documents/{docId}` — 需登录

同步删除 ObjectStorage 对象；对象失败则整笔失败，记录仍可查询（`A002015`）。成功后该库 `documentCount` 减 1。

**Response**：`data` 为空

| 错误码 | 文案 |
| --- | --- |
| A002001 | 知识库不存在 |
| A002009 | 文档不存在 |
| A002015 | 对象存储不可用 |

```bash
curl -s -X DELETE "http://localhost:9898/hello-agent/admin/knowledge-bases/$KB_ID/documents/$DOC_ID" \
  -H "Authorization: $TOKEN"
```

---

## 4. 错误码

### 4.1 一级宏观码（`BaseErrorCode`）

| 码       | 说明                            |
| ------- | ----------------------------- |
| S000001 | 系统执行出错                        |
| T000001 | 第三方服务出错                       |
| U000001 | Web 用户端错误                     |
| A000001 | Web 管理端错误（框架层：未登录、参数校验等按路径归入） |
| M000001 | 移动端错误                         |

### 4.2 管理端业务码（`AdminErrorCode`）

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

### 4.3 知识库业务码（`KnowledgeErrorCode`）

| 码 | 文案 |
| --- | --- |
| A002001 | 知识库不存在 |
| A002002 | 名称不符合规则 |
| A002003 | 名称已存在 |
| A002004 | Namespace 不符合规则 |
| A002005 | 命名空间已存在 |
| A002006 | 描述不符合规则 |
| A002007 | 向量模型不合法 |
| A002008 | 知识库下仍有文档，不能删除 |
| A002009 | 文档不存在 |
| A002010 | 文件为空 |
| A002011 | 文件类型不支持 |
| A002012 | 文件大小超过限制 |
| A002013 | 分块策略不合法 |
| A002014 | 分块策略参数不合法 |
| A002015 | 对象存储不可用 |
| A002016 | 文件名不符合规则 |
| A002017 | 不能修改文件名后缀 |

失败响应示例：

```json
{
  "code": "A001001",
  "message": "用户名或密码错误",
  "data": null
}
```

---

## 5. 端点一览

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
| GET    | `/admin/embedding-models`    | 已登录         | EmbeddingModel 配置目录（对象列表） |
| GET    | `/admin/knowledge-bases`     | 已登录         | 知识库分页列表    |
| POST   | `/admin/knowledge-bases`     | 已登录         | 创建知识库      |
| GET    | `/admin/knowledge-bases/{id}` | 已登录        | 知识库详情      |
| PUT    | `/admin/knowledge-bases/{id}` | 已登录        | 改 Name / 描述 |
| DELETE | `/admin/knowledge-bases/{id}` | Admin       | 物理删除（无文档） |
| POST   | `/admin/knowledge-bases/{id}/documents` | 已登录 | 上传 Document（multipart） |
| GET    | `/admin/knowledge-bases/{id}/documents` | 已登录 | 库内 Document 分页 |
| GET    | `/admin/knowledge-bases/{id}/documents/{docId}` | 已登录 | Document 详情 |
| PUT | `/admin/knowledge-bases/{id}/documents/{docId}/chunk-strategy` | 已登录 | 改分块策略；可选改文件名主名 |
| PUT    | `/admin/knowledge-bases/{id}/documents/{docId}/enabled` | 已登录 | 启用 / 禁用 Document |
| DELETE | `/admin/knowledge-bases/{id}/documents/{docId}` | 已登录 | 删除 Document（同步删对象） |


