package com.xgc.agent.framework.base.storage;

import java.io.InputStream;
import java.nio.file.Path;

/**
 * 部署级对象存储端口。业务只认 objectKey，不绑定厂商 SDK。
 *
 * <p>实现禁止依赖业务域错误码；失败抛 {@link ObjectStorageException}，由调用方映射。
 * 写入契约按流式内容源建模，禁止整文件 {@code byte[]} 进堆。</p>
 */
public interface ObjectStorage {

    /**
     * 从流写入对象。
     *
     * <p>{@code contentLength} MUST 准确（S3 简单 PUT 需要已知长度）。
     * 流由调用方关闭；实现在 {@code put} 返回前读完即可，不应假定可重读。</p>
     *
     * @param objectKey     存储键
     * @param content       内容流
     * @param contentLength 字节数，须 &gt;= 0 且与流可读长度一致
     * @param mediaType     规范化 MIME，可空则由实现忽略
     */
    void put(String objectKey, InputStream content, long contentLength, String mediaType);

    /**
     * 从本地文件写入对象（实现应走文件流式上传，避免整文件进堆）。
     *
     * @param objectKey 存储键
     * @param content   已落盘的源文件
     * @param mediaType 规范化 MIME，可空则由实现忽略
     */
    void put(String objectKey, Path content, String mediaType);

    /**
     * 删除对象。失败时 MUST 抛出，以便调用方决定是否整笔失败。
     *
     * @param objectKey 存储键
     */
    void delete(String objectKey);
}
