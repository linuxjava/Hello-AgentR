package com.xgc.agent.rag;

import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeBaseMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = HelloAgentRApplication.class)
class BackendApplicationTests {

    @Autowired
    private KnowledgeBaseMapper knowledgeBaseMapper;

    @Test
    void contextLoads() {
        assertThat(knowledgeBaseMapper).isNotNull();
    }

    @Test
    void testMybatisPlus() {
        assertThat(knowledgeBaseMapper.selectCount(null)).isGreaterThanOrEqualTo(0);
    }
}
