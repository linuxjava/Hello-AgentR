package com.xgc.agent.rag.features.knowledge.dto;

/**
 * EmbeddingModel 目录项（对内外统一使用）。
 *
 * @param id         平台内稳定标识（KnowledgeBase 绑定此字段）
 * @param model      上游供应商请求模型名
 * @param dimension  向量维度
 * @param providerId 归属的模型提供商标识
 * @param priority   排序优先级（越小越靠前）
 * @param isDefault  是否默认模型（全局唯一）
 */
public record EmbeddingModelCatalogItem(
        String id,
        String model,
        int dimension,
        String providerId,
        int priority,
        boolean isDefault
) {
}
