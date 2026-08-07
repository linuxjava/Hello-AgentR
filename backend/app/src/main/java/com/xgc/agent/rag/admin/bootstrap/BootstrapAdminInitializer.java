package com.xgc.agent.rag.admin.bootstrap;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xgc.agent.rag.admin.dao.entity.AdminUserDO;
import com.xgc.agent.rag.admin.dao.entity.AdminUserRole;
import com.xgc.agent.rag.admin.dao.mapper.AdminUserMapper;
import com.xgc.agent.rag.admin.util.AdminPasswordHasher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Bootstrap Admin 启动初始化器。
 *
 * <p>规则：</p>
 * <ul>
 *   <li>已存在 {@code bootstrap=true} 账号：跳过，不改密</li>
 *   <li>不存在 bootstrap，且用户名 {@code admin} 可用：插入初始管理员</li>
 *   <li>用户名 {@code admin} 被非 bootstrap 账号占用：抛错阻止启动</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BootstrapAdminInitializer implements ApplicationRunner {

    /**
     * Bootstrap 约定用户名。
     */
    public static final String BOOTSTRAP_USERNAME = "admin";

    /**
     * Bootstrap 初始明文密码（仅首次插入使用；请上线后立即修改）。
     */
    public static final String BOOTSTRAP_RAW_PASSWORD = "admin@123456";

    /**
     * AdminUser Mapper。
     */
    private final AdminUserMapper adminUserMapper;

    /**
     * 密码哈希工具。
     */
    private final AdminPasswordHasher adminPasswordHasher;

    /**
     * 应用就绪后执行 Bootstrap 检查与必要时插入。
     *
     * @param args 启动参数
     */
    @Override
    public void run(ApplicationArguments args) {
        Long bootstrapCount = adminUserMapper.selectCount(Wrappers.lambdaQuery(AdminUserDO.class)
                .eq(AdminUserDO::getBootstrap, true));
        if (bootstrapCount != null && bootstrapCount > 0) {
            log.info("Bootstrap Admin already exists, skip initialization");
            return;
        }

        AdminUserDO existing = adminUserMapper.selectOne(Wrappers.lambdaQuery(AdminUserDO.class)
                .eq(AdminUserDO::getUsername, BOOTSTRAP_USERNAME));
        if (existing != null) {
            throw new IllegalStateException(
                    "Cannot initialize Bootstrap Admin: username 'admin' is occupied by a non-bootstrap AdminUser (id="
                            + existing.getId() + "). Refusing to start.");
        }

        AdminUserDO bootstrap = AdminUserDO.builder()
                .username(BOOTSTRAP_USERNAME)
                .passwordHash(adminPasswordHasher.hash(BOOTSTRAP_RAW_PASSWORD))
                .role(AdminUserRole.ADMIN)
                .bootstrap(Boolean.TRUE)
                .build();
        adminUserMapper.insert(bootstrap);
        log.info("Bootstrap Admin created: username={}, role=ADMIN, bootstrap=true (please change password ASAP)",
                BOOTSTRAP_USERNAME);
    }
}
