package com.xgc.agent.framework.base.storage;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ObjectStoragePropertiesValidationTest {

    @Test
    void missingBucket_failsFast() {
        ObjectStorageProperties properties = valid();
        properties.getS3().setBucket(" ");
        assertThatThrownBy(() -> new S3ObjectStorage(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("bucket");
    }

    @Test
    void emptyKeys_stillConstructs() {
        ObjectStorageProperties properties = valid();
        properties.getS3().setAccessKey("");
        properties.getS3().setSecretKey("");
        assertThatCode(() -> new S3ObjectStorage(properties)).doesNotThrowAnyException();
    }

    @Test
    void illegalType_throws() {
        ObjectStorageProperties properties = valid();
        properties.setType("oss");
        assertThatThrownBy(() -> new S3ObjectStorage(properties))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void factory_ossType_notImplemented() {
        ObjectStorageProperties properties = valid();
        properties.setType("oss");
        ObjectStorageConfiguration configuration = new ObjectStorageConfiguration();
        assertThatThrownBy(() -> configuration.objectStorage(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("尚未实现");
    }

    @Test
    void missingS3Block_failsFast() {
        ObjectStorageProperties properties = valid();
        properties.setS3(null);
        assertThatThrownBy(() -> new S3ObjectStorage(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("object-storage.s3");
    }

    @Test
    void initClient_withKeys_doesNotThrowClassResolutionError() {
        ObjectStorageProperties properties = valid();
        properties.getS3().setAccessKey("ak");
        properties.getS3().setSecretKey("sk");
        S3ObjectStorage storage = new S3ObjectStorage(properties);
        assertThatCode(storage::initClient).doesNotThrowAnyException();
    }

    private static ObjectStorageProperties valid() {
        ObjectStorageProperties properties = new ObjectStorageProperties();
        properties.setType("s3");
        ObjectStorageProperties.S3 s3 = properties.getS3();
        s3.setEndpoint("http://127.0.0.1:9000");
        s3.setBucket("hello-agentr");
        s3.setRegion("us-east-1");
        s3.setAccessKey("");
        s3.setSecretKey("");
        s3.setPathStyle(true);
        return properties;
    }
}
