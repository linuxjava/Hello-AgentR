package com.xgc.agent.framework.base.storage;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 按 {@code type} 装配唯一活跃后端。OSS 适配器未交付前选 {@code oss} 直接失败，避免误绑到 S3 客户端。
 */
@Configuration
@EnableConfigurationProperties(ObjectStorageProperties.class)
public class ObjectStorageConfiguration {

    @Bean
    public ObjectStorage objectStorage(ObjectStorageProperties properties) {
        String type = properties == null ? null : properties.getType();
        if (type == null) {
            throw new IllegalStateException("hello-agentr.object-storage.type 必须为 s3");
        }
        return switch (type) {
            case "s3" -> new S3ObjectStorage(properties);
            case "oss" -> throw new IllegalStateException("hello-agentr.object-storage.type=oss 尚未实现");
            default -> throw new IllegalStateException("hello-agentr.object-storage.type 必须为 s3");
        };
    }
}
