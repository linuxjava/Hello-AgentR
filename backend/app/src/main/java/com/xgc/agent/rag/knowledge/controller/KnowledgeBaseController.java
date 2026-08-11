package com.xgc.agent.rag.knowledge.controller;

import com.xgc.agent.framework.base.result.R;
import com.xgc.agent.rag.knowledge.dto.KnowledgeBaseCreateRequest;
import com.xgc.agent.rag.knowledge.dto.KnowledgeBasePageResponse;
import com.xgc.agent.rag.knowledge.dto.KnowledgeBaseUpdateRequest;
import com.xgc.agent.rag.knowledge.dto.KnowledgeBaseView;
import com.xgc.agent.rag.knowledge.service.KnowledgeBaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * KnowledgeBase HTTP 入口。
 *
 * <p>路径挂在 {@code /admin/**} 下，登录由既有拦截器覆盖；删除鉴权在 Service 内收口 Admin。</p>
 */
@RestController
@RequestMapping("/admin/knowledge-bases")
@RequiredArgsConstructor
public class KnowledgeBaseController {

    private final KnowledgeBaseService knowledgeBaseService;

    /**
     * 分页列表。刻意不接收 namespace 参数，避免被当成模糊筛选。
     */
    @GetMapping
    public R<KnowledgeBasePageResponse> page(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long pageSize,
            @RequestParam(required = false) String name
    ) {
        return R.success(knowledgeBaseService.page(page, pageSize, name));
    }

    /**
     * 创建空容器。
     */
    @PostMapping
    public R<KnowledgeBaseView> create(@Valid @RequestBody KnowledgeBaseCreateRequest request) {
        return R.success(knowledgeBaseService.create(request));
    }

    /**
     * 详情。
     */
    @GetMapping("/{id}")
    public R<KnowledgeBaseView> get(@PathVariable String id) {
        return R.success(knowledgeBaseService.get(id));
    }

    /**
     * 改 Name / Description。
     */
    @PutMapping("/{id}")
    public R<KnowledgeBaseView> update(
            @PathVariable String id,
            @Valid @RequestBody KnowledgeBaseUpdateRequest request
    ) {
        return R.success(knowledgeBaseService.update(id, request));
    }

    /**
     * 物理删除；仅 Admin 且库下无 Document。
     */
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable String id) {
        knowledgeBaseService.delete(id);
        return R.success();
    }
}
