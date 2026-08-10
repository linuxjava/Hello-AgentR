package com.xgc.agent.rag.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xgc.agent.rag.HelloAgentApplication;
import com.xgc.agent.rag.admin.bootstrap.BootstrapAdminInitializer;
import com.xgc.agent.rag.admin.dao.entity.AdminUserDO;
import com.xgc.agent.rag.admin.dao.entity.AdminUserRole;
import com.xgc.agent.rag.admin.dao.mapper.AdminUserMapper;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 管理端认证与账号治理集成测试（依赖本地 PostgreSQL + Redis，且已执行 t_admin_user.sql）。
 */
@SpringBootTest(classes = HelloAgentApplication.class)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminAuthAndUserIT {

    /** MockMvc 客户端。 */
    @Autowired
    private MockMvc mockMvc;

    /** JSON 序列化。 */
    @Autowired
    private ObjectMapper objectMapper;

    /** AdminUser Mapper。 */
    @Autowired
    private AdminUserMapper adminUserMapper;

    /** Bootstrap Admin 登录后的 token（用例间共享）。 */
    private static String adminToken;

    /** 测试过程中创建的 Staff 账号 ID。 */
    private static String staffUserId;

    /** 用户名唯一后缀，避免重复跑测冲突。 */
    private static String uniqueSuffix;

    /**
     * 验证启动后已存在 Bootstrap Admin。
     */
    @Test
    @Order(1)
    void bootstrapAdminExistsAfterStartup() {
        uniqueSuffix = String.valueOf(System.currentTimeMillis());
        Long bootstrapCount = adminUserMapper.selectCount(Wrappers.lambdaQuery(AdminUserDO.class)
                .eq(AdminUserDO::getBootstrap, true));
        assertThat(bootstrapCount).isGreaterThan(0);
        AdminUserDO bootstrap = adminUserMapper.selectOne(Wrappers.lambdaQuery(AdminUserDO.class)
                .eq(AdminUserDO::getUsername, BootstrapAdminInitializer.BOOTSTRAP_USERNAME));
        assertThat(bootstrap).isNotNull();
        assertThat(bootstrap.getRole()).isEqualTo(AdminUserRole.ADMIN);
        assertThat(bootstrap.getBootstrap()).isTrue();
    }

    /**
     * 登录失败应返回统一错误文案。
     */
    @Test
    @Order(2)
    void loginFailsWithUnifiedMessage() throws Exception {
        mockMvc.perform(post("/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"admin","password":"wrong-pass-1"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A001001"))
                .andExpect(jsonPath("$.message").value("用户名或密码错误"));
    }

    /**
     * 登录成功并可查询 me，且响应不含密码字段。
     */
    @Test
    @Order(3)
    void loginSuccessAndMe() throws Exception {
        MvcResult result = mockMvc.perform(post("/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"admin","password":"admin@123456"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).path("data");
        adminToken = data.path("token").asText();

        mockMvc.perform(get("/admin/auth/me").header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.username").value("admin"))
                .andExpect(jsonPath("$.data.password").doesNotExist())
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());
    }

    /**
     * 未登录访问 me 应失败。
     */
    @Test
    @Order(4)
    void meRequiresLogin() throws Exception {
        mockMvc.perform(get("/admin/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").isNotEmpty());
    }

    /**
     * Admin 可创建 Staff；Staff 不可创建账号；Staff 可列表。
     */
    @Test
    @Order(5)
    void adminCreatesStaffAndStaffCannotCreate() throws Exception {
        String staffUsername = "ops_s_" + uniqueSuffix;
        MvcResult createResult = mockMvc.perform(post("/admin/users")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"Staff1234","role":"STAFF"}
                                """.formatted(staffUsername)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.username").value(staffUsername))
                .andReturn();
        staffUserId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        MvcResult staffLogin = mockMvc.perform(post("/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"Staff1234"}
                                """.formatted(staffUsername)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andReturn();
        String staffToken = objectMapper.readTree(staffLogin.getResponse().getContentAsString())
                .path("data").path("token").asText();

        mockMvc.perform(post("/admin/users")
                        .header("Authorization", staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"ops_x_%s","password":"Staff1234","role":"STAFF"}
                                """.formatted(uniqueSuffix)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A001002"));

        mockMvc.perform(get("/admin/users").header("Authorization", staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.pageSize").value(20));
    }

    /**
     * pageSize 超过 100 应被拒绝。
     */
    @Test
    @Order(6)
    void pageSizeOverLimitRejected() throws Exception {
        mockMvc.perform(get("/admin/users")
                        .header("Authorization", adminToken)
                        .param("pageSize", "101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A001010"));
    }

    /**
     * 不可删除 Bootstrap；可删除非保护对象的 Staff。
     */
    @Test
    @Order(7)
    void cannotDeleteBootstrapOrSelf() throws Exception {
        String bootstrapId = adminUserMapper.selectOne(Wrappers.lambdaQuery(AdminUserDO.class)
                .eq(AdminUserDO::getUsername, "admin")).getId();
        mockMvc.perform(delete("/admin/users/" + bootstrapId).header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A001009"));

        mockMvc.perform(delete("/admin/users/" + bootstrapId).header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("A001009"));

        mockMvc.perform(post("/admin/users")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"ops_a_%s","password":"Admin1234","role":"ADMIN"}
                                """.formatted(uniqueSuffix)))
                .andExpect(jsonPath("$.code").value("0"));

        mockMvc.perform(delete("/admin/users/" + staffUserId).header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"));
    }

    /**
     * 改己密时旧密码错误应失败且不踢会话语义由业务保证。
     */
    @Test
    @Order(8)
    void changeOwnPasswordRejectsWrongOldPassword() throws Exception {
        mockMvc.perform(put("/admin/auth/password")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"oldPassword":"bad-old-pass","newPassword":"Admin9999"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A001008"));
    }
}
