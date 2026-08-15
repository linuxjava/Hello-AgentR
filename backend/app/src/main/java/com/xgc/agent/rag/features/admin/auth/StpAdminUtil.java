package com.xgc.agent.rag.features.admin.auth;

import cn.dev33.satoken.stp.StpLogic;

/**
 * 管理端独立 Sa-Token 工具。
 *
 * <p>使用独立 {@link #LOGIN_TYPE}，与未来 EndUser 登录态隔离，避免凭证互通。
 * 登录门禁由 {@code AdminInterceptorConfig} 统一拦截；本类供拦截器与业务踢人等场景调用。</p>
 */
public final class StpAdminUtil {

    /**
     * 管理端 loginType 标识。
     */
    public static final String LOGIN_TYPE = "admin";

    /**
     * 绑定到管理端 loginType 的 Sa-Token 逻辑对象。
     */
    public static final StpLogic STP_LOGIC = new StpLogic(LOGIN_TYPE);

    private StpAdminUtil() {
    }

    /**
     * 以 AdminUser 主键作为 loginId 建立登录会话。
     *
     * @param loginId AdminUser.id
     */
    public static void login(Object loginId) {
        STP_LOGIC.login(loginId);
    }

    /**
     * 获取当前请求对应的 token 值。
     *
     * @return token 字符串
     */
    public static String getTokenValue() {
        return STP_LOGIC.getTokenValue();
    }

    /**
     * 校验当前请求已登录；未登录时抛出 Sa-Token 未登录异常。
     */
    public static void checkLogin() {
        STP_LOGIC.checkLogin();
    }

    /**
     * 判断当前请求是否已登录。
     *
     * @return true 表示已登录
     */
    public static boolean isLogin() {
        return STP_LOGIC.isLogin();
    }

    /**
     * 获取当前登录 AdminUser 的主键 ID。
     *
     * @return AdminUser.id
     */
    public static String getLoginIdAsString() {
        return STP_LOGIC.getLoginIdAsString();
    }

    /**
     * 登出当前 token（不影响同账号其它端会话）。
     */
    public static void logout() {
        STP_LOGIC.logout();
    }

    /**
     * 作废指定账号的全部 token（改密 / 重置密码 / 删除后强制下线）。
     *
     * @param loginId AdminUser.id
     */
    public static void logoutAll(Object loginId) {
        STP_LOGIC.logout(loginId);
    }
}
