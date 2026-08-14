package com.xgc.agent.rag.features.knowledge.dto;

import java.util.List;

/**
 * Document 分页结果，形状对齐知识库列表。
 */
public record DocumentPageResponse(
        long page,
        long pageSize,
        long total,
        List<DocumentView> records
) {
}
