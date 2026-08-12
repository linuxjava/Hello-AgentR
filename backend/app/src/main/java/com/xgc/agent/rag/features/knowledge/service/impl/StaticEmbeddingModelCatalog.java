package com.xgc.agent.rag.features.knowledge.service.impl;

import com.xgc.agent.rag.features.knowledge.service.EmbeddingModelCatalog;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * design D5 写死的模拟目录。
 *
 * <p>标识必须稳定：创建校验与 GET 目录共用同一常量，防止「页面能选、提交被拒」。</p>
 */
@Component
public class StaticEmbeddingModelCatalog implements EmbeddingModelCatalog {

    /**
     * 模拟标识；与 OpenSpec design D5 对齐。
     */
    static final List<String> IDS = List.of("mock-embedding-v1", "mock-embedding-v2");

    @Override
    public List<String> listIds() {
        return IDS;
    }

    @Override
    public boolean contains(String id) {
        return id != null && IDS.contains(id);
    }
}
