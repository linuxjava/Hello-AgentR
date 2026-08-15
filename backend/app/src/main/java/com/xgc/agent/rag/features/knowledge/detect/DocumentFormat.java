package com.xgc.agent.rag.features.knowledge.detect;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;

/**
 * 业务侧文档格式族。由规范 MIME 推导，供展示与后续解析/切块分支；不替代 {@code mediaType}。
 */
public enum DocumentFormat {
    TXT,
    MARKDOWN,
    PDF,
    DOC,
    DOCX,
    PPT,
    PPTX,
    XLS,
    XLSX,
    PNG,
    JPEG,
    SVG;

    /**
     * @param canonicalMediaType 已归一的白名单 MIME
     * @return 对应业务格式
     */
    public static DocumentFormat fromCanonicalMediaType(String canonicalMediaType) {
        if (canonicalMediaType == null) {
            throw new WebAdminException(KnowledgeErrorCode.FILE_TYPE_UNSUPPORTED);
        }
        return switch (canonicalMediaType) {
            case "text/plain" -> TXT;
            case "text/markdown" -> MARKDOWN;
            case "application/pdf" -> PDF;
            case "application/msword" -> DOC;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> DOCX;
            case "application/vnd.ms-powerpoint" -> PPT;
            case "application/vnd.openxmlformats-officedocument.presentationml.presentation" -> PPTX;
            case "application/vnd.ms-excel" -> XLS;
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" -> XLSX;
            case "image/png" -> PNG;
            case "image/jpeg" -> JPEG;
            case "image/svg+xml" -> SVG;
            default -> throw new WebAdminException(KnowledgeErrorCode.FILE_TYPE_UNSUPPORTED);
        };
    }
}
