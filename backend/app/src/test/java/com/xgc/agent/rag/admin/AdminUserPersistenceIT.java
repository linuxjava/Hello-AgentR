package com.xgc.agent.rag.admin;

import com.xgc.agent.rag.HelloAgentApplication;
import com.xgc.agent.rag.admin.dao.mapper.AdminUserMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * AdminUser 持久化装配验证。
 *
 * <p>依赖本地 PostgreSQL + Redis；表需已按 {@code resources/db/t_admin_user.sql} 建好。</p>
 */
@SpringBootTest(classes = HelloAgentApplication.class)
class AdminUserPersistenceIT {

    /**
     * MyBatis Mapper。
     */
    @Autowired
    private AdminUserMapper adminUserMapper;

    /**
     * 验证 Spring 上下文可注入 Mapper，并可执行计数查询。
     */
    @Test
    void contextLoadsAdminUserPersistence() {
        assertThat(adminUserMapper).isNotNull();
        assertThat(adminUserMapper.selectCount(null)).isGreaterThanOrEqualTo(0);
    }
}
