package com.xgc.agent.rag.features.knowledge.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 更新可变元数据。
 *
 * <p>不含 Namespace / EmbeddingModel：这两项出生绑定，即使客户端多传字段也不映射进本 record。</p>
 *
 * @param name        新显示名
 * @param description 新描述；null 或空白表示清空
 */
public record KnowledgeBaseUpdateRequest(
        @NotBlank String name,
        String description
) {
}
