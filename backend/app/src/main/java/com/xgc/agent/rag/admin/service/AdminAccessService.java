package com.xgc.agent.rag.admin.service;

import com.xgc.agent.rag.admin.dao.entity.AdminUserDO;

/**
 * 当前登录身份解析与角色门禁接口。
 *
 * <p>「是否已登录」由 {@code AdminSaTokenConfig} 统一拦截；本接口用于需要当前用户实体
 *（如改密、删自己保护）或 Admin 角色校验的场景。</p>
 */
public interface AdminAccessService {

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
