package com.xgc.agent.rag.admin.error;

import com.xgc.agent.framework.base.error.code.IErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 管理端身份与账号相关错误码（C001xxx）。
 */
@Getter
@RequiredArgsConstructor
public enum AdminErrorCode implements IErrorCode {

    /** 登录失败（统一文案，不区分用户名是否存在）。 */
    LOGIN_FAILED("C001001", "用户名或密码错误"),

    /** 当前账号无权执行该操作（如 Staff 调用治理写接口）。 */
    FORBIDDEN("C001002", "无权限"),

    /** 目标 AdminUser 不存在。 */
    USER_NOT_FOUND("C001003", "账号不存在"),

    /** 用户名不符合长度或字符集规则。 */
    USERNAME_INVALID("C001004", "用户名不符合规则"),

    /** 用户名已被占用。 */
    USERNAME_EXISTS("C001005", "用户名已存在"),

    /** 密码不符合长度或复杂度规则。 */
    PASSWORD_INVALID("C001006", "密码不符合规则"),

    /** 新密码与旧密码相同。 */
    PASSWORD_SAME_AS_OLD("C001007", "新密码不能与旧密码相同"),

    /** 修改自己密码时旧密码不正确。 */
    OLD_PASSWORD_WRONG("C001008", "旧密码错误"),

    /** 触发 Bootstrap / 末账号 / 末 Admin / 禁止删自己等保护规则。 */
    PROTECTION_VIOLATION("C001009", "操作被保护规则拒绝"),

    /** 分页 pageSize 非法（&lt;1 或 &gt;100）。 */
    PAGE_SIZE_INVALID("C001010", "分页参数不合法"),

    /** 角色取值非法。 */
    ROLE_INVALID("C001011", "角色不合法");

    /**
     * 错误码。
     */
    private final String code;

    /**
     * 默认错误消息。
     */
    private final String message;

    @Override
    public String code() {
        return code;
    }

    @Override
    public String message() {
        return message;
    }
}
