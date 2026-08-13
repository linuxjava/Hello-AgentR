package com.xgc.agent.rag.features.knowledge.dto;

import java.util.Map;

/**
 * 改 ChunkStrategy 的全量提交。改种类时整份 JSON 替换。
 */
public record ChunkStrategyUpdateRequest(
        String chunkStrategy,
        Map<String, Object> chunkStrategyParams
) {
}
