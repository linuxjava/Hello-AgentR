package com.xgc.agent.rag.features.knowledge.service;

import com.xgc.agent.rag.features.knowledge.dto.EmbeddingModelCatalogItem;

import java.util.List;

/**
 * EmbeddingModel 可选项来源。
 *
 * <p>由配置驱动并在启动时完成校验，避免运行期出现「目录能看见但创建失败」的漂移。</p>
 */
public interface EmbeddingModelCatalog {

    /**
     * @return 目录项（按优先级稳定排序）
     */
    List<EmbeddingModelCatalogItem> listItems();

    /**
     * @return 默认模型 id；目录为空时返回 null
     */
    String defaultId();

    /**
     * @param id 调用方提交的模型标识
     * @return 是否属于当前目录
     */
    boolean contains(String id);
}
