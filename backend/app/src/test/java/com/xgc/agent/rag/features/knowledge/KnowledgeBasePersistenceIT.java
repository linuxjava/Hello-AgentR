package com.xgc.agent.rag.features.knowledge;

import com.xgc.agent.rag.HelloAgentApplication;
import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeBaseMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * KnowledgeBase Mapper 装配验证。
 *
 * <p>依赖本地 PostgreSQL + Redis；表需已按 {@code resources/db/t_knowledge_base.sql} 建好。</p>
 */
@SpringBootTest(classes = HelloAgentApplication.class)
class KnowledgeBasePersistenceIT {

    @Autowired
    private KnowledgeBaseMapper knowledgeBaseMapper;

    @Test
    void contextLoadsKnowledgeBasePersistence() {
        assertThat(knowledgeBaseMapper).isNotNull();
        assertThat(knowledgeBaseMapper.selectCount(null)).isGreaterThanOrEqualTo(0);
    }
}
