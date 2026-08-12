package com.xgc.agent.rag.features.knowledge;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xgc.agent.rag.HelloAgentApplication;
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
 * 知识库容器 API 闭环（依赖本地 PostgreSQL + Redis，且已执行 t_admin_user.sql、t_knowledge_base.sql）。
 */
@SpringBootTest(classes = HelloAgentApplication.class)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class KnowledgeBaseIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String adminToken;

    private static String staffToken;

    private static String uniqueSuffix;

    private static String knowledgeBaseId;

    private static String reusedNamespace;

    @Test
    @Order(1)
    void catalogRequiresLoginAndReturnsStableIds() throws Exception {
        uniqueSuffix = String.valueOf(System.currentTimeMillis());
        reusedNamespace = "ns" + uniqueSuffix.substring(uniqueSuffix.length() - 10);

        mockMvc.perform(get("/admin/embedding-models"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").isNotEmpty());

        adminToken = login("admin", "admin@123456");

        MvcResult catalog = mockMvc.perform(get("/admin/embedding-models").header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data[0]").value("mock-embedding-v1"))
                .andExpect(jsonPath("$.data[1]").value("mock-embedding-v2"))
                .andReturn();
        JsonNode first = objectMapper.readTree(catalog.getResponse().getContentAsString()).path("data");

        MvcResult catalogAgain = mockMvc.perform(get("/admin/embedding-models").header("Authorization", adminToken))
                .andExpect(jsonPath("$.code").value("0"))
                .andReturn();
        JsonNode second = objectMapper.readTree(catalogAgain.getResponse().getContentAsString()).path("data");
        assertThat(second).isEqualTo(first);
    }

    @Test
    @Order(2)
    void createRejectsInvalidModelAndBadNamespace() throws Exception {
        mockMvc.perform(post("/admin/knowledge-bases")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"坏模型","namespace":"%s","embeddingModel":"gpt-does-not-exist"}
                                """.formatted(reusedNamespace)))
                .andExpect(jsonPath("$.code").value("A002007"));

        mockMvc.perform(post("/admin/knowledge-bases")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"坏键","namespace":"HR-FAQ","embeddingModel":"mock-embedding-v1"}
                                """))
                .andExpect(jsonPath("$.code").value("A002004"));
    }

    @Test
    @Order(3)
    void staffCanCreateAndListAdminCanUpdate() throws Exception {
        String staffUsername = "kb_s_" + uniqueSuffix;
        mockMvc.perform(post("/admin/users")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"Staff1234","role":"STAFF"}
                                """.formatted(staffUsername)))
                .andExpect(jsonPath("$.code").value("0"));
        staffToken = login(staffUsername, "Staff1234");

        String name = "员工手册" + uniqueSuffix;
        MvcResult created = mockMvc.perform(post("/admin/knowledge-bases")
                        .header("Authorization", staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","description":"手册","namespace":"%s","embeddingModel":"mock-embedding-v1"}
                                """.formatted(name, reusedNamespace)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.namespace").value(reusedNamespace))
                .andExpect(jsonPath("$.data.embeddingModel").value("mock-embedding-v1"))
                .andExpect(jsonPath("$.data.documentCount").doesNotExist())
                .andReturn();
        knowledgeBaseId = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asText();

        mockMvc.perform(post("/admin/knowledge-bases")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","namespace":"other%s","embeddingModel":"mock-embedding-v2"}
                                """.formatted(name, uniqueSuffix.substring(uniqueSuffix.length() - 8))))
                .andExpect(jsonPath("$.code").value("A002003"));

        mockMvc.perform(get("/admin/knowledge-bases")
                        .header("Authorization", staffToken)
                        .param("name", "员工手册"))
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.pageSize").value(20))
                .andExpect(jsonPath("$.data.records[0].id").value(knowledgeBaseId));

        mockMvc.perform(get("/admin/knowledge-bases").header("Authorization", adminToken).param("pageSize", "101"))
                .andExpect(jsonPath("$.code").value("A001010"));

        String renamed = "已修订手册" + uniqueSuffix;
        mockMvc.perform(put("/admin/knowledge-bases/" + knowledgeBaseId)
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","description":""}
                                """.formatted(renamed)))
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.name").value(renamed))
                .andExpect(jsonPath("$.data.namespace").value(reusedNamespace))
                .andExpect(jsonPath("$.data.embeddingModel").value("mock-embedding-v1"));
    }

    @Test
    @Order(4)
    void staffCannotDeleteAdminDeleteReleasesNamespace() throws Exception {
        mockMvc.perform(delete("/admin/knowledge-bases/" + knowledgeBaseId).header("Authorization", staffToken))
                .andExpect(jsonPath("$.code").value("A001002"));

        mockMvc.perform(delete("/admin/knowledge-bases/" + knowledgeBaseId).header("Authorization", adminToken))
                .andExpect(jsonPath("$.code").value("0"));

        mockMvc.perform(get("/admin/knowledge-bases/" + knowledgeBaseId).header("Authorization", adminToken))
                .andExpect(jsonPath("$.code").value("A002001"));

        mockMvc.perform(post("/admin/knowledge-bases")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"重建%s","namespace":"%s","embeddingModel":"mock-embedding-v2"}
                                """.formatted(uniqueSuffix, reusedNamespace)))
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.namespace").value(reusedNamespace))
                .andExpect(jsonPath("$.data.embeddingModel").value("mock-embedding-v2"));
    }

    private String login(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"%s"}
                                """.formatted(username, password)))
                .andExpect(jsonPath("$.code").value("0"))
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).path("data").path("token").asText();
    }
}
