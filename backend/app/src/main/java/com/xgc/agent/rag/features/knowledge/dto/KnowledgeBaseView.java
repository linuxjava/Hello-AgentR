package com.xgc.agent.rag.features.knowledge.dto;

import com.xgc.agent.rag.features.knowledge.dao.entity.KnowledgeBaseDO;

import java.util.Date;

/**
 * KnowledgeBase 对外视图。
 *
 * <p>{@code documentCount} 与删库占用检查同源；不含切片数 / 索引状态。</p>
 *
 * @param id             主键
 * @param name           显示名
 * @param description    描述，可空
 * @param namespace      隔离键
 * @param embeddingModel 绑定的向量模型标识
 * @param documentCount  库下 Document 条数
 * @param createdBy      创建者 AdminUser id
 * @param createdAt      创建时间
 * @param updatedAt      更新时间
 */
public record KnowledgeBaseView(
        String id,
        String name,
        String description,
        String namespace,
        String embeddingModel,
        long documentCount,
        String createdBy,
        Date createdAt,
        Date updatedAt
) {
    /**
     * @param source         持久化实体
     * @param documentCount  该库文档数
     * @return 视图
     */
    public static KnowledgeBaseView from(KnowledgeBaseDO source, long documentCount) {
        return new KnowledgeBaseView(
                source.getId(),
                source.getName(),
                source.getDescription(),
                source.getNamespace(),
                source.getEmbeddingModel(),
                documentCount,
                source.getCreatedBy(),
                source.getCreateTime(),
                source.getUpdateTime()
        );
    }
}
