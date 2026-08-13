package com.xgc.agent.rag.features.knowledge.chunk;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * 按种类校验 ChunkStrategyParams。单位是 Unicode 字符，无绝对值上限，只校验相对不等式。
 */
@Component
public class ChunkStrategyParamsValidator {

    public static final String OVERLAPPING = "OVERLAPPING";

    public static final String STRUCTURE_AWARE = "STRUCTURE_AWARE";

    private static final Set<String> OVERLAPPING_KEYS = Set.of("chunkSize", "overlap");

    private static final Set<String> STRUCTURE_KEYS =
            Set.of("defaultChunkSize", "maxChunkSize", "minChunkSize", "overlap");

    private final ObjectMapper objectMapper;

    public ChunkStrategyParamsValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * @param strategy 种类
     * @param rawJson  JSON 对象字符串或已是 Map 的序列化
     * @return 规范化后的参数 Map（仅含允许键）
     */
    public Map<String, Object> parseAndValidate(String strategy, String rawJson) {
        if (!OVERLAPPING.equals(strategy) && !STRUCTURE_AWARE.equals(strategy)) {
            throw new WebAdminException(KnowledgeErrorCode.CHUNK_STRATEGY_INVALID);
        }
        if (!StringUtils.hasText(rawJson)) {
            throw new WebAdminException(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
        }
        Map<String, Object> raw;
        try {
            raw = objectMapper.readValue(rawJson, new TypeReference<>() {
            });
        } catch (JsonProcessingException ex) {
            throw new WebAdminException(
                    KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID.message(),
                    ex,
                    KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
        }
        if (raw == null) {
            throw new WebAdminException(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
        }
        Set<String> allowed = OVERLAPPING.equals(strategy) ? OVERLAPPING_KEYS : STRUCTURE_KEYS;
        if (!raw.keySet().equals(allowed)) {
            throw new WebAdminException(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
        }
        Map<String, Object> normalized = new LinkedHashMap<>();
        for (String key : allowed) {
            normalized.put(key, requireInt(raw.get(key)));
        }
        if (OVERLAPPING.equals(strategy)) {
            int chunkSize = (Integer) normalized.get("chunkSize");
            int overlap = (Integer) normalized.get("overlap");
            if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
                throw new WebAdminException(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
            }
        } else {
            int defaultSize = (Integer) normalized.get("defaultChunkSize");
            int maxSize = (Integer) normalized.get("maxChunkSize");
            int minSize = (Integer) normalized.get("minChunkSize");
            int overlap = (Integer) normalized.get("overlap");
            if (defaultSize <= 0 || maxSize <= 0 || minSize <= 0) {
                throw new WebAdminException(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
            }
            if (minSize > defaultSize || defaultSize > maxSize) {
                throw new WebAdminException(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
            }
            if (overlap < 0 || overlap >= minSize) {
                throw new WebAdminException(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
            }
        }
        return normalized;
    }

    private static int requireInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        throw new WebAdminException(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID);
    }
}
