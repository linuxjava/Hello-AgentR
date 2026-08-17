package com.xgc.agent.rag.features.knowledge.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.admin.error.AdminErrorCode;
import com.xgc.agent.rag.features.admin.service.AdminAccessService;
import com.xgc.agent.rag.features.knowledge.dao.entity.KnowledgeBaseDO;
import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeBaseMapper;
import com.xgc.agent.rag.features.knowledge.dto.EmbeddingModelCatalogItem;
import com.xgc.agent.rag.features.knowledge.dto.KnowledgeBaseCreateRequest;
import com.xgc.agent.rag.features.knowledge.dto.KnowledgeBasePageResponse;
import com.xgc.agent.rag.features.knowledge.dto.KnowledgeBaseUpdateRequest;
import com.xgc.agent.rag.features.knowledge.dto.KnowledgeBaseView;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import com.xgc.agent.rag.features.knowledge.service.DocumentPresence;
import com.xgc.agent.rag.features.knowledge.service.EmbeddingModelCatalog;
import com.xgc.agent.rag.features.knowledge.service.KnowledgeBaseService;
import com.xgc.agent.rag.features.knowledge.util.KnowledgeFieldRules;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * KnowledgeBase 用例实现。
 *
 * <p>登录门禁由 {@code /admin/**} 拦截器完成；写路径用 {@code requireLoginUserId()} 填审计，
 * 删除用 {@code requireAdmin()}。</p>
 */
@Service
@RequiredArgsConstructor
public class KnowledgeBaseServiceImpl implements KnowledgeBaseService {

    private static final long DEFAULT_PAGE_SIZE = 20L;

    private static final long MAX_PAGE_SIZE = 100L;

    private final KnowledgeBaseMapper knowledgeBaseMapper;

    private final AdminAccessService adminAccessService;

    private final EmbeddingModelCatalog embeddingModelCatalog;

    private final DocumentPresence documentPresence;

    @Override
    public KnowledgeBasePageResponse page(Long page, Long pageSize, String name) {
        long pageNo = page == null || page < 1 ? 1L : page;
        long size = pageSize == null ? DEFAULT_PAGE_SIZE : pageSize;
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new WebAdminException(AdminErrorCode.PAGE_SIZE_INVALID.message(), AdminErrorCode.PAGE_SIZE_INVALID);
        }
        String nameKeyword = StringUtils.hasText(name) ? name.trim() : null;
        Page<KnowledgeBaseDO> result = knowledgeBaseMapper.selectPage(
                new Page<>(pageNo, size),
                Wrappers.lambdaQuery(KnowledgeBaseDO.class)
                        .like(nameKeyword != null, KnowledgeBaseDO::getName, nameKeyword)
                        .orderByDesc(KnowledgeBaseDO::getCreateTime)
        );
        List<KnowledgeBaseView> records = result.getRecords().stream()
                .map(item -> KnowledgeBaseView.from(item, documentPresence.count(item.getId())))
                .toList();
        return new KnowledgeBasePageResponse(result.getCurrent(), result.getSize(), result.getTotal(), records);
    }

    @Override
    public KnowledgeBaseView get(String id) {
        return KnowledgeBaseView.from(requireById(id), documentPresence.count(id));
    }

    @Override
    @Transactional
    public KnowledgeBaseView create(KnowledgeBaseCreateRequest request) {
        String operatorId = adminAccessService.requireLoginUserId();
        String name = KnowledgeFieldRules.normalizeName(request.name());
        String namespace = KnowledgeFieldRules.normalizeNamespace(request.namespace());
        String description = KnowledgeFieldRules.normalizeDescription(request.description());
        String defaultEmbeddingModel = embeddingModelCatalog.defaultId();
        if (defaultEmbeddingModel == null || !embeddingModelCatalog.contains(defaultEmbeddingModel)) {
            throw new WebAdminException(
                    KnowledgeErrorCode.EMBEDDING_MODEL_INVALID.message(),
                    KnowledgeErrorCode.EMBEDDING_MODEL_INVALID);
        }
        assertNameUnique(name, null);
        assertNamespaceUnique(namespace);

        KnowledgeBaseDO created = KnowledgeBaseDO.builder()
                .name(name)
                .description(description)
                .namespace(namespace)
                .embeddingModel(defaultEmbeddingModel)
                .createdBy(operatorId)
                .updatedBy(operatorId)
                .build();
        knowledgeBaseMapper.insert(created);
        return KnowledgeBaseView.from(created, 0L);
    }

    @Override
    @Transactional
    public KnowledgeBaseView update(String id, KnowledgeBaseUpdateRequest request) {
        String operatorId = adminAccessService.requireLoginUserId();
        KnowledgeBaseDO target = requireById(id);
        String name = KnowledgeFieldRules.normalizeName(request.name());
        String description = KnowledgeFieldRules.normalizeDescription(request.description());
        assertNameUnique(name, id);

        // 只改可变字段，避免 updateById 误动 Namespace / EmbeddingModel。
        target.setName(name);
        target.setDescription(description);
        target.setUpdatedBy(operatorId);
        knowledgeBaseMapper.updateById(target);
        return KnowledgeBaseView.from(requireById(id), documentPresence.count(id));
    }

    @Override
    @Transactional
    public void delete(String id) {
        adminAccessService.requireAdmin();
        requireById(id);
        // 必须调用占用检查：本阶段默认 false，但契约与单测打桩依赖这条路径存在。
        if (documentPresence.hasDocuments(id)) {
            throw new WebAdminException(KnowledgeErrorCode.NOT_EMPTY.message(), KnowledgeErrorCode.NOT_EMPTY);
        }
        knowledgeBaseMapper.deleteById(id);
    }

    @Override
    public List<EmbeddingModelCatalogItem> listEmbeddingModels() {
        return embeddingModelCatalog.listItems();
    }

    private KnowledgeBaseDO requireById(String id) {
        KnowledgeBaseDO found = knowledgeBaseMapper.selectById(id);
        if (found == null) {
            throw new WebAdminException(KnowledgeErrorCode.NOT_FOUND.message(), KnowledgeErrorCode.NOT_FOUND);
        }
        return found;
    }

    private void assertNameUnique(String name, String excludeId) {
        Long count = knowledgeBaseMapper.selectCount(Wrappers.lambdaQuery(KnowledgeBaseDO.class)
                .eq(KnowledgeBaseDO::getName, name)
                .ne(excludeId != null, KnowledgeBaseDO::getId, excludeId));
        if (count != null && count > 0) {
            throw new WebAdminException(KnowledgeErrorCode.NAME_EXISTS.message(), KnowledgeErrorCode.NAME_EXISTS);
        }
    }

    private void assertNamespaceUnique(String namespace) {
        Long count = knowledgeBaseMapper.selectCount(Wrappers.lambdaQuery(KnowledgeBaseDO.class)
                .eq(KnowledgeBaseDO::getNamespace, namespace));
        if (count != null && count > 0) {
            throw new WebAdminException(
                    KnowledgeErrorCode.NAMESPACE_EXISTS.message(), KnowledgeErrorCode.NAMESPACE_EXISTS);
        }
    }
}
