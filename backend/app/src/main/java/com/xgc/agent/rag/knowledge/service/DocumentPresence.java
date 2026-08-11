package com.xgc.agent.rag.knowledge.service;

/**
 * 某 KnowledgeBase 下是否已有 Document。
 *
 * <p>删除契约要求「有文档则拒删」，但 V0.2 还没有 Document 表。
 * 抽成端口：默认恒未占用，删除路径仍必须调用；下一版本换真实计数，单测可打桩为已占用。</p>
 */
public interface DocumentPresence {

    /**
     * @param knowledgeBaseId 知识库 id
     * @return true 表示仍有文档，禁止删除
     */
    boolean hasDocuments(String knowledgeBaseId);
}
