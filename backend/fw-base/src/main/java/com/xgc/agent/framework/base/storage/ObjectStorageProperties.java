package com.xgc.agent.framework.base.storage;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 部署级 ObjectStorage 配置。同一时刻只有一个活跃后端（{@code type}）。
 *
 * <p>S3 与 OSS 参数有差异，分挂在 {@code s3} / {@code oss} 子块；只校验当前 {@code type} 对应的子块。
 * 本阶段活跃类型仅允许 {@code s3}；{@code oss} 子块可先写着，选中则启动失败。</p>
 */
@Data
@ConfigurationProperties(prefix = "hello-agentr.object-storage")
public class ObjectStorageProperties {

    /**
     * 活跃类型：本阶段 {@code s3}；{@code oss} 预留。
     */
    private String type;

    /**
     * S3 / MinIO 参数。{@code type=s3} 时必填结构字段。
     */
    private S3 s3 = new S3();

    /**
     * 阿里云 OSS 参数。本阶段不实现适配器，仅占位以免以后扁平混键。
     */
    private Oss oss = new Oss();

    /**
     * S3 兼容后端（含 MinIO）。
     */
    @Data
    public static class S3 {

        /**
         * 服务地址。
         */
        private String endpoint;

        /**
         * 桶名。
         */
        private String bucket;

        /**
         * 区域。
         */
        private String region;

        /**
         * Access key 占位，可空。
         */
        private String accessKey;

        /**
         * Secret key 占位，可空。
         */
        private String secretKey;

        /**
         * MinIO 等兼容端点需要 path-style；AWS 虚拟主机可关。
         */
        private boolean pathStyle = true;
    }

    /**
     * 阿里云 OSS。与 S3 分块，避免 region / internal-endpoint 混在一层。
     */
    @Data
    public static class Oss {

        /**
         * 公网 endpoint。
         */
        private String endpoint;

        /**
         * 桶名。
         */
        private String bucket;

        /**
         * AccessKeyId 占位，可空。
         */
        private String accessKey;

        /**
         * AccessKeySecret 占位，可空。
         */
        private String secretKey;

        /**
         * 内网 endpoint；S3 无此字段。
         */
        private String internalEndpoint;
    }
}
