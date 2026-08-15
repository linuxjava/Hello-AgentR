package com.xgc.agent.rag.features.knowledge;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.framework.base.storage.ObjectStorage;
import com.xgc.agent.framework.base.storage.ObjectStorageException;
import com.xgc.agent.rag.features.admin.dao.entity.AdminUserDO;
import com.xgc.agent.rag.features.admin.service.AdminAccessService;
import com.xgc.agent.rag.features.knowledge.chunk.ChunkStrategyParamsValidator;
import com.xgc.agent.rag.features.knowledge.dao.entity.DocumentStatus;
import com.xgc.agent.rag.features.knowledge.dao.entity.KnowledgeBaseDO;
import com.xgc.agent.rag.features.knowledge.dao.entity.KnowledgeDocumentDO;
import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeBaseMapper;
import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeDocumentMapper;
import com.xgc.agent.rag.features.knowledge.detect.MediaTypeDetector;
import com.xgc.agent.rag.features.knowledge.dto.ChunkStrategyUpdateRequest;
import com.xgc.agent.rag.features.knowledge.dto.DocumentEnabledUpdateRequest;
import com.xgc.agent.rag.features.knowledge.dto.DocumentView;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import com.xgc.agent.rag.features.knowledge.service.impl.DocumentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceImplTest {

    @Mock
    private KnowledgeBaseMapper knowledgeBaseMapper;

    @Mock
    private KnowledgeDocumentMapper knowledgeDocumentMapper;

    @Mock
    private AdminAccessService adminAccessService;

    @Mock
    private MediaTypeDetector mediaTypeDetector;

    @Mock
    private ObjectStorage objectStorage;

    private DocumentServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new DocumentServiceImpl(
                knowledgeBaseMapper,
                knowledgeDocumentMapper,
                adminAccessService,
                mediaTypeDetector,
                new ChunkStrategyParamsValidator(new ObjectMapper()),
                objectStorage,
                new ObjectMapper()
        );
        when(adminAccessService.requireLoginUser()).thenReturn(AdminUserDO.builder().id("u-1").build());
    }

    @Test
    void upload_emptyFile_rejects() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        MockMultipartFile file = new MockMultipartFile("file", "a.md", "text/markdown", new byte[0]);
        assertThatThrownBy(() -> service.upload("kb-1", file, "OVERLAPPING", "{\"chunkSize\":8,\"overlap\":1}"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.FILE_EMPTY.code());
        verify(objectStorage, never()).put(anyString(), any(InputStream.class), anyLong(), anyString());
    }

    @Test
    void upload_sameFilenameTwice_insertsTwoRows() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        when(mediaTypeDetector.detectAllowed(any(InputStream.class), eq("a.md"))).thenReturn("text/markdown");
        byte[] body = "# hi".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile("file", "a.md", "application/octet-stream", body);

        service.upload("kb-1", file, "OVERLAPPING", "{\"chunkSize\":8,\"overlap\":1}");
        service.upload("kb-1", file, "OVERLAPPING", "{\"chunkSize\":8,\"overlap\":1}");

        ArgumentCaptor<KnowledgeDocumentDO> captor = ArgumentCaptor.forClass(KnowledgeDocumentDO.class);
        verify(knowledgeDocumentMapper, times(2)).insert(captor.capture());
        assertThat(captor.getAllValues()).allMatch(doc -> "a.md".equals(doc.getOriginalFilename()));
        assertThat(captor.getAllValues()).allMatch(doc -> Boolean.TRUE.equals(doc.getEnabled()));
        assertThat(captor.getAllValues().get(0).getId()).isNotEqualTo(captor.getAllValues().get(1).getId());
        verify(objectStorage, times(2)).put(anyString(), any(InputStream.class), anyLong(), eq("text/markdown"));
    }

    @Test
    void upload_whenInsertFails_rollsBackObject() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        when(mediaTypeDetector.detectAllowed(any(InputStream.class), anyString())).thenReturn("text/markdown");
        when(knowledgeDocumentMapper.insert(org.mockito.ArgumentMatchers.isA(KnowledgeDocumentDO.class)))
                .thenThrow(new RuntimeException("db"));
        MockMultipartFile file = new MockMultipartFile(
                "file", "a.md", "text/markdown", "# hi".getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> service.upload("kb-1", file, "OVERLAPPING", "{\"chunkSize\":8,\"overlap\":1}"))
                .isInstanceOf(RuntimeException.class);
        verify(objectStorage).delete(anyString());
    }

    @Test
    void upload_whenPutFails_mapsToDocumentError() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        when(mediaTypeDetector.detectAllowed(any(InputStream.class), anyString())).thenReturn("text/markdown");
        doThrow(new ObjectStorageException())
                .when(objectStorage).put(anyString(), any(InputStream.class), anyLong(), anyString());
        MockMultipartFile file = new MockMultipartFile(
                "file", "a.md", "text/markdown", "# hi".getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> service.upload("kb-1", file, "OVERLAPPING", "{\"chunkSize\":8,\"overlap\":1}"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.OBJECT_STORAGE_UNAVAILABLE.code());
        verify(knowledgeDocumentMapper, never()).insert(org.mockito.ArgumentMatchers.isA(KnowledgeDocumentDO.class));
    }

    @Test
    void delete_whenObjectDeleteFails_keepsRow() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        when(knowledgeDocumentMapper.selectById("doc-1")).thenReturn(KnowledgeDocumentDO.builder()
                .id("doc-1")
                .knowledgeBaseId("kb-1")
                .objectKey("hrfaq/doc-1")
                .build());
        doThrow(new ObjectStorageException())
                .when(objectStorage).delete("hrfaq/doc-1");

        assertThatThrownBy(() -> service.delete("kb-1", "doc-1"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.OBJECT_STORAGE_UNAVAILABLE.code());
        verify(knowledgeDocumentMapper, never()).deleteById(anyString());
    }

    @Test
    void get_wrongKnowledgeBase_notFound() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        when(knowledgeDocumentMapper.selectById("doc-1")).thenReturn(KnowledgeDocumentDO.builder()
                .id("doc-1")
                .knowledgeBaseId("other")
                .build());
        assertThatThrownBy(() -> service.get("kb-1", "doc-1"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.DOCUMENT_NOT_FOUND.code());
    }

    @Test
    void updateStrategy_replacesParams() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        KnowledgeDocumentDO stored = KnowledgeDocumentDO.builder()
                .id("doc-1")
                .knowledgeBaseId("kb-1")
                .originalFilename("handbook.pdf")
                .chunkStrategy("OVERLAPPING")
                .chunkStrategyParams(Map.of("chunkSize", 8, "overlap", 1))
                .build();
        when(knowledgeDocumentMapper.selectById("doc-1")).thenReturn(stored);

        DocumentView view = service.updateChunkStrategy("kb-1", "doc-1", new ChunkStrategyUpdateRequest(
                "STRUCTURE_AWARE",
                Map.of("defaultChunkSize", 20, "maxChunkSize", 30, "minChunkSize", 10, "overlap", 2)
        ));
        assertThat(view.chunkStrategy()).isEqualTo("STRUCTURE_AWARE");
        assertThat(view.originalFilename()).isEqualTo("handbook.pdf");
        verify(knowledgeDocumentMapper).updateById(org.mockito.ArgumentMatchers.isA(KnowledgeDocumentDO.class));
        verify(objectStorage, never()).put(anyString(), any(InputStream.class), anyLong(), anyString());
        verify(objectStorage, never()).delete(anyString());
    }

    @Test
    void updateStrategy_renamesStemKeepsExtension() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        KnowledgeDocumentDO stored = KnowledgeDocumentDO.builder()
                .id("doc-1")
                .knowledgeBaseId("kb-1")
                .originalFilename("handbook.pdf")
                .chunkStrategy("OVERLAPPING")
                .chunkStrategyParams(Map.of("chunkSize", 8, "overlap", 1))
                .build();
        when(knowledgeDocumentMapper.selectById("doc-1")).thenReturn(stored);

        DocumentView view = service.updateChunkStrategy("kb-1", "doc-1", new ChunkStrategyUpdateRequest(
                "OVERLAPPING",
                Map.of("chunkSize", 8, "overlap", 1),
                "手册.pdf"
        ));
        assertThat(view.originalFilename()).isEqualTo("手册.pdf");
        ArgumentCaptor<KnowledgeDocumentDO> captor = ArgumentCaptor.forClass(KnowledgeDocumentDO.class);
        verify(knowledgeDocumentMapper).updateById(captor.capture());
        assertThat(captor.getValue().getOriginalFilename()).isEqualTo("手册.pdf");
        verify(objectStorage, never()).put(anyString(), any(InputStream.class), anyLong(), anyString());
        verify(objectStorage, never()).delete(anyString());
    }

    @Test
    void updateStrategy_rejectsExtensionChange() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        KnowledgeDocumentDO stored = KnowledgeDocumentDO.builder()
                .id("doc-1")
                .knowledgeBaseId("kb-1")
                .originalFilename("handbook.pdf")
                .chunkStrategy("OVERLAPPING")
                .chunkStrategyParams(Map.of("chunkSize", 8, "overlap", 1))
                .build();
        when(knowledgeDocumentMapper.selectById("doc-1")).thenReturn(stored);

        assertThatThrownBy(() -> service.updateChunkStrategy("kb-1", "doc-1", new ChunkStrategyUpdateRequest(
                "OVERLAPPING",
                Map.of("chunkSize", 8, "overlap", 1),
                "handbook.md"
        )))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.FILENAME_EXTENSION_LOCKED.code());
        verify(knowledgeDocumentMapper, never()).updateById(org.mockito.ArgumentMatchers.isA(KnowledgeDocumentDO.class));
    }

    @Test
    void updateEnabled_disablesDocument() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        KnowledgeDocumentDO stored = KnowledgeDocumentDO.builder()
                .id("doc-1")
                .knowledgeBaseId("kb-1")
                .enabled(true)
                .build();
        when(knowledgeDocumentMapper.selectById("doc-1")).thenReturn(stored);

        DocumentView view = service.updateEnabled("kb-1", "doc-1", new DocumentEnabledUpdateRequest(false));
        assertThat(view.enabled()).isFalse();
        ArgumentCaptor<KnowledgeDocumentDO> captor = ArgumentCaptor.forClass(KnowledgeDocumentDO.class);
        verify(knowledgeDocumentMapper).updateById(captor.capture());
        assertThat(captor.getValue().getEnabled()).isFalse();
    }

    @Test
    void updateEnabled_reEnablesDocument() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        KnowledgeDocumentDO stored = KnowledgeDocumentDO.builder()
                .id("doc-1")
                .knowledgeBaseId("kb-1")
                .enabled(false)
                .build();
        when(knowledgeDocumentMapper.selectById("doc-1")).thenReturn(stored);

        DocumentView view = service.updateEnabled("kb-1", "doc-1", new DocumentEnabledUpdateRequest(true));
        assertThat(view.enabled()).isTrue();
    }

    @SuppressWarnings("unchecked")
    @Test
    void page_rejectsOversizedPage() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        assertThatThrownBy(() -> service.page("kb-1", 1L, 101L, null, null, null))
                .isInstanceOf(WebAdminException.class);
        verify(knowledgeDocumentMapper, never()).selectPage(any(), any(Wrapper.class));
    }

    @SuppressWarnings("unchecked")
    @Test
    void page_queriesWithStatusAndEnabled() {
        when(knowledgeBaseMapper.selectById("kb-1")).thenReturn(kb());
        when(knowledgeDocumentMapper.selectPage(any(), any(Wrapper.class))).thenReturn(new Page<>());

        service.page("kb-1", 1L, 20L, "hand", DocumentStatus.UPLOADED, Boolean.FALSE);

        verify(knowledgeDocumentMapper).selectPage(any(), any(Wrapper.class));
    }

    private static KnowledgeBaseDO kb() {
        return KnowledgeBaseDO.builder().id("kb-1").namespace("hrfaq").name("手册").build();
    }
}
