package com.xgc.agent.rag.admin.dto;

import java.util.List;

/**
 * AdminUser 分页列表响应。
 *
 * @param page     当前页码
 * @param pageSize 每页条数
 * @param total    总记录数
 * @param records  当前页数据
 */
public record AdminUserPageResponse(
        /** 当前页码。 */
        long page,
        /** 每页条数。 */
        long pageSize,
        /** 总记录数。 */
        long total,
        /** 当前页记录。 */
        List<AdminUserView> records
) {
}
