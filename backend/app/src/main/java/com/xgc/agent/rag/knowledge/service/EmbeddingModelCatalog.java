package com.xgc.agent.rag.knowledge.service;

import java.util.List;

/**
 * EmbeddingModel 可选项来源。
 *
 * <p>本阶段用进程内模拟名单，避免前后端各写一份；下一刀换真注册中心时只换实现。</p>
 */
public interface EmbeddingModelCatalog {

    /**
     * @return 稳定标识列表，至少两个，顺序稳定
     */
    List<String> listIds();

    /**
     * @param id 调用方提交的模型标识
     * @return 是否属于当前目录
     */
    boolean contains(String id);
}
