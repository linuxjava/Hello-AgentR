package com.xgc.agent.rag.features.knowledge.dto;

import java.util.Date;
import java.util.Map;

/**
 * Document 对外视图。刻意不含 objectKey。
 */
public record DocumentView(
        String id,
        String knowledgeBaseId,
        String originalFilename,
        String mediaType,
        String documentFormat,
        long byteSize,
        String status,
        boolean enabled,
        String chunkStrategy,
        Map<String, Object> chunkStrategyParams,
        String sourceType,
        String createdBy,
        Date createdAt,
        Date updatedAt
) {
}
