package com.xgc.agent.rag.features.admin.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.admin.auth.StpAdminUtil;
import com.xgc.agent.rag.features.admin.dao.entity.AdminUserDO;
import com.xgc.agent.rag.features.admin.dao.mapper.AdminUserMapper;
import com.xgc.agent.rag.features.admin.dto.AdminChangeOwnPasswordRequest;
import com.xgc.agent.rag.features.admin.dto.AdminLoginRequest;
import com.xgc.agent.rag.features.admin.dto.AdminLoginResponse;
import com.xgc.agent.rag.features.admin.dto.AdminUserView;
import com.xgc.agent.rag.features.admin.error.AdminErrorCode;
import com.xgc.agent.rag.features.admin.service.AdminAccessService;
import com.xgc.agent.rag.features.admin.service.AdminAuthService;
import com.xgc.agent.rag.features.admin.util.AdminCredentialRules;
import com.xgc.agent.rag.features.admin.util.AdminPasswordHasher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link AdminAuthService} 默认实现。
 */
@Service
@RequiredArgsConstructor
public class AdminAuthServiceImpl implements AdminAuthService {

    /**
     * AdminUser Mapper。
     */
    private final AdminUserMapper adminUserMapper;

    /**
     * 密码哈希工具。
     */
    private final AdminPasswordHasher adminPasswordHasher;

    /**
     * 登录身份门禁。
     */
    private final AdminAccessService adminAccessService;

    @Override
    public AdminLoginResponse login(AdminLoginRequest request) {
        AdminUserDO user = adminUserMapper.selectOne(Wrappers.lambdaQuery(AdminUserDO.class)
                .eq(AdminUserDO::getUsername, request.username()));
        if (user == null || !adminPasswordHasher.matches(request.password(), user.getPasswordHash())) {
            throw new WebAdminException(AdminErrorCode.LOGIN_FAILED.message(), AdminErrorCode.LOGIN_FAILED);
        }

        StpAdminUtil.login(user.getId());
        return new AdminLoginResponse(StpAdminUtil.getTokenValue(), AdminUserView.from(user));
    }

    @Override
    public void logout() {
        if (StpAdminUtil.isLogin()) {
            StpAdminUtil.logout();
        }
    }

    @Override
    public AdminUserView me() {
        return AdminUserView.from(adminAccessService.requireLoginUser());
    }

    @Override
    @Transactional
    public void changeOwnPassword(AdminChangeOwnPasswordRequest request) {
        AdminUserDO current = adminAccessService.requireLoginUser();
        if (!adminPasswordHasher.matches(request.oldPassword(), current.getPasswordHash())) {
            throw new WebAdminException(AdminErrorCode.OLD_PASSWORD_WRONG.message(), AdminErrorCode.OLD_PASSWORD_WRONG);
        }
        AdminCredentialRules.validatePassword(request.newPassword());
        if (adminPasswordHasher.matches(request.newPassword(), current.getPasswordHash())) {
            throw new WebAdminException(AdminErrorCode.PASSWORD_SAME_AS_OLD.message(), AdminErrorCode.PASSWORD_SAME_AS_OLD);
        }

        current.setPasswordHash(adminPasswordHasher.hash(request.newPassword()));
        adminUserMapper.updateById(current);
        StpAdminUtil.logoutAll(current.getId());
    }
}
