package com.xgc.agent.rag.features.admin.dto;

import com.xgc.agent.rag.features.admin.dao.entity.AdminUserRole;
import jakarta.validation.constraints.NotNull;

/**
 * 变更他人角色请求体。
 *
 * @param role 目标角色
 */
public record AdminChangeRoleRequest(
        /** 目标角色。 */
        @NotNull AdminUserRole role
) {
}
