# 管理端会话 Token 存 localStorage

Web 管理端（`frontend-admin`）将 Sa-Token 会话凭证写入 **localStorage**，并在启动时用 `/admin/auth/me` 校验；未采用 HttpOnly Cookie。前后端分离下 Header 传 token 实现简单，且与已交付的后端 API 约定一致；代价是 XSS 可窃取 token，需靠 CSP/依赖卫生与改密踢全端缓解。若日后改为同域 Cookie 会话，需同步调整后端签发与 CSRF 策略，属于有意取舍而非默认浏览器会话。
