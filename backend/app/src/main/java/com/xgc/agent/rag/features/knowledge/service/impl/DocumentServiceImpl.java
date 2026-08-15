package com.xgc.agent.rag.features.knowledge.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.framework.base.storage.ObjectStorage;
import com.xgc.agent.framework.base.storage.ObjectStorageException;
import com.xgc.agent.rag.features.admin.error.AdminErrorCode;
import com.xgc.agent.rag.features.admin.service.AdminAccessService;
import com.xgc.agent.rag.features.knowledge.chunk.ChunkStrategyParamsValidator;
import com.xgc.agent.rag.features.knowledge.dao.entity.DocumentStatus;
import com.xgc.agent.rag.features.knowledge.dao.entity.KnowledgeBaseDO;
import com.xgc.agent.rag.features.knowledge.dao.entity.KnowledgeDocumentDO;
import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeBaseMapper;
import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeDocumentMapper;
import com.xgc.agent.rag.features.knowledge.detect.DocumentFormat;
import com.xgc.agent.rag.features.knowledge.detect.MediaTypeDetector;
import com.xgc.agent.rag.features.knowledge.dto.ChunkStrategyUpdateRequest;
import com.xgc.agent.rag.features.knowledge.dto.DocumentEnabledUpdateRequest;
import com.xgc.agent.rag.features.knowledge.dto.DocumentPageResponse;
import com.xgc.agent.rag.features.knowledge.dto.DocumentView;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import com.xgc.agent.rag.features.knowledge.service.DocumentService;
import com.xgc.agent.rag.features.knowledge.storage.ObjectKeys;
import com.xgc.agent.rag.features.knowledge.util.OriginalFilenameRules;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * Document 用例：上传与切块解耦，本类不产生 Chunk。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    static final String STATUS_UPLOADED = "UPLOADED";

    static final String SOURCE_LOCAL_FILE = "LOCAL_FILE";

    private static final long DEFAULT_PAGE_SIZE = 20L;

    private static final long MAX_PAGE_SIZE = 100L;

    private final KnowledgeBaseMapper knowledgeBaseMapper;

    private final KnowledgeDocumentMapper knowledgeDocumentMapper;

    private final AdminAccessService adminAccessService;

    private final MediaTypeDetector mediaTypeDetector;

    private final ChunkStrategyParamsValidator chunkStrategyParamsValidator;

    private final ObjectStorage objectStorage;

    private final ObjectMapper objectMapper;

    @Override
    public DocumentView upload(
            String knowledgeBaseId,
            MultipartFile file,
            String chunkStrategy,
            String chunkStrategyParamsJson
    ) {
        String operatorId = adminAccessService.requireLoginUser().getId();
        KnowledgeBaseDO knowledgeBase = requireKnowledgeBase(knowledgeBaseId);
        if (file == null || file.isEmpty() || file.getSize() <= 0) {
            throw new WebAdminException(KnowledgeErrorCode.FILE_EMPTY);
        }
        String originalFilename = StringUtils.hasText(file.getOriginalFilename())
                ? file.getOriginalFilename()
                : "unnamed";
        Map<String, Object> params = chunkStrategyParamsValidator.parseAndValidate(chunkStrategy, chunkStrategyParamsJson);

        // Why 两次 getInputStream()：MultipartFile 每次返回新流；探测与 put 各自消费，无需自建临时文件或 byte[]。
        MediaTypeDetector.DetectedMediaType detected;
        try (InputStream detectStream = file.getInputStream()) {
            detected = mediaTypeDetector.detectAllowed(detectStream, originalFilename);
        } catch (IOException ex) {
            throw new WebAdminException(KnowledgeErrorCode.FILE_EMPTY.message(), ex, KnowledgeErrorCode.FILE_EMPTY);
        }

        String documentId = IdUtil.getSnowflakeNextIdStr();
        String objectKey = ObjectKeys.of(knowledgeBase.getNamespace(), documentId);
        long byteSize = file.getSize();
        try (InputStream uploadStream = file.getInputStream()) {
            putObject(objectKey, uploadStream, byteSize, detected.mediaType());
        } catch (IOException ex) {
            throw new WebAdminException(KnowledgeErrorCode.FILE_EMPTY.message(), ex, KnowledgeErrorCode.FILE_EMPTY);
        }

        KnowledgeDocumentDO created = KnowledgeDocumentDO.builder()
                .id(documentId)
                .knowledgeBaseId(knowledgeBaseId)
                .originalFilename(originalFilename)
                .mediaType(detected.mediaType())
                .documentFormat(detected.documentFormat().name())
                .byteSize(byteSize)
                .status(STATUS_UPLOADED)
                .enabled(Boolean.TRUE)
                .chunkStrategy(chunkStrategy)
                .chunkStrategyParams(params)
                .sourceType(SOURCE_LOCAL_FILE)
                .objectKey(objectKey)
                .createdBy(operatorId)
                .updatedBy(operatorId)
                .build();
        try {
            knowledgeDocumentMapper.insert(created);
        } catch (RuntimeException ex) {
            try {
                deleteObject(objectKey);
            } catch (RuntimeException rollbackEx) {
                log.error("库写入失败后回滚对象失败，可能残留孤儿 objectKey={}", objectKey, rollbackEx);
            }
            throw ex;
        }
        return toView(created);
    }

    @Override
    public DocumentPageResponse page(
            String knowledgeBaseId,
            Long page,
            Long pageSize,
            String originalFilename,
            DocumentStatus status,
            Boolean enabled
    ) {
        adminAccessService.requireLoginUser();
        requireKnowledgeBase(knowledgeBaseId);
        long pageNo = page == null || page < 1 ? 1L : page;
        long size = pageSize == null ? DEFAULT_PAGE_SIZE : pageSize;
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new WebAdminException(AdminErrorCode.PAGE_SIZE_INVALID.message(), AdminErrorCode.PAGE_SIZE_INVALID);
        }
        String filenameKeyword = StringUtils.hasText(originalFilename) ? originalFilename.trim() : null;
        Page<KnowledgeDocumentDO> result = knowledgeDocumentMapper.selectPage(
                new Page<>(pageNo, size),
                Wrappers.lambdaQuery(KnowledgeDocumentDO.class)
                        .eq(KnowledgeDocumentDO::getKnowledgeBaseId, knowledgeBaseId)
                        .like(filenameKeyword != null, KnowledgeDocumentDO::getOriginalFilename, filenameKeyword)
                        .eq(status != null, KnowledgeDocumentDO::getStatus, status == null ? null : status.name())
                        .eq(enabled != null, KnowledgeDocumentDO::getEnabled, enabled)
                        .orderByDesc(KnowledgeDocumentDO::getUpdateTime)
        );
        List<DocumentView> records = result.getRecords().stream().map(this::toView).toList();
        return new DocumentPageResponse(result.getCurrent(), result.getSize(), result.getTotal(), records);
    }

    @Override
    public DocumentView get(String knowledgeBaseId, String documentId) {
        adminAccessService.requireLoginUser();
        requireKnowledgeBase(knowledgeBaseId);
        return toView(requireDocument(knowledgeBaseId, documentId));
    }

    @Override
    public DocumentView updateChunkStrategy(
            String knowledgeBaseId,
            String documentId,
            ChunkStrategyUpdateRequest request
    ) {
        String operatorId = adminAccessService.requireLoginUser().getId();
        requireKnowledgeBase(knowledgeBaseId);
        KnowledgeDocumentDO target = requireDocument(knowledgeBaseId, documentId);
        String paramsJson = writeJson(request == null ? null : request.chunkStrategyParams());
        String strategy = request == null ? null : request.chunkStrategy();
        Map<String, Object> params = chunkStrategyParamsValidator.parseAndValidate(strategy, paramsJson);
        // Why 与策略同接口：运营在 O-09 一次保存；objectKey 不含文件名，改名只写元数据。
        String nextFilename = OriginalFilenameRules.resolve(
                target.getOriginalFilename(),
                request == null ? null : request.originalFilename());
        target.setChunkStrategy(strategy);
        target.setChunkStrategyParams(params);
        target.setOriginalFilename(nextFilename);
        target.setUpdatedBy(operatorId);
        knowledgeDocumentMapper.updateById(target);
        return toView(requireDocument(knowledgeBaseId, documentId));
    }

    @Override
    public DocumentView updateEnabled(
            String knowledgeBaseId,
            String documentId,
            DocumentEnabledUpdateRequest request
    ) {
        String operatorId = adminAccessService.requireLoginUser().getId();
        requireKnowledgeBase(knowledgeBaseId);
        KnowledgeDocumentDO target = requireDocument(knowledgeBaseId, documentId);
        target.setEnabled(request.enabled());
        target.setUpdatedBy(operatorId);
        knowledgeDocumentMapper.updateById(target);
        return toView(requireDocument(knowledgeBaseId, documentId));
    }

    @Override
    public void delete(String knowledgeBaseId, String documentId) {
        adminAccessService.requireLoginUser();
        requireKnowledgeBase(knowledgeBaseId);
        KnowledgeDocumentDO target = requireDocument(knowledgeBaseId, documentId);
        // 先删对象：失败则整笔失败、记录仍在。
        deleteObject(target.getObjectKey());
        knowledgeDocumentMapper.deleteById(target.getId());
    }

    /**
     * 基建只抛 {@link ObjectStorageException}；管理端 Document 契约仍是 A002015。
     */
    private void putObject(String objectKey, InputStream content, long contentLength, String mediaType) {
        try {
            objectStorage.put(objectKey, content, contentLength, mediaType);
        } catch (ObjectStorageException ex) {
            throw toDocumentStorageError(ex);
        }
    }

    private void deleteObject(String objectKey) {
        try {
            objectStorage.delete(objectKey);
        } catch (ObjectStorageException ex) {
            throw toDocumentStorageError(ex);
        }
    }

    private static WebAdminException toDocumentStorageError(ObjectStorageException ex) {
        return new WebAdminException(
                KnowledgeErrorCode.OBJECT_STORAGE_UNAVAILABLE.message(),
                ex,
                KnowledgeErrorCode.OBJECT_STORAGE_UNAVAILABLE);
    }

    private KnowledgeBaseDO requireKnowledgeBase(String knowledgeBaseId) {
        KnowledgeBaseDO found = knowledgeBaseMapper.selectById(knowledgeBaseId);
        if (found == null) {
            throw new WebAdminException(KnowledgeErrorCode.NOT_FOUND);
        }
        return found;
    }

    private KnowledgeDocumentDO requireDocument(String knowledgeBaseId, String documentId) {
        KnowledgeDocumentDO found = knowledgeDocumentMapper.selectById(documentId);
        if (found == null || !knowledgeBaseId.equals(found.getKnowledgeBaseId())) {
            throw new WebAdminException(KnowledgeErrorCode.DOCUMENT_NOT_FOUND);
        }
        return found;
    }

    private String writeJson(Map<String, Object> params) {
        if (params == null) {
            throw new WebAdminException(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
        }
        try {
            return objectMapper.writeValueAsString(params);
        } catch (JsonProcessingException ex) {
            throw new WebAdminException(
                    KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID.message(),
                    ex,
                    KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
        }
    }

    private DocumentView toView(KnowledgeDocumentDO source) {
        return new DocumentView(
                source.getId(),
                source.getKnowledgeBaseId(),
                source.getOriginalFilename(),
                source.getMediaType(),
                resolveDocumentFormat(source),
                source.getByteSize() == null ? 0L : source.getByteSize(),
                source.getStatus(),
                !Boolean.FALSE.equals(source.getEnabled()),
                source.getChunkStrategy(),
                source.getChunkStrategyParams(),
                source.getSourceType(),
                source.getCreatedBy(),
                source.getCreateTime(),
                source.getUpdateTime()
        );
    }

    /**
     * 旧行可能尚未回填 document_format；读路径用规范 MIME 兜底，避免前端再猜。
     * mediaType 也缺失时不抛上传类错误码（读路径），返回空串由调用方/脏数据排查。
     */
    private static String resolveDocumentFormat(KnowledgeDocumentDO source) {
        if (StringUtils.hasText(source.getDocumentFormat())) {
            return source.getDocumentFormat();
        }
        if (!StringUtils.hasText(source.getMediaType())) {
            return "";
        }
        return DocumentFormat.fromCanonicalMediaType(source.getMediaType()).name();
    }
}
