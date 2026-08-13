package com.xgc.agent.rag.features.knowledge.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 模型目录配置。
 *
 * <p>配置来源：{@code hello-agentr.model-catalog}。本配置只描述 Embedding 能力，不含 Chat。</p>
 * <p>由启动类 {@code @EnableConfigurationProperties} 注册并绑定。</p>
 */
@Data
@ConfigurationProperties(prefix = "hello-agentr.model-catalog")
public class ModelCatalogProperties {

    /**
     * Provider 配置（key = providerId）。
     */
    private Map<String, ProviderConfig> modelProviders = new LinkedHashMap<>();

    /**
     * EmbeddingModel 目录。
     */
    private List<EmbeddingModelConfig> embeddingModels = new ArrayList<>();

    @Data
    public static class ProviderConfig {

        /**
         * 上游请求地址。
         */
        private String baseUrl;

        /**
         * 密钥占位（允许为空，不阻断启动）。
         */
        private String apiKey;
    }

    @Data
    public static class EmbeddingModelConfig {

        /**
         * 平台内稳定标识。
         */
        private String id;

        /**
         * 上游模型名。
         */
        private String model;

        /**
         * 向量维度。
         */
        private Integer dimension;

        /**
         * 所属 Provider（引用 modelProviders key）。
         */
        private String providerId;

        /**
         * 排序优先级，越小越靠前。
         */
        private Integer priority;

        /**
         * 是否默认模型（全局唯一 true）。
         */
        private Boolean isDefault;
    }
}
