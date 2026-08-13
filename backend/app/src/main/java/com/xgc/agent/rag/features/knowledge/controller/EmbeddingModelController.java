package com.xgc.agent.rag.features.knowledge.controller;

import com.xgc.agent.framework.base.result.R;
import com.xgc.agent.rag.features.knowledge.dto.EmbeddingModelCatalogItem;
import com.xgc.agent.rag.features.knowledge.service.KnowledgeBaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * EmbeddingModel 配置目录。
 *
 * <p>单独资源路径，避免和知识库 CRUD 混在一起；创建校验读同一份 Service/Catalog。</p>
 */
@RestController
@RequestMapping("/admin/embedding-models")
@RequiredArgsConstructor
public class EmbeddingModelController {

    private final KnowledgeBaseService knowledgeBaseService;

    /**
     * 只读目录，需登录。
     */
    @GetMapping
    public R<List<EmbeddingModelCatalogItem>> list() {
        return R.success(knowledgeBaseService.listEmbeddingModels());
    }
}
