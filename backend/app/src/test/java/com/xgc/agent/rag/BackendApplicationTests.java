package com.xgc.agent.rag;

import com.xgc.agent.rag.mybatisplus.KnowledgeBaseDO;
import com.xgc.agent.rag.mybatisplus.KnowledgeBaseMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest(classes = HelloAgentApplication.class)
class BackendApplicationTests {

    @Autowired
    private KnowledgeBaseMapper userMapper;

    @Test
    void contextLoads() {
    }

    @Test
    void testMybatisPlus() {
        List<KnowledgeBaseDO> knowledgeBaseDO = userMapper.selectList(null);
        System.out.println(knowledgeBaseDO.toString());
    }

}
