-- Knowledge Document 表：知识库下的源文件元数据（物理删除，无 deleted 列）
-- 使用方式：在目标库手工执行本脚本（项目不使用 Flyway 自动迁移）
-- 同库允许相同 original_filename 多次出现，故无文件名唯一约束。
CREATE TABLE IF NOT EXISTS t_knowledge_document (
    id                      VARCHAR(64)   NOT NULL,
    knowledge_base_id       VARCHAR(64)   NOT NULL,
    original_filename       VARCHAR(512)  NOT NULL,
    media_type              VARCHAR(128)  NOT NULL,
    document_format         VARCHAR(32)   NOT NULL,
    byte_size               BIGINT        NOT NULL,
    status                  VARCHAR(32)   NOT NULL,
    enabled                 BOOLEAN       NOT NULL DEFAULT TRUE,
    chunk_strategy          VARCHAR(32)   NOT NULL,
    chunk_strategy_params   TEXT          NOT NULL,
    source_type             VARCHAR(32)   NOT NULL,
    object_key              VARCHAR(512)  NOT NULL,
    created_by              VARCHAR(64)   NOT NULL,
    updated_by              VARCHAR(64)   NOT NULL,
    create_time             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_t_knowledge_document PRIMARY KEY (id),
    CONSTRAINT ck_t_knowledge_document_byte_size CHECK (byte_size > 0)
);

CREATE INDEX IF NOT EXISTS idx_t_knowledge_document_kb_update
    ON t_knowledge_document (knowledge_base_id, update_time DESC);

COMMENT ON TABLE t_knowledge_document IS '知识库文档（Document）；源文件在 ObjectStorage；删除为物理删除';

COMMENT ON COLUMN t_knowledge_document.id IS '主键 ID（Snowflake 字符串）';
COMMENT ON COLUMN t_knowledge_document.knowledge_base_id IS '所属 KnowledgeBase id';
COMMENT ON COLUMN t_knowledge_document.original_filename IS '原始文件名；非唯一';
COMMENT ON COLUMN t_knowledge_document.media_type IS 'Tika 规范化后的 MIME（别名已归一）';
COMMENT ON COLUMN t_knowledge_document.document_format IS '业务格式族：TXT/MARKDOWN/PDF/DOC/DOCX/PPT/PPTX/XLS/XLSX/PNG/JPEG/SVG';
COMMENT ON COLUMN t_knowledge_document.byte_size IS '字节大小；必须 > 0';
COMMENT ON COLUMN t_knowledge_document.status IS '本阶段恒 UPLOADED';
COMMENT ON COLUMN t_knowledge_document.enabled IS '是否启用；禁用不删记录与对象，仍计入 documentCount';
COMMENT ON COLUMN t_knowledge_document.chunk_strategy IS 'OVERLAPPING / STRUCTURE_AWARE';
COMMENT ON COLUMN t_knowledge_document.chunk_strategy_params IS '按种类校验后的参数 JSON 文本';
COMMENT ON COLUMN t_knowledge_document.source_type IS '本阶段恒 LOCAL_FILE';
COMMENT ON COLUMN t_knowledge_document.object_key IS '系统生成，含 Namespace；不对外暴露';
COMMENT ON COLUMN t_knowledge_document.created_by IS '创建者 AdminUser id（审计）';
COMMENT ON COLUMN t_knowledge_document.updated_by IS '最后修改者 AdminUser id';
COMMENT ON COLUMN t_knowledge_document.create_time IS '创建时间';
COMMENT ON COLUMN t_knowledge_document.update_time IS '最后更新时间（改策略或启用状态会刷新）';

-- 已有库增量：CREATE IF NOT EXISTS 不会给旧表加列。
ALTER TABLE t_knowledge_document ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;
COMMENT ON COLUMN t_knowledge_document.enabled IS '是否启用；禁用不删记录与对象，仍计入 documentCount';

ALTER TABLE t_knowledge_document ADD COLUMN IF NOT EXISTS document_format VARCHAR(32);
UPDATE t_knowledge_document SET document_format = CASE media_type
    WHEN 'text/plain' THEN 'TXT'
    WHEN 'text/markdown' THEN 'MARKDOWN'
    WHEN 'application/pdf' THEN 'PDF'
    WHEN 'application/msword' THEN 'DOC'
    WHEN 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' THEN 'DOCX'
    WHEN 'application/vnd.ms-powerpoint' THEN 'PPT'
    WHEN 'application/vnd.openxmlformats-officedocument.presentationml.presentation' THEN 'PPTX'
    WHEN 'application/vnd.ms-excel' THEN 'XLS'
    WHEN 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' THEN 'XLSX'
    WHEN 'image/png' THEN 'PNG'
    WHEN 'image/jpeg' THEN 'JPEG'
    WHEN 'image/svg+xml' THEN 'SVG'
    ELSE document_format
END
WHERE document_format IS NULL;
COMMENT ON COLUMN t_knowledge_document.document_format IS '业务格式族：TXT/MARKDOWN/PDF/DOC/DOCX/PPT/PPTX/XLS/XLSX/PNG/JPEG/SVG';
