package com.xgc.agent.rag.admin.service;

import com.xgc.agent.rag.admin.dao.entity.AdminUserDO;

/**
 * 当前登录身份解析与角色门禁接口。
 */
public interface AdminAccessService {

    /**
     * 要求当前请求已登录，并返回对应 AdminUser。
     *
     * @return 当前登录账号
     */
    AdminUserDO requireLoginUser();

    /**
     * 要求当前登录用户角色为 Admin。
     *
     * @return 当前管理员账号
     */
    AdminUserDO requireAdmin();
}
