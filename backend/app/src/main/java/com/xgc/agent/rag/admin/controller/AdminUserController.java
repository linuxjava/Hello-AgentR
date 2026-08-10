package com.xgc.agent.rag.admin.controller;

import com.xgc.agent.framework.base.result.R;
import com.xgc.agent.rag.admin.dao.entity.AdminUserRole;
import com.xgc.agent.rag.admin.dto.AdminChangeRoleRequest;
import com.xgc.agent.rag.admin.dto.AdminResetPasswordRequest;
import com.xgc.agent.rag.admin.dto.AdminUserCreateRequest;
import com.xgc.agent.rag.admin.dto.AdminUserPageResponse;
import com.xgc.agent.rag.admin.dto.AdminUserView;
import com.xgc.agent.rag.admin.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * AdminUser 账号治理 HTTP 入口。
 *
 * <p>路径前缀 {@code /admin/users}；写操作仅 Admin，列表 Admin/Staff 均可。</p>
 */
@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    /**
     * 账号治理用例服务。
     */
    private final AdminUserService adminUserService;

    /**
     * 分页查询 AdminUser 列表。
     *
     * @param page     页码，可选
     * @param pageSize 每页条数，可选（默认 20，上限 100）
     * @param username 用户名模糊筛选，可选
     * @param role     角色精确筛选，可选
     * @return 分页结果
     */
    @GetMapping
    public R<AdminUserPageResponse> page(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) AdminUserRole role
    ) {
        return R.success(adminUserService.page(page, pageSize, username, role));
    }

    /**
     * 创建 AdminUser。
     *
     * @param request 用户名、密码、角色
     * @return 新建账号视图
     */
    @PostMapping
    public R<AdminUserView> create(@Valid @RequestBody AdminUserCreateRequest request) {
        return R.success(adminUserService.create(request));
    }

    /**
     * 重置指定账号密码。
     *
     * @param id      目标账号 ID
     * @param request 新密码
     * @return 空成功响应
     */
    @PutMapping("/{id}/password")
    public R<Void> resetPassword(@PathVariable String id, @Valid @RequestBody AdminResetPasswordRequest request) {
        adminUserService.resetPassword(id, request);
        return R.success();
    }

    /**
     * 变更指定账号角色。
     *
     * @param id      目标账号 ID
     * @param request 目标角色
     * @return 更新后视图
     */
    @PutMapping("/{id}/role")
    public R<AdminUserView> changeRole(@PathVariable String id, @Valid @RequestBody AdminChangeRoleRequest request) {
        return R.success(adminUserService.changeRole(id, request));
    }

    /**
     * 物理删除指定账号。
     *
     * @param id 目标账号 ID
     * @return 空成功响应
     */
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable String id) {
        adminUserService.delete(id);
        return R.success();
    }
}
