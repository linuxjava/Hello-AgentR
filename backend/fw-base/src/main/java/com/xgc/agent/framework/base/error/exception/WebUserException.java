/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.xgc.agent.framework.base.error.exception;

import com.xgc.agent.framework.base.error.code.BaseErrorCode;
import com.xgc.agent.framework.base.error.code.IErrorCode;

/**
 * Web 用户端异常
 *
 * <p>Web 用户端请求因参数、鉴权或业务规则导致的客户端侧异常，默认归属 {@link BaseErrorCode#WEB_USER_ERROR}。</p>
 */
public class WebUserException extends AbstractException {

    public WebUserException(IErrorCode errorCode) {
        this(null, null, errorCode);
    }

    public WebUserException(String message) {
        this(message, null, BaseErrorCode.WEB_USER_ERROR);
    }

    public WebUserException(String message, IErrorCode errorCode) {
        this(message, null, errorCode);
    }

    public WebUserException(String message, Throwable throwable, IErrorCode errorCode) {
        super(message, throwable, errorCode);
    }

    @Override
    public String toString() {
        return "WebUserException{" +
                "code='" + errorCode + "'," +
                "message='" + errorMessage + "'" +
                '}';
    }
}
