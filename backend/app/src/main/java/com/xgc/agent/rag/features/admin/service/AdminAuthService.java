package com.xgc.agent.rag.features.admin.service;

import com.xgc.agent.rag.features.admin.dto.AdminChangeOwnPasswordRequest;
import com.xgc.agent.rag.features.admin.dto.AdminLoginRequest;
import com.xgc.agent.rag.features.admin.dto.AdminLoginResponse;
import com.xgc.agent.rag.features.admin.dto.AdminUserView;

/**
 * 管理端认证与会话用例接口。
 */
public interface AdminAuthService {

    /**
     * 用户名密码登录；失败统一返回「用户名或密码错误」。
     *
     * @param request 登录请求
     * @return token 与当前资料
     */
    AdminLoginResponse login(AdminLoginRequest request);

    /**
     * 登出当前 token；未登录时静默成功。
     */
    void logout();

    /**
     * 查询当前登录账号资料（不含密码）。
     *
     * @return 当前用户视图
     */
    AdminUserView me();

    /**
     * 修改自己的密码；成功后作废该账号全部 token。
     *
     * @param request 旧密码与新密码
     */
    void changeOwnPassword(AdminChangeOwnPasswordRequest request);
}
