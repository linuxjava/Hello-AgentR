package com.xgc.agent.rag.admin;

import com.xgc.agent.framework.base.error.exception.ClientException;
import com.xgc.agent.rag.admin.util.AdminCredentialRules;
import com.xgc.agent.rag.admin.util.AdminPasswordHasher;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 密码工具与凭证规则单测（无需 Spring 上下文）。
 */
class AdminCredentialRulesTest {

    /**
     * 验证 BCrypt 哈希与匹配。
     */
    @Test
    void passwordHashAndMatch() {
        AdminPasswordHasher hasher = new AdminPasswordHasher();
        String hash = hasher.hash("admin@123456");
        assertThat(hasher.matches("admin@123456", hash)).isTrue();
        assertThat(hasher.matches("wrong", hash)).isFalse();
    }

    /**
     * 验证用户名合法与非法场景。
     */
    @Test
    void usernameRules() {
        AdminCredentialRules.validateUsername("admin");
        assertThatThrownBy(() -> AdminCredentialRules.validateUsername("ab"))
                .isInstanceOf(ClientException.class);
        assertThatThrownBy(() -> AdminCredentialRules.validateUsername("bad-name"))
                .isInstanceOf(ClientException.class);
    }

    /**
     * 验证密码合法与非法场景。
     */
    @Test
    void passwordRules() {
        AdminCredentialRules.validatePassword("admin@123456");
        assertThatThrownBy(() -> AdminCredentialRules.validatePassword("short1"))
                .isInstanceOf(ClientException.class);
        assertThatThrownBy(() -> AdminCredentialRules.validatePassword("onlyletters"))
                .isInstanceOf(ClientException.class);
    }
}
