package com.xgc.agent.rag.features.knowledge.util;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;

/**
 * OriginalFilename 改名规则：只改主名，后缀必须与已存值一致（大小写不敏感）。
 *
 * <p>Why 不碰 ObjectStorage：objectKey 由 Namespace+DocumentId 生成，路径不含文件名。</p>
 */
public final class OriginalFilenameRules {

    /**
     * 与 {@code t_knowledge_document.original_filename} VARCHAR(512) 对齐。
     */
    public static final int MAX_LENGTH = 512;

    private OriginalFilenameRules() {
    }

    /**
     * 缺省或空白 requested 表示不改名；否则校验后返回应写入的完整文件名（后缀沿用已存大小写）。
     *
     * @param stored    当前已存 OriginalFilename
     * @param requested 请求中的完整文件名，可空
     * @return 规范化后的文件名
     */
    public static String resolve(String stored, String requested) {
        if (requested == null) {
            return stored;
        }
        String next = requested.trim();
        if (next.isEmpty()) {
            return stored;
        }
        if (next.length() > MAX_LENGTH || containsIllegal(next)) {
            throw new WebAdminException(KnowledgeErrorCode.FILENAME_INVALID);
        }
        String storedName = stored == null ? "" : stored;
        String storedSuffix = suffixOf(storedName);
        String stem = stemKeepingStoredSuffix(next, storedSuffix);
        if (stem.isEmpty()) {
            throw new WebAdminException(KnowledgeErrorCode.FILENAME_INVALID);
        }
        return stem + storedSuffix;
    }

    private static String stemKeepingStoredSuffix(String next, String storedSuffix) {
        if (storedSuffix.isEmpty()) {
            if (!suffixOf(next).isEmpty()) {
                throw new WebAdminException(KnowledgeErrorCode.FILENAME_EXTENSION_LOCKED);
            }
            return next;
        }
        int suffixLength = storedSuffix.length();
        if (next.length() < suffixLength
                || !next.regionMatches(true, next.length() - suffixLength, storedSuffix, 0, suffixLength)) {
            throw new WebAdminException(KnowledgeErrorCode.FILENAME_EXTENSION_LOCKED);
        }
        return next.substring(0, next.length() - suffixLength);
    }

    /**
     * 最后一个 {@code .} 之后为后缀；点在首位（如 {@code .gitignore}）视为无后缀。
     */
    static String suffixOf(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot <= 0) {
            return "";
        }
        return filename.substring(lastDot);
    }

    private static boolean containsIllegal(String value) {
        return value.chars().anyMatch(ch -> ch == '/' || ch == '\\' || ch == ':' || Character.isISOControl(ch));
    }
}
