package com.xgc.agent.rag.features.knowledge.controller;

import com.xgc.agent.framework.base.result.R;
import com.xgc.agent.rag.features.knowledge.dto.ChunkStrategyUpdateRequest;
import com.xgc.agent.rag.features.knowledge.dto.DocumentEnabledUpdateRequest;
import com.xgc.agent.rag.features.knowledge.dto.DocumentPageResponse;
import com.xgc.agent.rag.features.knowledge.dto.DocumentView;
import com.xgc.agent.rag.features.knowledge.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Document HTTP 入口。路径挂在已登录的 {@code /admin/knowledge-bases} 下，不再单独配拦截器。
 */
@RestController
@RequestMapping("/admin/knowledge-bases/{kbId}/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /**
     * 单文件上传。chunkStrategyParams 用表单字符串是为了与 multipart file 同请求提交。
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public R<DocumentView> upload(
            @PathVariable String kbId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("chunkStrategy") String chunkStrategy,
            @RequestParam("chunkStrategyParams") String chunkStrategyParams
    ) {
        return R.success(documentService.upload(kbId, file, chunkStrategy, chunkStrategyParams));
    }

    /**
     * 分页列表。刻意不接收 status/strategy/enabled 参数，本阶段不做这些筛选。
     */
    @GetMapping
    public R<DocumentPageResponse> page(
            @PathVariable String kbId,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long pageSize,
            @RequestParam(required = false) String originalFilename
    ) {
        return R.success(documentService.page(kbId, page, pageSize, originalFilename));
    }

    @GetMapping("/{docId}")
    public R<DocumentView> get(@PathVariable String kbId, @PathVariable String docId) {
        return R.success(documentService.get(kbId, docId));
    }

    @PutMapping("/{docId}/chunk-strategy")
    public R<DocumentView> updateChunkStrategy(
            @PathVariable String kbId,
            @PathVariable String docId,
            @Valid @RequestBody ChunkStrategyUpdateRequest request
    ) {
        return R.success(documentService.updateChunkStrategy(kbId, docId, request));
    }

    /**
     * 启用/禁用与摄入状态无关；禁用后仍出现在列表并计入 documentCount。
     */
    @PutMapping("/{docId}/enabled")
    public R<DocumentView> updateEnabled(
            @PathVariable String kbId,
            @PathVariable String docId,
            @Valid @RequestBody DocumentEnabledUpdateRequest request
    ) {
        return R.success(documentService.updateEnabled(kbId, docId, request));
    }

    @DeleteMapping("/{docId}")
    public R<Void> delete(@PathVariable String kbId, @PathVariable String docId) {
        documentService.delete(kbId, docId);
        return R.success();
    }
}
