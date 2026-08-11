package com.xgc.agent.rag.knowledge.dto;

import java.util.List;

/**
 * 知识库分页结果，形状对齐账号列表，降低管理端对接成本。
 *
 * @param page     当前页码
 * @param pageSize 每页条数
 * @param total    总记录数
 * @param records  当前页
 */
public record KnowledgeBasePageResponse(
        long page,
        long pageSize,
        long total,
        List<KnowledgeBaseView> records
) {
}
