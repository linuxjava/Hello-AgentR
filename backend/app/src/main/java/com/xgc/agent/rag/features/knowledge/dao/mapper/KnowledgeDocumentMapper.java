package com.xgc.agent.rag.features.knowledge.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xgc.agent.rag.features.knowledge.dao.entity.KnowledgeDocumentDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * Document Mapper。
 *
 * <p>删除为物理删除（实体无 {@code @TableLogic}），以便 documentCount 与删库占用检查一致。</p>
 */
@Mapper
public interface KnowledgeDocumentMapper extends BaseMapper<KnowledgeDocumentDO> {
}
