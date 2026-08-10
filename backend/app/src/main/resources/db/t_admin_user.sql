-- AdminUser 表：管理端账号（与 EndUser 隔离；物理删除，无 deleted 列）
-- 使用方式：在目标库手工执行本脚本（项目不使用 Flyway 自动迁移）
CREATE TABLE IF NOT EXISTS t_admin_user (
    id              VARCHAR(64)  NOT NULL,
    username        VARCHAR(32)  NOT NULL,
    password_hash   VARCHAR(100) NOT NULL,
    role            VARCHAR(16)  NOT NULL,
    bootstrap       BOOLEAN      NOT NULL DEFAULT FALSE,
    create_time     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_t_admin_user PRIMARY KEY (id),
    CONSTRAINT uk_t_admin_user_username UNIQUE (username),
    CONSTRAINT ck_t_admin_user_role CHECK (role IN ('ADMIN', 'STAFF'))
);

CREATE INDEX IF NOT EXISTS idx_t_admin_user_role ON t_admin_user (role);
CREATE INDEX IF NOT EXISTS idx_t_admin_user_bootstrap ON t_admin_user (bootstrap);

COMMENT ON TABLE t_admin_user IS '管理端账号（AdminUser）；与 EndUser 身份隔离；删除为物理删除，无逻辑删除列';

COMMENT ON COLUMN t_admin_user.id IS '主键 ID（Snowflake 字符串）';
COMMENT ON COLUMN t_admin_user.username IS '登录用户名；全局唯一；创建后不可变更；长度 4–32，仅字母数字下划线';
COMMENT ON COLUMN t_admin_user.password_hash IS '密码哈希（BCrypt）；禁止在 API 响应中返回';
COMMENT ON COLUMN t_admin_user.role IS '角色编码：ADMIN=管理员，STAFF=运营人员';
COMMENT ON COLUMN t_admin_user.bootstrap IS '是否为 Bootstrap Admin（系统初始管理员）；为 true 时不可删除，标记不可去除';
COMMENT ON COLUMN t_admin_user.create_time IS '创建时间';
COMMENT ON COLUMN t_admin_user.update_time IS '最后更新时间';
