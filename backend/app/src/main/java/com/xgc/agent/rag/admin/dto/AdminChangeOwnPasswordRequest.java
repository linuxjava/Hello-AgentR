package com.xgc.agent.rag.admin.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 修改自己密码请求体。
 *
 * @param oldPassword 当前密码
 * @param newPassword 新密码
 */
public record AdminChangeOwnPasswordRequest(
        /** 当前（旧）密码。 */
        @NotBlank String oldPassword,
        /** 新密码。 */
        @NotBlank String newPassword
) {
}
