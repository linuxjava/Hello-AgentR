package com.xgc.agent.rag.admin.dao.entity;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * AdminUser 固定角色枚举；存库值为 {@link #code}。
 */
@Getter
@RequiredArgsConstructor
public enum AdminUserRole {

    /** 管理员：可进行账号治理（创建 / 删除 / 重置他人密码 / 变更角色）。 */
    ADMIN("ADMIN"),

    /** 运营人员：可登录、列表查询、修改自己密码；不可做账号治理写操作。 */
    STAFF("STAFF");

    /**
     * 存库编码（与表字段 {@code role} 及 CHECK 约束一致）。
     */
    @EnumValue
    private final String code;

    /**
     * 按存库编码解析角色。
     *
     * @param code 角色编码（ADMIN / STAFF）
     * @return 对应枚举
     */
    public static AdminUserRole fromCode(String code) {
        for (AdminUserRole role : values()) {
            if (role.code.equals(code)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown AdminUserRole: " + code);
    }
}
