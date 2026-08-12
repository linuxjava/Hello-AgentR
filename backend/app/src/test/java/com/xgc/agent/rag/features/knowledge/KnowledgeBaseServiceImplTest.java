package com.xgc.agent.rag.features.knowledge;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.admin.dao.entity.AdminUserDO;
import com.xgc.agent.rag.features.admin.service.AdminAccessService;
import com.xgc.agent.rag.features.knowledge.dao.entity.KnowledgeBaseDO;
import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeBaseMapper;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import com.xgc.agent.rag.features.knowledge.service.DocumentPresence;
import com.xgc.agent.rag.features.knowledge.service.EmbeddingModelCatalog;
import com.xgc.agent.rag.features.knowledge.service.impl.KnowledgeBaseServiceImpl;
import com.xgc.agent.rag.features.knowledge.service.impl.StaticEmbeddingModelCatalog;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
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

    private KnowledgeBaseServiceImpl service;

    @BeforeEach
    void setUp() {
        EmbeddingModelCatalog catalog = new StaticEmbeddingModelCatalog();
        service = new KnowledgeBaseServiceImpl(
                knowledgeBaseMapper, adminAccessService, catalog, documentPresence);
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
    void listEmbeddingModels_returnsStableMockIds() {
        org.assertj.core.api.Assertions.assertThat(service.listEmbeddingModels())
                .containsExactly("mock-embedding-v1", "mock-embedding-v2");
        org.assertj.core.api.Assertions.assertThat(service.listEmbeddingModels())
                .isEqualTo(service.listEmbeddingModels());
    }
}
