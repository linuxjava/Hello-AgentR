package com.xgc.agent.rag.features.knowledge;

import com.xgc.agent.rag.features.knowledge.dto.EmbeddingModelCatalogItem;
import com.xgc.agent.rag.features.knowledge.properties.ModelCatalogProperties;
import com.xgc.agent.rag.features.knowledge.service.impl.StaticEmbeddingModelCatalog;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 配置驱动目录校验测试（无需 Spring 上下文）。
 */
class StaticEmbeddingModelCatalogTest {

    @Test
    void buildsSortedCatalogAndSupportsContains() {
        StaticEmbeddingModelCatalog catalog = new StaticEmbeddingModelCatalog(validProperties());

        assertThat(catalog.listItems())
                .extracting(EmbeddingModelCatalogItem::id)
                .containsExactly("bge-m3", "sf-bge-large-zh");
        assertThat(catalog.listItems())
                .extracting(EmbeddingModelCatalogItem::isDefault)
                .containsExactly(true, false);
        assertThat(catalog.contains("bge-m3")).isTrue();
        assertThat(catalog.contains("unknown-model")).isFalse();
    }

    @Test
    void rejectsWhenProviderReferenceIsMissing() {
        ModelCatalogProperties properties = validProperties();
        properties.getEmbeddingModels().get(0).setProviderId("missing");

        assertThatThrownBy(() -> new StaticEmbeddingModelCatalog(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("providerId");
    }

    @Test
    void rejectsWhenMultipleDefaults() {
        ModelCatalogProperties properties = validProperties();
        properties.getEmbeddingModels().get(1).setIsDefault(true);

        assertThatThrownBy(() -> new StaticEmbeddingModelCatalog(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("isDefault");
    }

    @Test
    void rejectsWhenDimensionNotUnified() {
        ModelCatalogProperties properties = validProperties();
        properties.getEmbeddingModels().get(1).setDimension(1536);

        assertThatThrownBy(() -> new StaticEmbeddingModelCatalog(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("dimension");
    }

    @Test
    void allowsEmptyEmbeddingModels() {
        ModelCatalogProperties properties = validProperties();
        properties.setEmbeddingModels(List.of());

        StaticEmbeddingModelCatalog catalog = new StaticEmbeddingModelCatalog(properties);
        assertThat(catalog.listItems()).isEmpty();
        assertThat(catalog.contains("bge-m3")).isFalse();
    }

    private ModelCatalogProperties validProperties() {
        ModelCatalogProperties properties = new ModelCatalogProperties();

        LinkedHashMap<String, ModelCatalogProperties.ProviderConfig> providers = new LinkedHashMap<>();
        ModelCatalogProperties.ProviderConfig ali = new ModelCatalogProperties.ProviderConfig();
        ali.setBaseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1");
        ali.setApiKey("${ALIBAILIAN_API_KEY}");
        providers.put("alibailian", ali);

        ModelCatalogProperties.ProviderConfig silicon = new ModelCatalogProperties.ProviderConfig();
        silicon.setBaseUrl("https://api.siliconflow.cn/v1");
        silicon.setApiKey("${SILICONFLOW_API_KEY}");
        providers.put("siliconflow", silicon);
        properties.setModelProviders(providers);

        ModelCatalogProperties.EmbeddingModelConfig first = new ModelCatalogProperties.EmbeddingModelConfig();
        first.setId("bge-m3");
        first.setModel("bge-m3");
        first.setDimension(1024);
        first.setProviderId("alibailian");
        first.setPriority(10);
        first.setIsDefault(true);

        ModelCatalogProperties.EmbeddingModelConfig second = new ModelCatalogProperties.EmbeddingModelConfig();
        second.setId("sf-bge-large-zh");
        second.setModel("BAAI/bge-large-zh-v1.5");
        second.setDimension(1024);
        second.setProviderId("siliconflow");
        second.setPriority(20);
        second.setIsDefault(false);

        properties.setEmbeddingModels(List.of(first, second));
        return properties;
    }
}
