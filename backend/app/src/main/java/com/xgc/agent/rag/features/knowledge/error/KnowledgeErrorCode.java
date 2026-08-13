package com.xgc.agent.rag.features.knowledge.error;

import com.xgc.agent.framework.base.error.code.IErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 知识库容器错误码（A002xxx，归属 Web Admin 一级码 {@code A000001}）。
 *
 * <p>与账号域 A001xxx 分开，避免「名称已存在」等文案串域。</p>
 */
@Getter
@RequiredArgsConstructor
public enum KnowledgeErrorCode implements IErrorCode {

    /** 目标 KnowledgeBase 不存在。 */
    NOT_FOUND("A002001", "知识库不存在"),

    /** Name 长度或字符不合法。 */
    NAME_INVALID("A002002", "名称不符合规则"),

    /** Name 与已有库冲突。 */
    NAME_EXISTS("A002003", "名称已存在"),

    /** Namespace 不符合 [a-z0-9]{2,32}。 */
    NAMESPACE_INVALID("A002004", "Namespace 不符合规则"),

    /** Namespace 已被占用。 */
    NAMESPACE_EXISTS("A002005", "命名空间已存在"),

    /** Description 超过 200 字。 */
    DESCRIPTION_INVALID("A002006", "描述不符合规则"),

    /** EmbeddingModel 不在模拟目录中。 */
    EMBEDDING_MODEL_INVALID("A002007", "向量模型不合法"),

    /** 占用检查报告仍有 Document。 */
    NOT_EMPTY("A002008", "知识库下仍有文档，不能删除"),

    /** Document 不存在，或不属于路径中的知识库。 */
    DOCUMENT_NOT_FOUND("A002009", "文档不存在"),

    /** 0 字节或不带文件。 */
    FILE_EMPTY("A002010", "文件为空"),

    /** Tika 探测结果不在白名单。 */
    FILE_TYPE_UNSUPPORTED("A002011", "文件类型不支持"),

    /** 超过部署配置的 multipart 上限。 */
    FILE_TOO_LARGE("A002012", "文件大小超过限制"),

    /** ChunkStrategy 枚举非法。 */
    CHUNK_STRATEGY_INVALID("A002013", "分块策略不合法"),

    /** 参数缺键、多键或不等式不成立。 */
    CHUNK_STRATEGY_PARAMS_INVALID("A002014", "分块策略参数不合法"),

    /** 对象存储不可用（含缺密钥、put/delete 失败）。 */
    OBJECT_STORAGE_UNAVAILABLE("A002015", "对象存储不可用");

    /**
     * 错误码。
     */
    private final String code;

    /**
     * 默认错误消息。
     */
    private final String message;

    @Override
    public String code() {
        return code;
    }

    @Override
    public String message() {
        return message;
    }
}
