package com.xgc.agent.rag.features.knowledge.service;

import com.xgc.agent.rag.features.knowledge.dao.entity.DocumentStatus;
import com.xgc.agent.rag.features.knowledge.dto.ChunkStrategyUpdateRequest;
import com.xgc.agent.rag.features.knowledge.dto.DocumentEnabledUpdateRequest;
import com.xgc.agent.rag.features.knowledge.dto.DocumentPageResponse;
import com.xgc.agent.rag.features.knowledge.dto.DocumentView;
import org.springframework.web.multipart.MultipartFile;

/**
 * Document 摄入与元数据治理（不含切块执行）。
 */
public interface DocumentService {

    /**
     * 单文件本地上传：先写对象再插库。
     */
    DocumentView upload(String knowledgeBaseId, MultipartFile file, String chunkStrategy, String chunkStrategyParamsJson);

    /**
     * 库内分页；OriginalFilename 模糊；status / enabled 精确筛选（缺省不过滤）；更新时间倒序。
     */
    DocumentPageResponse page(
            String knowledgeBaseId,
            Long page,
            Long pageSize,
            String originalFilename,
            DocumentStatus status,
            Boolean enabled
    );

    /**
     * 详情；不属于该库视为不存在。
     */
    DocumentView get(String knowledgeBaseId, String documentId);

    /**
     * 仅 UPLOADED 可改；本阶段状态恒为该值。
     */
    DocumentView updateChunkStrategy(String knowledgeBaseId, String documentId, ChunkStrategyUpdateRequest request);

    /**
     * 切换启用状态；不改变 DocumentStatus，也不删对象。
     */
    DocumentView updateEnabled(String knowledgeBaseId, String documentId, DocumentEnabledUpdateRequest request);

    /**
     * 同步删对象；对象失败则整笔失败。
     */
    void delete(String knowledgeBaseId, String documentId);
}
