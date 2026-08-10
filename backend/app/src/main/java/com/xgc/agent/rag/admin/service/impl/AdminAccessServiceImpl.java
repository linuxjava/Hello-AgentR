package com.xgc.agent.rag.admin.service.impl;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.admin.auth.StpAdminUtil;
import com.xgc.agent.rag.admin.dao.entity.AdminUserDO;
import com.xgc.agent.rag.admin.dao.entity.AdminUserRole;
import com.xgc.agent.rag.admin.dao.mapper.AdminUserMapper;
import com.xgc.agent.rag.admin.error.AdminErrorCode;
import com.xgc.agent.rag.admin.service.AdminAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * {@link AdminAccessService} 默认实现。
 */
@Service
@RequiredArgsConstructor
public class AdminAccessServiceImpl implements AdminAccessService {

    /**
     * AdminUser Mapper。
     */
    private final AdminUserMapper adminUserMapper;

    @Override
    public AdminUserDO requireLoginUser() {
        StpAdminUtil.checkLogin();
        String loginId = StpAdminUtil.getLoginIdAsString();
        AdminUserDO user = adminUserMapper.selectById(loginId);
        if (user == null) {
            throw new WebAdminException(AdminErrorCode.USER_NOT_FOUND.message(), AdminErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    @Override
    public AdminUserDO requireAdmin() {
        AdminUserDO current = requireLoginUser();
        if (current.getRole() != AdminUserRole.ADMIN) {
            throw new WebAdminException(AdminErrorCode.FORBIDDEN.message(), AdminErrorCode.FORBIDDEN);
        }
        return current;
    }
}
