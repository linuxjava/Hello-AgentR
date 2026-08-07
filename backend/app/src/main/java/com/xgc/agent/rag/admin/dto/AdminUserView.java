package com.xgc.agent.rag.admin.dto;

import com.xgc.agent.rag.admin.dao.entity.AdminUserDO;
import com.xgc.agent.rag.admin.dao.entity.AdminUserRole;

import java.util.Date;

/**
 * AdminUser 对外展示视图（永不包含密码或哈希）。
 *
 * @param id        主键
 * @param username  用户名
 * @param role      角色
 * @param bootstrap 是否 Bootstrap Admin
 * @param createdAt 创建时间
 */
public record AdminUserView(
        /** 主键 ID。 */
        String id,
        /** 用户名。 */
        String username,
        /** 角色。 */
        AdminUserRole role,
        /** 是否 Bootstrap Admin。 */
        Boolean bootstrap,
        /** 创建时间。 */
        Date createdAt
) {
    /**
     * 从持久化实体转换视图。
     *
     * @param source 实体
     * @return 视图
     */
    public static AdminUserView from(AdminUserDO source) {
        return new AdminUserView(
                source.getId(),
                source.getUsername(),
                source.getRole(),
                source.getBootstrap(),
                source.getCreateTime()
        );
    }
}
