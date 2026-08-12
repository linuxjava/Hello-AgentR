package com.xgc.agent.rag.features.admin.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import com.xgc.agent.rag.features.admin.auth.StpAdminUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 管理端 Sa-Token 登录门禁。
 *
 * <p>对 {@code /admin/**} 统一校验 {@code loginType=admin} 会话；登录接口放行。
 * 业务层仅在需要当前用户实体或 Admin 角色时再调用 {@code AdminAccessService}。</p>
 */
@Configuration
public class AdminSaTokenConfig implements WebMvcConfigurer {

    /**
     * 注册管理端登录拦截器。
     *
     * <p>必须使用 {@link StpAdminUtil}，不可用默认 {@code StpUtil}，否则会落到错误的 loginType。</p>
     *
     * @param registry 拦截器注册表
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> StpAdminUtil.checkLogin()))
                .addPathPatterns("/admin/**")
                .excludePathPatterns("/admin/auth/login");
    }
}
