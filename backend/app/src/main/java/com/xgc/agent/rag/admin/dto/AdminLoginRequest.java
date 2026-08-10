package com.xgc.agent.rag.admin.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 管理端登录请求体。
 *
 * @param username 登录用户名
 * @param password 明文密码
 */
public record AdminLoginRequest(
        /** 登录用户名。 */
        @NotBlank String username,
        /** 明文密码。 */
        @NotBlank String password
) {
}
