package com.xgc.agent.rag.features.admin.dto;

import com.xgc.agent.rag.features.admin.dao.entity.AdminUserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 创建 AdminUser 请求体。
 *
 * @param username 用户名（创建后不可改）
 * @param password 初始明文密码
 * @param role     角色：ADMIN 或 STAFF
 */
public record AdminUserCreateRequest(
        /** 用户名。 */
        @NotBlank String username,
        /** 初始明文密码。 */
        @NotBlank String password,
        /** 角色。 */
        @NotNull AdminUserRole role
) {
}
