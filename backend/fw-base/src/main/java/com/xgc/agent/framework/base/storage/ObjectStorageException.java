package com.xgc.agent.framework.base.storage;

import com.xgc.agent.framework.base.error.code.BaseErrorCode;
import com.xgc.agent.framework.base.error.exception.AbstractException;

/**
 * 对象存储不可用（缺密钥、put/delete 失败）。不携带业务域错误码，避免基建反向依赖 app。
 */
public class ObjectStorageException extends AbstractException {

    public ObjectStorageException() {
        this("对象存储不可用", null);
    }

    public ObjectStorageException(Throwable cause) {
        this("对象存储不可用", cause);
    }

    public ObjectStorageException(String message, Throwable cause) {
        super(message, cause, BaseErrorCode.REMOTE_ERROR);
    }
}
