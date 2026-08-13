package com.xgc.agent.rag.features.admin.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 重置他人密码请求体。
 *
 * @param newPassword 新密码
 */
public record AdminResetPasswordRequest(
        /** 新密码。 */
        @NotBlank String newPassword
) {
}
