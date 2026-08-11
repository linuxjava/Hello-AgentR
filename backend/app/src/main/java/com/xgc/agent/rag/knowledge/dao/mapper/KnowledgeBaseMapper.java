package com.xgc.agent.rag.knowledge.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xgc.agent.rag.knowledge.dao.entity.KnowledgeBaseDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * KnowledgeBase Mapper。
 *
 * <p>删除为物理删除（实体无 {@code @TableLogic}），以便释放 Namespace 唯一约束。</p>
 */
@Mapper
public interface KnowledgeBaseMapper extends BaseMapper<KnowledgeBaseDO> {
}
