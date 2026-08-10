package com.xgc.agent.rag.admin.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * AdminUser 密码哈希工具。
 *
 * <p>使用 BCrypt 单向哈希存储密码，禁止明文落库。</p>
 */
@Component
public class AdminPasswordHasher {

    /**
     * BCrypt 编码器实例。
     */
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * 对明文密码进行哈希。
     *
     * @param rawPassword 明文密码
     * @return BCrypt 哈希串
     */
    public String hash(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    /**
     * 校验明文密码是否与哈希匹配。
     *
     * @param rawPassword  明文密码
     * @param passwordHash 库存哈希
     * @return true 表示匹配
     */
    public boolean matches(String rawPassword, String passwordHash) {
        return encoder.matches(rawPassword, passwordHash);
    }
}
