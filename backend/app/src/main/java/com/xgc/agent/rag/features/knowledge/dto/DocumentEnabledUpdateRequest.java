package com.xgc.agent.rag.features.knowledge.dto;

import jakarta.validation.constraints.NotNull;

/**
 * 启用/禁用 Document。与 DocumentStatus 解耦，任意已存在记录均可切换。
 */
public record DocumentEnabledUpdateRequest(
        @NotNull Boolean enabled
) {
}
