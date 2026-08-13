package com.xgc.agent.rag.features.knowledge.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xgc.agent.rag.features.knowledge.dao.entity.KnowledgeDocumentDO;
import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeDocumentMapper;
import com.xgc.agent.rag.features.knowledge.service.DocumentPresence;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 真实占用：按 Document 行数判断，替换 V0.2 恒空实现。
 */
@Component
@RequiredArgsConstructor
public class CountingDocumentPresence implements DocumentPresence {

    private final KnowledgeDocumentMapper knowledgeDocumentMapper;

    @Override
    public boolean hasDocuments(String knowledgeBaseId) {
        return count(knowledgeBaseId) > 0;
    }

    /**
     * 含已禁用行：禁用不是软删除，仍占用知识库。
     *
     * @param knowledgeBaseId 知识库 id
     * @return 该库 Document 条数
     */
    public long count(String knowledgeBaseId) {
        Long total = knowledgeDocumentMapper.selectCount(Wrappers.lambdaQuery(KnowledgeDocumentDO.class)
                .eq(KnowledgeDocumentDO::getKnowledgeBaseId, knowledgeBaseId));
        return total == null ? 0L : total;
    }
}
