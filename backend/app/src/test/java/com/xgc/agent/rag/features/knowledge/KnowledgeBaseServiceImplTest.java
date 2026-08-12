package com.xgc.agent.rag.features.knowledge;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.admin.dao.entity.AdminUserDO;
import com.xgc.agent.rag.features.admin.service.AdminAccessService;
import com.xgc.agent.rag.features.knowledge.dto.EmbeddingModelCatalogItem;
import com.xgc.agent.rag.features.knowledge.dao.entity.KnowledgeBaseDO;
import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeBaseMapper;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import com.xgc.agent.rag.features.knowledge.service.DocumentPresence;
import com.xgc.agent.rag.features.knowledge.service.EmbeddingModelCatalog;
import com.xgc.agent.rag.features.knowledge.service.impl.KnowledgeBaseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 删除占用分支必须走 DocumentPresence；用打桩覆盖 V0.2 默认恒空无法碰到的路径。
 */
@ExtendWith(MockitoExtension.class)
class KnowledgeBaseServiceImplTest {

    @Mock
    private KnowledgeBaseMapper knowledgeBaseMapper;

    @Mock
    private AdminAccessService adminAccessService;

    @Mock
    private DocumentPresence documentPresence;

    @Mock
    private EmbeddingModelCatalog embeddingModelCatalog;

    private KnowledgeBaseServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new KnowledgeBaseServiceImpl(
                knowledgeBaseMapper, adminAccessService, embeddingModelCatalog, documentPresence);
    }

    @Test
    void delete_whenDocumentsPresent_rejectsAndDoesNotDelete() {
        when(adminAccessService.requireAdmin()).thenReturn(AdminUserDO.builder().id("admin-1").build());
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(KnowledgeBaseDO.builder()
                .id("kb-1")
                .name("手册")
                .namespace("hrfaq")
                .build());
        when(documentPresence.hasDocuments("kb-1")).thenReturn(true);

        assertThatThrownBy(() -> service.delete("kb-1"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.NOT_EMPTY.code());
        verify(knowledgeBaseMapper, never()).deleteById(anyString());
    }

    @Test
    void listEmbeddingModels_returnsCatalogItems() {
        when(embeddingModelCatalog.listItems()).thenReturn(java.util.List.of(
                new EmbeddingModelCatalogItem("bge-m3", "bge-m3", 1024, "alibailian", 10, true),
                new EmbeddingModelCatalogItem("sf-bge-large-zh", "BAAI/bge-large-zh-v1.5", 1024, "siliconflow", 20, false)
        ));

        org.assertj.core.api.Assertions.assertThat(service.listEmbeddingModels())
                .extracting(EmbeddingModelCatalogItem::id)
                .containsExactly("bge-m3", "sf-bge-large-zh");
    }

    @Test
    void create_usesDefaultEmbeddingModel() {
        when(adminAccessService.requireLoginUser()).thenReturn(AdminUserDO.builder().id("u-1").build());
        when(embeddingModelCatalog.defaultId()).thenReturn("qwen3.7-text-embedding");
        when(embeddingModelCatalog.contains("qwen3.7-text-embedding")).thenReturn(true);
        when(knowledgeBaseMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);

        var view = service.create(new com.xgc.agent.rag.features.knowledge.dto.KnowledgeBaseCreateRequest(
                "手册", null, "hrfaq01"));

        verify(knowledgeBaseMapper).insert(org.mockito.ArgumentMatchers.argThat((KnowledgeBaseDO kb) ->
                "qwen3.7-text-embedding".equals(kb.getEmbeddingModel())
                        && "hrfaq01".equals(kb.getNamespace())));
        org.assertj.core.api.Assertions.assertThat(view).isNotNull();
    }

    @Test
    void create_whenDefaultMissing_rejects() {
        when(adminAccessService.requireLoginUser()).thenReturn(AdminUserDO.builder().id("u-1").build());
        when(embeddingModelCatalog.defaultId()).thenReturn(null);

        assertThatThrownBy(() -> service.create(
                new com.xgc.agent.rag.features.knowledge.dto.KnowledgeBaseCreateRequest("手册", null, "hrfaq01")))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.EMBEDDING_MODEL_INVALID.code());
        verify(knowledgeBaseMapper, never()).insert(isA(KnowledgeBaseDO.class));
    }
}
