package com.xgc.agent.rag.features.knowledge.dto;

import java.util.Map;

/**
 * 改 ChunkStrategy 的全量提交。改种类时整份 JSON 替换。
 *
 * <p>{@code originalFilename} 可选：缺省表示不改名；若提交则只允许改主名，后缀必须与已存值一致。</p>
 */
public record ChunkStrategyUpdateRequest(
        String chunkStrategy,
        Map<String, Object> chunkStrategyParams,
        String originalFilename
) {
    public ChunkStrategyUpdateRequest(String chunkStrategy, Map<String, Object> chunkStrategyParams) {
        this(chunkStrategy, chunkStrategyParams, null);
    }
}
