package com.xgc.agent.rag.features.knowledge.dao.entity;

/**
 * Document 摄入状态。本阶段写入恒为 {@link #UPLOADED}；查询可按预留值精确筛选。
 */
public enum DocumentStatus {
    UPLOADED,
    CHUNKING,
    CHUNKED,
    FAILED
}
