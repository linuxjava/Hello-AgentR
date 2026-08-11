package com.xgc.agent.rag.knowledge.util;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.knowledge.error.KnowledgeErrorCode;

import java.util.regex.Pattern;

/**
 * KnowledgeBase 字段规范化与校验。
 *
 * <p>Name 先去首尾空白再判长与唯一，避免「手册」与「 手册 」被当成两个库。
 * Namespace 是路径/隔离键，字符集收得很死，避免大小写或符号进入存储目录。</p>
 */
public final class KnowledgeFieldRules {

    /**
     * Name 去空白后的最大长度。
     */
    public static final int NAME_MAX_LENGTH = 64;

    /**
     * Description 最大长度。
     */
    public static final int DESCRIPTION_MAX_LENGTH = 200;

    /**
     * Namespace：仅小写字母数字，2–32 位。
     */
    private static final Pattern NAMESPACE_PATTERN = Pattern.compile("^[a-z0-9]{2,32}$");

    private KnowledgeFieldRules() {
    }

    /**
     * 规范化并校验 Name；返回去空白后的值。
     *
     * @param raw 原始输入
     * @return 规范化名称
     */
    public static String normalizeName(String raw) {
        if (raw == null) {
            throw new WebAdminException(KnowledgeErrorCode.NAME_INVALID.message(), KnowledgeErrorCode.NAME_INVALID);
        }
        String name = raw.trim();
        if (name.isEmpty() || name.length() > NAME_MAX_LENGTH || containsControlChar(name)) {
            throw new WebAdminException(KnowledgeErrorCode.NAME_INVALID.message(), KnowledgeErrorCode.NAME_INVALID);
        }
        return name;
    }

    /**
     * 规范化并校验 Namespace。
     *
     * @param raw 原始输入
     * @return 去空白后的 Namespace
     */
    public static String normalizeNamespace(String raw) {
        if (raw == null) {
            throw new WebAdminException(
                    KnowledgeErrorCode.NAMESPACE_INVALID.message(), KnowledgeErrorCode.NAMESPACE_INVALID);
        }
        String namespace = raw.trim();
        if (!NAMESPACE_PATTERN.matcher(namespace).matches()) {
            throw new WebAdminException(
                    KnowledgeErrorCode.NAMESPACE_INVALID.message(), KnowledgeErrorCode.NAMESPACE_INVALID);
        }
        return namespace;
    }

    /**
     * 规范化 Description：空白视为清空（null）；超长拒绝。
     *
     * @param raw 原始输入，可空
     * @return 规范化描述或 null
     */
    public static String normalizeDescription(String raw) {
        if (raw == null) {
            return null;
        }
        String description = raw.trim();
        if (description.isEmpty()) {
            return null;
        }
        if (description.length() > DESCRIPTION_MAX_LENGTH) {
            throw new WebAdminException(
                    KnowledgeErrorCode.DESCRIPTION_INVALID.message(), KnowledgeErrorCode.DESCRIPTION_INVALID);
        }
        return description;
    }

    private static boolean containsControlChar(String value) {
        return value.chars().anyMatch(Character::isISOControl);
    }
}
