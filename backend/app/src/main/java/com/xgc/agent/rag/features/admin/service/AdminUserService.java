package com.xgc.agent.rag.features.admin.service;

import com.xgc.agent.rag.features.admin.dao.entity.AdminUserRole;
import com.xgc.agent.rag.features.admin.dto.AdminChangeRoleRequest;
import com.xgc.agent.rag.features.admin.dto.AdminResetPasswordRequest;
import com.xgc.agent.rag.features.admin.dto.AdminUserCreateRequest;
import com.xgc.agent.rag.features.admin.dto.AdminUserPageResponse;
import com.xgc.agent.rag.features.admin.dto.AdminUserView;

/**
 * AdminUser 账号治理用例接口。
 */
public interface AdminUserService {

    /**
     * 分页列表；Admin / Staff 均可调用。
     *
     * @param page     页码，空或 &lt;1 时按 1
     * @param pageSize 每页条数，空则 20，&gt;100 拒绝
     * @param username 用户名模糊筛选，可空
     * @param role     角色精确筛选，可空
     * @return 分页结果
     */
    AdminUserPageResponse page(Long page, Long pageSize, String username, AdminUserRole role);

    /**
     * 创建 AdminUser；仅 Admin 可调用。
     *
     * @param request 用户名、初始密码、角色
     * @return 新建账号视图
     */
    AdminUserView create(AdminUserCreateRequest request);

    /**
     * 重置他人密码（含 Bootstrap）；成功后踢掉目标全部会话。仅 Admin。
     *
     * @param id      目标账号 ID
     * @param request 新密码
     */
    void resetPassword(String id, AdminResetPasswordRequest request);

    /**
     * 变更他人角色；不得使 Admin 人数降为零。仅 Admin。
     *
     * @param id      目标账号 ID
     * @param request 目标角色
     * @return 更新后视图
     */
    AdminUserView changeRole(String id, AdminChangeRoleRequest request);

    /**
     * 物理删除他人账号。
     *
     * <p>保护：不可删 Bootstrap、不可删自己、不可造成零账号、不可造成零 Admin。</p>
     *
     * @param id 目标账号 ID
     */
    void delete(String id);
}
