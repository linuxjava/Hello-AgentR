package com.xgc.agent.rag.features.knowledge.service.impl;

import com.xgc.agent.rag.features.knowledge.dto.EmbeddingModelCatalogItem;
import com.xgc.agent.rag.features.knowledge.properties.ModelCatalogProperties;
import com.xgc.agent.rag.features.knowledge.service.EmbeddingModelCatalog;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 配置驱动的 EmbeddingModel 目录。
 * 
 * <p>沿用原类名以最小化改动影响；实现已从写死模拟目录切换为 YAML 加载。</p>
 */
@Component
public class StaticEmbeddingModelCatalog implements EmbeddingModelCatalog {

    private static final Set<String> ALLOWED_PROVIDER_IDS = Set.of("alibailian", "siliconflow");

    private final List<EmbeddingModelCatalogItem> items;

    private final Set<String> idSet;
    private final String defaultId;

    public StaticEmbeddingModelCatalog(ModelCatalogProperties properties) {
        validateAndInit(properties);
        this.items = buildItems(properties);
        this.idSet = items.stream().map(EmbeddingModelCatalogItem::id).collect(java.util.stream.Collectors.toSet());
        this.defaultId = items.stream()
                .filter(EmbeddingModelCatalogItem::isDefault)
                .map(EmbeddingModelCatalogItem::id)
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<EmbeddingModelCatalogItem> listItems() {
        return items;
    }

    @Override
    public boolean contains(String id) {
        return id != null && idSet.contains(id);
    }

    @Override
    public String defaultId() {
        return defaultId;
    }

    private void validateAndInit(ModelCatalogProperties properties) {
        Map<String, ModelCatalogProperties.ProviderConfig> providers = properties.getModelProviders();
        if (providers == null || providers.isEmpty()) {
            throw new IllegalStateException("modelProviders 不能为空，且必须包含 alibailian/siliconflow 配置。");
        }
        for (Map.Entry<String, ModelCatalogProperties.ProviderConfig> entry : providers.entrySet()) {
            String providerId = entry.getKey();
            if (!ALLOWED_PROVIDER_IDS.contains(providerId)) {
                throw new IllegalStateException("modelProviders key 非法，仅允许: " + ALLOWED_PROVIDER_IDS);
            }
            ModelCatalogProperties.ProviderConfig provider = entry.getValue();
            if (provider == null || !StringUtils.hasText(provider.getBaseUrl())) {
                throw new IllegalStateException("modelProviders." + providerId + ".baseUrl 不能为空。");
            }
        }

        List<ModelCatalogProperties.EmbeddingModelConfig> modelConfigs = properties.getEmbeddingModels();
        if (modelConfigs == null || modelConfigs.isEmpty()) {
            // 按约定允许空目录启动；创建时会因为目录校验失败被拒绝。
            return;
        }
        Set<String> ids = new HashSet<>();
        Integer unifiedDimension = null;
        int defaultCount = 0;
        for (ModelCatalogProperties.EmbeddingModelConfig modelConfig : modelConfigs) {
            if (modelConfig == null) {
                throw new IllegalStateException("embeddingModels 存在空项。");
            }
            if (!StringUtils.hasText(modelConfig.getId())) {
                throw new IllegalStateException("embeddingModels.id 不能为空。");
            }
            if (!ids.add(modelConfig.getId())) {
                throw new IllegalStateException("embeddingModels.id 必须全局唯一，重复值: " + modelConfig.getId());
            }
            if (!StringUtils.hasText(modelConfig.getModel())) {
                throw new IllegalStateException("embeddingModels.model 不能为空，id=" + modelConfig.getId());
            }
            if (modelConfig.getDimension() == null || modelConfig.getDimension() <= 0) {
                throw new IllegalStateException("embeddingModels.dimension 必须为正整数，id=" + modelConfig.getId());
            }
            if (unifiedDimension == null) {
                unifiedDimension = modelConfig.getDimension();
            } else if (!unifiedDimension.equals(modelConfig.getDimension())) {
                throw new IllegalStateException("embeddingModels.dimension 必须全局一致，发现不一致 id=" + modelConfig.getId());
            }
            if (!StringUtils.hasText(modelConfig.getProviderId())) {
                throw new IllegalStateException("embeddingModels.providerId 不能为空，id=" + modelConfig.getId());
            }
            if (!providers.containsKey(modelConfig.getProviderId())) {
                throw new IllegalStateException(
                        "embeddingModels.providerId 未命中 modelProviders，id=" + modelConfig.getId());
            }
            if (modelConfig.getPriority() == null || modelConfig.getPriority() < 0) {
                throw new IllegalStateException("embeddingModels.priority 必须为非负整数，id=" + modelConfig.getId());
            }
            if (Boolean.TRUE.equals(modelConfig.getIsDefault())) {
                defaultCount++;
            }
        }
        if (defaultCount != 1) {
            throw new IllegalStateException("embeddingModels.isDefault=true 必须且仅能有一个。");
        }
    }

    private List<EmbeddingModelCatalogItem> buildItems(ModelCatalogProperties properties) {
        List<ModelCatalogProperties.EmbeddingModelConfig> modelConfigs = properties.getEmbeddingModels();
        if (modelConfigs == null || modelConfigs.isEmpty()) {
            return List.of();
        }
        return modelConfigs.stream()
                .map(model -> new EmbeddingModelCatalogItem(
                        model.getId(),
                        model.getModel(),
                        model.getDimension(),
                        model.getProviderId(),
                        model.getPriority(),
                        Boolean.TRUE.equals(model.getIsDefault())))
                .sorted(Comparator.comparingInt(EmbeddingModelCatalogItem::priority)
                        .thenComparing(EmbeddingModelCatalogItem::id))
                .toList();
    }
}
