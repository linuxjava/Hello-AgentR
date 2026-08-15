package com.xgc.agent.rag.features.admin.service;

import com.xgc.agent.rag.features.admin.dao.entity.AdminUserDO;

/**
 * 当前登录身份解析与角色门禁接口。
 *
 * <p>「是否已登录」由 {@code AdminSaTokenConfig} 统一拦截。仅写审计字段时用
 * {@link #requireLoginUserId()}；需要实体（改密、{@code /me}）或 Admin 角色时用本接口其余方法。</p>
 */
public interface AdminAccessService {

    /**
     * 返回当前登录 AdminUser 主键（Sa-Token loginId），不查库。
     *
     * @return AdminUser.id
     */
    String requireLoginUserId();

    /**
     * 加载当前登录 AdminUser（假定拦截器已校验 token）。
     *
     * @return 当前登录账号
     */
    AdminUserDO requireLoginUser();

    /**
     * 要求当前登录用户角色为 Admin，并返回该账号。
     *
     * @return 当前管理员账号
     */
    AdminUserDO requireAdmin();
}
