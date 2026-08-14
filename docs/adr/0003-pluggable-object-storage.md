# 对象存储用配置驱动的可插拔后端

Knowledge Document 的源文件落在部署级、同一时刻仅一个活跃的 ObjectStorage 上。业务只依赖「写入 / 删除 / 按系统生成的 objectKey 定位」，不绑定 S3 SDK，也不按文档或知识库选择厂商。首版 YAML 声明 `s3`，预留换成 `oss`；密钥只引用环境变量，改配置须重启。这样以后换云不必改 Document 模型，也避免把存储厂商做成运营可选项（那会变成第二套 Provider 目录）。

**实现落点**：端口、S3 适配器与配置绑定在 `fw-base`（跨业务基建）。YAML 用 `type` 选择唯一活跃后端，S3 / OSS 参数分挂子块、只校验当前 type。Knowledge 只拥有 objectKey 约定（`{namespace}/{documentId}`），并把存储失败映射为管理端 `A002015`。fw-base 不得依赖 Document / Knowledge 错误码。S3 适配器在首次 put/delete 时若配置桶不存在则自动创建（账号须有建桶权限；面向 MinIO 等兼容端点，不在启动期建桶以免挡登录）。

## Considered Options

- **业务代码直接调用 S3**：实现快，但换 OSS 要改领域服务，读者会以为存储就是 AWS。
- **每文档 / 每库绑定 storageProvider**：与 EmbeddingModel 目录同构，但本产品没有「按库选盘」故事，配置与权限面会膨胀。
- **管理 API 切换 bucket/厂商**：运营误切会导致已有 objectKey 全部失效。
