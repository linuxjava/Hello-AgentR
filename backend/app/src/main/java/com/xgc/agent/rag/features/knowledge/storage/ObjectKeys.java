package com.xgc.agent.rag.features.knowledge.storage;

/**
 * Document 的 objectKey 约定。路径不用 OriginalFilename，避免特殊字符与同名覆盖。
 *
 * <p>存储端口在 fw-base；键格式（Namespace / documentId）属于 Knowledge。</p>
 */
public final class ObjectKeys {

    private ObjectKeys() {
    }

    /**
     * @param namespace  库 Namespace
     * @param documentId Document id
     * @return {@code namespace/documentId}
     */
    public static String of(String namespace, String documentId) {
        return namespace + "/" + documentId;
    }
}
