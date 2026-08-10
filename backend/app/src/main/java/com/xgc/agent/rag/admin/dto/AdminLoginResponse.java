package com.xgc.agent.rag.admin.dto;

/**
 * 登录成功响应。
 *
 * @param token   Sa-Token 凭证，客户端放入 Authorization 请求头
 * @param profile 当前账号资料
 */
public record AdminLoginResponse(
        /** 登录 token。 */
        String token,
        /** 当前账号资料。 */
        AdminUserView profile
) {
}
