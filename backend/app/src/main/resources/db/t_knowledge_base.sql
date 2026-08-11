-- KnowledgeBase 表：知识库容器（不含 Document；物理删除，无 deleted 列）
-- 使用方式：在目标库手工执行本脚本（项目不使用 Flyway 自动迁移）
CREATE TABLE IF NOT EXISTS t_knowledge_base (
    id               VARCHAR(64)  NOT NULL,
    name             VARCHAR(64)  NOT NULL,
    description      VARCHAR(200),
    namespace        VARCHAR(32)  NOT NULL,
    embedding_model  VARCHAR(64)  NOT NULL,
    created_by       VARCHAR(64)  NOT NULL,
    updated_by       VARCHAR(64)  NOT NULL,
    create_time      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_t_knowledge_base PRIMARY KEY (id),
    CONSTRAINT uk_t_knowledge_base_name UNIQUE (name),
    CONSTRAINT uk_t_knowledge_base_namespace UNIQUE (namespace)
);

CREATE INDEX IF NOT EXISTS idx_t_knowledge_base_create_time ON t_knowledge_base (create_time DESC);

COMMENT ON TABLE t_knowledge_base IS '知识库容器（KnowledgeBase）；本阶段不含文档；删除为物理删除，无逻辑删除列';

COMMENT ON COLUMN t_knowledge_base.id IS '主键 ID（Snowflake 字符串）';
COMMENT ON COLUMN t_knowledge_base.name IS '显示名；去首尾空白后 1–64；全局唯一；可改';
COMMENT ON COLUMN t_knowledge_base.description IS '可选说明；最长 200；可空';
COMMENT ON COLUMN t_knowledge_base.namespace IS '隔离键；人填；[a-z0-9]{2,32}；全局唯一；创建后不可改';
COMMENT ON COLUMN t_knowledge_base.embedding_model IS '创建时绑定的嵌入模型标识；创建后不可改';
COMMENT ON COLUMN t_knowledge_base.created_by IS '创建者 AdminUser id（审计，非 ACL）';
COMMENT ON COLUMN t_knowledge_base.updated_by IS '最后修改者 AdminUser id';
COMMENT ON COLUMN t_knowledge_base.create_time IS '创建时间';
COMMENT ON COLUMN t_knowledge_base.update_time IS '最后更新时间';
