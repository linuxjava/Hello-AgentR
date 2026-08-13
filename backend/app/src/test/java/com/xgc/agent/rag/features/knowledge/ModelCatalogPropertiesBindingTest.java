package com.xgc.agent.rag.features.knowledge;

import com.xgc.agent.rag.features.knowledge.properties.ModelCatalogProperties;
import com.xgc.agent.rag.features.knowledge.service.impl.StaticEmbeddingModelCatalog;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 验证 YAML isDefault 经 EnableConfigurationProperties 正确绑定，
 * 避免创建知识库时 defaultId 为空触发 A002007。
 */
class ModelCatalogPropertiesBindingTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(TestConfig.class)
            .withPropertyValues(
                    "hello-agentr.model-catalog.modelProviders.alibailian.baseUrl=https://example.com/v1",
                    "hello-agentr.model-catalog.modelProviders.alibailian.apiKey=",
                    "hello-agentr.model-catalog.modelProviders.siliconflow.baseUrl=https://api.siliconflow.cn/v1",
                    "hello-agentr.model-catalog.modelProviders.siliconflow.apiKey=",
                    "hello-agentr.model-catalog.embeddingModels[0].id=qwen3.7-text-embedding",
                    "hello-agentr.model-catalog.embeddingModels[0].model=qwen3.7-text-embedding",
                    "hello-agentr.model-catalog.embeddingModels[0].dimension=1536",
                    "hello-agentr.model-catalog.embeddingModels[0].providerId=alibailian",
                    "hello-agentr.model-catalog.embeddingModels[0].priority=10",
                    "hello-agentr.model-catalog.embeddingModels[0].isDefault=true",
                    "hello-agentr.model-catalog.embeddingModels[1].id=Qwen/Qwen3-Embedding-8B",
                    "hello-agentr.model-catalog.embeddingModels[1].model=Qwen/Qwen3-Embedding-8B",
                    "hello-agentr.model-catalog.embeddingModels[1].dimension=1536",
                    "hello-agentr.model-catalog.embeddingModels[1].providerId=siliconflow",
                    "hello-agentr.model-catalog.embeddingModels[1].priority=20",
                    "hello-agentr.model-catalog.embeddingModels[1].isDefault=false"
            );

    @Test
    void bindsIsDefaultAndResolvesDefaultId() {
        contextRunner.run(context -> {
            ModelCatalogProperties properties = context.getBean(ModelCatalogProperties.class);
            assertThat(properties.getEmbeddingModels()).hasSize(2);
            assertThat(properties.getEmbeddingModels().get(0).getIsDefault()).isEqualTo(true);
            assertThat(properties.getEmbeddingModels().get(1).getIsDefault()).isEqualTo(false);

            StaticEmbeddingModelCatalog catalog = new StaticEmbeddingModelCatalog(properties);
            assertThat(catalog.defaultId()).isEqualTo("qwen3.7-text-embedding");
        });
    }

    @EnableConfigurationProperties(ModelCatalogProperties.class)
    static class TestConfig {
    }
}
