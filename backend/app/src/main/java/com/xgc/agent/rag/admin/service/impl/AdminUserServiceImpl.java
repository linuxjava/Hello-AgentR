package com.xgc.agent.rag.admin.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xgc.agent.framework.base.error.exception.ClientException;
import com.xgc.agent.rag.admin.auth.StpAdminUtil;
import com.xgc.agent.rag.admin.dao.entity.AdminUserDO;
import com.xgc.agent.rag.admin.dao.entity.AdminUserRole;
import com.xgc.agent.rag.admin.dao.mapper.AdminUserMapper;
import com.xgc.agent.rag.admin.dto.AdminChangeRoleRequest;
import com.xgc.agent.rag.admin.dto.AdminResetPasswordRequest;
import com.xgc.agent.rag.admin.dto.AdminUserCreateRequest;
import com.xgc.agent.rag.admin.dto.AdminUserPageResponse;
import com.xgc.agent.rag.admin.dto.AdminUserView;
import com.xgc.agent.rag.admin.error.AdminErrorCode;
import com.xgc.agent.rag.admin.service.AdminAccessService;
import com.xgc.agent.rag.admin.service.AdminUserService;
import com.xgc.agent.rag.admin.util.AdminCredentialRules;
import com.xgc.agent.rag.admin.util.AdminPasswordHasher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * {@link AdminUserService} 默认实现。
 */
@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    /**
     * 默认分页大小。
     */
    private static final long DEFAULT_PAGE_SIZE = 20L;

    /**
     * 分页大小上限；超过则拒绝。
     */
    private static final long MAX_PAGE_SIZE = 100L;

    /**
     * AdminUser Mapper。
     */
    private final AdminUserMapper adminUserMapper;

    /**
     * 密码哈希工具。
     */
    private final AdminPasswordHasher adminPasswordHasher;

    /**
     * 登录身份与 Admin 门禁。
     */
    private final AdminAccessService adminAccessService;

    @Override
    public AdminUserPageResponse page(Long page, Long pageSize, String username, AdminUserRole role) {
        adminAccessService.requireLoginUser();
        long pageNo = page == null || page < 1 ? 1L : page;
        long size = pageSize == null ? DEFAULT_PAGE_SIZE : pageSize;
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new ClientException(AdminErrorCode.PAGE_SIZE_INVALID.message(), AdminErrorCode.PAGE_SIZE_INVALID);
        }

        Page<AdminUserDO> result = adminUserMapper.selectPage(
                new Page<>(pageNo, size),
                Wrappers.lambdaQuery(AdminUserDO.class)
                        .like(StringUtils.hasText(username), AdminUserDO::getUsername, username)
                        .eq(role != null, AdminUserDO::getRole, role)
                        .orderByDesc(AdminUserDO::getCreateTime)
        );
        List<AdminUserView> records = result.getRecords().stream().map(AdminUserView::from).toList();
        return new AdminUserPageResponse(result.getCurrent(), result.getSize(), result.getTotal(), records);
    }

    @Override
    @Transactional
    public AdminUserView create(AdminUserCreateRequest request) {
        adminAccessService.requireAdmin();
        AdminCredentialRules.validateUsername(request.username());
        AdminCredentialRules.validatePassword(request.password());
        if (request.role() == null) {
            throw new ClientException(AdminErrorCode.ROLE_INVALID.message(), AdminErrorCode.ROLE_INVALID);
        }
        Long exists = adminUserMapper.selectCount(Wrappers.lambdaQuery(AdminUserDO.class)
                .eq(AdminUserDO::getUsername, request.username()));
        if (exists != null && exists > 0) {
            throw new ClientException(AdminErrorCode.USERNAME_EXISTS.message(), AdminErrorCode.USERNAME_EXISTS);
        }

        AdminUserDO created = AdminUserDO.builder()
                .username(request.username())
                .passwordHash(adminPasswordHasher.hash(request.password()))
                .role(request.role())
                .bootstrap(Boolean.FALSE)
                .build();
        adminUserMapper.insert(created);
        return AdminUserView.from(created);
    }

    @Override
    @Transactional
    public void resetPassword(String id, AdminResetPasswordRequest request) {
        adminAccessService.requireAdmin();
        AdminUserDO target = requireUser(id);
        AdminCredentialRules.validatePassword(request.newPassword());
        target.setPasswordHash(adminPasswordHasher.hash(request.newPassword()));
        adminUserMapper.updateById(target);
        StpAdminUtil.logoutAll(target.getId());
    }

    @Override
    @Transactional
    public AdminUserView changeRole(String id, AdminChangeRoleRequest request) {
        adminAccessService.requireAdmin();
        AdminUserDO target = requireUser(id);
        if (request.role() == null) {
            throw new ClientException(AdminErrorCode.ROLE_INVALID.message(), AdminErrorCode.ROLE_INVALID);
        }
        if (target.getRole() == AdminUserRole.ADMIN
                && request.role() == AdminUserRole.STAFF
                && countByRole(AdminUserRole.ADMIN) <= 1) {
            throw new ClientException(AdminErrorCode.PROTECTION_VIOLATION.message(), AdminErrorCode.PROTECTION_VIOLATION);
        }
        target.setRole(request.role());
        adminUserMapper.updateById(target);
        return AdminUserView.from(target);
    }

    @Override
    @Transactional
    public void delete(String id) {
        AdminUserDO operator = adminAccessService.requireAdmin();
        AdminUserDO target = requireUser(id);

        if (Boolean.TRUE.equals(target.getBootstrap())) {
            throw new ClientException(AdminErrorCode.PROTECTION_VIOLATION.message(), AdminErrorCode.PROTECTION_VIOLATION);
        }
        if (operator.getId().equals(target.getId())) {
            throw new ClientException(AdminErrorCode.PROTECTION_VIOLATION.message(), AdminErrorCode.PROTECTION_VIOLATION);
        }
        if (countAll() <= 1) {
            throw new ClientException(AdminErrorCode.PROTECTION_VIOLATION.message(), AdminErrorCode.PROTECTION_VIOLATION);
        }
        if (target.getRole() == AdminUserRole.ADMIN && countByRole(AdminUserRole.ADMIN) <= 1) {
            throw new ClientException(AdminErrorCode.PROTECTION_VIOLATION.message(), AdminErrorCode.PROTECTION_VIOLATION);
        }

        adminUserMapper.deleteById(target.getId());
        StpAdminUtil.logoutAll(target.getId());
    }

    /**
     * 按 ID 加载账号，不存在则抛错。
     *
     * @param id 主键
     * @return 实体
     */
    private AdminUserDO requireUser(String id) {
        AdminUserDO user = adminUserMapper.selectById(id);
        if (user == null) {
            throw new ClientException(AdminErrorCode.USER_NOT_FOUND.message(), AdminErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    /**
     * 统计全部账号数。
     */
    private long countAll() {
        Long count = adminUserMapper.selectCount(Wrappers.lambdaQuery(AdminUserDO.class));
        return count == null ? 0L : count;
    }

    /**
     * 按角色统计账号数。
     */
    private long countByRole(AdminUserRole role) {
        Long count = adminUserMapper.selectCount(Wrappers.lambdaQuery(AdminUserDO.class)
                .eq(AdminUserDO::getRole, role));
        return count == null ? 0L : count;
    }
}
