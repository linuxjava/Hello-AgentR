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

package com.xgc.agent.framework.base.error.code;

/**
 * 基础错误码定义枚举
 *
 * <p>
 * 一级宏观错误码按来源分类，业务域错误码在各模块自行扩展二级码：
 * <ul>
 *   <li>S 类：系统执行错误（Server）</li>
 *   <li>T 类：第三方服务错误（Third）</li>
 *   <li>u 类：Web 用户端错误（Web User）</li>
 *   <li>A 类：Web 管理端错误（Web Admin）</li>
 *   <li>M 类：移动端错误（Mobile）</li>
 * </ul>
 * 通过组件包统一定义基础错误码，避免各服务重复定义相同内容。
 * </p>
 */
public enum BaseErrorCode implements IErrorCode {
    // ========== S(Server) 类错误：系统执行错误 ==========

    /**
     * 一级宏观错误码：系统执行出错
     */
    SERVICE_ERROR("S000001", "系统执行出错"),


    // ========== T(Third) 类错误：第三方服务错误 ==========

    /**
     * 一级宏观错误码：调用第三方服务出错
     */
    REMOTE_ERROR("T000001", "调用第三方服务出错"),


    // ========== U(Web User) 类错误：Web 用户端错误 ==========

    /**
     * 一级宏观错误码：Web 用户端错误
     */
    WEB_USER_ERROR("U000001", "用户端错误"),

    // ========== A(Web Admin) 类错误：Web 管理端错误 ==========

    /**
     * 一级宏观错误码：Web 管理端错误
     */
    WEB_ADMIN_ERROR("A000001", "管理后台错误"),

    // ========== M(Mobile) 类错误：移动端错误 ==========

    /**
     * 一级宏观错误码：移动端错误
     */
    MOBILE_ERROR("M000001", "移动端错误");

    /**
     * 错误码
     */
    private final String code;

    /**
     * 错误消息
     */
    private final String message;

    /**
     * 构造函数
     *
     * @param code    错误码
     * @param message 错误消息
     */
    BaseErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public String code() {
        return code;
    }

    @Override
    public String message() {
        return message;
    }
}
