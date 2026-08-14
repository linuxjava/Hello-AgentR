package com.xgc.agent.framework.base.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.net.URI;

/**
 * 首版活跃后端：S3 兼容存储。
 *
 * <p>密钥为空时仍允许进程启动，put/delete 再失败，避免本地没配桶时登录也起不来。
 * 客户端延迟到首次 put/delete 再建，避免启动期加载 AWS 类。
 * 首次使用时若不存在配置桶则自动创建（本地 MinIO 友好；账号需有建桶权限）。</p>
 */
@Slf4j
public class S3ObjectStorage implements ObjectStorage {

    private static final String ACTIVE_TYPE = "s3";

    private final ObjectStorageProperties properties;

    private S3Client client;

    /** 进程内只确保一次，避免每次 put 都 headBucket。 */
    private volatile boolean bucketReady;

    public S3ObjectStorage(ObjectStorageProperties properties) {
        this.properties = properties;
        validateStructure(properties);
    }

    @Override
    public void put(String objectKey, byte[] content, String mediaType) {
        S3Client s3 = requireClient();
        try {
            PutObjectRequest.Builder builder = PutObjectRequest.builder()
                    .bucket(s3Settings().getBucket())
                    .key(objectKey);
            if (StringUtils.hasText(mediaType)) {
                builder.contentType(mediaType);
            }
            s3.putObject(builder.build(), RequestBody.fromBytes(content));
        } catch (RuntimeException ex) {
            throw new ObjectStorageException(ex);
        }
    }

    @Override
    public void delete(String objectKey) {
        S3Client s3 = requireClient();
        try {
            s3.deleteObject(DeleteObjectRequest.builder()
                    .bucket(s3Settings().getBucket())
                    .key(objectKey)
                    .build());
        } catch (RuntimeException ex) {
            throw new ObjectStorageException(ex);
        }
    }

    private S3Client requireClient() {
        if (client == null) {
            initClient();
        }
        if (client == null) {
            throw new ObjectStorageException();
        }
        ensureBucketExists(client);
        return client;
    }

    /**
     * 有密钥才建客户端。启动路径不得调用，以免缺密钥时仍去加载 AWS SDK。
     */
    void initClient() {
        if (!hasCredentials()) {
            log.warn("ObjectStorage 密钥为空，上传/删除对象将失败（不阻断启动）");
            return;
        }
        ObjectStorageProperties.S3 s3 = s3Settings();
        this.client = S3Client.builder()
                .endpointOverride(URI.create(s3.getEndpoint().trim()))
                .region(Region.of(s3.getRegion().trim()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(s3.getAccessKey(), s3.getSecretKey())))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(s3.isPathStyle())
                        .build())
                .build();
    }

    /**
     * head 失败且确认为缺桶时 create；并发建桶冲突视为成功。
     * 不放在启动期：缺密钥/MinIO 未起时仍要能登录。
     */
    private void ensureBucketExists(S3Client s3) {
        if (bucketReady) {
            return;
        }
        synchronized (this) {
            if (bucketReady) {
                return;
            }
            String bucket = s3Settings().getBucket().trim();
            try {
                s3.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
            } catch (NoSuchBucketException missing) {
                createBucket(s3, bucket);
            } catch (S3Exception ex) {
                // 部分兼容端点用 404 而非 NoSuchBucketException
                if (ex.statusCode() == 404) {
                    createBucket(s3, bucket);
                } else {
                    throw new ObjectStorageException(ex);
                }
            } catch (RuntimeException ex) {
                throw new ObjectStorageException(ex);
            }
            bucketReady = true;
        }
    }

    private void createBucket(S3Client s3, String bucket) {
        try {
            log.info("ObjectStorage 桶不存在，自动创建 bucket={}", bucket);
            s3.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
        } catch (BucketAlreadyOwnedByYouException | BucketAlreadyExistsException race) {
            log.debug("ObjectStorage 建桶时桶已存在 bucket={}", bucket);
        } catch (RuntimeException ex) {
            throw new ObjectStorageException(ex);
        }
    }

    private boolean hasCredentials() {
        ObjectStorageProperties.S3 s3 = s3Settings();
        return StringUtils.hasText(s3.getAccessKey()) && StringUtils.hasText(s3.getSecretKey());
    }

    private ObjectStorageProperties.S3 s3Settings() {
        ObjectStorageProperties.S3 s3 = properties.getS3();
        if (s3 == null) {
            throw new IllegalStateException("hello-agentr.object-storage.s3 不能为空");
        }
        return s3;
    }

    static void validateStructure(ObjectStorageProperties properties) {
        if (properties == null || !ACTIVE_TYPE.equals(properties.getType())) {
            throw new IllegalStateException("hello-agentr.object-storage.type 必须为 s3");
        }
        ObjectStorageProperties.S3 s3 = properties.getS3();
        if (s3 == null) {
            throw new IllegalStateException("hello-agentr.object-storage.s3 不能为空");
        }
        if (!StringUtils.hasText(s3.getBucket())) {
            throw new IllegalStateException("hello-agentr.object-storage.s3.bucket 不能为空");
        }
        if (!StringUtils.hasText(s3.getRegion())) {
            throw new IllegalStateException("hello-agentr.object-storage.s3.region 不能为空");
        }
        if (!StringUtils.hasText(s3.getEndpoint())) {
            throw new IllegalStateException("hello-agentr.object-storage.s3.endpoint 不能为空");
        }
    }
}
