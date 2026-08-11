package com.xgc.agent.rag.knowledge.service;

import com.xgc.agent.rag.knowledge.dto.KnowledgeBaseCreateRequest;
import com.xgc.agent.rag.knowledge.dto.KnowledgeBasePageResponse;
import com.xgc.agent.rag.knowledge.dto.KnowledgeBaseUpdateRequest;
import com.xgc.agent.rag.knowledge.dto.KnowledgeBaseView;

import java.util.List;

/**
 * KnowledgeBase 容器用例。
 */
public interface KnowledgeBaseService {

    /**
     * 分页列表；仅 Name 模糊，不按 Namespace 筛。
     *
     * @param page     页码，空或 &lt;1 按 1
     * @param pageSize 每页条数，空则 20，越界拒绝
     * @param name     Name 模糊条件，可空
     * @return 分页结果
     */
    KnowledgeBasePageResponse page(Long page, Long pageSize, String name);

    /**
     * @param id 主键
     * @return 详情
     */
    KnowledgeBaseView get(String id);

    /**
     * Admin / Staff 均可创建。
     *
     * @param request 创建参数
     * @return 新建视图
     */
    KnowledgeBaseView create(KnowledgeBaseCreateRequest request);

    /**
     * 改任意库的 Name / Description。
     *
     * @param id      主键
     * @param request 可变字段
     * @return 更新后视图
     */
    KnowledgeBaseView update(String id, KnowledgeBaseUpdateRequest request);

    /**
     * 仅 Admin；无 Document 时物理删除。
     *
     * @param id 主键
     */
    void delete(String id);

    /**
     * @return 模拟 EmbeddingModel 标识
     */
    List<String> listEmbeddingModels();
}
