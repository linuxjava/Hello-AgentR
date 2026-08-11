package com.xgc.agent.rag.knowledge.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 创建 KnowledgeBase 请求。
 *
 * @param name           显示名
 * @param description    可选描述
 * @param namespace      隔离键（创建后不可改）
 * @param embeddingModel 目录内模型标识（创建后不可改）
 */
public record KnowledgeBaseCreateRequest(
        @NotBlank String name,
        String description,
        @NotBlank String namespace,
        @NotBlank String embeddingModel
) {
}
