package com.xgc.agent.rag.features.knowledge.service;

/**
 * 某 KnowledgeBase 下 Document 占用。
 *
 * <p>删除库与 documentCount 必须同源，避免列表显示 0 却删库被拒（或相反）。</p>
 */
public interface DocumentPresence {

    /**
     * @param knowledgeBaseId 知识库 id
     * @return true 表示仍有文档，禁止删除知识库
     */
    boolean hasDocuments(String knowledgeBaseId);

    /**
     * @param knowledgeBaseId 知识库 id
     * @return 该库 Document 条数
     */
    long count(String knowledgeBaseId);
}
