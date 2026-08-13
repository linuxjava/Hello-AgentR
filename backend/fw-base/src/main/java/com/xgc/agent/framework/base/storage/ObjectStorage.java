package com.xgc.agent.framework.base.storage;

/**
 * 部署级对象存储端口。业务只认 objectKey，不绑定厂商 SDK。
 *
 * <p>实现禁止依赖业务域错误码；失败抛 {@link ObjectStorageException}，由调用方映射。</p>
 */
public interface ObjectStorage {

    /**
     * 写入对象。
     *
     * @param objectKey 存储键
     * @param content   文件字节
     * @param mediaType 规范化 MIME，可空则由实现忽略
     */
    void put(String objectKey, byte[] content, String mediaType);

    /**
     * 删除对象。失败时 MUST 抛出，以便调用方决定是否整笔失败。
     *
     * @param objectKey 存储键
     */
    void delete(String objectKey);
}
