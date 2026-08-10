package com.xgc.agent.rag.admin.controller;

import com.xgc.agent.framework.base.result.R;
import com.xgc.agent.rag.admin.dto.AdminChangeOwnPasswordRequest;
import com.xgc.agent.rag.admin.dto.AdminLoginRequest;
import com.xgc.agent.rag.admin.dto.AdminLoginResponse;
import com.xgc.agent.rag.admin.dto.AdminUserView;
import com.xgc.agent.rag.admin.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理端认证 HTTP 入口。
 *
 * <p>路径前缀 {@code /admin/auth}；完整 URL 需叠加应用 context-path。</p>
 */
@RestController
@RequestMapping("/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    /**
     * 认证用例服务。
     */
    private final AdminAuthService adminAuthService;

    /**
     * 登录：匿名可访问。
     *
     * @param request 用户名与密码
     * @return token 与资料
     */
    @PostMapping("/login")
    public R<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        return R.success(adminAuthService.login(request));
    }

    /**
     * 登出当前 token。
     *
     * @return 空成功响应
     */
    @PostMapping("/logout")
    public R<Void> logout() {
        adminAuthService.logout();
        return R.success();
    }

    /**
     * 查询当前登录 AdminUser 资料。
     *
     * @return 当前用户视图
     */
    @GetMapping("/me")
    public R<AdminUserView> me() {
        return R.success(adminAuthService.me());
    }

    /**
     * 修改自己的密码。
     *
     * @param request 旧密码与新密码
     * @return 空成功响应
     */
    @PutMapping("/password")
    public R<Void> changeOwnPassword(@Valid @RequestBody AdminChangeOwnPasswordRequest request) {
        adminAuthService.changeOwnPassword(request);
        return R.success();
    }
}
