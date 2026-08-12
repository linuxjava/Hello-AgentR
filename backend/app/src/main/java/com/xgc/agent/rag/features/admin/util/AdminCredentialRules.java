package com.xgc.agent.rag.features.admin.util;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.admin.error.AdminErrorCode;

import java.util.regex.Pattern;

/**
 * AdminUser 用户名与密码格式规则。
 *
 * <ul>
 *   <li>用户名：4–32 位，仅字母数字下划线，大小写敏感</li>
 *   <li>密码：8–64 位，须同时包含字母与数字</li>
 * </ul>
 */
public final class AdminCredentialRules {

    /**
     * 用户名正则：长度 4–32，字符集 [a-zA-Z0-9_]。
     */
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{4,32}$");

    /**
     * 密码须包含至少一个字母。
     */
    private static final Pattern PASSWORD_HAS_LETTER = Pattern.compile(".*[A-Za-z].*");

    /**
     * 密码须包含至少一个数字。
     */
    private static final Pattern PASSWORD_HAS_DIGIT = Pattern.compile(".*\\d.*");

    private AdminCredentialRules() {
    }

    /**
     * 校验用户名格式；不合规则抛出客户端异常。
     *
     * @param username 待校验用户名
     */
    public static void validateUsername(String username) {
        if (username == null || !USERNAME_PATTERN.matcher(username).matches()) {
            throw new WebAdminException(AdminErrorCode.USERNAME_INVALID.message(), AdminErrorCode.USERNAME_INVALID);
        }
    }

    /**
     * 校验密码格式；不合规则抛出客户端异常。
     *
     * @param password 待校验明文密码
     */
    public static void validatePassword(String password) {
        if (password == null || password.length() < 8 || password.length() > 64) {
            throw new WebAdminException(AdminErrorCode.PASSWORD_INVALID.message(), AdminErrorCode.PASSWORD_INVALID);
        }
        if (!PASSWORD_HAS_LETTER.matcher(password).matches() || !PASSWORD_HAS_DIGIT.matcher(password).matches()) {
            throw new WebAdminException(AdminErrorCode.PASSWORD_INVALID.message(), AdminErrorCode.PASSWORD_INVALID);
        }
    }
}
